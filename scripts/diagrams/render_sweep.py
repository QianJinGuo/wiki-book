import json, glob, sys
from playwright.sync_api import sync_playwright

codes = {}
for f in sorted(glob.glob("docs/diagrams/*.json")):
    d = json.load(open(f))
    codes[f.split("/")[-1][:-5]] = d[0]["code"]
keys = list(codes.keys())
print(f"total {len(keys)}", flush=True)

CHUNK = 120
all_fails = {}
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("https://jinguo.tech/", wait_until="domcontentloaded", timeout=45000)
    page.add_script_tag(url="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js")
    page.wait_for_function("typeof mermaid !== 'undefined'", timeout=30000)
    page.evaluate("mermaid.initialize({startOnLoad:false, securityLevel:'loose'})")
    done = 0
    for i in range(0, len(keys), CHUNK):
        chunk = keys[i:i+CHUNK]
        page.evaluate("""(cs) => { window.__c = cs; }""",
                      {k: codes[k] for k in chunk})
        fails = page.evaluate("""async () => {
            const out = {};
            const ks = Object.keys(window.__c);
            for (let j = 0; j < ks.length; j++) {
                try {
                    await mermaid.render('sw' + j + 'x' + Math.floor(performance.now()), window.__c[ks[j]]);
                } catch (e) { out[ks[j]] = String(e.message || e).slice(0, 140); }
            }
            return out;
        }""")
        all_fails.update(fails)
        done += len(chunk)
        print(f"rendered {done}/{len(keys)}, fails so far {len(all_fails)}", flush=True)
    browser.close()

json.dump(all_fails, open("/tmp/render_fails.json","w"), ensure_ascii=False, indent=1)
for k, m in all_fails.items():
    print("RENDER-FAIL", k, "|", m)
print(f"\n=== FULL RENDER SWEEP: {len(keys)-len(all_fails)}/{len(keys)} OK ===")
sys.exit(1 if all_fails else 0)
