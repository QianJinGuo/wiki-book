---
source: rss
source_url: https://huggingface.co/blog/thinkingmachines-inkling
ingested: 2026-08-14
feed_name: Hugging Face Blog
source_published: 2026-07-15
content_source: github-raw
sha256: 2ec0f44b7adc0afee1e9d250d86e8ca1ee51d275458bc5189f8a4345f719a2d1
---

# Add TINKER_API_KEY=... to .env, then run:
uv run --env-file .env \
  examples/echo_world_model/backends/tinker_echo_demo.py

```

</details>

If you’re working with Transformers Reinforcement Learning we suggest using Inkling as a teacher model in a knowledge distillation setup. For example, take advantage of Inkling’s document understanding abilities to improve the performance of a smaller (on-device) model. In [this example](https://github.com/huggingface/trl/blob/main/examples/scripts/gold.py), we use the transformer reinforcement learning library and the GOLD algorithm to distill knowledge. GOLD is handy here because it matches token logits between different tokenizers, so you can distill to any model on the hub.

## Deploying Inkling and Inkling-Small 

Below you can find each Inkling checkpoint as well as their VRAM requirements.

| Model Variant | Aggregated VRAM | Recommended GPU Configurations | Deployment Notes |
| :--- | :--- | :--- | :--- |
| **Inkling (BF16)** | 2 TB | • 8× NVIDIA B300 / GB200<br>• 16× NVIDIA H200 | Full precision deployment; requires multi-node interconnect for H200 clusters. |
| **Inkling (NVFP4)** | 600 GB | • 4× NVIDIA B300 / GB200 (W4A4)<br>• 8× NVIDIA H200 (W4A16) | W4A4 requires Blackwell architecture (SM100+). |
| **Inkling-Small (BF16)** | 600 GB | • 4× NVIDIA B300 / GB200 (W4A4)<br>• 8× NVIDIA H200 (W4A16) | Does not require Blackwell architecture; easily deployed to 8× H200s. |
| **Inkling-Small (NVFP4)** | 180 GB | • 1× NVIDIA B300 (W4A4)<br>• 2× NVIDIA H200 (W4A16) | W4A4 supported on single Blackwell GPU; W4A16 supported on 2× H200s. |

## Deploying Inkling on a cluster

To deploy Inkling on a cluster, we provide SLURM scripts serving with transformers API, as well as how to query the endpoint with different modalities. You can adapt these scripts to vLLM or SGlang by updating the commands. These scripts live [here](https://huggingface.co/buckets/merve/inkling).

* [Submit inference job](https://huggingface.co/buckets/merve/inkling/tree/slurm/submit_inkling_generate.sbatch)
* [Python generation script](https://huggingface.co/buckets/merve/inkling/tree/slurm/generate_inkling.py)

## Deploying Inkling-Small on Inference Endpoints

You can deploy an Inkling-Small NVFP4 checkpoint using Inference Endpoints. We provide a pre-tested configuration to deploy it on 8 RTX PRO 6000s with an aggregated VRAM of·768 GB, giving large space for KV cache, costs $ 22 per hourly uptime (scales to zero when unused). To deploy, run hf endpoints catalog deploy --repo thinkingmachines/Inkling-Small-NVFP4 using the Hugging Face CLI or alternatively, head to https://endpoints.huggingface.co/new/thinkingmachines/Inkling-Small-NVFP4. With this setup, you can get 140 TPS (single user inference, prepared for multi-user support with continuous batching)

Once the endpoint is up, you can query as follows. 

```sh
curl "YOUR_ENDPOINT_HERE" \
-X POST \
-H "Authorization: Bearer $HF_TOKEN" \
-H "Content-Type: application/json" \
-d '{
    "model": "thinkingmachines/Inkling-Small-NVFP4",
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://endpoints.hf.co/media-examples/img1.png"
                    }
                },
                {
                    "type": "text",
                    "text": "Describe this image in one sentence."
                }
            ]
        }
    ],
    "stream": true,
    "max_tokens": 100
}'
```

## Benchmark Results

|     |     | Inkling Small | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (high) | Claude Fable 5 (max) | GPT 5.6 Sol (xhigh) |
|-----|-----|---------------|---------|------------------|-----------|-----------|---------|-----------------|-----------------------|----------------------|---------------------|
| **Reasoning** |     |         |         |                  |           |           |         |                 |                       |                      |                     |
|     | HLE (text only) | 31.6% | 29.7%   | 26.6%            | 29.4%     | 35.9%     | 40.1%   | 35.9%           | 44.7%                 | 53.3%                | 47.2%               |
|     | HLE (with tools) | 47.8% | 46.0%   | 37.4%            | 50.2%     | 54.0%     | 54.7%   | 48.2%           | 51.4%                 | 64.5%                | 55.0%               |
|     | AIME 2026 | 95.5% | 97.1%   | 94.2%            | 95.8%     | 96.4%     | 99.2%   | 96.7%           | 98.3%                 | –                    | 99.9%               |
|     | GPQA Diamond | 89.5% | 87.2%   | 86.7%    0       | 87.9%     | 91.1%     | 89.5%   | 88.8%           | 94.1%                 | 92.6%                | 94.1%               |
| **Agentic (coding)** |     |         |         |                  |           |       0   |         |                 |                       |                      |                     |
|     | SWEBench Verified | 80.2% | 77.6%   | 70.7%            | 76.8%     | 80.2%     | –       | 80.6%           | 80.6%                 | 95.0%                | –                   |
|     | SWEBench Pro (Public) | 55.9% | 54.3%   | 46.4%            | 50.7%     | 58.6%     | 62.1%   | 55.4%           | 54.2%                 | 80.0%                | 64.6%               |
|     | Terminal Bench 2.1 (Best Harness) | 64.69 | 63.8    | 56.4             | 51.3         | 71.3      | 82.7    | 64              | 73.8                  | 84.6                 | 89.5                |
|     | GDPVal-AA v2 | 1269 | 1233    | 1164             | 1009         | 1190      | 1514    | 1307            | 962                   | 1760                 | 1748                |
| **Agentic (general)** |     |         |         |                  |           |           |         |                 |                       |                      |                     |
|     | MCP Atlas | 79.2% | 74.1%   | 44.7%                | 64.0%     | 68.1%     | 77.8%   | 73.2%           | 78.2%                 | 83.3%                | 81.8%               |
|     | Tau 3 Banking | 15.5% | 23.7%   | 13.8%            | 13.2%     | 20.6%     | 26.8%   | 25.8%           | 16.5%                 | 26.8%                | 33.0%               |
| **Factuality** |     |         |   0     |                  |           |           |         |                 |                       |                      |                     |
|     | BrowseComp (w/ Ctx) | 77.4% | 77.1%   | –                | 74.9%     | 83.2%     | –       | 83.4%           | 85.9%                 | 88.0%                | 89.4%               |
|     | SimpleQA Verified | 20.6% | 43.9%   | 32.4%            | 36.9%     | 38.7%     | 38.1%   | 57.0%           | 77.3%                 | 68.3%                | 71.6%               |
|     | AA Omniscience | -9 | 1.0%    | -1.0%            | -8.0%     | 6.0%      | 4.0%    | -10.0%          | 33.0%                 | 40.0%                | 22.0%               |
| **Chat** |     |         |         |                  |       0   |           |         |                 |                       |                      |                     |
|     | IFBench | 82.2% | 79.8%   | 81.4%            | 70.2%     | 76.0%     | 73.3%   | 76.5%           | 77.1%                 | 63.5%                | 72.7%               |
|     | Global-MMLU-Lite | 86.7% | 88.7%   | 85.6%            | 84.0%     | 88.4%     | 89.2%   | 89.3%           | 92.7%                 | 93.3%                | 91.8%               |
| **Vision** |     |         |         |                  |           |           |         |       0         |       0               |                      |       0             |
|     | MMMU Pro (Standard 10) | 74.0% | 73.3%   | –                | 75.0%     | 79.0%     | –       | –               | 82.0%                 | 84.2%                | 83.0%               |
|     | Charxiv RQ | 77.4% | 78.1%   | –                | 77.5%     | 80.4%     | –       | –               | 80.2%                 | 86.5%                | 84.7%               |
|     | Charxiv RQ (with python) | 82.3% | 82.0%   | –                | 78.7%     | 86.7%     | –       | –               | 89.9%                 | 89.4%                | 87.8%               |
| **Audio** |     |         |         |                  |           |       0   |         |                 |                       |                      |                     |
|     | Audio MC | 54.9% | 56.6%   | –                | –         | –         | –       | –               | 66.8%                 | –                    | –                   |
|     | MMAU | 77.0% | 77.2%   | –                | –         | –         | –       | –               | 82.5%                 | –                    | –                   |
|     | VoiceBench | 90.1% | 91.4%   | –                | –         | –         | –       | –               | 94.3%     0           | –                    | –                   |
| **Safety** |     |         |         |                  |           |           |       0 |                 |                       |                      |                     |
|     | FORTRESS (Adversarial) | 71.6% | 78.0%   | 77.6%            | 54.1%     | 65.6%     | 71.3%   | 36.0%           | 65.2%                 | 96.0%                | 82.4%            stationary |
|     | FORTRESS (Benign) | 96.9% | 95.9%   | 90.5%            | 98.3%     | 97.2%     | 90.0%   | 98.5%           | 98.0%                 | 55.1%                | 98.1%               |
|     | StrongREJECT | 98.4% | 98.6%   | 98.7%            | 99.5%     | 99.8%     | 98.5%   | 98.6%           | 98.0%                 | 98.7%                | 98.5%               |


