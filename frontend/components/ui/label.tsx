"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-data-mono-sm font-bold text-secondary uppercase tracking-wider", className)}
      {...props}
    />
  )
);
Label.displayName = "Label";
