"use client";

import { formatBRL, formatTime } from "@/lib/utils";
import type { WhatsAppReceiptEntry } from "@/types";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function WhatsAppOcrPanel({ entries }: { entries: WhatsAppReceiptEntry[] }) {
  return (
    <section className="flex flex-col rounded-xl border border-outline-variant bg-white p-md shadow-card">
      <h2 className="font-display text-headline-md font-bold text-tertiary">Últimos recibos</h2>
      <p className="mb-md text-data-mono-sm text-secondary">Enviados pelo WhatsApp / OCR</p>
      <div className="flex max-h-[360px] flex-col gap-sm overflow-y-auto">
        {entries.length === 0 && (
          <p className="text-data-mono-sm text-secondary">
            Nenhum recibo recebido ainda. Use Recibos → Simular Recebimento.
          </p>
        )}
        {entries.map((e) => (
          <div key={e.id} className="flex items-center gap-sm rounded-lg border border-outline-variant p-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surfaceContainer font-display text-data-mono-sm font-bold text-tertiary">
              {initials(e.sender_name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-tertiary">{e.sender_name}</p>
              <p className="text-data-mono-sm text-secondary">
                {e.extracted_plate || "sem placa"} · {formatTime(e.received_at)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-sm font-bold text-tertiary">{formatBRL(e.extracted_amount ?? 0)}</p>
              <p className="text-[10px] font-bold uppercase text-secondary">{e.status}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
