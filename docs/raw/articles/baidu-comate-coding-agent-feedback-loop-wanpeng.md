---
title: "baidu-comate-coding-agent-feedback-loop-wanpeng"
created: 2026-06-10
type: raw
sha256: ba563948f774a0c3bf751289c77ea084dec3d3c488854ad5c2339c4cae7e7493
---
source_url: https://mp.weixin.qq.com/s/rKnNaGJnlfhdIufpGDuHuQ
source_title: Coding Agent在百度的落地实践：从反馈闭环到工程范式重构
author: 牛万鹏（百度文心快码研发经理）
feed_name: InfoQ
published: 2026-05-26
scored: v=8, c=8, v×c=64

# Coding Agent在百度的落地实践：从反馈闭环到工程范式重构

## 核心结论

- 双层Loop架构：内层工具+环境+模型，外层Memory/Skill/Rules/MCP/Agents边界条件
- 框架必须动态适配模型变化，不存在静态框架（DeepSeek XML→FC案例）
- Benchmark关注异常值而非分数，Agent跑完+Agent判定Outcomes/Execution Score
- Skill渐进式 vs MCP全部加载（上下文冲爆），优化后节省98% Token

## 百度内部落地数据

- 每周人均Query次数90余次（截至三月底）
- Comate IDE：用户放弃JetBrains/VSCode迁移，编译调试一并迁移
- 使用者扩展：产品经理/售前工程师/销售人员也开始用Agent做数据分析/项目管理

## 两类Vibe Coding

**第一类：非开发者解决"永远不会被纳入研发排期"的工作**
- 例：产品经理用Agent连接数据库（只读账号）自行SQL查询日活/留存
- 俄乌无人机类比：调用炮兵需师长审批，Agent没有决策链过长问题，不需要整建制研发资源

**第二类：严肃开发**
- 根本变化：开发者从执行者变成问题提出者
- 制约效率的瓶颈从Token价格变成能不能提出一个好问题
- 全栈=角色维度全栈（产品经理Sense+交互视觉Sense+测试边界Sense），不是编程语言层面的

## Query分类分布

- Code Exploration 20%（代码探索/检索/解释）
- Debug（排查错误）
- 实现新Feature（占比最低）

符合工程师直觉：每天真正在做的不是实现新功能，而是研究和排查问题

## 双层Loop架构

**内层Loop**：工具+环境+模型=最基本Agent闭环框架

**外层Loop**：Memory/Skill/Rules/MCP/Agents=边界条件
- Claude Code源码：大量边界条件处理，充斥if-else逻辑
- Harness=帮助Agent完成脏活累活、将边界条件限定好的工程设施

## 框架动态适配问题

- 模型能力变化时框架必须动态调整，根本不存在静态框架
- DeepSeek早期：Function Calling支持不好→走XML路线；去年下半年FC成熟→原框架跟不上了
- Spec Driven已过时：模型解析能力太强，不需要手把手拆解任务，写Query+澄清+计划+执行就够了

## Feedback Loop四层数据

**第一层（工具层）**：调用次数/失败率/自愈比例/Query与ToolCall比例
- 按模型区分，以Claude为标杆对比Kimi/GLM/文心的ToolCall比例

**第二层（上下文层）**：Skill唤起/Memory唤起

**第三层（执行结果）**：
- Agent创建文件后又反复调用工具修改=第一次创建时没分析好，前面问题澄清阶段没想清楚

**第四层（Query执行轨迹质量）**：仍在建设中

## Skill vs MCP

- Skill（去年十月底）：渐进式发现，效果+Token消耗都更优
- MCP（三个Server各十个工具全部传进去）：上下文冲爆，不再渐进式

**优化方案**：Comate为每个MCP生成Skill-like描述，开发者看到的是一个工具。Agent需要用某个MCP时调用Skill工具，按需加载真实MCP。效果：最高节省98% Token消耗

## Benchmark构建方法论

核心观点：关注异常值而非分数
- 同样分数，上次做对的60道和本次做对的60道可能完全不同
- 只关注分数毫无意义

**从业务本身挖掘评测集**：
- Comate每天代码提交→经过人审核的记录→提取Feature→做评测集
- Agent分析Git Log信息提取→人工校验有效性

**Agent判定Outcomes/Execution Score**：
- 由拥有干净上下文的Agent评判另一个Agent的上下文，无亲和性问题
- 六四分（结果权重60%/效率权重40%）
- 四象限：低结果低效率/高结果低效率/低结果高效率/高结果高效率

## 任务复杂度路由

识别Query和任务复杂度，极高→Claude，简单→成本更低的模型

## GPT模型喜欢命令行

- 越到后面轮次命令行工具使用率直线攀升（Sed/Cat）
- Codex CLI只有一个工具就是命令行
- 启发：不要压制模型行为，看异常发现它真正喜欢什么

原文：https://mp.weixin.qq.com/s/rKnNaGJnlfhdIufpGDuHuQ
