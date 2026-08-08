import { afterEach, expect, test } from "bun:test";
import {
  DEFAULT_BRAND_KIT,
  DEFAULT_CAPTION_STYLE,
  brandToAssOptions,
  clearBrandKit,
  getActiveBrandKit,
  hexToAssColour,
  listBrandKits,
  loadBrandKit,
  migrateBrandKit,
  saveBrandKit,
  setActiveBrandKit,
  upsertBrandKit,
} from "../src/video";

const LEGACY_KEY = "cinematype:brand-kit";
const KITS_KEY = "cinematype:brand-kits";

afterEach(() => {
  clearBrandKit();
});

test("migrateBrandKit fills fonts and caption from legacy flat fields", () => {
  const kit = migrateBrandKit({
    channelName: "Legacy",
    primaryColor: "#ff0000",
    secondaryColor: "#00ff00",
    backgroundColor: "#000000",
    fontDisplay: "anton",
    fontBody: "inter",
  });
  expect(kit.fonts?.heading).toBe("anton");
  expect(kit.fonts?.body).toBe("inter");
  expect(kit.fonts?.caption).toBe("inter");
  expect(kit.caption?.color).toBe("#00ff00");
  expect(kit.caption?.highlightColor).toBe("#ff0000");
  expect(kit.caption?.fontFamily).toBe("inter");
  expect(kit.id).toBeTruthy();
});

test("DEFAULT_CAPTION_STYLE matches burn/subtitle defaults", () => {
  expect(DEFAULT_CAPTION_STYLE.fontSize).toBe(56);
  expect(DEFAULT_CAPTION_STYLE.position).toBe("bottom");
  expect(DEFAULT_CAPTION_STYLE.animation).toBe("fade");
});

test("loadBrandKit migrates legacy single-kit storage", () => {
  if (typeof localStorage === "undefined") return;
  clearBrandKit();
  localStorage.setItem(
    LEGACY_KEY,
    JSON.stringify({
      channelName: "Old Kit",
      primaryColor: "#abcdef",
      secondaryColor: "#ffffff",
      backgroundColor: "#111111",
      fontDisplay: "bebas-neue",
      fontBody: "dm-sans",
    }),
  );
  localStorage.removeItem(KITS_KEY);

  const kit = loadBrandKit();
  expect(kit.channelName).toBe("Old Kit");
  expect(kit.fonts?.heading).toBe("bebas-neue");
  expect(listBrandKits().length).toBe(1);
  expect(localStorage.getItem(KITS_KEY)).toBeTruthy();
});

test("multi-kit upsert and setActiveBrandKit", () => {
  if (typeof localStorage === "undefined") return;
  clearBrandKit();
  const a = upsertBrandKit({
    ...DEFAULT_BRAND_KIT,
    id: "kit-a",
    name: "A",
    channelName: "Channel A",
  });
  const b = upsertBrandKit({
    ...DEFAULT_BRAND_KIT,
    id: "kit-b",
    name: "B",
    channelName: "Channel B",
  });
  expect(listBrandKits().length).toBeGreaterThanOrEqual(2);
  setActiveBrandKit(b.id!);
  expect(getActiveBrandKit().channelName).toBe("Channel B");
  setActiveBrandKit(a.id!);
  expect(getActiveBrandKit().id).toBe("kit-a");
});

test("saveBrandKit wraps active kit", () => {
  if (typeof localStorage === "undefined") return;
  clearBrandKit();
  saveBrandKit({
    ...DEFAULT_BRAND_KIT,
    channelName: "Saved Active",
    primaryColor: "#112233",
    secondaryColor: "#ffffff",
    backgroundColor: "#000000",
    fontDisplay: "bebas-neue",
    fontBody: "dm-sans",
  });
  expect(getActiveBrandKit().channelName).toBe("Saved Active");
});

test("hexToAssColour converts hex to ASS BGR", () => {
  expect(hexToAssColour("#FFFFFF")).toBe("&H00FFFFFF");
  expect(hexToAssColour("#FF0000")).toBe("&H000000FF");
  expect(hexToAssColour("#00FF00")).toBe("&H0000FF00");
  expect(hexToAssColour("#0000FF")).toBe("&H00FF0000");
  expect(hexToAssColour("#abc")).toBe("&H00CCBBAA");
});

test("brandToAssOptions maps CaptionStyle", () => {
  const opts = brandToAssOptions(
    migrateBrandKit({
      ...DEFAULT_BRAND_KIT,
      channelName: "ASS Channel",
      caption: {
        ...DEFAULT_CAPTION_STYLE,
        fontSize: 72,
        color: "#FFAA00",
        fontFamily: "anton",
      },
    }),
    1080,
    1920,
  );
  expect(opts.title).toBe("ASS Channel");
  expect(opts.fontSize).toBe(72);
  expect(opts.width).toBe(1080);
  expect(opts.height).toBe(1920);
  expect(opts.primaryColour).toBe(hexToAssColour("#FFAA00"));
  expect(opts.fontName?.toLowerCase()).toContain("anton");
});
