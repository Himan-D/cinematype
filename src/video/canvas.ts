import type { CaptionCue } from "./captions";

export interface CanvasTextOptions {
  width?: number;
  height?: number;
  background?: string | CanvasGradient | null;
  fontFamily?: string;
  fontWeight?: number;
  fontSize?: number;
  color?: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  /** letter-spacing approximation in px */
  tracking?: number;
  shadow?: boolean;
  padding?: number;
}

function fillTextTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number,
  maxWidth?: number,
) {
  if (!tracking) {
    ctx.fillText(text, x, y, maxWidth);
    return;
  }

  const chars = [...text];
  let total = 0;
  const widths = chars.map((ch) => {
    const w = ctx.measureText(ch).width;
    total += w;
    return w;
  });
  total += tracking * Math.max(0, chars.length - 1);

  const align = ctx.textAlign;
  let cursor =
    align === "left" || align === "start"
      ? x
      : align === "right" || align === "end"
        ? x - total
        : x - total / 2;

  const prevAlign = ctx.textAlign;
  ctx.textAlign = "left";
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i]!, cursor, y);
    cursor += (widths[i] ?? 0) + tracking;
  }
  ctx.textAlign = prevAlign;
}

/**
 * Render a single text frame to canvas — for thumbnails, poster frames,
 * or frame-by-frame export pipelines.
 */
export function renderTextFrame(
  text: string,
  options: CanvasTextOptions = {},
): HTMLCanvasElement {
  const width = options.width ?? 1920;
  const height = options.height ?? 1080;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  if (options.background === null) {
    ctx.clearRect(0, 0, width, height);
  } else if (typeof options.background === "string" || options.background) {
    ctx.fillStyle = options.background as string | CanvasGradient;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, width, height);
  }

  const fontSize = options.fontSize ?? Math.round(height * 0.08);
  const weight = options.fontWeight ?? 700;
  const family = options.fontFamily ?? "Syne, Space Grotesk, system-ui, sans-serif";
  const tracking = options.tracking ?? 0;
  ctx.font = `${weight} ${fontSize}px ${family}`;
  ctx.fillStyle = options.color ?? "#ffffff";
  ctx.textAlign = options.align ?? "center";
  ctx.textBaseline = options.baseline ?? "middle";

  if (options.shadow !== false) {
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = fontSize * 0.25;
    ctx.shadowOffsetY = fontSize * 0.06;
  }

  const x =
    options.align === "left"
      ? (options.padding ?? width * 0.08)
      : options.align === "right"
        ? width - (options.padding ?? width * 0.08)
        : width / 2;
  const y = height / 2;

  // Simple word wrap (tracking-aware width estimate)
  const maxWidth = width - (options.padding ?? width * 0.08) * 2;
  const measure = (value: string) => {
    const base = ctx.measureText(value).width;
    if (!tracking || value.length <= 1) return base;
    return base + tracking * (value.length - 1);
  };

  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (measure(test) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  const lineHeight = fontSize * 1.15;
  const blockHeight = lines.length * lineHeight;
  const startY = y - blockHeight / 2 + lineHeight / 2;

  lines.forEach((l, i) => {
    fillTextTracked(ctx, l, x, startY + i * lineHeight, tracking, maxWidth);
  });

  return canvas;
}

export interface SequenceOptions extends CanvasTextOptions {
  /** fps for timing metadata only */
  fps?: number;
}

export interface TextFrame {
  time: number;
  canvas: HTMLCanvasElement;
  cue: CaptionCue;
}

/**
 * Build a sequence of canvas frames for each caption cue
 * (useful for exporting title cards or feeding a video encoder).
 */
export function renderCueSequence(
  cues: CaptionCue[],
  options: SequenceOptions = {},
): TextFrame[] {
  return cues.map((cue) => ({
    time: cue.start,
    cue,
    canvas: renderTextFrame(cue.text, {
      ...options,
      fontFamily:
        options.fontFamily ??
        (cue.style === "title"
          ? "Syne, system-ui, sans-serif"
          : "Space Grotesk, system-ui, sans-serif"),
      fontSize:
        options.fontSize ??
        (cue.style === "title" ? undefined : options.height ? options.height * 0.05 : undefined),
    }),
  }));
}

/**
 * Draw live caption text onto a canvas overlay each animation frame,
 * synced to a video element. Returns a cancel function.
 */
export function paintVideoCaptions(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  cues: CaptionCue[],
  options: CanvasTextOptions = {},
): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  let raf = 0;
  let running = true;

  const draw = () => {
    if (!running) return;
    const w = (canvas.width = video.clientWidth || options.width || 1280);
    const h = (canvas.height = video.clientHeight || options.height || 720);
    ctx.clearRect(0, 0, w, h);

    const t = video.currentTime;
    const cue = cues.find((c) => t >= c.start && t < c.end);
    if (cue) {
      const frame = renderTextFrame(cue.text, {
        ...options,
        width: w,
        height: h,
        background: null,
        fontSize: options.fontSize ?? h * (cue.style === "title" ? 0.09 : 0.05),
      });
      ctx.drawImage(frame, 0, 0);
    }
    raf = requestAnimationFrame(draw);
  };

  raf = requestAnimationFrame(draw);
  return () => {
    running = false;
    cancelAnimationFrame(raf);
  };
}
