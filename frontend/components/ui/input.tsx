"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "h-10 w-full rounded-xl border border-outline bg-white px-4",
        "text-body-md text-foreground placeholder:text-secondary",
        "transition-all duration-150",
        "focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand",
        "hover:border-outline-variant",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[80px] w-full rounded-xl border border-outline bg-white px-4 py-2.5",
        "text-body-md text-foreground placeholder:text-secondary",
        "transition-all duration-150",
        "focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
