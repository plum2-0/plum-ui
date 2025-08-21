"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { GlassVariant, getGlassStyle } from "@/lib/styles/glassMorphism";

interface GlassPanelProps extends React.HTMLAttributes<HTMLElement> {
  as?: any;
  variant?: GlassVariant;
  disabled?: boolean;
}

export default function GlassPanel({
  as,
  variant = "medium",
  className,
  style,
  children,
  ...rest
}: GlassPanelProps) {
  const Component: any = as || "div";
  const baseStyle = getGlassStyle(variant);

  return (
    <Component
      className={cn("", className)}
      style={{
        ...baseStyle,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Component>
  );
}
