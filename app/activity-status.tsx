"use client";

import { useState } from "react";

export type ActivityTiming = { startedAt: number | null; finishedAt: number | null };

export function useActivityTimestamps() {
  const [timing, setTiming] = useState<ActivityTiming>({ startedAt: null, finishedAt: null });
  return {
    timing,
    start: () => setTiming({ startedAt: Date.now(), finishedAt: null }),
    finish: () =>
      setTiming((current) =>
        current.startedAt === null || current.finishedAt !== null
          ? current
          : { ...current, finishedAt: Date.now() },
      ),
  };
}

export function formatActivityTime(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "Not yet fetched";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T12:00:00Z`);
    return Number.isFinite(date.getTime())
      ? `${new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric" }).format(date)} (time not supplied)`
      : value;
  }
  const date = new Date(typeof value === "string" ? value.replace(/\s*·\s*/g, " ") : value);
  if (!Number.isFinite(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: typeof value === "number" || /\d{1,2}:\d{2}:\d{2}/.test(value) ? "2-digit" : undefined,
    timeZoneName: "short",
  }).format(date);
}

export function DataTimestamp({ value }: { value: string | number | null | undefined }) {
  const date =
    value === null || value === undefined || value === ""
      ? null
      : new Date(typeof value === "string" ? value.replace(/\s*·\s*/g, " ") : value);
  const machine =
    date && Number.isFinite(date.getTime())
      ? typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? value
        : date.toISOString()
      : undefined;
  return <time dateTime={machine}>{formatActivityTime(value)}</time>;
}

export function ActivityStatus({ label, timing }: { label: string; timing: ActivityTiming }) {
  if (timing.startedAt === null) return null;
  return (
    <p className="activity-stamps" role="status">
      <strong>{label}</strong>
      <span>
        Started <DataTimestamp value={timing.startedAt} />
      </span>
      {timing.finishedAt !== null && (
        <span>
          Finished <DataTimestamp value={timing.finishedAt} />
        </span>
      )}
    </p>
  );
}
