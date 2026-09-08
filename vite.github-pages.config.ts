import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/postcss";
import { defineConfig } from "vite";

const [repositoryOwner, repositoryName] =
  process.env.GITHUB_REPOSITORY?.split("/") ?? [];

function githubPagesBase() {
  const configuredBasePath = process.env.GITHUB_PAGES_BASE_PATH;

  if (configuredBasePath !== undefined) {
    return configuredBasePath ? `${configuredBasePath}/` : "/";
  }

  if (!repositoryName) return "/";

  const isUserSite =
    repositoryOwner &&
    repositoryName.toLowerCase() === `${repositoryOwner}.github.io`.toLowerCase();

  return isUserSite ? "/" : `/${repositoryName}/`;
}

export default defineConfig({
  base: githubPagesBase(),
  root: "github-pages",
  publicDir: "../public",
  css: { postcss: { plugins: [tailwindcss()] } },
  plugins: [react()],
  build: {
    outDir: "../dist-pages",
    emptyOutDir: true,
  },
});
