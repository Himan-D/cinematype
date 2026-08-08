import type { CaptionCue } from "../video/captions";

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
