"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "h-10 w-full rounded-xl border border-white/10 bg-white/5 px-4",
        "text-body-md text-white placeholder:text-[#666]",
        "transition-all duration-150",
        "focus:outline-none focus:ring-2 focus:ring-[hsl(217,91%,60%)]/30 focus:border-[hsl(217,91%,60%)]",
        "hover:border-white/20",
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
        "min-h-[80px] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5",
        "text-body-md text-white placeholder:text-[#666]",
        "transition-all duration-150",
        "focus:outline-none focus:ring-2 focus:ring-[hsl(217,91%,60%)]/30 focus:border-[hsl(217,91%,60%)]",
        "hover:border-white/20",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
