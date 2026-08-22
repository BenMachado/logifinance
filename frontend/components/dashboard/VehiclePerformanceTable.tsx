"use client";

import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { VehiclePerformanceRow as Row } from "@/types";

function plateInitials(plate: string) {
  return plate.replace(/[^A-Z0-9]/gi, "").slice(0, 2).toUpperCase() || "VE";
}

const AVATAR_BY_STATUS: Record<string, string> = {
  profit: "bg-primary/15 text-primary",
  alert: "bg-error/15 text-error",
  neutral: "bg-surface-container text-on-surface-variant",
};

const MARGIN_COLOR = (pct: number) =>
  pct >= 0.1 ? "text-primary font-semibold" : pct < 0 ? "text-error font-semibold" : "text-on-surface-variant";

export function VehiclePerformanceTable({ rows }: { rows: Row[] }) {
  if (rows.length === 0) {
    return (
      <div className="p-lg text-center font-mono text-label-caps uppercase text-on-surface-variant">
        Nenhuma rota concluída este mês. Conclua viagens para ver o desempenho.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <Table>
        <THead>
          <tr>
            <TH>Veículo</TH>
            <TH>Rota</TH>
            <TH className="text-right">Frete</TH>
            <TH className="text-right">Custos</TH>
            <TH className="text-right">Margem</TH>
            <TH className="text-center">Status</TH>
          </tr>
        </THead>
        <TBody>
          {rows.map((r, i) => (
            <TR key={r.vehicle_id} className={cn("animate-fade-slide-up", `stagger-${Math.min(i + 1, 8)}`)}>
              <TD>
                <div className="flex items-center gap-sm">
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-label-caps font-bold",
                      AVATAR_BY_STATUS[r.status] ?? "bg-surface-container text-on-surface-variant"
                    )}
                  >
                    {plateInitials(r.plate)}
                  </span>
                  <div>
                    <p className="font-body text-sm font-semibold text-on-surface">{r.plate}</p>
                    <p className="font-mono text-[11px] text-on-surface-variant">{r.model}</p>
                  </div>
                </div>
              </TD>
              <TD className="font-body text-on-surface-variant max-w-[160px] truncate">{r.route}</TD>
              <TD className="text-right font-mono text-on-surface">{formatBRL(r.gross_revenue)}</TD>
              <TD className="text-right font-mono text-on-surface">{formatBRL(r.total_cost)}</TD>
              <TD className={cn("text-right font-mono", MARGIN_COLOR(r.margin_pct))}>
                {formatPercent(r.margin_pct)}
              </TD>
              <TD className="text-center">
                {r.status === "profit" && <Badge variant="profit">Lucrativo</Badge>}
                {r.status === "alert" && <Badge variant="alert">Alerta</Badge>}
                {r.status === "neutral" && <Badge variant="neutral">Neutro</Badge>}
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
