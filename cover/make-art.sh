#!/usr/bin/env bash
# make-art.sh — Regenerate the ink-and-gold duotone art layers from the
# original blue source renders (art/*-art.png → art/*-art-gold.png).
# Luminance maps to a deep-navy → warm-gold gradient, matching the site's
# 墨金书房 (Ink & Gold) theme tokens in overrides/assets/stylesheets/theme.css.
set -euo pipefail
cd "$(dirname "$0")"

for kind in portrait wide; do
  magick "art/${kind}-art.png" \
    -colorspace Gray -auto-level \
    \( -size 256x1 gradient:'#0a1628'-'#f2d992' \) \
    -clut "art/${kind}-art-gold.png"
  echo "  ✓ art/${kind}-art-gold.png"
done
