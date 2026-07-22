---
source: wechat
source_url: https://mp.weixin.qq.com/s/9qEgOV9FGk6u9_9zMLSI6A
ingested: 2026-07-06
feed_name: 阿里云开发者
wechat_mp_fakeid: MP_WXS_3239545440
source_published: 2026-07-06
sha256: "a728fefc8a57d87f5d0e9999696d2e6e3e1746277bd59b1990cf67a5c02bc834"
---


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

升级点| 前作 CV demo| auto_research_llm  
---|---|---  
任务领域| CV 分类（CIFAR-10）| LLM 微调（1688 电商三类任务：Query 改写、同款判定、重排打分）  
训练框架| 单文件`main.py`（PyTorch）| TuningFactory（submodule 引入）+ ROLL（阿里开源的 RL 训练框架）  
数据源| 本地 tar 数据集| ODPS 三件套 + OSS JSON 备选  
训练方式| 单一训练循环| SFT 全参 / SFT LoRA / SFT LoRA MoE / DPO LoRA + 离线数据蒸馏（DashScope 生成 + SFT，已验证）+ 在线 KD（`--stage distill`，配置就绪未验证）+ RL/GRPO（接入了 ROLL，未验证）  
并行| 单卡| DeepSpeed ZeRO-2/3 / Megatron Turbo + EP（MoE）  
平台对接| 星云 API 拉日志| 同样 API 化，新增 ODPS / MOS（内部对象存储，用于超大模型 ckpt）/ 多队列 endpoint 适配  
评估| acc 直接打出来| Trainer 内置 `predict_with_generate` 自动出 BLEU/ROUGE  
调参清单| CV 14 项| LLM 调参清单按 6 级优先级分层（LR/LoRA → batch → 训练策略 → 数据 → 分布式 → 评估），外挂三类业务指标（BLEU / F1 / NDCG）  
  
所以四者的相对位置大致是：

  *   *   * 

    
    
    入门 ─────────────────── 进阶 ─────────────────── 更完整Pailitao demo  →  前作 CV demo  →  auto_research_llm  →  TAO-AutoResearch（最简骨架）       （CV 验证可行）    （1688 LLM 接地气版）     （多 Agent + 多平台）

第一次接触 AutoResearch 思想，可以先看 Pailitao 的 demo 或前作 CV demo 跑一遍流程；刚好在 1688 用 TuningFactory 训 LLM，可以直接用本项目；如果你的研究规模更大（需要多平台调度、多 Agent 协作、长周期连续优化），那 TAO 是最合适的参考。

**1.3 目前做到什么程度**

维度| 能力  
---|---  
训练方式| 已端到端验证：SFT 全参 / SFT LoRA / SFT LoRA MoE / DPO LoRA / 离线数据蒸馏（大模型生成 → SFT）；配置就绪未验证：在线 KD（TuningFactory `--stage distill`）/ RL（GRPO，基于 ROLL）  
场景| 1688 电商 Query 改写 / 同款判定 / 重排打分  
基座| Qwen3 系列（1.7B / 8B / 32B）+ Qwen3.6-35B-A3B（MoE）  
数据| ODPS（主）+ OSS JSON（小数据备选）  
存储| OSS（<14B）/ MOS（≥14B）/ NAS（产物）  
分布式| DeepSpeed ZeRO-2/3 / Megatron Turbo + EP（MoE）  
评估| Trainer 内置 `predict_with_generate` 自动出 BLEU-4 / ROUGE-L  
  
