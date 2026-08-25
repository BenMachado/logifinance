"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "ghost" | "destructive" | "secondary";
type ButtonSize = "default" | "sm" | "lg" | "icon";

const variants: Record<ButtonVariant, string> = {
  default:
    "bg-[hsl(226,71%,40%)] text-white border border-[hsl(226,71%,40%)] hover:bg-[hsl(217,91%,60%)]",
  outline:
    "bg-transparent text-white border border-[#333] hover:bg-white/5",
  ghost:
    "text-[#aaa] hover:bg-white/5 hover:text-white",
  destructive:
    "bg-[hsl(0,84%,60%)] text-white border border-[hsl(0,84%,60%)] hover:bg-[hsl(0,84%,50%)]",
  secondary:
    "bg-[#1a1a1a] text-white border border-[#333] hover:bg-[#222]",
};

const sizes: Record<ButtonSize, string> = {
  default: "h-10 px-5 py-2 text-[13px]",
  sm: "h-8 px-3 text-[12px]",
  lg: "h-11 px-7 text-[14px]",
  icon: "h-10 w-10",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium",
        "transition-colors duration-150",
        "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
