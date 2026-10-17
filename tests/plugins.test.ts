import { expect, test } from "bun:test";
import {
  DEFAULT_BRAND_KIT,
  cuesToRemotionSequence,
  cuesToYoutubeChapters,
  getPlugin,
  listPlugins,
  runPlugin,
  whisperJsonToCues,
} from "../src/index";

const ctx = {
  cues: [
    { start: 0, end: 2, text: "HOOK", style: "title" as const },
    { start: 2, end: 5, text: "Value prop here", style: "burn" as const },
    { start: 5, end: 8, text: "Alex · Host", style: "lower-third" as const },
  ],
  brand: DEFAULT_BRAND_KIT,
  aspect: "youtube" as const,
  title: "HOOK",
};

test("lists all creator plugins", () => {
  const plugins = listPlugins();
  expect(plugins.length).toBe(10);
  expect(
    plugins.map((p) => p.id).sort() as string[],
  ).toEqual(
    [
      "capcut",
      "davinci",
      "ffmpeg",
      "obs",
      "premiere",
      "reels",
      "remotion",
      "tiktok",
      "whisper",
      "youtube",
    ].sort(),
  );
});

test("capcut + youtube packs produce files", () => {
  const capcut = runPlugin("capcut", ctx);
  expect(capcut.files?.some((f) => f.filename.endsWith(".srt"))).toBe(true);
  const yt = runPlugin("youtube", ctx);
  expect(yt.files?.some((f) => f.filename.includes("description"))).toBe(true);
  expect(cuesToYoutubeChapters(ctx.cues)).toContain("0:00");
});

test("whisperJsonToCues parses verbose_json", () => {
  const cues = whisperJsonToCues({
    segments: [
      { start: 0, end: 1.5, text: " Hello" },
      { start: 1.5, end: 3, text: " world" },
    ],
  });
  expect(cues).toHaveLength(2);
  expect(cues[0]!.text).toBe("Hello");
});

test("remotion sequence uses frames", () => {
  const seq = cuesToRemotionSequence(ctx.cues, 30);
  expect(seq[0]!.from).toBe(0);
  expect(seq[0]!.durationInFrames).toBe(60);
  expect(getPlugin("remotion").name).toBe("Remotion");
});

test("ffmpeg plugin returns burn-in command", () => {
  const result = runPlugin("ffmpeg", ctx);
  expect(result.commands?.[0]).toContain("ffmpeg");
  expect(result.files?.[0]?.filename).toBe("captions.ass");
});
