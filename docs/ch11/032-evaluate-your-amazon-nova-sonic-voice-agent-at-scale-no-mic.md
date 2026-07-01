# Evaluate your Amazon Nova Sonic voice agent at scale, no microphone required

## Ch11.032 Evaluate your Amazon Nova Sonic voice agent at scale, no microphone required

> 📊 Level ⭐⭐ | 14.5KB | `entities/evaluate-amazon-nova-sonic-voice-agent-scale-no-mic.md`

# Evaluate your Amazon Nova Sonic voice agent at scale, no microphone required

> **Source archive**: [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/evaluate-your-amazon-nova-sonic-voice-agent-at-scale-no-micr.md)

# Evaluate your Amazon Nova Sonic voice agent at scale, no microphone required

Voice agents are transforming how businesses interact with customers, handling appointment bookings, order inquiries, account management, and more through natural spoken conversation. But as these agents grow more capable, a fundamental challenge emerges: how do you test them?

Unlike text-based chatbots where you can script inputs and assert outputs, voice agents operate in a fundamentally different paradigm. They stream audio bidirectionally, respond non-deterministically, maintain context across multi-turn conversations, and use tools in real time. The only way most teams test today is to have someone physically talk to the system and listen to what comes back. That’s slow, inconsistent, and doesn’t scale.

This testing gap creates two critical problems for teams building voice applications:

  1. **Iterating system prompts and tool configurations is painfully slow.** Every time you tweak a prompt or adjust tool definitions to improve accuracy, you need to manually re-test dozens of conversation scenarios to see if things got better or worse. Without automated feedback, prompt engineering becomes guesswork.
  2. **There’s no reliable evaluation framework for voice agent quality.** You can’t run a regression suite before deploying a change. You can’t measure whether your agent handles edge cases correctly across hundreds of scenarios. You can’t catch subtle regressions, like the agent suddenly forgetting to confirm a booking, until a real customer hits them.

If you have 50 conversation scenarios across 3 user personas, you’re looking at 150 manual tests, each taking several minutes of real-time interaction. Run that after every prompt change and you will burn days on QA.

