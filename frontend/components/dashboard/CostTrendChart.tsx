"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatBRL } from "@/lib/utils";
import type { CostEntry } from "@/types";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function label(d: Date) {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function buildCostTrend(items: CostEntry[]) {
  const today = startOfDay(new Date());
  const currentStart = addDays(today, -13);
  const previousStart = addDays(today, -27);

  const byDay = (from: Date) => {
    const map = new Map<string, number>();
    for (let i = 0; i < 14; i++) {
      const day = addDays(from, i);
      map.set(day.toISOString().slice(0, 10), 0);
    }
    for (const item of items) {
      const key = item.incurred_on.slice(0, 10);
      if (map.has(key)) map.set(key, (map.get(key) ?? 0) + Number(item.amount));
    }
    return map;
  };

  const current = byDay(currentStart);
  const previous = byDay(previousStart);
  const currentKeys = Array.from(current.keys());
  const previousKeys = Array.from(previous.keys());

  return currentKeys.map((key, i) => ({
    day: label(new Date(`${key}T00:00:00`)),
    atual: current.get(key) ?? 0,
    anterior: previous.get(previousKeys[i]) ?? 0,
  }));
}

export function periodTotals(items: CostEntry[]) {
  const today = startOfDay(new Date());
  const currentStart = addDays(today, -13);
  const previousStart = addDays(today, -27);
  let current = 0;
  let previous = 0;
  for (const item of items) {
    const day = startOfDay(new Date(`${item.incurred_on.slice(0, 10)}T00:00:00`));
    if (day >= currentStart && day <= today) current += Number(item.amount);
    else if (day >= previousStart && day < currentStart) previous += Number(item.amount);
  }
  return { current, previous };
}

function CustomTooltip({ active, payload, label: lbl }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md px-3 py-2 text-xs shadow-xl text-white">
      <p className="mb-1 font-mono font-bold text-white">{lbl}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 font-mono text-[11px]">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[#aaa]">{entry.name}:</span>
          <span className="font-semibold text-white">{formatBRL(Number(entry.value))}</span>
        </div>
      ))}
    </div>
  );
}

export function CostTrendChart({ items }: { items: CostEntry[] }) {
  const data = buildCostTrend(items);
  const hasData = data.some((d) => d.atual > 0 || d.anterior > 0);

  return (
    <section className="flex flex-col rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-lg shadow-sm text-white">
      <div className="mb-lg flex items-center justify-between">
        <div>
          <h2 className="font-display text-headline-md font-bold text-white">
            Custos ao longo do tempo
          </h2>
          <p className="font-mono text-label-caps uppercase text-[#888888]">Últimos 14 dias vs 14 dias anteriores</p>
        </div>
        <div className="hidden items-center gap-md font-mono text-label-caps uppercase text-[#888888] sm:flex">
          <span className="inline-flex items-center gap-xs">
            <span className="h-2.5 w-4 rounded-full bg-[hsl(217,91%,60%)]" /> Atual
          </span>
          <span className="inline-flex items-center gap-xs">
            <span className="h-0.5 w-4 border-t-2 border-dashed border-[#666]" /> Anterior
          </span>
        </div>
      </div>
      <div className="h-64">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradAtual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217,91%,60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(217,91%,60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradAnterior" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#888888" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#888888" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#888888", fontFamily: "var(--font-mono)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#888888", fontFamily: "var(--font-mono)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `R$${(Number(v) / 1000).toFixed(0)}k`}
                width={48}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="anterior"
                name="Período anterior"
                stroke="#888888"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                fill="url(#gradAnterior)"
              />
              <Area
                type="monotone"
                dataKey="atual"
                name="Período atual"
                stroke="hsl(217,91%,60%)"
                strokeWidth={2.5}
                dot={false}
                fill="url(#gradAtual)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-xs text-[#888888]">
            Sem custos no período para montar o gráfico.
          </div>
        )}
      </div>
    </section>
  );
}
