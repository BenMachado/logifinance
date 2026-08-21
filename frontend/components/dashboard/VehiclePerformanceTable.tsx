"use client";

import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatPercent } from "@/lib/utils";
import type { VehiclePerformanceRow as Row } from "@/types";

function plateInitials(plate: string) {
  return plate.replace(/[^A-Z0-9]/gi, "").slice(0, 2).toUpperCase() || "VE";
}

export function VehiclePerformanceTable({ rows }: { rows: Row[] }) {
  if (rows.length === 0) {
    return (
      <div className="p-md text-center text-data-mono-sm text-secondary">
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
          {rows.map((r) => (
            <TR key={r.vehicle_id}>
              <TD>
                <div className="flex items-center gap-sm">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surfaceContainer font-display text-data-mono-sm font-bold text-tertiary">
                    {plateInitials(r.plate)}
                  </span>
                  <div>
                    <p className="font-body text-sm font-semibold text-tertiary">{r.plate}</p>
                    <p className="text-data-mono-sm text-secondary">{r.model}</p>
                  </div>
                </div>
              </TD>
              <TD className="font-body text-secondary">{r.route}</TD>
              <TD className="text-right">{formatBRL(r.gross_revenue)}</TD>
              <TD className="text-right">{formatBRL(r.total_cost)}</TD>
              <TD className="text-right">{formatPercent(r.margin_pct)}</TD>
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
