/**
 * Avatar generation service using DiceBear API
 * Provides multiple styles and customization options for agent avatars
 */

export const ALL_AVATAR_STYLES = [
  "adventurer",
  "adventurer-neutral",
  "avataaars",
  "avataaars-neutral",
  "big-ears",
  "big-ears-neutral",
  "big-smile",
  "bottts",
  "bottts-neutral",
  "croodles",
  "croodles-neutral",
  "fun-emoji",
  "icons",
  "identicon",
  "initials",
  "lorelei",
  "lorelei-neutral",
  "micah",
  "miniavs",
  "notionists",
  "notionists-neutral",
  "open-peeps",
  "personas",
  "pixel-art",
  "pixel-art-neutral",
  "rings",
  "shapes",
  "thumbs",
] as const;

export type AvatarStyle = (typeof ALL_AVATAR_STYLES)[number];

export interface AvatarOptions {
  seed?: string;
  style?: AvatarStyle;
  size?: number;
  backgroundColor?: string;
  // Style-specific options
  accessories?: string[];
  clothing?: string;
  eyes?: string;
  eyebrows?: string;
  mouth?: string;
  hair?: string;
  facialHair?: string;
  skinColor?: string;
  hairColor?: string;
  clothingColor?: string;
  accessoriesColor?: string;
  flip?: boolean;
  rotate?: number;
  scale?: number;
  radius?: number;
  backgroundType?: "solid" | "gradientLinear";
}

export class AvatarGenerator {
  private static BASE_URL = "https://api.dicebear.com/9.x";

  /**
   * Generate an avatar URL with the given options
   */
  static generateUrl(options: AvatarOptions = {}): string {
    const {
      seed = Math.random().toString(36).substring(7),
      style = "avataaars",
      size = 128,
      backgroundColor,
      ...styleOptions
    } = options;

    const params = new URLSearchParams();

    // Add seed for deterministic generation
    params.append("seed", seed);

    // Add size
    params.append("size", size.toString());

    // Add background color if specified
    if (backgroundColor) {
      params.append("backgroundColor", backgroundColor.replace("#", ""));
    }

    // Add style-specific options
    Object.entries(styleOptions).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          params.append(key, value.join(","));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    return `${this.BASE_URL}/${style}/svg?${params.toString()}`;
  }

  /**
   * Generate multiple avatar variations for selection
   */
  static generateVariations(
    baseSeed: string,
    count: number = 4,
    style?: AvatarStyle
  ): string[] {
    const variations: string[] = [];

    for (let i = 0; i < count; i++) {
      const seed = `${baseSeed}-variation-${i}`;
      variations.push(
        this.generateUrl({
          seed,
          style,
          size: 128,
        })
      );
    }

    return variations;
  }

  /**
   * Get a random style from available styles
   */
  static getRandomStyle(): AvatarStyle {
    const styles = ALL_AVATAR_STYLES as unknown as AvatarStyle[];
    return styles[Math.floor(Math.random() * styles.length)];
  }

  /**
   * Generate avatar with random customization
   */
  static generateRandom(style?: AvatarStyle): string {
    const selectedStyle = style || this.getRandomStyle();
    const seed = Math.random().toString(36).substring(2, 15);

    // Random background colors (soft pastels)
    const backgroundColors = [
      "b6e3f4", // Light blue
      "c0aede", // Light purple
      "d1f2eb", // Light mint
      "ffd5dc", // Light pink
      "fff9c4", // Light yellow
      "e8f5e9", // Light green
    ];

    const backgroundColor =
      backgroundColors[Math.floor(Math.random() * backgroundColors.length)];

    return this.generateUrl({
      seed,
      style: selectedStyle,
      backgroundColor,
      size: 256,
    });
  }

  /**
   * Style presets for quick avatar generation
   */
  static presets = {
    professional: (seed: string) =>
      AvatarGenerator.generateUrl({
        seed,
        style: "avataaars",
        backgroundColor: "e3f2fd",
        size: 256,
      }),

    friendly: (seed: string) =>
      AvatarGenerator.generateUrl({
        seed,
        style: "personas",
        backgroundColor: "fff9c4",
        size: 256,
      }),

    tech: (seed: string) =>
      AvatarGenerator.generateUrl({
        seed,
        style: "bottts",
        backgroundColor: "f3e5f5",
        size: 256,
      }),

    creative: (seed: string) =>
      AvatarGenerator.generateUrl({
        seed,
        style: "adventurer",
        backgroundColor: "e8f5e9",
        size: 256,
      }),

    minimal: (seed: string) =>
      AvatarGenerator.generateUrl({
        seed,
        style: "notionists",
        backgroundColor: "fafafa",
        size: 256,
      }),
  };
}

/**
 * Get style metadata for UI display
 */
