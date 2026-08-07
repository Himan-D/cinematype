import type { CaptionCue } from "../video/captions";
import type { CinematypePlugin } from "./types";

export interface RemotionCaptionSequence {
  id: string;
  from: number; // frames
  durationInFrames: number;
  text: string;
  style?: CaptionCue["style"];
}

/** Map cues to Remotion sequence blocks at a given fps */
export function cuesToRemotionSequence(
  cues: CaptionCue[],
  fps = 30,
): RemotionCaptionSequence[] {
  return cues.map((cue, i) => {
    const from = Math.round(cue.start * fps);
    const end = Math.round(cue.end * fps);
    return {
      id: `cue-${i + 1}`,
      from,
      durationInFrames: Math.max(1, end - from),
      text: cue.text,
      style: cue.style,
    };
  });
}

export const remotionPlugin: CinematypePlugin = {
  id: "remotion",
  name: "Remotion",
  description: "JSON sequence data for Remotion <Series> / caption comps.",
  platforms: ["Remotion"],
  export: (ctx) => {
    const fps = 30;
    const sequence = cuesToRemotionSequence(ctx.cues, fps);
    const sample = `import { AbsoluteFill, Sequence } from "remotion";

const captions = ${JSON.stringify(sequence, null, 2)} as const;

export const CinematypeCaptions: React.FC = () => (
  <AbsoluteFill>
    {captions.map((c) => (
      <Sequence key={c.id} from={c.from} durationInFrames={c.durationInFrames}>
        <div style={{
          position: "absolute", bottom: "12%", width: "100%",
          textAlign: "center", color: "${ctx.brand.secondaryColor}",
          fontFamily: "${ctx.brand.fontDisplay}", fontSize: 64, fontWeight: 700,
          textShadow: "0 2px 16px rgba(0,0,0,0.6)",
        }}>{c.text}</div>
      </Sequence>
    ))}
  </AbsoluteFill>
);
`;
    return {
      files: [
        {
          filename: "remotion-captions.json",
          mime: "application/json",
          content: JSON.stringify({ fps, brand: ctx.brand, sequence }, null, 2),
        },
        {
          filename: "CinematypeCaptions.tsx",
          mime: "text/plain",
          content: sample,
          note: "Drop into a Remotion project and adjust styling",
        },
      ],
      notes: ["Use remotion-captions.json or the generated component as a starting point."],
      data: { fps, sequence },
    };
  },
};
