const GITHUB_PAGES_ORIGIN = "https://gnarly-todd.github.io";

const json = (body: Record<string, unknown>, status: number, origin: string | null) =>
  Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...(origin === GITHUB_PAGES_ORIGIN
        ? { "Access-Control-Allow-Origin": GITHUB_PAGES_ORIGIN, Vary: "Origin" }
        : {}),
    },
  });

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== GITHUB_PAGES_ORIGIN && new URL(request.url).origin !== origin) {
    return json({ message: "Origin not allowed." }, 403, origin);
  }

  const runId = new URL(request.url).searchParams.get("run_id");
  if (!runId || !/^\d+$/.test(runId)) {
    return json({ message: "A valid workflow run ID is required." }, 400, origin);
  }

  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY || "gnarly-todd/LPUProfileData";
  if (!token) return json({ message: "Refresh status is not configured." }, 503, origin);

  const response = await fetch(`https://api.github.com/repos/${repository}/actions/runs/${runId}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "todd-lock-analytics-refresh",
      "X-GitHub-Api-Version": "2026-03-10",
    },
  });

  if (!response.ok) {
    console.error("GitHub workflow status request failed", response.status);
    return json({ message: "Unable to check refresh status." }, 502, origin);
  }

  const run = (await response.json()) as { status?: string; conclusion?: string | null };
  return json({ status: run.status, conclusion: run.conclusion ?? null }, 200, origin);
}