In this post, we walk you through the [Nova Sonic Test Harness](<https://github.com/aws-samples/sample-amazon-nova-sonic-eval-harness>), an open source framework that we built to solve both problems. It serves as a rapid iteration tool for tuning system prompts and tool configurations (run a conversation, see results, adjust, repeat) and as a comprehensive evaluation framework for validating voice agent quality at scale. It runs complete multi-turn conversations with [Amazon Nova Sonic](<https://docs.aws.amazon.com/nova/latest/userguide/speech.html>) automatically, evaluates them using LLM-as-judge techniques, and can even detect cases where the model’s audio output doesn’t match its text output (audio hallucinations). No microphone required.

## Why speech-to-speech testing is different

If you’ve tested text-based large language models (LLMs) before, you might wonder why you can’t just adapt those tools. Here’s what makes voice agent testing fundamentally harder:

**Bidirectional streaming.** Speech-to-speech models don’t use request-response. They maintain a persistent, full-duplex connection where audio and text flow in both directions simultaneously. Standard HTTP testing tools can’t interact with this protocol.

**Non-deterministic responses.** Ask the same question twice and you will get different wording, different audio timing, even different tool call ordering. You can’t write assertions like “expect exact string X.”

**Multi-turn context.** A single turn tells you almost nothing. The interesting behavior happens across turns: does the model remember what the caller said earlier? Does it follow up appropriately? Does it know when the conversation is done?

**Audio-text divergence.** Speech-to-speech models produce text and audio at the same time, and they can say different things. The text might read “3:00 PM” while the audio says “3:30 PM.” You can’t catch this by reading transcripts alone.

**Session limits.** Connections time out after about 8 minutes. If your test conversation is longer, you must handle reconnection and history replay.

The test harness handles all of these. Let’s look at how it works.

## How the test harness works

At a high level, the harness does four things: it configures a test scenario, runs a full conversation with Nova Sonic, evaluates the result, and produces a report. The entire pipeline runs unattended. You define the scenario in a JSON file and come back to the results.

_Figure 1: Architecture overview. The test harness coordinates a user simulator, Nova Sonic, and an LLM judge across AWS services._

Let’s walk through each phase.

### Defining a test scenario

Every test starts with a JSON configuration file. Think of it as describing a conversation scenario: who is Nova Sonic pretending to be, who is the caller, what tools are available, and what does “success” look like?

Here’s a real example, testing an appointment booking agent:
    
    
    {
        "test_name": "healthcare_appointment_booking",
        "sonic_system_prompt": "You are the receptionist at Dr. Smith's office...",
        "sonic_voice_id": "tiffany",
        "sonic_tool_config": {
            "tools": [{"toolSpec": {"name": "checkAvailability", "..."}}]
        },
        "user_model_id": "claude-haiku",
        "user_system_prompt": "You are a patient calling to book an appointment...",
        "max_turns": 8,
        "auto_evaluate": true,
        "evaluation_criteria": {
            "user_goal": "Book an appointment for next Tuesday",
            "evaluation_aspects": ["Goal Achievement", "Response Accuracy", "Tool Usage", "Conversation Flow"],
            "rubrics": {
                "Goal Achievement": [
                    "Did the agent confirm a specific date and time?",
                    "Did the agent collect the patient name?"
                ]
            }
        }
    }

The key insight is that you’re defining _goals_ and _evaluation criteria_ , not expected outputs. Because Nova Sonic responds differently every time, we evaluate against rubrics rather than checking for exact strings.

A model registry (`models.yaml`) maps short aliases like `claude-haiku` to full Amazon Bedrock model IDs, so configurations don’t break when model versions change.

## 深度分析

1. **语音测试与文本 LLM 测试有根本性差异**。语音到语音模型测试无法复用传统 HTTP 测试工具，核心挑战包括：双向流式传输（全双工连接）、非确定性响应（相同输入产生不同输出）、多轮上下文记忆、以及最危险的音文分歧（Audio-Text Divergence）——模型可能说出与文本输出一致的信息，却说出完全不同的数字或日期。这意味着基于断言的文本测试范式完全失效。

2. **LLM-as-Judge 的分层评估架构有效应对非确定性**。Test Harness 采用 Critical / Important / Advisory 三层指标体系，将"Goal Achievement"和"Response Accuracy"设为关键指标——必须全部通过才能得到 PASS 结论，而"Voice Formatting"等建议级指标仅作报告用途。这种设计在保证核心质量判断的同时，为非确定性响应提供了合理的评估弹性空间。

3. **SessionContinuationManager 将复杂的长对话处理透明化**。Nova Sonic 的 ~8 分钟连接超时是一个容易被测试编写者忽视的细节。Test Harness 在第 6 分钟自动创建新会话并重放历史上下文，测试场景代码无需感知这一过程。这是框架封装复杂性的典范案例。

4. **Audio Hallucination 检测需要多服务链式调用**。检测音文分歧涉及 S3 上传音频 → Amazon Transcribe 转录 → LLM 比对文本输出与实际语音内容三个步骤。虽然链路较长，但在医疗、金融等传达具体事实（时间、价格、药物名称）的场景中，发现一次 hallucination 就可能防止一次用户损失。

5. **输入模式选择本质上是一种测试经济学决策**。Text（最快，支持最高并行度）、Polly TTS（测试完整 ASR  pipeline）、Scripted（精确可重现）、Dataset-driven（大规模基准评估）四种模式覆盖了从快速迭代到合规验证的完整测试生命周期。

## 实践启示

1. **生产级语音代理必须启用 Audio Hallucination 检测**。在医疗预约、银行转账、订单确认等场景中，一次数字/日期/名称的音文分歧可直接导致用户损失。该功能依赖 Amazon S3 + Amazon Transcribe + LLM 三步链路，建议在上线前作为必选评估项纳入 CI pipeline。

2. **为垂类场景构建自定义 Rubric 是评估质量的关键差异化**。内置六指标体系是通用基准，但医疗场景需验证保险信息、银行场景需验证转账金额确认步骤。自定义 Rubric 问题可精确捕获领域特定的质量缺陷。

3. **使用内置 Scenario Pack 快速建立评估基线**。框架提供 12 个医疗场景、8 个银行场景、5 个客服场景开箱即用。在自建场景之前，先用这些预制场景建立 pass rate 基线，能快速发现 Nova Sonic 在特定领域的系统性弱点。

4. **将 Test Harness 集成到 CI/CD 的质量门禁**。PASS/FAIL 二值输出和 numeric pass rate 设计可直接作为自动化部署条件。对每次 prompt 或 tool config 的变更跑一遍 batch eval，可在上线前捕获回归性问题。

5. **单次测试结果不足以代表质量——对关键场景使用 `--repeat N` 测量方差**。由于 Nova Sonic 响应具有非确定性，单次运行结果可能存在偶然性。建议对核心场景至少重复 3-5 次，观察 pass rate 稳定性后再判断变更质量。

## 相关实体
- [Real Time Voice Agents With Stream Vision Agents And Amazon Nova 2 Sonic](ch04/503-agent.md)
- [Scalable Voice Agent Design With Amazon Nova Sonic Multi Agent Tools And Session](ch04/503-agent.md)
- [Build Real Time Voice Streaming With Amazon Nova Sonic And Webrtc](ch11/248-amazon-nova.md)
- [Restrict Access To Sensitive Documents In Your Amazon Quick Knowledge Bases For  2](ch11/197-amazon-quick.md)
- [Bedrock Agentcore Coding Agent Hosting](ch09/043-coding-agent.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/evaluation-benchmarks-extended.md)

---

