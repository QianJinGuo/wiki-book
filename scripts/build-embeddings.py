#!/usr/bin/env python3
"""
Build embeddings for wiki-book using 讯飞 xop3qwen8bembedding.

The script generates embeddings in batches and writes directly into chunk files.
It does not keep all vectors in memory at once.

Usage:
  export XUNFEI_API_KEY="<your-api-key>"
  # Optional:
  # export EMBEDDING_DIMENSIONS=4096
  # export EMBEDDING_CHUNK_SIZE=2000
  # export EMBEDDING_BATCH_SIZE=16
  python3 scripts/build-embeddings.py

  # Then upload to R2:
  for f in /tmp/embeddings_*.bin /tmp/embeddings_manifest.json; do
    key=$(basename $f)
    npx wrangler r2 object put ai-engineering-search/$key --file=$f --remote
  done
"""

import json
import struct
import os
import sys
import time
import requests

SEARCH_INDEX_PATH = "site/search/search_index.json"
API_URL = "https://maas-api.cn-huabei-1.xf-yun.com/v2/embeddings"
MODEL = "xop3qwen8bembedding"
DIMENSIONS = int(os.environ.get("EMBEDDING_DIMENSIONS", "1024"))
CHUNK_SIZE = int(os.environ.get("EMBEDDING_CHUNK_SIZE", "10000"))
BATCH_SIZE = int(os.environ.get("EMBEDDING_BATCH_SIZE", "16"))
MAX_RETRIES = int(os.environ.get("EMBEDDING_MAX_RETRIES", "5"))
REQUEST_TIMEOUT_SECONDS = int(os.environ.get("EMBEDDING_REQUEST_TIMEOUT_SECONDS", "120"))
INTER_BATCH_SLEEP_SECONDS = float(os.environ.get("EMBEDDING_INTER_BATCH_SLEEP_SECONDS", "0.1"))


def ensure_positive_int(name, value):
    if value <= 0:
        raise ValueError(f"{name} must be > 0, got: {value}")


def ensure_non_negative_float(name, value):
    if value < 0:
        raise ValueError(f"{name} must be >= 0, got: {value}")


def build_doc_text(doc):
    title = str(doc.get("title", "")).strip()
    text = str(doc.get("text", ""))
    return f"{title}: {text[:300]}"


