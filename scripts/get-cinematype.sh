#!/usr/bin/env bash
# cinematype — one-line installer + launcher for creators
#
#   curl -fsSL https://raw.githubusercontent.com/Himan-D/cinematype/main/scripts/get-cinematype.sh | bash
#
# Or with a command:
#   curl -fsSL .../get-cinematype.sh | bash -s -- captions --text "Stop scrolling" --out hook.srt
#   curl -fsSL .../get-cinematype.sh | bash -s -- plugin capcut --text "Hook" --out-dir ./pack
#   curl -fsSL .../get-cinematype.sh | bash -s -- studio
set -euo pipefail

REPO_URL="${CINEMATYPE_REPO:-https://github.com/Himan-D/cinematype.git}"
REPO_REF="${CINEMATYPE_REF:-main}"
INSTALL_DIR="${CINEMATYPE_HOME:-$HOME/.cinematype}"

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
dim() { printf '\033[2m%s\033[0m\n' "$*"; }
ok() { printf '✓ %s\n' "$*"; }
err() { printf '✗ %s\n' "$*" >&2; }

need_bun() {
  if command -v bun >/dev/null 2>&1; then
    ok "bun $(bun --version)"
    return
  fi
  bold "Installing Bun (needed once)…"
  curl -fsSL https://bun.sh/install | bash
  # shellcheck disable=SC1090
  if [[ -f "$HOME/.bun/bin/bun" ]]; then
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
  fi
  if ! command -v bun >/dev/null 2>&1; then
    err "Bun install finished but 'bun' is not on PATH."
    err "Open a new terminal, then re-run this command."
    exit 1
  fi
  ok "bun $(bun --version)"
}

sync_repo() {
  if [[ -d "$INSTALL_DIR/.git" ]]; then
    bold "Updating cinematype in $INSTALL_DIR"
    git -C "$INSTALL_DIR" fetch --depth 1 origin "$REPO_REF"
    git -C "$INSTALL_DIR" checkout -q FETCH_HEAD
  else
    bold "Cloning cinematype → $INSTALL_DIR"
    rm -rf "$INSTALL_DIR"
    git clone --depth 1 --branch "$REPO_REF" "$REPO_URL" "$INSTALL_DIR" 2>/dev/null \
      || git clone --depth 1 "$REPO_URL" "$INSTALL_DIR"
  fi
  ok "source ready"
}

install_deps() {
  bold "Installing dependencies…"
  (cd "$INSTALL_DIR" && bun install --frozen-lockfile 2>/dev/null || bun install)
  ok "dependencies"
}

open_url() {
  local url="$1"
  if command -v open >/dev/null 2>&1; then
    open "$url" >/dev/null 2>&1 || true
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$url" >/dev/null 2>&1 || true
  fi
}

main() {
  printf '\n'
  bold "cinematype — captions & type for creators"
  dim  "60-second path: studio → transcript → CapCut/YouTube pack"
  printf '\n'

  need_bun
  sync_repo
  install_deps

  cd "$INSTALL_DIR"

  if [[ $# -eq 0 ]]; then
    set -- studio
  fi

  case "$1" in
    studio|start|dev)
      export PORT="${PORT:-5180}"
      bold "Starting studio → http://localhost:$PORT"
      dim  "Tip: paste a transcript, then Plugins → CapCut → Download pack"
      open_url "http://localhost:$PORT"
      exec bun run src/cli.ts studio --port "$PORT"
      ;;
    *)
      exec bun run src/cli.ts "$@"
      ;;
  esac
}

main "$@"
