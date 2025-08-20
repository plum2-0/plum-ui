import { CSSProperties } from "react";

export type GlassVariant = "light" | "medium" | "heavy" | "ultra" | "dark";

export interface GlassStyle extends CSSProperties {
  background: string;
  backdropFilter: string;
  WebkitBackdropFilter: string;
  border: string;
  boxShadow?: string;
}

export const glassStyles: Record<GlassVariant, GlassStyle> = {
  light: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(20px) saturate(1.1)",
    WebkitBackdropFilter: "blur(20px) saturate(1.1)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  medium: {
    background: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(20px) saturate(1.2)",
    WebkitBackdropFilter: "blur(20px) saturate(1.2)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
  },
  heavy: {
    background: "rgba(255, 255, 255, 0.12)",
    backdropFilter: "blur(30px) saturate(1.5)",
    WebkitBackdropFilter: "blur(30px) saturate(1.5)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
  },
  ultra: {
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.06) 100%)",
    backdropFilter: "blur(40px) saturate(1.8)",
    WebkitBackdropFilter: "blur(40px) saturate(1.8)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  dark: {
    background: "linear-gradient(135deg, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.85) 100%)",
    backdropFilter: "blur(40px) saturate(1.2)",
    WebkitBackdropFilter: "blur(40px) saturate(1.2)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
  },
};

export const getGlassStyle = (variant: GlassVariant = "medium"): GlassStyle => {
  return glassStyles[variant];
};

export const combineGlassStyles = (
  variant: GlassVariant,
  overrides?: Partial<CSSProperties>
): CSSProperties => {
  return {
    ...glassStyles[variant],
    ...overrides,
  };
};