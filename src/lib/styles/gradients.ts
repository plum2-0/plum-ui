export const liquidGradients = {
  // Primary brand gradients
  purpleGreen: "linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(34, 197, 94, 0.8))",
  purpleGreenSubtle: "linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(34, 197, 94, 0.05))",
  purpleGreenBright: "linear-gradient(135deg, rgba(168, 85, 247, 0.95), rgba(34, 197, 94, 0.95))",
  
  // Accent gradients
  orangeRed: "linear-gradient(135deg, rgba(251, 146, 60, 0.95), rgba(249, 115, 22, 0.95))",
  orangeRedSubtle: "linear-gradient(135deg, rgba(251, 146, 60, 0.12), rgba(255, 255, 255, 0.06))",
  
  blueIndigo: "linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(37, 99, 235, 0.95))",
  
  purpleViolet: "linear-gradient(135deg, rgba(168, 85, 247, 0.95), rgba(147, 51, 234, 0.95))",
  purpleVioletSubtle: "linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(255, 255, 255, 0.06))",
  
  // Glass gradients
  glassSubtle: "linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.06) 100%)",
  glassMedium: "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.08) 100%)",
  glassStrong: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.12) 100%)",
  
  // Dark overlays
  darkOverlay: "linear-gradient(135deg, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.85) 100%)",
  
  // Progress bar gradient
  progressBar: "linear-gradient(90deg, rgba(34, 197, 94, 0.9), rgba(16, 185, 129, 0.9), rgba(168, 85, 247, 0.9), rgba(147, 51, 234, 0.9))",
  
  // Shimmer effect
  shimmer: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
} as const;

export const radialGradients = {
  // Floating orb gradients
  purpleOrb: "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(168, 85, 247, 0.1) 70%, transparent 100%)",
  greenOrb: "radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, rgba(34, 197, 94, 0.1) 70%, transparent 100%)",
  whiteOrb: "radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.05) 70%, transparent 100%)",
  
  // Subtle orbs for cards
  purpleOrbSubtle: "radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
  greenOrbSubtle: "radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 50%)",
  orangeOrbSubtle: "radial-gradient(circle, rgba(251, 146, 60, 0.05) 0%, transparent 50%)",
} as const;

export const backgroundPatterns = {
  // Main app background
  appBackground: `
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.3), transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(147, 51, 234, 0.2), transparent 50%),
    linear-gradient(135deg, #0F0F23 0%, #1A0B2E 25%, #2D1B3D 50%, #1E293B 75%, #0F172A 100%)
  `,
  
  // Card backgrounds
  cardDarkBackground: `
    linear-gradient(135deg,
      rgba(8, 8, 15, 0.98) 0%,
      rgba(15, 12, 25, 0.96) 25%,
      rgba(12, 8, 20, 0.98) 50%,
      rgba(18, 15, 30, 0.96) 75%,
      rgba(10, 8, 18, 0.98) 100%
    ),
    radial-gradient(ellipse at top right,
      rgba(0, 200, 255, 0.03) 0%,
      transparent 50%
    ),
    radial-gradient(ellipse at bottom left,
      rgba(255, 0, 128, 0.03) 0%,
      transparent 50%
    )
  `,
} as const;

export type LiquidGradient = keyof typeof liquidGradients;
export type RadialGradient = keyof typeof radialGradients;
export type BackgroundPattern = keyof typeof backgroundPatterns;