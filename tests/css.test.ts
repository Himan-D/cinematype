import { expect, test } from "bun:test";
import { generateFontFaceCss, generateFontUtilityCss } from "../src/fonts";

test("generateFontFaceCss includes @font-face and Inter", () => {
  const css = generateFontFaceCss({ resolveUrl: "relative", relativePrefix: "../" });
  expect(css).toContain("@font-face");
  expect(css).toContain("Inter");
  expect(css).toContain(".woff2");
});

test("generateFontUtilityCss includes utility classes", () => {
  const css = generateFontUtilityCss();
  expect(css).toContain(".ct-font-inter");
  expect(css).toContain(".ct-display");
});
