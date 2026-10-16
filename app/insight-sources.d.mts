import type { InsightsData } from "./insights-model";
export const INSIGHT_SOURCES: Record<string, string>;
export function normalizeInsightSources(raw: Record<string, unknown>, now?: string): InsightsData;
export function fetchInsightSources(signal?: AbortSignal): Promise<InsightsData>;
