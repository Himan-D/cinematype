import { expect, test } from "bun:test";
import {
  RATIOS,
  createTypeScale,
  fluidType,
  typeScaleToCss,
} from "../src/tokens";

test("RATIOS includes major-third", () => {
  expect(RATIOS["major-third"]).toBe(1.25);
});

test("createTypeScale grows with step", () => {
  const scale = createTypeScale();
  expect(scale.base.size).toBeLessThan(scale.xl.size);
  expect(scale.xl.size).toBeLessThan(scale["3xl"].size);
});

test("typeScaleToCss emits root custom properties", () => {
  const css = typeScaleToCss();
  expect(css).toContain(":root");
  expect(css).toContain("--ct-text-base");
});

test("fluidType returns clamp()", () => {
  expect(fluidType()).toMatch(/^clamp\(/);
});
