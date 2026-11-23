#!/usr/bin/env bash
# PostToolUse (Write|Edit): format the edited TS file, then run an incremental type check.
# Exit 2 sends the errors back to the agent.
set -euo pipefail
file=$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s||"{}");process.stdout.write(String((j.tool_input||{}).file_path||""))})')
case "$file" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac
cd "$CLAUDE_PROJECT_DIR"
npx --no-install prettier --write "$file" >/dev/null 2>&1 || true
if ! output=$(npx --no-install tsc --noEmit --incremental 2>&1); then
  echo "$output" | head -40 >&2
  exit 2
fi
