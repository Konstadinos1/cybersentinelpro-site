#!/usr/bin/env bash
# Stop gate: the agent cannot finish while types, lint or the production build fail.
set -uo pipefail
cd "$CLAUDE_PROJECT_DIR"
if ! output=$( (npx --no-install tsc --noEmit && npm run --silent lint && npm run --silent build) 2>&1 ); then
  echo "Stop blocked: fix these before finishing." >&2
  echo "$output" | tail -40 >&2
  exit 2
fi
exit 0
