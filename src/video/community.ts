/**
 * Phase 4 — community creator templates registry.
 */
import type { CreatorTemplate, TitleCardPreset } from "./presets";
import { CREATOR_TEMPLATES, TITLE_CARD_PRESETS } from "./presets";

const communityTemplates = new Map<string, CreatorTemplate>();
const communityCards = new Map<string, TitleCardPreset>();

export function registerCreatorTemplate(template: CreatorTemplate): void {
  if (CREATOR_TEMPLATES[template.id] || communityTemplates.has(template.id)) {
    throw new Error(`Template id "${template.id}" already registered`);
  }
  communityTemplates.set(template.id, template);
}

export function unregisterCreatorTemplate(id: string): boolean {
  return communityTemplates.delete(id);
}

export function listCommunityTemplates(): CreatorTemplate[] {
  return [...communityTemplates.values()];
}

export function listAllCreatorTemplates(): CreatorTemplate[] {
  return [
    ...Object.values(CREATOR_TEMPLATES),
    ...communityTemplates.values(),
  ];
}

export function getAnyCreatorTemplate(id: string): CreatorTemplate {
  const builtIn = CREATOR_TEMPLATES[id];
  if (builtIn) return builtIn;
  const community = communityTemplates.get(id);
  if (community) return community;
  throw new Error(
    `Unknown template "${id}". Available: ${listAllCreatorTemplates()
      .map((t) => t.id)
      .join(", ")}`,
  );
}

export function registerTitleCardPreset(preset: TitleCardPreset): void {
  if (TITLE_CARD_PRESETS[preset.id] || communityCards.has(preset.id)) {
    throw new Error(`Title card id "${preset.id}" already registered`);
  }
  communityCards.set(preset.id, preset);
}

export function listAllTitleCardPresets(): TitleCardPreset[] {
  return [
    ...Object.values(TITLE_CARD_PRESETS),
    ...communityCards.values(),
  ];
}

/** Seed example community templates (idempotent) */
export function seedCommunityExamples(): void {
  if (!communityTemplates.has("meme-punch")) {
    registerCreatorTemplate({
      id: "meme-punch",
      label: "Meme / Punchy",
      description: "Community: short punch lines with burn captions",
      aspect: "tiktok",
      font: "anton",
      kinetic: "pop",
      cues: [
        { start: 0, end: 1.4, text: "WAIT FOR IT", style: "title" },
        { start: 1.4, end: 3.2, text: "Nobody expected this.", style: "burn" },
        { start: 3.2, end: 5, text: "Save this.", style: "burn" },
      ],
    });
  }
  if (!communityTemplates.has("education-clean")) {
    registerCreatorTemplate({
      id: "education-clean",
      label: "Education Clean",
      description: "Community: calm teaching captions",
      aspect: "youtube",
      font: "dm-sans",
      kinetic: "fade-up",
      cues: [
        { start: 0, end: 2.5, text: "Today’s lesson", style: "chapter" },
        { start: 2.5, end: 6, text: "Here’s the core idea in one sentence.", style: "subtitle" },
        { start: 6, end: 9, text: "Try it once this week.", style: "subtitle" },
      ],
    });
  }
}
