/**
 * Phase 3 — auto style selection + language helpers.
 */
import type { CaptionCue } from "./captions";
import type { CaptionStyleId } from "./captions";
import type { AspectId } from "./aspects";
import { listCreatorTemplates, type CreatorTemplate } from "./presets";
import { scoreCaptionQuality } from "./smart";

export interface AutoStyleSuggestion {
  templateId: string;
  style: CaptionStyleId;
  aspect: AspectId;
  reason: string;
}

export type CaptionLanguage =
  | "en"
  | "es"
  | "fr"
  | "de"
  | "pt"
  | "hi"
  | "ja"
  | "ko"
  | "zh"
  | "ar"
  | "other";

const RTL: CaptionLanguage[] = ["ar"];

/** Heuristic template/style pick from transcript + platform */
export function suggestAutoStyle(options: {
  transcript: string;
  platform?: AspectId | string;
}): AutoStyleSuggestion {
  const text = options.transcript.toLowerCase();
  const platform = String(options.platform ?? "youtube");
  const short =
    platform.includes("short") ||
    platform.includes("tiktok") ||
    platform.includes("reel");

  if (/podcast|episode|chapter|guest/.test(text)) {
    return {
      templateId: "podcast-markers",
      style: "speaker",
      aspect: "youtube",
      reason: "Podcast / chapter language detected",
    };
  }
  if (/luxury|elegant|atelier|maison|bespoke/.test(text)) {
    return {
      templateId: "luxury-story",
      style: "title",
      aspect: short ? "youtube-shorts" : "youtube",
      reason: "Luxury / brand tone detected",
    };
  }
  if (/step|tutorial|how to|first|second|third/.test(text)) {
    return {
      templateId: "tutorial-captions",
      style: "burn",
      aspect: short ? "youtube-shorts" : "youtube",
      reason: "Tutorial / steps detected",
    };
  }
  if (short || /stop scrolling|hook|viral|shorts/.test(text)) {
    return {
      templateId: "shorts-hook",
      style: "burn",
      aspect: "youtube-shorts",
      reason: "Short-form hook energy",
    };
  }
  return {
    templateId: "youtube-opener",
    style: "subtitle",
    aspect: "youtube",
    reason: "Default long-form opener",
  };
}

export function applyAutoStyle(
  transcript: string,
  platform?: AspectId | string,
): CreatorTemplate {
  const suggestion = suggestAutoStyle({ transcript, platform });
  const templates = listCreatorTemplates();
  const found = templates.find((t) => t.id === suggestion.templateId);
  if (!found) throw new Error(`Template ${suggestion.templateId} missing`);
  return found;
}

/** Very light language guess (Latin / CJK / Arabic) */
export function detectLanguage(text: string): CaptionLanguage {
  if (/[\u0600-\u06FF]/.test(text)) return "ar";
  if (/[\u3040-\u30ff]/.test(text)) return "ja";
  if (/[\uac00-\ud7af]/.test(text)) return "ko";
  if (/[\u4e00-\u9fff]/.test(text)) return "zh";
  if (/[áéíóúñ¿¡]/i.test(text) && /\b(el|la|que|y)\b/i.test(text)) return "es";
  if (/[àâçéèêëîïôùûü]/i.test(text)) return "fr";
  if (/[äöüß]/i.test(text)) return "de";
  if (/[ãõç]/i.test(text)) return "pt";
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  return "en";
}

export function isRtlLanguage(lang: CaptionLanguage): boolean {
  return RTL.includes(lang);
}

/** Attach language metadata onto cues via speaker field prefix when rtl */
export function localizeCues(
  cues: CaptionCue[],
  language: CaptionLanguage,
): CaptionCue[] {
  const rtl = isRtlLanguage(language);
  return cues.map((cue) => ({
    ...cue,
    align: rtl ? "end" : cue.align,
    speaker: cue.speaker ?? (language !== "en" ? language : undefined),
  }));
}

export function qualityGate(
  cues: CaptionCue[],
  minScore = 70,
): { ok: boolean; report: ReturnType<typeof scoreCaptionQuality> } {
  const report = scoreCaptionQuality(cues);
  return { ok: report.score >= minScore, report };
}
