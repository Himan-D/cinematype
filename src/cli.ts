/**
 * cinematype CLI — captions, destinations, projects, and studio
 *
 *   bun run ct -- studio
 *   bun run ct -- captions --text "Stop scrolling" --out hook.srt
 *   bun run ct -- plugin capcut --text "Hook..." --out-dir ./pack
 *   bun run ct -- project save --text "Hook" --out project.ct
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  DEFAULT_BRAND_KIT,
  createProject,
  exportSubtitles,
  getCreatorTemplate,
  listCreatorTemplates,
  listPlugins,
  listTitleCardPresets,
  parseProject,
  runPlugin,
  serializeProject,
  transcriptToCues,
  whisperJsonToCues,
  type AspectId,
  type CaptionCue,
  type PluginId,
  type SubtitleFormat,
} from "./index";

const VERSION = "0.6.0";
const ROOT = join(import.meta.dir, "..");

function printHelp() {
  console.log(`cinematype ${VERSION} — brand once, export captions everywhere

Usage:
  cinematype studio [--port 5180]
  cinematype captions --text "..." [--format srt|vtt|ass] [--out file]
  cinematype captions --file script.txt [--format srt] [--out file]
  cinematype plugin <name> --text "..." [--out-dir ./pack]
  cinematype project save --text "..." [--out project.ct]
  cinematype project open --file project.ct
  cinematype templates
  cinematype plugins
  cinematype doctor
  cinematype help

Destinations (plugin adapters): capcut youtube tiktok reels premiere davinci ffmpeg whisper remotion obs

Quick start:
  curl -fsSL https://raw.githubusercontent.com/Himan-D/cinematype/main/scripts/get-cinematype.sh | bash

Examples:
  cinematype captions --text "Stop scrolling. This changes everything." --out hook.srt
  cinematype plugin capcut --text "Hook line here" --out-dir ./capcut-pack
  cinematype project save --text "Hook.\\n\\nValue." --out my.ct
  cinematype studio
`);
}

function argValue(args: string[], name: string): string | undefined {
  const i = args.indexOf(name);
  if (i === -1) return undefined;
  return args[i + 1];
}

function loadText(args: string[]): string {
  const text = argValue(args, "--text") ?? argValue(args, "-t");
  if (text) return text;
  const file = argValue(args, "--file") ?? argValue(args, "-f");
  if (file) {
    const path = resolve(file);
    if (!existsSync(path)) {
      console.error(`File not found: ${path}`);
      process.exit(1);
    }
    return readFileSync(path, "utf8");
  }
  if (!process.stdin.isTTY) {
    return readFileSync(0, "utf8");
  }
  console.error("Provide --text, --file, or pipe stdin.");
  process.exit(1);
}

function toCues(raw: string): CaptionCue[] {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return whisperJsonToCues(JSON.parse(trimmed));
    } catch {
      // fall through
    }
  }
  return transcriptToCues(trimmed, { style: "burn", maxWords: 6, wpm: 160 });
}

async function cmdStudio(args: string[]) {
  const port = argValue(args, "--port") ?? process.env.PORT ?? "5180";
  console.log(`\nOpening cinematype studio on http://localhost:${port}\n`);
  console.log("   1) Paste transcript / pick a template");
  console.log("   2) Apply brand · preview on video");
  console.log("   3) Destinations → CapCut / YouTube → Download\n");

  const child = Bun.spawn(
    ["bun", "run", join(ROOT, "scripts/serve-playground.ts")],
    {
      cwd: ROOT,
      stdout: "inherit",
      stderr: "inherit",
      env: { ...process.env, PORT: String(port) },
    },
  );
  const code = await child.exited;
  process.exit(code);
}

function cmdCaptions(args: string[]) {
  const format = (argValue(args, "--format") ?? "srt") as SubtitleFormat;
  const out = argValue(args, "--out") ?? argValue(args, "-o") ?? `captions.${format}`;
  const templateId = argValue(args, "--template");
  const cues = templateId
    ? getCreatorTemplate(templateId).cues
    : toCues(loadText(args));
  const body = exportSubtitles(cues, format);
  writeFileSync(resolve(out), body, "utf8");
  console.log(`✓ wrote ${out} (${cues.length} cues, ${format})`);
  console.log("  Drop into CapCut / Premiere / YouTube Studio");
}

function cmdPlugin(args: string[]) {
  const id = args[0] as PluginId | undefined;
  if (!id || id.startsWith("-")) {
    console.error("Usage: cinematype plugin <name> --text \"...\" --out-dir ./pack");
    console.error(`Destinations: ${listPlugins().map((p) => p.id).join(", ")}`);
    process.exit(1);
  }
  const rest = args.slice(1);
  const outDir = resolve(
    argValue(rest, "--out-dir") ?? argValue(rest, "-o") ?? `./cinematype-${id}`,
  );
  const aspect = (argValue(rest, "--aspect") ?? "youtube") as AspectId;
  const title = argValue(rest, "--title") ?? "HOOK";
  const brandName = argValue(rest, "--brand") ?? DEFAULT_BRAND_KIT.channelName;

  const hasInput =
    Boolean(argValue(rest, "--text") ?? argValue(rest, "-t")) ||
    Boolean(argValue(rest, "--file") ?? argValue(rest, "-f")) ||
    !process.stdin.isTTY;

  const cues = hasInput
    ? toCues(loadText(rest))
    : getCreatorTemplate("shorts-hook").cues;

  const result = runPlugin(id, {
    cues,
    brand: { ...DEFAULT_BRAND_KIT, channelName: brandName },
    aspect,
    title,
    videoPath: argValue(rest, "--video") ?? "your-video.mp4",
  });

  mkdirSync(outDir, { recursive: true });
  for (const file of result.files ?? []) {
    if (typeof file.content !== "string") continue;
    const path = join(outDir, file.filename);
    writeFileSync(path, file.content, "utf8");
    console.log(`✓ ${path}`);
  }
  if (result.commands?.length) {
    const cmdPath = join(outDir, "COMMANDS.sh");
    writeFileSync(cmdPath, `${result.commands.join("\n")}\n`, "utf8");
    console.log(`✓ ${cmdPath}`);
  }
  if (result.notes?.length) {
    console.log(`\n${result.notes.map((n) => `• ${n}`).join("\n")}`);
  }
  console.log(`\nPack ready → ${outDir}`);
}

function cmdProject(args: string[]) {
  const sub = args[0];
  const rest = args.slice(1);
  if (sub === "save") {
    const out = resolve(argValue(rest, "--out") ?? argValue(rest, "-o") ?? "project.ct");
    const platform = argValue(rest, "--platform") ?? "youtube-shorts";
    const transcript = loadText(rest);
    const cues = toCues(transcript);
    const project = createProject({
      platform,
      aspect: platform,
      transcript,
      cues,
      brand: { ...DEFAULT_BRAND_KIT },
    });
    writeFileSync(out, serializeProject(project), "utf8");
    console.log(`✓ wrote ${out} (${cues.length} cues · ${project.brand.channelName})`);
    return;
  }
  if (sub === "open") {
    const file = argValue(rest, "--file") ?? argValue(rest, "-f") ?? rest.find((a) => !a.startsWith("-"));
    if (!file) {
      console.error("Usage: cinematype project open --file project.ct");
      process.exit(1);
    }
    const path = resolve(file);
    if (!existsSync(path)) {
      console.error(`File not found: ${path}`);
      process.exit(1);
    }
    const project = parseProject(readFileSync(path, "utf8"));
    console.log(`project: ${path}`);
    console.log(`  platform: ${project.platform}`);
    console.log(`  aspect:   ${project.aspect}`);
    console.log(`  brand:    ${project.brand.name ?? project.brand.channelName}`);
    console.log(`  cues:     ${project.cues.length}`);
    console.log(`  template: ${project.templateId ?? "(none)"}`);
    return;
  }
  console.error("Usage: cinematype project <save|open> ...");
  process.exit(1);
}

function cmdDoctor() {
  console.log(`cinematype ${VERSION}`);
  console.log(`bun: ${typeof Bun !== "undefined" ? Bun.version : "missing"}`);
  console.log(`root: ${ROOT}`);
  console.log(`templates: ${listCreatorTemplates().length}`);
  console.log(`destinations: ${listPlugins().length}`);
  console.log(`title cards: ${listTitleCardPresets().length}`);
  console.log("\nNext:");
  console.log("  cinematype studio");
  console.log('  cinematype captions --text "Stop scrolling" --out hook.srt');
}

function cmdTemplates() {
  for (const t of listCreatorTemplates()) {
    console.log(`${t.id.padEnd(22)} ${t.label} — ${t.description}`);
  }
}

function cmdPlugins() {
  for (const p of listPlugins()) {
    console.log(`${p.id.padEnd(12)} ${p.name} — ${p.description}`);
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const cmd = argv[0] ?? "help";
  const rest = argv.slice(1);

  switch (cmd) {
    case "studio":
    case "start":
    case "dev":
      await cmdStudio(rest);
      break;
    case "captions":
    case "srt":
      cmdCaptions(rest);
      break;
    case "plugin":
    case "pack":
    case "destination":
      cmdPlugin(rest);
      break;
    case "project":
      cmdProject(rest);
      break;
    case "templates":
      cmdTemplates();
      break;
    case "plugins":
    case "destinations":
      cmdPlugins();
      break;
    case "doctor":
      cmdDoctor();
      break;
    case "version":
    case "-v":
    case "--version":
      console.log(VERSION);
      break;
    case "help":
    case "-h":
    case "--help":
      printHelp();
      break;
    default:
      printHelp();
      process.exit(1);
  }
}

await main();
