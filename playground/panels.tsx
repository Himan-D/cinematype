import {
  mergeCues,
  normalizeCues,
  removeCue,
  retimeCues,
  resolvePlatformPreset,
  shiftCues,
  splitCue,
  updateCue,
  addCue,
  type CaptionStyleId,
} from "../src/index";
import { STYLE_IDS } from "./constants";
import type { StudioState } from "./use-studio";

export function ProjectPanel({ s }: { s: StudioState }) {
  return (
    <aside className="panel">
      <h3>Project</h3>
      <label className="field">Template</label>
      <select
        value={s.templateId}
        onChange={(e) => s.setTemplateId(e.target.value)}
      >
        {s.templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>

      <label className="field">Platform</label>
      <select
        value={s.platformLabel}
        onChange={(e) => {
          const label = e.target.value;
          s.setPlatformLabel(label);
          s.setAspect(resolvePlatformPreset(label));
        }}
      >
        {s.platforms.map((p) => (
          <option key={p.label} value={p.label}>
            {p.label}
          </option>
        ))}
      </select>

      <label className="field">Hook / title text</label>
      <input value={s.hookLine} onChange={(e) => s.setHook(e.target.value)} />

      <div className="actions" style={{ marginTop: "0.5rem" }}>
        <label className="file-btn">
          Upload video
          <input
            type="file"
            accept="video/*"
            onChange={(e) => s.onVideoFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <label className="file-btn">
          Import SRT
          <input
            type="file"
            accept=".srt,text/plain"
            onChange={(e) => void s.onSrtFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <div className="actions" style={{ marginTop: "0.5rem" }}>
        <button type="button" className="btn btn-primary" onClick={s.saveProjectFile}>
          Save .ct
        </button>
        <label className="file-btn">
          Open .ct
          <input
            ref={s.projectInputRef}
            type="file"
            accept=".ct,application/json"
            onChange={(e) => void s.openProjectFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <div className="actions" style={{ marginTop: "0.5rem" }}>
        <button
          type="button"
          className="chip"
          data-active={s.showSafe}
          onClick={() => s.setShowSafe((v) => !v)}
        >
          Safe zone
        </button>
        <button
          type="button"
          className="chip"
          onClick={() => s.setCues((c) => shiftCues(c, -0.25))}
        >
          −0.25s
        </button>
        <button
          type="button"
          className="chip"
          onClick={() => s.setCues((c) => shiftCues(c, 0.25))}
        >
          +0.25s
        </button>
        <button
          type="button"
          className="chip"
          onClick={() => s.setCues((c) => retimeCues(c, { scale: 0.9 }))}
        >
          Faster
        </button>
      </div>

      <p className="notes">
        Safe zone: top {(s.safe.top * 100).toFixed(0)}% · bottom{" "}
        {(s.safe.bottom * 100).toFixed(0)}%. {s.safe.notes[0]}
      </p>
      <p className="kbd-hint">Space play · ↑↓ cues · S split · M merge</p>
    </aside>
  );
}

export function CueTimeline({ s }: { s: StudioState }) {
  return (
    <aside className="panel">
      <h3>Cue timeline</h3>
      <div className="actions" style={{ marginBottom: "0.55rem" }}>
        <button type="button" className="btn" onClick={() => s.setCues((c) => addCue(c))}>
          Add
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => s.setCues((c) => splitCue(c, s.selectedCue))}
        >
          Split
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => s.setCues((c) => mergeCues(c, s.selectedCue))}
        >
          Merge
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => s.setCues((c) => normalizeCues(c))}
        >
          Fix
        </button>
      </div>
      <div className="cue-list">
        {s.cues.map((cue, index) => (
          <div
            className="cue-row"
            key={`${cue.start}-${index}`}
            data-selected={index === s.selectedCue}
            onClick={() => s.setSelectedCue(index)}
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
                  s.setCues((c) => removeCue(c, index));
                  s.setSelectedCue((i) =>
                    Math.max(0, Math.min(i, s.cues.length - 2)),
                  );
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
                  s.setCues((c) =>
                    updateCue(c, index, { start: Number(e.target.value) }),
                  )
                }
              />
              <input
                type="number"
                step="0.05"
                value={cue.end}
                onChange={(e) =>
                  s.setCues((c) =>
                    updateCue(c, index, { end: Number(e.target.value) }),
                  )
                }
              />
            </div>
            <textarea
              rows={2}
              value={cue.text}
              onChange={(e) =>
                s.setCues((c) => updateCue(c, index, { text: e.target.value }))
              }
            />
            <select
              value={cue.style ?? "subtitle"}
              onChange={(e) =>
                s.setCues((c) =>
                  updateCue(c, index, {
                    style: e.target.value as CaptionStyleId,
                  }),
                )
              }
            >
              {STYLE_IDS.map((sid) => (
                <option key={sid} value={sid}>
                  {sid}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </aside>
  );
}
