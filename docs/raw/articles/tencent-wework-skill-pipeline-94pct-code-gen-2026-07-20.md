---
title: "AI代码生成率94%：用一个 Skill 跑通需求开发全流程"
source_url: "https://mp.weixin.qq.com/s/mGGIbFyF4U1PrBJVdfgcvg"
source_account: "腾讯技术工程"
author: "企业微信团队 - gomezlai"
ingested: 2026-07-22
type: raw-article
tags: [skill, pipeline, requirement-development, enterprise-ai-coding, tencent, wework, verification, knowledge-transfer]
review_value: 8
review_confidence: 8
review_vxc: 64
review_decision: entity
sha256: 6b42241a31056df850119b022906c6afeec19292854fb1f61cbbfc37f75cc90f
---

# AI代码生成率94%：用一个 Skill 跑通需求开发全流程

> **来源**：腾讯技术工程，企业微信团队 gomezlai，2026-07-20
> **评分**：v=8, c=8, v×c=64 → **新 Entity**

## 核心问题

企业级移动端开发的六大真实痛点：
- **上下文塞不下**：9000+ 源文件、跨 5~6 层调用
- **物料分散**：PRD 在 TAPD、设计稿在 Figma、协议在企微文档、UI 看 Figma Token
- **命名不一致**：用户说"邮件点击入口"，代码里叫 didSelectRowAtIndexPath
- **模糊指令**：用户一句"按 PRD 改一下"，AI 跳过拆解直接改代码
- **验证不闭环**：AI 报"完成"，编译都没过
- **跨会话失忆**：上一次的设计决策、改了哪些文件、为什么改，下一次全忘

## 8 阶段 Skill 流水线

Skill 的核心是一条严格顺序的流水线，命名约定「阶段·动作」式（如设计稿·脚本筛选、拆解·TAPD收料）。

| 阶段 | 输入 | 关键产出 | 灵魂动作 |
|------|------|----------|----------|
| ① 设计稿 | Figma 链接 | 候选稿清单 + PNG 概览 | **脚本化直方图筛选**，绝不允许 LLM "手感"分桶 |
| ② 拆解 | PRD + 设计稿 + CGI + TAPD | 五列需求清单 + subtasks.json 接力台账 | **多源收料 + 归宿校验**，每张设计稿必须归到三类之一 |
| ③ 定位 | 需求点 | 文件 + 行号 + 调用链 | **五步定位法** |
| ④ 实现 | 调用链 + 上下文 | 代码改动 | **自底向上**：数据 → 解析 → 枚举 → 业务 → UI → 日志 |
| ⑤ 验证 | 源码改动 | 编译报告（退出码 0） | bazel build + 最多 3 轮自修复 |
| ⑥ 模拟器验证 | 编译产物 | 装机后截图 + 日志 | "人机秒级确认 + 阶段内重试 ≤ 2 轮" |
| ⑦ 沉淀 | git diff + 时间线 | TECH_SPEC.md 单一事实源 | **跨会话知识传承的载体** |
| ⑧ 提交 | 全部产物 | git commit + 分支 | 三段式 commit + AI 署名 + 代码生成率 |

## 关键技术点

### 五步定位法（阶段③）
逐层收敛到需改动的区域：
1. 配置层 → 2. 基础能力层 → 3. 业务组件层 → 4. 页面展示层 → 5. 事件处理层

### 自底向上实现顺序（阶段④）
数据 → 解析 → 枚举 → 业务 → UI → 日志，确保每层改动都有下层支撑。

### 脚本化直方图筛选（阶段①）
对 Figma 设计稿按尺寸规格做直方图统计，自动筛选出移动端候选稿，避免 LLM 凭感觉分桶。

### 跨会话知识传承（阶段⑦）
TECH_SPEC.md 记录本次改动的设计决策、文件清单、调用链和回退方案，下次会话自动加载，解决跨会话失忆。

### 代码生成率统计（阶段⑧）
基于 git diff 的行级分析，区分 AI 生成行 vs 人工修改行，量化每轮开发的代码生成率（94%）。

## 结果数据
- 代码生成率：94%
- 编译通过率（bazel build + 自修复）：显著高于无 Skill 基线
- 跨会话知识传承：TECH_SPEC.md 打通了多会话间的工程记忆
