"use client";

import Link from "next/link";
import type { CostAlert } from "@/types";
import { formatPercent } from "@/lib/utils";

export function CostAlertCard({ alerts }: { alerts: CostAlert[] }) {
  if (alerts.length === 0) {
    return (
      <section className="flex flex-col gap-sm rounded-2xl border border-outline-variant bg-white p-lg shadow-card">
        <h2 className="flex items-center gap-sm font-display text-headline-md font-bold text-tertiary">
          <span className="material-symbols-outlined fill text-status-profit">check_circle</span>
          Sem alertas
        </h2>
        <p className="text-data-mono-sm text-secondary">
          Nenhum alerta de margem. A operação está saudável.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-sm rounded-2xl border border-outline-variant bg-white p-lg shadow-card">
      <h2 className="flex items-center gap-sm font-display text-headline-md font-bold text-tertiary">
        <span className="material-symbols-outlined fill text-status-alert animate-pulse-ring">warning</span>
        Alertas de custo
      </h2>
      <div className="flex flex-col gap-sm">
        {alerts.slice(0, 3).map((a) => (
          <div
            key={a.id}
            className="rounded-xl border border-status-alert/20 bg-status-alert/5 p-sm border-l-4 border-l-status-alert"
          >
            <p className="text-body-sm font-medium text-tertiary">{a.message}</p>
            <p className="mt-1 text-data-mono-sm text-secondary">
              Margem atual:{" "}
              <strong className="font-mono text-status-alert">{formatPercent(a.actual_margin)}</strong>{" "}
              (esperado {formatPercent(a.expected_margin)})
            </p>
          </div>
        ))}
      </div>
      <Link href="/recibos" className="self-start text-sm font-bold text-brand hover:text-brand-dim transition-colors hover:underline">
        Ver detalhes →
      </Link>
    </section>
  );
}
