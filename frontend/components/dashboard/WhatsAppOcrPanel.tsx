"use client";

import { formatBRL, formatTime } from "@/lib/utils";
import type { WhatsAppReceiptEntry } from "@/types";
import { cn } from "@/lib/utils";

// Cor dinâmica de avatar por charCode da inicial
const AVATAR_COLORS = [
  "bg-primary/15 text-primary",
  "bg-primary-container/20 text-on-primary-container",
  "bg-surface-container-high text-on-surface",
  "bg-outline-variant/50 text-on-surface-variant",
  "bg-secondary/15 text-secondary",
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
  processed: "text-primary",
  pending: "text-primary-container",
  failed: "text-error",
};

export function WhatsAppOcrPanel({ entries }: { entries: WhatsAppReceiptEntry[] }) {
  return (
    <section className="flex flex-col rounded-xl border border-outline-variant bg-surface-bright p-lg shadow-sm">
      <h2 className="font-display text-headline-md font-bold text-on-surface">Últimos recibos</h2>
      <p className="mb-md font-mono text-label-caps uppercase text-on-surface-variant">Enviados pelo WhatsApp / OCR</p>
      <div className="flex max-h-[360px] flex-col gap-2 overflow-y-auto">
        {entries.length === 0 && (
          <p className="font-mono text-label-caps uppercase text-on-surface-variant">
            Nenhum recibo recebido ainda. Use Recibos → Simular Recebimento.
          </p>
        )}
        {entries.map((e, i) => (
          <div
            key={e.id}
            className={cn(
              "flex items-center gap-sm rounded-DEFAULT border border-outline-variant p-sm",
              "hover:bg-surface-container-low transition-colors duration-100",
              "animate-fade-slide-up",
              `stagger-${Math.min(i + 1, 6)}`
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-label-caps font-bold",
                avatarColor(e.sender_name)
              )}
            >
              {initials(e.sender_name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-on-surface">{e.sender_name}</p>
              <p className="font-mono text-[11px] text-on-surface-variant">
                {e.extracted_plate || "sem placa"} · {formatTime(e.received_at)}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-mono text-sm font-bold text-on-surface">{formatBRL(e.extracted_amount ?? 0)}</p>
              <p className={cn("font-mono text-[10px] font-bold uppercase tracking-wider", STATUS_STYLES[e.status] || "text-on-surface-variant")}>
                {e.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
