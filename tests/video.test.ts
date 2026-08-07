import { expect, test } from "bun:test";
import {
  CREATOR_TEMPLATES,
  FRAME_SIZES,
  cuesToAss,
  cuesToSrt,
  cuesToVtt,
  exportSubtitles,
  framePixels,
  getCreatorTemplate,
  getTitleCardPreset,
  parseSrt,
} from "../src/video";

const cues = [
  { start: 1.5, end: 3, text: "Hello type", style: "title" as const },
  { start: 3, end: 5.25, text: "Second line", style: "karaoke" as const },
];

test("cuesToVtt emits WebVTT header and cues", () => {
  const vtt = cuesToVtt(cues);
  expect(vtt.startsWith("WEBVTT")).toBe(true);
  expect(vtt).toContain("00:00:01.500 --> 00:00:03.000");
  expect(vtt).toContain("Hello type");
});

test("cuesToSrt emits SubRip timestamps", () => {
  const srt = cuesToSrt(cues);
  expect(srt).toContain("00:00:01,500 --> 00:00:03,000");
  expect(srt).toContain("Hello type");
  expect(parseSrt(srt)).toHaveLength(2);
});

test("cuesToAss emits styles and dialogue", () => {
  const ass = cuesToAss(cues, { title: "demo" });
  expect(ass).toContain("[Script Info]");
  expect(ass).toContain("Dialogue:");
  expect(ass).toContain("Title");
});

test("exportSubtitles switches formats", () => {
  expect(exportSubtitles(cues, "srt")).toContain("-->");
  expect(exportSubtitles(cues, "vtt").startsWith("WEBVTT")).toBe(true);
  expect(exportSubtitles(cues, "ass")).toContain("Dialogue:");
});

test("frame helpers cover social sizes", () => {
  expect(FRAME_SIZES["youtube-shorts"].ratio).toBeCloseTo(9 / 16);
  expect(framePixels("tiktok")).toEqual({ width: 1080, height: 1920 });
});

test("creator templates and title cards exist", () => {
  expect(Object.keys(CREATOR_TEMPLATES).length).toBeGreaterThanOrEqual(5);
  const opener = getCreatorTemplate("youtube-opener");
  expect(opener.cues.length).toBeGreaterThan(0);
  expect(getTitleCardPreset("yt-hook").font).toBe("bebas-neue");
});