**1.4 仓库结构**

  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   * 

    
    
     auto_research_llm/├── SKILL.md                        ← Agent 主入口（Pipeline / 参数 / Debug 全在这）├── submit.sh / kill.sh             ← 任务提交与终止├── user_info.json                  ← 个人凭证（已 gitignore）├── configs/                        ← 训练/推理配置（一文件一方式）│   ├── sft_lora.sh                 单卡 LoRA│   ├── sft_lora_multi.sh           多卡 LoRA + DeepSpeed│   ├── sft_full.sh                 全参 + DeepSpeed│   ├── sft_lora_moe.sh             MoE + Megatron Turbo│   ├── distill.sh                  KD Loss 蒸馏│   ├── dpo_lora.sh                 DPO│   ├── rl_roll.sh                  GRPO（基于 ROLL）│   ├── infer.sh                    单独推理（zero-shot baseline / 评估别人 ckpt）│   ├── ds_zero2.json / ds_zero3.json│   └── cluster.json / cluster_2gpu.json / cluster_multigpu.json├── scripts/│   ├── sync_to_tuning_factory.sh   submodule 实验分支自动 push│   ├── prepare_distill_data.py     蒸馏数据生成（走 DashScope，即阿里云百炼的大模型 API）│   └── convert_to_hf.sh            ckpt 转 HF 格式├── scenarios/│   ├── query_rewrite/{README,odps_ddl.sql,sample_data.json,eval_metrics.py}│   ├── same_product/...│   └── reranking/...├── TuningFactory/                  ← submodule（分支 openlm）├── experiment_logs/                ← 自动下载的训练完整日志└── experiment_results.csv          ← 实验记录入口（自动追加）

2\. 流水线设计

整体沿用 TAO / Pailitao 的三阶段写法，每个阶段都有明确的产出物，方便 Agent 在长上下文里 "接力" ：

  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   * 

    
    
    [用户输入] 研究目标 + 数据样例 + 预算    │    ▼[阶段 1] 场景理解与基线分析   ├─ 7 维诊断（基座 / 数据质量 / Prompt / 训练方式 / Eval / Baseline 复盘 ...）   ├─ 跑 baseline → 拿到 eval_loss & 任务指标   └─ 产出 analysis_report.md（同时锁定 MODEL_NAME）    │    ▼[阶段 2] 实验方案设计   ├─ 从技术候选库（15+ 技术点）匹配候选   ├─ 按一级/二级/三级/四级/五级/六级参数清单展开   └─ 产出 improve_guide.md    │    ▼[阶段 3] 自动化实验验证   ├─ 单变量探索 → 正交组合 → 数据维度兜底   ├─ 每个实验：生成 config → push 实验分支 → submit → 监控 → 评估 → 入 csv   └─ 产出 experiment_results.csv（实验级） + final_report.md（研究级）

**2.1 第一阶段：场景理解与基线分析**

不上来就调参，先做体检。Agent 会按七个维度把当前任务过一遍，前六维在 baseline 跑之前完成，第七维是 baseline 跑完之后的复盘：

#| 维度| 何时检查| 诊断问题| 薄弱信号  
---|---|---|---|---  
1| 基座模型| baseline 前| 规模/能力是否匹配任务？| 简单分类用 72B → 浪费；长上下文任务用短窗口模型 → 切更大基座  
2| 数据质量| baseline 前| 随机抽 20~50 条人审，明显错标比例多少？| 错标 >10% → 先清洗再训  
3| 数据规模| baseline 前| 独立样本数对当前任务是否充分？| 生成 <5K / 分类 <1K → 先做离线蒸馏扩数据  
4| Prompt 模板| baseline 前| instruction 是否表达清楚任务边界、给出格式约束？| 输出格式混乱 / 答非所问 → 改 instruction 通常 +5~10%  
5| 训练方式选型| baseline 前| 现有数据形态匹配 SFT / 蒸馏 / DPO / RL 哪一种？| 只有 (q, a) → SFT；有 teacher → 蒸馏；有偏好对 → DPO；有可编程 reward → RL  
6| Eval 配置| baseline 前| eval 集、eval_steps、任务指标 parse 都配好了吗？| 漏配 eval → 无法选最优 ckpt；漏 predict_with_generate → 没有 BLEU/ROUGE  
7| Baseline 复盘| baseline 后| LR 是否合理？是否过拟合？LoRA rank 是否到位？| eval_loss 震荡 → LR 偏大；train_loss→0 但 eval 不降 → 过拟合；rank=8 不再下降 → 升 rank 或换全参  
  
注意：基座模型在本阶段就要锁定。后续整个实验序列里，`MODEL_NAME` 不再是一个可调变量。Agent 不允许擅自换基座；如果出现 "LoRA 全跑过仍饱和" 等信号，会专门起一节 "需要决策" 提示用户，由用户拍板。

这块和 TAO 的 LOCKED 参数思路是一致的：把 "不该让 Agent 动" 的东西显式标出来，避免 Agent 越界探索。

**2.2 第二阶段：实验方案设计**

把 "我能做什么" 写成清单，把 "应该先做什么" 写成优先级。这里只贴一级参数，二到六级详见 SKILL.md：

