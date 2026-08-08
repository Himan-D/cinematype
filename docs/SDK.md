# Plugin SDK (Phase 4)

Built-in destinations stay in `cinematype/plugins`. Community adapters register at runtime.

```ts
import {
  createPlugin,
  registerPlugin,
  runPlugin,
  DEFAULT_BRAND_KIT,
} from "cinematype";

registerPlugin(
  createPlugin({
    id: "my-tool",
    name: "My Tool",
    description: "Custom destination pack",
    platforms: ["My Tool"],
    export: (ctx) => ({
      files: [
        {
          filename: "captions.txt",
          mime: "text/plain",
          content: ctx.cues.map((c) => c.text).join("\n"),
        },
      ],
    }),
  }),
);

runPlugin("my-tool", {
  cues: [{ start: 0, end: 2, text: "Hook" }],
  brand: DEFAULT_BRAND_KIT,
  aspect: "youtube-shorts",
});
```

Cannot override built-in ids (`capcut`, `youtube`, …).

## Community templates

```ts
import { registerCreatorTemplate, seedCommunityExamples, listAllCreatorTemplates } from "cinematype";

seedCommunityExamples(); // meme-punch, education-clean
registerCreatorTemplate({
  id: "agency-hook",
  label: "Agency Hook",
  description: "Shared team opener",
  aspect: "reels",
  cues: [{ start: 0, end: 2, text: "WATCH", style: "title" }],
});
```

## Team brand packs

```ts
import { createTeamBrandPack, serializeTeamBrandPack, parseTeamBrandPack, importTeamBrandPack } from "cinematype";

const pack = createTeamBrandPack("Studio A", [/* BrandKit[] */]);
// share serializeTeamBrandPack(pack) as brand-kits.json
importTeamBrandPack(parseTeamBrandPack(raw));
```
