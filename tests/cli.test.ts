import { expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = join(import.meta.dir, "..");

test("cli captions writes srt", () => {
  const dir = mkdtempSync(join(tmpdir(), "ct-cli-"));
  const out = join(dir, "hook.srt");
  const proc = Bun.spawnSync(
    [
      "bun",
      "run",
      "src/cli.ts",
      "captions",
      "--text",
      "Stop scrolling. This changes everything.",
      "--out",
      out,
    ],
    { cwd: root, stdout: "pipe", stderr: "pipe" },
  );
  expect(proc.exitCode).toBe(0);
  const body = readFileSync(out, "utf8");
  expect(body).toContain("-->");
  expect(body).toContain("Stop scrolling");
  rmSync(dir, { recursive: true, force: true });
});

test("cli plugin capcut writes pack", () => {
  const dir = mkdtempSync(join(tmpdir(), "ct-pack-"));
  const proc = Bun.spawnSync(
    [
      "bun",
      "run",
      "src/cli.ts",
      "plugin",
      "capcut",
      "--text",
      "Hook line for the pack",
      "--out-dir",
      dir,
    ],
    { cwd: root, stdout: "pipe", stderr: "pipe" },
  );
  expect(proc.exitCode).toBe(0);
  const files = [...new Bun.Glob("**/*").scanSync({ cwd: dir })];
  expect(files.some((f) => f.endsWith(".srt"))).toBe(true);
  expect(files.some((f) => f.includes("CAPCUT"))).toBe(true);
  rmSync(dir, { recursive: true, force: true });
});

test("cli doctor exits 0", () => {
  const proc = Bun.spawnSync(["bun", "run", "src/cli.ts", "doctor"], {
    cwd: root,
    stdout: "pipe",
    stderr: "pipe",
  });
  expect(proc.exitCode).toBe(0);
  expect(proc.stdout.toString()).toContain("plugins:");
});
