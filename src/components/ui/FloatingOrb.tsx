"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { CSSProperties } from "react";
import { radialGradients, RadialGradient } from "@/lib/styles/gradients";

interface FloatingOrbProps extends Omit<HTMLMotionProps<"div">, "style"> {
  size?: "sm" | "md" | "lg" | "xl";
  gradient?: RadialGradient | string;
  position?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  blur?: number;
  opacity?: number;
  animationDuration?: number;
  animationDelay?: number;
  className?: string;
}

const sizeMap = {
  sm: { width: "45px", height: "45px" },
  md: { width: "60px", height: "60px" },
  lg: { width: "80px", height: "80px" },
  xl: { width: "120px", height: "120px" },
};

export function FloatingOrb({
  size = "md",
  gradient = "purpleOrbSubtle",
  position = {},
  blur = 10,
  opacity = 0.15,
  animationDuration = 8,
  animationDelay = 0,
  className = "",
  ...motionProps
}: FloatingOrbProps) {
  const dimensions = sizeMap[size];
  
  // Use predefined gradient or custom gradient string
  const backgroundGradient = 
    gradient in radialGradients 
      ? radialGradients[gradient as RadialGradient]
      : gradient;

  const orbStyle: CSSProperties = {
    ...dimensions,
    ...position,
    position: "absolute",
    borderRadius: "50%",
    background: backgroundGradient,
    filter: `blur(${blur}px)`,
    opacity,
    pointerEvents: "none" as const,
  };

  return (
    <motion.div
      className={`floating-orb ${className}`}
      style={orbStyle}
      animate={{
        y: [0, -10, 0],
        scale: [1, 1.1, 1],
        opacity: [opacity, opacity * 1.5, opacity],
      }}
      transition={{
        duration: animationDuration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: animationDelay,
      }}
      {...motionProps}
    />
  );
}

export function FloatingOrbGroup({ children }: { children?: React.ReactNode }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Default orb configuration for common use */}
      <FloatingOrb
        size="md"
        gradient="purpleOrbSubtle"
        position={{ top: "15%", left: "12%" }}
        animationDuration={6}
      />
      <FloatingOrb
        size="lg"
        gradient="greenOrbSubtle"
        position={{ top: "8%", right: "18%" }}
        animationDuration={8}
        animationDelay={1}
      />
      <FloatingOrb
        size="sm"
        gradient="orangeOrbSubtle"
        position={{ bottom: "20%", left: "8%" }}
        animationDuration={7}
        animationDelay={2}
      />
      {children}
    </div>
  );
}