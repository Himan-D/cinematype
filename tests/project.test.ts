import { describe, expect, test } from "bun:test";
import {
  createProject,
  mergeCues,
  parseProject,
  serializeProject,
  splitCue,
  type CaptionCue,
} from "../src/index";

describe("project.ct", () => {
  test("serialize/parse roundtrip", () => {
    const cues: CaptionCue[] = [
      { start: 0, end: 2, text: "Hook", style: "title" },
      { start: 2, end: 5, text: "Value line", style: "burn" },
    ];
    const project = createProject({
      platform: "youtube-shorts",
      aspect: "youtube-shorts",
      templateId: "youtube-opener",
      transcript: "Hook\n\nValue line",
      hookLine: "HOOK",
      cues,
    });
    const raw = serializeProject(project);
    expect(raw).toContain('"version": 1');
    const again = parseProject(raw);
    expect(again.cues).toHaveLength(2);
    expect(again.platform).toBe("youtube-shorts");
    expect(again.brand.channelName).toBeTruthy();
    expect(again.style.fontSize).toBeGreaterThan(0);
  });

  test("parseProject rejects invalid JSON", () => {
    expect(() => parseProject("{")).toThrow();
    expect(() => parseProject("{}")).toThrow();
  });
});

describe("cue split/merge", () => {
  test("splitCue splits words and timing", () => {
    const cues: CaptionCue[] = [
      { start: 0, end: 4, text: "one two three four", style: "burn" },
    ];
    const next = splitCue(cues, 0);
    expect(next).toHaveLength(2);
    expect(next[0]!.text).toBe("one two");
    expect(next[1]!.text).toBe("three four");
    expect(next[0]!.end).toBe(next[1]!.start);
  });

  test("mergeCues joins neighbors", () => {
    const cues: CaptionCue[] = [
      { start: 0, end: 2, text: "Hello", style: "burn" },
      { start: 2, end: 4, text: "world", style: "burn" },
    ];
    const next = mergeCues(cues, 0);
    expect(next).toHaveLength(1);
    expect(next[0]!.text).toBe("Hello world");
    expect(next[0]!.end).toBe(4);
  });
});
