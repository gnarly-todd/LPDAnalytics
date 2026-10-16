"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LpuRateLimitError } from "./lpu-request";
import {
  fetchTopOwners,
  fetchOwnerSnapshot,
  readOwnerCache,
  readOwnerDirectory,
  snapshotProfile,
  TOP_OWNER_LIMIT,
  type TopOwnerDirectory,
} from "./top-owner-profiles";
import {
  matchWishlistOwners,
  wishlistOwnersCsv,
  sortWishlistRows,
  type WishlistSort,
  type WishlistProfile,
} from "./wishlist-owner-utils";

export default function WishlistOwnerTable({
  activeProfile,
  loading,
  paused = false,
}: {
  activeProfile: WishlistProfile;
  loading: boolean;
  paused?: boolean;
}) {
  const scanRequested = useRef(false);
  const [resumeAt, setResumeAt] = useState(0);
  const [pauseMessage, setPauseMessage] = useState("");
  const forceRefresh = useRef(false);
  const [directory, setDirectory] = useState<TopOwnerDirectory | null>(null);
  const [directoryError, setDirectoryError] = useState("");
  const [loaded, setLoaded] = useState<WishlistProfile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [processed, setProcessed] = useState(0);
  const [sort, setSort] = useState<WishlistSort>({ key: "lock", direction: "asc" });
  const members = useMemo(
    () => (directory?.profiles ?? []).filter((p) => p.id !== activeProfile.id),
    [directory, activeProfile.id],
  );

  useEffect(() => {
    if (!resumeAt) return;
    const timer = window.setTimeout(() => {
      setResumeAt(0);
      setPauseMessage("");
      setRefresh((value) => value + 1);
    }, Math.max(1000, resumeAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [resumeAt]);

  useEffect(() => {
    if (loading || paused || resumeAt > Date.now()) { setBusy(false); return; }
    if (!scanRequested.current) {
      // Opening the page and switching profiles only read local snapshots.
      // Network requests require an explicit press of Refresh top 30.
      const cached = readOwnerDirectory();
      if (cached) {
        setDirectory(cached);
        setLoaded(cached.profiles.filter((member) => member.id !== activeProfile.id).flatMap((member) => {
          const snapshot = readOwnerCache(member.id);
          return snapshot ? [snapshotProfile(snapshot)] : [];
        }));
      }
      setBusy(false);
      return;
    }
    scanRequested.current = false;
    const controller = new AbortController();
    const signal = controller.signal;
    const force = forceRefresh.current;
    forceRefresh.current = false;
    const nextErrors: Record<string, string> = {};
    setErrors({});
    setDirectoryError("");
    setProcessed(0);
    setBusy(true);
    async function run() {
      if (!activeProfile.locks.some((lock) => lock.status === "Wishlist")) {
        setBusy(false);
        return;
      }
      const top = await fetchTopOwners(signal);
      if (signal.aborted) return;
      setDirectory(top);
      const candidates = top.profiles.filter((p) => p.id !== activeProfile.id);
      let cursor = 0;
      let count = 0;
      const successes: WishlistProfile[] = candidates.flatMap((member) => {
        const cached = readOwnerCache(member.id);
        return cached ? [snapshotProfile(cached)] : [];
      });
      setLoaded([...successes]);
      // The user requested this bounded top-30 API lookup. Neither Firestore
      // nor any automatically discovered profile outside that set is queried.
      async function worker() {
        while (!signal.aborted && cursor < candidates.length) {
          const member = candidates[cursor++];
          const cached = !force && readOwnerCache(member.id);
          try {
            const snapshot =
              cached ||
              (await fetchOwnerSnapshot(member.id, signal));
            if (signal.aborted) return;
            try {
              window.localStorage.setItem(
                `lpu-top-owner-v1-${member.id}`,
                JSON.stringify(snapshot),
              );
            } catch {
              /* Ownership results remain usable when browser storage is full. */
            }
            const old = successes.findIndex((profile) => profile.id === snapshot.id);
            if (old >= 0) successes[old] = snapshotProfile(snapshot);
            else successes.push(snapshotProfile(snapshot));
          } catch (reason) {
            if (signal.aborted) return;
            if (reason instanceof LpuRateLimitError) {
              setResumeAt(reason.retryAt);
              setPauseMessage(reason.message);
              break;
            }
            nextErrors[member.id] =
              reason instanceof Error ? reason.message : "Profile could not be loaded.";
          }
          count++;
          if (!signal.aborted) {
            setLoaded([...successes]);
            setErrors({ ...nextErrors });
            setProcessed(count);
          }
          // A single paced worker leaves interactive profile requests responsive.
          if (!cached) await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
      await worker();
      if (!signal.aborted) setBusy(false);
    }
    void run().catch((reason) => {
      if (!signal.aborted) {
        setDirectoryError(
          reason instanceof Error ? reason.message : "The leaderboard could not be loaded.",
        );
        setBusy(false);
      }
    });
    return () => {
      controller.abort();
    };
  }, [activeProfile, loading, paused, refresh, resumeAt]);

  const validIds = new Set(members.map((p) => p.id));
  const owners = loaded.filter((p) => validIds.has(p.id));
  const rows = sortWishlistRows(matchWishlistOwners(activeProfile, owners), sort);
  const changeSort = (key: WishlistSort["key"]) => setSort((current) => ({
    key,
    direction: current.key === key ? (current.direction === "asc" ? "desc" : "asc") : key === "lock" ? "asc" : "desc",
  }));
  const failed = members.filter((p) => errors[p.id]);
  const refreshOwners = () => {
    scanRequested.current = true;
    forceRefresh.current = true;
    setRefresh((n) => n + 1);
  };
  const exportSpreadsheet = () => {
    if (loading || directoryError || !directory) return;
    const csv = wishlistOwnersCsv(
      activeProfile,
      owners,
      members.length,
      failed.map((p) => p.name),
      `Top ${TOP_OWNER_LIMIT} named public profiles by owned-lock count`,
      directory.updatedAt,
      sort,
    );
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${activeProfile.name.replace(/[^a-z0-9]+/gi, "-") || "profile"}-wishlist-owners.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  };

  return (
    <section
      className="section wishlist-owner-section"
      id="wishlist-owners"
      aria-labelledby="wishlist-owner-heading"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">Wishlist connections</span>
          <h2 id="wishlist-owner-heading">Who owns {activeProfile.name}’s wishlist locks?</h2>
          <p>
            Checks the top {TOP_OWNER_LIMIT} named public LPU profiles by owned-lock count when you refresh. No
            manual profile entry is required. Your own profile is excluded from owner matches.
          </p>
        </div>
        <div className="wishlist-owner-actions">
          <button
            className="secondary-button"
            onClick={refreshOwners}
            disabled={busy || loading || paused || resumeAt > Date.now() || !rows.length}
          >
            Refresh top {TOP_OWNER_LIMIT}
          </button>
          <button
            className="secondary-button"
            onClick={exportSpreadsheet}
            disabled={loading || !rows.length || !directory || !!directoryError}
          >
            Export spreadsheet (CSV)
          </button>
        </div>
      </div>
      {loading ? (
        <p role="status">Loading the selected profile’s wishlist…</p>
      ) : (
        <>
          <p className="wishlist-owner-meta" role="status">
            {rows.length} wishlist locks · {owners.length} of {members.length} ranked profiles
            loaded
            {busy
              ? directory
                ? ` · Checking ${processed}/${members.length}…`
                : " · Loading leaderboard…"
              : ""}
          </p>
          {(!busy || paused || pauseMessage) && (
            <p className="wishlist-owner-warning" role="status">
              {pauseMessage || (paused ? "Owner checks pause while you use profile controls." : `Showing saved ownership results. Select Refresh top ${TOP_OWNER_LIMIT} to check for updates. Opening this page does not start a scan.`)}
              {pauseMessage && ` Select Refresh top ${TOP_OWNER_LIMIT} after the cooldown to continue. Results and exports include only the profiles loaded so far.`}
            </p>
          )}
          {directoryError && (
            <div role="alert" className="wishlist-owner-warning">
              <p>{directoryError}</p>
              <button className="secondary-button" onClick={refreshOwners}>
                Retry leaderboard
              </button>
            </div>
          )}
          {!!failed.length && (
            <div role="alert" className="wishlist-owner-warning">
              <p>
                Some profiles could not be loaded. Counts and exports include only successful
                profiles.
              </p>
              <ul>
                {failed.map((p) => (
                  <li key={p.id}>
                    {p.name}: {errors[p.id]}
                  </li>
                ))}
              </ul>
              <button
                className="secondary-button"
                onClick={() => {
                  scanRequested.current = true;
                  setRefresh((n) => n + 1);
                }}
                disabled={busy}
              >
                Retry owner profiles
              </button>
            </div>
          )}
          {!rows.length ? (
            <p>This profile has no wishlist locks.</p>
          ) : (
            <div className="wishlist-owner-scroll">
              <table className="wishlist-owner-table">
                <thead>
                  <tr>
                    {([
                      { key: "lock", label: "Wishlist lock" },
                      { key: "rank", label: "Belt rank" },
                      { key: "owners", label: "Owners" },
                    ] as const).map(({ key, label }) => (
                      <th key={key} scope="col" aria-sort={sort.key === key ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}>
                        <button className="wishlist-sort-button" type="button" onClick={() => changeSort(key)} title={`Sort by ${label.toLowerCase()}`}>
                          {label}
                          <span aria-hidden="true">{sort.key === key ? (sort.direction === "asc" ? "↑" : "↓") : "↕"}</span>
                        </button>
                      </th>
                    ))}
                    <th scope="col">Top-{TOP_OWNER_LIMIT} profiles that own it</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ lock, owners: matched }) => (
                    <tr key={`${activeProfile.id}-${lock.id}`}>
                      <th scope="row">
                        <a
                          href={
                            lock.resourceLinks?.lpu || `https://lpubelts.com/locks/${lock.id}.html`
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          {lock.name}
                        </a>
                        {lock.version && <small>{lock.version}</small>}
                      </th>
                      <td>{lock.beltLevel ?? lock.belt}</td>
                      <td>
                        {matched.length}
                        {busy && "…"}
                      </td>
                      <td>
                        {!matched.length ? (
                          <span>
                            {directoryError
                              ? "Ownership data unavailable"
                              : busy
                                ? `Checking top-${TOP_OWNER_LIMIT} profiles…`
                                : "No matches among loaded profiles"}
                          </span>
                        ) : (
                          <>
                            <div className="wishlist-owner-links">
                              {matched.slice(0, 3).map((p) => (
                                <a
                                  key={p.id}
                                  href={p.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  title={`Profile refreshed ${p.refreshedAt}`}
                                >
                                  {p.name}
                                </a>
                              ))}
                            </div>
                            {matched.length > 3 && (
                              <details>
                                <summary>Show {matched.length - 3} more owners</summary>
                                <div className="wishlist-owner-links">
                                  {matched.slice(3).map((p) => (
                                    <a
                                      key={p.id}
                                      href={p.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      title={`Profile refreshed ${p.refreshedAt}`}
                                    >
                                      {p.name}
                                    </a>
                                  ))}
                                </div>
                              </details>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="wishlist-owner-meta">
            Coverage is limited to the top {directory?.profiles.length ?? TOP_OWNER_LIMIT} named public
            leaderboard profiles, not all LPU accounts.
            {directory && ` Leaderboard updated: ${directory.updatedAt}.`} Ownership is cached in
            this browser for up to 7 days; use Refresh top {TOP_OWNER_LIMIT} for fresh results. The CSV
            includes every wishlist lock, all loaded matches, coverage, and individual profile
            refresh times. Ownership does not imply willingness to sell or trade.
          </p>
        </>
      )}
    </section>
  );
}
