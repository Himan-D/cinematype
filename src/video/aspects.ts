/** Social / platform frame sizes for title cards & burn-ins */

export type AspectId =
  | "youtube"
  | "youtube-shorts"
  | "tiktok"
  | "reels"
  | "stories"
  | "square"
  | "portrait"
  | "landscape-ultrawide"
  | "twitter"
  | "linkedin";

export interface FrameSize {
  id: AspectId;
  label: string;
  platform: string;
  width: number;
  height: number;
  /** width / height */
  ratio: number;
  /** Safe margin as fraction of short side (captions away from UI chrome) */
  safeMargin: number;
}

export const FRAME_SIZES: Record<AspectId, FrameSize> = {
  youtube: {
    id: "youtube",
    label: "16:9 Landscape",
    platform: "YouTube",
    width: 1920,
    height: 1080,
    ratio: 16 / 9,
    safeMargin: 0.08,
  },
  "youtube-shorts": {
    id: "youtube-shorts",
    label: "9:16 Shorts",
    platform: "YouTube Shorts",
    width: 1080,
    height: 1920,
    ratio: 9 / 16,
    safeMargin: 0.12,
  },
  tiktok: {
    id: "tiktok",
    label: "9:16 TikTok",
    platform: "TikTok",
    width: 1080,
    height: 1920,
    ratio: 9 / 16,
    safeMargin: 0.14,
  },
  reels: {
    id: "reels",
    label: "9:16 Reels",
    platform: "Instagram Reels",
    width: 1080,
    height: 1920,
    ratio: 9 / 16,
    safeMargin: 0.14,
  },
  stories: {
    id: "stories",
    label: "9:16 Stories",
    platform: "Instagram / Snap",
    width: 1080,
    height: 1920,
    ratio: 9 / 16,
    safeMargin: 0.16,
  },
  square: {
    id: "square",
    label: "1:1 Square",
    platform: "Instagram / X",
    width: 1080,
    height: 1080,
    ratio: 1,
    safeMargin: 0.1,
  },
  portrait: {
    id: "portrait",
    label: "4:5 Portrait",
    platform: "Instagram Feed",
    width: 1080,
    height: 1350,
    ratio: 4 / 5,
    safeMargin: 0.1,
  },
  "landscape-ultrawide": {
    id: "landscape-ultrawide",
    label: "21:9 Ultrawide",
    platform: "Cinematic",
    width: 2560,
    height: 1080,
    ratio: 21 / 9,
    safeMargin: 0.08,
  },
  twitter: {
    id: "twitter",
    label: "16:9 X/Twitter",
    platform: "X",
    width: 1920,
    height: 1080,
    ratio: 16 / 9,
    safeMargin: 0.08,
  },
  linkedin: {
    id: "linkedin",
    label: "1.91:1 LinkedIn",
    platform: "LinkedIn",
    width: 1920,
    height: 1080,
    ratio: 1.91,
    safeMargin: 0.08,
  },
};

export function listFrameSizes(): FrameSize[] {
  return Object.values(FRAME_SIZES);
}

export function getFrameSize(id: AspectId | string): FrameSize {
  const frame = FRAME_SIZES[id as AspectId];
  if (!frame) {
    throw new Error(
      `Unknown frame "${id}". Available: ${Object.keys(FRAME_SIZES).join(", ")}`,
    );
  }
  return frame;
}

/** Pixel size helper with optional scale (0.5 = half-res proxies) */
export function framePixels(
  id: AspectId | string,
  scale = 1,
): { width: number; height: number } {
  const frame = getFrameSize(id);
  return {
    width: Math.round(frame.width * scale),
    height: Math.round(frame.height * scale),
  };
}
