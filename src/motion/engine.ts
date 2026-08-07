import { prefersReducedMotion } from "../fonts/loader";
import { splitText, type SplitMode, type SplitResult } from "./split";

export type EasingName =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "expo-out"
  | "back-out"
  | "spring";

export type KineticPreset =
  | "fade-up"
  | "fade-in"
  | "scale-in"
  | "blur-in"
  | "slide-left"
  | "slide-right"
  | "rotate-in"
  | "weight-morph"
  | "scramble"
  | "typewriter"
  | "wave"
  | "glitch"
  | "pop"
  | "bounce-in";

export interface KineticOptions {
  preset?: KineticPreset;
  mode?: SplitMode;
  /** Total duration in ms */
  duration?: number;
  /** Stagger between units in ms */
  stagger?: number;
  delay?: number;
  easing?: EasingName;
  /** For weight-morph */
  fromWeight?: number;
  toWeight?: number;
  /** Scramble charset */
  scrambleCharset?: string;
  /** Auto-play on create */
  autoplay?: boolean;
  /** Respect prefers-reduced-motion (default true) */
  respectReducedMotion?: boolean;
  onComplete?: () => void;
}

export interface KineticController {
  play: () => Promise<void>;
  reverse: () => Promise<void>;
  pause: () => void;
  /** Resume after pause by replaying from the start */
  resume: () => Promise<void>;
  destroy: () => void;
  readonly split: SplitResult;
  readonly playing: boolean;
}

const EASINGS: Record<EasingName, string> = {
  linear: "linear",
  ease: "ease",
  "ease-in": "ease-in",
  "ease-out": "ease-out",
  "ease-in-out": "ease-in-out",
  "expo-out": "cubic-bezier(0.16, 1, 0.3, 1)",
  "back-out": "cubic-bezier(0.34, 1.56, 0.64, 1)",
  spring: "cubic-bezier(0.22, 1.2, 0.36, 1)",
};

interface PresetStyle {
  from: Partial<CSSStyleDeclaration> & Record<string, string>;
  to: Partial<CSSStyleDeclaration> & Record<string, string>;
}

const PRESETS: Record<
  Exclude<KineticPreset, "scramble" | "typewriter" | "weight-morph" | "glitch" | "wave">,
  PresetStyle
> = {
  "fade-up": {
    from: { opacity: "0", transform: "translateY(0.6em)" },
    to: { opacity: "1", transform: "translateY(0)" },
  },
  "fade-in": {
    from: { opacity: "0" },
    to: { opacity: "1" },
  },
  "scale-in": {
    from: { opacity: "0", transform: "scale(0.7)" },
    to: { opacity: "1", transform: "scale(1)" },
  },
  "blur-in": {
    from: { opacity: "0", filter: "blur(8px)", transform: "translateY(0.2em)" },
    to: { opacity: "1", filter: "blur(0)", transform: "translateY(0)" },
  },
  "slide-left": {
    from: { opacity: "0", transform: "translateX(0.5em)" },
    to: { opacity: "1", transform: "translateX(0)" },
  },
  "slide-right": {
    from: { opacity: "0", transform: "translateX(-0.5em)" },
    to: { opacity: "1", transform: "translateX(0)" },
  },
  "rotate-in": {
    from: { opacity: "0", transform: "rotate(-8deg) translateY(0.3em)" },
    to: { opacity: "1", transform: "rotate(0) translateY(0)" },
  },
  pop: {
    from: { opacity: "0", transform: "scale(0.4)" },
    to: { opacity: "1", transform: "scale(1)" },
  },
  "bounce-in": {
    from: { opacity: "0", transform: "translateY(0.9em) scale(0.85)" },
    to: { opacity: "1", transform: "translateY(0) scale(1)" },
  },
}

function units(split: SplitResult, mode: SplitMode): HTMLElement[] {
  if (mode === "words") return split.words;
  if (mode === "lines") return split.lines;
  return split.chars.length ? split.chars : split.words;
}

