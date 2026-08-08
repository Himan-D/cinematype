import {
  DEFAULT_BRAND_KIT,
  DEFAULT_CAPTION_STYLE,
  migrateBrandKit,
  type BrandKit,
  type CaptionStyle,
} from "./brand";
import type { CaptionCue } from "./captions";

export type CinematypeProject = {
  version: 1;
  platform: string; // e.g. youtube-shorts
  transcript?: string;
  cues: CaptionCue[];
  brand: BrandKit;
  style: CaptionStyle;
  aspect: string;
  templateId?: string;
  hookLine?: string;
};

export type CreateProjectInput = Partial<
  Omit<CinematypeProject, "version" | "brand" | "style" | "cues">
> & {
  brand?: Partial<BrandKit>;
  style?: Partial<CaptionStyle>;
  cues?: CaptionCue[];
};

export function createProject(
  partial: CreateProjectInput = {},
): CinematypeProject {
  const brand = migrateBrandKit(partial.brand ?? DEFAULT_BRAND_KIT);
  const style: CaptionStyle = {
    ...DEFAULT_CAPTION_STYLE,
    ...(brand.caption ?? {}),
    ...(partial.style ?? {}),
  };
  return {
    version: 1,
    platform: partial.platform ?? "youtube-shorts",
    transcript: partial.transcript,
    cues: partial.cues ?? [],
    brand,
    style,
    aspect: partial.aspect ?? partial.platform ?? "youtube-shorts",
    templateId: partial.templateId,
    hookLine: partial.hookLine,
  };
}

export function serializeProject(project: CinematypeProject): string {
  return `${JSON.stringify(project, null, 2)}\n`;
}

export function isCinematypeProject(x: unknown): x is CinematypeProject {
  if (!x || typeof x !== "object") return false;
  const p = x as Record<string, unknown>;
  return (
    p.version === 1 &&
    typeof p.platform === "string" &&
    typeof p.aspect === "string" &&
    Array.isArray(p.cues) &&
    typeof p.brand === "object" &&
    p.brand !== null &&
    typeof p.style === "object" &&
    p.style !== null
  );
}

export function parseProject(raw: string): CinematypeProject {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid project.ct: not valid JSON");
  }
  if (!isCinematypeProject(parsed)) {
    throw new Error("Invalid project.ct: missing required fields");
  }
  return createProject({
    platform: parsed.platform,
    transcript: parsed.transcript,
    cues: parsed.cues,
    brand: parsed.brand,
    style: parsed.style,
    aspect: parsed.aspect,
    templateId: parsed.templateId,
    hookLine: parsed.hookLine,
  });
}

/** Browser download helper for `.ct` project files */
export function downloadProject(
  project: CinematypeProject,
  filename = "project.ct",
): void {
  if (typeof document === "undefined") {
    throw new Error("downloadProject requires a browser environment");
  }
  const blob = new Blob([serializeProject(project)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ct") ? filename : `${filename}.ct`;
  a.click();
  URL.revokeObjectURL(url);
}
