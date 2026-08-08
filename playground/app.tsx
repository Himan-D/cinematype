import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Onboarding } from "./Onboarding";
import {
  DEFAULT_CAPTION_STYLE,
  addCue,
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
  fontStack,
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
  type CaptionAnimation,
  type CaptionCue,
  type CaptionStyle,
  type CaptionStyleId,
  type KineticPreset,
  type PluginId,
} from "../src/index";

type Tab = "studio" | "style" | "destinations" | "more";

const PRESETS: KineticPreset[] = [
  "fade-up",
  "pop",
  "bounce-in",
  "blur-in",
  "scale-in",
  "slide-left",
  "weight-morph",
  "scramble",
  "typewriter",
  "wave",
  "glitch",
];

const ANIMATIONS: CaptionAnimation[] = [
  "none",
  "fade",
  "pop",
  "slide",
  "word-pop",
  "karaoke",
  "bounce",
  "glitch",
];

const STYLE_IDS: CaptionStyleId[] = [
  "subtitle",
  "title",
  "lower-third",
  "karaoke",
  "chapter",
  "end-card",
  "speaker",
  "burn",
];

const DEMO_VIDEO =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

function App() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("studio");
  const [morePanel, setMorePanel] = useState<"motion" | "fonts" | "cards" | "transcript">(
    "transcript",
  );
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

  const copyCurl = async () => {
    const cmd =
      "curl -fsSL https://raw.githubusercontent.com/Himan-D/cinematype/main/scripts/get-cinematype.sh | bash";
    try {
      await navigator.clipboard.writeText(cmd);
    } catch {
      /* ignore */
    }
  };

  const showPreview = tab === "studio" || tab === "style" || tab === "destinations";

  return (
    <>
      <Onboarding
        onGoStudio={() => setTab("studio")}
        onGoStyle={() => setTab("style")}
        onGoDestinations={() => setTab("destinations")}
      />

      <div className="curl-banner">
        <code>
          curl -fsSL https://raw.githubusercontent.com/Himan-D/cinematype/main/scripts/get-cinematype.sh
          | bash
        </code>
        <button type="button" className="btn" onClick={() => void copyCurl()}>
          Copy install
        </button>
      </div>

      <header className="top">
        <div>
          <h1 className="brand">CINEMATYPE</h1>
          <p className="tag">
            Create your caption style once. Export it everywhere.
          </p>
        </div>
        <nav className="tabs" aria-label="Studio sections">
          {(
            [
              ["studio", "Studio"],
              ["style", "Style / Brand"],
              ["destinations", "Destinations"],
              ["more", "More"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              data-active={tab === id}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <div className="layout">
        <aside className="panel">
          <h3>Project</h3>
          <label className="field">Template</label>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>

          <label className="field">Platform</label>
          <select
            value={platformLabel}
            onChange={(e) => {
              const label = e.target.value;
              setPlatformLabel(label);
              setAspect(resolvePlatformPreset(label));
            }}
          >
            {platforms.map((p) => (
              <option key={p.label} value={p.label}>
                {p.label}
              </option>
            ))}
          </select>

          <label className="field">Hook / title text</label>
          <input
            value={hookLine}
            onChange={(e) => {
              setHookLine(e.target.value);
              setCardText(e.target.value);
              setCues((prev) => {
                const idx = prev.findIndex((c) => c.style === "title");
                if (idx < 0) return prev;
                return updateCue(prev, idx, { text: e.target.value });
              });
            }}
          />

          <div className="actions" style={{ marginTop: "0.5rem" }}>
            <label className="file-btn">
              Upload video
              <input
                type="file"
                accept="video/*"
                onChange={(e) => onVideoFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <label className="file-btn">
              Import SRT
              <input
                type="file"
                accept=".srt,text/plain"
                onChange={(e) => void onSrtFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className="actions" style={{ marginTop: "0.5rem" }}>
            <button type="button" className="btn btn-primary" onClick={saveProjectFile}>
              Save .ct
            </button>
            <label className="file-btn">
              Open .ct
              <input
                ref={projectInputRef}
                type="file"
                accept=".ct,application/json"
                onChange={(e) => void openProjectFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className="actions" style={{ marginTop: "0.5rem" }}>
            <button
              type="button"
              className="chip"
              data-active={showSafe}
              onClick={() => setShowSafe((v) => !v)}
            >
              Safe zone
            </button>
            <button
              type="button"
              className="chip"
              onClick={() => setCues((c) => shiftCues(c, -0.25))}
            >
              −0.25s
            </button>
            <button
              type="button"
              className="chip"
              onClick={() => setCues((c) => shiftCues(c, 0.25))}
            >
              +0.25s
            </button>
            <button
              type="button"
              className="chip"
              onClick={() => setCues((c) => retimeCues(c, { scale: 0.9 }))}
            >
              Faster
            </button>
          </div>

          <p className="notes">
            Safe zone: top {(safe.top * 100).toFixed(0)}% · bottom{" "}
            {(safe.bottom * 100).toFixed(0)}%. {safe.notes[0]}
          </p>
          <p className="kbd-hint">Space play · ↑↓ cues · S split · M merge</p>
        </aside>

        <main className="panel">
          {showPreview && (
            <>
              <h3>Preview · {template.label}</h3>
              <div className="video-shell" data-aspect={aspect} ref={wrapRef}>
                <video
                  ref={videoRef}
                  key={videoSrc}
                  src={videoSrc}
                  muted
                  autoPlay
                  loop
                  playsInline
                  controls
                />
                {showSafe && (
                  <div
                    className="safe-guide"
                    style={{
                      top: `${safe.top * 100}%`,
                      right: `${safe.right * 100}%`,
                      bottom: `${safe.bottom * 100}%`,
                      left: `${safe.left * 100}%`,
                    }}
                  />
                )}
              </div>
            </>
          )}

          {tab === "studio" && (
            <>
              <h3 style={{ marginTop: "1rem" }}>Transcript</h3>
              <p className="notes">
                Paste voiceover or Whisper <code>verbose_json</code>. Generate, then
                fine-tune in the cue list.
              </p>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={6}
              />
              <div className="actions">
                <button type="button" className="btn btn-primary" onClick={applyTranscript}>
                  Generate captions
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setCues(
                      transcriptToCues(transcript, {
                        style: "karaoke",
                        maxWords: 10,
                      }),
                    );
                    setSelectedCue(0);
                  }}
                >
                  Karaoke style
                </button>
              </div>
            </>
          )}

          {tab === "style" && (
            <>
              <h3 style={{ marginTop: "1rem" }}>Brand kits</h3>
              <div className="chip-row">
                {kits.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    className="chip"
                    data-active={k.id === brand.id}
                    onClick={() => {
                      const next = setActiveBrandKit(k.id!);
                      setBrand(next);
                    }}
                  >
                    {k.name ?? k.channelName}
                  </button>
                ))}
                <button
                  type="button"
                  className="chip"
                  onClick={() => {
                    const next = upsertBrandKit({
                      ...brand,
                      id: undefined,
                      name: `${brand.channelName} copy`,
                      channelName: brand.channelName,
                    });
                    setBrand(next);
                    setKits(listBrandKits());
                  }}
                >
                  + Duplicate kit
                </button>
              </div>

              <label className="field">Kit name</label>
              <input
                value={brand.name ?? ""}
                onChange={(e) => setBrand({ ...brand, name: e.target.value })}
              />
              <label className="field">Channel</label>
              <input
                value={brand.channelName}
                onChange={(e) => setBrand({ ...brand, channelName: e.target.value })}
              />
              <label className="field">Tagline</label>
              <input
                value={brand.tagline ?? ""}
                onChange={(e) => setBrand({ ...brand, tagline: e.target.value })}
              />
              <label className="field">Lower-third title</label>
              <input
                value={brand.lowerThirdTitle ?? ""}
                onChange={(e) =>
                  setBrand({ ...brand, lowerThirdTitle: e.target.value })
                }
              />
              <label className="field">Lower-third subtitle</label>
              <input
                value={brand.lowerThirdSubtitle ?? ""}
                onChange={(e) =>
                  setBrand({ ...brand, lowerThirdSubtitle: e.target.value })
                }
              />

              <div className="color-row">
                <label className="field">
                  Primary
                  <input
                    type="color"
                    value={brand.primaryColor}
                    onChange={(e) => {
                      const primaryColor = e.target.value;
                      setBrand({
                        ...brand,
                        primaryColor,
                        caption: {
                          ...(brand.caption ?? DEFAULT_CAPTION_STYLE),
                          highlightColor: primaryColor,
                        },
                      });
                    }}
                  />
                </label>
                <label className="field">
                  Text
                  <input
                    type="color"
                    value={brand.secondaryColor}
                    onChange={(e) => {
                      const secondaryColor = e.target.value;
                      setBrand({
                        ...brand,
                        secondaryColor,
                        caption: {
                          ...(brand.caption ?? DEFAULT_CAPTION_STYLE),
                          color: secondaryColor,
                        },
                      });
                    }}
                  />
                </label>
                <label className="field">
                  Background
                  <input
                    type="color"
                    value={brand.backgroundColor}
                    onChange={(e) =>
                      setBrand({ ...brand, backgroundColor: e.target.value })
                    }
                  />
                </label>
              </div>

              <label className="field">Heading font</label>
              <select
                value={brand.fonts?.heading ?? brand.fontDisplay}
                onChange={(e) => patchFonts("heading", e.target.value)}
              >
                {fonts.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.family}
                  </option>
                ))}
              </select>
              <label className="field">Body font</label>
              <select
                value={brand.fonts?.body ?? brand.fontBody}
                onChange={(e) => patchFonts("body", e.target.value)}
              >
                {fonts.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.family}
                  </option>
                ))}
              </select>
              <label className="field">Caption font</label>
              <select
                value={brand.fonts?.caption ?? brand.fontCaption ?? brand.fontBody}
                onChange={(e) => patchFonts("caption", e.target.value)}
              >
                {fonts.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.family}
                  </option>
                ))}
              </select>

              <h3 style={{ marginTop: "1rem" }}>Caption style</h3>
              <label className="field">Size (1080p px)</label>
              <input
                type="number"
                value={captionStyle.fontSize}
                onChange={(e) => patchCaption({ fontSize: Number(e.target.value) })}
              />
              <label className="field">Position</label>
              <select
                value={captionStyle.position}
                onChange={(e) =>
                  patchCaption({
                    position: e.target.value as CaptionStyle["position"],
                  })
                }
              >
                <option value="top">top</option>
                <option value="center">center</option>
                <option value="bottom">bottom</option>
              </select>
              <label className="field">Animation</label>
              <select
                value={captionStyle.animation}
                onChange={(e) =>
                  patchCaption({ animation: e.target.value as CaptionAnimation })
                }
              >
                {ANIMATIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>

              <div className="actions" style={{ marginTop: "0.75rem" }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const saved = upsertBrandKit(brand);
                    setBrand(saved);
                    setKits(listBrandKits());
                  }}
                >
                  Save brand kit
                </button>
              </div>
            </>
          )}

          {tab === "destinations" && (
            <>
              <h3 style={{ marginTop: "1rem" }}>Export destinations · {plugins.length}</h3>
              <p className="notes">
                One-click packs for editors and platforms. Same brand + cues you previewed.
              </p>
              <div className="chip-row">
                {plugins.map((p) => (
                  <button
                    key={p.id}
                    className="chip"
                    type="button"
                    data-active={p.id === pluginId}
                    onClick={() => {
                      setPluginId(p.id);
                      setPluginNotes(`${p.name}: ${p.description}`);
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <div className="actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => runSelectedPlugin(true)}
                >
                  Download pack
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => runSelectedPlugin(false)}
                >
                  Preview commands
                </button>
              </div>
              <pre className="recipe" style={{ marginTop: "0.75rem" }}>
                {pluginNotes || "Select a destination, then Download pack."}
              </pre>

              <h3 style={{ marginTop: "1rem" }}>Formats</h3>
              <div className="actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    downloadSubtitles(brandedCues, "srt", `${templateId}.srt`)
                  }
                >
                  SRT
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    downloadSubtitles(brandedCues, "vtt", `${templateId}.vtt`)
                  }
                >
                  VTT
                </button>
                <button type="button" className="btn" onClick={downloadAss}>
                  ASS (branded)
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    if (cardCanvasRef.current) {
                      void downloadCanvas(cardCanvasRef.current, `${cardId}.png`);
                    }
                  }}
                >
                  Title PNG
                </button>
              </div>
              <h3 style={{ marginTop: "1rem" }}>FFmpeg burn-in</h3>
              <pre className="recipe">{recipe}</pre>
            </>
          )}

          {tab === "more" && (
            <>
              <div className="chip-row" style={{ marginBottom: "0.75rem" }}>
                {(
                  [
                    ["transcript", "Transcript"],
                    ["motion", "Motion"],
                    ["fonts", "Fonts"],
                    ["cards", "Cards"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className="chip"
                    data-active={morePanel === id}
                    onClick={() => setMorePanel(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {morePanel === "transcript" && (
                <>
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    rows={10}
                  />
                  <div className="actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={applyTranscript}
                    >
                      Generate captions
                    </button>
                  </div>
                </>
              )}

              {morePanel === "motion" && (
                <>
                  <div className="chip-row">
                    {PRESETS.map((p) => (
                      <button
                        key={p}
                        className="chip"
                        type="button"
                        data-active={p === preset}
                        onClick={() => setPreset(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <div className="stage">
                    <h2
                      ref={stageRef}
                      style={{
                        fontFamily: fontStack(brand.fonts?.heading ?? brand.fontDisplay),
                        color: brand.secondaryColor,
                      }}
                    >
                      {hookLine}
                    </h2>
                  </div>
                </>
              )}

              {morePanel === "fonts" && (
                <div className="font-grid">
                  {fonts.map((font) => (
                    <div key={font.id} className="font-card">
                      <p className="name" style={{ fontFamily: fontStack(font.id) }}>
                        {font.family}
                      </p>
                      <p className="meta">
                        {font.role} · {font.useCases.slice(0, 2).join(" · ")}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {morePanel === "cards" && (
                <>
                  <div className="chip-row">
                    {cards.map((c) => (
                      <button
                        key={c.id}
                        className="chip"
                        type="button"
                        data-active={c.id === cardId}
                        onClick={() => setCardId(c.id)}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={2}
                    value={cardText}
                    onChange={(e) => setCardText(e.target.value)}
                  />
                  <div className="card-preview">
                    {cardUrl ? <img src={cardUrl} alt="Title card" /> : null}
                  </div>
                </>
              )}
            </>
          )}

          <p className="status">
            {ready ? "Fonts ready" : "Loading fonts…"} · {brandedCues.length} cues ·{" "}
            {brand.name ?? brand.channelName}
          </p>
        </main>

        <aside className="panel">
          <h3>Cue timeline</h3>
          <div className="actions" style={{ marginBottom: "0.55rem" }}>
            <button type="button" className="btn" onClick={() => setCues((c) => addCue(c))}>
              Add
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => setCues((c) => splitCue(c, selectedCue))}
            >
              Split
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => setCues((c) => mergeCues(c, selectedCue))}
            >
              Merge
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => setCues((c) => normalizeCues(c))}
            >
              Fix
            </button>
          </div>
          <div className="cue-list">
            {cues.map((cue, index) => (
              <div
                className="cue-row"
                key={`${cue.start}-${index}`}
                data-selected={index === selectedCue}
                onClick={() => setSelectedCue(index)}
              >
                <header>
                  <span>
                    #{index + 1} · {cue.style ?? "subtitle"}
                  </span>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCues((c) => removeCue(c, index));
                      setSelectedCue((i) => Math.max(0, Math.min(i, cues.length - 2)));
                    }}
                  >
                    Remove
                  </button>
                </header>
                <div className="cue-times">
                  <input
                    type="number"
                    step="0.05"
                    value={cue.start}
                    onChange={(e) =>
                      setCues((c) =>
                        updateCue(c, index, { start: Number(e.target.value) }),
                      )
                    }
                  />
                  <input
                    type="number"
                    step="0.05"
                    value={cue.end}
                    onChange={(e) =>
                      setCues((c) =>
                        updateCue(c, index, { end: Number(e.target.value) }),
                      )
                    }
                  />
                </div>
                <textarea
                  rows={2}
                  value={cue.text}
                  onChange={(e) =>
                    setCues((c) => updateCue(c, index, { text: e.target.value }))
                  }
                />
                <select
                  value={cue.style ?? "subtitle"}
                  onChange={(e) =>
                    setCues((c) =>
                      updateCue(c, index, {
                        style: e.target.value as CaptionStyleId,
                      }),
                    )
                  }
                >
                  {STYLE_IDS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<App />);
