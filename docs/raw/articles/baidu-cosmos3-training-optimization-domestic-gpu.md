---
source_url: "https://mp.weixin.qq.com/s/YAo-kp8FHjIqQe2Xy7bhZQ"
source_title: "不用NVLink，如何通过AI Infra工程优化拉满Cosmos 3训练吞吐"
source_author: "百度Geek说"
source_publisher: "百度Geek说"
ingested: 2026-07-08
sha256: "188225422da0d7031993b8f60f8ddbeb293df11b2e235588e8104e65cd050483"
type: raw-source
status: ingested
tags: [baidu, ai-infra, cosmos-3, training-optimization, torch-compile, activation-checkpointing, rdma, domestic-gpu]
---

# 不用 NVLink，如何通过 AI Infra 工程优化拉满 Cosmos 3 训练吞吐

> 百度百舸 AI Infra 团队对 Cosmos3-Nano-Policy-DROID 在全链路训练优化上的工程实践——基于国内主流 GPU，无 NVLink。
> 论文：https://arxiv.org/pdf/2606.02800

## 背景：从 NVLink+GB200 到国内通用 GPU

Cosmos 3 官方训练基于 1024 张 NVIDIA GB200 + NVLink + HPN 超大规模集群。国内企业无法复制该环境。百度百舸在 `hpas.lgn7ib` 实例（搭载国产主流 GPU）上做全链路优化，实现了**超越官方基准的训练效率**（MFU 0.42 vs GB200 官方 0.23-0.3）。

## 全链路优化效果

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| 任务启动 | 37.2 min OOM | 25 s | **89×** |
| 峰值系统内存 | 1,734 GB (OOM) | 46 GB | **-97%** |
| 单机吞吐 | 1.35 sample/s/GPU | 2.69 sample/s/GPU | **+99.3%** |
| 12节点扩展效率 | — | 98.3% | — |
| MFU | GB200 官方 0.23-0.3 | **0.42** | 超越旗舰硬件 |

## 五项关键技术优化

### 1. 任务启动：Parquet 列裁剪 + 数据路径重构

社区代码 `ActionBaseDataset` 存在大量重复冗余字段读取。利用 Parquet 列存储的列裁剪能力剔除冗余，重构拷贝路径：
- 37.2 min OOM → **25 s**（89×），内存 1,734 GB → **46 GB**（-97%）

### 2. I/O 瓶颈：ColorJitter CPU→GPU 迁移

通过 Profiling 定位 CPU 端瓶颈：**ColorJitter 耗时占比 78.5%**。放弃堆叠 DataLoader Worker，将 ColorJitter 算子从 CPU 迁移至 GPU 执行：
- ColorJitter: 1.68s → **0.08s**，数据总时间: 2.12s → **0.52s**
- 吞吐: 1.35 → **2.03** samples/s/GPU（+**50%**）

### 3. torch.compile 适配国产 GPU：禁用 mix-order reduction

社区 torch.compile 在国产 GPU 上因 Shared Memory 限制抛出异常。根据 GPU 底层资源规格，禁用 mix-order reduction 策略：
- 吞吐: 2.03 → **2.61** samples/s/GPU（+**28.6%**）

### 4. 分层 Activation Checkpointing（Layer-wise AC）

社区默认 Full AC（全 36 层），选择性 AC 仅 +0.1%（无效）。开发分层 AC 策略，精细化控制层开启状态：
- 吞吐: 2.61 → **2.69** samples/s/GPU（+**3.1%**）

### 5. 多机扩展：弹性 RDMA + HSDP

依托百度百舸 ERI（弹性 RDMA 互联）网络，配合 HSDP 并行策略和计算通信 Overlap：
- 12 节点（96 卡）Scaling Efficiency：**98.3%**

## 精度验证

所有优化为精确等价变换或不影响数据流的 Pipeline 优化，Loss 曲线与官方 Baseline 完全一致。

## 已交付的其他模型训推加速

OpenPI、DreamZero、GR00T N1.6、Lingbot-VLA、Motus、AHA-WAM、FastWAM、Wan2.2。
