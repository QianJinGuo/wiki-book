---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/using-lm-evaluation-harness-amazon-bedrock-model-humaneval
ingested: 2026-07-24
feed_name: AWS China Blog
source_published: 2026-07-24
sha256: 953c08c3729ed7f644d417b5cfe10049902649a7659dc73a86f433f535f8e127
---

# 使用 lm-evaluation-harness 评估 Amazon Bedrock 模型：以 HumanEval 为例

摘要：开发者在选择LLM时，需要在准确性、延迟和成本之间做出权衡。本文在 Amazon Bedrock 上对GPT-5.6 Sol、Claude Opus 4.8、Claude Sonnet 5运行 HumanEval 编程基准测试，三者均在 97-98% 区间。同时，我们展示了如何利用 Bedrock Prompt Caching 实现 84% 以上的输入 token 成本节省。

**目录**

01 一、为什么需要在 LLM API 平台上做模型评估？

02 二、架构概览

03 三、快速开始

04 四、关键技术实现

05 五、输出报告

06 六、实际评估报告解读

07 七、性能分析与已知限制

08 八、适用场景与最佳实践

09 九、总结

* * *

## **一、为什么需要在 LLM API 平台上做模型评估？**

许多团队在使用 LLM 平台部署应用时面临以下问题：

  1. 模型选择：不同模型（如 Claude vs GPT）在特定任务上的表现差异有多大？不同版本迭代后是否存在性能退化？选型决策需要基于量化数据而非直觉。
  2. 模型降智：模型在平台托管环境中的表现是否与官方 benchmark 一致？跨区域路由、推理配置、API 参数限制等因素是否引入了性能损失？需要在实际部署环境中验证模型能力。
  3. 缓存命中率：平台的 Prompt Caching 机制在真实工作负载下能否有效触发？缓存前缀长度阈值、请求间隔、并发模式等因素如何影响命中率和实际成本节省？



## **二、架构概览**

本方案的评估流水线如下：
    
    
    ┌─────────────────────────────────────────────────────────────┐
    │                     评估流水线架构                              │
    ├─────────────────────────────────────────────────────────────┤
    │                                                             │
    │  ┌──────────┐    ┌──────────────┐    ┌──────────────────┐  │
    │  │ lm_eval  │───│  LiteLLM     │───│  Amazon Bedrock  │  │
    │  │ Framework │    │  Adapter     │    │  (Claude / GPT)  │  │
    │  └──────────┘    └──────────────┘    └──────────────────┘  │
    │       │                                       │             │
    │       ▼                                       ▼             │
    │  ┌──────────┐                        ┌──────────────────┐  │
    │  │ HumanEval│                        │  Prompt Caching  │  │
    │  │ 164 题   │                        │  (省 84%+ 成本)   │  │
    │  └──────────┘                        └──────────────────┘  │
    │       │                                       │             │
    │       ▼                                       ▼             │
    │  ┌─────────────────────────────────────────────────────┐   │
    │  │         结果输出：JSON + HTML 可视化报告              │   │
    │  └─────────────────────────────────────────────────────┘   │
    │                                                             │
    └─────────────────────────────────────────────────────────────┘
    

核心组件： – lm-evaluation-harness：EleutherAI 的标准评估框架，支持 300+ benchmark – LiteLLM：统一 API 适配层，将 lm_eval 的调用转换为 Bedrock Converse API – [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/>)：托管推理服务，支持 Claude 全系列模型及 GPT-5.6 Sol – Prompt Caching：Bedrock 原生缓存机制，对重复前缀按 $0.30/M tokens 计费（标准价 $3.00/M）

## **三、快速开始**

### 3.1 前提条件
    
    
    # 1. 确保 AWS CLI 已配置
    aws configure
    
    # 2. 安装依赖
    pip install "lm_eval[litellm]" evaluate boto3
    
    # 3. 确认 Bedrock 模型访问已开启
    # 在 AWS Console → Bedrock → Model access 中启用目标模型
    

### 3.2 三种运行模式

**3.2.1 快速验证（5 题，约 2 分钟）**
    
    
    python scripts/run_humaneval_bedrock.py \
      --model "bedrock/us.anthropic.claude-opus-4-8" \
      --limit 5 \
      --output_path ./results_quick
    

