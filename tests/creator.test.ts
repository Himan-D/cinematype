import { expect, test } from "bun:test";
import {
  addCue,
  applyBrandToCues,
  ffmpegBurnInCommand,
  normalizeCues,
  retimeCues,
  transcriptToCues,
  updateCue,
  type BrandKit,
} from "../src/video";

test("transcriptToCues builds timed lines", () => {
  const cues = transcriptToCues("Hello world.\n\nThis is a second thought about growth.", {
    maxWords: 4,
    wpm: 120,
  });
  expect(cues.length).toBeGreaterThan(1);
  expect(cues[0]!.start).toBe(0);
  expect(cues[0]!.end).toBeGreaterThan(cues[0]!.start);
  expect(cues.at(-1)!.end).toBeGreaterThan(cues[0]!.end);
});

test("retimeCues scales timings", () => {
  const cues = transcriptToCues("One two three four five six", { maxWords: 3 });
  const faster = retimeCues(cues, { scale: 0.5 });
  expect(faster[0]!.end).toBeLessThan(cues[0]!.end);
});

test("cue editors work", () => {
  let cues = transcriptToCues("A B C D", { maxWords: 2 });
  cues = updateCue(cues, 0, { text: "Edited" });
  expect(cues[0]!.text).toBe("Edited");
  cues = addCue(cues);
  expect(cues.length).toBeGreaterThan(1);
  cues = normalizeCues(cues);
  expect(cues.every((c) => c.end > c.start)).toBe(true);
});

test("applyBrandToCues stamps lower-third", () => {
  const brand: BrandKit = {
    channelName: "Demo",
    primaryColor: "#fff",
    secondaryColor: "#000",
    backgroundColor: "#111",
    fontDisplay: "bebas-neue",
    fontBody: "dm-sans",
    lowerThirdTitle: "Alex",
    lowerThirdSubtitle: "Host",
  };
  const cues = applyBrandToCues(
    [{ start: 0, end: 2, text: "Hi", style: "lower-third" }],
    brand,
  );
  expect(cues[0]!.text).toContain("Alex");
});

test("ffmpegBurnInCommand includes filter", () => {
  const cmd = ffmpegBurnInCommand({
    input: "in.mp4",
    output: "out.mp4",
    subtitles: "captions.ass",
  });
  expect(cmd).toContain("ffmpeg");
  expect(cmd).toContain("ass=");
  expect(cmd).toContain("out.mp4");
});
