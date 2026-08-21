"use client";

import {
  LineChart,
  Line,
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

export function CostTrendChart({ items }: { items: CostEntry[] }) {
  const data = buildCostTrend(items);
  const hasData = data.some((d) => d.atual > 0 || d.anterior > 0);

  return (
    <section className="flex flex-col rounded-xl border border-outline-variant bg-white p-md shadow-card">
      <div className="mb-md flex items-center justify-between">
        <div>
          <h2 className="font-display text-headline-md font-bold text-tertiary">Custos ao longo do tempo</h2>
          <p className="text-data-mono-sm text-secondary">Últimos 14 dias vs 14 dias anteriores</p>
        </div>
        <div className="hidden items-center gap-md text-data-mono-sm text-secondary sm:flex">
          <span className="inline-flex items-center gap-xs">
            <span className="h-2 w-4 rounded-full bg-brand" /> Atual
          </span>
          <span className="inline-flex items-center gap-xs">
            <span className="h-0.5 w-4 border-t border-dashed border-secondary" /> Anterior
          </span>
        </div>
      </div>
      <div className="h-64">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `R$ ${(Number(v) / 1000).toFixed(0)}k`}
                width={48}
              />
              <Tooltip
                formatter={(value) => formatBRL(Number(value))}
                contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }}
              />
              <Line type="monotone" dataKey="atual" name="Período atual" stroke="#F97316" strokeWidth={2.5} dot={false} />
              <Line
                type="monotone"
                dataKey="anterior"
                name="Período anterior"
                stroke="#9CA3AF"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-data-mono-sm text-secondary">
            Sem custos no período para montar o gráfico.
          </div>
        )}
      </div>
    </section>
  );
}
