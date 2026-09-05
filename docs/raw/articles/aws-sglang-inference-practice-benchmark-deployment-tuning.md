---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/based-on-sglang-large-model-inference-practice
ingested: 2026-07-21
feed_name: AWS China Blog
source_published: 2026-07-21
sha256: 1d90e3efa7774e7918fe89e1f60871482443ad33058beea4aa15c9c0ae819596
---

# 基于SGLang的大模型推理实践——从benchmark方法论到部署方案选型与调优

摘要：随着大语言模型（LLM）的快速发展，模型规模不断增大，对推理部署的要求也越来越高。在实际项目中，如何高效地在GPU集群上部署和优化大模型推理，已经成为AI基础设施团队面临的核心挑战之一。本文基于多个实际项目的经验积累，系统性地介绍大模型推理部署的方法论、部署方案选型、性能调优以及常见问题的解决方案。

**目录**

01 一、引言

02 二、背景与挑战

03 三、测试先行：大模型benchmark方法论

04 四、部署方案一：单机部署

05 五、部署方案二：多机Non-PD分离

06 六、部署方案三：多节点PD分离

07 七、一个模型的不同部署方案的Benchmark性能对比（实验室测试结果，仅供定性参考）

08 八、大模型部署方案选型建议

09 九、Debug与调优

10 十、客户常见问题

11 十一、总结

* * *

## **一、引言**