def get_embeddings(texts, api_key):
    """Call 讯飞 embedding API (OpenAI-compatible)."""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": MODEL,
        "input": texts,
        "dimensions": DIMENSIONS,
    }
    try:
        resp = requests.post(
            API_URL,
            headers=headers,
            json=payload,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except requests.RequestException as exc:
        raise RuntimeError(f"Embedding API request failed: {exc}") from exc

    if resp.status_code != 200:
        raise RuntimeError(f"API error {resp.status_code}: {resp.text[:200]}")

    try:
        data = resp.json()
    except ValueError as exc:
        raise RuntimeError(f"Invalid JSON response: {resp.text[:200]}") from exc

    if "error" in data:
        raise RuntimeError(f"API failed: {data['error']}")

    items = data.get("data")
    if not isinstance(items, list):
        raise RuntimeError("API response missing 'data' array")

    # OpenAI-compatible response: data[].embedding
    embeddings = []
    for i, item in enumerate(items):
        if not isinstance(item, dict) or "embedding" not in item:
            raise RuntimeError(f"API response item {i} missing embedding")
        embedding = item["embedding"]
        if not isinstance(embedding, list) or len(embedding) == 0:
            raise RuntimeError(f"API response item {i} has invalid embedding")
        embeddings.append(embedding)

    if len(embeddings) != len(texts):
        raise RuntimeError(
            f"Embedding count mismatch: request={len(texts)}, response={len(embeddings)}"
        )
    return embeddings


def get_embeddings_with_retry(texts, api_key):
    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            return get_embeddings(texts, api_key)
        except RuntimeError as exc:
            last_error = exc
            if attempt == MAX_RETRIES:
                break
            backoff_seconds = min(2 ** attempt, 30)
            print(
                f"  WARN: embedding batch failed (attempt {attempt}/{MAX_RETRIES}): {exc}. "
                f"Retrying in {backoff_seconds}s..."
            )
            time.sleep(backoff_seconds)
    raise RuntimeError(f"Embedding batch failed after {MAX_RETRIES} attempts: {last_error}")


def print_progress(processed_docs, total_docs, started_at, chunk_idx, num_chunks):
    elapsed = time.time() - started_at
    rate = processed_docs / elapsed if elapsed > 0 else 0
    eta_minutes = ((total_docs - processed_docs) / rate / 60) if rate > 0 else 0
    print(
        f"  [{processed_docs}/{total_docs}] "
        f"chunk {chunk_idx + 1}/{num_chunks} "
        f"({rate:.1f} docs/s, ETA {eta_minutes:.0f} min)"
    )


def main():
    ensure_positive_int("EMBEDDING_DIMENSIONS", DIMENSIONS)
    ensure_positive_int("EMBEDDING_CHUNK_SIZE", CHUNK_SIZE)
    ensure_positive_int("EMBEDDING_BATCH_SIZE", BATCH_SIZE)
    ensure_positive_int("EMBEDDING_MAX_RETRIES", MAX_RETRIES)
    ensure_positive_int("EMBEDDING_REQUEST_TIMEOUT_SECONDS", REQUEST_TIMEOUT_SECONDS)
    ensure_non_negative_float(
        "EMBEDDING_INTER_BATCH_SLEEP_SECONDS",
        INTER_BATCH_SLEEP_SECONDS,
    )

    api_key = os.environ.get("XUNFEI_API_KEY")
    if not api_key:
        try:
            with open("/tmp/xunfei_key.txt") as f:
                api_key = f.read().strip()
        except FileNotFoundError:
            pass
    if not api_key:
        print("ERROR: Set XUNFEI_API_KEY environment variable")
        print("  export XUNFEI_API_KEY=\"<your-api-key>\"")
        sys.exit(1)

    print(f"Loading {SEARCH_INDEX_PATH}...")
    with open(SEARCH_INDEX_PATH, encoding="utf-8") as f:
        idx = json.load(f)
    docs = idx.get("docs", [])
    if not isinstance(docs, list):
        print("ERROR: search_index.json has invalid 'docs' format (expected list)")
        sys.exit(1)
    if len(docs) == 0:
        print("ERROR: No docs found in search_index.json")
        sys.exit(1)

    print(f"Total docs: {len(docs)}")
    print(
        f"Embedding config: model={MODEL}, dims={DIMENSIONS}, "
        f"chunk_size={CHUNK_SIZE}, batch_size={BATCH_SIZE}"
    )

    print(f"\nGenerating embeddings and writing binary chunks...")
    total_docs = len(docs)
    num_chunks = (total_docs + CHUNK_SIZE - 1) // CHUNK_SIZE
    chunk_files = []
    processed_docs = 0
    resolved_dims = None
    start_time = time.time()

    for chunk_idx in range(num_chunks):
        chunk_start = chunk_idx * CHUNK_SIZE
        chunk_end = min(chunk_start + CHUNK_SIZE, total_docs)

        chunk_key = f"embeddings_{chunk_idx}.bin"
        local_path = f"/tmp/{chunk_key}"
        chunk_docs_written = 0

        with open(local_path, "wb") as f:
            # Header placeholder: [num_docs, dims], patched after chunk is written
            f.write(struct.pack("<II", 0, 0))

            for batch_start in range(chunk_start, chunk_end, BATCH_SIZE):
                batch_end = min(batch_start + BATCH_SIZE, chunk_end)
                batch_docs = docs[batch_start:batch_end]
                batch_texts = [build_doc_text(doc) for doc in batch_docs]

                embeddings = get_embeddings_with_retry(batch_texts, api_key)
                if len(embeddings) != len(batch_texts):
                    raise RuntimeError(
                        f"Embedding count mismatch in chunk {chunk_idx}: "
                        f"request={len(batch_texts)}, response={len(embeddings)}"
                    )

                for emb_idx, emb in enumerate(embeddings):
                    emb_dims = len(emb)
                    if emb_dims != DIMENSIONS:
                        raise RuntimeError(
                            f"Embedding dimension mismatch with request at doc {batch_start + emb_idx}: "
                            f"requested={DIMENSIONS}, got={emb_dims}"
                        )
                    if resolved_dims is None:
                        resolved_dims = emb_dims
                    elif emb_dims != resolved_dims:
                        raise RuntimeError(
                            f"Embedding dimension mismatch at doc {batch_start + emb_idx}: "
                            f"expected={resolved_dims}, got={emb_dims}"
                        )

                    doc_id = batch_start + emb_idx
                    f.write(struct.pack("<I", doc_id))
                    f.write(struct.pack(f"<{emb_dims}f", *emb))
                    chunk_docs_written += 1
                    processed_docs += 1

                print_progress(processed_docs, total_docs, start_time, chunk_idx, num_chunks)
                if INTER_BATCH_SLEEP_SECONDS > 0:
                    time.sleep(INTER_BATCH_SLEEP_SECONDS)

            if resolved_dims is None:
                raise RuntimeError("No embeddings generated")
            f.seek(0)
            f.write(struct.pack("<II", chunk_docs_written, resolved_dims))

        expected_chunk_docs = chunk_end - chunk_start
        if chunk_docs_written != expected_chunk_docs:
            raise RuntimeError(
                f"Chunk doc count mismatch for chunk {chunk_idx}: "
                f"expected={expected_chunk_docs}, wrote={chunk_docs_written}"
            )

        size_mb = os.path.getsize(local_path) / 1024 / 1024
        print(
            f"  Chunk {chunk_idx}: docs {chunk_start}-{chunk_end - 1}, "
            f"{size_mb:.1f}MB -> {local_path}"
        )
        chunk_files.append(chunk_key)

    if processed_docs != total_docs:
        raise RuntimeError(
            f"Total processed docs mismatch: expected={total_docs}, processed={processed_docs}"
        )
    if resolved_dims is None:
        raise RuntimeError("No embeddings were written")

    elapsed_minutes = (time.time() - start_time) / 60
    print(f"\nGenerated {processed_docs} embeddings, dim={resolved_dims}")
    print(f"Total time: {elapsed_minutes:.1f} min")

    manifest = {
        "model": MODEL,
        "dimensions": resolved_dims,
        "requested_dimensions": DIMENSIONS,
        "total_docs": total_docs,
        "chunk_size": CHUNK_SIZE,
        "num_chunks": num_chunks,
        "chunks": chunk_files,
    }
    manifest_path = "/tmp/embeddings_manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"\nManifest: {manifest_path}")

    total_mb = total_docs * resolved_dims * 4 / 1024 / 1024
    print(f"\nApprox vector payload: {total_docs} embeddings x {resolved_dims} dims = {total_mb:.0f}MB")
    print("\n=== Upload to R2 ===")
    print(f"npx wrangler r2 object put ai-engineering-search/embeddings_manifest.json --file={manifest_path} --remote")
    for cf in chunk_files:
        print(f"npx wrangler r2 object put ai-engineering-search/{cf} --file=/tmp/{cf} --remote")
    print("Done!")


if __name__ == "__main__":
    main()
