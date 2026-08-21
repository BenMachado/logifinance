"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "profit" | "alert" | "neutral" | "warning" | "info";

const styles: Record<Variant, string> = {
  profit: "bg-status-profit text-white",
  alert: "bg-status-alert text-white",
  neutral: "bg-surfaceContainer text-secondary",
  warning: "bg-status-warning text-white",
  info: "bg-status-info text-white",
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
        "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full",
        "text-[10px] uppercase font-bold tracking-wider font-display",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