**3.2.2 配置扫描（找最优参数组合）**
    
    
    python scripts/run_humaneval_bedrock.py \
      --mode sweep \
      --model "bedrock/us.anthropic.claude-opus-4-8" \
      --sweep_limit 10 \
      --output_path ./results_sweep
    

Sweep 模式自动测试 12 种配置组合（apply_chat_template × thinking × max_gen_toks），输出最高 pass@1 的参数组合。

**3.2.3 完整评估（164 题）**
    
    
    python scripts/run_humaneval_bedrock.py \
      --model "bedrock/us.anthropic.claude-opus-4-8" \
      --output_path ./results_full \
      --log_samples
    

## **四、关键技术实现**

### 4.1 Prompt Caching：批量评估的成本利器

HumanEval benchmark 有 164 道题目，每道题共享相同的系统提示（coding assistant instructions）。如果不使用缓存，164 次请求会重复传输相同的系统前缀，造成大量不必要的费用。

**4.1.1 工作原理**
    
    
    # 注入一个 >4096 tokens 的系统提示，标记为可缓存
    payload["messages"].insert(0, {
        "role": "system",
        "content": [{
            "type": "text",
            "text": system_prompt,  # ~5500 tokens 的编程指令 + Python 标准库参考
            "cache_control": {"type": "ephemeral"},
        }],
    })
    

Bedrock 的缓存机制： – 第 1 次请求：创建缓存（cache write），按 $3.75/M tokens 计费 – 第 2~164 次请求：从缓存读取（cache read），按 $0.30/M tokens 计费 – 标准输入价格：$3.00/M tokens

**4.1.2 成本节省计算**

场景 | 计费方式 | 164 题估算成本  
---|---|---  
无缓存 | 164 × 5500 tokens × $3.00/M | ~$2.71  
有缓存 | 1 × $3.75/M + 163 × $0.30/M | ~$0.29  
节省 |  | ~89%  
  
关键限制：Bedrock 跨区域推理配置（inference profile）要求缓存前缀至少 4096 tokens。经验测试发现 ~2400 tokens 不触发缓存，~4400 tokens 以上才能稳定命中。本方案使用 ~5500 tokens 的系统提示来确保缓存激活。

### 4.2 缓存统计收集

传统方式需要等待 CloudWatch 指标延迟（通常 2-5 分钟）。本方案直接从每次 API 响应的 usage 字段实时收集缓存数据：
    
    
    # 从每次响应中提取缓存 token 数据
    usage = response.get("usage", {})
    cache_record = {
        "cache_creation_input_tokens": usage.get("cache_creation_input_tokens", 0),
        "cache_read_input_tokens": usage.get("cache_read_input_tokens", 0),
        "prompt_tokens": usage.get("prompt_tokens", 0),
        "completion_tokens": usage.get("completion_tokens", 0),
    }
    

这种方式无需额外的 CloudWatch API 调用，结果即时可用。

### 4.3 处理 Claude Opus 的 API 限制

Claude Opus在 Bedrock 上有两个重要限制：

**4.3.1 不支持 assistant prefill（gen_prefix）**

HumanEval 任务默认使用 assistant prefill 来引导输出格式（例如提供函数签名开头）。对于不支持此功能的模型，脚本通过 monkey-patch 自动将 prefill 内容转移到 user message 中：
    
    
    # 将 assistant prefill 转换为用户消息中的格式指令
    if messages[-1].get("role") == "assistant":
        # 移除 assistant 消息
        # 在 user 消息中添加输出格式说明
        messages[i]["content"] += (
            "\n\nIMPORTANT: Write ONLY the function body..."
        )
        messages = messages[:-1]
    

**4.3.2 不支持 temperature 参数**

脚本自动添加 drop_temperature=True 参数，让 LiteLLM 在发送请求时跳过 temperature 设置。

### 4.4 配置扫描（Sweep）模式

面对参数选择的不确定性，Sweep 模式通过自动化网格搜索找到最优配置：
    
    
    配置空间（2 × 2 × 3 = 12 种组合）：
    - apply_chat_template: [True, False]
    - thinking: [None, "adaptive"]  
    - max_gen_toks: [512, 1024, 2048]
    

每种配置在一个子集上快速评估，按 pass@1 排序后推荐最佳组合。用户可以选择直接用最优配置运行完整 164 题评估。

## **五、输出报告**

评估完成后生成三类输出文件：