> 一级（直接影响效果）

参数| 取值范围| 备注  
---|---|---  
`learning_rate`| LoRA: 1e-4 ~ 5e-4；全参: 5e-6 ~ 5e-5；DPO: 5e-7 ~ 5e-6| 最敏感  
`lora_rank` / `lora_alpha`| 8/16/32/64/128（alpha=2×rank）| 表达力  
`lora_target`| `q_proj,k_proj,v_proj,o_proj` / `all-linear`| all-linear 参数 ×3  
`num_train_epochs`| SFT 2 ~ 5 / DPO 1 ~ 3 / 蒸馏 1 ~ 3| 真实训练用这个  
Prompt 模板| instruction 文本改写| 通常 +5~10%  
`cutoff_len`| 1024 / 2048 / 4096 / 8192| 序列长度，吃显存  
  
技术候选库（参考 TAO 的 46 项知识库，针对 LLM 微调精简到 15+）。需要说明的是，下表「业内经验区间」一列是业内常见报道值，不是本项目实测；本项目目前仅在 Query 改写 SFT LoRA 这一条路径上做过比较充分的实验，其它路径的数字仅供方向参考：

类别| 技术| 适用条件| 业内经验区间  
---|---|---|---  
SFT| LoRA rank 8/32/64| 由低到高试| +1~5%  
SFT| LoRA target=all-linear| QKV 不够| +1~3%  
SFT| 全参| LoRA 到天花板| +2~5%  
蒸馏| 大模型 hard label + SFT| 数据不足| 视场景，常显著  
蒸馏| 在线 KD Loss| 有 teacher| 待验证（配置就绪）  
RL| GRPO| 有可编程 reward| 待验证（已接入 ROLL）  
数据| Prompt 模板优化| 输出乱| +2~10%  
数据| 清洗/筛选| 标注差| +3~8%  
  
**2.3 第三阶段：自动化实验验证**

2.3.1 实验分支管理

每个实验对应 TuningFactory 的一个分支，命名 `experiment-{编号}-{场景}-{方式}-{变量}`，例如 `experiment-03-qr-sft-lora32-prompt-v2`。

`scripts/sync_to_tuning_factory.sh` 自动做三件事：

  1. 在 submodule 里基于 `openlm` 拉一个新分支

  2. 把 `configs/*` 复制到 `TuningFactory/scripts/`

  3. commit + push 到远端

实验隔离基于 submodule worktree 多分支，多个实验互不干扰，可并行可串行。

2.3.2 任务提交与监控

提交一行：

  *   * 

    
    
    bash submit.sh experiment-03-qr-sft-lora32-prompt-v2# 输出 task_id（32 位 hex）

监控全走星云的 HTTP API，不用打开浏览器（下面 `<meta-api>` / `<log-download-api>` 是内部平台的域名占位符；这套调用结构本身跟平台无关，用 K8s / Slurm / PAI 的读者可以对照替换成自己平台的元信息 & 日志接口）：

  *   *   *   *   *   *   *   *   *   * 

    
    
    # 状态 + application_id + job_namecurl -s "https://<meta-api>/nebula/meta?task_id=${TASK_ID}"  
    # 实时 stdout / stderrcurl -s "https://<meta-api>/nebula/log?task_id=${TASK_ID}&rank=0&stream=stdout&bufferSize=102400"curl -s "https://<meta-api>/nebula/log?task_id=${TASK_ID}&rank=0&stream=stderr&bufferSize=102400"  
    # 训练完成后下载完整日志 zipAPP_ID=$(curl -s "https://<meta-api>/nebula/meta?task_id=${TASK_ID}" | python3 -c "import sys,json;print(json.load(sys.stdin)['data']['application']['application_id'])")curl -L -o experiment_logs/${EXP}.zip "https://<log-download-api>/logview/logs/download/${APP_ID}"

不用 Agent 手搓 while 循环，直接用 Agent 自带的 `/loop` 能力做循环验证——例如 `/loop 15m 检查 task_id ${TASK_ID} 状态，完成后提取 BLEU/ROUGE 写入 csv`，到点自动唤起、自动收尾，省心也省 token。

2.3.3 自动指标提取

