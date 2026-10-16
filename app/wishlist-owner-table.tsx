"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCommunityInsights } from "./community-insights";
import {
  ActivityStatus,
  DataTimestamp,
  formatActivityTime,
  useActivityTimestamps,
} from "./activity-status";
import {
  fetchTopOwners,
  loadOwnerSnapshots,
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
  const { data: insightData } = useCommunityInsights();
  const scanRequested = useRef(false);
  const [resumeAt, setResumeAt] = useState(0);
  const [pauseMessage, setPauseMessage] = useState("");
  const forceRefresh = useRef(false);
  const scanController = useRef<AbortController | null>(null);
  const [directory, setDirectory] = useState<TopOwnerDirectory | null>(null);
  const [directoryError, setDirectoryError] = useState("");
  const [loaded, setLoaded] = useState<WishlistProfile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const activity = useActivityTimestamps();
  const setScanBusy = (value: boolean) => {
    if (value) activity.start();
    else activity.finish();
    setBusy(value);
  };
  const [refresh, setRefresh] = useState(0);
  const [processed, setProcessed] = useState(0);
  const [cacheCount, setCacheCount] = useState(0);
  const [freshCount, setFreshCount] = useState(0);
  const [query, setQuery] = useState("");
  const [matchFilter, setMatchFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(30);
  const [sort, setSort] = useState<WishlistSort>({ key: "lock", direction: "asc" });
  const members = useMemo(
    () => (directory?.profiles ?? []).filter((p) => p.id !== activeProfile.id),
    [directory, activeProfile.id],
  );

  useEffect(() => {
    if (!resumeAt) return;
    const timer = window.setTimeout(
      () => {
        setResumeAt(0);
        setPauseMessage("");
        setRefresh((value) => value + 1);
      },
      Math.max(1000, resumeAt - Date.now()),
    );
    return () => window.clearTimeout(timer);
  }, [resumeAt]);

  useEffect(() => {
    if (loading || paused || resumeAt > Date.now()) {
      setScanBusy(false);
      return;
    }
    if (!scanRequested.current) {
      // Opening the page and switching profiles only read local snapshots.
      // Network requests require an explicit press of Load top 30 / Fetch latest.
      const cached = readOwnerDirectory();
      if (cached) {
        setDirectory(cached);
        setLoaded(
          cached.profiles
            .filter((member) => member.id !== activeProfile.id)
            .flatMap((member) => {
              const snapshot = readOwnerCache(member.id);
              return snapshot ? [snapshotProfile(snapshot)] : [];
            }),
        );
      }
      setScanBusy(false);
      return;
    }
    scanRequested.current = false;
    const controller = new AbortController();
    scanController.current = controller;
    const signal = controller.signal;
    const force = forceRefresh.current;
    forceRefresh.current = false;
    setErrors({});
    setDirectoryError("");
    setProcessed(0);
    setCacheCount(0);
    setFreshCount(0);
    setScanBusy(true);
    async function run() {
      if (!activeProfile.locks.some((lock) => lock.status === "Wishlist")) {
        setScanBusy(false);
        return;
      }
      const top = await fetchTopOwners(signal, force);
      if (signal.aborted) return;
      setDirectory(top);
      const candidates = top.profiles.filter((p) => p.id !== activeProfile.id);
      const resolved = new Map<string, { fetchedAt: number; profile: WishlistProfile }>();
      await loadOwnerSnapshots(candidates, {
        signal,
        force,
        onProgress: (progress) => {
          setLoaded(
            progress.snapshots.map((snapshot) => {
              const previous = resolved.get(snapshot.id);
              if (previous?.fetchedAt === snapshot.fetchedAt) return previous.profile;
              const profile = snapshotProfile(snapshot);
              resolved.set(snapshot.id, { fetchedAt: snapshot.fetchedAt, profile });
              return profile;
            }),
          );
          setErrors(progress.errors);
          setProcessed(progress.processed);
          setCacheCount(progress.cached);
          setFreshCount(progress.fresh);
          if (progress.rateLimit) {
            setResumeAt(progress.rateLimit.retryAt);
            setPauseMessage(progress.rateLimit.message);
          }
        },
      });
      if (!signal.aborted) setScanBusy(false);
    }
    void run().catch((reason) => {
      if (!signal.aborted) {
        setDirectoryError(
          reason instanceof Error ? reason.message : "The leaderboard could not be loaded.",
        );
        setScanBusy(false);
      }
    });
    return () => {
      controller.abort();
      activity.finish();
    };
  }, [activeProfile, loading, paused, refresh, resumeAt]);

  const owners = useMemo(() => {
    const validIds = new Set(members.map((p) => p.id));
    return loaded.filter((p) => validIds.has(p.id));
  }, [loaded, members]);
  const matches = useMemo(
    () => matchWishlistOwners(activeProfile, owners),
    [activeProfile, owners],
  );
  const rows = useMemo(
    () => sortWishlistRows(matches, sort, insightData.demand),
    [matches, sort, insightData.demand],
  );
  const fetchedTimes = owners.map((owner) => Date.parse(owner.refreshedAt)).filter(Number.isFinite);
  const oldestFetchedAt = fetchedTimes.length ? Math.min(...fetchedTimes) : null;
  const newestFetchedAt = fetchedTimes.length ? Math.max(...fetchedTimes) : null;
  const search = query.trim().toLocaleLowerCase();
  const filteredRows = rows.filter(({ lock, owners: matched }) => {
    if (matchFilter === "matched" && !matched.length) return false;
    if (matchFilter === "unmatched" && matched.length) return false;
    return (
      !search ||
      [lock.name, lock.version, lock.beltLevel ?? lock.belt, ...matched.map((owner) => owner.name)]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase()
        .includes(search)
    );
  });
  const visibleRows = filteredRows.slice(0, visibleCount);
  useEffect(() => {
    setVisibleCount(30);
    setQuery("");
    setMatchFilter("all");
  }, [activeProfile.id]);
  const changeSort = (key: WishlistSort["key"]) => {
    setVisibleCount(30);
    setSort((current) => ({
      key,
      direction:
        current.key === key
          ? current.direction === "asc"
            ? "desc"
            : "asc"
          : key === "lock"
            ? "asc"
            : "desc",
    }));
  };
  const failed = members.filter((p) => errors[p.id]);
  const refreshOwners = (force = false) => {
    scanRequested.current = true;
    forceRefresh.current = force;
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
      { counts: insightData.demand, updatedAt: insightData.statsUpdatedAt },
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
            Checks the top {TOP_OWNER_LIMIT} named public LPU profiles by owned-lock count when you
            load them. Saved profiles appear immediately; only missing or expired profiles need a
            request. Your own profile is excluded from owner matches.
          </p>
        </div>
        <div className="wishlist-owner-actions">
          <button
            className="secondary-button"
            onClick={() => refreshOwners()}
            disabled={busy || loading || paused || resumeAt > Date.now() || !rows.length}
          >
            Load top {TOP_OWNER_LIMIT}
          </button>
          <button
            className="secondary-button"
            onClick={() => refreshOwners(true)}
            disabled={busy || loading || paused || resumeAt > Date.now() || !rows.length}
            title="Request every ranked profile again, including profiles cached within seven days"
          >
            Fetch latest
          </button>
          {busy && (
            <button
              className="secondary-button"
              onClick={() => {
                scanController.current?.abort();
                setScanBusy(false);
              }}
            >
              Stop loading
            </button>
          )}
          <button
            className="secondary-button"
            onClick={exportSpreadsheet}
            disabled={loading || !rows.length || !directory || !!directoryError}
          >
            Export all CSV
          </button>
        </div>
      </div>
      <ActivityStatus label="Wishlist owner scan" timing={activity.timing} />
      {oldestFetchedAt !== null && (
        <p className="wishlist-owner-meta">
          Loaded owner data fetched <DataTimestamp value={oldestFetchedAt} />
          {newestFetchedAt !== oldestFetchedAt && (
            <>
              {" "}
              through <DataTimestamp value={newestFetchedAt} />
            </>
          )}
          . Cached results retain their original fetch times.
        </p>
      )}
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
          {busy && (
            <div className="wishlist-scan-progress">
              <progress
                aria-label="Ranked profiles checked"
                value={processed}
                max={Math.max(1, members.length)}
              />
              <span>
                {cacheCount} cached · {freshCount} fetched
              </span>
            </div>
          )}
          {(!busy || paused || pauseMessage) && (
            <p className="wishlist-owner-warning" role="status">
              {pauseMessage ||
                (paused
                  ? "Owner checks pause while you use profile controls."
                  : `Load top ${TOP_OWNER_LIMIT} reuses results saved for seven days. Fetch latest checks every profile again. Opening this page does not start a scan.`)}
              {pauseMessage &&
                ` Select Load top ${TOP_OWNER_LIMIT} after the cooldown to continue. Results and exports include only the profiles loaded so far.`}
            </p>
          )}
          {directoryError && (
            <div role="alert" className="wishlist-owner-warning">
              <p>{directoryError}</p>
              <button className="secondary-button" onClick={() => refreshOwners()}>
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
          {!!rows.length && (
            <div className="wishlist-results-controls">
              <label className="wishlist-search">
                Find a lock or owner
                <input
                  type="search"
                  value={query}
                  placeholder="Lock, version, belt or loaded owner"
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setVisibleCount(30);
                  }}
                />
              </label>
              <label>
                Matches
                <select
                  value={matchFilter}
                  onChange={(event) => {
                    setMatchFilter(event.target.value);
                    setVisibleCount(30);
                  }}
                >
                  <option value="all">All wishlist locks</option>
                  <option value="matched">With loaded matches</option>
                  <option value="unmatched">Without loaded matches</option>
                </select>
              </label>
              <label>
                Sort by
                <select
                  value={`${sort.key}:${sort.direction}`}
                  onChange={(event) => {
                    const [key, direction] = event.target.value.split(":") as [
                      WishlistSort["key"],
                      WishlistSort["direction"],
                    ];
                    setSort({ key, direction });
                    setVisibleCount(30);
                  }}
                >
                  <option value="lock:asc">Lock: A–Z</option>
                  <option value="lock:desc">Lock: Z–A</option>
                  <option value="rank:desc">Rank: highest first</option>
                  <option value="rank:asc">Rank: lowest first</option>
                  <option value="owners:desc">Loaded owners: most first</option>
                  <option value="owners:asc">Loaded owners: fewest first</option>
                  <option value="demand:desc">Wishlist demand: most first</option>
                  <option value="demand:asc">Wishlist demand: fewest first</option>
                </select>
              </label>
            </div>
          )}
          {!!rows.length && (
            <p className="wishlist-result-count" role="status">
              Showing {visibleRows.length} of {filteredRows.length} matching wishlist locks
              {query || matchFilter !== "all" ? ` (${rows.length} total)` : ""}. CSV exports all{" "}
              {rows.length}.
            </p>
          )}
          {!rows.length ? (
            <p>This profile has no wishlist locks.</p>
          ) : (
            <>
              {!filteredRows.length && <p>No locks match these filters.</p>}
              <ol className="wishlist-mobile-list" aria-label="Wishlist ownership results">
                {visibleRows.map(({ lock, owners: matched }) => (
                  <li key={lock.id}>
                    <article className="wishlist-mobile-card">
                      <div className="wishlist-mobile-heading">
                        <h3>
                          <a
                            href={
                              lock.resourceLinks?.lpu ||
                              `https://lpubelts.com/locks/${lock.id}.html`
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            {lock.name}
                          </a>
                        </h3>
                        <span className="wishlist-rank-label">{lock.beltLevel ?? lock.belt}</span>
                      </div>
                      {lock.version && <p className="wishlist-lock-version">{lock.version}</p>}
                      <dl className="wishlist-mobile-stats">
                        <div>
                          <dt>Loaded owners</dt>
                          <dd>
                            {matched.length}
                            {busy && "…"}
                          </dd>
                        </div>
                        <div>
                          <dt>Wishlist demand</dt>
                          <dd>{(insightData.demand[lock.id] ?? 0).toLocaleString("en-US")}</dd>
                        </div>
                      </dl>
                      <OwnerLinks
                        matched={matched}
                        emptyText={
                          directoryError
                            ? "Ownership data unavailable"
                            : busy
                              ? "Checking ranked profiles…"
                              : !owners.length
                                ? "Load profiles to check ownership"
                                : "No matches among loaded profiles"
                        }
                      />
                    </article>
                  </li>
                ))}
              </ol>
              <div
                className="wishlist-owner-scroll wishlist-desktop-results"
                tabIndex={0}
                role="region"
                aria-label="Wishlist ownership table"
              >
                <table className="wishlist-owner-table">
                  <thead>
                    <tr>
                      {(
                        [
                          { key: "lock", label: "Wishlist lock" },
                          { key: "rank", label: "Belt rank" },
                          { key: "owners", label: "Owners" },
                          { key: "demand", label: "Wishlist demand" },
                        ] as const
                      ).map(({ key, label }) => (
                        <th
                          key={key}
                          scope="col"
                          aria-sort={
                            sort.key === key
                              ? sort.direction === "asc"
                                ? "ascending"
                                : "descending"
                              : "none"
                          }
                        >
                          <button
                            className="wishlist-sort-button"
                            type="button"
                            onClick={() => changeSort(key)}
                            title={`Sort by ${label.toLowerCase()}`}
                          >
                            {label}
                            <span aria-hidden="true">
                              {sort.key === key ? (sort.direction === "asc" ? "↑" : "↓") : "↕"}
                            </span>
                          </button>
                        </th>
                      ))}
                      <th scope="col">Top-{TOP_OWNER_LIMIT} profiles that own it</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map(({ lock, owners: matched }) => (
                      <tr key={`${activeProfile.id}-${lock.id}`}>
                        <th scope="row">
                          <a
                            href={
                              lock.resourceLinks?.lpu ||
                              `https://lpubelts.com/locks/${lock.id}.html`
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
                        <td
                          title={`Published wishlist count; source updated ${insightData.statsUpdatedAt}`}
                        >
                          {(insightData.demand[lock.id] ?? 0).toLocaleString("en-US")}
                        </td>
                        <td>
                          <OwnerLinks
                            matched={matched}
                            emptyText={
                              directoryError
                                ? "Ownership data unavailable"
                                : busy
                                  ? "Checking ranked profiles…"
                                  : !owners.length
                                    ? "Load profiles to check ownership"
                                    : "No matches among loaded profiles"
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {visibleRows.length < filteredRows.length && (
                <button
                  className="secondary-button wishlist-show-more"
                  onClick={() => setVisibleCount((count) => count + 30)}
                >
                  Show {Math.min(30, filteredRows.length - visibleRows.length)} more locks
                </button>
              )}
            </>
          )}
          <p className="wishlist-owner-meta">
            Coverage is limited to the top {directory?.profiles.length ?? TOP_OWNER_LIMIT} named
            public leaderboard profiles, not all LPU accounts.
            {directory && ` Leaderboard updated: ${directory.updatedAt}.`} Ownership is cached in
            this browser for up to 7 days; use Fetch latest for fresh results. The CSV includes
            every wishlist lock, all loaded matches, coverage, and individual profile refresh times.
            Ownership does not imply willingness to sell or trade. Wishlist demand counts published
            wishlists containing that lock and comes from the community snapshot updated{" "}
            {insightData.statsUpdatedAt}. It does not start an owner scan.
          </p>
        </>
      )}
    </section>
  );
}

function OwnerLinks({ matched, emptyText }: { matched: WishlistProfile[]; emptyText: string }) {
  const links = (profiles: WishlistProfile[]) => (
    <div className="wishlist-owner-links">
      {profiles.map((profile) => (
        <a
          key={profile.id}
          href={profile.url}
          target="_blank"
          rel="noreferrer"
          title={`Profile fetched ${formatActivityTime(profile.refreshedAt)}`}
        >
          {profile.name}
        </a>
      ))}
    </div>
  );
  return matched.length ? links(matched) : <p className="wishlist-no-match">{emptyText}</p>;
}
