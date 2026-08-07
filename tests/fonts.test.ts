import { expect, test } from "bun:test";
import {
  FONT_CATALOG,
  ROLE_DEFAULTS,
  fontStack,
  fontsByRole,
  fontsForUseCase,
  getFont,
  listFonts,
} from "../src/fonts";

test("listFonts returns the full creator catalog", () => {
  expect(listFonts().length).toBeGreaterThanOrEqual(18);
  expect(Object.keys(FONT_CATALOG).length).toBe(listFonts().length);
});

test("getFont resolves catalog entries", () => {
  expect(getFont("inter").family).toBe("Inter");
  expect(getFont("bebas-neue").role).toBe("impact");
  expect(getFont("caveat").role).toBe("script");
  expect(() => getFont("nope")).toThrow(/Unknown font/);
});

test("fontStack includes family and fallbacks", () => {
  const stack = fontStack("playfair-display");
  expect(stack).toContain("Playfair Display");
  expect(stack).toContain("serif");
});

test("fontsByRole filters impact faces", () => {
  const impact = fontsByRole("impact");
  expect(impact.length).toBeGreaterThan(0);
  expect(impact.every((f) => f.role === "impact")).toBe(true);
});

test("ROLE_DEFAULTS maps body to inter and impact to bebas-neue", () => {
  expect(ROLE_DEFAULTS.body).toBe("inter");
  expect(ROLE_DEFAULTS.impact).toBe("bebas-neue");
  expect(ROLE_DEFAULTS.script).toBe("caveat");
});

test("fontsForUseCase finds thumbnail fonts", () => {
  const hits = fontsForUseCase("thumbnail");
  expect(hits.some((f) => f.id === "bebas-neue")).toBe(true);
});
