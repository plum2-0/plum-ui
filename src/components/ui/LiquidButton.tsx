"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "icon";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface LiquidButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof HTMLMotionProps<"button">> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shimmer?: boolean;
  liquid?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variants = {
  primary: {
    base: "text-white font-semibold",
    gradient: "linear-gradient(135deg, rgba(168, 85, 247, 0.9), rgba(34, 197, 94, 0.9))",
    hoverGradient: "linear-gradient(135deg, rgba(147, 51, 234, 1), rgba(16, 185, 129, 1))",
    border: "1px solid rgba(168, 85, 247, 0.3)",
    shadow: "0 8px 32px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
    hoverShadow: "0 12px 48px rgba(168, 85, 247, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
  },
  secondary: {
    base: "text-white/90 font-medium",
    gradient: "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
    hoverGradient: "linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08))",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    shadow: "0 4px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
    hoverShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
  },
  ghost: {
    base: "text-white/70 font-medium",
    gradient: "transparent",
    hoverGradient: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    shadow: "none",
    hoverShadow: "0 4px 16px rgba(255, 255, 255, 0.1)",
  },
  danger: {
    base: "text-white font-semibold",
    gradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9))",
    hoverGradient: "linear-gradient(135deg, rgba(220, 38, 38, 1), rgba(185, 28, 28, 1))",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    shadow: "0 8px 32px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
    hoverShadow: "0 12px 48px rgba(239, 68, 68, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
  },
  icon: {
    base: "text-white/80",
    gradient: "linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04))",
    hoverGradient: "linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06))",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    shadow: "0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
    hoverShadow: "0 6px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
  },
};

const sizes = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-2xl",
  icon: "p-2 rounded-xl",
};

export const LiquidButton = forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ variant = "primary", size = "md", shimmer = false, liquid = true, children, className, disabled, ...props }, ref) => {
    const variantStyles = variants[variant];
    const sizeStyles = sizes[size];

    return (
      <motion.button
        ref={ref}
        className={cn(
          "relative overflow-hidden transition-all duration-300 ease-out",
          "backdrop-blur-xl",
          variantStyles.base,
          sizeStyles,
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        style={{
          background: variantStyles.gradient,
          border: variantStyles.border,
          boxShadow: variantStyles.shadow,
        }}
        whileHover={
          !disabled
            ? {
                scale: 1.02,
                background: variantStyles.hoverGradient,
                boxShadow: variantStyles.hoverShadow,
              }
            : undefined
        }
        whileTap={!disabled ? { scale: 0.98 } : undefined}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
        disabled={disabled}
        {...props}
      >
        {/* Liquid animation layer */}
        {liquid && !disabled && (
          <motion.div
            className="absolute inset-0 opacity-50"
            style={{
              background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.2), transparent 40%)`,
            }}
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 0.3 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Shimmer effect */}
        {shimmer && !disabled && (
          <motion.div
            className="absolute inset-0 -translate-x-full"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
            }}
            animate={{
              translateX: ["0%", "200%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 1,
              ease: "linear",
            }}
          />
        )}

        {/* Button content */}
        <span className="relative z-10">{children}</span>
      </motion.button>
    );
  }
);

LiquidButton.displayName = "LiquidButton";