#!/bin/bash
# Finish line: wait for the background batch translation to complete, heal
# all dictionaries, deploy, then run Playwright acceptance over every page,
# healing and re-testing failures until everything passes (max 5 rounds).
cd /Users/jinguo/wiki-book
export PATH="$HOME/.volta/bin:$PATH"
export HTTPS_PROXY="http://127.0.0.1:7897" HTTP_PROXY="http://127.0.0.1:7897"

echo "[finish-line] waiting for background batch translation to finish..."
while pgrep -f "translate-all.py" > /dev/null; do sleep 300; done
while ! grep -q "ALL DONE" /tmp/translate-v2.log 2>/dev/null; do sleep 300; done
echo "[finish-line] background translation done at $(date)"

echo "[finish-line] final heal pass over all dictionaries"
python3 scripts/translate-all.py --all
git add translations/ scripts/
git commit -m "feat(translate): final heal pass after full-site batch translation" || echo "nothing to commit"
git push origin main

for i in 1 2 3 4 5; do
  ./scripts/build.sh > /tmp/build.log 2>&1 && \
  ./scripts/deploy.sh cloudflare 2>&1 | grep -qE "Cloudflare deployment complete" && { echo "deploy OK (attempt $i)"; break; }
  echo "deploy attempt $i failed"; sleep 60
done
./scripts/deploy.sh docker 2>&1 | grep -E "Docker deployment complete|failed"
./scripts/deploy.sh github 2>&1 | grep -E "triggered|No changes|failed"

ROUND=0
while [ "$ROUND" -lt 5 ]; do
  ROUND=$((ROUND+1))
  echo "[finish-line] acceptance round $ROUND at $(date)"
  if node scripts/acceptance-translations.mjs --all-site --timeout 90000 --concurrency 3 --report translations/acceptance; then
    echo "[finish-line] ALL PAGES PASSED at $(date)"
    break
  fi
  echo "[finish-line] round $ROUND had failures; healing failed pages"
  python3 - << 'PYEOF'
import json
report = json.load(open('translations/acceptance.json'))
failed = [r['path'] for r in report['results'] if not r['ok']]
open('/tmp/failed-pages.txt', 'w').write('\n'.join(failed))
print(f"{len(failed)} failed pages queued for healing")
PYEOF
  python3 scripts/translate-all.py --pages "$(python3 -c "
import json
report = json.load(open('translations/acceptance.json'))
paths = [r['path'].lstrip('/') for r in report['results'] if not r['ok']]
print(','.join(p[:-5] if p.endswith('.html') else p for p in paths[:200]))
")"
  git add translations/
  git commit -m "feat(translate): heal pass for acceptance round $ROUND failures" || echo "nothing to commit"
  git push origin main
  for i in 1 2 3; do
    ./scripts/build.sh > /tmp/build.log 2>&1 && \
    ./scripts/deploy.sh cloudflare 2>&1 | grep -qE "Cloudflare deployment complete" && break
    sleep 60
  done
done
echo "[finish-line] FINISHED at $(date) — see translations/acceptance.md"
