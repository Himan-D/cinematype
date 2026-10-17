import { fontStack } from "../../src/index";
import { MORE_PANELS, PRESETS } from "../constants";
import type { StudioState } from "../use-studio";

export function MoreTab({ s }: { s: StudioState }) {
  const { morePanel } = s;
  return (
    <>
      <div className="chip-row" style={{ marginBottom: "0.75rem" }}>
        {MORE_PANELS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className="chip"
            data-active={morePanel === id}
            onClick={() => s.setMorePanel(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {morePanel === "transcript" && (
        <>
          <textarea
            value={s.transcript}
            onChange={(e) => s.setTranscript(e.target.value)}
            rows={10}
          />
          <div className="actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={s.applyTranscript}
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
                data-active={p === s.preset}
                onClick={() => s.setPreset(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="stage">
            <h2
              ref={s.stageRef}
              style={{
                fontFamily: fontStack(s.brand.fonts?.heading ?? s.brand.fontDisplay),
                color: s.brand.secondaryColor,
              }}
            >
              {s.hookLine}
            </h2>
          </div>
        </>
      )}

      {morePanel === "fonts" && (
        <div className="font-grid">
          {s.fonts.map((font) => (
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
            {s.cards.map((c) => (
              <button
                key={c.id}
                className="chip"
                type="button"
                data-active={c.id === s.cardId}
                onClick={() => s.setCardId(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <textarea
            rows={2}
            value={s.cardText}
            onChange={(e) => s.setCardText(e.target.value)}
          />
          <div className="card-preview">
            {s.cardUrl ? <img src={s.cardUrl} alt="Title card" /> : null}
          </div>
        </>
      )}
    </>
  );
}
