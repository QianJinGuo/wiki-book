# AutoResearch-LLM：让 Agent 接手 LLM 训练优化

## Ch01.646 AutoResearch-LLM：让 Agent 接手 LLM 训练优化

> 📊 Level ⭐⭐ | 7.1KB | `entities/autoresearch-llm让-agent-接手-llm-训练优化.md`

# AutoResearch-LLM：让 Agent 接手 LLM 训练优化

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/autoresearch-llm让-agent-接手-llm-训练优化.md)

# AutoResearch-LLM：让 Agent 接手 LLM 训练优化

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

