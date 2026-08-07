import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import {
  applyFontVariables,
  fontStack,
  loadFonts,
  type FontId,
  type LoadFontsOptions,
} from "../fonts";
import {
  kinetic,
  kineticOnView,
  type KineticController,
  type KineticOptions,
  type KineticPreset,
} from "../motion";
import {
  createVideoOverlay,
  type CaptionCue,
  type OverlayController,
} from "../video";
import { defaultTypeScale, type TypeStep } from "../tokens";

export {
  useKinetic,
  useVideoOverlay,
  useBrandKit,
} from "./hooks";

/* ── Font bootstrap ─────────────────────────────────────────────── */

export interface CinematypeProviderProps {
  children: ReactNode;
  fonts?: LoadFontsOptions;
  /** Apply CSS variables on documentElement */
  cssVariables?: boolean;
}

export function CinematypeProvider({
  children,
  fonts,
  cssVariables = true,
}: CinematypeProviderProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadFonts(fonts).then(() => {
      if (cancelled) return;
      if (cssVariables) applyFontVariables();
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [fonts, cssVariables]);

  return (
    <div data-cinematype={ready ? "ready" : "loading"} data-fonts-ready={ready}>
      {children}
    </div>
  );
}

export function useFontsReady(options?: LoadFontsOptions): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void loadFonts(options).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [options]);
  return ready;
}

/* ── Text components ────────────────────────────────────────────── */

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: keyof HTMLElementTagNameMap;
  /** Type scale step */
  step?: TypeStep;
  /** Catalog font id */
  font?: FontId | string;
  weight?: number;
  children: ReactNode;
}

export function Text({
  as = "p",
  step = "base",
  font,
  weight,
  children,
  style,
  className,
  ...rest
}: TextProps) {
  const token = defaultTypeScale[step];
  const Tag = as as "p";
  const merged: CSSProperties = {
    fontSize: `${token.size}rem`,
    lineHeight: token.lineHeight,
    letterSpacing: `${token.letterSpacing}em`,
    fontWeight: weight ?? token.weight,
    fontVariationSettings: `"wght" ${weight ?? token.weight}`,
    ...(font
      ? {
          fontFamily: (() => {
            try {
              return fontStack(font);
            } catch {
              return font;
            }
          })(),
        }
      : {}),
    ...style,
  };

  return (
    <Tag
      className={["ct-text", `ct-text-${step}`, className].filter(Boolean).join(" ")}
      style={merged}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* ── Kinetic text ───────────────────────────────────────────────── */

export interface KineticTextProps extends HTMLAttributes<HTMLElement> {
  as?: keyof HTMLElementTagNameMap;
  text: string;
  preset?: KineticPreset;
  kineticOptions?: Omit<KineticOptions, "preset" | "autoplay">;
  /** Play when in view (default true) */
  onView?: boolean;
  font?: FontId | string;
  step?: TypeStep;
}

export function KineticText({
  as = "h2",
  text,
  preset = "fade-up",
  kineticOptions,
  onView = true,
  font = "space-grotesk",
  step = "4xl",
  className,
  style,
  ...rest
}: KineticTextProps) {
  const ref = useRef<HTMLElement>(null);
  const ctrl = useRef<KineticController | null>(null);
  const token = defaultTypeScale[step];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.textContent = text;
    ctrl.current?.destroy();
    ctrl.current = onView
      ? kineticOnView(el, { preset, ...kineticOptions })
      : kinetic(el, { preset, ...kineticOptions, autoplay: true });
    return () => {
      ctrl.current?.destroy();
      ctrl.current = null;
    };
  }, [text, preset, onView, kineticOptions]);

  let family: string;
  try {
    family = fontStack(font);
  } catch {
    family = String(font);
  }

  const Tag = as as "h2";
  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={["ct-kinetic", className].filter(Boolean).join(" ")}
      style={{
        fontSize: `${token.size}rem`,
        lineHeight: token.lineHeight,
        letterSpacing: `${token.letterSpacing}em`,
        fontWeight: token.weight,
        fontFamily: family,
        ...style,
      }}
      {...rest}
    >
      {text}
    </Tag>
  );
}

/* ── Video with type overlay ────────────────────────────────────── */

export interface TypedVideoProps extends HTMLAttributes<HTMLDivElement> {
  src: string;
  cues: CaptionCue[];
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  fontFamily?: string;
  kinetic?: boolean;
}

export function TypedVideo({
  src,
  cues,
  poster,
  autoPlay,
  muted = true,
  loop,
  controls = true,
  fontFamily,
  kinetic: useKinetic = true,
  className,
  style,
  ...rest
}: TypedVideoProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<OverlayController | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    overlayRef.current?.destroy();
    overlayRef.current = createVideoOverlay(video, cues, {
      container: wrapRef.current ?? undefined,
      fontFamily,
      kinetic: useKinetic,
    });
    return () => {
      overlayRef.current?.destroy();
      overlayRef.current = null;
    };
  }, [cues, fontFamily, useKinetic]);

  return (
    <div
      ref={wrapRef}
      className={["ct-typed-video", className].filter(Boolean).join(" ")}
      style={{ position: "relative", overflow: "hidden", ...style }}
      {...rest}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        controls={controls}
        playsInline
        style={{ display: "block", width: "100%", height: "auto" }}
      />
    </div>
  );
}
