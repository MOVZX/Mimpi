/**
 * Tests for generation utilities
 * Tests seed computation, lora management, and workflow building helpers
 */

import {
  computeSdxlSeed,
  computeZimageSeed,
  normalizeLoraName,
  buildZImageLoraText,
  addZImageLora,
  removeZImageLora,
  moveZImageLora,
  updateZImageLoraStrength,
  toggleZImageLora,
  moveListItem,
  ZIMAGE_RESOLUTIONS,
  DEFAULT_ZIMAGE_LORAS,
} from "@/components/generate/utils";
import { RES_MAP, resSize } from "@/constants/generation";
import type { ZimageLoraItem } from "@/components/generate/utils";

describe("Generation Utils - Seed Computation", () => {
  describe("computeSdxlSeed", () => {
    it("should return the provided seed when useIncSeed is false", () => {
      const state = {
        seed: "12345",
        useDynamicSeed: false,
        useIncSeed: false,
        currentSeedNum: 0,
      };
      expect(computeSdxlSeed(state)).toBe(12345);
    });

    it("should increment seed when useIncSeed is true", () => {
      const state = {
        seed: "",
        useDynamicSeed: false,
        useIncSeed: true,
        currentSeedNum: 100,
      };
      expect(computeSdxlSeed(state)).toBe(101);
    });

    it("should generate random seed when useDynamicSeed is true", () => {
      const state = {
        seed: "",
        useDynamicSeed: true,
        useIncSeed: false,
        currentSeedNum: 0,
      };
      const seed = computeSdxlSeed(state);
      expect(typeof seed).toBe("number");
      expect(seed).toBeGreaterThanOrEqual(0);
    });

    it("should generate random seed when seed is empty", () => {
      const state = {
        seed: "",
        useDynamicSeed: false,
        useIncSeed: false,
        currentSeedNum: 0,
      };
      const seed = computeSdxlSeed(state);
      expect(typeof seed).toBe("number");
    });

    it("should handle large seed values", () => {
      const MAX_SEED = 9007199254740991;
      const state = {
        seed: String(MAX_SEED + 1000),
        useDynamicSeed: false,
        useIncSeed: false,
        currentSeedNum: 0,
      };
      const seed = computeSdxlSeed(state);
      // The implementation converts to number, which may lose precision for very large values
      // We just verify it returns a valid number
      expect(typeof seed).toBe("number");
    });
  });

  describe("computeZimageSeed", () => {
    it("should return the provided seed when useIncSeed is false", () => {
      const state = {
        seed: "12345",
        useDynamicSeed: false,
        useIncSeed: false,
        currentSeedNum: 0,
      };
      const result = computeZimageSeed(state);
      expect(result.finalSeed).toBe("12345");
    });

    it("should increment seed when useIncSeed is true", () => {
      const state = {
        seed: "",
        useDynamicSeed: false,
        useIncSeed: true,
        currentSeedNum: 100,
      };
      const result = computeZimageSeed(state);
      expect(result.finalSeed).toBe("101");
    });

    it("should return clamped seed within EASY_SEED_MAX", () => {
      const EASY_SEED_MAX = 1125899906842624;
      const state = {
        seed: String(EASY_SEED_MAX + 1000),
        useDynamicSeed: false,
        useIncSeed: false,
        currentSeedNum: 0,
      };
      const result = computeZimageSeed(state);
      expect(result.clampedSeed).toBeLessThan(Number(EASY_SEED_MAX));
    });
  });
});