随着大语言模型（LLM）的快速发展，模型规模不断增大，对推理部署的要求也越来越高。在实际项目中，如何高效地在GPU集群上部署和优化大模型推理，已经成为AI基础设施团队面临的核心挑战之一。本文基于多个实际项目的经验积累，系统性地介绍大模型推理部署的方法论、部署方案选型、性能调优以及常见问题的解决方案。这里声明一下，本文实践与实验数据均基于 [SGLang](<https://github.com/sgl-project/sglang>)及Amazon EFA 环境，本文提到的方法论可以应用于其他类似的推理框架（如[vLLM](<https://vllm.ai/>)），但性能优化的具体方向需通过实际测试来确定。更多的细节和内容可以参考[github](<https://github.com/yuhuiaws/ML-study/tree/main/%E7%94%9F%E6%88%90%E5%BC%8FAI/Claude-code-Skills>)。

## **二、背景与挑战**

### 2.1 行业背景

当前大模型推理领域呈现出以下几个显著趋势：

  * 模型参数规模持续增长，如DeepSeek-V4-Pro 有1.6T参数量。
  * 模型支持的上下文长度越来越长（比如DeepSeek-V4-Pro可以支持1M上下文），对显存和计算资源提出了更高要求。
  * 开源模型的迭代速度加快，推理框架也在快速演进。
  * GPU资源规模受限，能拿到的GPU机型没有太多选择。
  * 项目交付时间越来越紧，由于AI工具能力的提升，大家的期望值也在提升。
  * 中国客户在大模型推理部署方面的实践越来越深入。



### 2.2 核心挑战

在实际项目推进过程中，团队通常面临以下关键挑战：

  * 推理框架的选择（比如SGLang还是vLLM）需要根据具体模型和场景判断。
  * 新发布的开源模型在推理框架中的支持程度和成熟度需要验证。
  * 不同部署方案的性能对比，尤其是Non-PD和PD分离方案的对比。
  * 推理方案的验收标准的指定，这个需要双方（即项目技术负责人和具体推理方案实施团队）提前协商好具体的细节。
  * 推理方案的性能优化：跑通和优化是完全两回事，在优化的过程中，往往会遇到很多意料之外的技术挑战。



## **三、测试先行：大模型benchmark方法论**

### 3.1 测试规划

在进行大模型推理部署之前，必须建立清晰的benchmark方法论。一个完整的测试规划需要回答以下几个关键问题。

**3.1.1 确定测试内容**

首先需要敲定具体的推理负载参数：

  * 模型及其具体版本。
  * 必要测试条件：input/output token长度（固定长度还是动态长度）、请求数。
  * 可选测试条件：request rate、max concurrency、是否需要多轮对话测试。



**3.1.2 明确测试目标**

测试目标通常分为以下几种情况：

  * 情况1：与已有的指定部署方案进行性能对比。
  * 情况2：只有具体推理负载的测试指标需求，但不限定具体的部署方案。更进一步的是，需要给出最佳部署方案和参数设定。
  * 情况3：没有明确需求时，提前预研某新版本开源模型在特定GPU机型上的表现。



**3.1.3 圈定测试范围**

测试范围需要从多个维度进行界定：

  * GPU机型的选择。
  * 推理框架的选择。
  * 部署方案的选择： 
    * 单机还是多机、PD分离还是Non-PD分离。
    * PD分离时xPxD的选择。
    * 并行策略组合的选择。
    * 是否使用投机解码。
    * KV transfer engine的要求。
    * Router的负载均衡策略配置。
    * Prefix cache和多层次KV cache（HiCache）的配置。



### 3.2 测试指标

典型的测试指标需求表述为：针对某个具体推理负载和部署方案，需要满足推理请求的TTFT mean、P90不大于指定秒数，TPOT mean、P90、P99不大于指定毫秒数。

需要重点关注的性能指标：

  1. TTFT（Time To First Token）：首token响应时间
  2. TPOT（Time Per Output Token）：除去第一个token外，其他输出token的生成时间
  3. Output Throughput（token/s）：生成输出token的吞吐量
  4. Request Throughput（completed requests per second）：请求完成的吞吐量
  5. KV transfer avg latency：KV传输平均延迟（PD分离场景）



request rate和max concurrency如果没有明确给定，可以根据TTFT和TPOT的要求来动态调整。SGLang bench_serving的输出结果的request throughput是一个指导信号来调整对应的request rate。

需要注意的是，TTFT和Throughput往往存在矛盾关系——高并发能提升吞吐但会恶化TTFT，如果TTFT不满足限制/要求，再高的吞吐也没有意义。PD分离的核心收益体现在TPOT上（因为隔离后decode不会被prefill抢占），P99 TPOT比mean更能反映真实的用户体验。

### 3.3 Benchmark实践要点

**3.3.1 消除变量干扰**

Benchmark的一个核心原则是尽量消除变量干扰。

明确的Warmup策略尤为重要：benchmark在正式测量前发送warmup请求的核心原因是触发Prefill路径上的[Triton kernel JIT](<https://pytorch.org/blog/triton-kernel-compilation-stages/>)编译。Triton kernel按实际输入形状编译，尽管SGLang server启动时会有一个默认的warmup请求，单是这一个warmup请求不够充分，仍然需要发送充分合理的warmup请求来触发Triton kernel JIT编译。

测试流程最好脚本化和可复现，例如直接提供SGLang bench_serving的完整命令：
    
    
    python3 -m sglang.bench_serving \
        --backend sglang \
        --dataset-name random \
        --num-prompts 100 \
        --random-input-len 2048 \
        --random-output-len 256 \
        --random-range-ratio 1 \
        --request-rate 8 \
        --max-concurrency 8 \
        --port 8000
    

常见的反面案例包括：

  * 一组实验开启了prompt/prefix cache，另一组没有开启。
  * 不同input/output token长度的两个对比实验（由于random range ratio不为1引入的差异）。
  * 没有warmup或者warmup请求的分布与后续benchmark请求不同。



**3.3.2 Benchmark结果的可信度**

SGLang bench_serving的统计结果是否可信，这一点需要特别关注。一定要人工检查SGLang的日志。Bench serving统计的请求成功是真的成功了吗？SGLang的PD分离方案的bench serving统计的请求成功的原则可以参考下面表1：

场景 | HTTP状态 | Output_len | 判定 | 说明  
---|---|---|---|---  
正常完成 | 200 | 等于请求值 | 成功 | 正确  
Prefill成功但decode中途崩溃/截断 | 200 | 大于等于1但是小于请求值 | 成功 | 判定有误  
Prefill失败 | 4XX/5XX | 0 | 失败 | 正确  
网络异常 | N/A | 0 | 失败 | 正确  
  
[表1 SGLang bench_serving请求成功判定逻辑]

bench_serving统计的请求成功判定逻辑是：HTTP 200意味着prefill成功且至少产出了第一个token，因此output_len大于等于1是必然的。但问题在于bench_serving不会校验output_len是否达到了请求指定的output tokens数量，导致截断请求被误判为成功。

## **四、部署方案一：单机部署**

### 4.1 核心决策：模型能否放进单机

单机部署的首要问题是显存估算。以SGLang为例，显存的消耗主要由以下部分组成：

  * 模型参数本身 + KV cache pool（总显存 乘以mem_fraction_static）
  * CUDA graph capture + 运行时临时需要的显存



以DeepSeek-V3 671B FP8模型为例：H200实例刚好能够容纳，比如通过mem-fraction-static 0.78进行精细调控；B200/B300实例显存富余较大，可以运行更长context或更大batch；G7e.48xlarge实例无法单机部署，必须使用2个或者2个以上节点。

### 4.2 单机部署中EP的必要性

即使是单机部署，Expert Parallelism（EP）的使用也会对性能产生显著影响。以DeepSeek-V3在H200上的部署为例（它的每个transformer block有256个routed Moe专家和1个shared Moe），EP1和EP8的实验观察：

| TP 8 EP 1 (无EP) | TP 8 EP 8  
---|---|---  
每 GPU 的routed MoE的存储方式 | 全部 256 experts（TP split）的 shard | 32 个完整的experts  
显存剩余 | 小（EP 1时Cuda graph capture需要更多的临时缓冲区） | 多  
MoE 计算方式 | TP并行，AllReduce | EP并行，All2All  
  
[表2]

EP1方案下剩余可用GPU显存明显少于EP8方案。这一差异的真正来源是DeepGEMM masked_gemm运行时的中间buffer分配模式不同。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/based-on-sglang-large-model-inference-practice-1.png>) [图1 因果链]  
---  
  
对于单节点H200 P5en.48xlarge部署DeepSeek-V3 FP8模型，如果使用EP1 TP8方案，需要禁用CUDA graph，否则在CUDA graph capture阶段就会因显存不足出现问题。禁用CUDA graph的EP1 TP8性能远不如EP8 TP8且启用CUDA graph的方案，具体如表3所示，表中的rate指的是benchmark的request rate和max concurrency的取值（实验室测试结果，仅供参考和定性说明）。

Rate | EP=1 output token/s | EP=1 TPOT(ms) | EP=1 TTFT(ms) | EP=8  
output token/s | EP=8  
TPOT(ms)  
---|---|---|---|---|---  
1 | 9.27 | 107.26 | 227 | 76.18 | 12.38  
2 | 18.27 | 107.72 | 333 | 132.31 | 14.30  
4 | 35.74 | 107.88 | 318 | 211.38 | 17.80  
8 | 68.65 | 110.61 | 319 | 329.31 | 22.70  
16 | 128.81 | 114.52 | 315 | 486.75 | 30.26  
32 | 219.96 | 126.62 | 598 | 687.49 | 41.49  
  
[表3]

然而，这并非绝对。对于单节点H200 P5en.48xlarge部署的Kimi2.5 INT4模型，EP1 TP8（启用CUDA graph）方案的性能反而优于EP8 TP8以及EP8 TP8 DP8（启用DP attention）方案，如下面的表4所示（input token 2K，output token 256；C表示的是max concurrency）（实验室测试结果，仅供参考和定性说明）。

Metric | EP=1 C=25 | EP=8 C=25 | EP=1 C=50 | EP=8 C=50  
---|---|---|---|---  
output token/s | 677.66 | 637 | 849.35 | 797  
Median TPOT(ms) | 35.45 | 37.95 | 57.34 | 61.19  
Median TTFT(ms) | 159 | 166.41 | 193 | 198.20  
  
[表4]

因此，EP是否设定以及如何设定，一定需要case by case来测试验证。

### 4.3 单机与多机部署的对比

多机部署并不一定比单机部署性能更好。跨节点通信的开销可能抵消多机带来的资源优势，具体效果需要针对实际场景进行测试。

| 选单机部署 | 选择多机部署 | 备注  
---|---|---|---  
显存容量 | 放得下 | 放不下 | 放得下要考虑的不只是模型参数，还要有足量的KV cache，要支持足量的并发，满足具体业务场景需求的context长度等  
支持的context长度 | 短 | 长 | 不好量化，case by case来测试  
复杂度 | 简单 | 复杂的多 | 对于多机部署，有更多的部署方案选择。而且需要考虑更多的因素，比如是否PD分离，网络的适配，更多并行策略组合等等。  
支持的并发 | 低 | 高 | 不好量化，case by case来测试  
  
[表5 单机与多机部署的对比]

## **五、部署方案二：多机Non-PD分离**

### 5.1 核心决策

多机Non-PD分离方案需要做出以下核心决策：

  * EP是否跨节点？
  * 是否需要引入Pipeline Parallelism（PP）？
  * 是否需要启用DP attention？
  * 是否引入DeepEP/UCCL-EP（对于这两者，SGLang实现强制将EP size等于TP size；如果不设定moe_a2a_backend或者使用moe_a2a_backend的默认值， TP size和EP size是可以不相等的）？
  * 不同并行策略的组合如何确定？



### 5.2 并行策略组合

以2节点部署为例，我们来看一下并行策略的组合关系：

配置 | tp_size | dp_size | attn_cp_size | moe_dp_size | ep_size | moe_tp_size  
---|---|---|---|---|---|---  
单节点 | 8 | 1 | 1 | 1 | 8 | 1  
2节点(EP=8) | 16 | 1 | 1 | 1 | 8 | 2  
2节点(EP=16) | 16 | 1 | 1 | 1 | 16 | 1  
2节点+ Moe DP | 16 | 1 | 2 | 2 | 8 | 1  
2节点DP attention | 16 | 2 | 1 | 1 | 8 | 2  
  
[表6 并行策略的组合关系]

核心公式为：moe_tp_size = tp_size // ep_size // moe_dp_size。当moe_dp_size等于1时，attn_cp_size可以独立设置为任意合法值；当moe_dp_size大于1时，attn_cp_size必须等于moe_dp_size。二者绑定的原因是：Attention CP将tokens切分成多份，MoE DP意味着多个rank持有相同experts但处理不同tokens，二者必须对齐，否则token分片逻辑会不一致。

### 5.3 Non-PD与PD分离方案的对比

PD分离方案并不一定比Non-PD方案性能更好。

以SGLang部署的FP8 MoE版本DeepSeek-V4-Pro模型为例，在input 120K、output 1K、request rate 0.1、128个prompt的测试条件下（实验室测试结果，仅供参考和定性说明）：

Solution | Max concurrency | Output token/s | Request throughput | Mean TTFT(s) | Mean TPOT(ms)  
---|---|---|---|---|---  
2P2D + NIXL | 10 | 31.04 | 0.03104 | 259 | 50.76  
2P2D + Mooncake TE | 10 | 30.75 | 0.03075 | 262 | 50.74  
Non-PD 4 nodes | 128 | 97.47 | 0.097 | 73.3 | 240  
  
[表7 ]

  * 2P2D的方案是disable DP的，Non-PD 4 nodes方案是enable DP + DeepEP normal mode。2P2D方案如果enable DP，没有办法支持很长的比如100K的输入。
  * 对于2P2D的部署，不管使用NIXL还是Mooncake Transfer Engine/Mooncake TE，当max concurrency是128的时候，都会有很多错误发生。这里限制到max concurrency为10，128个请求全部成功。
  * Non-PD 4节点（TP 32, EP 32）方案在max concurrency为128时没有任何错误，128个请求全部成功。



对于2P2D + Mooncake TE的情况，input 100K，output 1K，request 0.1，max concurrency是128的时候，128个请求只有不到25个请求可以成功。而同样条件下，换成NIXL KV transfer，128个请求全部成功（实验室测试结果，仅供参考和定性说明）。

Solution | Input token length | Output token/s | Request througput | Mean TTFT(s) | Mean TPOT(ms) | Success  
---|---|---|---|---|---|---  
2P2D + NIXL | 100K | 47.36 | NA | 666.5 | 51.2 | Yes  
2P2D + Mooncake TE | 100K | 9.69 | NA | NA | 244 | No(< 25%)  
Non-PD 4 nodes | 128K | 97.47 | 0.097 | 73.3 | 240 | Yes  
  
[表8]

对于MiMo-V2-Flash-FP8在H200上的实验，PD分离（1P1D）和Non-PD（单节点）的对比表明，Non-PD单节点方案在output token/s吞吐方面更好，1P1D在TPOT上更好，TTFT则互有攻守。

结论：Non-PD方案和PD方案不存在谁一定好的绝对规律，必须case by case进行测试验证。不同的benchmark测试条件/业务测试场景，不同的GPU机型，不同的并行策略，不同的模型版本，不同的推理框架等等，这些都是影响因素。

## **六、部署方案三：多节点PD分离**

### 6.1 PD分离架构

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/based-on-sglang-large-model-inference-practice-2.png>) [图2 SGLang PD分离架构]  
---  
  
