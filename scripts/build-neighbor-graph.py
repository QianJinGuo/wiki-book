#!/usr/bin/env python3
"""
Build semantic neighbor graph for wiki-book.

Reads search_index.json, computes TF-IDF cosine similarity
between all document pairs, and saves top-20 semantic neighbors
per document. Used by client-side rag-client.js for keyword
recall expansion (Tier 1).

Usage:
  python3 scripts/build-neighbor-graph.py \
    --input /tmp/search_index.json \
    --output site/assets/neighbor_graph.json

Output: JSON dict mapping doc_index → [[neighbor_idx, score], ...]
  - doc_index: index into search_index.json docs[] array
  - neighbor_idx: index of similar document
  - score: cosine similarity [0-1]
  - Each doc has exactly 20 neighbors (or fewer if not enough candidates)
"""

import argparse
import json
import math
import os
import re
import sys
import time
from collections import Counter, defaultdict

import numpy as np
from scipy.sparse import csr_matrix
from scipy.sparse.linalg import norm as sparse_norm

STOP_WORDS = set([
    "的", "了", "在", "是", "我", "有", "和", "就", "不", "人", "都", "一",
    "一个", "上", "也", "很", "到", "说", "要", "去", "你", "会", "着",
    "没有", "看", "好", "自己", "这", "他", "她", "它", "们", "那", "些",
    "之", "与", "及", "或", "但", "而", "且", "被", "把", "让", "从",
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "can", "shall", "to", "of", "in", "for",
    "on", "with", "at", "by", "from", "as", "into", "through", "during",
    "before", "after", "above", "below", "between", "out", "off", "over",
    "under", "again", "further", "then", "once", "here", "there", "when",
    "where", "why", "how", "all", "each", "every", "both", "few", "more",
    "most", "other", "some", "such", "no", "nor", "not", "only", "own",
    "same", "so", "than", "too", "very", "just", "because", "but", "and",
    "or", "if", "what", "which", "who", "whom", "this", "that", "these",
    "those", "about", "up", "it", "its", "also",
])


def tokenize(text):
    """Extract meaningful tokens from text."""
    if not text:
        return []
    # Chinese bigrams or longer, English words >= 2 chars
    tokens = re.findall(r'[\u4e00-\u9fff]{2,}|[a-zA-Z]{2,}', text.lower())
    return [t for t in tokens if t not in STOP_WORDS]


def build_inverted_index(docs):
    """Build term → [doc_indices] inverted index."""
    inv_idx = defaultdict(list)
    doc_terms = []
    
    for i, doc in enumerate(docs):
        text = (doc.get("title", "") + " " + doc.get("text", ""))
        terms = tokenize(text)
        # Deduplicate terms per doc (binary bag of words)
        unique_terms = set(terms)
        doc_terms.append(unique_terms)
        for term in unique_terms:
            inv_idx[term].append(i)
    
    return inv_idx, doc_terms


def compute_tfidf(doc_terms, total_docs):
    """Compute TF-IDF weighted term vectors.
    
    Returns dict: doc_index → {term: tfidf_weight}
    Also returns global term IDF values.
    """
    # Compute IDF per term
    term_df = Counter()
    for terms in doc_terms:
        for term in terms:
            term_df[term] += 1
    
    idf = {}
    for term, df in term_df.items():
        idf[term] = math.log((total_docs - df + 0.5) / (df + 0.5) + 1.0)
    
    # Compute TF-IDF per doc
    doc_vectors = {}
    for doc_idx, terms in enumerate(doc_terms):
        if not terms:
            doc_vectors[doc_idx] = {}
            continue
        # TF: log normalization
        max_tf = max(Counter(terms).values())
        tfidf_vec = {}
        for term, count in Counter(terms).items():
            tf = count / max_tf if max_tf > 0 else 0
            tfidf_vec[term] = tf * idf.get(term, 1.0)
        doc_vectors[doc_idx] = tfidf_vec
    
    return doc_vectors, idf


def build_csr_matrix(doc_vectors, term_to_idx, n_docs):
    """Convert dict-based vectors to CSR matrix."""
    n_terms = len(term_to_idx)
    
    rows, cols, data = [], [], []
    for doc_idx, vec in doc_vectors.items():
        for term, weight in vec.items():
            term_idx = term_to_idx.get(term)
            if term_idx is not None:
                rows.append(doc_idx)
                cols.append(term_idx)
                data.append(weight)
    
    matrix = csr_matrix((data, (rows, cols)), shape=(n_docs, n_terms), dtype=np.float32)
    return matrix


