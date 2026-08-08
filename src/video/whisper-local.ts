/**
 * Phase 3 — local Whisper CLI helpers (no browser weights).
 * Shells out to `whisper` / `whisper.cpp` when installed on PATH.
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";

export interface LocalWhisperOptions {
  /** Path to audio/video file */
  input: string;
  /** Output directory for JSON/SRT (default: cwd) */
  outDir?: string;
  /** Model name for openai-whisper (tiny/base/small/medium/large) */
  model?: string;
  /** Prefer binary name */
  bin?: "whisper" | "whisper-cpp" | "faster-whisper";
  /** Language hint (e.g. en) */
  language?: string;
}

export interface LocalWhisperPlan {
  available: boolean;
  binary?: string;
  command: string[];
  notes: string[];
}

function whichSync(bin: string): string | undefined {
  const pathEnv = process.env.PATH ?? "";
  for (const dir of pathEnv.split(":")) {
    const candidate = resolve(dir, bin);
    if (existsSync(candidate)) return candidate;
  }
  return undefined;
}

/** Probe PATH for a local Whisper binary and build a command plan */
export function planLocalWhisper(options: LocalWhisperOptions): LocalWhisperPlan {
  const input = resolve(options.input);
  const outDir = resolve(options.outDir ?? ".");
  const model = options.model ?? "base";
  const notes: string[] = [
    "cinematype does not ship Whisper weights — use a local install.",
    "After transcription, import verbose_json via whisperJsonToCues() or studio Transcript.",
  ];

  if (!existsSync(input)) {
    return {
      available: false,
      command: [],
      notes: [...notes, `Input not found: ${input}`],
    };
  }

  const preferred = options.bin;
  const candidates =
    preferred === "whisper-cpp"
      ? ["whisper-cpp", "main", "whisper"]
      : preferred === "faster-whisper"
        ? ["faster-whisper", "whisper"]
        : ["whisper", "faster-whisper", "whisper-cpp"];

  let binary: string | undefined;
  let name: string | undefined;
  for (const c of candidates) {
    const found = whichSync(c);
    if (found) {
      binary = found;
      name = c;
      break;
    }
  }

  if (!binary || !name) {
    return {
      available: false,
      command: [],
      notes: [
        ...notes,
        "No whisper binary on PATH. Install openai-whisper, faster-whisper, or whisper.cpp.",
        "Example: pip install -U openai-whisper",
      ],
    };
  }

  if (name === "whisper" || name.includes("faster")) {
    const cmd = [
      binary,
      input,
      "--model",
      model,
      "--output_format",
      "json",
      "--output_dir",
      outDir,
    ];
    if (options.language) cmd.push("--language", options.language);
    return {
      available: true,
      binary,
      command: cmd,
      notes: [
        ...notes,
        `Using ${name}. JSON will land in ${outDir}.`,
        "Then: cinematype captions --file <json> --out out.srt",
      ],
    };
  }

  return {
    available: true,
    binary,
    command: [binary, "-f", input, "-m", model, "-oj"],
    notes: [...notes, "whisper.cpp-style invocation — adjust flags for your build."],
  };
}

/** Run the planned local whisper command (Bun/Node). Returns exit code. */
export async function runLocalWhisper(
  options: LocalWhisperOptions,
): Promise<{ code: number; plan: LocalWhisperPlan; stdout: string; stderr: string }> {
  const plan = planLocalWhisper(options);
  if (!plan.available || !plan.command.length) {
    return { code: 1, plan, stdout: "", stderr: plan.notes.join("\n") };
  }
  const proc = Bun.spawn(plan.command, {
    stdout: "pipe",
    stderr: "pipe",
  });
  const code = await proc.exited;
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  return { code, plan, stdout, stderr };
}
