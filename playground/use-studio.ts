import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_CAPTION_STYLE,
  applyBrandCssVars,
  applyBrandToCues,
  brandOverlayOptions,
  brandToAssOptions,
  createProject,
  createVideoOverlay,
  cuesToAss,
  downloadBlob,
  downloadCanvas,
  downloadPluginPack,
  downloadProject,
  downloadSubtitles,
  ffmpegRecipe,
  framePixels,
  getSafeZone,
  kinetic,
  listBrandKits,
  listCreatorTemplates,
  listFonts,
  listPlatformPresets,
  listPlugins,
  listTitleCardPresets,
  loadBrandKit,
  loadFonts,
  mergeCues,
  normalizeCues,
  parseProject,
  parseSrt,
  removeCue,
  renderTitleCard,
  resolvePlatformPreset,
  retimeCues,
  runPlugin,
  saveBrandKit,
  setActiveBrandKit,
  shiftCues,
  splitCue,
  transcriptToCues,
  updateCue,
  upsertBrandKit,
  whisperJsonToCues,
  type AspectId,
  type BrandKit,
  type CaptionCue,
  type CaptionStyle,
  type CaptionStyleId,
  type KineticPreset,
  type PluginId,
} from "../src/index";
import {
  DEMO_VIDEO,
  isTypingTarget,
  type MorePanel,
  type Tab,
} from "./constants";

/**
 * All studio state + actions in one hook. App renders it; tab components
 * receive it as props. Keeping this file logic-only keeps JSX easy to read.
 */