export const avatarStyles: ReadonlyArray<{
  value: AvatarStyle;
  label: string;
  description: string;
}> = ALL_AVATAR_STYLES.map((style) => {
  const label = style
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
  let description = "Avatar style";
  if (style.includes("pixel")) description = "8-bit style";
  if (style.includes("bottts")) description = "Robot avatars";
  if (style.includes("notionists")) description = "Notion-style avatars";
  if (style.includes("adventurer")) description = "Adventure-themed";
  if (style.includes("lorelei")) description = "Minimalist faces";
  if (style.includes("avataaars")) description = "Cartoon-style avatars";
  if (style.includes("thumbs")) description = "Thumbs up avatars";
  return { value: style as AvatarStyle, label, description };
});

/**
 * Clear param definitions for each style that an agent/UI can surface.
 * Note: DiceBear v9 HTTP API supports style-specific options via query string.
 * We expose a curated, stable subset that is safe across styles.
 */
export type AvatarParamType =
  | "string"
  | "number"
  | "boolean"
  | "color"
  | "select"
  | "multiselect";

export interface AvatarParamDefinition {
  key: string;
  label: string;
  type: AvatarParamType;
  values?: string[]; // for select/multiselect
  min?: number;
  max?: number;
  step?: number;
}

export const commonAvatarParams: AvatarParamDefinition[] = [
  { key: "seed", label: "Seed", type: "string" },
  { key: "size", label: "Size", type: "number", min: 32, max: 512, step: 32 },
  { key: "backgroundColor", label: "Background Color", type: "color" },
  { key: "flip", label: "Flip", type: "boolean" },
  {
    key: "rotate",
    label: "Rotate",
    type: "number",
    min: -180,
    max: 180,
    step: 1,
  },
  { key: "scale", label: "Scale", type: "number", min: 50, max: 200, step: 1 },
  {
    key: "radius",
    label: "Corner Radius",
    type: "number",
    min: 0,
    max: 50,
    step: 1,
  },
];

/**
 * Minimal, style-specific param suggestions.
 * This does not attempt to be exhaustive; it gives the agent/UI a clear surface.
 */
export const avatarStyleParamDefinitions: Record<
  AvatarStyle,
  AvatarParamDefinition[]
> = {
  avataaars: [
    { key: "eyes", label: "Eyes", type: "select" },
    { key: "eyebrows", label: "Eyebrows", type: "select" },
    { key: "mouth", label: "Mouth", type: "select" },
    { key: "hair", label: "Hair", type: "select" },
    { key: "facialHair", label: "Facial Hair", type: "select" },
    { key: "accessories", label: "Accessories", type: "multiselect" },
    { key: "skinColor", label: "Skin Color", type: "color" },
    { key: "hairColor", label: "Hair Color", type: "color" },
    { key: "clothing", label: "Clothing", type: "select" },
    { key: "clothingColor", label: "Clothing Color", type: "color" },
    { key: "accessoriesColor", label: "Accessories Color", type: "color" },
  ],
  "avataaars-neutral": [],
  bottts: [
    { key: "eyes", label: "Eyes", type: "select" },
    { key: "mouth", label: "Mouth", type: "select" },
    { key: "colors", label: "Colors", type: "multiselect" },
  ],
  "bottts-neutral": [],
  personas: [
    { key: "eyes", label: "Eyes", type: "select" },
    { key: "mouth", label: "Mouth", type: "select" },
    { key: "hair", label: "Hair", type: "select" },
  ],
  adventurer: [
    { key: "eyes", label: "Eyes", type: "select" },
    { key: "mouth", label: "Mouth", type: "select" },
    { key: "hair", label: "Hair", type: "select" },
    { key: "skinColor", label: "Skin Color", type: "color" },
  ],
  "adventurer-neutral": [],
  lorelei: [{ key: "flip", label: "Flip", type: "boolean" }],
  "lorelei-neutral": [{ key: "flip", label: "Flip", type: "boolean" }],
  notionists: [{ key: "flip", label: "Flip", type: "boolean" }],
  "notionists-neutral": [{ key: "flip", label: "Flip", type: "boolean" }],
  "pixel-art": [
    { key: "hair", label: "Hair", type: "multiselect" },
    { key: "eyes", label: "Eyes", type: "select" },
    { key: "mouth", label: "Mouth", type: "select" },
  ],
  "pixel-art-neutral": [],
  "big-ears": [],
  "big-ears-neutral": [],
  "big-smile": [],
  croodles: [],
  "croodles-neutral": [],
  "fun-emoji": [],
  icons: [],
  identicon: [],
  initials: [],
  micah: [],
  miniavs: [],
  "open-peeps": [],
  rings: [],
  shapes: [],
  thumbs: [{ key: "flip", label: "Flip", type: "boolean" }],
};

/**
 * Get the merged param definitions for a given style
 */
export function getParamsForStyle(style: AvatarStyle): AvatarParamDefinition[] {
  return [...commonAvatarParams, ...(avatarStyleParamDefinitions[style] || [])];
}

/**
 * Helper to get initials from a name (fallback)
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
