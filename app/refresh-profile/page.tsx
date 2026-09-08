import { redirect } from "next/navigation";
import { requireChatGPTUser } from "../chatgpt-auth";

export const dynamic = "force-dynamic";

const GITHUB_PAGES_URL = "https://gnarly-todd.github.io/LPUProfileData/";

type RefreshDestination = "site" | "github-pages";
type RefreshResult = "queued" | "error" | "forbidden";

function resultUrl(destination: RefreshDestination, result: RefreshResult) {
  const url = new URL(GITHUB_PAGES_URL);
  url.searchParams.set("refresh", result);
  url.searchParams.set("destination", destination);
  return url.toString();
}

async function RefreshRunner({ destination }: { destination: RefreshDestination }) {
  const returnTo = `/refresh-profile?destination=${destination}`;
  const user = await requireChatGPTUser(returnTo);
  const ownerEmail = process.env.REFRESH_OWNER_EMAIL?.trim().toLowerCase();

  if (!ownerEmail || user.email.trim().toLowerCase() !== ownerEmail) {
    redirect(resultUrl(destination, "forbidden"));
  }

  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY || "gnarly-todd/LPUProfileData";
  const workflow = process.env.GITHUB_WORKFLOW || "refresh-profile.yml";
  const ref = process.env.GITHUB_REF || "main";

  if (!token) redirect(resultUrl(destination, "error"));

  const response = await fetch(
    `https://api.github.com/repos/${repository}/actions/workflows/${workflow}/dispatches`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "todd-lock-analytics-refresh",
        "X-GitHub-Api-Version": "2026-03-10",
      },
      body: JSON.stringify({ ref, return_run_details: true }),
    },
  );

  if (!response.ok) {
    console.error("GitHub workflow dispatch failed", response.status);
    redirect(resultUrl(destination, "error"));
  }

  const dispatch = (await response.json()) as { workflow_run_id?: number };
  if (!Number.isSafeInteger(dispatch.workflow_run_id)) {
    console.error("GitHub workflow dispatch did not return a run ID");
    redirect(resultUrl(destination, "error"));
  }

  const queuedUrl = new URL(resultUrl(destination, "queued"));
  queuedUrl.searchParams.set("run_id", String(dispatch.workflow_run_id));
  redirect(queuedUrl.toString());
}

export default async function RefreshProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ destination?: string }>;
}) {
  const params = await searchParams;
  const destination: RefreshDestination =
    params.destination === "github-pages" ? "github-pages" : "site";

  return <RefreshRunner destination={destination} />;
}