Prefill-Decode分离方案涉及以下角色：

  * Prefill节点：Master和Non-master角色，或者每个节点作为独立worker
  * Decode节点：Master和Non-master角色，或者每个节点作为独立worker
  * Router：包含负载均衡策略、重试、熔断、健康检查，Prefill节点和decode节点自动发现等功能。



SGLang Router的核心是PDRouter，它针对每个请求独立选择prefill worker和decode worker，然后并发发送请求。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/based-on-sglang-large-model-inference-practice-3.png>) [图3]  
---  
  
在生产环境中，还需要考虑Router本身的scaling问题，可以参考的架构拓扑：

Client —- Amazon NLB —- K8s ingress controller/K8s API Gateway —- Multiple SGLang Router replica —- Prefill pod/Decode pod 。

### 6.2 xPxD的选择

关于xPxD中X的含义，业界存在两种说法：一是GPU节点数量，二是Worker的数量（一个worker可能包含多个GPU节点）。在项目中必须与客户对齐这个含义。

X的选择需要考虑Prefill节点之间是独立还是需要通信、Decode节点之间是独立还是需要通信，以及Worker数量如何确定。

### 6.3 KV Transfer Engine的选择

常见的KV transfer engine包括：

  * NIXL：支持UCX backend和Libfabric backend。使用NIXL libfabric backend是Amazon官方支持和推荐的方案。
  * Mooncake TE：使用Libfabric on EFA。



