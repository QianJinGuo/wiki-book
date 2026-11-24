# AutoResearch-LLM：让 Agent 接手 LLM 训练优化

> 📊 Level ⭐⭐⭐ | 13.1KB

→ [原文存档](https://mp.weixin.qq.com/s/9qEgOV9FGk6u9_9zMLSI6A)

## AutoResearch-LLM：让 Agent 接手 LLM 训练优化

阿里妹导读

  

本文是一份 LLM 微调 AutoResearch 落地实战。作者把过去几个月在电商场景（Query 改写 / 同款判定 / 重排打分）上做 Qwen3 微调时的完整流水线沉淀成一个由 Agent 驱动的三阶段框架：场景诊断 → 方案设计 → 自动化实验，同时把踩过的坑（PyTorch 2.6 vs DeepSpeed、Qwen3 thinking mode 让 BLEU 掉到个位数、多队列 OSS endpoint 差异）一并写成 SKILL.md 交给 Agent 执行。文章适合关注 AI Coding、Agent for ML、LLM 微调工程化的同学阅读。文中提到的部分平台/工具（如星云、TuningFactory、TAO/Pailitao-AutoResearch）为公司内部命名，思路和方法本身与平台无关，读者可类比到 PAI、SageMaker、Slurm 等外部环境。（文章内容基于作者个人技术实践与独立思考，旨在分享经验，仅代表个人观点。）

前言

两个月前写完《多模态检索 TBStars_VL_Emb 指令遵循微调》文章之后，结尾留了一句话：

> 可构建完整的 "请求 → 召回 → 曝光/点击/成交 → 样本反馈 → 模型训练 → 线上服务 → 请求" 优化迭代闭环。

当时只是有个朦胧的想法 —— "如果训练这一环也能自动化，整个闭环就能转起来"。但真正落地谁来推动？怎么落地？没想清楚。

Karpathy 把 `AutoResearch` 这个名字带火（他的思路是：让 Agent 按照一份 SKILL 文件驱动的实验清单，自主完成从假设到验证的循环），紧接着又陆续读到主搜团队的 `TAO-AutoResearch` 和拍立淘团队的 `Pailitao-AutoResearch`，发现 "Agent 接管训练优化迭代" 这件事已经被这两份工作在工业级跑通了——当时留的那句话，已经有人替我做完了一半。

但这两份工作都和它们所在的业务、训练平台耦合比较深。对于 1688 这边在星云平台上训 LLM 的同学，还需要一套接地气的版本：

  * 底层换成团队里大量在用的 TuningFactory —— 它是内部对开源 LLaMA-Factory 的 Fork，把 ODPS 数据源、内部存储、多队列适配等都做了封装

  * 训练平台换成星云（内部通用训练平台，支持多种 GPU 队列），全 API 拉日志，不用开浏览器

  * 把过去几个月在数据接入 / 镜像 / 分布式训练上踩过的坑全部沉淀进 SKILL.md

本文 `AutoResearch-LLM`：

  * 章节 1 讲来由和定位

  * 章节 2 是流水线设计

  * 章节 3 是工程实现

  * 章节 4 是踩坑实录

  * 章节 5 是和已有工作的横向对比

读者可自行查阅感兴趣的章节。给外部读者一个阅读建议：

  * 只想看"Agent 怎么把 LLM 调参这件事跑起来"：直接看 §2 流水线设计

  * 关心 LLM 微调工程化的踩坑：直接看 §4 踩坑实录（PyTorch 2.6 vs DeepSpeed、Qwen3 thinking mode 拉低 BLEU 是通用问题，与平台无关）

  * 想在自己环境（K8s / Slurm / PAI / 云商方案）复用这套框架：§3 工程实现要点里的思路是可搬的，把星云 API 换成你们平台的 API 即可

1\. 背景

**1.1 缘起**

两个月前那篇 TBStars 文章里画了一张闭环图：

  *   *   *   * 

    
    
    请求 → 召回 → 曝光/点击/成交 → 样本反馈 → 模型训练 → 线上服务 → 请求                                              ▲                                              │                                       这一环最难自动化

数据回流、特征生成、上线发布这几环 1688 都有相对成熟的工程基建。但模型训练这一环始终是手工活：算法同学盯着 eval_loss、改 LR、重提任务、看日志、再改 LR，一天下来真正的 "研究时间" 很少。

CV 分类领域我之前做过一版 `auto_research_cv_cls_demo`（下文简称 "前作 CV demo"），在 CIFAR-10 上跑通了 "Agent 按 SKILL 跑实验" 的小闭环，最终拿到 +1.22% 的提升。

不过 CV 分类还是太简单：单文件训练入口、本地数据集、单机训练。要把这套思路搬到 1688 的 LLM 微调场景，要解决的事情多得多：

维度| CV demo| LLM 实战  
---|---|---  
训练框架| 手写 `main.py`| TuningFactory（LLaMA-Factory 的内部 Fork）
数据| CIFAR-10 本地 tar| ODPS 表（百万行起步；ODPS 即 MaxCompute，阿里云的大数据仓）
模型| ResNet18~50| Qwen3-1.7B ~ 35B-A3B（含 MoE）

并行| 单卡| DeepSpeed ZeRO-2/3 + Megatron Turbo

训练时长| 30~60 分钟| 1~24 小时

评估| acc 直接打出来| 还要再起一轮 generate + BLEU/ROUGE

平台| 星云| 星云  
  
**1.2 参考的两份工作**

写这个项目之前认真读了两份公司内部同学做过的 AutoResearch 落地：主搜团队的 `TAO-AutoResearch` 和拍立淘团队的 `Pailitao-AutoResearch`。这两份工作都是各自业务线上把 Agent 接进召回/排序模型训练迭代闭环的完整实践，思路很接近：

  * TAO-AutoResearch：4 个专职子 Agent（分析 / 训练 / 评测 / 压测）+ Git Worktree 实验隔离 + 三平台可插拔后端，跑了 20 轮迭代，hitrate@20 +3.05%；功能最完整，工程化程度也最高

  * Pailitao-AutoResearch：三阶段流水线（理解分析 / 改进方案 / 实验验证）+ Git 分支隔离，附带一个最小可跑的 demo 仓库；门槛低，适合作为新人理解 AutoResearch 思想的入口

`auto_research_llm` 的演化路径是这样的：先从 Pailitao demo 学到三阶段骨架 → 在 CIFAR-10 上做了一版前作 CV demo（CV 分类验证可行）→ 这次再把同一套三阶段、单 Skill、易上手的结构搬到 LLM 微调上，针对 1688 场景做了几处升级：

升级点| 前作 CV demo| auto_research_

---
## 深度分析

### 三阶段流水线：Agent 如何接管训练迭代

框架沿用三阶段骨架，关键设计是每阶段都有文件产出物（`analysis_report.md` / `improve_guide.md` / `experiment_results.csv`），Agent 在长上下文里可凭文件"接力"，换会话也能恢复状态。第一阶段"不上来就调参，先做体检"：七维诊断（基座、数据质量、规模、Prompt、训练方式、Eval 配置、baseline 复盘）并给出量化信号，如错标 >10% 先清洗、生成类 <5K 样本先蒸馏扩数据。第二阶段写成 6 级优先级参数清单（LR/LoRA → batch → 训练策略 → 数据 → 分布式 → 评估），TAO 的 46 项知识库精简到 15+ 项。第三阶段每个实验走"生成 config → push 实验分支 → submit → 监控 → 评估 → 入 csv"闭环，实验以 `experiment-{编号}-{场景}-{方式}-{变量}` 命名、submodule 分支隔离。

### 评估方法论：自动产出与一个典型陷阱

核心改造是把评估内嵌进训练器：`--predict_with_generate=True` 让训练日志直接输出 BLEU-4/ROUGE-L，省掉独立的推理与算分轮；指标提取全自动——Agent 走 HTTP API 拉日志、正则提取指标追加进 csv，监控配合 `/loop` 定时唤醒，全程不开浏览器。最有教学价值的是 Qwen3 thinking mode 陷阱：`eval_loss = 0.004` 与 `predict_bleu-4 = 1.82` 并存——训练时模板让模型学"先输出空 think 再给答案"，推理时 `enable_thinking` 默认开启，generate 先吐思考内容污染 BLEU；关闭后 BLEU 跳到 46.32。这说明 loss 与生成类指标可能严重背离，自动化流水线必须内置任务级指标的 sanity check。作者对证据边界也诚实：候选库"业内经验区间"标注为报道值而非实测，目前只在 Query 改写 SFT LoRA 一条路径充分实验过。

### 方法论亮点与局限

两个可复用方法论：一是"平台问题外挂平台 skill，业务问题留在项目 skill"——平台级错误交给星云官方 `nebula-support` skill 诊断，项目 SKILL.md 只维护 DeepSpeed ckpt、thinking mode、oss_endpoint 等业务专属 Debug 表，分层在任何有官方 skill 的平台都成立；二是显式锁定不可调变量——基座在第一阶段锁定后，`MODEL_NAME` 不再可调，Agent 遇到饱和信号只能开"需要决策"节提示用户拍板，与 TAO 的 LOCKED 参数思路一致。局限方面作者坦承：实验循环按预设优先级线性推进、不按中间结果剪枝；跨场景知识不流通（`lessons.jsonl` 未定 schema）；在线 KD 未验证、RL 未统一进 `submit.sh`；业务指标 F1/NDCG 离线评估只有骨架；整体仍是单 Agent + 单 Skill，不及 TAO 四子 Agent 架构。

## 实践启示

1. **先体检后调参**：跑 baseline 前按七维诊断过一遍，改 Prompt 模板通常 +5~10%，比盲目扫 LR 便宜。
2. **给 Agent 划权限边界**：把基座模型等变量显式声明为 LOCKED，Agent 遇饱和信号只能提示用户拍板——防止自动化循环跑偏的最便宜护栏。
3. **Debug 知识按平台/业务分层**：平台级报错交给平台官方 skill，业务专属坑写入项目 SKILL.md Debug 表。
4. **评估随训练自动产出并警惕指标背离**：用 `predict_with_generate` 省掉独立推理轮；loss 低不代表任务指标好，要有生成指标 sanity check。
5. **实验隔离用 Git、记录用机器可读格式**：每实验一个分支，明细写 csv（实验级）、总结写 final_report.md（研究级），粒度分开 Agent 才能接力。
6. **重复易错的交给 Agent，判断留给人**：写配置、提交、监控、抓日志、算指标可让渡；数据清洗、Prompt 设计、何时换基座仍需人工判断。延伸：[1688 场景细节](https://github.com/QianJinGuo/wiki-public/blob/main/entities/autoresearch-llm-agent-llm-training-optimization-1688.md)、[循环工程](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/loop-engineering-methodology.md)、[模型蒸馏](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/model-distillation-compression.md)、[评估设计](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/evaluation-harness-design.md)。

## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- 相关: Agent 架构

---

