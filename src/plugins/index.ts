/**
 * cinematype plugins — export packs for CapCut, YouTube, FFmpeg, Remotion, etc.
 */

export type {
  PluginId,
  PluginContext,
  PluginExportFile,
  PluginResult,
  CinematypePlugin,
} from "./types";

export {
  PLUGIN_REGISTRY,
  listPlugins,
  getPlugin,
  runPlugin,
  downloadPluginPack,
} from "./registry";

export { ffmpegPlugin } from "./ffmpeg";
export { capcutPlugin } from "./capcut";
export {
  youtubePlugin,
  cuesToYoutubeChapters,
  youtubeDescription,
} from "./youtube";
export { tiktokPlugin, reelsPlugin } from "./tiktok";
export {
  premierePlugin,
  davinciPlugin,
  cuesToMarkerCsv,
} from "./premiere";
export {
  whisperPlugin,
  whisperJsonToCues,
  type WhisperSegment,
  type WhisperVerboseJson,
} from "./whisper";
export {
  remotionPlugin,
  cuesToRemotionSequence,
  type RemotionCaptionSequence,
} from "./remotion";
export { obsPlugin } from "./obs";
