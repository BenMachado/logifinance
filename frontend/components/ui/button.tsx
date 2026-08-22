"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "ghost" | "destructive" | "secondary";
type ButtonSize = "default" | "sm" | "lg" | "icon";

const variants: Record<ButtonVariant, string> = {
  default:
    "bg-primary-container text-on-primary-container border border-outline hover:bg-primary hover:text-on-primary",
  outline:
    "bg-white text-on-surface border border-outline-variant hover:bg-surface-container-high",
  ghost:
    "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
  destructive:
    "bg-error text-on-error border border-outline hover:bg-error/90",
  secondary:
    "bg-surface-container-high text-on-surface hover:bg-surface-container-highest",
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
        "transition-all duration-150",
        "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
