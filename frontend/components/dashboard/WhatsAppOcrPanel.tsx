"use client";

import { formatBRL, formatTime } from "@/lib/utils";
import type { WhatsAppReceiptEntry } from "@/types";
import { cn } from "@/lib/utils";

// Cor dinâmica de avatar por charCode da inicial
const AVATAR_COLORS = [
  "bg-brand/15 text-brand",
  "bg-status-info/15 text-status-info",
  "bg-status-profit/15 text-status-profit",
  "bg-purple-100 text-purple-700",
  "bg-status-warning/15 text-status-warning",
];

function avatarColor(name: string): string {
  const code = (name.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[code];
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

const STATUS_STYLES: Record<string, string> = {
  processed: "text-status-profit",
  pending: "text-status-warning",
  failed: "text-status-alert",
};

export function WhatsAppOcrPanel({ entries }: { entries: WhatsAppReceiptEntry[] }) {
  return (
    <section className="flex flex-col rounded-2xl border border-outline-variant bg-white p-lg shadow-card">
      <h2 className="font-display text-headline-md font-bold text-tertiary">Últimos recibos</h2>
      <p className="mb-md text-data-mono-sm text-secondary">Enviados pelo WhatsApp / OCR</p>
      <div className="flex max-h-[360px] flex-col gap-2 overflow-y-auto">
        {entries.length === 0 && (
          <p className="text-data-mono-sm text-secondary">
            Nenhum recibo recebido ainda. Use Recibos → Simular Recebimento.
          </p>
        )}
        {entries.map((e, i) => (
          <div
            key={e.id}
            className={cn(
              "flex items-center gap-sm rounded-xl border border-outline-variant p-sm",
              "hover:bg-surfaceContainer-low transition-colors duration-100",
              "animate-fade-slide-up",
              `stagger-${Math.min(i + 1, 6)}`
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-data-mono-sm font-bold",
                avatarColor(e.sender_name)
              )}
            >
              {initials(e.sender_name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-tertiary">{e.sender_name}</p>
              <p className="text-data-mono-sm text-secondary">
                {e.extracted_plate || "sem placa"} · {formatTime(e.received_at)}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-mono text-sm font-bold text-tertiary">{formatBRL(e.extracted_amount ?? 0)}</p>
              <p className={cn("text-[10px] font-bold uppercase tracking-wider", STATUS_STYLES[e.status] || "text-secondary")}>
                {e.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
