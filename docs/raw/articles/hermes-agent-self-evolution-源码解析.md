---
title: 拆完Hermes源码发现Agent自我进化不需要训练模型
source_url: https://mp.weixin.qq.com/s/qdycBcCUujnVBkO4vky0wA
author: 刘庭辉
published: 2026-05-12
created: 2026-05-17
updated: 2026-05-17
type: article
tags: [hermes-agent, openclaw, self-evolving, kepa, agent-framework, memory-system, skill-system]
sha256: 4794209df769c3aa01c74b62711c41892dafc8131396b0b9be223cfca3afbfdb
review_value: 7
review_confidence: 7
review_recommendation: worth-reading
---
# 拆完Hermes源码发现Agent自我进化不需要训练模型
## 核心观点
Hermes Agent的核心创新：不是"能做什么"，而是"做完之后会发生什么"。
"所谓的'自动学习'，本质是Prompt Engineering + 文件持久化的一次精妙工程化实践。"
## 01 分歧：做完就走 vs 越用越强
### OpenClaw：全能管家，但记忆像金鱼
- 无状态，每次任务独立执行
- 除非手动配置AGENTS.md/SOUL.md/USER.md，否则不记住偏好
- 不会自动保存工作流经验
### Hermes Agent：不那么全能，但会"长记性"
| 维度 | OpenClaw 🦞 | Hermes Agent ☤ |
|------|------------|----------------|
| 核心哲学 | 全能助手，插件生态 | 自我进化，越用越强 |
| 记忆能力 | 无状态（需手动配置） | 四维持久记忆（自动） |
| 技能管理 | 用户手动安装/编写 | Agent自动从经验创建 |
| 学习方式 | 不学习 | 内置闭环学习系统 |
| 插件生态 | 数千个（ClawHub） | 较少，但在增长 |
| 部署门槛 | 中等 | 极低（5美元VPS） |
| 适合场景 | 一次性任务、多平台集成 | 长期使用、个性化需求 |
## 02 源码拆解：三大核心机制
### 2.1 四维持久记忆系统
```
┌─────────────────────────────────────────────┐
│              Hermes 记忆架构                 │
├─────────────────────────────────────────────┤
│  📋 身份记忆 (IDENTITY)                      │
│  └─ Agent的角色定义、行为准则                │
│                                              │
│  📝 Agent笔记 (MEMORY.md)                    │
│  └─ 用户偏好、项目上下文、经验教训           │
│                                              │
│  ⚡ 程序性记忆 (SKILL.md)                    │
│  └─ 可复用的工作流程、操作步骤               │
│                                              │
│  💬 对话历史 (Conversation History)          │
│  └─ 当前会话的完整上下文                     │
└─────────────────────────────────────────────┘
```
**关键设计：冻结快照模式**
- 每次会话开始时，加载MEMORY.md和SKILL.md作为快照
- 会话过程中文件更新，当前会话看到的仍是开始时的版本
- 保证单次会话内一致性
### 2.2 技能自动创造系统
**传统Agent（OpenClaw）Skill生命周期：**
```
用户编写Skill → 安装到Agent → Agent执行 → 结束
                     ↑
            （用户手动说"更新Skill"才触发）
```
**Hermes Agent Skill生命周期：**
```
Agent执行任务 → 后台自动审查 → 判断是否有价值 → 自动创建/更新Skill
                                                ↓
                                       下次会话自动加载
```
**技能管理操作（skill_manager_tool.py）：**
- create：从零创建新Skill
- patch：精准更新已有Skill的某个部分
- delete：删除不再需要的Skill
每个Skill就是Markdown文件，纯自然语言描述。
### 2.3 KEPA：对"提示"做反向传播
**传统深度学习：**
- 前向传播：输入 → 模型 → 输出
- 反向传播：根据损失函数，更新模型权重
**Hermes的做法：**
- 前向传播：用户意图 → Hermes（LLM+工具）→ 执行结果
- 反向传播：周期性回顾执行过程 → 检测失败点 → 更新Skill/记忆
**关键：不是更新"模型权重"，而是更新"如何使用模型"的策略**
后台审查逻辑（伪代码）：
```python
class BackgroundReview:
    def __init__(self):
        self.tool_call_counter = 0
        self.threshold = 10  # 每10次工具调用触发一次
    def on_tool_call(self):
        self.tool_call_counter += 1
        if self.tool_call_counter >= self.threshold:
            self._spawn_review()  # 启动后台审查
    def _spawn_review(self):
        review_agent = create_agent(
            system_prompt=SKILL_REVIEW_PROMPT,
            tools=[skill_manager, memory_tool],
            max_iterations=8
        )
        review_agent.run(conversation_history)
```
审查Prompt要求判断：
1. 任务是否有试错或中途改变策略？
2. 最终方案是否具有可复用性？
3. 值得保存则调用skill_manager，否则回复"Nothing to save."
## 03 强弱分析
### ✅ 强在哪
1. **零成本进化**：不用收集数据/标注/微调，Token消耗小
2. **可解释可编辑**：Skill是自然语言，可随时查看和手动修改
3. **跨模型迁移**：Skill不依赖特定模型
4. **渐进式积累**：越用越丰富
### ⚠️ 弱在哪
1. **"自动"不等于"准确"**：判断力上限是LLM能力上限
2. **只有复杂任务触发**：简单任务大概率跳过
3. **更新有延迟**：冻结快照机制，下一次会话才生效
4. **生态差距**：OpenClaw有数千插件，Hermes还在早期
## 04 深層思考：学习该谁驱动？
### 用户驱动（OpenClaw）
- ✅ 精确可控
- ✅ 无噪声
- ❌ 成本高
- ❌ 容易遗漏
### Agent自驱动（Hermes）
- ✅ 零维护
- ✅ 兜底能力
- ❌ 有噪声
- ❌ 不可控
**最理想方案：两者结合**
- 核心确定性知识 → 用户显式定义（OpenClaw SOUL.md）
- 隐性经验性知识 → Agent自动积累（Hermes KEPA）
## 05 决策表
| 场景 | 选OpenClaw | 选Hermes |
|------|-----------|----------|
| 需要多平台集成 | ✅ | ⚠️ |
| 需要大量现成插件 | ✅ | ❌ |
| 追求数据完全本地化 | ✅ | ✅ |
| 长期使用希望越用越懂你 | ❌ | ✅ |
| 经常做重复但有微调的任务 | ❌ | ✅ |
| 团队协作统一配置 | ✅ | ⚠️ |
| 预算极低（5美元/月） | ⚠️ | ✅ |
| 想要Agent自动积累经验 | ❌ | ✅ |
> "用完即走"型用户 → OpenClaw
> "长期陪伴"型用户 → Hermes
## 行业意义
**"会长大的软件"**
传统软件：装好什么样就是什么样
Hermes新范式：会随着使用而成长
> "The hottest new programming paradigm is English."
> — Andrej Karpathy
Hermes把这句话推进一步：不仅编程语言变成英语，连"学习"的载体也变成英语。整个"进化"过程没有一行"训练代码"。
也许我们不需要微调模型，只需要让Agent学会"记笔记"。