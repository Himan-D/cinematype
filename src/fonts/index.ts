export {
  FONT_CATALOG,
  ROLE_DEFAULTS,
  getFont,
  listFonts,
  fontsByRole,
  fontStack,
  fontsForUseCase,
  type FontAxis,
  type FontFaceFile,
  type FontFamily,
  type FontId,
  type FontRole,
} from "./catalog";

export {
  generateFontFaceCss,
  generateFontUtilityCss,
  type FontFaceCssOptions,
} from "./css";

export {
  loadFonts,
  injectFontCss,
  applyFont,
  applyFontVariables,
  isCssInjected,
  isFontAvailable,
  prefersReducedMotion,
  type FontLoadStatus,
  type LoadFontsOptions,
  type FontLoadResult,
} from "./loader";
