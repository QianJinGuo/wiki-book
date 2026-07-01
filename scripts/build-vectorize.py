#!/usr/bin/env python3
"""
Build Vectorize index for wiki-book using Workers AI bge-m3.
Reads search_index.json, generates embeddings via Workers AI API,
inserts into Vectorize index.

Usage:
  python3 scripts/build-vectorize.py
"""

import json
import os
import sys
import time
import requests

SEARCH_INDEX_PATH = "site/search/search_index.json"
ACCOUNT_ID = "aa78649679a46fa7ed55bdc17165ced3"
EMBEDDING_MODEL = "@cf/baai/bge-m3"
VECTORIZE_INDEX = "wiki-book-embeddings"
BATCH_SIZE = 100  # Vectorize max batch insert
EMBED_BATCH_SIZE = 16


def get_api_token():
    """Get Cloudflare API token from wrangler config."""
    config_path = os.path.expanduser(
        "~/Library/Preferences/.wrangler/config/default.toml"
    )
    with open(config_path) as f:
        for line in f:
            if line.startswith("oauth_token"):
                return line.split("=")[1].strip().strip('"')
    return None


def get_embeddings(texts, api_token):
    """Call Workers AI bge-m3 embedding API."""
    url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/{EMBEDDING_MODEL}"
    headers = {"Authorization": f"Bearer {api_token}", "Content-Type": "application/json"}
    resp = requests.post(url, headers=headers, json={"text": texts}, timeout=120)
    if resp.status_code != 200:
        raise Exception(f"API error {resp.status_code}: {resp.text[:200]}")
    data = resp.json()
    if not data.get("success"):
        raise Exception(f"API failed: {data.get('errors', [])}")
    return data["result"]["data"]


def main():
    api_token = get_api_token()
    if not api_token:
        print("ERROR: Could not find Cloudflare API token")
        sys.exit(1)

    print(f"Loading {SEARCH_INDEX_PATH}...")
    with open(SEARCH_INDEX_PATH, encoding="utf-8") as f:
        idx = json.load(f)
    docs = idx.get("docs", [])
    print(f"Total docs: {len(docs)}")

    # Prepare texts
    texts = []
    for d in docs:
        text = f"{d['title']}: {d['text'][:300]}"
        texts.append(text)

    # Generate embeddings and insert into Vectorize
    print(f"\nGenerating embeddings via {EMBEDDING_MODEL}...")
    total = len(texts)
    start_time = time.time()
    vectors = []

    for i in range(0, total, EMBED_BATCH_SIZE):
        batch = texts[i : i + EMBED_BATCH_SIZE]
        elapsed = time.time() - start_time
        rate = i / elapsed if elapsed > 0 else 0
        eta = (total - i) / rate / 60 if rate > 0 else 0
        print(f"  [{i}/{total}] ({rate:.1f} docs/s, ETA {eta:.0f} min)...", end="\r")

        try:
            embeddings = get_embeddings(batch, api_token)
        except Exception as e:
            print(f"\n  ERROR on batch {i}: {e}")
            time.sleep(5)
            continue

        for j, emb in enumerate(embeddings):
            doc_idx = i + j
            vectors.append({
                "id": str(doc_idx),
                "values": emb,
                "metadata": {
                    "title": docs[doc_idx]["title"],
                    "location": docs[doc_idx]["location"],
                },
            })

        # Insert in batches of 100
        if len(vectors) >= BATCH_SIZE:
            _insert_batch(vectors, api_token)
            vectors = []

        time.sleep(0.05)

    # Insert remaining
    if vectors:
        _insert_batch(vectors, api_token)

    elapsed_min = (time.time() - start_time) / 60
    print(f"\n\nDone! Total time: {elapsed_min:.1f} min")


def _insert_batch(vectors, api_token):
    """Insert vectors into Vectorize index."""
    url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/vectorize/v2/indexes/{VECTORIZE_INDEX}/insert"
    headers = {"Authorization": f"Bearer {api_token}", "Content-Type": "application/json"}
    resp = requests.post(url, headers=headers, json={"vectors": vectors}, timeout=60)
    if resp.status_code != 200:
        print(f"\n  Insert error {resp.status_code}: {resp.text[:200]}")
    else:
        print(f"\n  Inserted {len(vectors)} vectors", end="")


if __name__ == "__main__":
    main()
