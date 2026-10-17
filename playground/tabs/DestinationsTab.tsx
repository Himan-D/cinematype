import { downloadCanvas, downloadSubtitles } from "../../src/index";
import type { StudioState } from "../use-studio";

export function DestinationsTab({ s }: { s: StudioState }) {
  return (
    <>
      <h3 style={{ marginTop: "1rem" }}>
        Export destinations · {s.plugins.length}
      </h3>
      <p className="notes">
        One-click packs for editors and platforms. Same brand + cues you previewed.
      </p>
      <div className="chip-row">
        {s.plugins.map((p) => (
          <button
            key={p.id}
            className="chip"
            type="button"
            data-active={p.id === s.pluginId}
            onClick={() => {
              s.setPluginId(p.id);
              s.setPluginNotes(`${p.name}: ${p.description}`);
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
          onClick={() => s.runSelectedPlugin(true)}
        >
          Download pack
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => s.runSelectedPlugin(false)}
        >
          Preview commands
        </button>
      </div>
      <pre className="recipe" style={{ marginTop: "0.75rem" }}>
        {s.pluginNotes || "Select a destination, then Download pack."}
      </pre>

      <h3 style={{ marginTop: "1rem" }}>Formats</h3>
      <div className="actions">
        <button
          type="button"
          className="btn"
          onClick={() =>
            downloadSubtitles(s.brandedCues, "srt", `${s.templateId}.srt`)
          }
        >
          SRT
        </button>
        <button
          type="button"
          className="btn"
          onClick={() =>
            downloadSubtitles(s.brandedCues, "vtt", `${s.templateId}.vtt`)
          }
        >
          VTT
        </button>
        <button type="button" className="btn" onClick={s.downloadAss}>
          ASS (branded)
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            if (s.cardCanvasRef.current) {
              void downloadCanvas(
                s.cardCanvasRef.current,
                `${s.cardId}.png`,
              );
            }
          }}
        >
          Title PNG
        </button>
      </div>
      <h3 style={{ marginTop: "1rem" }}>FFmpeg burn-in</h3>
      <pre className="recipe">{s.recipe}</pre>
    </>
  );
}