function applyStyles(el: HTMLElement, styles: Record<string, string>) {
  for (const [k, v] of Object.entries(styles)) {
    el.style.setProperty(k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`), v);
  }
}

function animateTransition(
  el: HTMLElement,
  to: Record<string, string>,
  duration: number,
  easing: string,
  delay: number,
): Promise<void> {
  return new Promise((resolve) => {
    const props = Object.keys(to)
      .map((k) => k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`))
      .join(", ");
    el.style.transitionProperty = props || "all";
    el.style.transitionDuration = `${duration}ms`;
    el.style.transitionTimingFunction = easing;
    el.style.transitionDelay = `${delay}ms`;

    requestAnimationFrame(() => {
      applyStyles(el, to);
    });

    const done = () => {
      el.removeEventListener("transitionend", done);
      resolve();
    };
    el.addEventListener("transitionend", done, { once: true });
    // Fallback if no transition fires
    setTimeout(done, duration + delay + 50);
  });
}

async function runScramble(
  targets: HTMLElement[],
  options: KineticOptions,
  signal: { cancelled: boolean },
): Promise<void> {
  const charset =
    options.scrambleCharset ??
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 monotype";
  const duration = options.duration ?? 1200;
  const stagger = options.stagger ?? 30;
  const originals = targets.map((t) => t.textContent ?? "");

  await Promise.all(
    targets.map(async (el, i) => {
      if (el.dataset.space === "true") return;
      const original = originals[i] ?? "";
      const start = performance.now() + (options.delay ?? 0) + i * stagger;
      return new Promise<void>((resolve) => {
        const tick = (now: number) => {
          if (signal.cancelled) {
            el.textContent = original;
            resolve();
            return;
          }
          if (now < start) {
            requestAnimationFrame(tick);
            return;
          }
          const t = Math.min(1, (now - start) / duration);
          if (t >= 1) {
            el.textContent = original;
            resolve();
            return;
          }
          // Progressive reveal from left
          const reveal = Math.floor(t * original.length);
          let out = original.slice(0, reveal);
          for (let c = reveal; c < original.length; c++) {
            out += charset[Math.floor(Math.random() * charset.length)] ?? "#";
          }
          el.textContent = out;
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }),
  );
}

async function runTypewriter(
  targets: HTMLElement[],
  options: KineticOptions,
  signal: { cancelled: boolean },
): Promise<void> {
  const stagger = options.stagger ?? 40;
  targets.forEach((el) => {
    el.style.opacity = "0";
  });
  for (let i = 0; i < targets.length; i++) {
    if (signal.cancelled) return;
    const el = targets[i]!;
    await new Promise<void>((r) => setTimeout(r, (options.delay ?? 0) + (i === 0 ? 0 : stagger)));
    el.style.opacity = "1";
  }
}

async function runWeightMorph(
  targets: HTMLElement[],
  options: KineticOptions,
): Promise<void> {
  const from = options.fromWeight ?? 200;
  const to = options.toWeight ?? 800;
  const duration = options.duration ?? 900;
  const stagger = options.stagger ?? 25;
  const easing = EASINGS[options.easing ?? "expo-out"];

  await Promise.all(
    targets.map((el, i) => {
      el.style.fontVariationSettings = `"wght" ${from}`;
      el.style.fontWeight = String(from);
      return animateTransition(
        el,
        {
          fontVariationSettings: `"wght" ${to}`,
          fontWeight: String(to),
        },
        duration,
        easing,
        (options.delay ?? 0) + i * stagger,
      );
    }),
  );
}

async function runWave(
  targets: HTMLElement[],
  options: KineticOptions,
  signal: { cancelled: boolean },
): Promise<void> {
  const duration = options.duration ?? 900;
  const stagger = options.stagger ?? 40;
  await Promise.all(
    targets.map((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(0.4em)";
      return animateTransition(
        el,
        { opacity: "1", transform: "translateY(0)" },
        duration,
        EASINGS["back-out"],
        (options.delay ?? 0) + i * stagger,
      ).then(() => {
        if (signal.cancelled) return;
        // subtle settle bounce already in easing
      });
    }),
  );
}

async function runGlitch(
  targets: HTMLElement[],
  options: KineticOptions,
  signal: { cancelled: boolean },
): Promise<void> {
  const duration = options.duration ?? 600;
  await Promise.all(
    targets.map(async (el, i) => {
      const delay = (options.delay ?? 0) + i * (options.stagger ?? 20);
      await new Promise((r) => setTimeout(r, delay));
      if (signal.cancelled) return;
      el.style.opacity = "1";
      for (let g = 0; g < 4; g++) {
        if (signal.cancelled) return;
        el.style.transform = `translate(${(Math.random() - 0.5) * 6}px, ${(Math.random() - 0.5) * 4}px)`;
        el.style.textShadow = `${(Math.random() - 0.5) * 4}px 0 #f0f, ${ (Math.random() - 0.5) * 4}px 0 #0ff`;
        await new Promise((r) => setTimeout(r, duration / 8));
      }
      el.style.transform = "none";
      el.style.textShadow = "none";
    }),
  );
}

/**
 * Create a kinetic typography animation on an element.
 * Zero external animation dependencies — CSS transitions + rAF.
 */
export function kinetic(
  element: HTMLElement,
  options: KineticOptions = {},
): KineticController {
  const preset = options.preset ?? "fade-up";
  const mode: SplitMode =
    options.mode ??
    (preset === "typewriter" || preset === "scramble" ? "chars" : "chars");
  const split = splitText(element, { mode });
  const targets = units(split, mode);
  const signal = { cancelled: false };
  let playing = false;
  let pauseFlag = false;

  const play = async () => {
    if (playing) return;
    playing = true;
    signal.cancelled = false;
    pauseFlag = false;

    const reduced =
      options.respectReducedMotion !== false && prefersReducedMotion();

    if (reduced) {
      targets.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
        el.style.filter = "none";
      });
      playing = false;
      options.onComplete?.();
      return;
    }

    try {
      switch (preset) {
        case "scramble":
          await runScramble(targets, options, signal);
          break;
        case "typewriter":
          await runTypewriter(targets, options, signal);
          break;
        case "weight-morph":
          await runWeightMorph(targets, options);
          break;
        case "wave":
          await runWave(targets, options, signal);
          break;
        case "glitch":
          targets.forEach((el) => {
            el.style.opacity = "0";
          });
          await runGlitch(targets, options, signal);
          break;
        default: {
          const style = PRESETS[preset as keyof typeof PRESETS] ?? PRESETS["fade-up"];
          const duration = options.duration ?? 700;
          const stagger = options.stagger ?? 28;
          const easing =
            EASINGS[
              options.easing ??
                (preset === "pop" || preset === "bounce-in" ? "back-out" : "expo-out")
            ];
          targets.forEach((el) => applyStyles(el, style.from as Record<string, string>));
          // force reflow
          void element.offsetWidth;
          await Promise.all(
            targets.map((el, i) =>
              animateTransition(
                el,
                style.to as Record<string, string>,
                duration,
                easing,
                (options.delay ?? 0) + i * stagger,
              ),
            ),
          );
        }
      }
    } finally {
      playing = false;
      if (!signal.cancelled && !pauseFlag) options.onComplete?.();
    }
  };

  const controller: KineticController = {
    get split() {
      return split;
    },
    get playing() {
      return playing;
    },
    play,
    reverse: async () => {
      // Simple reverse: fade out
      signal.cancelled = false;
      playing = true;
      await Promise.all(
        targets.map((el, i) =>
          animateTransition(
            el,
            { opacity: "0", transform: "translateY(0.3em)" },
            options.duration ?? 400,
            EASINGS["ease-in"],
            i * 15,
          ),
        ),
      );
      playing = false;
    },
    pause: () => {
      pauseFlag = true;
      signal.cancelled = true;
      playing = false;
      targets.forEach((el) => {
        el.style.transitionDuration = "0ms";
      });
    },
    resume: async () => {
      pauseFlag = false;
      signal.cancelled = false;
      return play();
    },
    destroy: () => {
      signal.cancelled = true;
      playing = false;
      split.revert();
    },
  };

  if (options.autoplay !== false) {
    // Defer to next frame so layout is ready
    requestAnimationFrame(() => {
      void play();
    });
  }

  return controller;
}

/** Observe element and play kinetic when it enters viewport */
export function kineticOnView(
  element: HTMLElement,
  options: KineticOptions & { rootMargin?: string; threshold?: number } = {},
): KineticController {
  const ctrl = kinetic(element, { ...options, autoplay: false });
  if (typeof IntersectionObserver === "undefined") {
    void ctrl.play();
    return ctrl;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          void ctrl.play();
          io.disconnect();
        }
      }
    },
    {
      rootMargin: options.rootMargin ?? "0px 0px -10% 0px",
      threshold: options.threshold ?? 0.2,
    },
  );
  io.observe(element);
  const originalDestroy = ctrl.destroy.bind(ctrl);
  ctrl.destroy = () => {
    io.disconnect();
    originalDestroy();
  };
  return ctrl;
}
