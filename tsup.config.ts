import { defineConfig } from "tsup";

const shared = {
  sourcemap: true,
  treeshake: true,
  target: "es2022" as const,
  external: ["react", "react/jsx-runtime", "react-dom"],
};

export default defineConfig([
  {
    ...shared,
    entry: {
      index: "src/index.ts",
      "motion/index": "src/motion/index.ts",
      "video/index": "src/video/index.ts",
      "react/index": "src/react/index.tsx",
      "tokens/index": "src/tokens/index.ts",
      "plugins/index": "src/plugins/index.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    splitting: false,
    clean: true,
    esbuildOptions(options) {
      options.banner = {
        js: "/* cinematype — cinematic typography kit */",
      };
    },
  },
  {
    ...shared,
    entry: {
      cli: "src/cli.ts",
    },
    format: ["esm"],
    dts: false,
    clean: false,
    banner: {
      js: "#!/usr/bin/env bun",
    },
  },
]);
