"use client";

import { formatBRL, formatTime } from "@/lib/utils";
import type { WhatsAppReceiptEntry } from "@/types";
import { cn } from "@/lib/utils";

// Cor dinâmica de avatar por charCode da inicial
const AVATAR_COLORS = [
  "bg-[hsl(226,71%,40%)]/20 text-[hsl(217,91%,60%)]",
  "bg-emerald-500/20 text-emerald-400",
  "bg-purple-500/20 text-purple-400",
  "bg-amber-500/20 text-amber-400",
  "bg-white/10 text-white",
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
  processed: "text-[hsl(217,91%,60%)]",
  pending: "text-amber-400",
  failed: "text-error",
};

export function WhatsAppOcrPanel({ entries }: { entries: WhatsAppReceiptEntry[] }) {
  return (
    <section className="flex flex-col rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-lg shadow-sm text-white">
      <h2 className="font-display text-headline-md font-bold text-white">Últimos recibos</h2>
      <p className="mb-md font-mono text-label-caps uppercase text-[#888888]">Enviados pelo WhatsApp / OCR</p>
      <div className="flex max-h-[360px] flex-col gap-2 overflow-y-auto">
        {entries.length === 0 && (
          <p className="font-mono text-label-caps uppercase text-[#888888]">
            Nenhum recibo recebido ainda. Use Recibos → Simular Recebimento.
          </p>
        )}
        {entries.map((e, i) => (
          <div
            key={e.id}
            className={cn(
              "flex items-center gap-sm rounded-xl border border-white/10 bg-white/[0.02] p-sm",
              "hover:bg-white/5 transition-colors duration-100",
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
              <p className="truncate text-sm font-semibold text-white">{e.sender_name}</p>
              <p className="font-mono text-[11px] text-[#888888]">
                {e.extracted_plate || "sem placa"} · {formatTime(e.received_at)}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-mono text-sm font-bold text-white">{formatBRL(e.extracted_amount ?? 0)}</p>
              <p className={cn("font-mono text-[10px] font-bold uppercase tracking-wider", STATUS_STYLES[e.status] || "text-[#888888]")}>
                {e.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