def main():
    parser = argparse.ArgumentParser(description="Build semantic neighbor graph")
    parser.add_argument("--input", default="/tmp/search_index.json",
                        help="Path to search_index.json")
    parser.add_argument("--output", default="site/assets/neighbor_graph.json",
                        help="Output path for neighbor graph JSON")
    parser.add_argument("--top-k", type=int, default=20,
                        help="Neighbors per doc (default: 20)")
    parser.add_argument("--min-terms", type=int, default=2,
                        help="Minimum terms per doc to be indexed (default: 2)")
    args = parser.parse_args()
    
    print(f"Loading {args.input}...")
    with open(args.input, encoding="utf-8") as f:
        idx = json.load(f)
    docs = idx.get("docs", [])
    print(f"Total docs: {len(docs)}")
    
    # Filter: only keep docs with location (publishable articles)
    valid_docs = [d for d in docs if d.get("location")]
    print(f"Docs with location: {len(valid_docs)}")
    
    print("\nBuilding inverted index...")
    t0 = time.time()
    inv_idx, doc_terms = build_inverted_index(valid_docs)
    
    # Filter terms: keep those with 2-5000 docs (remove too rare/too common)
    filtered_terms = {
        term: doc_indices
        for term, doc_indices in inv_idx.items()
        if 2 <= len(doc_indices) <= 5000
    }
    print(f"  Terms: {len(inv_idx)} total → {len(filtered_terms)} after filtering")
    
    # Build term → index mapping
    term_to_idx = {term: i for i, term in enumerate(filtered_terms)}
    
    print(f"Building TF-IDF vectors ({len(valid_docs)} docs, {len(term_to_idx)} terms)...")
    doc_vectors, idf = compute_tfidf(doc_terms, len(valid_docs))
    
    # Filter doc vectors to only include filtered terms
    filtered_vectors = {}
    for doc_idx, vec in doc_vectors.items():
        filtered = {t: v for t, v in vec.items() if t in term_to_idx}
        if len(filtered) >= args.min_terms:
            filtered_vectors[doc_idx] = filtered
    print(f"  Docs with >= {args.min_terms} terms: {len(filtered_vectors)}")
    
    print("Building sparse matrix...")
    matrix = build_csr_matrix(filtered_vectors, term_to_idx, len(valid_docs))
    print(f"  Matrix shape: {matrix.shape}")
    print(f"  Non-zero entries: {matrix.nnz}")
    
    # Normalize rows to unit length (for cosine similarity)
    print("Normalizing rows...")
    row_norms = sparse_norm(matrix, axis=1)
    row_norms[row_norms == 0] = 1.0  # avoid division by zero
    matrix = matrix.multiply(1.0 / row_norms[:, np.newaxis])
    
    # Compute pairwise cosine similarity
    # S = A @ A.T where A is unit-normalized → S[i,j] = cosine similarity
    print("Computing pairwise cosine similarity (A @ A.T)...")
    t1 = time.time()
    similarity = matrix @ matrix.T
    t2 = time.time()
    print(f"  Computation time: {t2 - t1:.1f}s")
    print(f"  Similarity matrix shape: {similarity.shape}")
    print(f"  Non-zero similarity pairs: {similarity.nnz}")
    
    # Extract top-k neighbors per doc
    print(f"\nExtracting top-{args.top_k} neighbors per doc...")
    
    # similarity is a CSR matrix. For each row, find top-k values.
    neighbor_graph = {}
    doc_indices = set(doc_vectors.keys())  # which docs were actually vectorized
    
    for i in range(len(valid_docs)):
        if i not in doc_indices:
            continue
        
        # Get similarity row
        row_start = similarity.indptr[i]
        row_end = similarity.indptr[i + 1]
        cols = similarity.indices[row_start:row_end]
        vals = similarity.data[row_start:row_end]
        
        # Filter: exclude self-similarity (i == j) and zero scores
        pairs = [(int(j), float(v)) for j, v in zip(cols, vals) if j != i and v > 0.01]
        
        # Sort by descending score
        pairs.sort(key=lambda x: -x[1])
        
        # Keep top-k
        top_k = pairs[:args.top_k]
        
        if top_k:
            neighbor_graph[str(i)] = top_k
    
    print(f"  Docs with neighbors: {len(neighbor_graph)}")
    
    # Estimate total entries
    total_entries = sum(len(v) for v in neighbor_graph.values())
    print(f"  Total neighbor entries: {total_entries}")
    
    # Save
    os.makedirs(os.path.dirname(args.output) or ".", exist_ok=True)
    print(f"\nSaving to {args.output}...")
    
    # Compact JSON: no indentation for file size
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(neighbor_graph, f, ensure_ascii=False, separators=(",", ":"))
    
    out_size = os.path.getsize(args.output)
    print(f"  Output size: {out_size / 1024 / 1024:.1f} MB")
    
    elapsed = time.time() - t0
    print(f"\nDone! Total time: {elapsed / 60:.1f} min")
    
    # Validate
    print("\nValidating...")
    sample_indices = sorted(neighbor_graph.keys())[:3]
    for si in sample_indices:
        neighbors = neighbor_graph[si][:3]
        print(f"  Doc {si} ({valid_docs[int(si)]['title'][:40]}...):")
        for n_idx, score in neighbors:
            print(f"    → Doc {n_idx}: {valid_docs[n_idx]['title'][:50]}... (score={score:.4f})")


if __name__ == "__main__":
    main()
