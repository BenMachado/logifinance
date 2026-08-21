"use client";

import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  badge?: { label: string; icon?: string; tone: "profit" | "alert" | "neutral" };
  breakdown?: string;
  valueClassName?: string;
  borderLeftAccent?: string;
  progressBar?: number;
  loading?: boolean;
  delta?: { percent: number; invert?: boolean };
}

export function KpiCard({
  title,
  value,
  badge,
  breakdown,
  valueClassName,
  borderLeftAccent,
  progressBar,
  loading,
  delta,
}: KpiCardProps) {
  const positive = delta ? (delta.invert ? delta.percent <= 0 : delta.percent >= 0) : undefined;

  return (
    <div
      className={cn("flex flex-col gap-sm rounded-xl border border-outline-variant bg-white p-md shadow-card", borderLeftAccent)}
    >
      <div className="flex items-start justify-between gap-sm">
        <h3 className="text-sm font-medium text-secondary">{title}</h3>
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-data-mono-sm font-bold",
              positive ? "bg-success-background text-success" : "bg-error-container text-onErrorContainer"
            )}
          >
            <span className="material-symbols-outlined text-[14px]">
              {positive ? "arrow_upward" : "arrow_downward"}
            </span>
            {Math.abs(delta.percent).toFixed(1)}%
          </span>
        )}
        {!delta && badge && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-data-mono-sm font-bold",
              badge.tone === "profit" && "bg-success-background text-success",
              badge.tone === "alert" && "bg-error-container text-onErrorContainer",
              badge.tone === "neutral" && "bg-surfaceContainer text-secondary"
            )}
          >
            {badge.icon && <span className="material-symbols-outlined text-[14px]">{badge.icon}</span>}
            {badge.label}
          </span>
        )}
      </div>
      {loading ? (
        <div className="my-1 h-9 w-3/4 animate-pulse rounded bg-surfaceContainer" />
      ) : (
        <div className={cn("font-display text-headline-lg font-bold tracking-tight text-tertiary", valueClassName)}>
          {value}
        </div>
      )}
      {(breakdown || delta) && (
        <p className="text-data-mono-sm text-secondary">{breakdown || "vs período anterior"}</p>
      )}
      {typeof progressBar === "number" && !loading && (
        <div className="mt-1 h-1.5 w-full rounded-full bg-surfaceContainer">
          <div
            className="h-1.5 rounded-full bg-brand"
            style={{ width: `${Math.min(100, Math.max(0, progressBar * 100))}%` }}
          />
        </div>
      )}
    </div>
  );
}
