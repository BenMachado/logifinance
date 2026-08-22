"use client";

import { useQuery } from "@tanstack/react-query";
import { ResponsiveContainer, BarChart, Bar, Cell, Tooltip } from "recharts";
import { api } from "@/lib/api";
import { formatBRL } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { MonthlyProfitResponse } from "@/types";

interface MonthlyProfitCardProps {
  currentProfit?: number;
  loading?: boolean;
}

function MonthlyProfitTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { month: string; gross_revenue: number; total_cost: number; net_profit: number; margin_pct: number } }>;
}) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const isPositive = data.net_profit >= 0;

  return (
    <div className="rounded-DEFAULT border border-outline-variant bg-surface-bright px-3 py-2 text-xs shadow-md">
      <p className="font-mono font-bold text-on-surface mb-1">{data.month}</p>
      <div className="flex flex-col gap-0.5 font-mono text-[11px]">
        <div className="flex justify-between gap-3 text-on-surface-variant">
          <span>Receita:</span>
          <span className="font-semibold text-on-surface">{formatBRL(data.gross_revenue)}</span>
        </div>
        <div className="flex justify-between gap-3 text-on-surface-variant">
          <span>Custos:</span>
          <span className="font-semibold text-on-surface">{formatBRL(data.total_cost)}</span>
        </div>
        <div className="flex justify-between gap-3 border-t border-outline-variant pt-1 mt-0.5">
          <span className="font-semibold text-on-surface">Lucro:</span>
          <span className={cn("font-bold", isPositive ? "text-primary" : "text-error")}>
            {formatBRL(data.net_profit)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function MonthlyProfitCard({ currentProfit, loading: parentLoading }: MonthlyProfitCardProps) {
  const { data, isLoading } = useQuery<MonthlyProfitResponse>({
    queryKey: ["dashboard", "monthly-profit"],
    queryFn: async () => (await api.get("/dashboard/monthly-profit")).data,
  });

  const loading = parentLoading || isLoading;
  const items = data?.items ?? [];
  const currentMonthVal = data?.current_month_profit ?? currentProfit ?? 0;
  const delta = data?.delta_percent;
  const hasDelta = typeof delta === "number" && !isNaN(delta);
  const isPositiveDelta = hasDelta ? delta >= 0 : undefined;

  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-sm rounded-xl border border-outline-variant bg-surface-bright p-lg shadow-sm",
        "transition-all duration-200 ease-bounce-subtle hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5",
        "animate-fade-slide-up"
      )}
    >
      {/* Top row: Title + Delta */}
      <div className="flex items-start justify-between gap-sm">
        <h3 className="text-body-sm font-semibold text-on-surface-variant">Lucros por mês</h3>
        {hasDelta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-mono text-[11px] font-bold uppercase",
              isPositiveDelta
                ? "bg-primary/10 text-primary"
                : "bg-error/10 text-error"
            )}
          >
            <span className="material-symbols-outlined text-[14px]">
              {isPositiveDelta ? "arrow_upward" : "arrow_downward"}
            </span>
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>

      {/* Main KPI Value */}
      {loading ? (
        <div className="my-1 h-9 w-3/4 skeleton" />
      ) : (
        <div
          className={cn(
            "font-mono text-[1.75rem] font-bold tracking-tight leading-none",
            Number(currentMonthVal) >= 0 ? "text-primary" : "text-error"
          )}
        >
          {formatBRL(Number(currentMonthVal))}
        </div>
      )}

      {/* Subtitle / Legend */}
      <p className="font-mono text-label-caps uppercase text-on-surface-variant">
        Últimos 12 meses
      </p>

      {/* Mini Bar Chart */}
      <div className="h-12 w-full mt-1">
        {loading ? (
          <div className="h-full w-full skeleton" />
        ) : items.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={items} margin={{ top: 2, right: 1, left: 1, bottom: 0 }}>
              <Tooltip content={<MonthlyProfitTooltip />} />
              <Bar dataKey="net_profit" radius={[2, 2, 0, 0]}>
                {items.map((entry, index) => (
                  <Cell
                    key={`bar-cell-${index}`}
                    fill={entry.net_profit >= 0 ? "#ff8c00" : "#ba1a1a"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-xs text-on-surface-variant">
            Sem histórico
          </div>
        )}
      </div>
    </div>
  );
}
