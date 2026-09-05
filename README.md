# AI Engineering · 《AI 工程》

<p align="center">
  English · <a href="README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  <a href="https://jinguo.tech">
    <img src="docs/assets/images/ai-engineering-cover.png" alt="AI Engineering: from LLM fundamentals to production-grade agents" width="820">
  </a>
</p>

<p align="center">
  <strong>From LLM fundamentals to production-grade agents</strong><br>
  An open-source guide to building reliable AI systems — curated from thousands of first-hand sources and updated daily.
</p>

<p align="center">
  <a href="https://jinguo.tech">Read online</a> ·
  <a href="docs/assets/images/ai-engineering-cover-1600x2400.png">Portrait cover</a> ·
  <a href="docs/PATH.md">Learning path</a> ·
  <a href="CONTRIBUTING.md">Contributing</a>
</p>

<p align="center">
  <a href="https://jinguo.tech"><img src="https://img.shields.io/badge/Read_Online-jinguo.tech-2563eb" alt="Read online at jinguo.tech"></a>
  <a href="https://github.com/QianJinGuo/wiki-book/stargazers"><img src="https://img.shields.io/github/stars/QianJinGuo/wiki-book?style=social" alt="GitHub stars"></a>
  <a href="https://creativecommons.org/licenses/by-sa/4.0/"><img src="https://img.shields.io/badge/Content-CC_BY--SA_4.0-lightgrey" alt="Content licensed CC BY-SA 4.0"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/Code-MIT-16a34a" alt="Code licensed MIT"></a>
  <a href="https://squidfunk.github.io/mkdocs-material/"><img src="https://img.shields.io/badge/MkDocs-Material-526cfe" alt="Built with MkDocs Material"></a>
</p>

> This is not an API cheat sheet. It is a learning path that runs from mental models of LLMs, through the agent control loop, to shipping AI systems in production.

## Overview

*AI Engineering* (《AI 工程》) is an open-source, continuously evolving book for engineers and researchers who want to truly understand, build, and deliver AI systems: working mental models of LLMs → the agent control loop → Harness, Tools, Skills, MCP, Memory, and Multi-Agent patterns → RAG, evaluation, tracing, security governance, and production deployment. Content is co-created by the AI community and the Hermes Agent, and every entry keeps its first-hand sources and difficulty rating, so claims stay traceable to evidence.

| 2,153 | 20 chapters · 5 parts | 3,991 | v1.3.8 |
|:---:|:---:|:---:|:---:|
| Curated entries | Book structure | Public source cards | Current version |

## What you will learn

- Build working mental models of LLMs, Transformers, training, and inference.
- Grow from a minimal agent loop to Harness, Tools, Skills, MCP, Memory, and Multi-Agent patterns.
- Design RAG, evaluation, tracing, security governance, and deployment so AI applications reach production reliably.
- Follow the five-part path from beginner to mastery, or read chapters and topics independently.

## The book at a glance

| Part | Core question | Chapters | Audience |
|:---|:---|:---|:---|
| **01 · Foundations** | Understanding AI from zero | Ch01 AI & LLM Fundamentals · Ch02 Prompting & Context Engineering · Ch03 AI Tools & Product Landscape | Everyone |
| **02 · Engineer** | Building AI applications | Ch04 Agents · Ch05 Harness · Ch06 Memory · Ch07 Tools / Skills / MCP · Ch08 Multi-Agent · Ch09 AI Coding · Ch10 RAG | Some programming experience |
| **03 · Expert** | System architecture in depth | Ch11 Cloud Infrastructure & Deployment · Ch12 Security & Governance · Ch13 MLOps & Evaluation · Ch14 Data Engineering | ML background |
| **04 · Scientist** | Research & innovation | Ch15 Training & Fine-Tuning · Ch16 Inference Optimization & Architectures · Ch17 Multimodal & Generation · Ch18 Robotics & Embodied AI | Researchers |
| **05 · Mastery** | Philosophy, safety & the future | Ch19 Frontier Research & Theory · Ch20 AI Philosophy, Safety & the Future | Thinkers |

## Core capabilities

| Capability | Description |
|:---|:---|
| **Traceable content** | Entries keep first-hand source leads with difficulty ratings and reading positions, so every claim can be traced back to evidence. |
| **Multi-layer retrieval** | A local in-browser index first, backed by BM25, semantic search, a neighbor graph, and a Pages Function fallback. |
| **AI Chat** | Retrieval before conversation: site knowledge becomes chat context, with RAG served from the Cloudflare environment. |
| **Quality loop** | Daily sync, score gating, exit curation, index rebuilds, and regression checks form a continuously maintained pipeline. |

## The cover

The cover visualizes "a knowledge system that can be engineered": modules, connections, and anchors on the right form an upward knowledge path, echoing the climb from LLM fundamentals to production-grade agents.

