sha256: 5314f4f101c46a5d08a63e58c8134df53e6317a753508100354e62d50a3d957b
---
title: "Memory Prices"
source_url: "https://dam.stanford.edu/memory-prices.html"
ingested: 2026-06-30
type: article
created: 2026-06-30
---

# Memory Prices


Published Time: Fri, 26 Jun 2026 18:57:16 GMT

Markdown Content:
Historic and current **memory and storage prices**, collected in the spirit of John C. McCallum's classic memory-price dataset — interactive, with the raw data downloadable. Hover for details, click the legend to toggle series, drag or use the slider to zoom, and use the camera icon to export an image.

## Price per gigabyte over time

Historical lowest $/GB on a log scale — one line per memory type: **DRAM**, **NAND flash**, and **HBM**.

## DRAM price by generation

The DRAM line above, broken out by generation across the full history — Pre-DDR (SDRAM/core), DDR, DDR2, DDR3, DDR4, DDR5. (Generation is inferred from product descriptions, so older points are approximate.)

## Accelerator cost breakdown

Modeled estimates from **Epoch AI**: quarterly accelerator cost across the four largest AI-accelerator designers — **Nvidia, AMD, Google (TPU) and Amazon (Trainium)** — stacked by component (HBM, logic die, packaging/CoWoS, auxiliary), a **production-volume-weighted average**.

## HBM price by generation

By HBM generation (HBM2e → HBM3 → HBM3e → HBM4). HBM is sold only to accelerator makers on confidential contracts — there is **no public spot market** — so these are sparse **industry-analyst estimates** (TrendForce / SemiAnalysis), not transaction prices. HBM4 is _projected_ (launches Q3 2026). $/TBps is cost per unit of memory bandwidth (stack price ÷ per-stack bandwidth).

Methodology, sources and caveats
### Sources and method

| Category | What we track | Source and method | Reliability |
| --- | --- | --- | --- |
| DRAM $/GB | cheapest retail $/GB, overall and by generation (DDR3/DDR4/DDR5) | **Deep history (1957–2024):** the McCallum memory-price dataset ([jcmit.net, via the Internet Archive](https://web.archive.org/web/20250716092935/https://jcmit.net/memoryprice.htm)). **Mid-2024 onward:** the cheapest new consumer DIMM each month from [Keepa](https://keepa.com/) (Amazon retail price history), refreshed monthly. | Reference + live |
| NAND $/GB | cheapest retail SSD $/GB, 2010–present | **2016 onward:** the cheapest **consumer NVMe** SSD each month from [Keepa](https://keepa.com/) (Amazon retail price history), refreshed monthly; SATA and enterprise/datacenter drives are excluded, and per-drive posting glitches are filtered (see caveats). **2010–2016:** four _approximate_ pre-NVMe anchor points (no McCallum-equivalent flash dataset exists). | Live + approximate |
| HBM spend and cost breakdown | quarterly HBM spend ($B) and each component's share (%) of the accelerator bill of materials (HBM, logic, packaging, auxiliary) | [Epoch AI](https://epoch.ai/data-insights/ai-chip-component-cost-shares) (CC-BY): a modeled estimate, production-volume-weighted across the four largest accelerator designers (Nvidia, AMD, Google, Amazon); aggregate only, no per-company split. | External estimate |
| HBM $/GB by generation | HBM price per GB and per TB/s of bandwidth, by generation | Industry-analyst estimates — [TrendForce](https://www.trendforce.com/) and [SemiAnalysis](https://www.semianalysis.com/) (HBM has no public spot market); bandwidth from [JEDEC/Rambus](https://en.wikipedia.org/wiki/High_Bandwidth_Memory). HBM4 is projected. | Sparse estimate |

### Caveats

*   $/GB is the **cheapest retail price in nominal USD** — not contract, average, or inflation-adjusted, and retail lags contract pricing.
*   The cheapest listing often tracks an **end-of-life generation being cleared out**, not the leading edge — the per-generation chart shows this.
*   These are cheapest **listed** prices over time (via Keepa), **not confirmed sales**. For the SSD data, obvious posting errors are removed — any month a drive is listed **more than 60% below its own typical price** (e.g. a $130 SSD shown at $4) is dropped.
*   The DRAM line **splices two sources at mid-2024** (McCallum → Keepa); a small step there is expected, since Amazon's cheapest clearance can sit below McCallum's representative low.
*   HBM figures are **modeled estimates** (cost share and spend), not measured prices.

### Updates

DRAM and NAND $/GB refresh **monthly** from Keepa; HBM updates quarterly (Epoch AI). The McCallum backbone and HBM estimates are fixed. The downloadable [CSV](https://dam.stanford.edu/assets/memory-prices/memory-prices.csv) lists every point with its source.

### About

Compiled and maintained by David Shim, Stanford DAM project. Questions or corrections: [hsshim@stanford.edu](mailto:hsshim@stanford.edu).