NIXL和Mooncake TE的对比需要从性能和稳定性两个维度进行评估。在KV transfer latency和端到端推理性能方面，两者各有优劣，最好case by case进行对比。在稳定性方面，NIXL可能表现更好。

### 6.4 PD分离性能对比实验

以下是在P6-B200.48xlarge实例上，使用DeepSeek-V3 FP8模型进行的PD分离性能对比实验结果。

**6.4.1 2P1D vs 2P2D对比**

代码场景或者agent多轮交互场景：Input token 120K，output token 256，max concurrency为2的测试（实验室测试结果，仅供参考和定性说明）。

Metrics | 2P1D(3 nodes) | 2P2D(4 nodes) | 变化  
---|---|---|---  
Request throughput(req/s) | 0.18 | 0.18 | 持平  
Output throughput(token/s) | 45.4 | 46.1 | +1.5%  
Mean TTFT(ms) | 8218 | 8126 | -1.1%  
Mean TPOT(ms) | 11.60 | 11.58 | 持平  
  
[表9]

**6.4.2 1P2D vs 2P2D对比**

Agent针对复杂任务thinking输出很长的场景，或者根据项目需求输出完整详细设计和代码的场景：Input token 4K，output token 10K，max concurrency 为100（实验室测试结果，仅供参考和定性说明）。

