---
title: ai-production-development-workflow-openspec-superpowers-gstack
source_url: https://mp.weixin.qq.com/s/X-NKySPzSVs6zhvDkMpbBg
publish_date: 2026-05-07
tags: [wechat, article, agent, harness, multi-agent, coding]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 393158150b2b3794736d9583ea2b5ec4c5d8565348509c845d8695ffebdff0a6
---
## 文章概要
笨小葱的实验结论：通过匹配的 Skill 组合、严格的开发规范及 Harness Engineering 方法，能够推动 AI 产出持续向项目需求收敛。核心三件套：OpenSpec（需求层）+ Superpowers（执行层）+ gstack（验证层）。
## 三大痛点
| 痛点 | 描述 |
|------|------|
| **需求理解偏差** | AI 写出来后发现跟想的不一样，返工 |
| **执行过程黑盒** | AI 写了什么、怎么写的、测了没有，难以把控 |
| **缺乏真实环境验证** | 页面渲染、接口连通、部署后表现，AI 自己验证不了 |
## 三件套
### OpenSpec — 规范驱动开发（需求层）
**核心：双文件夹模型**
```
openspec/    # 当前系统的事实来源（规范文件）
specs/       # 每次变更的完整提案
changes/     # 变更提案目录
```
**每份变更包含三个文件：**
| 文件 | 内容 |
|------|------|
| `proposal.md` | 为什么要做（背景、目标、成功标准）|
| `design.md` | 技术方案（架构决策、接口设计、数据流）|
| `tasks.md` | 实施清单（可执行的具体任务）|
这三份文档是 AI 和人之间的**契约**，AI 在动手写代码之前先在文档里对齐需求。
**实测效果：**
- Token 消耗降低 30%~50%
- 返工率下降 60% 以上
### Superpowers — 强制流程约束 AI 执行（执行层）
**7 步不可跳过工作流：**
| 步骤 | 做什么 | 为什么重要 |
|------|--------|----------|
| 1 | brainstorming | 苏格拉底式提问，澄清任务细节，暴露隐藏假设 |
| 2 | git worktree | 创建隔离分支，保护主分支 |
| 3 | writing-plans | 拆解为 2-5 分钟可执行小任务 |
| 4 | subagent 执行 | 每个任务派独立子代理，隔离上下文 |
| 5 | TDD 循环 | RED → GREEN → REFACTOR，每段代码有测试覆盖 |
| 6 | 代码审查 | 两阶段：规范合规 + 代码质量 |
| 7 | 分支收尾 | 验证测试、合并决策 |
**关键原则：每一步都不可跳过。**
### gstack — 执行工具封装（验证层）
不做决策，只帮你干活：
| 命令 | 功能 |
|------|------|
| `/browse` | 浏览器截图、元素检查、用户流验证 |
| `/qa` | 端到端 QA 测试 |
| `/ship` | 发版流程（检测 base、跑测试、review diff、写 CHANGELOG）|
| `/land-and-deploy` | 合并 PR、等 CI、验证生产环境 |
| `/canary` | 上线后监控错误和性能回归 |
| `/careful` | 危险命令拦截（rm -rf、DROP TABLE、force-push 等）|
## 数据流与分工边界
```
需求输入
    ↓
OpenSpec → proposal.md / design.md / tasks.md
    ↓
Superpowers → brainstorming → worktree → 小任务 → subagent → TDD → review → 分支收尾
    ↓
gstack → /browse 截图验证 → /qa 端到端测试 → /ship → /land-and-deploy → /canary
    ↓
生产上线
```
**分工边界（三不原则）：**
- OpenSpec **只产出规范文档，不写代码**
- Superpowers **只按规范执行编码流程，不直接操作浏览器或部署**
- gstack **只做验证和交付动作，不参与需求分析或架构决策**
三者之间通过**文件和命令**传递信息，不是通过共享内存或隐式状态。
## 关键要点
1. **三件套缺一不可**：需求没对齐 → 返工，执行没规范 → 质量差，验证没工具 → 上线踩坑
2. **OpenSpec Token 降低 30~50%，返工降低 60%**（实测数据）
3. **Superpowers 每步不可跳过**——这是生产环境的底线，不是官僚主义
4. **gstack 填补了"AI 写完代码但无法验证页面渲染"的空白**
5. 与 Harness Engineering 一脉相承：通过 Skill 组合 + 开发规范 + 流程约束推动 AI 产出收敛
## 相关链接
- 参考：[[concepts/harness-engineering-framework]]
- 参考：[[concepts/coding-harness-engineering]]