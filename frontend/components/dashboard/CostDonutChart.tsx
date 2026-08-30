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

// Paleta consistente com o tema dark
const COLORS = [
  "hsl(217,91%,60%)", // brand-accent blue
  "hsl(226,71%,40%)", // primary blue
  "#ff8c00",          // orange
  "#10b981",          // emerald
  "#8b5cf6",          // purple
  "#f43f5e",          // rose
  "#64748b",          // slate
];

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
  if (!active || !payload || !payload.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md px-3 py-2 shadow-xl text-xs font-mono text-white">
      <p className="font-bold text-white">{name}</p>
      <p className="text-[#aaa]">{formatBRL(Number(value))}</p>
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
    <section className="flex h-full flex-col rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-lg shadow-sm text-white">
      <h2 className="font-display text-headline-md font-bold text-white">Custos por categoria</h2>
      <p className="mb-md font-mono text-label-caps uppercase text-[#888888]">Distribuição do período</p>
      {data.length === 0 || total === 0 ? (
        <div className="flex flex-1 items-center justify-center font-mono text-xs text-[#888888]">
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
              <span className="font-mono text-label-caps uppercase font-bold text-[#888888]">Total</span>
              <span className="font-mono text-base font-bold text-white">{formatBRL(total)}</span>
            </div>
          </div>

          <ul className="mt-sm flex flex-col gap-1.5">
            {data.map((d, i) => (
              <li key={d.name} className="flex items-center justify-between text-body-sm group">
                <span className="inline-flex items-center gap-2 text-[#aaa] group-hover:text-white transition-colors font-body">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  {d.name}
                </span>
                <span className="font-mono font-semibold text-white">{formatBRL(d.value)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
