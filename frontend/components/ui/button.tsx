"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "ghost" | "destructive" | "secondary";
type ButtonSize = "default" | "sm" | "lg" | "icon";

const variants: Record<ButtonVariant, string> = {
  default:
    "bg-primary-container text-on-primary-container border border-on-surface shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-1",
  outline:
    "bg-white text-on-surface border border-outline-variant hover:bg-surface-container-high",
  ghost:
    "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
  destructive:
    "bg-error text-on-error border border-on-surface shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-1",
  secondary:
    "bg-surface-container-high text-on-surface hover:bg-surface-container-highest",
};

const sizes: Record<ButtonSize, string> = {
  default: "h-10 px-5 py-2 text-label-caps",
  sm: "h-8 px-3 text-[11px]",
  lg: "h-11 px-7 text-sm",
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
        "inline-flex items-center justify-center gap-xs rounded-DEFAULT font-mono text-label-caps uppercase font-semibold tracking-wider",
        "transition-all duration-150 ease-bounce-subtle",
        "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
