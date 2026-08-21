"use client";

import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatDate } from "@/lib/utils";
import type { Driver, Trip } from "@/types";

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
    <section className="overflow-hidden rounded-xl border border-outline-variant bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-outline-variant px-md py-sm">
        <h2 className="font-display text-headline-md font-bold text-tertiary">Últimas viagens</h2>
      </div>
      {trips.length === 0 ? (
        <p className="p-md text-center text-data-mono-sm text-secondary">Nenhuma viagem cadastrada ainda.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH>Motorista / rota</TH>
                <TH>Data</TH>
                <TH className="text-right">Frete</TH>
                <TH className="text-center">Status</TH>
              </tr>
            </THead>
            <TBody>
              {trips.map((trip) => {
                const driver = trip.driver_id ? byId.get(trip.driver_id) : undefined;
                const name = driver?.full_name || "Sem motorista";
                return (
                  <TR key={trip.id}>
                    <TD>
                      <div className="flex items-center gap-sm">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surfaceContainer font-display text-data-mono-sm font-bold text-tertiary">
                          {initials(name)}
                        </span>
                        <div>
                          <p className="font-body text-sm font-semibold text-tertiary">{name}</p>
                          <p className="text-data-mono-sm text-secondary">
                            {trip.origin} → {trip.destination}
                          </p>
                        </div>
                      </div>
                    </TD>
                    <TD className="text-secondary">{formatDate(trip.scheduled_date)}</TD>
                    <TD className="text-right font-semibold">{formatBRL(trip.gross_revenue)}</TD>
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
