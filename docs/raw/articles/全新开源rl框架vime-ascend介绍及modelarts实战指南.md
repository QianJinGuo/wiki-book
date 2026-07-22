---
source: wechat
source_url: https://mp.weixin.qq.com/s/wXXgAAtoocksNRDiiEgXvQ
ingested: 2026-07-05
feed_name: 华为云开发者联盟
wechat_mp_fakeid: MP_WXS_3937388145
source_published: 2026-06-26
sha256: 2ec9e0e2a8399e89d0ced2c9a41e403ade942c71d6d24357706607f0e76e6fbd
---


# 全新开源RL框架Vime-Ascend介绍及ModelArts实战指南

大模型RL后训练，正在从”能跑起来”走向稳定可训、高效可推、云端可及。vLLM社区推出的Vime，将slime的训练范式与vLLM的推理引擎整合为统一流水线；华为云ModelArts与昇腾计算在此基础上联合共建vime-ascend，让该流水线在昇腾NPU上同样实现可运行、可复现、可规模化部署。本文首先介绍Vime的核心架构与ascend分支的增强特性，随后以Qwen3-4B的GRPO训练为例，展示NPU上的实际验证效果，最后梳理基于ModelArts的完整实践流程。  
  


**Vime-Ascend介绍**

#  1.1 背景与定位

兼具实战口碑与开源基因的RL框架一直是稀缺品，而slime经GLM等验证，凭借开源轻量、简洁高效，成为其中代表。但它尚未原生支持vLLM后端，在NPU上也未能充分释放算力优势。vLLM则是社区最活跃的推理引擎，融合前沿技术与Ascend生态，迭代迅速。vime的当下使命正在于此：不重写RL框架，而是将slime的训练设计与vLLM的推理优势，接入同一条简洁、稳定、高效的流水线——让开发者不必在不同硬件、训练稳定性与推理性能之间做取舍，一条主航道即可兼得两者最优解。

# 1.2 架构亮点：训推解耦的三段式设计

vime沿用slime的核心架构思想，采用训推解耦的三段式架构，由三大模块协同驱动RL训练闭环：Training（Megatron-LM）：负责主训练流程，从DataBuffer读取数据后执行参数更新，训练完成后将权重同步至Rollout模块。Megatron-LM提供了业界最齐全的分布式训练优化——TP、PP、CP（序列并行/RingAttention）、EP、ETP以及灵活的重计算策略，让大规模Dense与MoE模型的训练效率有充分保障。Rollout（vLLM + vllm-router）：启动vLLM推理引擎并通过vllm-router路由生成请求，产出带reward/verifier信号的训练样本，存储至DataBuffer。vLLM社区活跃的迭代节奏与丰富的推理优化（PagedAttention、PrefixCaching、FP8、PD分离等）被直接继承。Data Buffer：桥梁模块，管理prompt初始化、自定义数据与rollout生成方法。它解耦了训练与推理两侧，使得两侧可以独立扩展与调度。

# 1.3 核心能力一览

## 1\. 高性能训练

  * 全并行策略支持：TP / PP / CP / SP / EP / ETP一应俱全，覆盖Dense与MoE模型的最优并行组合。
  * 动态批处理（DataPacking）：--use-dynamic-batch-size+--max-tokens-per-gpu智能打包长短不一的样本，严格保证per sample / per token loss计算正确性，显著提升GPU/NPU利用率。
  * 异步训练流水线：支持train_async与fully async rollout模式，训练与推理可交错执行，进一步压榨硬件吞吐。
  * 权重同步机制：训练完成后自动将Megatron权重同步至vLLM，无需手动转换checkpoint。

## 2\. 灵活的数据生成

  * 动态采样（DynamicSampling）：支持过采样 + 过滤策略（如check_reward_nonzero_std），确保每组样本的reward存在差异，提升数据多样性。
  * Partial Rollout：被过滤或提前中止的生成可缓存并在下一轮继续，避免计算浪费。
  * 多轮交互与工具调用：通过--custom-generate-function-path和--custom-rm-path可自由定义Agent场景下的多轮生成与奖励逻辑，支持精细的lossmask控制。
  * PD分离部署：通过--prefill-num-servers将Prefill与Decode拆分到不同节点，KV经NIXL跨节点传输，已验证可端到端运行。

## 3\. 广泛的算法和模型覆盖

  * 多RL算法：内置GRPO、GSPO、Reinforce++ / Reinforce++ Baseline、PPO等算法，一行参数切换。
  * 多模型支持：Qwen系列（Qwen3.6、Qwen3.5、Qwen3Next、Qwen3MoE、Qwen3、Qwen2.5）、DeepSeekV3系列（V3、V3.1、R1）、Llama3、GLM-4.5-Air等。

