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
  profit: "bg-[hsl(226,71%,40%)]/20 text-[hsl(217,91%,60%)]",
  alert: "bg-error/20 text-error",
  neutral: "bg-white/10 text-[#aaa]",
};

const MARGIN_COLOR = (pct: number) =>
  pct >= 0.1 ? "text-[hsl(217,91%,60%)] font-semibold" : pct < 0 ? "text-error font-semibold" : "text-[#aaa]";

export function VehiclePerformanceTable({ rows }: { rows: Row[] }) {
  if (rows.length === 0) {
    return (
      <div className="p-lg text-center font-mono text-label-caps uppercase text-[#888888]">
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
                      AVATAR_BY_STATUS[r.status] ?? "bg-white/10 text-[#aaa]"
                    )}
                  >
                    {plateInitials(r.plate)}
                  </span>
                  <div>
                    <p className="font-body text-sm font-semibold text-white">{r.plate}</p>
                    <p className="font-mono text-[11px] text-[#888888]">{r.model}</p>
                  </div>
                </div>
              </TD>
              <TD className="font-body text-[#aaa] max-w-[160px] truncate">{r.route}</TD>
              <TD className="text-right font-mono text-white">{formatBRL(r.gross_revenue)}</TD>
              <TD className="text-right font-mono text-white">{formatBRL(r.total_cost)}</TD>
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
