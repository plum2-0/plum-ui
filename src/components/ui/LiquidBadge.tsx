"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple"
  | "orange";
type BadgeSize = "sm" | "md" | "lg";

interface LiquidBadgeProps
  extends Omit<HTMLAttributes<HTMLDivElement>, keyof HTMLMotionProps<"div">> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  animate?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variants = {
  default: {
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06))",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    color: "rgba(255, 255, 255, 0.85)",
  },
  success: {
    background:
      "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.15))",
    border: "1px solid rgba(34, 197, 94, 0.25)",
    color: "rgb(134, 239, 172)",
  },
  warning: {
    background:
      "linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.15))",
    border: "1px solid rgba(251, 191, 36, 0.25)",
    color: "rgb(253, 224, 71)",
  },
  danger: {
    background:
      "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.15))",
    border: "1px solid rgba(239, 68, 68, 0.25)",
    color: "rgb(252, 165, 165)",
  },
  info: {
    background:
      "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.15))",
    border: "1px solid rgba(59, 130, 246, 0.25)",
    color: "rgb(147, 197, 253)",
  },
  purple: {
    background:
      "linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(147, 51, 234, 0.15))",
    border: "1px solid rgba(168, 85, 247, 0.25)",
    color: "rgb(216, 180, 254)",
  },
  orange: {
    background:
      "linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(254, 215, 170, 0.15))",
    border: "1px solid rgba(251, 146, 60, 0.25)",
    color: "rgb(254, 215, 170)",
  },
};

const sizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
};

export const LiquidBadge = forwardRef<HTMLDivElement, LiquidBadgeProps>(
  (
    {
      variant = "default",
      size = "md",
      animate = true,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const variantStyles = variants[variant];
    const sizeStyles = sizes[size];

    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center rounded-lg font-medium backdrop-blur-sm overflow-hidden",
          sizeStyles,
          className
        )}
        style={{
          background: variantStyles.background,
          border: variantStyles.border,
          color: variantStyles.color,
          boxShadow:
            "0 1px 3px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        }}
        initial={animate ? { opacity: 0, scale: 0.95 } : undefined}
        animate={animate ? { opacity: 1, scale: 1 } : undefined}
        whileHover={
          animate
            ? {
                scale: 1.02,
                boxShadow:
                  "0 2px 6px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              }
            : undefined
        }
        transition={
          animate
            ? {
                duration: 0.2,
                ease: "easeOut",
              }
            : undefined
        }
        {...props}
      >
        {/* Subtle liquid gradient overlay */}
        <motion.div
          className="absolute inset-0 rounded-lg opacity-30"
          style={{
            background: `radial-gradient(
              ellipse at 20% 20%,
              ${variantStyles.color}20 0%,
              transparent 50%
            ), radial-gradient(
              ellipse at 80% 80%,
              ${variantStyles.color}15 0%,
              transparent 50%
            )`,
          }}
          animate={
            animate
              ? {
                  background: [
                    `radial-gradient(ellipse at 20% 20%, ${variantStyles.color}20 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, ${variantStyles.color}15 0%, transparent 50%)`,
                    `radial-gradient(ellipse at 80% 20%, ${variantStyles.color}15 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, ${variantStyles.color}20 0%, transparent 50%)`,
                    `radial-gradient(ellipse at 20% 20%, ${variantStyles.color}20 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, ${variantStyles.color}15 0%, transparent 50%)`,
                  ],
                }
              : undefined
          }
          transition={
            animate
              ? {
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              : undefined
          }
        />

        {/* Content */}
        <span className="relative z-10">{children}</span>
      </motion.div>
    );
  }
);

LiquidBadge.displayName = "LiquidBadge";
