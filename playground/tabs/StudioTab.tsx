import { transcriptToCues } from "../../src/index";
import type { StudioState } from "../use-studio";

export function StudioTab({ s }: { s: StudioState }) {
  return (
    <>
      <h3 style={{ marginTop: "1rem" }}>Transcript</h3>
      <p className="notes">
        Paste voiceover or Whisper <code>verbose_json</code>. Generate, then
        fine-tune in the cue list.
      </p>
      <textarea
        value={s.transcript}
        onChange={(e) => s.setTranscript(e.target.value)}
        rows={6}
      />
      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={s.applyTranscript}>
          Generate captions
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            s.setCues(
              transcriptToCues(s.transcript, {
                style: "karaoke",
                maxWords: 10,
              }),
            );
            s.setSelectedCue(0);
          }}
        >
          Karaoke style
        </button>
      </div>
    </>
  );
}