训练完之后 Agent 自动从日志里正则提取 `eval_loss` / `predict_bleu-4` / `predict_rouge-l`，写入 `experiment_results.csv`：

  *   *   *   *   *   *   *   *   *   * 

    
    
    curl -s "https://<meta-api>/nebula/log?task_id=${TASK_ID}&rank=0&stream=stdout&bufferSize=204800" | python3 -c "import sys,json,red=json.load(sys.stdin)for log in d.get('logs',[ ]):    if log['role']=='worker':        c=log['result']['data']['content']        for m in re.finditer(r'predict_(\w+)\s+=\s+([\d.]+)', c):            print(f'  {m.group(1)}: {m.group(2)}')        break"

补充说明阶段三的产出物粒度（沿用前作 CV demo 的规约）：

  * `experiment_results.csv`：每个实验追加一行，列包括方案编号 / 场景 / 训练方式 / 基座模型 / 核心变量 / eval_loss / 任务指标 / 运行状态 / 任务ID / 备注

  * `final_report.md`：每轮研究跑完后由 Agent 汇总一次，对比各方案的相对增益、给出下一轮建议或终止结论

也就是说，csv 是实验级的明细，final_report.md 是研究级的总结，两者粒度不同。

3\. 工程实现要点

**3.1 数据接入**

1688 业务侧的样本/日志大多沉淀在 ODPS（MaxCompute，阿里云的大数据仓）表里，所以训练数据源默认对接 ODPS。Alpaca 三字段 schema：

  *   *   *   *   * 

    
    
    CREATE TABLE auto_research_llm_query_rewrite (    instruction STRING,    input STRING,    output STRING) PARTITIONED BY (ds STRING) LIFECYCLE 90;

TuningFactory 的字段映射通过三个参数告诉框架：

  *   *   * 

    
    
    --prompt=instruction      # 哪个字段作为 prompt--query=input             # 哪个字段作为 query--response=output         # 哪个字段作为 label（SFT 必填）

提交到星云时，ODPS 三件套缺一不可：

  *   *   * 

    
    
    --tables=${INPUT},${EVAL_INPUT}--odps_project=${ODPS_PROJECT}--access_id=...  --access_key=...

**3.2 训练配置脚本**

配置| 适用  
---|---  
`configs/sft_lora.sh`| 单卡 LoRA，最快  
`configs/sft_lora_multi.sh`| 多卡 LoRA + DeepSpeed ZeRO-2  
`configs/sft_full.sh`| 全参 + DeepSpeed  
`configs/sft_lora_moe.sh`| Qwen3.6-35B-A3B 等 MoE，Megatron Turbo + EP  
`configs/distill.sh`| KD Loss 蒸馏  
`configs/dpo_lora.sh`| DPO  
`configs/rl_roll.sh`| GRPO（需单独 clone ROLL）  
`configs/infer.sh`| 单独推理（zero-shot baseline / 评估别人 ckpt）  
  
每个脚本头部都有一段统一格式的 "输入区"，要起新实验，复制一份改这块就够。以 `sft_lora_multi.sh` 为例：

  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   * 

    
    
    # === 模型配置 ===MODEL_NAME="Qwen/Qwen3-8B"PROMPT_TEMPLATE="qwen3"  
    # === 任务配置 ===SCENARIO="query_rewrite"EXP_NAME="lora16_ds_2gpu"JOB_NAME="auto_research_${SCENARIO}_${EXP_NAME}"  
    # === 数据源 ===ODPS_PROJECT="<your_project>"INPUT="odps://${ODPS_PROJECT}/tables/auto_research_llm_${SCENARIO}/ds=20260624"EVAL_INPUT="odps://${ODPS_PROJECT}/tables/auto_research_llm_${SCENARIO}/ds=20260624"  
    # === 训练超参 ===LR=2e-4

脚本下半部分是固定模板（拼出给 TuningFactory 的训练参数 + 给星云 `nebulactl`（即星云 CLI）的提交参数），起新实验只需要改顶部这十几行变量。

`configs/*.sh` 本身不是在本地执行的，它的完整生命周期是：

  *   *   *   *   *   *   * 

    
    
    configs/sft_lora_multi.sh                                    ← 主仓里改这一份       ↓ scripts/sync_to_tuning_factory.sh 拷贝TuningFactory/scripts/sft_lora_multi.sh （实验分支副本）        ← submodule 上 push 到远端       ↓ submit.sh 把 "分支名 + 脚本路径" 告诉 llm_cli星云容器拉 git 仓库 → 执行 bash scripts/sft_lora_multi.sh    ← 真正运行在训练节点       ↓ 脚本里调 nebulactl run mdl --user_params=...任务被调度到训练队列

