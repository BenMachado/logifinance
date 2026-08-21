"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "ghost" | "destructive" | "secondary";
type ButtonSize = "default" | "sm" | "lg" | "icon";

const variants: Record<ButtonVariant, string> = {
  default:
    "bg-brand text-brand-foreground hover:bg-brand-dim shadow-sm hover:shadow-float-brand",
  outline:
    "bg-white text-tertiary border border-outline-variant hover:bg-surfaceContainer-low hover:border-outline",
  ghost:
    "text-secondary hover:bg-surfaceContainer-high hover:text-tertiary",
  destructive:
    "bg-error text-error-foreground hover:bg-error/90 shadow-sm",
  secondary:
    "bg-surfaceContainer-high text-foreground hover:bg-surfaceContainer-highest",
};

const sizes: Record<ButtonSize, string> = {
  default: "h-10 px-5 py-2 text-sm",
  sm: "h-8 px-3 text-xs",
  lg: "h-11 px-7 text-base",
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
        "inline-flex items-center justify-center gap-xs rounded-xl font-semibold",
        "transition-all duration-150 ease-bounce-subtle",
        "active:scale-[0.97]",
        "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-1",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
