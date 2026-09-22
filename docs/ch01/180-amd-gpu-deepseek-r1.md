# AMD 免费云 GPU 私有化部署 DeepSeek-R1

> 📊 Level ⭐⭐⭐ | 11.8KB

## 摘要

AMD "AI 开发者计划"提供免费 200 小时的云 GPU 资源（Radeon PRO W7900, 48GB GDDR6, ROCm 7.2.1），本文提供从零开始的端到端部署指南：环境检查 → ROCm 配置 → ModelScope 下载模型 → vLLM 推理服务 → ngrok 公网隧道 → Cherry Studio/OpenCode 客户端接入。全过程零硬件成本，数据在私有 GPU 上运行，不上传任何第三方服务器。

## 核心要点

1. **AMD 免费云 GPU 入口**：AMD AI 开发者计划提供 48GB VRAM 的 Radeon PRO W7900，预装 ROCm 7.2.1 + vLLM，免费 200 小时，足以运行 14B 参数模型
2. **ROCm 环境关键配置**：`PYTORCH_ROCM_ARCH="gfx1100"` + `HSA_OVERRIDE_GFX_VERSION=11.0.0` 是 gfx1100 的必要环境变量，缺一不可
3. **ModelScope 国内镜像**：国内用户推荐 ModelScope 下载模型（速度几十 MB/s），避免 HuggingFace 的 GFW 限速
4. **vLLM 服务参数**：`--enable-auto-tool-choice` 和 `--tool-call-parser hermes` 是 OpenCode 等工具调用的必需参数
5. **ngrok 公网隧道**：用 ngrok 将云端 vLLM 服务暴露到公网 HTTPS 端点，本地电脑通过 ngrok URL 访问云 GPU
6. **客户端接入**：Cherry Studio（非开发者）和 OpenCode（开发者）两种方式配置，OpenCode 需配置 `opencode.json` 中的 provider/baseURL/apiKey 和模型限制

## 深度分析

### 私有化部署的「需求四象限」与免费云 GPU 的适配边界

原文把私有化部署的动机拆成四个痛点：数据隐私（调用第三方 API 时合同、客户信息、代码源文件一旦发出就脱离控制，对金融/医疗/法律/政务是红线）、成本失控（个人用尚可，团队推广后按量计费账单可以从几百一夜变成几万）、服务断供风险（API 因政策变化突然下线，依赖它的系统立刻瘫痪）、GPU 门槛（48GB 专业卡售价几万，云租用每小时几十元）。这四个痛点分别对应安全合规、成本控制、业务连续性、可及性四个维度，构成一张「需求四象限」——只有当真实痛点落在隐私或断供上时，私有化才是刚性需求；落在成本或可及性上时，私有化往往不是最经济的答案。

AMD 的 200 小时免费额度恰好只覆盖「可及性」这一格：它把 GPU 门槛降到零，却不覆盖合规、SLA、运维与持久化。按每天实验 2-4 小时估算，200 小时约等于 50-100 个工作日，够做一次完整的端到端部署演练、跑通 14B 模型的部署与工具调用验证、做几轮量化/上下文长度对比；不够做任何形式的长期服务、多用户压测或稳定性观察——额度是挂钟时间而非 GPU 秒数，实例不删就一直烧。因此工程上的正确用法是把它当「一次性验证环境」：用一次额度确认模型效果与工具链可行性，再据此决定自建还是租用。

### ROCm 软件栈的真实摩擦点

