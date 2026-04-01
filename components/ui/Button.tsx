"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "tonal";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-headline font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95",
          {
            "hero-gradient text-on-primary hover:shadow-lg hover:shadow-primary/20 focus:ring-primary": variant === "primary",
            "bg-secondary text-white hover:bg-secondary-container focus:ring-secondary": variant === "secondary",
            "border-2 border-primary/20 text-primary hover:bg-primary hover:text-white focus:ring-primary": variant === "outline",
            "text-on-surface-variant hover:text-primary hover:bg-surface-container-high": variant === "ghost",
            "bg-error text-on-error hover:bg-error/90 focus:ring-error": variant === "danger",
            "bg-surface-container-highest text-primary hover:bg-surface-container-high focus:ring-primary": variant === "tonal",
          },
          {
            "px-4 py-2 text-sm": size === "sm",
            "px-6 py-2.5 text-base": size === "md",
            "px-10 py-4 text-lg": size === "lg",
          },
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
