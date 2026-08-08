import { describe, expect, test } from "bun:test";
import {
  DEFAULT_BRAND_KIT,
  applyEmphasisMarkers,
  batchExportFormats,
  createPlugin,
  createTeamBrandPack,
  detectEmphasis,
  detectLanguage,
  getPlatformCaptionDefaults,
  listAllCreatorTemplates,
  listCustomFonts,
  localizeCues,
  parseTeamBrandPack,
  planLocalWhisper,
  registerCreatorTemplate,
  registerCustomFont,
  registerPlugin,
  runPlugin,
  scoreCaptionQuality,
  seedCommunityExamples,
  smartRetime,
  suggestAutoStyle,
  transcriptToCues,
  unregisterPlugin,
  wordsToAssKaraokeLine,
  wordsToKaraokeWordCues,
} from "../src/index";

describe("phase2 smart + karaoke + batch", () => {
  test("detectEmphasis finds numbers and keywords", () => {
    const spans = detectEmphasis("Stop scrolling and double your conversions NOW");
    expect(spans.length).toBeGreaterThan(0);
    expect(applyEmphasisMarkers("Save this FREE tip")).toContain("**");
  });

  test("smartRetime + scoreCaptionQuality", () => {
    const cues = transcriptToCues("One two three four five six seven eight nine ten.", {
      maxWords: 3,
      wpm: 400,
    });
    const smart = smartRetime(cues, { targetWpm: 150 });
    const report = scoreCaptionQuality(smart);
    expect(report.cueCount).toBe(smart.length);
    expect(report.score).toBeGreaterThan(0);
  });

  test("karaoke word cues and ASS line", () => {
    const words = wordsToKaraokeWordCues("hello world again", { secondsPerWord: 0.4 });
    expect(words).toHaveLength(3);
    expect(words[0]!.style).toBe("karaoke");
    expect(wordsToAssKaraokeLine("hello world")).toContain("{\\k");
  });

  test("batchExportFormats writes three formats", () => {
    const cues = transcriptToCues("Hook line here");
    const items = batchExportFormats({
      cues,
      brand: DEFAULT_BRAND_KIT,
      aspect: "youtube-shorts",
    });
    expect(items.map((i) => i.filename).sort()).toEqual([
      "captions.ass",
      "captions.srt",
      "captions.vtt",
    ]);
  });

  test("platform caption defaults", () => {
    const d = getPlatformCaptionDefaults("TikTok");
    expect(d.aspect).toBe("tiktok");
    expect(d.preferredStyle).toBe("burn");
  });

  test("custom fonts registry", () => {
    registerCustomFont({ id: "acme-sans", family: "Acme Sans" });
    expect(listCustomFonts().some((f) => f.id === "acme-sans")).toBe(true);
  });
});

describe("phase3 auto + language + whisper plan", () => {
  test("suggestAutoStyle picks shorts hook", () => {
    const s = suggestAutoStyle({
      transcript: "Stop scrolling this viral hook",
      platform: "tiktok",
    });
    expect(s.templateId).toBe("shorts-hook");
  });

  test("detectLanguage + localizeCues rtl", () => {
    expect(detectLanguage("Hello world")).toBe("en");
    expect(detectLanguage("مرحبا بكم")).toBe("ar");
    const cues = localizeCues(transcriptToCues("مرحبا"), "ar");
    expect(cues[0]!.align).toBe("end");
  });

  test("planLocalWhisper missing file", () => {
    const plan = planLocalWhisper({ input: "/tmp/definitely-missing-ct-audio.wav" });
    expect(plan.available).toBe(false);
  });
});

describe("phase4 sdk + community + team", () => {
  test("registerPlugin community destination", () => {
    const plugin = createPlugin({
      id: "test-csv-dest",
      name: "Test CSV",
      description: "test",
      platforms: ["Test"],
      export: (ctx) => ({
        files: [
          {
            filename: "cues.csv",
            mime: "text/csv",
            content: ctx.cues.map((c) => c.text).join("\n"),
          },
        ],
      }),
    });
    registerPlugin(plugin);
    const result = runPlugin("test-csv-dest", {
      cues: [{ start: 0, end: 1, text: "hi" }],
      brand: DEFAULT_BRAND_KIT,
      aspect: "youtube",
    });
    expect(result.files?.[0]?.content).toContain("hi");
    unregisterPlugin("test-csv-dest");
  });

  test("community templates seed", () => {
    seedCommunityExamples();
    const ids = listAllCreatorTemplates().map((t) => t.id);
    expect(ids).toContain("meme-punch");
    expect(ids).toContain("education-clean");
  });

  test("team brand pack roundtrip", () => {
    const pack = createTeamBrandPack("Acme Agency", [DEFAULT_BRAND_KIT], DEFAULT_BRAND_KIT.id);
    const again = parseTeamBrandPack(
      JSON.stringify(pack),
    );
    expect(again.team).toBe("Acme Agency");
    expect(again.kits.length).toBe(1);
  });

  test("registerCreatorTemplate rejects duplicates", () => {
    expect(() =>
      registerCreatorTemplate({
        id: "youtube-opener",
        label: "x",
        description: "x",
        aspect: "youtube",
        font: "inter",
        cues: [],
      }),
    ).toThrow();
  });
});
