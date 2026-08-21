"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, TooltipProps } from "recharts";
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

// Paleta vibrante e consistente com o brand laranja
const COLORS = [
  "#F97316", // brand orange
  "#3B82F6", // blue
  "#10B981", // green
  "#8B5CF6", // purple
  "#F59E0B", // amber
  "#EF4444", // red
  "#6B7280", // gray
];

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
  if (!active || !payload || !payload.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-xl border border-outline-variant bg-white/95 px-3 py-2 shadow-float backdrop-blur-sm text-[12px]">
      <p className="font-semibold text-tertiary">{name}</p>
      <p className="text-secondary">{formatBRL(Number(value))}</p>
    </div>
  );
}

export function CostDonutChart({ items }: { items: CostBreakdownItem[] }) {
  const data = items.map((item) => ({
    name: CATEGORY_LABELS[item.category] || item.category,
    value: Number(item.total),
  }));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <section className="flex h-full flex-col rounded-2xl border border-outline-variant bg-white p-lg shadow-card">
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
                <Pie
                  data={data}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={84}
                  paddingAngle={3}
                  stroke="none"
                >
                  {data.map((entry, i) => (
                    <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Centro: total */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Total</span>
              <span className="font-mono text-base font-bold text-tertiary">{formatBRL(total)}</span>
            </div>
          </div>

          <ul className="mt-sm flex flex-col gap-1.5">
            {data.map((d, i) => (
              <li key={d.name} className="flex items-center justify-between text-body-sm group">
                <span className="inline-flex items-center gap-2 text-secondary group-hover:text-tertiary transition-colors">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  {d.name}
                </span>
                <span className="font-mono font-semibold text-tertiary">{formatBRL(d.value)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
