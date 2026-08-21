"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "profit" | "alert" | "neutral" | "warning" | "info";

const styles: Record<Variant, string> = {
  profit: "bg-success-background text-success border border-success-border",
  alert: "bg-error-container text-onErrorContainer",
  neutral: "bg-surfaceContainer-low text-secondary",
  warning: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  info: "bg-blue-100 text-blue-800 border border-blue-200",
};

export function Badge({
  variant = "neutral",
  className,
  children,
}: {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-block px-2 py-1 text-[10px] uppercase font-bold rounded font-display",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