### 5.1 results.json — 结构化数据
    
    
    {
      "results": {
        "pass@1": 0.402
      },
      "cache_statistics": {
        "cache_hit_ratio": 0.91,
        "estimated_savings_pct": 89.2,
        "cost_without_cache": 2.71,
        "cost_with_cache": 0.29
      },
      "config": {
        "model_id": "bedrock/us.anthropic.claude-opus-4-8",
        "max_gen_toks": 1024,
        "num_concurrent": 5
      }
    }
    

### 5.2 report.html — 自包含可视化报告

HTML 报告包含： – 模型性能面板（pass@1 得分、通过/失败统计、与官方基线对比） – 缓存节省面板（命中率、token 分布饼图、成本对比） – 逐题结果表格（可排序） – 失败题目详情（可展开查看生成代码与预期输出）

### 5.3 sweep_results.json — 配置对比
    
    
    {
      "sweep_metadata": {
        "model": "bedrock/us.anthropic.claude-opus-4-8",
        "total_configs": 12
      },
      "results": [
        {
          "config": {"apply_chat_template": true, "thinking": "adaptive", "max_gen_toks": 2048},
          "pass_at_1": 0.55
        }
      ]
    }
    

## **六、实际评估报告解读**

以下是使用本框架对多个模型在 Bedrock 上运行完整 HumanEval 164 题评估的结果对比。

### 6.1 多模型对比结果

模型 | Pass@1 | 通过/总数 | 耗时  
---|---|---|---  
GPT-5.6 Sol | 98.2% | 161/164 | 84.8s  
Claude Opus 4.8 | 97.0% | 159/164 | 135.2s  
Claude Sonnet 5 | 97.0% | 159/164 | 146.7s  
  
**解读**

  1. GPT-5.6 Sol 略胜一筹：以 98.2% 的 pass@1 领先 Claude 系列 1.2 个百分点，且推理速度最快（84.8s vs 135-147s）。GPT-5.6 Sol 通过 Bedrock Mantle 的 Responses API 调用，原生支持 272K 上下文窗口。
  2. Claude 系列表现一致：Opus 4.8 和 Sonnet 5 均取得 97.0% 的成绩，表明在 HumanEval 这一代码生成任务上，Opus 和 Sonnet 的能力差异不大。两者都超越了 Anthropic 官方报告的 93.7% 基线。
  3. 三个模型差距极小：所有模型都在 97-98% 区间，说明当前一线模型在 HumanEval 标准代码生成任务上已接近饱和。



### 6.2 Claude Opus 4.8 缓存节省面板

指标 | 数值  
---|---  
缓存命中率 | 93.6%  
预估节省 | 84.3%  
缓存读取 Tokens | 63,380,424  
缓存写入 Tokens | 20,172  
标准输入 Tokens | 4,298,948  
无缓存成本 | $203.10  
缓存后成本 | $31.99  
  
解读：Prompt Caching 效果显著。在 164 道题的评估过程中（由于 thinking 模式和重试，实际 API 调用达 12,572 次），缓存命中率高达 93.6%。系统提示前缀（~5500 tokens）在第一次请求后被缓存，后续请求直接从缓存读取，将输入 token 成本从 $203.10 降低至 $31.99，实际节省超过 84%。

### 6.3 评估配置对比

参数 | Claude (Opus/Sonnet) | GPT-5.6 Sol  
---|---|---  
API 接口 | Bedrock Converse API | Bedrock Mantle Responses API  
Temperature | 0.0 (drop) | 1.0 (default)  
Max Gen Tokens | 1024 | 1024  
并发请求数 | 5 | 5  
Prompt Caching | 支持（93.6% 命中率） | 支持（本次未启用）  
  
### 6.4 成本对比
    
    
    Claude Opus 4.8（有缓存）:  $31.99   
    Claude Opus 4.8（无缓存）:  $203.10  
    
                                节省 $171.11 (84.3%) via Prompt Caching
    

## **七、性能分析与已知限制**

### 7.1 pass@1 得分分析

在我们的最新测试中，三个模型在 Bedrock 上均取得了优异成绩：

  1. GPT-5.6 Sol（98.2%）：通过 Bedrock Mantle Responses API 调用，仅失败 3 题，推理速度最快
  2. Claude Opus 4.8（97.0%）：通过框架的 monkey-patch 适配成功绕过 prefill 限制，超越 Anthropic 官方 93.7% 基线
  3. Claude Sonnet 5（97.0%）：与 Opus 4.8 表现一致，在代码生成任务上性价比更高



