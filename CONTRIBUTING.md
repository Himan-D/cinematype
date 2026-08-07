# Contributing

## Branch model

- **`main`** — protected default branch. Never commit feature work directly here.
- **Feature branches** — create from `main`, open a PR back into `main`.

```bash
git checkout main
git pull origin main
git checkout -b feature/short-name
# …work…
bun test && bun run typecheck && bun run build
git push -u origin HEAD
gh pr create
```

## PR requirements

1. One focused change per PR
2. CI must pass (test, typecheck, build, publint)
3. Fill out the PR template
4. Prefer squash merge
5. Delete the branch after merge

## Local checks (same as CI)

```bash
bun install
bun test
bun run typecheck
bun run build
bun run lint:package
```

## Plugins / studio

If you change `src/plugins/**` or the studio UI, verify the Plugins tab still exports packs:

```bash
bun run studio
```
