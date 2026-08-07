import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Onboarding } from "./Onboarding";
import {
  addCue,
  applyBrandCssVars,
  applyBrandToCues,
  brandOverlayOptions,
  createVideoOverlay,
  downloadCanvas,
  downloadPluginPack,
  downloadSubtitles,
  ffmpegRecipe,
  fontStack,
  getSafeZone,
  kinetic,
  listCreatorTemplates,
  listFonts,
  listFrameSizes,
  listPlugins,
  listTitleCardPresets,
  loadBrandKit,
  loadFonts,
  normalizeCues,
  parseSrt,
  removeCue,
  renderTitleCard,
  retimeCues,
  runPlugin,
  saveBrandKit,
  shiftCues,
  transcriptToCues,
  updateCue,
  whisperJsonToCues,
  type AspectId,
  type BrandKit,
  type CaptionCue,
  type KineticPreset,
  type PluginId,
} from "../src/index";

type Tab =
  | "studio"
  | "transcript"
  | "plugins"
  | "brand"
  | "motion"
  | "fonts"
  | "cards"
  | "export";

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

const DEMO_VIDEO =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

function App() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("studio");
  const [templateId, setTemplateId] = useState("youtube-opener");
  const [aspect, setAspect] = useState<AspectId>("youtube");
  const [cues, setCues] = useState<CaptionCue[]>([]);
  const [videoSrc, setVideoSrc] = useState(DEMO_VIDEO);
  const [showSafe, setShowSafe] = useState(true);
  const [transcript, setTranscript] = useState(
    "Stop scrolling.\n\nThis one setting changed everything for my channel.\n\nSave this for later and try it on your next upload.",
  );
  const [brand, setBrand] = useState<BrandKit>(() => loadBrandKit());
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

  const fonts = useMemo(() => listFonts(), []);
  const templates = useMemo(() => listCreatorTemplates(), []);
  const frames = useMemo(() => listFrameSizes(), []);
  const cards = useMemo(() => listTitleCardPresets(), []);
  const plugins = useMemo(() => listPlugins(), []);
  const template = templates.find((t) => t.id === templateId) ?? templates[0]!;
  const safe = getSafeZone(aspect);
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

  useEffect(() => {
    void loadFonts().then(() => setReady(true));
  }, []);

  useEffect(() => {
    setCues(template.cues.map((c) => ({ ...c })));
    setAspect(template.aspect);
    const title = template.cues.find((c) => c.style === "title");
    if (title) setHookLine(title.text);
    if (template.titleCard) {
      setCardId(template.titleCard.id);
      setCardText(title?.text ?? cardText);
    }
  }, [templateId]);

  useEffect(() => {
    saveBrandKit(brand);
    applyBrandCssVars(brand);
  }, [brand]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || !ready || tab !== "motion") return;
    el.textContent = hookLine;
    const ctrl = kinetic(el, {
      preset,
      mode: preset === "typewriter" || preset === "scramble" ? "chars" : "words",
      autoplay: true,
    });
    return () => ctrl.destroy();
  }, [preset, ready, tab, hookLine]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !ready) return;
    if (tab !== "studio" && tab !== "transcript" && tab !== "export") return;
    const overlay = createVideoOverlay(video, brandedCues, {
      container: wrapRef.current ?? undefined,
      ...brandOverlayOptions(brand),
    });
    void video.play().catch(() => {});
    return () => overlay.destroy();
  }, [ready, tab, brandedCues, brand, videoSrc, aspect]);

  useEffect(() => {
    if (!ready || (tab !== "cards" && tab !== "export" && tab !== "studio")) return;
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
  }, [ready, tab, cardId, cardText, brand]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

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
  };

  const applyTranscript = () => {
    const trimmed = transcript.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        setCues(whisperJsonToCues(JSON.parse(trimmed)));
        setTab("studio");
        return;
      } catch {
        // fall through to plain text
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

  const copyCurl = async () => {
    const cmd =
      "curl -fsSL https://raw.githubusercontent.com/Himan-D/cinematype/main/scripts/get-cinematype.sh | bash";
    try {
      await navigator.clipboard.writeText(cmd);
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <Onboarding
        onGoTranscript={() => setTab("transcript")}
        onGoPlugins={() => setTab("plugins")}
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
          <h1 className="brand">CINEMATYPE STUDIO</h1>
          <p className="tag">
            Paste a transcript → time captions → download CapCut / YouTube pack.
            Smooth path from script to upload.
          </p>
        </div>
        <nav className="tabs" aria-label="Studio sections">
          {(
            [
              ["studio", "Studio"],
              ["transcript", "Transcript"],
              ["plugins", "Plugins"],
              ["brand", "Brand"],
              ["motion", "Motion"],
              ["fonts", "Fonts"],
              ["cards", "Cards"],
              ["export", "Export"],
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

          <label className="field">Frame</label>
          <select
            value={aspect}
            onChange={(e) => setAspect(e.target.value as AspectId)}
          >
            {frames.map((f) => (
              <option key={f.id} value={f.id}>
                {f.platform} · {f.label}
              </option>
            ))}
          </select>

          <label className="field">Hook / title card text</label>
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
        </aside>

        <main className="panel">
          {(tab === "studio" || tab === "transcript" || tab === "export") && (
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

          {tab === "plugins" && (
            <>
              <h3>Export plugins · {plugins.length}</h3>
              <p className="notes">
                One-click packs for CapCut, YouTube, TikTok, Premiere, DaVinci,
                FFmpeg, Remotion, Whisper, OBS, and Reels.
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
                {pluginNotes || "Select a plugin, then Download pack or Preview."}
              </pre>
            </>
          )}

          {tab === "transcript" && (
            <>
              <h3>Transcript → cues</h3>
              <p className="notes">
                Paste plain text or Whisper <code>verbose_json</code>. Blank lines
                become cue breaks. Timing is approximate — fine-tune in the cue list.
              </p>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={10}
              />
              <div className="actions">
                <button type="button" className="btn btn-primary" onClick={applyTranscript}>
                  Generate captions
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    setCues(
                      transcriptToCues(transcript, {
                        style: "karaoke",
                        maxWords: 10,
                      }),
                    )
                  }
                >
                  Karaoke style
                </button>
              </div>
            </>
          )}

          {tab === "brand" && (
            <>
              <h3>Brand kit</h3>
              <p className="notes">Saved in this browser (localStorage).</p>
              <label className="field">Channel name</label>
              <input
                value={brand.channelName}
                onChange={(e) => setBrand({ ...brand, channelName: e.target.value })}
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
              <label className="field">Primary color</label>
              <input
                type="color"
                value={brand.primaryColor}
                onChange={(e) => setBrand({ ...brand, primaryColor: e.target.value })}
              />
              <label className="field">Text color</label>
              <input
                type="color"
                value={brand.secondaryColor}
                onChange={(e) =>
                  setBrand({ ...brand, secondaryColor: e.target.value })
                }
              />
              <label className="field">Background</label>
              <input
                type="color"
                value={brand.backgroundColor}
                onChange={(e) =>
                  setBrand({ ...brand, backgroundColor: e.target.value })
                }
              />
              <label className="field">Display font</label>
              <select
                value={brand.fontDisplay}
                onChange={(e) => setBrand({ ...brand, fontDisplay: e.target.value })}
              >
                {fonts.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.family}
                  </option>
                ))}
              </select>
            </>
          )}

          {tab === "motion" && (
            <>
              <h3>Kinetic presets</h3>
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
                    fontFamily: fontStack(brand.fontDisplay),
                    color: brand.secondaryColor,
                  }}
                >
                  {hookLine}
                </h2>
              </div>
            </>
          )}

          {tab === "fonts" && (
            <>
              <h3>Catalog · {fonts.length}</h3>
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
            </>
          )}

          {(tab === "cards" || tab === "export") && (
            <>
              <h3>Title card</h3>
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

          {tab === "export" && (
            <>
              <h3>Downloads</h3>
              <div className="actions">
                <button
                  type="button"
                  className="btn btn-primary"
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
                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    downloadSubtitles(brandedCues, "ass", `${templateId}.ass`)
                  }
                >
                  ASS
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
              <p className="notes">
                Drop SRT into CapCut / Premiere / YouTube. Use ASS with the command
                above for styled burn-in.
              </p>
            </>
          )}

          <p className="status">
            {ready ? "Fonts ready" : "Loading fonts…"} · {brandedCues.length} cues ·{" "}
            {brand.channelName}
          </p>
        </main>

        <aside className="panel">
          <h3>Cue timeline</h3>
          <div className="actions" style={{ marginBottom: "0.55rem" }}>
            <button
              type="button"
              className="btn"
              onClick={() => setCues((c) => addCue(c))}
            >
              Add cue
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => setCues((c) => normalizeCues(c))}
            >
              Fix overlaps
            </button>
          </div>
          <div className="cue-list">
            {cues.map((cue, index) => (
              <div className="cue-row" key={`${cue.start}-${index}`}>
                <header>
                  <span>
                    #{index + 1} · {cue.style ?? "subtitle"}
                  </span>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => setCues((c) => removeCue(c, index))}
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
                        style: e.target.value as CaptionCue["style"],
                      }),
                    )
                  }
                >
                  {(
                    [
                      "subtitle",
                      "title",
                      "lower-third",
                      "karaoke",
                      "chapter",
                      "end-card",
                      "speaker",
                      "burn",
                    ] as const
                  ).map((s) => (
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
