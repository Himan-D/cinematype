# Onboarding (product)

## Promise

> **Make your captions look like your brand** — transcript → branded preview → destination export in under 60 seconds.

## North-star funnel

1. **Discover** — README curl one-liner  
2. **Activate** — studio opens, welcome wizard  
3. **Aha** — captions look like *their* brand on the video preview  
4. **Habit** — brand kit reused, `project.ct` saved, destinations re-exported  

## Install surfaces

| Surface | Command |
|---------|---------|
| Curl studio | `curl -fsSL …/get-cinematype.sh \| bash` |
| Curl captions | `… \| bash -s -- captions --text "…" --out hook.srt` |
| Curl CapCut pack | `… \| bash -s -- plugin capcut --text "…" --out-dir ./pack` |
| Local | `bun run studio` / `bun run ct -- …` |

## Success metrics

- Time to first branded preview  
- Time to first destination export  
- Brand kits reused / user  
- `project.ct` save rate  
- Destination mix (CapCut vs YouTube vs …)

## Non-goals (for now)

- Cloud accounts  
- In-browser Whisper model  
- Full video editor / social publishing  
- CapCut binary plugin (we export files CapCut already understands)
