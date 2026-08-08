import { expect, test } from "bun:test";
import {
  createProject,
  isCinematypeProject,
  mergeCues,
  parseProject,
  PLATFORM_PRESETS,
  resolvePlatformPreset,
  serializeProject,
  splitCue,
  type CaptionCue,
} from "../src/video";

const sampleCues: CaptionCue[] = [
  { start: 0, end: 2, text: "Stop scrolling right now", style: "burn" },
  { start: 2, end: 4, text: "This changes everything", style: "burn" },
];

test("splitCue splits at midpoint by default", () => {
  const next = splitCue(sampleCues, 0);
  expect(next.length).toBe(3);
  expect(next[0]!.text).toBe("Stop scrolling");
  expect(next[1]!.text).toBe("right now");
  expect(next[0]!.end).toBe(next[1]!.start);
  expect(next[0]!.start).toBe(0);
  expect(next[1]!.end).toBe(2);
});

test("splitCue respects atWord", () => {
  const next = splitCue(sampleCues, 0, 1);
  expect(next[0]!.text).toBe("Stop");
  expect(next[1]!.text).toBe("scrolling right now");
});

test("mergeCues joins adjacent cues", () => {
  const next = mergeCues(sampleCues, 0);
  expect(next.length).toBe(1);
  expect(next[0]!.text).toBe("Stop scrolling right now This changes everything");
  expect(next[0]!.start).toBe(0);
  expect(next[0]!.end).toBe(4);
});

test("project roundtrip serialize/parse", () => {
  const project = createProject({
    platform: "youtube-shorts",
    transcript: "Hello world",
    cues: sampleCues,
    hookLine: "Stop scrolling",
    brand: {
      channelName: "Demo",
      primaryColor: "#d8ff4a",
      secondaryColor: "#fff",
      backgroundColor: "#0b0b0f",
      fontDisplay: "bebas-neue",
      fontBody: "dm-sans",
    },
  });
  expect(project.version).toBe(1);
  expect(project.style.fontSize).toBeGreaterThan(0);
  expect(project.brand.fonts?.heading).toBe("bebas-neue");

  const raw = serializeProject(project);
  expect(raw).toContain('"version": 1');
  const parsed = parseProject(raw);
  expect(parsed.cues).toHaveLength(2);
  expect(parsed.platform).toBe("youtube-shorts");
  expect(parsed.hookLine).toBe("Stop scrolling");
  expect(isCinematypeProject(parsed)).toBe(true);
});

test("isCinematypeProject rejects invalid payloads", () => {
  expect(isCinematypeProject(null)).toBe(false);
  expect(isCinematypeProject({ version: 2 })).toBe(false);
  expect(() => parseProject("{bad")).toThrow();
});

test("PLATFORM_PRESETS map creator names to AspectId", () => {
  expect(PLATFORM_PRESETS["YouTube Shorts"]).toBe("youtube-shorts");
  expect(PLATFORM_PRESETS.TikTok).toBe("tiktok");
  expect(PLATFORM_PRESETS["Instagram Reels"]).toBe("reels");
  expect(PLATFORM_PRESETS.YouTube).toBe("youtube");
  expect(resolvePlatformPreset("TikTok")).toBe("tiktok");
  expect(resolvePlatformPreset("youtube-shorts")).toBe("youtube-shorts");
});