Metrics | 2P2D(4 nodes) | 1P2D(3 nodes) | 变化  
---|---|---|---  
Request throughput(req/s) | 0.39 | 0.39 | 持平  
Output throughput(token/s) | 3970 | 3967 | 持平  
Mean TTFT(ms) | 1654 | 2055 | +24%  
Mean TPOT(ms) | 24.46 | 24.31 | 持平  
  
[表10]

更多实验观察：

  * Input 4K/Output 1K场景：2P2D比2P1D吞吐高32%，TTFT和TPOT都有显著改善。所以，这个场景2P2D是更好的选择。
  * Input 16K/Output 1K场景：2P2D比2P1D吞吐高80%，TTFT和TPOT都有显著改善。这个场景2P2D显然是更好的选择。
  * Input 120K/Output 256场景：2P2D和2P1D性能接近，瓶颈在Prefill节点，选择2P1D性价比更高。另外，这个时候增加prefill节点也是一个signal。
  * Input 4K/Output 10K场景：2P2D比1P2D多一个P，性能接近，瓶颈在Decode端，选择1P2D更好。



**6.4.3 1P1D vs Non-PD对比**

在2节点P6-B300.48xlarge实例上，Deepseek-v3 FP8模型，测试条件：input token 120K，output token 256，random-range-ratio 1（输入和输出都是固定长度），100个prompt，request-rate 32，max concurrency 32（实验室测试结果，仅供参考和定性说明）。

Metrics | 1P1D (2 nodes) | Non-PD 2 nodes + EP 8 | Non-PD 2 nodes + EP 16  
---|---|---|---  
Request throughput(req/s) | 0.11 | 0.20 | 0.19  
Output throughput(token/s) | 28.87 | 50.54 | 47.84  
Mean TTFT(ms) | 237700 | 92509 | 99037  
Mean TPOT(ms) | 7.11 | 226.9 | N/A  
  
[表11]

针对上面的实验，Non PD的2节点部署的output tokens/s的吞吐和mean TTFT要好于1P1D部署，1P1D部署的TPOT要好于Non PD的2节点部署（上面表12中的实验的TTFT比较差，可以考虑降低request rate以及max concurrency来进行实验）。针对Non PD的2节点部署，在 120K 长输入场景下，EP8 比 EP16 性能好约 5%。

## **七、一个模型的不同部署方案的Benchmark性能对比（实验室测试结果，仅供定性参考）**

### 7.1 测试环境

  * 硬件：P5en.48xlarge（H200 HBM 141GB）
  * 模型：DeepSeek-V3 671B MoE FP8
  * GPU平台：SageMaker HyperPod on EKS
  * 推理框架：SGLang 0.5.8
  * 测试参数：random-input-len=2048, random-output-len=256, random-range-ratio=0.5, num-prompts=100



### 7.2 Output throughput（tokens/s）对比

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/based-on-sglang-large-model-inference-practice-4.png>) [图4 output throughput对比]  
---  
  
