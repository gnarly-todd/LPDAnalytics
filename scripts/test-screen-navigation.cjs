// Network-free route/SSR regression checks: node scripts/test-screen-navigation.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const root = path.resolve(__dirname, "..");

function loader(react = React, extras = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    if (file.endsWith(".json")) {
      module.exports = JSON.parse(fs.readFileSync(file, "utf8"));
      return module.exports;
    }
    if (file.endsWith(".css")) return module.exports;
    const requireFile = (name) => {
      if (name === "react") return react;
      if (!name.startsWith(".")) return require(name);
      const base = path.resolve(path.dirname(file), name);
      const target = [base, `${base}.ts`, `${base}.tsx`].find((item) => fs.existsSync(item));
      assert(target, `Missing import ${name}`);
      return load(target);
    };
    const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText;
    vm.runInNewContext(
      code,
      {
        exports: module.exports,
        module,
        require: requireFile,
        URL,
        Blob,
        AbortController,
        AbortSignal,
        console,
        setTimeout,
        clearTimeout,
        fetch: () => {
          throw Error("Rendering must not fetch data");
        },
        ...extras,
      },
      { filename: file },
    );
    return module.exports;
  }
  return (name) => load(path.join(root, name));
}

let chosenScreen = "home";
let chosenRefreshState = "idle";
const renderReact = {
  ...React,
  useState: (initial) =>
    React.useState(
      initial === "home" ? chosenScreen : initial === "idle" ? chosenRefreshState : initial,
    ),
};
const load = loader(renderReact);
const navigation = load("app/screen-navigation.tsx");
for (const screen of navigation.screens) {
  assert.equal(navigation.screenFromHash(navigation.screenHref(screen.id)), screen.id);
  assert.equal(navigation.screenFromHash(`#${screen.id}`), screen.id);
}
assert.equal(navigation.screenFromHash("#top"), "home");
assert.equal(navigation.screenFromHash("#/invalid-route"), "home");
const Home = load("app/page.tsx").default;
const sectionIds = {
  overview: "overview",
  analysis: "analysis",
  community: "community",
  findings: "findings",
  "lpu-insights": "lpu-insights",
  explorer: "explorer",
  "wishlist-owners": "wishlist-owners",
};
for (const screen of navigation.screens) {
  chosenScreen = screen.id;
  const html = renderToStaticMarkup(React.createElement(Home));
  assert(html.includes(`data-screen="${screen.id}"`));
  assert(
    /<button[^>]*aria-busy="false"[^>]*>Refresh profile<\/button>/.test(html),
    `Persistent refresh action on ${screen.id}`,
  );
  assert.equal(
    (html.match(/id="screen-title"/g) ?? []).length,
    1,
    `One screen heading on ${screen.id}`,
  );
  for (const [name, id] of Object.entries(sectionIds))
    assert.equal(
      html.includes(`id="${id}"`),
      screen.id === name,
      `${name} must mount only on its own screen`,
    );
  if (screen.id === "home") {
    assert(html.includes("home-summary-counts"));
    assert(!html.includes("wishlist-mobile-card"));
    assert(!html.includes("snapshot-visual"));
  }
  if (screen.id === "compare") {
    assert(html.includes("Select two profiles"));
    assert(html.includes("Add another profile"));
  }
}
console.log(
  "PASS: all nine screens render independently; compact home; no hidden analytics/explorer/owner sections; old and new deep links; comparison picker; zero render-time network calls.",
);
chosenScreen = "home";
for (const phase of ["idle", "loading", "idle", "loading", "error", "idle"]) {
  chosenRefreshState = phase;
  const html = renderToStaticMarkup(React.createElement(Home));
  const button = html.match(
    /<button[^>]*aria-busy="(?:true|false)"[^>]*>(?:Refreshing…|Refresh profile)<\/button>/,
  )?.[0];
  assert(button, `Refresh action must remain visible in ${phase} state, including empty notices`);
  assert.equal(button.includes('disabled=""'), phase === "loading");
}
console.log(
  "PASS: refresh button remains visible and enabled after success/error; busy state disables it; repeat refresh cycles retain the action.",
);

const state = [],
  refs = [],
  effects = [];
let cursor = 0,
  pending = [];
const hooks = {
  useState(initial) {
    const i = cursor++;
    if (!(i in state)) state[i] = initial;
    return [
      state[i],
      (value) => (state[i] = typeof value === "function" ? value(state[i]) : value),
    ];
  },
  useRef(initial) {
    const i = cursor++;
    return (refs[i] ??= { current: initial });
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
const listeners = new Map();
let focusCount = 0,
  scrollCount = 0,
  pushes = 0;
const location = { pathname: "/LPDAnalytics/", search: "?keep=yes", hash: "#/explorer" };
const win = {
  location,
  scrollTo: () => scrollCount++,
  addEventListener: (name, fn) => listeners.set(name, fn),
  removeEventListener: (name) => listeners.delete(name),
  history: {
    pushState: (_state, _title, url) => {
      pushes++;
      assert(url.startsWith("/LPDAnalytics/?keep=yes#"));
      location.hash = url.slice(url.indexOf("#"));
    },
  },
};
const router = loader(hooks, {
  window: win,
  document: { getElementById: () => ({ focus: () => focusCount++ }) },
})("app/screen-navigation.tsx");
const render = () => {
  cursor = 0;
  const result = router.useScreenNavigation();
  const jobs = pending;
  pending = [];
  jobs.forEach((job) => job());
  return result;
};
render();
let route = render();
assert.equal(route.screen, "explorer");
route.navigate("analysis");
route = render();
assert.equal(route.screen, "analysis");
assert.equal(location.hash, "#/analysis");
assert.equal(pushes, 1);
location.hash = "#/explorer";
listeners.get("popstate")();
route = render();
assert.equal(route.screen, "explorer");
location.hash = "#/wishlist-owners";
listeners.get("hashchange")();
route = render();
assert.equal(route.screen, "wishlist-owners");
route.navigate("wishlist-owners");
render();
assert.equal(pushes, 1);
assert(focusCount >= 3 && scrollCount >= 3);
console.log(
  "PASS: route initialization, navigation, Back/Forward/hash changes, preserved repository path/query, focus/scroll reset, no duplicate history entry.",
);
