#!/usr/bin/env bash
# Resolves merge conflicts in yarn.lock by stripping conflict markers and
# running yarn install so the lockfile is consistent.
# Run from repo root: ./scripts/resolve-yarn-lock-conflicts.sh
#
# If yarn.lock is missing after a merge (e.g. deleted by one side), first run:
#   git checkout --theirs yarn.lock   # or --ours, then run this script

set -e
cd "$(dirname "$0")/.."

if [[ ! -f package.json ]]; then
  echo "package.json not found. Run from repo root." >&2
  exit 1
fi

echo "Resolving yarn.lock conflicts..."

if [[ ! -f yarn.lock ]]; then
  echo "yarn.lock not found. Running yarn install to create it (set YARN_ENABLE_IMMUTABLE_INSTALLS=0)."
elif [[ -f yarn.lock ]]; then
  # Remove Git conflict markers so Yarn can read the file (or we regenerate)
  if grep -qE '^<<<<<<< |^=======$|^>>>>>>> ' yarn.lock 2>/dev/null; then
    echo "Removing conflict markers from yarn.lock..."
    sed -i.bak -e '/^<<<<<<< /d' -e '/^=======$/d' -e '/^>>>>>>> /d' yarn.lock
    rm -f yarn.lock.bak
  fi
fi

# Regenerate lockfile from package.json (allow creating/updating lockfile)
export YARN_ENABLE_IMMUTABLE_INSTALLS=0
yarn install

echo "Done. yarn.lock is updated. Review and commit."
exit 0