图中的D: 2N-UCCL-EP指的是两节点Non-PD部署且EP并行使用了UCCL-EP。

图中的G: 2P2D-NCCL指的是prefill节点之间disable all2all for EP（也就是使用了SGLang参数–moe-a2a-backend为None），decode节点之间disable all2all for EP。

图中的2P2D-DLC指的是prefill node之间用了UCCL-EP，decode node之间也用了UCCL-EP。

图中的2P2D-simple指的是prefill node是独立的，decode node之间用了UCCL-EP。

### 7.3 TTFT（ms）对比

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/based-on-sglang-large-model-inference-practice-5.png>) [图5 TTFT对比]  
---  
  
### 7.4 TPOT（ms）对比

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/based-on-sglang-large-model-inference-practice-6.png>) [图6 TPOT对比]  
---  
  
### 7.5 Request rate和Max concurrency都是32的核心metric对比

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/based-on-sglang-large-model-inference-practice-7.png>) [图7 核心性能metric对比]  
---  
  
上面的图是按照部署方案的token/s/GPU来大致粗略的排名，这里并没有严格考虑TTFT和TPOT的限制。

### 7.6 实验观察（对于当前这个测试场景和已测试过的方案）

场景 | 推荐 | 理由  
---|---|---  
成本优先/低并发 | A：单节点 EP8 TP8 | 85.9 tok/s/GPU最高性价比，TTFT最低  
2节点最优解 | E: 1P1D-NIXL-libfabric | 998 tok/s，2节点部署方案中综合最强的  
4节点高并发 | I：2P2D-simple | 843 tok/s，部署简单，高并发TTFT最好  
  
[表12]

对于4节点部署的2P2D方案，实验结果表明：2P独立部署且2D之间使用UCCL-EP low latency mode的方案，性能优于2P之间使用UCCL-EP normal mode且2D之间使用UCCL-EP low latency mode的方案。这一结论与蚂蚁金服针对DeepSeek-V3使用4台H20的[建议部署方案](<https://github.com/antgroup/sglang/pull/4>)一致：独立prefill（TP=8单节点）加flashmla decode是2P2D的最优架构，可以避免prefill跨节点通信开销，并利用flashmla优化MLA decode。

## **八、大模型部署方案选型建议**

### 8.1 部署方案选型核心原则

1\. 先单机基线，再多机扩展 — 多机部署不一定比单机更好，跨节点通信开销可能抵消资源优势。

2\. PD分离 vs Non-PD 没有绝对优劣 — 不同场景、模型、GPU 机型、并行策略下结论可能完全相反，必须 case by case 对比测试。

3\. 判断瓶颈在 Prefill 还是 Decode，针对性扩容。

4\. KV Transfer Engine 选型：Amazon EFA 环境目前优先推荐 NIXL libfabric backend。

5\. EP 跨节点不一定好 — Prefill 节点独立部署可避免跨节点通信开销，EP8 在长输入场景通常优于 EP16。

6\. 并行策略组合需实测，无万能公式 — EP/TP/DP/PP/CP 的最优组合高度依赖具体场景。比如针对long input prompt场景，可以考虑针对Prefill节点使用CP和PP组合。即使是 EP1 vs EP8 这样看似明确的选择，在不同模型上（DeepSeek-V3 vs Kimi2.5）结论也可能完全相反。

### 8.2 部署方案选型决策树

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/based-on-sglang-large-model-inference-practice-8.png>) [图8 大模型部署方案决策树]  
---  
  
## **九、Debug与调优**

### 9.1 关键Metrics监控

Metrics的监控需要覆盖三个层面：

**9.1.1 推理metric层面**

  * TTFT、TPOT、token throughput、KV cache hit rate、KV transfer latency



**9.1.2 系统层面**

  * CPU使用率和系统内存使用情况
  * GPU utilization和GPU memory
  * GPU温度及GPU主频（GPU的SM温度过高会引起SM降频）
  * DCGM相关指标（包括Xid错误）
  * EFA RDMA相关指标



**9.1.3 推理框架层面**

  * Queue length、KV cache usage、Avg accept length（与投机解码相关）



### 9.2 常见问题排查以及优化

**9.2.1 TTFT高？**

