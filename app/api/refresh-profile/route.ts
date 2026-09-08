const GITHUB_PAGES_ORIGIN = "https://gnarly-todd.github.io";
const GITHUB_PAGES_URL = "https://gnarly-todd.github.io/LPUProfileData/";

const corsHeaders = (origin: string | null) =>
  origin === GITHUB_PAGES_ORIGIN
    ? {
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": origin,
        Vary: "Origin",
      }
    : {};

const json = (body: Record<string, unknown>, status: number, origin: string | null = null) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...corsHeaders(origin) },
  });

const isSameOrigin = (request: Request) => {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) return true;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
};

const isAllowedOrigin = (request: Request) =>
  isSameOrigin(request) || request.headers.get("origin") === GITHUB_PAGES_ORIGIN;

export function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");

  if (!isAllowedOrigin(request)) {
    return new Response(null, { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(origin),
      "Access-Control-Allow-Headers": "Accept, Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");

  if (!isAllowedOrigin(request)) {
    return json({ message: "Cross-site refresh requests are not allowed." }, 403);
  }

  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY || "gnarly-todd/LPUProfileData";
  const workflow = process.env.GITHUB_WORKFLOW || "refresh-profile.yml";
  const ref = process.env.GITHUB_REF || "main";

  if (!token) {
    return json({ message: "The GitHub refresh token is not configured." }, 503, origin);
  }

  const githubHeaders = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "User-Agent": "todd-lock-analytics-refresh",
    "X-GitHub-Api-Version": "2026-03-10",
  };
  const recentResponse = await fetch(
    `https://api.github.com/repos/${repository}/actions/workflows/${workflow}/runs?per_page=1`,
    { headers: githubHeaders },
  );
  if (recentResponse.ok) {
    const recent = (await recentResponse.json()) as {
      workflow_runs?: { id: number; status: string; created_at: string }[];
    };
    const latest = recent.workflow_runs?.[0];
    const age = latest
      ? Date.now() - new Date(latest.created_at).getTime()
      : Number.POSITIVE_INFINITY;
    if (latest && (latest.status !== "completed" || age < 120_000)) {
      return json(
        { ok: true, runId: latest.id, message: "Using the profile refresh already in progress." },
        202,
        origin,
      );
    }
  }

  const githubResponse = await fetch(
    `https://api.github.com/repos/${repository}/actions/workflows/${workflow}/dispatches`,
    {
      method: "POST",
      headers: {
        ...githubHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref, return_run_details: true }),
    },
  );

  if (!githubResponse.ok) {
    console.error("GitHub workflow dispatch failed", githubResponse.status);
    return json(
      {
        message:
          githubResponse.status === 401 || githubResponse.status === 403
            ? "GitHub rejected the refresh token. Check its Actions permission and expiration."
            : "GitHub could not queue the refresh workflow. Try again shortly.",
      },
      502,
      origin,
    );
  }

  const dispatch = (await githubResponse.json().catch(() => null)) as {
    workflow_run_id?: number;
  } | null;
  if (!Number.isSafeInteger(dispatch?.workflow_run_id)) {
    return json(
      { message: "GitHub queued the refresh but did not return its run ID." },
      502,
      origin,
    );
  }

  return json(
    {
      ok: true,
      runId: dispatch?.workflow_run_id,
      message: "Profile refresh queued in GitHub Actions.",
    },
    202,
    origin,
  );
}

export async function GET(request: Request) {
  const referrer = request.headers.get("referer");
  const isGitHubPagesNavigation =
    new URL(request.url).searchParams.get("from") === "github-pages" &&
    referrer?.startsWith(`${GITHUB_PAGES_ORIGIN}/`);

  if (!isGitHubPagesNavigation) {
    return json({ message: "Open the refresh control from Todd's GitHub Pages site." }, 403);
  }

  const dispatchRequest = new Request(request.url, {
    method: "POST",
    headers: request.headers,
  });
  const response = await POST(dispatchRequest);

  if (!response.ok) return response;

  return Response.redirect(`${GITHUB_PAGES_URL}?refresh=queued`, 303);
}
