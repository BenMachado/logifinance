"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  badge?: { label: string; icon?: string; tone: "profit" | "alert" | "neutral" };
  breakdown?: string;
  valueClassName?: string;
  borderLeftAccent?: string;
  progressBar?: number;
  loading?: boolean;
  delta?: { percent: number; invert?: boolean };
}

/** Extrai número de uma string formatada como "R$ 1.234,56" ou "12,3%" */
function parseNumeric(value: string): number | null {
  // Remove símbolos de moeda, espaços, pontos de milhar; troca vírgula por ponto
  const cleaned = value.replace(/[R$\s.%]/g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

/** Hook de count-up: anima de 0 até `target` em `duration`ms */
function useCountUp(target: number | null, duration = 700) {
  const [current, setCurrent] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const prevTarget = useRef<number | null>(null);

  useEffect(() => {
    if (target === null) return;
    // Se o target não mudou, não reanima
    if (prevTarget.current === target && current !== null) return;
    prevTarget.current = target;

    const from = 0;
    const to = target;
    startRef.current = null;

    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setCurrent(from + (to - from) * ease);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setCurrent(to);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return current;
}

/** Reconstrói a string formatada substituindo só a parte numérica */
function reformat(original: string, animated: number): string {
  // Detecta se é BRL (R$)
  if (original.includes("R$") || original.includes("R ")) {
    return original.replace(/[\d.,]+/, animated.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  }
  // Detecta se é percentual
  if (original.includes("%")) {
    return original.replace(/[\d.,]+/, animated.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
  }
  // Número inteiro (ex: "42")
  return String(Math.round(animated));
}

export function KpiCard({
  title,
  value,
  badge,
  breakdown,
  valueClassName,
  borderLeftAccent,
  progressBar,
  loading,
  delta,
}: KpiCardProps) {
  const positive = delta ? (delta.invert ? delta.percent <= 0 : delta.percent >= 0) : undefined;

  const numeric = parseNumeric(value);
  const animated = useCountUp(loading ? null : numeric);

  const displayValue =
    !loading && animated !== null && numeric !== null
      ? reformat(value, animated)
      : value;

  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-sm rounded-xl border border-outline-variant bg-surface-bright p-lg shadow-sm",
        "transition-all duration-200 ease-bounce-subtle hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5",
        "animate-fade-slide-up",
        borderLeftAccent
      )}
    >
      {/* Título + badge/delta */}
      <div className="flex items-start justify-between gap-sm">
        <h3 className="text-body-sm font-semibold text-on-surface-variant">{title}</h3>
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-mono text-[11px] font-bold uppercase",
              positive
                ? "bg-primary/10 text-primary"
                : "bg-error/10 text-error"
            )}
          >
            <span className="material-symbols-outlined text-[14px]">
              {positive ? "arrow_upward" : "arrow_downward"}
            </span>
            {Math.abs(delta.percent).toFixed(1)}%
          </span>
        )}
        {!delta && badge && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-label-caps uppercase font-semibold",
              badge.tone === "profit" && "bg-primary text-on-primary",
              badge.tone === "alert" && "bg-error text-on-error",
              badge.tone === "neutral" && "bg-surface-container text-on-surface-variant"
            )}
          >
            {badge.icon && <span className="material-symbols-outlined text-[14px]">{badge.icon}</span>}
            {badge.label}
          </span>
        )}
      </div>

      {/* Valor principal com count-up */}
      {loading ? (
        <div className="my-1 h-9 w-3/4 skeleton" />
      ) : (
        <div
          className={cn(
            "font-mono text-[1.75rem] font-bold tracking-tight text-on-surface leading-none",
            valueClassName
          )}
        >
          {displayValue}
        </div>
      )}

      {/* Breakdown / legenda */}
      {(breakdown || delta) && (
        <p className="font-mono text-label-caps uppercase text-on-surface-variant">{breakdown || "vs período anterior"}</p>
      )}

      {/* Progress bar */}
      {typeof progressBar === "number" && !loading && (
        <div className="mt-1 h-1.5 w-full rounded-full bg-surface-container overflow-hidden">
          <div
            className="h-1.5 rounded-full bg-primary-container transition-all duration-700 ease-bounce-subtle"
            style={{ width: `${Math.min(100, Math.max(0, progressBar * 100))}%` }}
          />
        </div>
      )}
    </div>
  );
}
