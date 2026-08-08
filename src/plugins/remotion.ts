import type { BrandKit } from "../video/brand";
import type { CaptionStyle } from "../video/brand";
import type { CinematypePlugin } from "./types";
import { cuesToRemotionSequence } from "./remotion-sequence";

export type { RemotionCaptionSequence } from "./remotion-sequence";
export { cuesToRemotionSequence } from "./remotion-sequence";

function remotionComponentSource(
  brand: BrandKit,
  style: CaptionStyle | undefined,
  fps: number,
): string {
  const caption = style ?? brand.caption;
  const color = caption?.color ?? brand.secondaryColor;
  const highlight = caption?.highlightColor ?? brand.primaryColor;
  const fontSize = caption?.fontSize ?? 64;
  const font = brand.fonts?.caption ?? brand.fontBody ?? brand.fontDisplay;
  const position = caption?.position ?? "bottom";
  const bottom = position === "top" ? "auto" : position === "center" ? "40%" : "12%";
  const top = position === "top" ? "12%" : "auto";

  return `import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import captionsJson from "./remotion-captions.json";

type Cap = { id: string; from: number; durationInFrames: number; text: string; style?: string };

const captions = captionsJson.sequence as Cap[];
const brand = captionsJson.brand as {
  primaryColor: string; secondaryColor: string; fontDisplay: string;
};

function CaptionBlock({ text, style }: { text: string; style?: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 120 } });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const scale = interpolate(enter, [0, 1], [0.92, 1]);
  const isKaraoke = style === "karaoke";
  return (
    <div style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: "${top}",
      bottom: "${bottom}",
      textAlign: "center",
      color: isKaraoke ? "${highlight}" : "${color}",
      fontFamily: "${font}",
      fontSize: ${fontSize},
      fontWeight: 700,
      opacity,
      transform: \`scale(\${scale})\`,
      textShadow: "0 2px 16px rgba(0,0,0,0.65)",
      padding: "0 8%",
    }}>{text}</div>
  );
}

/** Phase 4 Remotion depth — spring enter + brand CaptionStyle */
export const CinematypeCaptions: React.FC = () => (
  <AbsoluteFill>
    {captions.map((c) => (
      <Sequence key={c.id} from={c.from} durationInFrames={c.durationInFrames}>
        <CaptionBlock text={c.text} style={c.style} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

export const fps = ${fps};
`;
}

export const remotionPlugin: CinematypePlugin = {
  id: "remotion",
  name: "Remotion",
  description: "Branded Remotion sequence + spring caption component.",
  platforms: ["Remotion"],
  export: (ctx) => {
    const fps = 30;
    const sequence = cuesToRemotionSequence(ctx.cues, fps);
    const sample = remotionComponentSource(ctx.brand, ctx.brand.caption, fps);
    return {
      files: [
        {
          filename: "remotion-captions.json",
          mime: "application/json",
          content: JSON.stringify(
            { fps, brand: ctx.brand, style: ctx.brand.caption, sequence },
            null,
            2,
          ),
        },
        {
          filename: "CinematypeCaptions.tsx",
          mime: "text/plain",
          content: sample,
          note: "Drop into a Remotion project — uses spring enter + brand CaptionStyle",
        },
      ],
      notes: [
        "Use remotion-captions.json as data and CinematypeCaptions.tsx as the composition.",
        "Adjust fontFamily to a loaded Remotion font if needed.",
      ],
      data: { fps, sequence },
    };
  },
};
