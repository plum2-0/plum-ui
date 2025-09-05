import {
  AvatarGenerator,
  avatarStyles,
  ALL_AVATAR_STYLES,
  type AvatarStyle,
} from "./avatar";

describe("AvatarGenerator", () => {
  describe("generateUrl", () => {
    it("should generate a basic avatar URL with default parameters", () => {
      const url = AvatarGenerator.generateUrl({
        seed: "TestAgent",
        style: "avataaars",
        size: 256,
      });

      expect(url).toContain("https://api.dicebear.com/9.x/avataaars/svg");
      expect(url).toContain("seed=TestAgent");
      expect(url).toContain("size=256");
    });

    it("should generate URL with custom background color", () => {
      const url = AvatarGenerator.generateUrl({
        seed: "TestAgent",
        style: "bottts",
        backgroundColor: "#ff0000",
      });

      expect(url).toContain("backgroundColor=ff0000");
      expect(url).not.toContain("#");
    });

    it("should handle array parameters correctly", () => {
      const url = AvatarGenerator.generateUrl({
        seed: "TestAgent",
        style: "avataaars",
        accessories: ["glasses", "hat"],
      });

      expect(url).toContain("accessories=glasses%2Chat");
    });

    it("should use random seed when not provided", () => {
      const url = AvatarGenerator.generateUrl({
        style: "personas",
      });

      expect(url).toContain("seed=");
      expect(url).toContain("https://api.dicebear.com/9.x/personas/svg");
    });
  });

  describe("generateVariations", () => {
    it("should generate multiple variations with different seeds", () => {
      const variations = AvatarGenerator.generateVariations(
        "BaseAgent",
        4,
        "avataaars"
      );

      expect(variations).toHaveLength(4);
      expect(variations[0]).toContain("seed=BaseAgent-variation-0");
      expect(variations[1]).toContain("seed=BaseAgent-variation-1");
      expect(variations[2]).toContain("seed=BaseAgent-variation-2");
      expect(variations[3]).toContain("seed=BaseAgent-variation-3");
    });

    it("should use the specified style for all variations", () => {
      const variations = AvatarGenerator.generateVariations(
        "Agent",
        3,
        "bottts"
      );

      variations.forEach((url) => {
        expect(url).toContain("/bottts/svg");
      });
    });
  });

  describe("getRandomStyle", () => {
    it("should return a valid style", () => {
      const validStyles = ALL_AVATAR_STYLES as unknown as AvatarStyle[];
      const style = AvatarGenerator.getRandomStyle();
      expect(validStyles).toContain(style);
    });
  });

  describe("generateRandom", () => {
    it("should generate a random avatar with random style and background", () => {
      const url = AvatarGenerator.generateRandom();

      expect(url).toContain("https://api.dicebear.com/9.x/");
      expect(url).toContain("seed=");
      expect(url).toContain("backgroundColor=");
      expect(url).toContain("size=256");
    });

    it("should use specified style when provided", () => {
      const url = AvatarGenerator.generateRandom("pixel-art");

      expect(url).toContain("/pixel-art/svg");
    });
  });

  describe("presets", () => {
    it("should generate professional preset with correct style", () => {
      const url = AvatarGenerator.presets.professional("JohnDoe");

      expect(url).toContain("/avataaars/svg");
      expect(url).toContain("seed=JohnDoe");
      expect(url).toContain("backgroundColor=e3f2fd");
    });

    it("should generate friendly preset with correct style", () => {
      const url = AvatarGenerator.presets.friendly("JaneSmith");

      expect(url).toContain("/personas/svg");
      expect(url).toContain("seed=JaneSmith");
      expect(url).toContain("backgroundColor=fff9c4");
    });

    it("should generate tech preset with correct style", () => {
      const url = AvatarGenerator.presets.tech("TechBot");

      expect(url).toContain("/bottts/svg");
      expect(url).toContain("seed=TechBot");
      expect(url).toContain("backgroundColor=f3e5f5");
    });

    it("should generate creative preset with correct style", () => {
      const url = AvatarGenerator.presets.creative("ArtistBot");

      expect(url).toContain("/adventurer/svg");
      expect(url).toContain("seed=ArtistBot");
      expect(url).toContain("backgroundColor=e8f5e9");
    });

    it("should generate minimal preset with correct style", () => {
      const url = AvatarGenerator.presets.minimal("SimpleBot");

      expect(url).toContain("/notionists/svg");
      expect(url).toContain("seed=SimpleBot");
      expect(url).toContain("backgroundColor=fafafa");
    });
  });

  describe("avatarStyles metadata", () => {
    it("should have correct number of styles", () => {
      expect(avatarStyles).toHaveLength(ALL_AVATAR_STYLES.length);
    });

    it("should have proper structure for each style", () => {
      avatarStyles.forEach((style) => {
        expect(style).toHaveProperty("value");
        expect(style).toHaveProperty("label");
        expect(style).toHaveProperty("description");
        expect(typeof style.value).toBe("string");
        expect(typeof style.label).toBe("string");
        expect(typeof style.description).toBe("string");
      });
    });

    it("should include all expected styles", () => {
      const styleValues = avatarStyles.map((s) => s.value);
      expect(styleValues).toContain("avataaars");
      expect(styleValues).toContain("bottts");
      expect(styleValues).toContain("personas");
      expect(styleValues).toContain("adventurer");
    });
  });

  describe("spot check variations logging", () => {
    it("should log 16 variations across the first 8 styles (2 each)", () => {
      const results: Array<{ style: string; index: number; url: string }> = [];

      avatarStyles.slice(0, 8).forEach((s) => {
        const variations = AvatarGenerator.generateVariations(
          `Spot-${s.value}`,
          2,
          s.value as AvatarStyle
        );
        variations.forEach((url, idx) => {
          results.push({ style: s.value, index: idx, url });
        });
      });

      expect(results).toHaveLength(16);

      // Log with separators for manual spot check
      console.log("\n===== SPOT CHECK AVATARS START =====");
      results.forEach((r, i) => {
        console.log(
          `\n--- [${i + 1}/16] style=${r.style} variation=${r.index} ---\n${
            r.url
          }\n`
        );
      });
      console.log("===== SPOT CHECK AVATARS END =====\n");

      // Basic style presence check
      results.forEach((r) => {
        expect(r.url).toContain(`/${r.style}/svg`);
      });
    });
  });
});

describe("getInitials", () => {
  it("should extract initials from a single word", () => {
    const { getInitials } = require("./avatar");
    expect(getInitials("John")).toBe("J");
  });

  it("should extract initials from multiple words", () => {
    const { getInitials } = require("./avatar");
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("should limit to 2 characters", () => {
    const { getInitials } = require("./avatar");
    expect(getInitials("John Michael Doe")).toBe("JM");
  });

  it("should handle empty string", () => {
    const { getInitials } = require("./avatar");
    expect(getInitials("")).toBe("");
  });

  it("should convert to uppercase", () => {
    const { getInitials } = require("./avatar");
    expect(getInitials("john doe")).toBe("JD");
  });
});
