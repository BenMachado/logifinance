"use client";

import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatDate } from "@/lib/utils";
import type { Driver, Trip } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<Trip["status"], string> = {
  in_progress: "Em andamento",
  completed: "Concluída",
  cancelled: "Cancelada",
};

const STATUS_TONE: Record<Trip["status"], "info" | "profit" | "neutral"> = {
  in_progress: "info",
  completed: "profit",
  cancelled: "neutral",
};

// Barra de status à esquerda de cada row
const STATUS_BAR: Record<Trip["status"], string> = {
  in_progress: "bg-primary-container",
  completed: "bg-primary",
  cancelled: "bg-surface-container-highest",
};

// Cor de fundo do avatar baseada no charCode da inicial
function avatarColor(name: string): string {
  const colors = [
    "bg-primary/15 text-primary",
    "bg-primary-container/20 text-on-primary-container",
    "bg-surface-container-high text-on-surface",
    "bg-outline-variant/50 text-on-surface-variant",
    "bg-secondary/15 text-secondary",
  ];
  const code = (name.charCodeAt(0) || 0) % colors.length;
  return colors[code];
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function RecentTripsTable({ trips, drivers }: { trips: Trip[]; drivers: Driver[] }) {
  const byId = new Map(drivers.map((d) => [d.id, d]));

  return (
    <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-bright shadow-sm">
      <div className="flex items-center justify-between border-b border-outline-variant px-lg py-sm">
        <h2 className="font-display text-headline-md font-bold text-on-surface">Últimas viagens</h2>
      </div>
      {trips.length === 0 ? (
        <p className="p-lg text-center font-mono text-label-caps uppercase text-on-surface-variant">
          Nenhuma viagem cadastrada ainda.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH className="w-0 p-0" />
                <TH>Motorista / rota</TH>
                <TH>Data</TH>
                <TH className="text-right">Frete</TH>
                <TH className="text-center">Status</TH>
              </tr>
            </THead>
            <TBody>
              {trips.map((trip, i) => {
                const driver = trip.driver_id ? byId.get(trip.driver_id) : undefined;
                const name = driver?.full_name || "Sem motorista";
                return (
                  <TR
                    key={trip.id}
                    className={cn(
                      "animate-fade-slide-up",
                      `stagger-${Math.min(i + 1, 8)}`
                    )}
                  >
                    {/* Barra colorida à esquerda */}
                    <TD className="p-0 w-1">
                      <div className={cn("h-full w-1 min-h-[52px]", STATUS_BAR[trip.status])} />
                    </TD>
                    <TD>
                      <div className="flex items-center gap-sm">
                        <span
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-label-caps font-bold",
                            avatarColor(name)
                          )}
                        >
                          {initials(name)}
                        </span>
                        <div>
                          <p className="font-body text-sm font-semibold text-on-surface">{name}</p>
                          <p className="font-mono text-[11px] text-on-surface-variant">
                            {trip.origin} → {trip.destination}
                          </p>
                        </div>
                      </div>
                    </TD>
                    <TD className="text-on-surface-variant whitespace-nowrap font-mono text-xs">{formatDate(trip.scheduled_date)}</TD>
                    <TD className="text-right font-mono font-semibold text-on-surface">
                      {formatBRL(trip.gross_revenue)}
                    </TD>
                    <TD className="text-center">
                      <Badge variant={STATUS_TONE[trip.status]}>{STATUS_LABELS[trip.status]}</Badge>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </div>
      )}
    </section>
  );
}