Click the cover at the top to view the **1600×2400 portrait edition**. The landscape edition is used for the site homepage, social media, and share cards; before actual printing, publisher requirements such as author credit, ISBN, barcode, copyright page, bleed lines, and CMYK files still need to be confirmed.

![AI Engineering website homepage](docs/assets/images/screenshot-home.png)

## Quick start

### Read directly

Open [jinguo.tech](https://jinguo.tech) to read online, or visit the [GitHub Pages mirror](https://wiki.jinguo.tech) for the pure static version.

### Local build & Docker

```bash
git clone https://github.com/QianJinGuo/wiki-book.git
cd wiki-book

python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

# course / dashboard → MkDocs → slim search index → align neighbor graph
PYTHON=.venv/bin/python bash scripts/build.sh
docker compose up -d --build

# http://localhost:8002
```

`scripts/build.sh` is the only recommended build entry. Do not bypass it and deploy an unslimmed search index: index slimming and neighbor-graph generation must keep the same order and data source.

### RAG regression

```bash
node test-rag.mjs
```

By default this only checks local Docker; production and GitHub Pages require an explicit target so regression tests are never mistaken for load tests:

```bash
node test-rag.mjs                                      # local Docker
RAG_TEST_TARGET=production ALLOW_PRODUCTION_TEST=1 node test-rag.mjs
RAG_TEST_TARGET=github node test-rag.mjs
```

`npm test` runs the local auth regression tests.

## Deployment targets

| Environment | URL | Role |
|:---|:---|:---|
| **Cloudflare Pages** | [jinguo.tech](https://jinguo.tech) | Production: Pages Functions + R2 + Vectorize |
| **GitHub Pages** | [wiki.jinguo.tech](https://wiki.jinguo.tech) | Static mirror: GitHub Actions |
| **Docker** | `http://localhost:8002` | Local development & preview |

```bash
# publish to Cloudflare Pages after building
./deploy/cloudflare/deploy.sh

# start Docker locally
docker compose up -d --build
```

### Cloudflare secrets

`wrangler.toml` only stores resource identifiers for Pages, R2, Vectorize, and D1 — never API keys, tokens, or private keys. Production secrets are configured through Cloudflare Pages Secrets (e.g. `SITE_TOKEN`, `XUNFEI_API_KEY`, and `USER_DATA_SECRET`); when building Vectorize locally, provide least-privilege `CLOUDFLARE_API_TOKEN` and `XUNFEI_API_KEY` via environment variables and never commit them to the repository:

```bash
npx wrangler pages secret put SITE_TOKEN --project-name ai-engineering
npx wrangler pages secret put XUNFEI_API_KEY --project-name ai-engineering
npx wrangler pages secret put USER_DATA_SECRET --project-name ai-engineering
```

`USER_DATA_SECRET` signs learning-progress sync identities; losing a sync key means the client cannot recover that identity, and rotating the server-side key invalidates existing sync keys. See the [Cloudflare Secrets documentation](https://developers.cloudflare.com/workers/configuration/secrets/).

## Project layout

```text
docs/ch01–ch20/                 book chapters and publishable entries
docs/raw/articles/              third-party source cards (no full texts stored)
scripts/build.sh                unified build entry: course, index, MkDocs, neighbor graph
functions/                      Cloudflare Pages Functions and RAG endpoints
overrides/                      MkDocs theme overrides, AI Chat, and cover integration
cover/                          cover SVGs, render scripts, and editable assets
```

## Publishing scope & maintenance boundaries

- `docs/raw/` is excluded from MkDocs and never becomes site pages; the public repo keeps third-party source cards only, never full texts. Full texts, if needed locally, must live in a private source outside the repo.
- `meta/` and the root `AGENTS.md` are local maintainer material and not part of the public repo; public design notes and contribution workflows belong in sanitized docs.
- `site/` and `cover/exports/` are generated artifacts; the cover SVGs, render scripts, theme overrides, and source assets are the primary editing surfaces.

## Contributing

You can help by:

- Submitting high-quality AI engineering articles — see the [contributing guide](CONTRIBUTING.md).
- Reporting issues with content, links, the index, or deployment.
- Improving RAG retrieval, the evaluation system, or the build pipeline.
- Sharing the project so more people can build AI engineering skills.

## License

| Content | License |
|:---|:---|
| Build scripts, RAG frontend/backend & engineering code | [MIT](LICENSE) |
| Original book chapters & project docs (excluding `docs/raw/`) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `docs/raw/articles/` source cards | No redistribution license is granted for third-party text; the source URL, author, and license fields on each card defer to the original source |

---

<p align="center">
  <sub>Continuously updated · Open collaboration · AI engineering in practice</sub><br>
  <sub>v1.3.8 · 2026-09-05 · Maintained by Hermes Agent</sub>
</p>
