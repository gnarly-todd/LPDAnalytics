// Network-free regression checks: node scripts/test-owner-loading.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const root = path.resolve(__dirname, "..");
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const profiles = Array.from({ length: 30 }, (_, n) => ({
  id: `public-profile-id-${String(n).padStart(3, "0")}`,
  name: `Owner ${n}`,
  url: `https://lpubelts.com/#/profile/public-profile-id-${String(n).padStart(3, "0")}`,
  ownedCount: 1000 - n,
}));
function storage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    clear: () => values.clear(),
  };
}
function environment(hooks) {
  const env = {
    window: { localStorage: storage(), sessionStorage: storage(), setTimeout, clearTimeout },
    calls: 0,
    directoryCalls: 0,
    active: 0,
    peak: 0,
    requests: [],
    exports: [],
    downloads: [],
  };
  env.fetch = async (url, options) => {
    if (!url.includes("/services/api/")) {
      env.directoryCalls++;
      return Response.json({
        data: profiles.map((p) => ({ id: p.id, displayName: p.name, own: p.ownedCount })),
        metadata: { updatedDateTime: "2026-10-16" },
      });
    }
    const id = url.split("/").at(-1);
    env.calls++;
    env.active++;
    env.peak = Math.max(env.peak, env.active);
    env.requests.push(id);
    try {
      await wait(3);
      options.signal?.throwIfAborted();
      return Response.json({
        data: {
          userId: id,
          displayName: `Owner ${id.slice(-3)}`,
          collections: { own: ["wanted-lock", id] },
        },
      });
    } finally {
      env.active--;
    }
  };
  class BrowserURL extends URL {
    static createObjectURL(blob) {
      env.exports.push(blob);
      return "blob:owner-export";
    }
    static revokeObjectURL() {}
  }
  const document = {
    body: { appendChild() {} },
    createElement() {
      return {
        click() {
          env.downloads.push({ href: this.href, name: this.download });
        },
        remove() {},
      };
    },
  };
  const cache = new Map();
  env.load = (name) => {
    const file = path.resolve(root, name);
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText;
    const localRequire = (id) => {
      if (id === "react" && hooks) return hooks;
      if (id === "./community-insights")
        return {
          useCommunityInsights: () => ({ data: { demand: {}, statsUpdatedAt: "2026-10-16" } }),
        };
      if (!id.startsWith(".")) return require(id);
      const base = path.resolve(path.dirname(file), id);
      const target = [base, `${base}.ts`, `${base}.tsx`].find((candidate) =>
        fs.existsSync(candidate),
      );
      return env.load(path.relative(root, target));
    };
    vm.runInNewContext(
      code,
      {
        module,
        exports: module.exports,
        require: localRequire,
        window: env.window,
        fetch: (...args) => env.fetch(...args),
        AbortSignal,
        AbortController,
        Response,
        Headers,
        URL: BrowserURL,
        document,
        Blob,
        setTimeout,
        clearTimeout,
        console,
      },
      { filename: file },
    );
    return module.exports;
  };
  env.resetBudget = () =>
    env.window.localStorage.setItem(
      "lpu-request-budget-v1",
      JSON.stringify({ retryAt: 0, attempts: [] }),
    );
  return env;
}
async function queueChecks() {
  const env = environment();
  const api = env.load("app/top-owner-profiles.ts");
  const updates = [];
  let result = await api.loadOwnerSnapshots([...profiles, profiles[0]], {
    onProgress: (value) => updates.push(value),
  });
  assert.equal(env.calls, 30);
  assert.equal(env.peak, 3);
  assert.equal(result.processed, 30);
  assert.equal(result.fresh, 30);
  assert.equal(result.snapshots.length, 30);
  assert(updates.some((value) => value.snapshots.length > 0 && value.snapshots.length < 30));
  assert.deepEqual(
    Array.from(result.snapshots, (p) => p.id),
    profiles.map((p) => p.id),
  );
  env.calls = 0;
  result = await api.loadOwnerSnapshots(profiles);
  assert.equal(env.calls, 0);
  assert.equal(result.cached, 30);
  assert.equal(result.processed, 30);
  for (const store of [env.window.localStorage, env.window.sessionStorage]) {
    const key = `lpu-top-owner-v1-${profiles[0].id}`;
    const expired = JSON.parse(store.getItem(key));
    expired.fetchedAt -= api.OWNER_CACHE_TTL + 1;
    store.setItem(key, JSON.stringify(expired));
  }
  env.resetBudget();
  result = await api.loadOwnerSnapshots(profiles);
  assert.equal(env.calls, 1);
  assert.equal(result.cached, 29);
  env.calls = 0;
  env.resetBudget();
  result = await api.loadOwnerSnapshots(profiles, { force: true });
  assert.equal(env.calls, 30);
  assert.equal(result.fresh, 30);
  assert.equal(result.cached, 0);
  const original = env.window.localStorage.getItem;
  env.window.localStorage.getItem = () => {
    throw Error("Blocked storage");
  };
  assert(api.readOwnerCache(profiles[0].id));
  env.window.localStorage.getItem = original;

  const limited = environment();
  limited.fetch = async () => {
    limited.calls++;
    return new Response("", { status: 429, headers: { "Retry-After": "1200" } });
  };
  const limitedApi = limited.load("app/top-owner-profiles.ts");
  const limitedResult = await limitedApi.loadOwnerSnapshots(profiles);
  assert(limitedResult.rateLimit);
  assert(limited.calls <= 3);
  assert(limitedResult.rateLimit.retryAt > Date.now() + 1190_000);
  const before = limited.calls;
  await limitedApi.loadOwnerSnapshots(profiles);
  assert.equal(limited.calls, before);

  const partial = environment();
  const partialApi = partial.load("app/top-owner-profiles.ts");
  partialApi.writeOwnerCache({
    id: profiles[0].id,
    name: "Saved owner",
    own: ["wanted-lock"],
    fetchedAt: Date.now(),
  });
  partial.fetch = async () => new Response("", { status: 404 });
  const partialResult = await partialApi.loadOwnerSnapshots(profiles, { force: true });
  assert.equal(partialResult.snapshots.length, 1);
  assert.equal(Object.keys(partialResult.errors).length, 30);
  const aborted = environment();
  const abortedApi = aborted.load("app/top-owner-profiles.ts");
  const controller = new AbortController();
  let abortedUpdates = 0;
  const promise = abortedApi.loadOwnerSnapshots(profiles, {
    signal: controller.signal,
    onProgress: () => abortedUpdates++,
  });
  controller.abort();
  const lastUpdates = abortedUpdates;
  await assert.rejects(promise, /abort/i);
  assert.equal(abortedUpdates, lastUpdates);
  assert(aborted.calls <= 3);
  console.log(
    "PASS: three-worker bound, incremental results, deduplication, seven-day cache, forced refresh, storage fallback, cooldown, partial errors, abort.",
  );
}
async function componentChecks() {
  const states = [],
    effects = [],
    refs = [];
  let cursor = 0;
  let pending = [];
  const hooks = {
    useState(initial) {
      const i = cursor++;
      if (!(i in states)) states[i] = typeof initial === "function" ? initial() : initial;
      return [
        states[i],
        (value) => {
          states[i] = typeof value === "function" ? value(states[i]) : value;
        },
      ];
    },
    useRef(initial) {
      const i = cursor++;
      return (refs[i] ??= { current: initial });
    },
    useMemo: (callback) => {
      cursor++;
      return callback();
    },
    useEffect(callback, deps) {
      const i = cursor++;
      const previous = effects[i];
      if (!previous || deps.some((value, n) => !Object.is(value, previous.deps[n])))
        pending.push(() => {
          previous?.cleanup?.();
          effects[i] = { deps, cleanup: callback() };
        });
    },
  };
  const env = environment(hooks);
  const Table = env.load("app/wishlist-owner-table.tsx").default;
  let activeProfile = {
    id: "selected-profile-id-000",
    name: "A very long profile name to wrap on a phone",
    url: "https://lpubelts.com",
    refreshedAt: "2026-10-16",
    locks: Array.from({ length: 230 }, (_, n) => ({
      id: n ? `lock-${n}` : "wanted-lock",
      name: `Lock ${String(n).padStart(3, "0")}`,
      version: "A long version description",
      status: "Wishlist",
      belt: "Blue",
      picked: false,
      mechanisms: [],
    })),
  };
  let profileLoading = false;
  const render = () => {
    cursor = 0;
    const tree = Table({ activeProfile, loading: profileLoading });
    const jobs = pending;
    pending = [];
    jobs.forEach((job) => job());
    return tree;
  };
  const nodes = (node) => {
    if (!node || typeof node !== "object") return [];
    return [node, ...React.Children.toArray(node.props?.children).flatMap(nodes)];
  };
  const text = (node) =>
    typeof node === "string" || typeof node === "number"
      ? String(node)
      : React.Children.toArray(node?.props?.children).map(text).join("");
  let tree = render();
  render();
  assert.equal(env.calls + env.directoryCalls, 0);
  let html = renderToStaticMarkup(tree);
  assert.equal((html.match(/class="wishlist-mobile-card"/g) ?? []).length, 30);
  assert(html.includes("Show 30 more locks"));
  const button = (label) =>
    nodes(tree).find((node) => node.type === "button" && text(node) === label);
  assert(button("Export all CSV").props.disabled);
  assert(!html.includes("wishlist-owner-warning"), "Routine instructions are not warnings");
  assert(html.includes("Not checked yet"), "Unloaded results must not imply zero owners");
  button("Load top 30").props.onClick();
  render();
  tree = render();
  assert(button("Stop loading"), "Loading can be stopped from the scan toolbar");
  assert(button("Loading profiles…").props.disabled);
  await wait(120);
  tree = render();
  assert.equal(env.calls, 30);
  assert.equal(env.directoryCalls, 1);
  html = renderToStaticMarkup(tree);
  assert(html.includes("Owner 029"), "All thirty matched owner names must be rendered");
  assert(!/Show \d+ more owners/.test(html), "Owner names must not be collapsed");
  assert(
    html.includes("Wishlist owner scan") && html.includes("Started") && html.includes("Finished"),
  );
  assert(html.includes("Cached results retain their original fetch times"));
  const calls = env.calls;
  button("Load top 30").props.onClick();
  tree = render();
  await wait(20);
  tree = render();
  assert.equal(env.calls, calls);
  const search = nodes(tree).find((node) => node.type === "input" && node.props.type === "search");
  search.props.onChange({ target: { value: "Lock 000" } });
  tree = render();
  html = renderToStaticMarkup(tree);
  assert.equal((html.match(/class="wishlist-mobile-card"/g) ?? []).length, 1);
  assert(html.includes("CSV exports all 230"));
  assert.equal(env.calls, calls);
  button("Export all CSV").props.onClick();
  const csv = await env.exports.at(-1).text();
  assert(
    csv.includes("Lock 229") && csv.includes("Owner 029"),
    "Export keeps all locks and owners despite filters",
  );
  assert.equal(csv.split("\r\n").length, 260);
  assert(env.downloads.at(-1).name.endsWith("-wishlist-owners.csv"));
  search.props.onChange({ target: { value: "nothing matches this search" } });
  tree = render();
  html = renderToStaticMarkup(tree);
  assert(html.includes("No locks match these filters"));
  button("Show all wishlist locks").props.onClick();
  tree = render();
  assert.equal(
    (renderToStaticMarkup(tree).match(/class="wishlist-mobile-card"/g) ?? []).length,
    30,
  );
  const matchSelect = nodes(tree).find(
    (node) => node.type === "select" && node.props.value === "all",
  );
  matchSelect.props.onChange({ target: { value: "matched" } });
  tree = render();
  assert.equal((renderToStaticMarkup(tree).match(/class="wishlist-mobile-card"/g) ?? []).length, 1);
  button("Clear filters").props.onClick();
  tree = render();
  const sortSelect = nodes(tree).find(
    (node) => node.type === "select" && node.props.value === "lock:asc",
  );
  sortSelect.props.onChange({ target: { value: "owners:desc" } });
  tree = render();
  assert.equal(env.calls, calls, "Filtering and sorting must not start scans");
  search.props.onChange({ target: { value: "" } });
  tree = render();
  button("Show 30 more locks").props.onClick();
  tree = render();
  html = renderToStaticMarkup(tree);
  assert.equal((html.match(/class="wishlist-mobile-card"/g) ?? []).length, 60);
  env.resetBudget();
  button("Fetch latest").props.onClick();
  tree = render();
  await wait(120);
  tree = render();
  assert.equal(env.calls, calls + 30);
  env.resetBudget();
  button("Fetch latest").props.onClick();
  render();
  tree = render();
  button("Stop loading").props.onClick();
  tree = render();
  await wait(20);
  tree = render();
  assert(!button("Load top 30").props.disabled, "Stop restores the load action");
  const originalFetch = env.fetch;
  env.fetch = async () => new Response("", { status: 503 });
  button("Fetch latest").props.onClick();
  render();
  await wait(20);
  tree = render();
  assert(button("Retry leaderboard"));
  assert(
    !button("Export all CSV").props.disabled,
    "Previously loaded results can still be exported after a refresh error",
  );
  assert(renderToStaticMarkup(tree).includes("Owner 029"));
  env.fetch = originalFetch;
  profileLoading = true;
  tree = render();
  html = renderToStaticMarkup(tree);
  assert(html.includes("Loading your wishlist…"));
  assert(
    !html.includes("wishlist-mobile-card"),
    "Previous profile results are hidden while loading",
  );
  profileLoading = false;
  activeProfile = { ...activeProfile, locks: [] };
  tree = render();
  html = renderToStaticMarkup(tree);
  assert(html.includes("No wishlist locks yet"));
  assert(button("Load top 30").props.disabled);
  console.log(
    "PASS: page opening makes no requests; manual cache-first/fetch-latest actions; 30-card pagination; clear/search/match/sort controls; full CSV export; stop/retry; cached export after refresh failure; loading/empty states.",
  );
}
(async () => {
  const time = environment().load("app/activity-status.tsx");
  assert.match(time.formatActivityTime("2026-10-16T09:23:10Z"), /5:23:10 AM EDT/);
  assert.match(time.formatActivityTime("2026-01-16T09:23:10Z"), /4:23:10 AM EST/);
  assert.match(time.formatActivityTime("2026-10-16"), /Oct 16, 2026 \(time not supplied\)/);
  assert.equal(time.formatActivityTime("Not supplied"), "Not supplied");
  const stamp = renderToStaticMarkup(
    React.createElement(time.DataTimestamp, { value: "2026-10-16T09:23:10Z" }),
  );
  assert(stamp.includes('dateTime="2026-10-16T09:23:10.000Z"'));
  console.log(
    "PASS: full timestamps, New York daylight-saving conversion, date-only sources do not invent times.",
  );
  await queueChecks();
  await componentChecks();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