所以 `configs/*.sh` 同时承担三个角色：本地是研究员动手改的那一份、submodule 实验分支里是被同步过去的提交入口、远端容器里是真正被执行的训练启动脚本。改一处就够，剩下都是脚本自动同步。

**3.3 自动评估**

最初的流程是训练完手动起一个推理任务，跑 generate → 写脚本算 BLEU。后来发现 TuningFactory 的 Trainer 自带 `--predict_with_generate=True`，训完直接打 BLEU/ROUGE：

  * 

    
    
    --do_predict --predict_with_generate=True --enable_thinking=False

加了这三行，训练完日志里就有：

  *   *   *   *   *   *   * 

    
    
    ***** predict metrics *****  predict_bleu-4              =    46.3219  predict_rouge-1             =    70.2381  predict_rouge-2             =    37.7778  predict_rouge-l             =    63.5714  predict_runtime             =    0:00:17.71  predict_samples_per_second  =      0.282

省掉一整轮推理脚本。`--enable_thinking=False` 是关 Qwen3 thinking mode 的开关，原因详见 4.2。

**3.4 effective_batch 经验**

eff_batch 公式：

  * 

    
    
    eff_batch = world_size × per_device_train_batch_size × gradient_accumulation_steps

任务| 推荐 eff_batch  
---|---  
SFT 7B| 64~128  
SFT 35B+| 32~64  
DPO/SimPO| 32~64  
蒸馏 KD| 64~256  
RL GRPO| 8~16 prompt × n rollouts  
  
调参顺序：先把 `per_device_train_batch_size` 调到显存极限 → 再用 `gradient_accumulation_steps` 凑 eff_batch → LR 按 √eff_batch 微调。

**3.5 平台问题：星云 skill 兜底**

这一节是本项目的一个方法论：平台级问题外挂给平台官方 skill，业务级问题留在项目 skill。放到任何有官方 skill 的训练平台上都成立，读者可以类比。

训练任务在星云上出错，绝大部分错误模式（OOM / NCCL / 镜像安装失败 / 队列额度 / OSS endpoint / pod 调度异常 ……）都在星云官方维护的 `nebula-support` skill 里覆盖了。本项目 SKILL.md 显式声明依赖它（`a1` 是内部 skill 包管理器，功能类似 `pip`）：

  * 

    
    
    a1 skill install nebula-support --agent claude --global

装上之后，Agent 遇到平台级报错会自动调起 `nebula-support` 来诊断、生成 `nebula-cli` 指令、检索官方文档；我们自己的 SKILL.md 只维护项目专属的 Debug 表（比如 4.1 的 DeepSpeed ckpt、4.2 的 Qwen3 thinking、4.3 的 oss_endpoint）。

平台问题交给平台 skill，业务问题留在项目 skill——下面第 4 章列的也都是这一层级的踩坑沉淀。

4\. 踩坑实录

这部分是流水线最重要的 "沉淀物"，对应过去几次的失败任务。

**4.1 PyTorch 2.6 +  **

**DeepSpeed ZeRO****  \+ load_best 撞在一起**

4.1.1 错误现象

stderr 关键栈：

  *   *   *   *   *   * 

    
    
    WeightsUnpickler error: Unsupported global: GLOBAL deepspeed.runtime.fp16.loss_scaler.LossScalerwas not an allowed global by default. Please use `torch.serialization.add_safe_globals(...)`or `torch.serialization.safe_globals` to allowlist this global if you trust this class/function.  
    Weights only load failed. Re-running `torch.load` with `weights_only=False` would likelysucceed, but it can result in arbitrary code execution.

4.1.2 根因

PyTorch 2.6 默认 `weights_only=True`，DeepSpeed 序列化的 `LossScaler` 对象不在白名单里，反序列化时直接拒绝。

更糟的是这个错有两个触发点：

  1. Trainer auto-resume：output_dir 里有上一次的 `checkpoint-N`，新一轮训练默认会 "接着练"，加载时炸；

  2. 训练结束 `_load_best_model()`：开了 `--load_best_model_at_end=True` 之后，结束时会再次反序列化 best ckpt 的优化器状态。