export function useStudio() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("studio");
  const [morePanel, setMorePanel] = useState<MorePanel>("transcript");
  const [templateId, setTemplateId] = useState("youtube-opener");
  const [platformLabel, setPlatformLabel] = useState("YouTube");
  const [aspect, setAspect] = useState<AspectId>("youtube");
  const [cues, setCues] = useState<CaptionCue[]>([]);
  const [selectedCue, setSelectedCue] = useState(0);
  const [videoSrc, setVideoSrc] = useState(DEMO_VIDEO);
  const [showSafe, setShowSafe] = useState(true);
  const [transcript, setTranscript] = useState(
    "Stop scrolling.\n\nThis one setting changed everything for my channel.\n\nSave this for later and try it on your next upload.",
  );
  const [brand, setBrand] = useState<BrandKit>(() => loadBrandKit());
  const [kits, setKits] = useState<BrandKit[]>(() => listBrandKits());
  const [preset, setPreset] = useState<KineticPreset>("pop");
  const [cardId, setCardId] = useState("yt-hook");
  const [cardText, setCardText] = useState("STOP SCROLLING");
  const [cardUrl, setCardUrl] = useState("");
  const [hookLine, setHookLine] = useState("WATCH THIS");
  const [pluginId, setPluginId] = useState<PluginId>("capcut");
  const [pluginNotes, setPluginNotes] = useState<string>("");

  const stageRef = useRef<HTMLHeadingElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);

  const fonts = useMemo(() => listFonts(), []);
  const templates = useMemo(() => listCreatorTemplates(), []);
  const platforms = useMemo(() => listPlatformPresets(), []);
  const cards = useMemo(() => listTitleCardPresets(), []);
  const plugins = useMemo(() => listPlugins(), []);
  const template = templates.find((t) => t.id === templateId) ?? templates[0]!;
  const safe = getSafeZone(aspect);
  const captionStyle: CaptionStyle = brand.caption ?? DEFAULT_CAPTION_STYLE;
  const brandedCues = useMemo(() => applyBrandToCues(cues, brand), [cues, brand]);
  const recipe = useMemo(
    () => ffmpegRecipe("your-video.mp4", `${templateId}.ass`),
    [templateId],
  );
  const pluginCtx = useMemo(
    () => ({
      cues: brandedCues,
      brand,
      aspect,
      title: hookLine,
      videoPath: "your-video.mp4",
    }),
    [brandedCues, brand, aspect, hookLine],
  );

  const patchCaption = (patch: Partial<CaptionStyle>) => {
    setBrand((b) => ({
      ...b,
      caption: { ...(b.caption ?? DEFAULT_CAPTION_STYLE), ...patch },
    }));
  };

  const patchFonts = (key: "heading" | "body" | "caption", value: string) => {
    setBrand((b) => {
      const fontsNext = {
        heading: b.fonts?.heading ?? b.fontDisplay,
        body: b.fonts?.body ?? b.fontBody,
        caption: b.fonts?.caption ?? b.fontCaption ?? b.fontBody,
        [key]: value,
      };
      return {
        ...b,
        fonts: fontsNext,
        fontDisplay: fontsNext.heading,
        fontBody: fontsNext.body,
        fontCaption: fontsNext.caption,
        caption:
          key === "caption"
            ? { ...(b.caption ?? DEFAULT_CAPTION_STYLE), fontFamily: value }
            : b.caption,
      };
    });
  };

  useEffect(() => {
    void loadFonts().then(() => setReady(true));
  }, []);

  useEffect(() => {
    setCues(template.cues.map((c) => ({ ...c })));
    setAspect(template.aspect);
    const match = platforms.find((p) => p.aspect === template.aspect);
    if (match) setPlatformLabel(match.label);
    const title = template.cues.find((c) => c.style === "title");
    if (title) setHookLine(title.text);
    if (template.titleCard) {
      setCardId(template.titleCard.id);
      setCardText(title?.text ?? cardText);
    }
    setSelectedCue(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  useEffect(() => {
    saveBrandKit(brand);
    applyBrandCssVars(brand);
    setKits(listBrandKits());
  }, [brand]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || !ready || tab !== "more" || morePanel !== "motion") return;
    el.textContent = hookLine;
    const ctrl = kinetic(el, {
      preset,
      mode: preset === "typewriter" || preset === "scramble" ? "chars" : "words",
      autoplay: true,
    });
    return () => ctrl.destroy();
  }, [preset, ready, tab, morePanel, hookLine]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !ready) return;
    if (tab !== "studio" && tab !== "style" && tab !== "destinations") return;
    const overlay = createVideoOverlay(video, brandedCues, {
      container: wrapRef.current ?? undefined,
      ...brandOverlayOptions(brand),
    });
    void video.play().catch(() => {});
    return () => overlay.destroy();
  }, [ready, tab, brandedCues, brand, videoSrc, aspect]);

  useEffect(() => {
    if (!ready) return;
    try {
      const canvas = renderTitleCard(cardText, cardId, {
        background: brand.backgroundColor,
        color: brand.secondaryColor,
      });
      cardCanvasRef.current = canvas;
      setCardUrl(canvas.toDataURL("image/png"));
    } catch {
      setCardUrl("");
    }
  }, [ready, cardId, cardText, brand]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.code === "Space") {
        e.preventDefault();
        const v = videoRef.current;
        if (!v) return;
        if (v.paused) void v.play();
        else v.pause();
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedCue((i) => Math.max(0, i - 1));
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedCue((i) => Math.min(Math.max(cues.length - 1, 0), i + 1));
        return;
      }
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        setCues((c) => splitCue(c, selectedCue));
        return;
      }
      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        setCues((c) => mergeCues(c, selectedCue));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cues.length, selectedCue]);

  const onVideoFile = (file: File | null) => {
    if (!file) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setVideoSrc(url);
  };

  const onSrtFile = async (file: File | null) => {
    if (!file) return;
    const text = await file.text();
    setCues(normalizeCues(parseSrt(text)));
    setSelectedCue(0);
  };

  const applyTranscript = () => {
    const trimmed = transcript.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        setCues(whisperJsonToCues(JSON.parse(trimmed)));
        setTab("studio");
        setSelectedCue(0);
        return;
      } catch {
        /* plain text */
      }
    }
    setCues(
      transcriptToCues(trimmed, {
        style:
          aspect.includes("short") || aspect === "tiktok" || aspect === "reels"
            ? "burn"
            : "subtitle",
        maxWords: 6,
        wpm: 160,
      }),
    );
    setTab("studio");
    setSelectedCue(0);
  };

  const runSelectedPlugin = (download: boolean) => {
    const result = download
      ? downloadPluginPack(pluginId, pluginCtx)
      : runPlugin(pluginId, pluginCtx);
    const lines = [
      ...(result.notes ?? []),
      ...(result.commands ?? []).map((c) => `$ ${c}`),
      ...(result.files ?? []).map((f) => `• ${f.filename}${f.note ? ` — ${f.note}` : ""}`),
    ];
    setPluginNotes(lines.join("\n"));
  };

  const saveProjectFile = () => {
    const project = createProject({
      platform: platformLabel,
      aspect,
      transcript,
      cues,
      brand,
      style: captionStyle,
      templateId,
      hookLine,
    });
    downloadProject(project, `${templateId || "project"}.ct`);
  };

  const openProjectFile = async (file: File | null) => {
    if (!file) return;
    try {
      const project = parseProject(await file.text());
      setCues(project.cues);
      setBrand(project.brand);
      saveBrandKit(project.brand);
      setKits(listBrandKits());
      setAspect(project.aspect as AspectId);
      setPlatformLabel(project.platform);
      if (project.templateId) setTemplateId(project.templateId);
      if (project.transcript) setTranscript(project.transcript);
      if (project.hookLine) setHookLine(project.hookLine);
      setSelectedCue(0);
      setTab("studio");
    } catch (err) {
      setPluginNotes(`Could not open project: ${String(err)}`);
      setTab("destinations");
    }
  };

  const downloadAss = () => {
    const { width, height } = framePixels(aspect);
    const body = cuesToAss(brandedCues, brandToAssOptions(brand, width, height));
    downloadBlob(new Blob([body], { type: "text/plain" }), `${templateId}.ass`);
  };

  const setHook = (text: string) => {
    setHookLine(text);
    setCardText(text);
    setCues((prev) => {
      const idx = prev.findIndex((c) => c.style === "title");
      if (idx < 0) return prev;
      return updateCue(prev, idx, { text });
    });
  };

  return {
    // view state
    ready,
    tab,
    setTab,
    morePanel,
    setMorePanel,
    showSafe,
    setShowSafe,
    selectedCue,
    setSelectedCue,
    aspect,
    videoSrc,
    // data
    fonts,
    templates,
    platforms,
    cards,
    plugins,
    template,
    safe,
    captionStyle,
    cues,
    setCues,
    brandedCues,
    recipe,
    brand,
    setBrand,
    kits,
    setKits,
    transcript,
    setTranscript,
    hookLine,
    preset,
    setPreset,
    cardId,
    setCardId,
    cardText,
    setCardText,
    cardUrl,
    platformLabel,
    setPlatformLabel,
    setAspect,
    templateId,
    setTemplateId,
    pluginId,
    setPluginId,
    pluginNotes,
    setPluginNotes,
    // refs
    stageRef,
    videoRef,
    wrapRef,
    cardCanvasRef,
    projectInputRef,
    // actions
    patchCaption,
    patchFonts,
    onVideoFile,
    onSrtFile,
    applyTranscript,
    runSelectedPlugin,
    saveProjectFile,
    openProjectFile,
    downloadAss,
    setHook,
  };
}

export type StudioState = ReturnType<typeof useStudio>;