## 4\. 多硬件后端抽象

框架层对训练资源、Rollout资源与集群拓扑进行了统一抽象，使得同一套RL流水线可在不同硬件后端上复用。

# 1.4 Ascend接入vime：为用户带来的能力

将昇腾NPU接入vime，并不是简单地把训练脚本搬到另一套硬件上，而是让开发者在一套熟悉的RL框架里，直接获得NPU集群上的完整训推能力：

  * 同一套流水线，跨GPU/NPU复用：Megatron训练、vLLM Rollout、GRPO等算法与参数体系不变，换硬件不必重写业务逻辑。
  * 训推一体与分离两种形态：8卡共卡（colocate）适合单节点显存复用，4训+4推分离适合吞吐优先，可按集群规模灵活选型。
  * 开箱可用的Ascend工具链：MindSpeed、Megatron-Bridge、vllm-ascend、CANN与HCCL权重同步已打通，bridge模式保障训推logprob对齐。
  * 容器化与云上部署：提供Dockerfile.npu与ModelArts脚本，从镜像构建到Ray作业提交可端到端复现。


  * 社区验证可对照：Qwen3-4B/30B/32B在A2/A3上的GRPO、共卡长跑、MoE routing replay等均有Issue沉淀，降低试错成本。

在此基础上，vime将NPU适配代码集中维护在GitHub ascend分支，与main分支能力对齐、持续合入上游特性。仓库地址：https://github.com/vllm-project/vime/tree/ascendascend分支针对AtlasA2/A3（aarch64）做了系统化适配，主要特点包括：

  * 训练后端：Megatron-LM + MindSpeed + Megatron-Bridge，支持TP/PP/CP/EP等并行策略与动态批处理。


  * 推理后端：vLLM + vllm-ascend，通过HCCLnative路径完成Megatron到vLLM的权重同步。
  * 权重转换：默认推荐--megatron-to-hf-mode bridge，经Megatron-Bridge导出为vLLM可直接消费的HFlayout，保障训推logprob对齐。
  * 共卡（colocate）模式：8卡训推一体，训练侧通过TMS（torch_memory_saver）与vLLM CaMem sleep/wake协同切换显存，配合NPU IPC direct权重写入，已在A2上完成500步长跑验证。
  * 容器与补丁：提供docker/Dockerfile.npu及docker/npu_patch/，一键构建含CANN 9.0.0、vLLM Ascend、MindSpeed的完整运行环境。


  * Ray调度：通过

RAY_EXPERIMENTAL_NOSET_ASCEND_RT_VISIBLE_DEVICES等环境变量，支持Ray在NPU集群上正确调度训推资源。NPU侧文档与脚本参考：docs/en/get_started/NPU.md、scripts/models/qwen3-4B_npu.sh。

# 1.5 NPU适配与已验证案例

ascend分支已在多组模型与场景完成验证，下表汇总社区Issue（含Qwen3-4B及更大规模模型）；完整实验配置见第2.1节，1.6、1.7节给出Qwen3-4B在A2上训推分离与共卡的验证数据。场景| 硬件| 说明| Issue  
---|---|---|---  
Qwen3-4B on NPU| A2| 训推分离GRPO入门与脚本| #157  
Qwen3-32B on NPU| A3| 大模型NPU训练| #165  
Qwen3-30B on NPU| A3| 30B Dense模型训练| #205  
Qwen3-4B GRPO| A3| A3环境GRPO完整流程| #210  
Qwen3-4B Colocate| A2| 8卡共卡训推一体| #255  
Qwen3-30B + routing replay| A3| MoE路由回放训练| #270  
  
# 1.6 训推分离模式验证（A2）

测试条件配置| 说明  
---|---  
硬件| ModelArts A2（Ascend 910B400T），4训 + 4推（训推分离）  
模型| Qwen3-4B  
算法/数据| GRPO，dapo-math-17k  
参数| global-batch-size 256，n-samples-per-prompt 8，rollout max response len 2048  
测试结果

  * train_rollout_logprob_abs_diff全程在0.010–0.015窄幅波动（均值约0.012），训推logprob对齐稳定
  * raw_reward从早期约-1.0逐步抬升，truncated比例下降，reward呈明显上升趋势
  * 训推一致性与学习信号均表现良好

框架| 平均每步耗时| 相对速度  
---|---|---  
vime| 314 s| 2.18x  
baseline| ~1000 s| 1x  
同配置下vime端到端训练速度约为baseline的2.18倍，单步耗时全程稳定。

