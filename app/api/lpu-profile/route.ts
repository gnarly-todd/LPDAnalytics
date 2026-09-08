import type { Belt, LockRecord } from "../../data";

const GITHUB_PAGES_ORIGIN = "https://gnarly-todd.github.io";
const LPU_USER_API = "https://explore.lpubelts.com/services/api/v1/users";
const LPU_FIRESTORE_DOCUMENTS =
  "https://firestore.googleapis.com/v1/projects/lpu-belt-explorer/databases/(default)/documents/lockcollections";
// This is the public web API key used by LPU's own profile page. It is only
// used as a fallback for one explicitly requested public profile document.
const LPU_PUBLIC_API_KEY = "AIzaSyDGGErdOp0lpzUumA60xJO7BlQr027y9Vo";
const LPU_DATA =
  "https://raw.githubusercontent.com/Lockpickers-United/lpu-belt-explorer/main/src/data/data.json";
const PROFILE_ID_PATTERN = /^[A-Za-z0-9_-]{20,128}$/;
const CALLBACK_PATTERN = /^__lpuProfile_[A-Za-z0-9_]{1,96}$/;
const BELTS = new Set<Belt>([
  "White",
  "Yellow",
  "Orange",
  "Green",
  "Blue",
  "Purple",
  "Brown",
  "Red",
  "Black",
  "Unranked",
]);

type LpuEntry = {
  id: string;
  belt: string;
  version?: string;
  lockingMechanisms?: string[];
  makeModels: { make?: string; model?: string }[];
};

type LpuUserResponse = {
  data?: {
    userId?: string;
    displayName?: string;
    collections?: {
      own?: unknown;
      wishlist?: unknown;
      picked?: unknown;
    };
  };
};

type FirestoreValue = {
  stringValue?: string;
  arrayValue?: { values?: FirestoreValue[] };
};

type FirestoreProfileDocument = {
  fields?: Record<string, FirestoreValue>;
};

type ProfileLoadResult =
  | { source: "api"; response: Response }
  | { source: "profile-document"; profile: LpuUserResponse };

let catalogPromise: Promise<LpuEntry[]> | undefined;

const delay = (milliseconds: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });

function firestoreStringArray(fields: Record<string, FirestoreValue>, field: string) {
  return (fields[field]?.arrayValue?.values ?? [])
    .map((value) => value.stringValue)
    .filter((value): value is string => typeof value === "string");
}

async function getPublicProfileDocument(profileId: string): Promise<LpuUserResponse> {
  const response = await fetch(
    `${LPU_FIRESTORE_DOCUMENTS}/${encodeURIComponent(profileId)}?key=${LPU_PUBLIC_API_KEY}`,
    { headers: { Accept: "application/json" }, cache: "no-store" },
  );
  if (!response.ok) throw new Error(`LPU public profile document request failed (${response.status}).`);

  const document = (await response.json()) as FirestoreProfileDocument;
  const fields = document.fields;
  if (!fields) throw new Error("LPU public profile document is missing fields.");

  return {
    data: {
      userId: profileId,
      displayName: fields.displayName?.stringValue,
      collections: {
        own: firestoreStringArray(fields, "own"),
        wishlist: firestoreStringArray(fields, "wishlist"),
        picked: firestoreStringArray(fields, "picked"),
      },
    },
  };
}

async function getPublicProfile(profileId: string): Promise<ProfileLoadResult> {
  // The approved LPU user API occasionally returns a short-lived 503 while it
  // is under load. Retry only transient failures; invalid and private profiles
  // must still receive their original response immediately.
  for (const wait of [0, 600, 1_400]) {
    if (wait) await delay(wait);
    const response = await fetch(`${LPU_USER_API}/${encodeURIComponent(profileId)}`, {
      headers: { Accept: "application/json", "User-Agent": "todd-lock-analytics-profile-loader" },
      cache: "no-store",
    });

    if (response.ok || ![429, 500, 502, 503, 504].includes(response.status)) {
      return { source: "api", response };
    }
  }

  // LPU permits direct reads of a known public profile. This fallback does not
  // enumerate users, issue collection queries, or request any profile other
  // than the one supplied by the visitor.
  return { source: "profile-document", profile: await getPublicProfileDocument(profileId) };
}

const corsHeaders = (origin: string | null) =>
  origin === GITHUB_PAGES_ORIGIN
    ? { "Access-Control-Allow-Origin": GITHUB_PAGES_ORIGIN, Vary: "Origin" }
    : {};

const json = (body: Record<string, unknown>, status: number, origin: string | null) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...corsHeaders(origin) },
  });