TTFT高的常见现象是queue_reqs堆积，但请求堆积是结果而非原因。可能的原因：

  * 模型并行策略不适当？ 
    * 如果input token很长，PD分离方案中的prefill节点之间是否启用了PP？
    * 是否enable 了CP并行？
    * 是DP attention带入的影响吗？
  * 可用KV cache空间太小？
  * Benchmark的request rate或max concurrency设置过高？一个好的建议：让request rate和实际benchmark的request throughput接近比较合理。
  * 对于Prefill来说，EP并行库和KV transfer engine之间的CPU或EFA网卡争用？
  * KV cache hit rate 低？请检查 routing affinity 以及KV cache 配置。 
    * Router是否设定了prefix cache aware或者KV cache aware的路由？
    * 是否启动了Hicache？每个层级的KV cache的使用情况如何呢？
  * PD分离的 kv_transfer_latency 高？ 
    * EFA是否正确配置？(客户经常这个配置的有问题)
    * 是否正确使用了RDMA？
    * KV transfer engine 的选择和对比：NIXL or Mooncake TE？
  * SGLang参数配置不合适？ 
    * chunked prefill size不足？
    * Max prefilled token太小？
    * max running requests per DP rank有些小？



**9.2.2 TPOT高？**

TPOT高的可能原因：

  * KV cache空间不足导致preemption（KV cache 空间不足会驱逐当前请求的KV cache到CPU memory），通过SGLang metric retracted_reqs > 0可以看出来有多少请求驱逐。
  * 并行策略是否合适：EP是否要跨节点？DP attention是否需要？
  * PD分离方案选择是否合适：尝试过Non-PD分离方案了吗？KV transfer engine的选型是否有过对比？xPxD的Decode的数量选择是否合适？
  * 投机解码的accept avg length是否过低。
  * Batch size是否超出了 CUDA graph capture max batch size的范围。



**9.2.3 吞吐低于预期？**

首先要评估预期本身是否合理，如果这个预期或者说基准本身就不靠谱，那么要先修正这个预期。

当吞吐低于预期时，可从以下方面排查：

  * SGLang 中和size相关的参数：chunked相关的参数？max running request是不是太小？
  * SGLang metric kv_available_tokens 是否比较低：如果kv_available_tokens 比较低，那么GPU显存是瓶颈就是一个信号。
  * KV store如何配置的：是否使用了Hicache以及Hicache如何设定的。
  * 投机解码是否启用。
  * 部署方案是否合适：针对长输入短输出可以考虑增加prefill节点；针对短输入长输出可以考虑增加decode节点；是否尝试过不同的并行策略组合；是否有尝试不同的KV transfer engine；Non-PD部署方案是否有尝试。
  * GPU机型选择是否合适：吞吐的话，B系列一般比H系列好，但是性价比的话，最好case by case来测试。
  * 推理框架选择是否合适。



## **十、客户常见问题**

### 10.1 NCCL Test相关

进行NCCL test时，需要正确设定NCCL和EFA相关环境变量。

  * 最基本的一组配置包括：FI_PROVIDER=efa、FI_EFA_USE_DEVICE_RDMA=1、FI_EFA_FORK_SAFE=1、NCCL_PROTO=Simple、NCCL_DEBUG=INFO、NCCL_SOCKET_IFNAME=^lo,docker0。
  * 其余环境变量建议让对应的库自动设定。
  * Case by case来设定某些具体的环境变量。对于NCCL_TUNER_PLUGIN 这个环境变量要设定为对应runtime中的libnccl-ofi-tuner.so路径，比如/opt/amazon/ofi-nccl/lib/libnccl-ofi-tuner.so。



2个B200节点的AllReduce测试结果如下：

Config | Avg Bus BW(GB/s) | Peak Bus BW(GB/s) | Steady State(GB/s)  
---|---|---|---  
Default（auto/auto） | 66.17 | 402 | 118  
Tree/auto | 65.81 | 370 | 117  
Tree/Simple | 35.68 | 120 | 117  
  
[表13]

默认配置下Peak Busbw能达到402GB/s，接近3.2Tbps的物理带宽。上面提到的config指的是NCCL_PROTO和NCCL_ALGO的配置（一般情况下，建议使用默认的auto让NCCL来根据消息大小和网络拓扑来自动选择）。

某客户测试256个P6-B300.48xlarge节点的NCCL test的allreduce，设置了下面两个openmpi参数后，busbw基本上能达到预期。

  * -mca routed_radix “256”：该参数控制 OpenMPI 内部 RPC 路由树的扇出度。
  * -mca plm_rsh_num_concurrent “256”：该参数控制PLM（Process Launch Module）的 RSH/SSH 并发启动连接数上限。粒度是节点而不是进程（一般把该参数设置为节点数最合理）。



更多节点的NCCL test allreduce带宽会不会变小？来自某客户在B300上的实际测试数据表明，随着节点数增加AllReduce带宽有所下降：8台759GB/s、64台687GB/s、128台686GB/s、256台539GB/s。

