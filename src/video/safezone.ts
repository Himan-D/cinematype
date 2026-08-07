import type { AspectId } from "./aspects";
import { getFrameSize } from "./aspects";

export interface SafeZone {
  /** Inset from each edge as 0–1 fraction of width/height */
  top: number;
  right: number;
  bottom: number;
  left: number;
  /** Platform UI notes */
  notes: string[];
}

/** Platform UI chrome / caption safe areas */
export function getSafeZone(aspect: AspectId | string): SafeZone {
  const id = aspect as AspectId;
  if (id === "tiktok" || id === "reels" || id === "stories" || id === "youtube-shorts") {
    return {
      top: 0.14,
      right: 0.08,
      bottom: 0.22,
      left: 0.08,
      notes: [
        "Keep captions above the bottom action bar",
        "Avoid username / follow button on the right",
        "Leave headroom under the status bar",
      ],
    };
  }
  if (id === "portrait") {
    return {
      top: 0.08,
      right: 0.08,
      bottom: 0.12,
      left: 0.08,
      notes: ["Feed crop is slightly tighter on some devices"],
    };
  }
  return {
    top: 0.08,
    right: 0.08,
    bottom: 0.1,
    left: 0.08,
    notes: ["Keep lower-thirds inside the bottom safe band"],
  };
}

/** Pixel rect for drawing guides on a canvas/video frame */
export function safeZoneRect(
  aspect: AspectId | string,
  width?: number,
  height?: number,
): { x: number; y: number; width: number; height: number; notes: string[] } {
  const frame = getFrameSize(aspect);
  const w = width ?? frame.width;
  const h = height ?? frame.height;
  const zone = getSafeZone(aspect);
  const x = w * zone.left;
  const y = h * zone.top;
  return {
    x,
    y,
    width: w * (1 - zone.left - zone.right),
    height: h * (1 - zone.top - zone.bottom),
    notes: zone.notes,
  };
}

/** Draw dashed safe-zone rectangle onto a canvas context */
export function drawSafeZone(
  ctx: CanvasRenderingContext2D,
  aspect: AspectId | string,
  color = "rgba(216,255,74,0.65)",
): void {
  const rect = safeZoneRect(aspect, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, ctx.canvas.width * 0.002);
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
  ctx.restore();
}

/** Overlay element styles for DOM preview */
export function safeZoneStyle(aspect: AspectId | string): Record<string, string> {
  const zone = getSafeZone(aspect);
  return {
    position: "absolute",
    top: `${zone.top * 100}%`,
    right: `${zone.right * 100}%`,
    bottom: `${zone.bottom * 100}%`,
    left: `${zone.left * 100}%`,
    border: "1px dashed rgba(216,255,74,0.45)",
    pointerEvents: "none",
    zIndex: "6",
  };
}
