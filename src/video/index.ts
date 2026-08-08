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
  PLATFORM_CAPTION_DEFAULTS,
  getPlatformCaptionDefaults,
  type AspectId,
  type FrameSize,
  type PlatformCaptionDefaults,
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
  wordsToKaraokeWordCues,
  wordsToAssKaraokeLine,
  type TranscriptOptions,
} from "./transcript";

export {
  detectEmphasis,
  applyEmphasisMarkers,
  emphasizeCues,
  cueWpm,
  validateReadingSpeed,
  scoreCaptionQuality,
  smartRetime,
  type EmphasisSpan,
  type ReadingSpeedIssue,
  type CaptionQualityReport,
} from "./smart";

export {
  batchExportFormats,
  type BatchExportItem,
  type BatchExportOptions,
} from "./batch";

export {
  suggestAutoStyle,
  applyAutoStyle,
  detectLanguage,
  isRtlLanguage,
  localizeCues,
  qualityGate,
  type AutoStyleSuggestion,
  type CaptionLanguage,
} from "./auto-style";

export {
  planLocalWhisper,
  runLocalWhisper,
  type LocalWhisperOptions,
  type LocalWhisperPlan,
} from "./whisper-local";

export {
  registerCreatorTemplate,
  unregisterCreatorTemplate,
  listCommunityTemplates,
  listAllCreatorTemplates,
  getAnyCreatorTemplate,
  registerTitleCardPreset,
  listAllTitleCardPresets,
  seedCommunityExamples,
} from "./community";

export {
  createTeamBrandPack,
  serializeTeamBrandPack,
  parseTeamBrandPack,
  importTeamBrandPack,
  type TeamBrandPack,
} from "./team";

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