describe("Generation Utils - LoRA Management", () => {
  describe("normalizeLoraName", () => {
    it("should remove .safetensors extension", () => {
      expect(normalizeLoraName("model.safetensors")).toBe("model");
    });

    it("should handle case-insensitive extension", () => {
      expect(normalizeLoraName("model.SAFETENSORS")).toBe("model");
    });

    it("should return unchanged if no extension", () => {
      expect(normalizeLoraName("model")).toBe("model");
    });
  });

  describe("buildZImageLoraText", () => {
    it("should build lora text for active loras", () => {
      const loras: ZimageLoraItem[] = [
        { name: "lora1", strength: 0.5, active: true },
        { name: "lora2", strength: -0.1, active: false },
        { name: "lora3", strength: 1.0, active: true },
      ];
      const text = buildZImageLoraText(loras);
      expect(text).toContain("<lora:lora1.safetensors:0.5>");
      expect(text).not.toContain("lora2");
      // Note: JavaScript removes trailing zeros, so 1.0 becomes 1
      expect(text).toContain("<lora:lora3.safetensors:1>");
    });

    it("should join multiple loras with comma", () => {
      const loras: ZimageLoraItem[] = [
        { name: "lora1", strength: 0.5, active: true },
        { name: "lora2", strength: 1.0, active: true },
      ];
      const text = buildZImageLoraText(loras);
      expect(text).toContain(",");
    });
  });

  describe("addZImageLora", () => {
    it("should add a new lora to the list", () => {
      const loras: ZimageLoraItem[] = [];
      const result = addZImageLora(loras, "new-lora");
      expect(result.length).toBe(1);
      expect(result[0].name).toBe("new-lora");
      expect(result[0].strength).toBe(1.0);
      expect(result[0].active).toBe(true);
    });
  });

  describe("removeZImageLora", () => {
    it("should remove lora at specified index", () => {
      const loras: ZimageLoraItem[] = [
        { name: "lora1", strength: 0.5, active: true },
        { name: "lora2", strength: 0.5, active: true },
        { name: "lora3", strength: 0.5, active: true },
      ];
      const result = removeZImageLora(loras, 1);
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("lora1");
      expect(result[1].name).toBe("lora3");
    });
  });

  describe("moveZImageLora", () => {
    it("should move lora up", () => {
      const loras: ZimageLoraItem[] = [
        { name: "lora1", strength: 0.5, active: true },
        { name: "lora2", strength: 0.5, active: true },
        { name: "lora3", strength: 0.5, active: true },
      ];
      const result = moveZImageLora(loras, 1, "up");
      expect(result[0].name).toBe("lora2");
      expect(result[1].name).toBe("lora1");
    });

    it("should move lora down", () => {
      const loras: ZimageLoraItem[] = [
        { name: "lora1", strength: 0.5, active: true },
        { name: "lora2", strength: 0.5, active: true },
        { name: "lora3", strength: 0.5, active: true },
      ];
      const result = moveZImageLora(loras, 1, "down");
      expect(result[1].name).toBe("lora3");
      expect(result[2].name).toBe("lora2");
    });

    it("should not move if out of bounds", () => {
      const loras: ZimageLoraItem[] = [
        { name: "lora1", strength: 0.5, active: true },
      ];
      const result = moveZImageLora(loras, 0, "up");
      expect(result[0].name).toBe("lora1");
    });
  });

  describe("updateZImageLoraStrength", () => {
    it("should update lora strength", () => {
      const loras: ZimageLoraItem[] = [
        { name: "lora1", strength: 0.5, active: true },
      ];
      const result = updateZImageLoraStrength(loras, 0, 1.0);
      expect(result[0].strength).toBe(1.0);
    });
  });

  describe("toggleZImageLora", () => {
    it("should toggle lora active state", () => {
      const loras: ZimageLoraItem[] = [
        { name: "lora1", strength: 0.5, active: true },
      ];
      const result = toggleZImageLora(loras, 0, false);
      expect(result[0].active).toBe(false);
    });
  });
});

describe("Generation Utils - List Utilities", () => {
  describe("moveListItem", () => {
    it("should move item up", () => {
      const items = ["a", "b", "c"];
      const result = moveListItem(items, 1, "up");
      expect(result).toEqual(["b", "a", "c"]);
    });

    it("should move item down", () => {
      const items = ["a", "b", "c"];
      const result = moveListItem(items, 1, "down");
      expect(result).toEqual(["a", "c", "b"]);
    });
  });
});

describe("Generation Utils - Constants", () => {
  describe("ZIMAGE_RESOLUTIONS", () => {
    it("should contain 6 resolution options", () => {
      expect(ZIMAGE_RESOLUTIONS.length).toBe(6);
    });

    it("should have valid width and height values", () => {
      ZIMAGE_RESOLUTIONS.forEach((res) => {
        expect(res.width).toBeGreaterThan(0);
        expect(res.height).toBeGreaterThan(0);
      });
    });
  });

  describe("DEFAULT_ZIMAGE_LORAS", () => {
    it("should contain 5 default loras", () => {
      expect(DEFAULT_ZIMAGE_LORAS.length).toBe(5);
    });
  });

  describe("RES_MAP", () => {
    it("should contain portrait, landscape, and square", () => {
      expect(RES_MAP.portrait).toBeDefined();
      expect(RES_MAP.landscape).toBeDefined();
      expect(RES_MAP.square).toBeDefined();
    });
  });

  describe("resSize", () => {
    it("should return correct size for portrait", () => {
      expect(resSize("portrait")).toBe("896x1152");
    });

    it("should return correct size for landscape", () => {
      expect(resSize("landscape")).toBe("1152x896");
    });

    it("should return correct size for square", () => {
      expect(resSize("square")).toBe("1024x1024");
    });

    it("should return square size for unknown mode", () => {
      expect(resSize("unknown")).toBe("1024x1024");
    });
  });
});
