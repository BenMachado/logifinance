"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-10 w-full rounded-xl border border-white/10 bg-[#0d0d0d] px-3 text-body-md text-white focus:outline-none focus:ring-2 focus:ring-[hsl(217,91%,60%)]/30 focus:border-[hsl(217,91%,60%)] transition-colors cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";