不同的参数或者环境变量，可能会导致busbw差别很大。最好是有客户之前在比如IDC的测试完整命令和参数/环境变量的设定。

NCCL test all2all的busbw要比allreduce少很多，这个属于正常的。alltoall 在 NCCL 中没有专用的集合通信算法（不像 AllReduce 有 Ring/Tree），它被分解为 N×N 组 ncclSend + ncclRecv，底层用统一的 ncclDevKernel_SendRecv kernel 执行所有点对点传输。

### 10.2 推理框架选择建议

生态和流行度：SGLang和vLLM是当前最主流的两个推理框架。SGLang在国内客户中使用更为广泛，有些客户还用TRT-LLM跑benchmark。

迭代速度：对于新的feature的支持速度。对于新模型的支持，不同框架的支持速度可能不一样。

成熟度：SGLang已经是生产级别的推理框架。

## **十一、总结**

大模型推理部署是一个复杂的系统工程，涉及硬件选型、软件栈配置、并行策略设计、性能调优等多个维度。基于实际项目经验，以下几点是最重要的总结：

1\. 测试先行：在进行任何部署之前，必须建立清晰的benchmark方法论，明确测试内容、目标、范围和指标需求。

2\. 没有银弹：不存在一种部署方案在所有场景下都是最优的。单机vs多机、PD分离vs Non-PD分离、不同的并行策略组合，都需要根据具体场景测试验证。

3\. 深入理解底层：跑通和优化是两回事。优化过程中会遇到各种框架bug、硬件兼容性问题和组件间的资源争抢，需要深入源码层面排查。

4\. 持续跟进生态：推理框架和相关软件库迭代极快，需要持续关注社区动态，及时升级和适配。

大模型推理部署仍然是一个快速演进的领域。希望本文能为从事相关工作的工程师提供有价值的参考。

**下一步行动：**

**相关产品：**

  * [Amazon SageMaker](<https://aws.amazon.com/cn/sagemaker/?p=bl_pr_sagemaker_l=1>) — 适用于所有数据、分析和 AI 的中心
  * [Amazon API Gateway](<https://aws.amazon.com/cn/api-gateway/?p=bl_pr_api-gateway_l=2>) — 完全托管的 RESTful API 服务
  * [Amazon EKS](<https://aws.amazon.com/cn/eks/?p=bl_pr_eks_l=3>) — 托管式 Kubernetes 服务
  * [Amazon Batch](<https://aws.amazon.com/cn/batch/?p=bl_pr_batch_l=4>) — 完全托管式批处理



**相关文章：**

  * [从IDC到云上GPU：基于 Amazon EKS 的大模型推理混合云弹性部署实践](<https://aws.amazon.com/cn/blogs/china/idc-gpu-based-on-amazon-eks-large-model-inference-hybrid-cloud-elastic-deploy-practice/?p=bl_ar_l=1>)
  * [Zenjoy 基于 Amazon Bedrock 和 EKS 构建 AIOps Agent：打通 Prometheus、ES 与夜莺的智能化告警实战](<https://aws.amazon.com/cn/blogs/china/zenjoy-based-on-strands-amazon-bedrock-agentcore-build-eks/?p=bl_ar_l=2>)
  * [Amazon Bedrock模型推理的Serverless 异步架构 – 处理在线多模态高负载案例](<https://aws.amazon.com/cn/blogs/china/amazon-bedrock-model-inference-serverless-architecture-case-study/?p=bl_ar_l=3>)
  * [让 Agent拥有「跨终端长期记忆」——基于 Amazon Bedrock AgentCore Memory 的实践](<https://aws.amazon.com/cn/blogs/china/agent-based-on-amazon-bedrock-agentcore-memory-practice/?p=bl_ar_l=4>)
  * [Firecracker在航空营销多智能体中的应用](<https://aws.amazon.com/cn/blogs/china/application-of-firecracker-in-aviation-marketing-multi-agent-systems/?p=bl_ar_l=5>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 梁宇辉

亚马逊云科技机器学习产品技术专家，负责基于亚马逊云科技的机器学习方案的咨询与设计，专注于机器学习的推广与应用，深度参与了很多真实客户的机器学习项目的构建以及优化。对于深度学习模型分布式训练，推荐系统和计算广告等领域具有丰富经验。

### 张文举

亚马逊云科技资深解决方案架构师，在加入亚马逊云科技后，重点关注人工智能和大数据解决方案，目前致力于生成式 AI 应用研究和推广，他拥有上海交通大学计算机博士学位。

### 郭韧

亚马逊云科技人工智能产品专家团队经理，负责 AI 相关解决方案的架构设计、实施和推广。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