const javascript = (body: Record<string, unknown>, callback: string) => {
  const serialized = JSON.stringify(body).replaceAll("<", "\\u003c");
  return new Response(`${callback}(${serialized});`, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/javascript; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
};

async function getCatalog() {
  catalogPromise ??= fetch(LPU_DATA, {
    headers: { "User-Agent": "todd-lock-analytics-profile-loader" },
  }).then(async (response) => {
    if (!response.ok) throw new Error(`LPU catalog request failed (${response.status}).`);
    return (await response.json()) as LpuEntry[];
  });
  return catalogPromise;
}

function collectionStrings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function lockName(entry: LpuEntry) {
  return entry.makeModels
    .map(({ make, model }) => [make, model].filter(Boolean).join(" ").trim())
    .filter(Boolean)
    .join(" / ");
}

function normalizeBelt(sourceBelt: string): { belt: Belt; beltLevel?: LockRecord["beltLevel"] } {
  if (/^Black [1-5]$/.test(sourceBelt)) {
    return { belt: "Black", beltLevel: sourceBelt as LockRecord["beltLevel"] };
  }
  return { belt: BELTS.has(sourceBelt as Belt) ? (sourceBelt as Belt) : "Unranked" };
}

function resourceLinks(entry: LpuEntry): LockRecord["resourceLinks"] {
  return {
    lpu: `https://lpubelts.com/locks/${entry.id}.html`,
  };
}

function parseProfileUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }

  if (url.protocol !== "https:" || !["lpubelts.com", "www.lpubelts.com"].includes(url.hostname)) {
    return null;
  }

  const match = url.hash.match(/^#\/profile\/([A-Za-z0-9_-]+)(?:\?(.*))?$/);
  if (!match || !PROFILE_ID_PATTERN.test(match[1])) return null;

  const hashParams = new URLSearchParams(match[2] || "");
  return { id: match[1], suppliedName: hashParams.get("name")?.trim() || null };
}

function newYorkTimestamp() {
  const date = new Date();
  const day = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(date);
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone: "America/New_York",
  }).format(date);
  return `${day} · ${time}`;
}

export function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return new Response(null, {
    status: origin === GITHUB_PAGES_ORIGIN ? 204 : 403,
    headers: {
      ...corsHeaders(origin),
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Accept",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const requestUrl = new URL(request.url);
  const requestedCallback = requestUrl.searchParams.get("callback");
  if (requestedCallback && !CALLBACK_PATTERN.test(requestedCallback)) {
    return json({ message: "Invalid callback." }, 400, origin);
  }
  const reply = (body: Record<string, unknown>, status: number) =>
    requestedCallback ? javascript(body, requestedCallback) : json(body, status, origin);

  if (origin && origin !== GITHUB_PAGES_ORIGIN && origin !== requestUrl.origin) {
    return reply({ message: "Origin not allowed." }, 403);
  }

  const profileUrl = requestUrl.searchParams.get("url");
  const parsed = profileUrl ? parseProfileUrl(profileUrl) : null;
  if (!profileUrl || !parsed) {
    return reply(
      { message: "Enter a full LPU profile link, such as https://lpubelts.com/#/profile/…" },
      400,
    );
  }

  try {
    const [profileResult, catalog] = await Promise.all([getPublicProfile(parsed.id), getCatalog()]);

    if (profileResult.source === "api" && profileResult.response.status === 404) {
      return reply({ message: "That LPU profile does not exist or is not public." }, 404);
    }
    if (profileResult.source === "api" && !profileResult.response.ok)
      throw new Error(`LPU profile request failed (${profileResult.response.status}).`);

    const profile =
      profileResult.source === "api"
        ? ((await profileResult.response.json()) as LpuUserResponse)
        : profileResult.profile;
    if (profile.data?.userId !== parsed.id) {
      throw new Error("LPU profile response did not match the requested user.");
    }
    const collections = profile.data.collections;
    if (!Array.isArray(collections?.picked)) {
      throw new Error("LPU profile response is missing collections.picked.");
    }
    const ownedIds = collectionStrings(collections.own);
    const wishlistIds = collectionStrings(collections.wishlist);
    const ownedSet = new Set(ownedIds);
    const pickedIds = new Set(
      collectionStrings(collections.picked).filter((id) => ownedSet.has(id)),
    );
    const selectedIds = new Set([...ownedIds, ...wishlistIds]);
    const selectedEntries = catalog.filter((entry) => selectedIds.has(entry.id));

    if (selectedEntries.length !== selectedIds.size) {
      return reply(
        { message: "The profile references locks missing from the current LPU catalog." },
        409,
      );
    }

    const locks: LockRecord[] = selectedEntries.map((entry) => {
      const normalized = normalizeBelt(entry.belt);
      return {
        id: entry.id,
        name: lockName(entry),
        ...(entry.version ? { version: entry.version } : {}),
        mechanisms: entry.lockingMechanisms ?? [],
        ...normalized,
        status: ownedSet.has(entry.id) ? "Owned" : "Wishlist",
        picked: pickedIds.has(entry.id),
        resourceLinks: resourceLinks(entry),
      };
    });
    const storedName = profile.data.displayName?.trim();
    const displayName = storedName || parsed.suppliedName || "LPU profile";
    const canonicalUrl = `https://lpubelts.com/#/profile/${parsed.id}?name=${encodeURIComponent(displayName)}`;

    return reply(
      {
        profile: {
          id: parsed.id,
          name: displayName,
          url: canonicalUrl,
          locks,
          refreshedAt: newYorkTimestamp(),
        },
      },
      200,
    );
  } catch (error) {
    console.error("LPU profile loading failed", error);
    return reply(
      { message: "LPU's public profile service is temporarily unavailable. Please try again shortly." },
      502,
    );
  }
}
