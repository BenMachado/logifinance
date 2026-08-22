"use client";

import Link from "next/link";
import type { CostAlert } from "@/types";
import { formatPercent } from "@/lib/utils";

export function CostAlertCard({ alerts }: { alerts: CostAlert[] }) {
  if (alerts.length === 0) {
    return (
      <section className="flex flex-col gap-sm rounded-xl border border-outline-variant bg-surface-bright p-lg shadow-sm">
        <h2 className="flex items-center gap-sm font-display text-headline-md font-bold text-on-surface">
          <span className="material-symbols-outlined fill text-primary">check_circle</span>
          Sem alertas
        </h2>
        <p className="font-mono text-label-caps uppercase text-on-surface-variant">
          Nenhum alerta de margem. A operação está saudável.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-sm rounded-xl border border-outline-variant bg-surface-bright p-lg shadow-sm">
      <h2 className="flex items-center gap-sm font-display text-headline-md font-bold text-on-surface">
        <span className="material-symbols-outlined fill text-error animate-pulse-ring">warning</span>
        Alertas de custo
      </h2>
      <div className="flex flex-col gap-sm">
        {alerts.slice(0, 3).map((a) => (
          <div
            key={a.id}
            className="rounded-DEFAULT border border-error/30 bg-error-container/20 p-sm border-l-4 border-l-error"
          >
            <p className="text-body-sm font-medium text-on-surface">{a.message}</p>
            <p className="mt-1 font-mono text-label-caps text-on-surface-variant">
              Margem atual:{" "}
              <strong className="font-mono font-bold text-error">{formatPercent(a.actual_margin)}</strong>{" "}
              (esperado {formatPercent(a.expected_margin)})
            </p>
          </div>
        ))}
      </div>
      <Link href="/recibos" className="self-start font-mono text-label-caps uppercase font-bold text-primary hover:text-primary-container transition-colors hover:underline">
        Ver detalhes →
      </Link>
    </section>
  );
}
