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
  "#ff8c00", // primary-container
  "#904d00", // primary
  "#897362", // outline
  "#564334", // on-surface-variant
  "#5e5e5e", // secondary
  "#ba1a1a", // error
  "#ffb77d", // inverse-primary
];

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
  if (!active || !payload || !payload.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-DEFAULT border border-outline-variant bg-surface-bright px-3 py-2 shadow-md text-xs font-mono">
      <p className="font-bold text-on-surface">{name}</p>
      <p className="text-on-surface-variant">{formatBRL(Number(value))}</p>
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
    <section className="flex h-full flex-col rounded-xl border border-outline-variant bg-surface-bright p-lg shadow-sm">
      <h2 className="font-display text-headline-md font-bold text-on-surface">Custos por categoria</h2>
      <p className="mb-md font-mono text-label-caps uppercase text-on-surface-variant">Distribuição do período</p>
      {data.length === 0 || total === 0 ? (
        <div className="flex flex-1 items-center justify-center font-mono text-xs text-on-surface-variant">
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
              <span className="font-mono text-label-caps uppercase font-bold text-on-surface-variant">Total</span>
              <span className="font-mono text-base font-bold text-on-surface">{formatBRL(total)}</span>
            </div>
          </div>

          <ul className="mt-sm flex flex-col gap-1.5">
            {data.map((d, i) => (
              <li key={d.name} className="flex items-center justify-between text-body-sm group">
                <span className="inline-flex items-center gap-2 text-on-surface-variant group-hover:text-on-surface transition-colors font-body">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  {d.name}
                </span>
                <span className="font-mono font-semibold text-on-surface">{formatBRL(d.value)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
