"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/utils";

interface CostBreakdownItem {
  category: string;
  total: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  fuel: "Combustível",
  toll: "Pedágio",
  maintenance: "Manutenção",
  food: "Diária",
  insurance: "Seguro",
  tax: "Imposto",
  other: "Outro",
};

const CATEGORY_ICON: Record<string, string> = {
  fuel: "local_gas_station",
  toll: "toll",
  maintenance: "build",
  food: "restaurant",
  insurance: "shield",
  tax: "receipt_long",
  other: "more_horiz",
};

export default function FluxoCaixaPage() {
  const breakdown = useQuery<CostBreakdownItem[]>({
    queryKey: ["costs", "breakdown"],
    queryFn: async () => (await api.get("/costs/breakdown")).data,
  });

  const totalCosts = breakdown.data?.reduce((sum, item) => sum + item.total, 0) ?? 0;

  return (
    <section className="flex flex-col gap-margin text-white">
      <div>
        <h1 className="font-display text-headline-lg font-bold text-white m-0">Fluxo de Caixa</h1>
        <p className="text-data-mono-sm text-[#888888]">Resumo de custos por categoria</p>
      </div>

      <div className="card-level-1 rounded-2xl p-md">
        <div className="flex items-center justify-between mb-md">
          <span className="text-body-lg font-bold text-white">Total de Custos</span>
          <span className="text-headline-md font-bold text-error">{formatBRL(totalCosts)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
        {breakdown.data?.map((item) => (
          <div key={item.category} className="card-level-1 rounded-2xl p-md flex items-center gap-md">
            <span className="material-symbols-outlined text-[hsl(217,91%,60%)] text-[32px]">
              {CATEGORY_ICON[item.category] || "more_horiz"}
            </span>
            <div className="flex-1">
              <div className="text-body-sm text-[#888888]">{CATEGORY_LABELS[item.category] || item.category}</div>
              <div className="text-headline-sm font-bold text-white">{formatBRL(item.total)}</div>
            </div>
            <Badge variant={item.total > totalCosts * 0.3 ? "alert" : "neutral"}>
              {totalCosts > 0 ? `${((item.total / totalCosts) * 100).toFixed(0)}%` : "0%"}
            </Badge>
          </div>
        ))}
        {breakdown.data?.length === 0 && (
          <div className="card-level-1 rounded-2xl p-md col-span-full text-center text-[#888888] font-body">
            Nenhum custo registrado ainda.
          </div>
        )}
      </div>
    </section>
  );
}