这些结果验证了 Bedrock 托管环境下的模型推理质量与直接 API 调用一致，同时 Prompt Caching 在 Claude 系列的批量评估中节省了 84% 以上的输入成本。

### 7.2 并发与速率限制

  * 默认并发数为 5，可通过 –num_concurrent 调整
  * Bedrock 有每分钟请求数和 token 配额限制，脚本内置自动重试机制（默认 3 次）
  * 建议初次运行使用 –limit 5 验证连通性



## **八、适用场景与最佳实践**

### 8.1 推荐使用场景

场景 | 建议  
---|---  
模型版本对比 | 使用相同配置分别评估 Sonnet vs Opus vs GPT  
参数调优 | 使用 sweep 模式找最优 max_gen_toks  
新模型上线前验证 | 在 staging 环境用 limit=20 快速校验  
成本估算 | 观察缓存统计，推算生产环境批量推理成本  
  
### 8.2 最佳实践

  1. 先 sweep 再 full eval：避免用次优参数跑完整评估浪费时间和费用
  2. 利用 Prompt Caching：任何包含共享前缀的批量场景（RAG、batch inference）都适合开启缓存
  3. 监控缓存命中率：如果 cache_hit_ratio < 50%，检查系统提示是否达到 4096 tokens 阈值
  4. 保存 log_samples：便于事后分析失败案例，优化 prompt engineering



## **九、总结**

本文展示了一个完整的 LLM 评估流水线，将开源 lm-evaluation-harness 框架与 Amazon Bedrock 深度集成，并对三个前沿模型（GPT-5.6 Sol、Claude Opus 4.8、Claude Sonnet 5）进行了代码生成能力的横向对比：

  * 标准化评估：使用业界通用的 HumanEval benchmark，三模型均达 97-98% pass@1，结果可对比
  * 成本优化：Prompt Caching 在 Claude 系列的批量场景下节省 84% 以上的输入 token 费用
  * 多模型支持：同一框架覆盖 Bedrock Converse API（Claude）和 Bedrock Mantle Responses API（GPT），统一评估标准
  * 自动化调参：Sweep 模式消除手动试错，系统性地探索参数空间
  * 生产级适配：处理了 Bedrock 特有的 API 限制（prefill、temperature），monkey-patch 方式不侵入框架源码



**下一步行动：**

**相关产品：**

  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=1>) — 用于构建生成式人工智能应用程序和代理的端到端平台
  * [Amazon CloudWatch](<https://aws.amazon.com/cn/cloudwatch/?p=bl_pr_cloudwatch_l=2>) — 可观测性工具



**相关文章：**

  * [Amazon Bedrock 中推出 Anthropic Claude Opus 4.7 模型](<https://aws.amazon.com/cn/blogs/china/introducing-anthropics-claude-opus-4-7-model-in-amazon-bedrock/?p=bl_ar_l=1>)
  * [在 Amazon Bedrock 上为 Claude 应用设计稳健的 Prompt Cache 策略](<https://aws.amazon.com/cn/blogs/china/amazon-bedrock-claude-application-design-prompt-cache-policy/?p=bl_ar_l=2>)
  * [OpenAI GPT-5.6 Sol、Terra 和 Luna 现已在 Amazon Bedrock 上正式推出](<https://aws.amazon.com/cn/blogs/china/openai-gpt-5-6-sol-terra-and-luna-are-now-generally-available-on-amazon-bedrock/?p=bl_ar_l=3>)
  * [开始在 Amazon Bedrock 上使用 OpenAI GPT-5.5、GPT-5.4 模型和 Codex](<https://aws.amazon.com/cn/blogs/china/get-started-with-openai-gpt-5-5-gpt-5-4-models-and-codex-on-amazon-bedrock/?p=bl_ar_l=4>)
  * [从代码到分子系列：一场由 AI 驱动的 EGFR 抑制剂发现之旅 — 深度融合 AWS Bedrock与 Claude Code/Claude Agent Skills，生命健康行业的科学活动探微](<https://aws.amazon.com/cn/blogs/china/from-code-to-molecules-an-ai-driven-egfr-inhibitor-discovery-journey/?p=bl_ar_l=5>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 赵安蓓

AWS解决方案架构师，负责基于AWS云平台的解决方案咨询和设计，机器学习TFC成员。在数据处理与建模领域有着丰富的实践经验，特别关注医疗领域的机器学习工程化与运用。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
