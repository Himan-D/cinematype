/**
 * Copy latin OFL woff2 files from @fontsource packages into fonts/.
 * Run: bun run scripts/vendor-fonts.ts
 */
import { cpSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const nm = join(root, "node_modules");

type Spec = {
  id: string;
  sources: Array<{ from: string; to: string }>;
};

const specs: Spec[] = [
  {
    id: "dm-sans",
    sources: [
      {
        from: "@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2",
        to: "dm-sans-latin-wght-normal.woff2",
      },
      {
        from: "@fontsource-variable/dm-sans/files/dm-sans-latin-wght-italic.woff2",
        to: "dm-sans-latin-wght-italic.woff2",
      },
    ],
  },
  {
    id: "playfair-display",
    sources: [
      {
        from: "@fontsource-variable/playfair-display/files/playfair-display-latin-wght-normal.woff2",
        to: "playfair-display-latin-wght-normal.woff2",
      },
      {
        from: "@fontsource-variable/playfair-display/files/playfair-display-latin-wght-italic.woff2",
        to: "playfair-display-latin-wght-italic.woff2",
      },
    ],
  },
  {
    id: "sora",
    sources: [
      {
        from: "@fontsource-variable/sora/files/sora-latin-wght-normal.woff2",
        to: "sora-latin-wght-normal.woff2",
      },
    ],
  },
  {
    id: "bricolage-grotesque",
    sources: [
      {
        from: "@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2",
        to: "bricolage-grotesque-latin-wght-normal.woff2",
      },
    ],
  },
  {
    id: "archivo",
    sources: [
      {
        from: "@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2",
        to: "archivo-latin-wght-normal.woff2",
      },
    ],
  },
  {
    id: "lora",
    sources: [
      {
        from: "@fontsource-variable/lora/files/lora-latin-wght-normal.woff2",
        to: "lora-latin-wght-normal.woff2",
      },
      {
        from: "@fontsource-variable/lora/files/lora-latin-wght-italic.woff2",
        to: "lora-latin-wght-italic.woff2",
      },
    ],
  },
  {
    id: "rubik",
    sources: [
      {
        from: "@fontsource-variable/rubik/files/rubik-latin-wght-normal.woff2",
        to: "rubik-latin-wght-normal.woff2",
      },
    ],
  },
  {
    id: "bebas-neue",
    sources: [
      {
        from: "@fontsource/bebas-neue/files/bebas-neue-latin-400-normal.woff2",
        to: "bebas-neue-latin-400-normal.woff2",
      },
    ],
  },
  {
    id: "anton",
    sources: [
      {
        from: "@fontsource/anton/files/anton-latin-400-normal.woff2",
        to: "anton-latin-400-normal.woff2",
      },
    ],
  },
  {
    id: "caveat",
    sources: [
      {
        from: "@fontsource/caveat/files/caveat-latin-400-normal.woff2",
        to: "caveat-latin-400-normal.woff2",
      },
      {
        from: "@fontsource/caveat/files/caveat-latin-700-normal.woff2",
        to: "caveat-latin-700-normal.woff2",
      },
    ],
  },
];

let copied = 0;
for (const spec of specs) {
  const dir = join(root, "fonts", spec.id);
  mkdirSync(dir, { recursive: true });
  for (const file of spec.sources) {
    const src = join(nm, file.from);
    const dest = join(dir, file.to);
    if (!existsSync(src)) {
      console.error(`✗ missing ${file.from}`);
      process.exitCode = 1;
      continue;
    }
    cpSync(src, dest);
    console.log(`✓ fonts/${spec.id}/${file.to}`);
    copied++;
  }
}
console.log(`Copied ${copied} files`);