4.1.3 修复

必做| 禁用  
---|---  
`--overwrite_output_dir=True`| 不可用`--load_best_model_at_end=True`  
全参再加 `--save_only_model=True`| —  
  
需要 best ckpt 时，按 `trainer_state.json` 里的 `best_model_checkpoint` 字段手动定位：

  *   *   *   * 

    
    
    cat /data/oss_bucket_0/.../checkpoint-100/trainer_state.json | python3 -c "import sys, jsonprint(json.load(sys.stdin)['best_model_checkpoint'])"

**4.2 predict BLEU 异常低（ <5）**

4.2.1 错误现象

训练完打开日志：

  *   *   *   * 

    
    
    ***** predict metrics *****  predict_bleu-4              =     1.8214  predict_rouge-l             =     5.1218  eval_loss                   =     0.0042   ← 这俩居然能并存

eval_loss 明明只有 0.004，BLEU 怎么这么差？把 `generated_predictions.jsonl` 拉出来看了一眼：

  *   *   *   * 

    
    
    {  "label": "男士夏季透气运动鞋",  "predict": "<think>\n用户输入是「夏天透气男鞋」，需要规范化为更标准的电商搜索词。考虑同义词替换......\n</think>\n\n男士夏季透气运动鞋"}

4.2.2 根因

Qwen3 默认开了 thinking mode，generate 时会先吐一大段 `<think>...</think>` 再给答案。BLEU 拿这段思考内容跟 reference 算，分数当然惨。

训练时为什么不会出问题？因为 TuningFactory 的 `qwen3` 模板（`ReasoningTemplate`）会在训练阶段自动给 label 包一层 `<think>\n\n</think>\n\n{output}`，loss 是基于这个完整序列算的——也就是说训练时模型学的是 "先输出空 think 再输出答案"。但推理时 `enable_thinking` 默认 True，模型就把空 think 填满了。

4.2.3 修复

所有 `configs/*.sh` 默认带上 `--enable_thinking=False`。实测：关闭前 `predict_bleu-4 = 1.82`，关闭后 `predict_bleu-4 = 46.32`，`predict_rouge-l = 63.57`。`SKILL.md` 的 Debug 表也补了一行：

  * 

    
    
    | predict BLEU 异常低（<5） | predict 输出含 <think> 标签 | Qwen3 thinking mode 未关。加 --enable_thinking=False |

**4.3 oss_endpoint 格式因队列而异**

这一节的具体队列/endpoint 是我们内部环境的例子，读者关注结论即可：同一 region 的 OSS，在不同 GPU 队列（不同 IDC 线路）下白名单规则可能不同，切换队列时要顺手确认 endpoint 写法。

队列| 正确格式  
---|---  
MI308X| `cn-hangzhou.oss.aliyuncs.com`  
H20 / H200| `oss-cn-hangzhou-internal.aliyuncs.com`  
  
MI308X 上写 `oss-cn-*` 直接被白名单卡掉，报 "域名白名单/域名不能是oss-cn-"。切换队列时同步修改 endpoint。

5\. 同期工作横向对比

把同期看到的几个项目放在一张表里，按入门门槛由低到高排列，方便选型：

项目| 入门门槛| 适用领域| 训练框架| 平台| 并行隔离  
---|---|---|---|---|---  
karpathy/autoresearch| 最低| 单文件 train.py 实验| 任意| 本地 GPU| —  
Pailitao-AutoResearch|  低| 多模态排序 / 通用 demo| 自研| 星云| Git 分支  
前作 CV demo|  低| CV 分类| PyTorch| 星云| Git Worktree  
auto_research_llm（本文）|  中| 1688 LLM 微调| TuningFactory + ROLL| 星云全队列| Submodule 分支 / Worktree  
TAO-AutoResearch|  高| 搜索召回/排序| 自研 + AOP（内部算法在线平台）| 多平台| Git Worktree（4 子 Agent）  
  
