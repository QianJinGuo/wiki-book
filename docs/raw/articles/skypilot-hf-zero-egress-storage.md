---
source: rss
source_url: https://huggingface.co/blog/skypilot-hf-storage
ingested: 2026-08-14
feed_name: Hugging Face Blog
source_published: 2026-07-07
content_source: github-raw
sha256: 7b629f55348991680e689ddb58f17c6d6d1a575515483b99982aa72024c35778
---

# qwen-sft.yaml. Launch anywhere: sky launch qwen-sft.yaml --infra aws|gcp|...
resources:
  accelerators: H100:1 # or whatever the cloud has

file_mounts:
  /base-model:
    source: hf://Qwen/Qwen3.5-4B # read-only, lazy-mounted from the Hub
    store: hf
    mode: MOUNT
  /checkpoints:
    source: hf://buckets/my-org/qwen-sft # read-write Bucket
    store: hf
    mode: MOUNT

run: |
  python train.py --model /base-model --output_dir /checkpoints
```

What we measured:

- **The model loaded free on every cloud.** Lazy reads pull only what `from_pretrained` touches, so it was ready to train in about 30 seconds (up to \~500 MB/s). Because Hugging Face charges no egress, that pull cost nothing; had the model lived in S3, every read to a GPU on another cloud would have been billed egress (\~$0.09/GB on AWS).
- **Checkpoints streamed straight to the bucket** at up to ~170 MB/s (8.43 GB of weights each) and persisted past the GPU instance.

Per cloud, checkpoints wrote to the bucket at:

| Cloud              | GPU  | Checkpoint write |
| :----------------- | :--- | :--------------- |
| AWS (us-east-2)    | L40S | ~168 MB/s        |
| GCP (us-central1)  | L4   | ~123 MB/s        |
| Lambda (us-west-3) | H100 | ~112 MB/s        |

## Xet-backed storage: dedup for checkpoints and model variants

Hugging Face Buckets are built on [Xet](https://huggingface.co/docs/hub/xet/overview), which uses [content-defined chunking](https://huggingface.co/docs/hub/xet/deduplication) to split files into ~64 KB chunks and store each unique chunk once. Because the boundaries follow the content, an edit changes only the chunks it touches and the rest are recognized as already stored. This pays off in a few places:

- **Incremental and adapter checkpoints.** When you freeze layers, train adapters, or otherwise leave most weights untouched between saves, only the changed chunks upload instead of the whole checkpoint.
- **Model variants that share a base.** Fine-tunes and quantizations of one base model overlap heavily, so the shared chunks are stored once across all of them.
- **Datasets you append to.** Logs like conversation traces or inference outputs grow by appending rows to large Parquet files. The existing row groups stay byte-identical, so only the new rows transfer: in Hugging Face's [test](https://huggingface.co/blog/parquet-cdc), appending 10K rows to a 100K-row table moved about 10 MB instead of the full ~106 MB. (If you edit or delete rows in place, write with `use_content_defined_chunking=True` to keep changes local.)
- **Re-uploads skip what's already stored.** In our test, re-uploading an 8.43 GB blob already in the bucket took about 8 seconds, versus 24 seconds for the first upload, because only chunk hashes move. The same mechanism lets server-side `hf buckets cp` between repos and buckets copy by reference instead of re-uploading bytes.

How much you save depends on how much your artifacts overlap, but the deduplication is automatic: you write a checkpoint as usual, and only the new chunks leave the machine.

## Get started

```bash
pip install "skypilot[huggingface]"
hf auth login  # or: export HF_TOKEN=<your-token>
```

Add an `hf://` mount to any SkyPilot task and launch. `MOUNT` needs a base image with glibc 2.34+ and `/dev/fuse`.

## Built together: Hugging Face and SkyPilot

The initial `store: hf` support [started as a contribution](https://github.com/skypilot-org/skypilot/pull/9418) from Nikhil Jha. The Hugging Face team [carried it forward](https://github.com/skypilot-org/skypilot/pull/9698) and upstreamed the `hf-mount` FUSE fixes that let it mount in unprivileged containers, the default on many Kubernetes clusters. The SkyPilot team wired it into the storage backend. The whole path is open source: SkyPilot, Hugging Face's `hf-mount`, and the `huggingface_hub` client.

## Resources

- [SkyPilot storage docs](https://docs.skypilot.co/en/latest/reference/storage.html)
- [Hugging Face Storage Buckets guide](https://huggingface.co/docs/hub/storage-buckets)
- [`hf-mount`](https://github.com/huggingface/hf-mount)
- [Xet: content-defined chunking and deduplication](https://huggingface.co/docs/hub/xet/deduplication)
- [SkyPilot Slack community](https://slack.skypilot.co/)

