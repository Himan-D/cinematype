import { defineConfig } from "tsup";

export default defineConfig({
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
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: "es2022",
  external: ["react", "react/jsx-runtime", "react-dom"],
  esbuildOptions(options) {
    options.banner = {
      js: "/* cinematype — cinematic typography kit */",
    };
  },
});