简单的选型建议：

  * 想 5 分钟内跑通一个 demo 理解概念：先看 Karpathy 原版或 Pailitao 的 demo

  * CV 分类调参：前作 CV demo

  * 1688 LLM 微调（SFT / DPO / 离线数据蒸馏已端到端验证；在线 KD / RL 已接入配置就绪，正在打通中）+ 星云平台：欢迎试用本项目

  * 多平台 / 多 Agent / 长周期生产环境：直接用 TAO-AutoResearch

6\. 还没做好的几块

写到这里，必须诚实承认还有几块工程没填上：

  * Agent 调参循环还不够智能：现在是按预设优先级跑（一级 → 二级 → 数据维度），没有根据中间结果剪枝。理想状态是类似 Hyperband / Successive Halving，或者借鉴 TAO 的 "压测子 Agent + 外部 LLM 独立审查" 机制

  * 跨场景知识不流通：Query 改写学到的 Prompt 优化经验，目前没办法自动迁移给同款判定。打算搞一个 `lessons.jsonl` 累计踩坑库（呼应 TAO 提到的 "团队共享调优知识资产"），但 schema 还没定

  * 在线蒸馏未端到端验证：TuningFactory 原生支持 `--stage distill`，`configs/distill.sh` 已经配好 student（Qwen3-8B）+ teacher（Qwen3-32B）+ forward KL 蒸馏目标，但还没真正提交任务跑通；teacher 在线推理的显存占用还需要实测

  * 离线蒸馏（logit caching）TuningFactory 不支持：希望 "teacher 离线 dump top-k logits → student 训练时直接读 cache" 这套省显存方案。代码侦察发现 TuningFactory 只对 teacher 文本再 tokenize，不读 logits 字段，整条 data pipeline / collator / trainer / hparams 校验都要改。短期可以先用前一种离线数据蒸馏（DashScope hard label 生成 → SFT）兜底

  * RL 流水线没接进 submit.sh：当前 RL 走的是 ROLL 框架，按官方文档单独 clone（不是 submodule），独立配置 + 独立提交入口，没和 SFT/蒸馏的 `submit.sh` 流程统一

  * 本地评估缺失：训完只有 BLEU/ROUGE，业务真正关心的同款判定 F1、重排 NDCG@10 还需要离线再跑一遍 parse + 算分。`scenarios/{}/eval_metrics.py` 只是骨架

  * MOS 实测较少：14B 以下都用 OSS，MOS 路径只在文档里走过，还没真正跑通过 35B 模型的端到端 ckpt 加载

  * 多 Agent 协作：当前还是单 Agent + Skill 的形式，没有像 TAO 那样拆出分析 / 训练 / 评测 / 压测四个子 Agent。下一版考虑改造

7\. 写在最后

回到开头那张 "请求 → 召回 → ... → 模型训练 → 线上服务" 的闭环图。

两个月前写下那句话的时候，我以为 "训练自动化" 是一个遥远的工程目标。现在回头看，主搜、拍立淘的同学已经把骨架搭起来了，前作 CV demo 在 CIFAR-10 上跑通过一次，本文的 LLM 实战版又把 1688 这边的细节填上。下一步是把 "模型训练" 这一环和 "样本反馈 / 线上服务" 接上——这部分还在 SKILL.md 的 TODO 列表里。

整个项目的初衷只是 "把自己干活的步骤写成脚本" ，做着做着发现 Agent 拉进来之后，重复但容易出错的部分（写配置、提交、监控、抓日志、算指标）确实可以让出来，自己专注于需要判断的部分（数据怎么洗、Prompt 怎么改、什么时候换基座）。

参考资料

[1] TAO-AutoResearch：Agent 接管模型训练优化全流程（内部技术分享） 

[2] Pailitao-AutoResearch Skill（内部技术分享） 

[3] auto_research_cv_cls_demo（前作 CV 版，内部仓库） 

[4] 多模态检索 TBStars_VL_Emb 指令遵循微调（内部技术分享） 

[5] 星云平台：离线训练 & 离线推理文档 

[6] TuningFactory（LLaMA-Factory 的内部 Fork） 

[7] ROLL 官方文档:

https://github.com/alibaba/ROLL  


[8] Karpathy autoresearch:

https://github.com/karpathy/autoresearch  


[9] LLaMA-Factory（TuningFactory 上游开源项目）:

https://github.com/hiyouga/LlamaFactory

千问云-为Agent而生，驱动AI生产力  
扫描下方二维码，直达千问云体验

点击阅读原文即可体验！
