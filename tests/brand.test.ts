import { describe, expect, test } from "bun:test";
import {
  DEFAULT_BRAND_KIT,
  DEFAULT_CAPTION_STYLE,
  brandToAssOptions,
  hexToAssColour,
  migrateBrandKit,
  resolvePlatformPreset,
} from "../src/index";

describe("brand kit v2", () => {
  test("migrateBrandKit fills fonts + caption from legacy fields", () => {
    const kit = migrateBrandKit({
      channelName: "Acme",
      primaryColor: "#ff0000",
      secondaryColor: "#eeeeee",
      backgroundColor: "#111111",
      fontDisplay: "bebas-neue",
      fontBody: "inter",
    });
    expect(kit.fonts?.heading).toBe("bebas-neue");
    expect(kit.fonts?.body).toBe("inter");
    expect(kit.fonts?.caption).toBeTruthy();
    expect(kit.caption?.highlightColor).toBe("#ff0000");
    expect(kit.caption?.color).toBe("#eeeeee");
    expect(kit.id).toBeTruthy();
  });

  test("brandToAssOptions maps caption style", () => {
    const kit = migrateBrandKit({
      ...DEFAULT_BRAND_KIT,
      caption: {
        ...DEFAULT_CAPTION_STYLE,
        fontSize: 72,
        color: "#ffffff",
      },
    });
    const ass = brandToAssOptions(kit, 1080, 1920);
    expect(ass.fontSize).toBe(72);
    expect(ass.width).toBe(1080);
    expect(ass.height).toBe(1920);
    expect(ass.primaryColour).toBe(hexToAssColour("#ffffff"));
  });

  test("hexToAssColour converts hex", () => {
    expect(hexToAssColour("#ffffff")).toMatch(/^&H/i);
    expect(hexToAssColour("#000000")).toMatch(/^&H/i);
  });

  test("resolvePlatformPreset maps creator labels", () => {
    expect(resolvePlatformPreset("TikTok")).toBe("tiktok");
    expect(resolvePlatformPreset("YouTube Shorts")).toBe("youtube-shorts");
    expect(resolvePlatformPreset("youtube")).toBe("youtube");
  });
});