# 1.7 共卡模式验证（A2）

共卡模式下，8张NPU同时承担Megatron训练与vLLM rollout，通过TMSpause/resume与vLLMsleep/wake在训推阶段切换显存占用，权重经bridge导出后由NPU IPC direct路径写入vLLM。该路径已在ascend分支完成Docker合并（PR[#266](<javascript:;>)），并在A2上完成500步长跑验证。测试条件项| 内容  
---|---  
硬件| Ascend 910B1 × 8，colocate训推一体  
模型| Qwen3-4B（HF checkpoint直接加载）  
算法/数据| GRPO，gsm8k（train.parquet），rm-type math  
并行| tensor-model-parallel-size 8，rollout-num-gpus-per-engine 8（单vLLM引擎）  
批大小| global-batch-size 64，rollout-batch-size 16，n-samples-per-prompt 4  
序列长度| rollout max response len 1024，vllm max model len 4096  
显存与模式| \--colocate，vllm-gpu-memory-utilization 0.6，vllm enable sleep mode  
权重同步| \--megatron-to-hf-mode bridge，\--vllm-weight-sync-mode native  
训练步数| 500 rollout（长跑）  
关联Issue| #255  
测试结果

  * train_rollout_logprob_abs_diff：step0约0.012，500步均值约0.008，全程在0.006–0.0125区间波动并收敛至约0.007
  * step 100时diff约0.0075，训推logprob长期对齐稳定
  * 500步长跑全程无OOM、无训练中断，共卡训推切换与权重同步链路稳定
  * reward与entropy等训练指标随步数正常演化，学习信号有效

上述A2验证效果，与vime在NPU上的架构设计密切相关，主要体现在以下几方面。

# 1.8 NPU适配的架构优势

vime在NPU上能够快速落地并展现加速优势，得益于架构层面的几个关键设计：

  * 训推解耦降低适配复杂度：训练侧（Megatron）与推理侧（vLLM）可分别适配NPU，互不阻塞。vLLM在Ascend上的持续演进直接惠及vime的Rollout模块，Megatron在NPU上的适配也可独立推进。
  * vLLM多硬件生态的乘数效应：vLLM社区在Ascend上的投入使推理引擎的NPU支持日趋成熟。vime接入vLLM Ascend后端即可获得高性能推理能力，无需从零构建NPU推理栈。
  * 统一抽象，一套代码跨平台：框架层对资源的统一抽象使同一份RL流水线代码在GPU与NPU之间可复用。NPU侧代码维护在ascend分支，保持主干简洁。
  * Router模式天然适配多卡调度：vllm-router的loadbalancing能力在NPU多卡场景下同样适用，通过--router-policy可灵活选择调度策略。

# 1.9 快速上手

vime提供了开箱即用的Docker镜像与脚本，可在一小时内完成从环境搭建到训练启动。NPU环境请参考ascend分支、第2.1节实验配置与Issue中的脚本；推荐镜像：

  *   *   * 

    
    
    export IMAGE=quay.io/ascend/vime:vime-a2-latest   # A2# export IMAGE=quay.io/ascend/vime:vime-latest   # A3docker pull "${IMAGE}"

源码构建：

  *   *   * 

    
    
    git clone -b ascend https://github.com/vllm-project/vime.gitcd vimedocker build -f docker/Dockerfile.npu -t vime-ascend:a2 .

核心参数分三类，配置清晰直观：

  1. Megatron参数：直接透传，如--tensor-model-parallel-size 2
  2. vLLM参数：--vllm-前缀，如--vllm-gpu-memory-utilization 0.7
  3. 框架参数：如--rollout-batch-size 16、--advantage-estimator grpo

以Qwen3-4B + GRPO为例：

  *   * 

    
    
    bash scripts/run-qwen3-4B.sh          # GPU参考bash scripts/models/qwen3-4B_npu.sh   # NPU（A2/A3）

# 1.10 NPU演进方向

vime NPU适配已在A2/A3上形成可复现的训练范式，当前能力包括：

  * Qwen3 Dense模型在A2、A3上的GRPO端到端训练
  * 训推分离与共卡两种部署模式的稳定运行
  * bridge权重转换 + HCCL native同步下的训推logprob对齐保障
  * Qwen3-30B/32B等大模型及routing replay等进阶场景

后续计划推进的方向：

  * A5（950）适配：下一代Ascend硬件的完整支持
  * Transfer Queue适配：替换DataBuffer模块
  * MoE模型在NPU上的持续验证：Qwen3-30B-A3B等MoE模型的routing replay（R3）支持
  * PD分离在NPU上的实现：跨节点KV传输的Ascend适配
  * 性能持续优化：权重同步、Router负载均衡、动态批处理等方面的NPU特定调优

  
  


**ModelArts实践**

第1章从框架能力与NPU集群验证出发，本章说明如何将同一套Qwen3-4BGRPO配置落地到ModelArts：从自定义镜像构建、模型数据准备，到训练作业创建与产物查看，形成可复现的云上训练闭环。

# 2.1 实践示例：以Qwen3-4B的RL训练为例

下文以ModelArts操作与NPU验证为主线，围绕Qwen3-4B的RL后训练展开。该模型规模适中、社区脚本完备，覆盖AscendA2/A3典型8卡集群，便于对照训推分离与共卡两种部署形态，是上手vime ascend的最小完整范例。模型与算法项| 说明  
---|---  
基座模型| Qwen3-4B，Dense结构，HF checkpoint可直接加载  
RL算法| GRPO（\--advantage-estimator grpo），组内相对优势估计，适合数学推理等可验证奖励场景  
训练后端| Megatron-LM + MindSpeed，支持TP/PP/CP及动态批处理  
推理后端| vLLM + vllm-ascend，经vllm-router调度Rollout请求  
权重同步| \--megatron-to-hf-mode bridge + \--vllm-weight-sync-mode native（HCCL），Megatron-Bridge导出HF layout后同步至vLLM  
数据与奖励项| 说明  
---|---  
训推分离典型数据| dapo-math-17k，面向数学推理的prompt–label对  
共卡典型数据| gsm8k（train.parquet），\--rm-type math规则奖励  
采样策略| 每组prompt可配置多路采样（如n-samples-per-prompt 4/8），配合GRPO组内归一化  
硬件与部署形态形态| 硬件| 资源划分| 适用场景  
---|---|---|---  
训推分离| Ascend 910B（A2）| 4卡训练 + 4卡Rollout| 大规模batch、吞吐优先，Issue #157  
共卡（colocate）| Ascend 910B1 × 8| 8卡训推一体，TMS \+ vLLM sleep/wake切换| 单节点8卡、显存复用，Issue #255  
A3环境可参考等Issue，模型与脚本路径与A2一致，主要差异在集群规模与镜像标签（如vime-latest）。关键训练参数（共性）

  * 并行：--tensor-model-parallel-size与Rollout侧engine卡数对齐；共卡长跑常用TP=8、单vLLM引擎。
  * 批大小：global-batch-size、rollout-batch-size、n-samples-per-prompt共同决定每步样本量；训推分离示例常用256/32/8，共卡示例常用64/16/4。
  * 序列长度：rollout-max-response-len与vllm-max-model-len需匹配任务上下文需求。
  * 优化器：Adam，lr 1e-6，常配合--use-dynamic-batch-size与--max-tokens-per-gpu 8192提升NPU利用率。

观测指标实践过程中重点关注以下指标，用于判断训推是否对齐、训练是否有效：

  * train_rollout_logprob_abs_diff：Megatron训练logprob与vLLM Rollout logprob的绝对差，NPU上稳定运行通常应低于0.05（共卡长跑可收敛至0.01量级）。
  * raw_reward/rollout/rewards：任务奖励走势，反映策略是否在改善。
  * train/pg_loss、train/entropy_loss：若diff长期偏高，pg_loss可能接近0，需优先检查megatron-to-hf-mode与权重同步。

下文给出环境准备、模型数据上传与训练作业配置；同配置下的NPU验证结果见第1章1.6、1.7节。

# 2.2 环境准备

镜像制作

  *   *   * 

    
    
    git clone -b ascend https://github.com/vllm-project/vime.gitcd vimedocker build -f docker/Dockerfile.npu -t vime-ascend:a2 .

镜像上传步骤（1）进入容器镜像服务SWR（2）选择客户端上传并生成登录指令（3）依次执行指令

  *   *   * 

    
    
    docker login -u cn-north-7@{xxx} -p {xxx} swr.cn-north-7.myhuaweicloud.comsudo docker tag {镜像名称}:{版本名称} swr.cn-north-7.myhuaweicloud.com/{组织名称}/{镜像名称}:{版本名称}sudo docker push swr.cn-north-7.myhuaweicloud.com/{组织名称}/{镜像名称}:{版本名称}

（4）上传成功确认

# 2.3 模型与数据

下载

  *   *   *   *   *   *   *   *   * 

    
    
    hf checkpointhf download Qwen/Qwen3-4B --local-dir /path/to/Qwen3-4B# train datahf download --repo-type dataset zhuzilin/dapo-math-17k --local-dir /path/to/dapo-math-17k  
    # eval datahf download --repo-type dataset zhuzilin/aime-2024 --local-dir /path/to/aime-2024

上传至OBS

（1）数据上传

（2）模型上传

脚本上传将ascend分支提供的NPU训练脚本（可参考）与模型、数据一并上传至OBS，供训练作业挂载。脚本内Ray环境变量、train.py启动参数与2.1节实验配置一致；若脚本含checkpoint回写OBS逻辑，需将输出路径替换为实际目录，例如：obs_ckpt = "obs://xxx/vime-a2/output"

# 2.4 训练

完成2.2自定义镜像制作与上传、2.3模型与数据准备后，即可在ModelArts控制台创建训练作业，将Qwen3-4BGRPO任务提交到Ascend NPU集群运行。vime ascend采用自定义镜像、启动脚本与代码目录三者组合接入ModelArts：镜像内已集成Megatron、vLLM Ascend、MindSpeed与Ray等依赖，训练脚本负责拉起RayHead节点并提交train.py训练作业，符合ModelArts自定义训练镜像的通用接入规范。ModelArts侧的操作流程（创建训练作业、选择镜像、配置启动命令与资源规格、查看日志与产物等），可参照华为云官方文档ModelArts自定义镜像制作流程。该文档说明了自定义镜像的适用场景、制作方式与配置规范；本文2.2节已按Dockerfile方式完成vime ascend镜像构建，下文仅列出与本示例相关的控制台配置要点，便于对照文档逐步完成训练下发。训练作业关键步骤（1）进入ModelArts（2）创建训练作业（3）填写基本信息（4）选择自定义镜像（5）填写启动命令

  *   *   *   * 

    
    
    cd /home/ma-user/modelarts/user-job-dir/vime-a2cp /home/ma-user/modelarts/user-job-dir/vime-a2/run_npu_qwen3_4b.sh /home/ma-user/vime/cd /home/ma-user/vimebash /home/ma-user/vime/run_npu_qwen3_4b.sh

（6）选择代码目录（7）添加环境变量（8）进行资源配置产物查看（1）日志（2）权重、轨迹（3）指标曲线

# 2.5 小结

本文从框架能力、NPU验证到ModelArts云上实践，完整呈现了vime ascend在昇腾上的落地路径。回顾全文，可概括为以下要点。vime ascend的核心价值简洁：训推解耦的三段式架构 + 统一参数体系，Megatron训练、vLLM Rollout与GRPO算法共用一套配置方式，上手成本低、定制灵活。稳定：bridge权重转换与HCCLnative同步保障训推logprob对齐；共卡模式下TMS与vLLMsleep/wake协同，500步长跑已验证链路可靠。高效：Megatron + vLLM双引擎驱动，DataPacking、动态采样、Partial Rollout等优化一应俱全；A2训推分离实测端到端约为baseline的2.18倍。从验证到上云的完整链路第1章介绍了ascend分支能力与Qwen3-4B在A2上的训推分离、共卡验证数据；第2章则给出可操作的ModelArts路径——Dockerfile构建自定义镜像、SWR上传、OBS准备模型与数据、按ModelArts自定义镜像制作流程创建训练作业并查看日志与产物。开发者可按2.1节的实验配置对照1.6、1.7节指标验收，再按2.2–2.4节步骤在云上复现同一套GRPO训练。展望与参与vime ascend与vLLM ascend、MindSpeed生态持续合入，Qwen3-30B/32B、MoE routing replay等场景已在社区Issue中沉淀。vime仍处于快速迭代阶段，无论是GPU性能优化、NPU能力扩展还是算法增强，都有很大的参与空间。欢迎加入与vLLM社区与vime项目，共同推进RL后训练生态的繁荣。参考链接vime代码仓库：https://github.com/vllm-project/vimevime ascend分支：https://github.com/vllm-project/vime/tree/ascendvime中文README：https://github.com/vllm-project/vime/blob/main/README_zh.mdvLLM官方博客：Announcing vime：https://vllm.ai/blog/2026-06-09-announcing-vime知乎：vime：融合slime与vLLM的RL框架：https://zhuanlan.zhihu.com/p/2047767807237141302ModelArts自定义镜像制作流程：https://support.huaweicloud.com/usermanual-standard-modelarts/modelarts_23_0219.html上游项目slime：https://github.com/THUDM/slime  
  
  
  
  


欢迎**关注** 、**点赞** 、**分享** 、**留言**

发表更多观点

一起交流，共同进步！

  
**戳“阅读原文”** ，一键开通华为云码道
