/**
 * Local playground server — Bun.serve + HTML imports.
 * Run: bun run playground
 */
import { join } from "node:path";
import index from "../playground/index.html";

const root = join(import.meta.dir, "..");
const port = Number(process.env.PORT ?? 5180);

const server = Bun.serve({
  port,
  hostname: "0.0.0.0",
  routes: {
    "/": index,
  },
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path.startsWith("/fonts/") || path.startsWith("/styles/")) {
      const file = Bun.file(join(root, path.slice(1)));
      if (await file.exists()) {
        return new Response(file);
      }
    }

    return new Response("Not found", { status: 404 });
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`cinematype studio → http://localhost:${server.port}`);
