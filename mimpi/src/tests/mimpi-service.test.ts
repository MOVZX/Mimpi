/**
 * Tests for Mimpi API service functions
 * Tests URL generation and data transformation functions
 */

import { getImageUrl, getThumbnailUrl, getGalleryUrl } from "@/services/mimpi";
import type { GalleryItem, GalleryResponse, Stats } from "@/types";

describe("Mimpi Service - URL Generation", () => {
  describe("getImageUrl", () => {
    it("should generate correct image URL", () => {
      const url = getImageUrl("test.png");
      expect(url).toBe("/api/view?filename=test.png&subfolder=&type=output");
    });

    it("should encode filename", () => {
      const url = getImageUrl("test file.png");
      expect(url).toContain("filename=test%20file.png");
    });

    it("should include subfolder", () => {
      const url = getImageUrl("test.png", "my-gallery");
      expect(url).toContain("subfolder=my-gallery");
    });

    it("should encode subfolder", () => {
      const url = getImageUrl("test.png", "my gallery");
      expect(url).toContain("subfolder=my%20gallery");
    });

    it("should include type", () => {
      const url = getImageUrl("test.png", "", "input");
      expect(url).toContain("type=input");
    });

    it("should encode type", () => {
      const url = getImageUrl("test.png", "", "output type");
      expect(url).toContain("type=output%20type");
    });
  });

  describe("getThumbnailUrl", () => {
    it("should use thumbnail if available", () => {
      const item: GalleryItem = {
        id: 1,
        filename: "test.png",
        thumbnail: "test_thumb.webp",
        prompt: "",
        promptNegative: "",
        seed: "",
        checkpoint: "",
        sampler: "",
        scheduler: "",
        steps: 0,
        cfg: 0,
        resolution: "",
        imageMode: "",
        galleryName: "",
        timestamp: new Date().toISOString(),
      };
      const url = getThumbnailUrl(item);
      expect(url).toContain("test_thumb.webp");
    });

    it("should use filename if no thumbnail", () => {
      const item: GalleryItem = {
        id: 1,
        filename: "test.png",
        prompt: "",
        promptNegative: "",
        seed: "",
        checkpoint: "",
        sampler: "",
        scheduler: "",
        steps: 0,
        cfg: 0,
        resolution: "",
        imageMode: "",
        galleryName: "",
        timestamp: new Date().toISOString(),
      };
      const url = getThumbnailUrl(item);
      expect(url).toContain("test.png");
    });

    it("should include gallery name if present", () => {
      const item: GalleryItem = {
        id: 1,
        filename: "test.png",
        prompt: "",
        promptNegative: "",
        seed: "",
        checkpoint: "",
        sampler: "",
        scheduler: "",
        steps: 0,
        cfg: 0,
        resolution: "",
        imageMode: "",
        galleryName: "my-gallery",
        timestamp: new Date().toISOString(),
      };
      const url = getThumbnailUrl(item);
      expect(url).toContain("/api/image/my-gallery/");
    });
  });

  describe("getGalleryUrl", () => {
    it("should generate URL without gallery name", () => {
      const item: GalleryItem = {
        id: 1,
        filename: "test.png",
        prompt: "",
        promptNegative: "",
        seed: "",
        checkpoint: "",
        sampler: "",
        scheduler: "",
        steps: 0,
        cfg: 0,
        resolution: "",
        imageMode: "",
        galleryName: "",
        timestamp: new Date().toISOString(),
      };
      const url = getGalleryUrl(item);
      expect(url).toBe("/api/image/test.png");
    });

    it("should generate URL with gallery name", () => {
      const item: GalleryItem = {
        id: 1,
        filename: "test.png",
        prompt: "",
        promptNegative: "",
        seed: "",
        checkpoint: "",
        sampler: "",
        scheduler: "",
        steps: 0,
        cfg: 0,
        resolution: "",
        imageMode: "",
        galleryName: "my-gallery",
        timestamp: new Date().toISOString(),
      };
      const url = getGalleryUrl(item);
      expect(url).toBe("/api/image/my-gallery/test.png");
    });

    it("should encode special characters in filename", () => {
      const item: GalleryItem = {
        id: 1,
        filename: "test file.png",
        prompt: "",
        promptNegative: "",
        seed: "",
        checkpoint: "",
        sampler: "",
        scheduler: "",
        steps: 0,
        cfg: 0,
        resolution: "",
        imageMode: "",
        galleryName: "",
        timestamp: new Date().toISOString(),
      };
      const url = getGalleryUrl(item);
      expect(url).toContain("test%20file.png");
    });
  });
});

describe("Mimpi Service - Type Definitions", () => {
  describe("GalleryItem", () => {
    it("should have required fields", () => {
      const item: GalleryItem = {
        id: 1,
        filename: "test.png",
        prompt: "test prompt",
        promptNegative: "",
        seed: "",
        checkpoint: "",
        sampler: "",
        scheduler: "",
        steps: 0,
        cfg: 0,
        resolution: "",
        imageMode: "",
        galleryName: "",
        timestamp: new Date().toISOString(),
      };
      expect(item.id).toBe(1);
      expect(item.filename).toBe("test.png");
    });

    it("should allow optional fields", () => {
      const item: GalleryItem = {
        id: 1,
        filename: "test.png",
        prompt: "test prompt",
        promptNegative: "",
        seed: "",
        checkpoint: "",
        sampler: "",
        scheduler: "",
        steps: 0,
        cfg: 0,
        resolution: "",
        imageMode: "",
        galleryName: "",
        timestamp: new Date().toISOString(),
        width: 1024,
        height: 1024,
        storageMode: "local",
      };
      expect(item.width).toBe(1024);
      expect(item.height).toBe(1024);
      expect(item.storageMode).toBe("local");
    });
  });

  describe("GalleryResponse", () => {
    it("should have pagination fields", () => {
      const response: GalleryResponse = {
        items: [],
        total: 100,
        page: 1,
        total_pages: 3,
      };
      expect(response.total).toBe(100);
      expect(response.page).toBe(1);
      expect(response.total_pages).toBe(3);
    });
  });

  describe("Stats", () => {
    it("should have total count", () => {
      const stats: Stats = {
        total: 100,
      };
      expect(stats.total).toBe(100);
    });

    it("should allow optional fields", () => {
      const stats: Stats = {
        total: 100,
        top_models: [{ name: "model1", count: 50 }],
        samplers: [{ name: "euler", count: 30 }],
        monthly: [{ month: "2024-01", count: 25 }],
      };
      expect(stats.top_models).toBeDefined();
      expect(stats.samplers).toBeDefined();
      expect(stats.monthly).toBeDefined();
    });
  });
});
