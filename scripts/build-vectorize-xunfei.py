#!/usr/bin/env python3
"""Build Vectorize index for wiki-book using Xunfei Embedding API."""
import json, os, sys, time, requests, base64
from concurrent.futures import ThreadPoolExecutor, as_completed

SEARCH_INDEX_PATH = "/tmp/search_index.json"
ACCOUNT_ID = "aa78649679a46fa7ed55bdc17165ced3"
VECTORIZE_INDEX = "wiki-book-embeddings-v2"
VECTORIZE_DIMS = 1024
XUNFEI_URL = "https://maas-api.cn-huabei-1.xf-yun.com/v2/embeddings"
XUNFEI_MODEL = "xop3qwen8bembedding"
INSERT_BATCH_SIZE = 100
API_BATCH_SIZE = 20
CONCURRENCY = 10

def get_cf_token():
    p = os.path.expanduser("~/Library/Preferences/.wrangler/config/default.toml")
    with open(p) as f:
        for line in f:
            if line.startswith("oauth_token"):
                return line.split("=")[1].strip().strip('"')
    return None

def get_xunfei_key():
    return os.environ.get("XUNFEI_API_KEY") or \
        "3a3d0cdf37f2399cf2ed0bdf870e2793:OGRkY2U5MDk1NjI0OGU3ODgwNWVhN2I0"

def get_embeddings(texts, api_key):
    r = requests.post(XUNFEI_URL,
        headers={"Authorization": f"Bearer {api_key}"},
        json={"model": XUNFEI_MODEL, "input": texts, "dimensions": VECTORIZE_DIMS},
        timeout=120)
    if r.status_code != 200:
        raise Exception(f"Xunfei error {r.status_code}: {r.text[:200]}")
    d = r.json()
    if "data" not in d:
        raise Exception(f"Xunfei unexpected: {json.dumps(d)[:200]}")
    return [x["embedding"] for x in sorted(d["data"], key=lambda x: x["index"])]

def insert_batch(vectors, cf_token):
    url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/vectorize/v2/indexes/{VECTORIZE_INDEX}/insert"
    r = requests.post(url, headers={"Authorization": f"Bearer {cf_token}"},
                       json={"vectors": vectors}, timeout=120)
    if r.status_code != 200:
        print(f"\n  Insert error {r.status_code}: {r.text[:200]}")
        return False
    d = r.json()
    if not d.get("success"):
        print(f"\n  Insert failed: {d.get('errors', [])}")
        return False
    return True

def main():
    cf_token = get_cf_token()
    xunfei_key = get_xunfei_key()
    if not cf_token:
        print("ERROR: No CF token"); sys.exit(1)

    with open(SEARCH_INDEX_PATH, encoding="utf-8") as f:
        docs = json.load(f)["docs"]

    # Build valid_docs → original docs index mapping
    orig_indices = [i for i, d in enumerate(docs) if d.get("location")]
    valid_docs = [docs[i] for i in orig_indices]
    print(f"Docs: {len(docs)} total, {len(valid_docs)} with location")

    texts = [f"{d['title']}: {d['text'][:500]}" for d in valid_docs]
    total = len(texts)
    print(f"Embedding {total} docs via {XUNFEI_MODEL} ({VECTORIZE_DIMS}d)...")
    print(f"Config: batch={API_BATCH_SIZE}, concurrency={CONCURRENCY}")

    start = time.time()
    vectors, embedded, errors = [], 0, 0
    futures = {}
    batch_idx = list(range(0, total, API_BATCH_SIZE))

    with ThreadPoolExecutor(max_workers=CONCURRENCY) as ex:
        for i in batch_idx[:CONCURRENCY]:
            f = ex.submit(get_embeddings, texts[i:i+API_BATCH_SIZE], xunfei_key)
            futures[f] = i

        next_b = CONCURRENCY
        while futures:
            for f in as_completed(futures.keys()):
                bi = futures.pop(f)
                try:
                    embs = f.result()
                except Exception as e:
                    print(f"\n  ERROR batch {bi}: {e}")
                    errors += 1
                    break

                for j, emb in enumerate(embs):
                    vectors.append({
                        "id": str(orig_indices[bi + j]),  # original docs index
                        "values": emb,
                        "metadata": {
                            "title": valid_docs[bi + j]["title"][:100],
                            "location": valid_docs[bi + j]["location"][:100],
                        },
                    })
                    embedded += 1

                if len(vectors) >= INSERT_BATCH_SIZE:
                    ok = insert_batch(vectors, cf_token)
                    if ok:
                        rate = embedded / (time.time() - start)
                        eta = (total - embedded) / rate / 60
                        print(f"\n  [{embedded}/{total}] inserted {len(vectors)}, {rate:.0f} docs/s, ETA {eta:.0f} min", end="")
                    vectors = []

                if next_b < len(batch_idx):
                    ni = batch_idx[next_b]
                    f2 = ex.submit(get_embeddings, texts[ni:ni+API_BATCH_SIZE], xunfei_key)
                    futures[f2] = ni
                    next_b += 1
                break

    if vectors:
        insert_batch(vectors, cf_token)
        print(f"\n  [{embedded}/{total}] inserted final {len(vectors)}")

    print(f"\nDone! {embedded}/{total} in {(time.time()-start)/60:.1f} min, errors={errors}")

if __name__ == "__main__":
    main()
