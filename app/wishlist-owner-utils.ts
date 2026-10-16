import { beltOrder, type LockRecord } from "./data";

export type WishlistProfile = {
  id: string;
  name: string;
  url: string;
  locks: LockRecord[];
  refreshedAt: string;
};

export function matchWishlistOwners(active: WishlistProfile, candidates: WishlistProfile[]) {
  const profiles = [
    ...new Map(
      candidates
        .filter(
          (p) =>
            p.id !== active.id &&
            p.name.trim() &&
            !/^(no display name|anonymous|unnamed|undefined|null)$/i.test(p.name.trim()),
        )
        .map((p) => [p.id, p]),
    ).values(),
  ];
  const owned = new Map(
    profiles.map((p) => [
      p.id,
      new Set(p.locks.filter((l) => l.status === "Owned").map((l) => l.id)),
    ]),
  );
  return active.locks
    .filter((l) => l.status === "Wishlist")
    .map((lock) => ({
      lock,
      owners: profiles
        .filter((p) => owned.get(p.id)?.has(lock.id))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.lock.name.localeCompare(b.lock.name));
}

export function ownerCsvCell(value: string | number) {
  let text = String(value);
  if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export type WishlistSort = {
  key: "lock" | "rank" | "owners" | "demand";
  direction: "asc" | "desc";
};

export function sortWishlistRows(
  rows: ReturnType<typeof matchWishlistOwners>,
  sort: WishlistSort,
  demand: Record<string, number> = {},
) {
  const compareText = (a: string, b: string) =>
    a.localeCompare(b, "en", { numeric: true, sensitivity: "base" });
  const compareLocks = (a: LockRecord, b: LockRecord) =>
    compareText(a.name, b.name) ||
    compareText(a.version ?? "", b.version ?? "") ||
    a.id.localeCompare(b.id);
  const rank = (lock: LockRecord) =>
    lock.belt === "Unranked"
      ? -1
      : beltOrder.indexOf(lock.belt) +
        (lock.belt === "Black" ? Number(lock.beltLevel?.match(/[1-5]$/)?.[0] ?? 0) / 10 : 0);
  return [...rows].sort((a, b) => {
    const primary =
      sort.key === "lock"
        ? compareLocks(a.lock, b.lock)
        : sort.key === "rank"
          ? rank(a.lock) - rank(b.lock)
          : sort.key === "demand"
            ? (demand[a.lock.id] ?? 0) - (demand[b.lock.id] ?? 0)
            : a.owners.length - b.owners.length;
    return (sort.direction === "asc" ? primary : -primary) || compareLocks(a.lock, b.lock);
  });
}

export function wishlistOwnersCsv(
  active: WishlistProfile,
  loaded: WishlistProfile[],
  totalProfiles: number,
  failedNames: string[],
  searchScope = "Added profiles",
  leaderboardUpdatedAt = "",
  sort: WishlistSort = { key: "lock", direction: "asc" },
  demand?: { counts: Record<string, number>; updatedAt: string },
) {
  const rows: (string | number)[][] = [
    [
      "Wishlist profile",
      "Wishlist profile ID",
      "Lock",
      "Version",
      "Lock ID",
      "Belt",
      "Owner count",
      "Published wishlist count",
      "Owner name",
      "Owner profile ID",
      "Owner profile URL",
      "Owner refreshed at",
      "Wishlist refreshed at",
      "Profiles loaded",
      "Profiles searched (excluding active)",
      "Failed profiles",
      "Search scope",
      "Leaderboard updated at (source time)",
      "Wishlist demand source updated at",
    ],
  ];
  const loadedCount = new Set(loaded.filter((p) => p.id !== active.id).map((p) => p.id)).size;
  for (const { lock, owners } of sortWishlistRows(
    matchWishlistOwners(active, loaded),
    sort,
    demand?.counts,
  )) {
    const common = [
      active.name,
      active.id,
      lock.name,
      lock.version ?? "",
      lock.id,
      lock.beltLevel ?? lock.belt,
      owners.length,
      demand ? (demand.counts[lock.id] ?? 0) : "Not loaded",
    ];
    const coverage = [
      active.refreshedAt,
      loadedCount,
      totalProfiles,
      failedNames.join("; "),
      searchScope,
      leaderboardUpdatedAt,
      demand?.updatedAt ?? "Not loaded",
    ];
    if (!owners.length)
      rows.push([...common, "No matches among loaded profiles", "", "", "", ...coverage]);
    for (const p of owners) rows.push([...common, p.name, p.id, p.url, p.refreshedAt, ...coverage]);
  }
  return "\uFEFF" + rows.map((row) => row.map(ownerCsvCell).join(",")).join("\r\n");
}
