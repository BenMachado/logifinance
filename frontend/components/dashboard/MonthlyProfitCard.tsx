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
    <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md px-3 py-2 text-xs shadow-xl text-white">
      <p className="font-mono font-bold text-white mb-1">{data.month}</p>
      <div className="flex flex-col gap-0.5 font-mono text-[11px]">
        <div className="flex justify-between gap-3 text-[#aaa]">
          <span>Receita:</span>
          <span className="font-semibold text-white">{formatBRL(data.gross_revenue)}</span>
        </div>
        <div className="flex justify-between gap-3 text-[#aaa]">
          <span>Custos:</span>
          <span className="font-semibold text-white">{formatBRL(data.total_cost)}</span>
        </div>
        <div className="flex justify-between gap-3 border-t border-white/10 pt-1 mt-0.5">
          <span className="font-semibold text-white">Lucro:</span>
          <span className={cn("font-bold", isPositive ? "text-[hsl(217,91%,60%)]" : "text-error")}>
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
        "flex flex-col justify-between gap-sm rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-lg shadow-sm text-white",
        "transition-all duration-200 ease-bounce-subtle",
        "hover:border-[hsl(217,91%,60%)]/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:-translate-y-0.5",
        "animate-fade-slide-up"
      )}
    >
      {/* Top row: Title + Delta */}
      <div className="flex items-start justify-between gap-sm">
        <h3 className="text-body-sm font-semibold text-[#aaaaaa]">Lucros por mês</h3>
        {hasDelta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-mono text-[11px] font-bold uppercase",
              isPositiveDelta
                ? "bg-[hsl(217,91%,60%)]/15 text-[hsl(217,91%,60%)]"
                : "bg-error/15 text-error"
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
            "font-mono text-[1.75rem] font-bold tracking-tight leading-none text-white"
          )}
        >
          {formatBRL(Number(currentMonthVal))}
        </div>
      )}

      {/* Subtitle / Legend */}
      <p className="font-mono text-label-caps uppercase text-[#888888]">
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
                    fill={entry.net_profit >= 0 ? "hsl(217,91%,60%)" : "#ba1a1a"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-xs text-[#888888]">
            Sem histórico
          </div>
        )}
      </div>
    </div>
  );
}
