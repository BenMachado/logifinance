"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "profit" | "alert" | "neutral" | "warning" | "info";

const styles: Record<Variant, string> = {
  profit: "bg-primary text-on-primary",
  alert: "bg-error text-on-error",
  warning: "bg-surface-container-high text-on-surface",
  neutral: "bg-surface-container text-on-surface-variant",
  info: "bg-surface-container text-secondary",
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
        "inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full",
        "text-label-caps uppercase font-semibold tracking-wider font-mono",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
