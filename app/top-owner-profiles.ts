import { parseProfileDirectory, PROFILE_DIRECTORY_URL } from "./profile-name-search";
import type { WishlistProfile } from "./wishlist-owner-utils";
import { fetchLpuUser } from "./lpu-request";

export const TOP_OWNER_LIMIT = 30;
export const OWNER_CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
export type TopOwner = { id: string; name: string; url: string; ownedCount: number };
export type TopOwnerDirectory = { profiles: TopOwner[]; updatedAt: string };
export type OwnerSnapshot = { id: string; name: string; own: string[]; fetchedAt: number };

export function selectTopOwners(value: unknown): TopOwnerDirectory {
  const named = parseProfileDirectory(value);
  const data = value as {
    data: { id: string; own?: unknown }[];
    metadata?: { updatedDateTime?: string };
  };
  const counts = new Map<string, number>();
  for (const item of data.data) {
    if (item && typeof item.own === "number" && Number.isFinite(item.own) && item.own >= 0)
      counts.set(item.id, Math.max(counts.get(item.id) ?? 0, item.own));
  }
  const profiles = named
    .filter((p) => counts.has(p.id))
    .map((p) => ({
      id: p.id,
      name: p.displayName,
      ownedCount: counts.get(p.id)!,
      url: `https://lpubelts.com/#/profile/${p.id}?name=${encodeURIComponent(p.displayName)}`,
    }))
    .sort((a, b) => b.ownedCount - a.ownedCount || a.id.localeCompare(b.id))
    .slice(0, TOP_OWNER_LIMIT);
  if (!profiles.length) throw new Error("The public leaderboard has no named ownership profiles.");
  return { profiles, updatedAt: data.metadata?.updatedDateTime ?? "Not supplied" };
}

export async function fetchTopOwners(signal?: AbortSignal): Promise<TopOwnerDirectory> {
  const response = await fetch(PROFILE_DIRECTORY_URL, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: signal
      ? AbortSignal.any([signal, AbortSignal.timeout(25_000)])
      : AbortSignal.timeout(25_000),
  });
  if (!response.ok)
    throw new Error(`The public leaderboard could not be loaded (${response.status}).`);
  const directory = selectTopOwners(await response.json());
  try { window.localStorage.setItem("lpu-owner-directory-v1", JSON.stringify(directory)); }
  catch { /* The manual scan still works without persistent storage. */ }
  return directory;
}

export function readOwnerDirectory(): TopOwnerDirectory | null {
  try {
    const value = JSON.parse(window.localStorage.getItem("lpu-owner-directory-v1") || "null");
    if (!value || !Array.isArray(value.profiles) || !value.profiles.length || typeof value.updatedAt !== "string") return null;
    if (!value.profiles.every((profile: TopOwner) =>
      typeof profile.id === "string" && /^[A-Za-z0-9_-]{20,128}$/.test(profile.id) &&
      typeof profile.name === "string" && typeof profile.url === "string" &&
      Number.isFinite(profile.ownedCount))) return null;
    return { profiles: value.profiles.slice(0, TOP_OWNER_LIMIT), updatedAt: value.updatedAt };
  } catch { return null; }
}

export function parseOwnerSnapshot(value: unknown, id: string, now = Date.now()): OwnerSnapshot {
  const body = value as {
    data?: { userId?: string; displayName?: string; collections?: { own?: unknown } };
  };
  const data = body?.data;
  if (data?.userId !== id) throw new Error("The LPU API returned a different profile.");
  const name = data.displayName?.trim();
  if (!name || /^(no display name|anonymous|unnamed|undefined|null)$/i.test(name))
    throw new Error("This profile does not publish a display name.");
  if (
    !Array.isArray(data.collections?.own) ||
    !data.collections.own.every((item) => typeof item === "string")
  )
    throw new Error("The LPU API did not return an owned-lock list.");
  return { id, name, own: [...new Set(data.collections.own)], fetchedAt: now };
}

export function snapshotProfile(snapshot: OwnerSnapshot): WishlistProfile {
  return {
    id: snapshot.id,
    name: snapshot.name,
    url: `https://lpubelts.com/#/profile/${snapshot.id}?name=${encodeURIComponent(snapshot.name)}`,
    refreshedAt: new Date(snapshot.fetchedAt).toISOString(),
    locks: snapshot.own.map((id) => ({
      id,
      name: id,
      status: "Owned",
      belt: "Unranked",
      picked: false,
      mechanisms: [],
    })),
  };
}

export function readOwnerCache(id: string): OwnerSnapshot | null {
  try {
    const data = JSON.parse(
      window.localStorage.getItem(`lpu-top-owner-v1-${id}`) ||
      window.sessionStorage.getItem(`lpu-top-owner-v1-${id}`) || "null",
    ) as OwnerSnapshot | null;
    const age = Date.now() - (data?.fetchedAt ?? 0);
    if (
      data?.id !== id ||
      !Number.isFinite(data.fetchedAt) ||
      age < 0 ||
      age >= OWNER_CACHE_TTL ||
      !Array.isArray(data.own) ||
      !data.own.every((item) => typeof item === "string") ||
      typeof data.name !== "string"
    )
      return null;
    return data;
  } catch {
    return null;
  }
}

export async function fetchOwnerSnapshot(id: string, signal?: AbortSignal): Promise<OwnerSnapshot> {
  // Only the approved public LPU user API is used. Never fall back to Firestore
  // or try another source after an access restriction.
  const response = await fetchLpuUser(id, signal, true);
  if (!response.ok) throw new Error(`LPU profile could not be loaded (${response.status}).`);
  return parseOwnerSnapshot(await response.json(), id);
}
