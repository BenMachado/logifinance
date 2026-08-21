"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatBRL } from "@/lib/utils";
import type { CostBreakdownItem } from "@/types";

const CATEGORY_LABELS: Record<string, string> = {
  fuel: "Combustível",
  toll: "Pedágio",
  maintenance: "Manutenção",
  food: "Diária",
  insurance: "Seguro",
  tax: "Imposto",
  other: "Outros",
};

const COLORS = ["#F97316", "#111827", "#6B7280", "#D1D5DB", "#FB923C", "#374151", "#9CA3AF"];

export function CostDonutChart({ items }: { items: CostBreakdownItem[] }) {
  const data = items.map((item) => ({
    name: CATEGORY_LABELS[item.category] || item.category,
    value: Number(item.total),
  }));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <section className="flex h-full flex-col rounded-xl border border-outline-variant bg-white p-md shadow-card">
      <h2 className="font-display text-headline-md font-bold text-tertiary">Custos por categoria</h2>
      <p className="mb-md text-data-mono-sm text-secondary">Distribuição do período</p>
      {data.length === 0 || total === 0 ? (
        <div className="flex flex-1 items-center justify-center text-data-mono-sm text-secondary">
          Nenhum custo categorizado ainda.
        </div>
      ) : (
        <>
          <div className="relative mx-auto h-48 w-full max-w-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" innerRadius={58} outerRadius={80} paddingAngle={2} stroke="none">
                  {data.map((entry, i) => (
                    <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatBRL(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-data-mono-sm text-secondary">Total</span>
              <span className="font-display text-sm font-bold text-tertiary">{formatBRL(total)}</span>
            </div>
          </div>
          <ul className="mt-sm flex flex-col gap-xs">
            {data.map((d, i) => (
              <li key={d.name} className="flex items-center justify-between text-body-sm">
                <span className="inline-flex items-center gap-xs text-secondary">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {d.name}
                </span>
                <span className="font-medium text-tertiary">{formatBRL(d.value)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
