# SkyPilot × Hugging Face — 零出口流量 AI 工作负载存储

## Ch01.186 SkyPilot × Hugging Face — 零出口流量 AI 工作负载存储

> 📊 Level ⭐ | 1.5KB | `entities/skypilot-hf-zero-egress-storage.md`

# SkyPilot × Hugging Face — 零出口流量 AI 工作负载存储

SkyPilot 与 Hugging Face 联合发布：**模型/数据集留在 HF Hub，SkyPilot 在任意有 GPU 的集群（20+ 云、Kubernetes、Slurm、本地）跑计算**。通过 `hf://` URL + 已有 HF_TOKEN 把 HF Bucket 或任意 Hub repo 挂载进任务，跨云读取数据零出口费用。

## 关键机制

- **`store: hf`**：HF Bucket（读写）或 model/dataset/Space repo（只读）以 `hf://` 挂载进 SkyPilot 任务
- **零出口流量**：HF Storage 不收 egress/CDN 费，数据无需跨云复制
- **Xet 去重**：Bucket 基于 Xet，增量 checkpoint/模型变体只存储和传输变更 chunk
- **FUSE 上游化**：HF 团队把 `hf-mount` FUSE 修复上游到 unprivileged 容器可用

## 意义

把"数据与算力分离"的跨云 AI 工作负载从成本噩梦变成默认选项——云间数据迁移税（cross-cloud transfer tax）被结构性消除。属于 AI 基础设施层的存储编排创新，与 [Slack 多云路径](../ch05/110-ai.html) 同主题不同解法。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/skypilot-hf-zero-egress-storage.md)

---

