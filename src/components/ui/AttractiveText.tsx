"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TextVariant = "default" | "gradient" | "subtle" | "elegant";
type TextSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface AttractiveTextProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, keyof HTMLMotionProps<"span">> {
  variant?: TextVariant;
  size?: TextSize;
  animate?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variants = {
  default: {
    className: "text-foreground",
    style: {},
  },
  gradient: {
    className: "",
    style: {
      background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
  },
  subtle: {
    className: "",
    style: {
      background: "linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
  },
  elegant: {
    className: "",
    style: {
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
  },
};

const sizes = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
};

export const AttractiveText = forwardRef<HTMLSpanElement, AttractiveTextProps>(
  ({ variant = "default", size = "md", animate = true, children, className, ...props }, ref) => {
    const variantConfig = variants[variant];
    const sizeClass = sizes[size];

    return (
      <motion.span
        ref={ref}
        className={cn(
          "inline-block font-medium",
          sizeClass,
          variantConfig.className,
          className
        )}
        style={{
          ...variantConfig.style,
          textShadow: variant !== "default" ? "0 1px 2px rgba(0, 0, 0, 0.1)" : undefined,
        }}
        initial={animate ? { opacity: 0, y: 5 } : undefined}
        animate={animate ? { opacity: 1, y: 0 } : undefined}
        transition={animate ? {
          duration: 0.4,
          ease: "easeOut",
        } : undefined}
        whileHover={animate ? {
          scale: 1.02,
          transition: { duration: 0.2 },
        } : undefined}
        {...props}
      >
        {children}
      </motion.span>
    );
  }
);

AttractiveText.displayName = "AttractiveText";