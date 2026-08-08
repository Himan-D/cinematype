export {
  cuesToVtt,
  attachCaptions,
  createVideoOverlay,
  type CaptionCue,
  type CaptionStyleId,
  type CaptionTrackOptions,
  type OverlayOptions,
  type OverlayController,
} from "./captions";

export {
  renderTextFrame,
  renderCueSequence,
  paintVideoCaptions,
  type CanvasTextOptions,
  type SequenceOptions,
  type TextFrame,
} from "./canvas";

export {
  cuesToSrt,
  cuesToAss,
  parseSrt,
  formatSrtTime,
  hexToAssColour,
  type AssOptions,
} from "./formats";

export {
  FRAME_SIZES,
  listFrameSizes,
  getFrameSize,
  framePixels,
  PLATFORM_PRESETS,
  listPlatformPresets,
  resolvePlatformPreset,
  type AspectId,
  type FrameSize,
} from "./aspects";

export {
  exportSubtitles,
  downloadSubtitles,
  canvasToBlob,
  canvasToDataURL,
  downloadCanvas,
  downloadBlob,
  downloadCuePngSequence,
  subtitleMime,
  subtitleExtension,
  type SubtitleFormat,
} from "./export";

export {
  TITLE_CARD_PRESETS,
  CREATOR_TEMPLATES,
  listTitleCardPresets,
  getTitleCardPreset,
  renderTitleCard,
  listCreatorTemplates,
  getCreatorTemplate,
  type TitleCardPreset,
  type CreatorTemplate,
} from "./presets";

export {
  transcriptToCues,
  retimeCues,
  wordsToKaraokeCues,
  type TranscriptOptions,
} from "./transcript";

export {
  DEFAULT_BRAND_KIT,
  DEFAULT_CAPTION_STYLE,
  saveBrandKit,
  loadBrandKit,
  clearBrandKit,
  listBrandKits,
  saveBrandKits,
  getActiveBrandKit,
  setActiveBrandKit,
  upsertBrandKit,
  deleteBrandKit,
  migrateBrandKit,
  brandOverlayOptions,
  brandToAssOptions,
  applyBrandToCues,
  brandToCssVars,
  applyBrandCssVars,
  type BrandKit,
  type CaptionStyle,
  type CaptionAnimation,
} from "./brand";

export {
  createProject,
  serializeProject,
  parseProject,
  downloadProject,
  isCinematypeProject,
  type CinematypeProject,
  type CreateProjectInput,
} from "./project";

export {
  ffmpegBurnInCommand,
  ffmpegTitleCardCommand,
  ffmpegRecipe,
  type FfmpegBurnOptions,
  type FfmpegTitleCardOptions,
} from "./ffmpeg";

export {
  getSafeZone,
  safeZoneRect,
  drawSafeZone,
  safeZoneStyle,
  type SafeZone,
} from "./safezone";

export {
  updateCue,
  removeCue,
  addCue,
  shiftCues,
  normalizeCues,
  splitCue,
  mergeCues,
} from "./cues-edit";
