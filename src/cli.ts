/**
 * cinematype CLI — captions, plugins, and studio for creators
 *
 *   bun run ct -- studio
 *   bun run ct -- captions --text "Stop scrolling" --out hook.srt
 *   bun run ct -- plugin capcut --text "Hook..." --out-dir ./pack
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  DEFAULT_BRAND_KIT,
  exportSubtitles,
  getCreatorTemplate,
  listCreatorTemplates,
  listPlugins,
  listTitleCardPresets,
  runPlugin,
  transcriptToCues,
  whisperJsonToCues,
  type AspectId,
  type CaptionCue,
  type PluginId,
  type SubtitleFormat,
} from "./index";

const VERSION = "0.5.0";
const ROOT = join(import.meta.dir, "..");

function printHelp() {
  console.log(`cinematype ${VERSION} — captions & type for creators

Usage:
  cinematype studio [--port 5180]
  cinematype captions --text "..." [--format srt|vtt|ass] [--out file]
  cinematype captions --file script.txt [--format srt] [--out file]
  cinematype plugin <name> --text "..." [--out-dir ./pack]
  cinematype plugin <name> --file script.txt [--out-dir ./pack]
  cinematype templates
  cinematype plugins
  cinematype doctor
  cinematype help

Quick start (no install):
  curl -fsSL https://raw.githubusercontent.com/Himan-D/cinematype/main/scripts/get-cinematype.sh | bash

Examples:
  cinematype captions --text "Stop scrolling. This changes everything." --out hook.srt
  cinematype plugin capcut --text "Hook line here" --out-dir ./capcut-pack
  cinematype plugin youtube --file voiceover.txt --out-dir ./yt
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
  console.log(`\n🎬 Opening cinematype studio on http://localhost:${port}\n`);
  console.log("   1) Paste your transcript");
  console.log("   2) Tweak cue times");
  console.log("   3) Plugins → CapCut / YouTube → Download pack\n");

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
  let cues = templateId
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
    console.error(`Plugins: ${listPlugins().map((p) => p.id).join(", ")}`);
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

function cmdDoctor() {
  console.log(`cinematype ${VERSION}`);
  console.log(`bun: ${typeof Bun !== "undefined" ? Bun.version : "missing"}`);
  console.log(`root: ${ROOT}`);
  console.log(`templates: ${listCreatorTemplates().length}`);
  console.log(`plugins: ${listPlugins().length}`);
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
      cmdPlugin(rest);
      break;
    case "templates":
      cmdTemplates();
      break;
    case "plugins":
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
