import { writeFile } from "node:fs/promises";
import { fetchInsightSources } from "../app/insight-sources.mjs";

const data = await fetchInsightSources();
await writeFile(
  new URL("../app/community-insights-data.json", import.meta.url),
  JSON.stringify(data) + "\n",
);
console.log(
  `Refreshed community insights: ${data.catalog.length} locks, ${data.voteCount} valid historical votes, ${data.totalProfiles} profiles.`,
);
