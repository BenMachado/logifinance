"use client";

import Link from "next/link";
import type { CostAlert } from "@/types";
import { formatPercent } from "@/lib/utils";

export function CostAlertCard({ alerts }: { alerts: CostAlert[] }) {
  if (alerts.length === 0) {
    return (
      <section className="flex flex-col gap-sm rounded-xl border border-outline-variant bg-white p-md shadow-card">
        <h2 className="flex items-center gap-sm font-display text-headline-md font-bold text-tertiary">
          <span className="material-symbols-outlined text-success">check_circle</span> Sem alertas
        </h2>
        <p className="text-data-mono-sm text-secondary">Nenhum alerta de margem. A operação está saudável.</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-sm rounded-xl border border-outline-variant bg-white p-md shadow-card">
      <h2 className="flex items-center gap-sm font-display text-headline-md font-bold text-tertiary">
        <span className="material-symbols-outlined text-error">warning</span> Alertas de custo
      </h2>
      <div className="flex flex-col gap-sm">
        {alerts.slice(0, 3).map((a) => (
          <div key={a.id} className="rounded-lg border border-outline-variant bg-surfaceContainer-low p-sm">
            <p className="text-body-md font-medium text-tertiary">{a.message}</p>
            <p className="mt-1 text-data-mono-sm text-secondary">
              Margem atual: <strong className="font-mono text-error">{formatPercent(a.actual_margin)}</strong>{" "}
              (esperado {formatPercent(a.expected_margin)})
            </p>
          </div>
        ))}
      </div>
      <Link href="/recibos" className="self-start text-sm font-bold text-brand hover:underline">
        Ver detalhes
      </Link>
    </section>
  );
}
