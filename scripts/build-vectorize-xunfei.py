#!/usr/bin/env python3
"""
Build Vectorize index for wiki-book using Xunfei Embedding API.
Reads search_index.json, generates embeddings via Xunfei API (xop3qwen8bembedding),
inserts into Vectorize index (1536 dim).

Usage:
  python3 scripts/build-vectorize-xunfei.py

Requires:
  - XUNFEI_API_KEY env var (format: "key:secret")
  - ~/Library/Preferences/.wrangler/config/default.toml (CF OAuth token)
"""

import json
import os
import sys
import time
import requests
import base64

SEARCH_INDEX_PATH = "/tmp/search_index.json"
ACCOUNT_ID = "aa78649679a46fa7ed55bdc17165ced3"
VECTORIZE_INDEX = "wiki-book-embeddings-v2"
VECTORIZE_DIMS = 1024

XUNFEI_URL = "https://maas-api.cn-huabei-1.xf-yun.com/v2/embeddings"
XUNFEI_MODEL = "xop3qwen8bembedding"

INSERT_BATCH_SIZE = 100  # Vectorize max batch insert
API_BATCH_SIZE = 10       # Xunfei API docs per request


def get_cf_token():
    """Get Cloudflare API token from wrangler config."""
    config_path = os.path.expanduser(
        "~/Library/Preferences/.wrangler/config/default.toml"
    )
    with open(config_path) as f:
        for line in f:
            if line.startswith("oauth_token"):
                return line.split("=")[1].strip().strip('"')
    return None


def get_xunfei_key():
    """Get Xunfei API key from env or fallback."""
    key = os.environ.get("XUNFEI_API_KEY")
    if key:
        return key
    # Fallback: hardcoded (user-provided)
    return "3a3d0cdf37f2399cf2ed0bdf870e2793:OGRkY2U5MDk1NjI0OGU3ODgwNWVhN2I0"


def get_embeddings(texts, api_key):
    """Call Xunfei embedding API. Returns list of vectors."""
    resp = requests.post(
        XUNFEI_URL,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={
            "model": XUNFEI_MODEL,
            "input": texts,
            "dimensions": VECTORIZE_DIMS,
        },
        timeout=120,
    )
    if resp.status_code != 200:
        raise Exception(f"Xunfei API error {resp.status_code}: {resp.text[:300]}")
    data = resp.json()
    if "data" not in data:
        raise Exception(f"Xunfei API unexpected response: {json.dumps(data)[:200]}")
    # Sort by index to ensure order
    results = sorted(data["data"], key=lambda x: x["index"])
    return [r["embedding"] for r in results]


def insert_batch(vectors, cf_token):
    """Insert vectors into Vectorize index."""
    url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/vectorize/v2/indexes/{VECTORIZE_INDEX}/insert"
    headers = {"Authorization": f"Bearer {cf_token}", "Content-Type": "application/json"}
    # API requires snake_case params
    payload = {"vectors": vectors}
    resp = requests.post(url, headers=headers, json=payload, timeout=120)
    if resp.status_code != 200:
        print(f"\n  Insert error {resp.status_code}: {resp.text[:200]}")
        return False
    data = resp.json()
    if not data.get("success"):
        print(f"\n  Insert failed: {data.get('errors', [])}")
        return False
    return True


def main():
    cf_token = get_cf_token()
    if not cf_token:
        print("ERROR: Could not find Cloudflare API token")
        sys.exit(1)

    xunfei_key = get_xunfei_key()

    print(f"Loading {SEARCH_INDEX_PATH}...")
    with open(SEARCH_INDEX_PATH, encoding="utf-8") as f:
        idx = json.load(f)
    docs = idx.get("docs", [])
    print(f"Total docs: {len(docs)}")

    # Filter: only docs with location
    valid_docs = [d for d in docs if d.get("location")]
    print(f"Docs with location: {len(valid_docs)}")

    # Prepare texts: title + first 500 chars of text
    texts = []
    for d in valid_docs:
        text = f"{d['title']}: {d['text'][:500]}"
        texts.append(text)

    print(f"\nGenerating embeddings via Xunfei {XUNFEI_MODEL} ({VECTORIZE_DIMS}d)...")
    total = len(texts)
    start_time = time.time()
    vectors = []
    embedded_count = 0
    error_count = 0

    for i in range(0, total, API_BATCH_SIZE):
        batch = texts[i : i + API_BATCH_SIZE]
        batch_docs = valid_docs[i : i + API_BATCH_SIZE]

        elapsed = time.time() - start_time
        rate = (embedded_count) / elapsed if elapsed > 0 else 0
        eta = (total - embedded_count) / rate / 60 if rate > 0 else 0
        print(f"  [{embedded_count}/{total}] {rate:.1f} docs/s, ETA {eta:.0f} min...", end="\r")

        try:
            embeddings = get_embeddings(batch, xunfei_key)
        except Exception as e:
            print(f"\n  ERROR on batch {i}: {e}")
            error_count += 1
            time.sleep(5)
            continue

        for j, emb in enumerate(embeddings):
            doc_idx = i + j
            vectors.append({
                "id": str(doc_idx),
                "values": emb,
                "metadata": {
                    "title": batch_docs[j]["title"][:100],
                    "location": batch_docs[j]["location"][:100],
                },
            })
            embedded_count += 1

        # Insert in batches
        if len(vectors) >= INSERT_BATCH_SIZE:
            ok = insert_batch(vectors, cf_token)
            if ok:
                print(f"\n  Inserted {len(vectors)} vectors", end="")
            vectors = []

        time.sleep(0.1)  # Rate limit safety

    # Insert remaining
    if vectors:
        ok = insert_batch(vectors, cf_token)
        if ok:
            print(f"\n  Inserted {len(vectors)} vectors", end="")

    elapsed_min = (time.time() - start_time) / 60
    print(f"\n\nDone! {embedded_count}/{total} embedded in {elapsed_min:.1f} min")
    print(f"Errors: {error_count}")
    print(f"Vectorize index: {VECTORIZE_INDEX} ({VECTORIZE_DIMS}d)")


if __name__ == "__main__":
    main()
