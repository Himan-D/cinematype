import { useEffect, useRef, useState, type RefObject } from "react";
import {
  kinetic,
  kineticOnView,
  type KineticController,
  type KineticOptions,
} from "../motion";
import {
  applyBrandCssVars,
  brandOverlayOptions,
  createVideoOverlay,
  loadBrandKit,
  saveBrandKit,
  type BrandKit,
  type CaptionCue,
  type OverlayController,
  type OverlayOptions,
} from "../video";

/** Attach kinetic animation to a ref element */
export function useKinetic(
  options: KineticOptions & { text?: string; onView?: boolean } = {},
): {
  ref: RefObject<HTMLElement | null>;
  controller: KineticController | null;
} {
  const ref = useRef<HTMLElement | null>(null);
  const [controller, setController] = useState<KineticController | null>(null);
  const { text, onView = false, ...kineticOptions } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (text != null) el.textContent = text;
    const ctrl = onView
      ? kineticOnView(el, kineticOptions)
      : kinetic(el, { autoplay: true, ...kineticOptions });
    setController(ctrl);
    return () => {
      ctrl.destroy();
      setController(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, onView, options.preset, options.mode, options.duration]);

  return { ref, controller };
}

/** Sync DOM overlay captions to a video element */
export function useVideoOverlay(
  videoRef: RefObject<HTMLVideoElement | null>,
  cues: CaptionCue[],
  options: OverlayOptions = {},
): OverlayController | null {
  const [controller, setController] = useState<OverlayController | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const ctrl = createVideoOverlay(video, cues, options);
    setController(ctrl);
    return () => {
      ctrl.destroy();
      setController(null);
    };
  }, [videoRef, cues, options.fontFamily, options.color, options.kinetic]);

  return controller;
}

/** Persist brand kit in localStorage + CSS variables */
export function useBrandKit(initial?: Partial<BrandKit>): {
  brand: BrandKit;
  setBrand: (patch: Partial<BrandKit>) => void;
  reset: () => void;
  overlayOptions: OverlayOptions;
} {
  const [brand, setBrandState] = useState<BrandKit>(() => ({
    ...loadBrandKit(),
    ...initial,
  }));

  useEffect(() => {
    saveBrandKit(brand);
    applyBrandCssVars(brand);
  }, [brand]);

  return {
    brand,
    setBrand: (patch) => setBrandState((b) => ({ ...b, ...patch })),
    reset: () => setBrandState(loadBrandKit()),
    overlayOptions: brandOverlayOptions(brand),
  };
}