gfx1100 是 RDNA3（Radeon PRO W7900）的 LLVM 目标名，PyTorch 与 [vLLM](https://github.com/QianJinGuo/wiki-public/blob/main/entities/vllm.md) 的 ROCm 构建按架构预编译内核，所以 `PYTORCH_ROCM_ARCH="gfx1100"` 不是「性能优化选项」而是「内核能否加载」的开关：不设置时运行时退回到默认架构列表，轻则找不到匹配的 fatbinary 直接报错，重则走 fallback 路径吞吐骤降。

`HSA_OVERRIDE_GFX_VERSION=11.0.0` 是更微妙的一层：HSA 运行时在容器/虚拟化环境下报告的设备版本未必与驱动实际支持的版本一致，这个变量强制把运行时看到的 gfx version 覆写成 11.0.0，让内核调度的 ISA 假设与硬件真实能力对齐，否则会出现「服务能起但吞吐异常低」或随机算子失败。原文把这两个变量标为「缺一不可」，是踩过坑之后的结论，而非文档照抄。

与 CUDA 生态的兼容代价集中在三处：算子覆盖（vLLM 的 attention/量化内核在 ROCm 上依赖 CK/Triton 后端，部分 CUDA 专属 kernel 没有等价实现）、专用加速库（`VLLM_ROCM_USE_AITER=1` 只对 MI300/CDNA 生效，gfx1100 上启用反而有害）、模型架构支持（MLA 架构的 DeepSeek-R1 满血 671B 在 gfx1100 上不可跑）。这些不是配置问题，而是软硬件协同成熟度的结构性差异；短期内只能靠「选已验证的组合」规避，这也是 [PyTorch Monarch 在 AMD GPU 上的分布式训练](https://github.com/QianJinGuo/wiki-public/blob/main/entities/pytorch-monarch-amd-gpus-rocm-distributed-training.md) 这类工作值得跟踪的原因——AMD 生态的可用面正在快速扩大，参见 [CUDA 护城河的松动](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cuda-20年护城河一个周末崩了-claude独自跑通amd新gpu.md)。

### 推理服务的可调用性：工具调用、隧道与私有化承诺的张力

`--enable-auto-tool-choice` 与 `--tool-call-parser hermes` 是让 vLLM 从「聊天补全服务」升级为「Agent 后端」的关键：前者允许模型在 OpenAI 兼容接口上返回结构化的 `tool_calls`，而不是把工具调用意图写在自然语言里；后者指定用 Hermes 格式解析模型的工具调用输出。DeepSeek-R1-Distill-Qwen 系列的对话模板恰好使用 Hermes 风格标记，因此这两个参数直接决定了 OpenCode 这类 Agent 客户端能否闭环执行——缺了它们，客户端只拿到一段文本，无法触发文件读写或命令执行，Agent 能力归零。

ngrok 隧道的代价被原文一句带过，实际有两层问题。延迟上多一跳 TLS 终止与跨区回源，Agent 场景每轮工具调用都要完整往返，累积后交互体感明显劣化；安全上，一个未启用鉴权的 `ngrok http 8000` 等于把 vLLM 的 OpenAI 端点直接暴露在公网，任何拿到 URL 的人都能耗尽你的免费额度、探测模型能力，且请求内容会穿过第三方隧道服务。这与原文「数据全程不出自己的服务器」的私有化承诺直接冲突——引入隧道后，准确的表述应是「模型计算不出第三方，但网络路径经过第三方」，对合规敏感场景这已经足以否决方案。

### 成本与工程权衡

免费额度耗尽后的迁移路径有三条：继续留在 AMD 开发者计划（续期或换账号，不可控）、切换到按小时计费的云 GPU（如 [Modal 这类 serverless GPU](https://github.com/QianJinGuo/wiki-public/blob/main/entities/modal-truly-serverless-gpus.md) 按实际推理秒数计费，代价是冷启动）、或购置自建。粗算 TCO：自建一张 W7900 级别 48GB 卡加上配套主机约 3-5 万元，按三年折旧约每月 1000-1500 元，另加电费与运维人力；云租用若按 10 元/小时、每月 60 小时计约 600 元/月，五年周期内租用更便宜，除非利用率超过约 50%。自建的真正理由不是单价，而是数据不出机房的确定性、无并发上限的自由度，以及不依赖任何第三方额度的业务连续性。参照 [AMD 跑 GLM-5.2 成本只有英伟达一半](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amd跑glm-52成本只要英伟达一半.md) 的测算思路，AMD 路线的成本优势在规模化后才会显现，单卡实验阶段更多是「省了准入成本」而非「省了单位成本」。

48GB VRAM 的容量上限可以这样估算：FP16 权重直接占显存，14B 约 28GB，按 `--gpu-memory-utilization 0.90`（约 43GB 可用）扣除权重后剩约 15GB 给 KV Cache，对应 `--max-model-len 16384` 下的中低并发（数路到十余路），这与原文的配置一致，也是「14B 是 48GB 卡的黄金匹配」的技术依据。若想上 32B/70B 级模型，必须走 AWQ/GPTQ/FP8 量化把权重压到 4-8bit，其质量损失与 ROCm 上的量化内核覆盖率都需实测；而 DeepSeek-R1 满血 671B 的 MLA 架构在 gfx1100 上根本不支持，属于硬边界而非容量问题。

### 局限：这是一份单机指南，不是生产架构

原文的拓扑是「单容器 + 单进程 vLLM + 公网隧道」，没有任何多租户或运维设施。要把这套流程推进到可对团队提供服务的状态，最小补齐清单如下：

- **鉴权**：在 vLLM 侧用 `--api-key`，或在前置网关统一校验 API Key；隧道层再叠一层 ngrok basic auth 或 OAuth
- **限流与配额**：网关按 key 做 RPM/TPM 限流，防止单个 client 打满 48GB 显存上的并发预算
- **监控**：暴露 vLLM 的 `/metrics` 供 Prometheus 抓取，同时从 `rocm-smi`/`amd-smi` 采集 GPU 利用率、显存、温度与功耗
- **持久化存储**：把模型权重与日志挂到云盘/对象存储，实例销毁后不丢数据，避免每次重建都重下 28GB 权重
- **进程守护**：用 systemd 或 supervisor 接管 vLLM，替代裸 `vllm serve`，实现崩溃自动重启与日志轮转
- **额度与生命周期管理**：实例创建/销毁自动化，并设置到期自动删除，防止忘记关掉持续消耗 200 小时额度
- **稳定端点**：把随机 URL 的 ngrok 换成带固定域名与访问日志的反向代理/内网穿透方案

这份清单里没有任何一项是 vLLM 或 ROCm 本身能提供的——它们全部落在「部署」而非「推理」层面。这也解释了为什么一篇优秀的单机实操指南离生产化仍有三到五倍的工程量差距：教程解决的是「跑起来」，生产要解决的是「跑得住、跑得安全、跑得可算账」。

## 实践启示

1. **免费 GPU 入门路径**：AMD 200 小时免费额度是开发者体验私有化部署的低门槛入口，适合教学/实验场景
2. **必须记住的清理操作**：实验结束后必须在 radeon.anruicloud.com Profile 中删除实例，否则持续消耗额度
3. **模型选择**：DeepSeek-R1-Distill-Qwen-14B（28GB FP16）是 48GB 显存卡的黄金匹配，留空 20GB 给 KV Cache
4. **OpenCode 配置关键**：`limit.context` 必须与 `--max-model-len` 一致，`limit.output` 设为 context 的一半

## 相关实体

- [vLLM 推理引擎](https://github.com/QianJinGuo/wiki-public/blob/main/entities/vllm.md)
- 知识蒸馏专题
- [DeepSeek 推理引擎](https://github.com/QianJinGuo/wiki-public/blob/main/entities/redis之父下场给deepseek-v4单独造了一台推理引擎.md)

→ [原文存档](https://mp.weixin.qq.com/s/DY9oiDqQJb8PCXwC6GMlcQ)

---

