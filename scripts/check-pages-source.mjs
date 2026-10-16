import { appendFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export async function checkPagesSource({ repository, branch, sourceSha, token, fetcher = fetch }) {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository ?? ""))
    throw new Error("A GitHub owner/repository is required.");
  if (typeof branch !== "string" || !branch.trim())
    throw new Error("The default branch is required.");
  if (!/^[0-9a-f]{40}$/i.test(sourceSha ?? ""))
    throw new Error("The built artifact's source commit is required.");
  const response = await fetcher(
    `https://api.github.com/repos/${repository}/commits/${encodeURIComponent(branch)}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(30_000),
    },
  );
  if (!response.ok)
    throw new Error(
      `Cannot verify the latest default-branch commit (${response.status}). Deployment stopped.`,
    );
  const latest = await response.json();
  if (!/^[0-9a-f]{40}$/i.test(latest?.sha ?? ""))
    throw new Error("GitHub did not return a valid source commit. Deployment stopped.");
  return {
    current: latest.sha.toLowerCase() === sourceSha.toLowerCase(),
    sourceSha,
    latestSha: latest.sha,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await checkPagesSource({
      repository: process.env.GITHUB_REPOSITORY,
      branch: process.env.DEFAULT_BRANCH,
      sourceSha: process.env.BUILD_SHA,
      token: process.env.GITHUB_TOKEN,
    });
    if (!process.env.GITHUB_OUTPUT)
      throw new Error("GitHub Actions output is unavailable. Deployment stopped.");
    await appendFile(process.env.GITHUB_OUTPUT, `current=${result.current}\n`);
    console.log(
      result.current
        ? `Verified current Pages source ${result.sourceSha}.`
        : `Skipping outdated artifact ${result.sourceSha}; the default branch is now ${result.latestSha}.`,
    );
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "Source verification failed. Deployment stopped.",
    );
    process.exitCode = 1;
  }
}
