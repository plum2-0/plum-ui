"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BlurLevel = "light" | "medium" | "heavy" | "ultra";
type BorderStyle = "static" | "animated" | "gradient" | "none";

interface GlassCardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, keyof HTMLMotionProps<"div">> {
  blur?: BlurLevel;
  border?: BorderStyle;
  glow?: boolean;
  reflection?: boolean;
  children: React.ReactNode;
  className?: string;
}

const blurLevels = {
  light: "backdrop-blur-sm",
  medium: "backdrop-blur-md",
  heavy: "backdrop-blur-xl",
  ultra: "backdrop-blur-3xl",
};

const borderStyles = {
  static: {
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  animated: {
    border: "1px solid transparent",
    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.08)),
                      linear-gradient(135deg, 
                        rgba(168, 85, 247, 0.5), 
                        rgba(34, 197, 94, 0.5), 
                        rgba(251, 146, 60, 0.5),
                        rgba(168, 85, 247, 0.5))`,
    backgroundOrigin: "border-box",
    backgroundClip: "padding-box, border-box",
  },
  gradient: {
    border: "1px solid transparent",
    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.08)),
                      linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(34, 197, 94, 0.3))`,
    backgroundOrigin: "border-box",
    backgroundClip: "padding-box, border-box",
  },
  none: {
    border: "none",
  },
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ blur = "medium", border = "static", glow = false, reflection = false, children, className, ...props }, ref) => {
    const blurClass = blurLevels[blur];
    const borderStyle = borderStyles[border];

    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative rounded-2xl overflow-hidden",
          blurClass,
          className
        )}
        style={{
          background: "rgba(255, 255, 255, 0.08)",
          boxShadow: glow
            ? "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 80px rgba(168, 85, 247, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
            : "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          ...borderStyle,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.23, 1, 0.32, 1], // Custom smooth easing
        }}
        {...props}
      >
        {/* Animated border gradient */}
        {border === "animated" && (
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-60"
            style={{
              background: `linear-gradient(135deg, 
                transparent 30%, 
                rgba(168, 85, 247, 0.3), 
                rgba(34, 197, 94, 0.3), 
                rgba(251, 146, 60, 0.3),
                transparent 70%)`,
              backgroundSize: "200% 200%",
            }}
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}

        {/* Glass reflection effect */}
        {reflection && (
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: `linear-gradient(105deg, 
                transparent 40%, 
                rgba(255, 255, 255, 0.2) 45%, 
                rgba(255, 255, 255, 0.1) 50%, 
                transparent 54%)`,
              transform: "translateY(-100%)",
              animation: "shimmer 8s infinite",
            }}
          />
        )}

        {/* Liquid glass distortion effect (subtle) */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(
              circle at 30% 80%,
              rgba(168, 85, 247, 0.1) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 80% 20%,
              rgba(34, 197, 94, 0.1) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 20% 30%,
              rgba(251, 146, 60, 0.05) 0%,
              transparent 50%
            )`,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";

// Add CSS animation for shimmer
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes shimmer {
      0% { transform: translateY(-100%); }
      20%, 100% { transform: translateY(200%); }
    }
  `;
  document.head.appendChild(style);
}