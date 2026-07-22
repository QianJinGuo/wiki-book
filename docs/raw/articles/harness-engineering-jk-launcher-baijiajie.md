---
title: "harness-engineering-jk-launcher-baijiajie"
created: 2026-06-10
type: raw
sha256: 6e34691673cb47cf250ad2978c449297dd8181171207bc4ab3801a6449fbaa68
---
source_url: https://mp.weixin.qq.com/s/77dyufF3MP8stHPS0BApNw
source_title: 万字干货！Harness Engineering如何工程化落地？
author: 白家杰
feed_name: 腾讯云开发者
published: 2026-04-22
scored: v=8, c=7, v×c=56

# 万字干货！Harness Engineering如何工程化落地？

## 核心结论

- Harness Engineering落地关键：Rule/Skill/Sub Agent/Workflow/Scripts/MCP六层串联
- JK Launcher真实工程案例：从0开始搭Harness，第一步做什么，按什么顺序逐步补齐
- 核心问题：理念落地工程第一步？不能只靠提示词和把模型当"更聪明的代码补全"

## 六大核心概念速览

| 概念 | 回答什么问题 | 工程角色 |
|------|------------|---------|
| Rule | 什么事绝对不能乱来 | 基础规矩/红线/底线 |
| Skill | 这件事具体应该怎么做 | 固定动作标准操作手册 |
| Sub Agent | 复杂任务由谁分工处理 | 不同阶段专业角色 |
| Workflow | 这些角色按什么顺序接力 | 前进/暂停/打回/重跑规则 |
| Scripts | 最后谁来判断做没做好 | 统一门禁和事后验证 |
| MCP | AI怎么安全接上外部工程系统 | 外接能力与工具链 |

## Rule（工程规矩）

- 给AI写的一套"工程规矩"，不是需求文档/设计方案/脚本
- 本质：带新人的基础原则——什么能做/不能做/做完必须验证/约定不能绕
- 典型：改完代码必须编译+测试+事后验证，三步不全过不算完成
- 核心作用：帮助AI少犯本来不该反复犯的低级错误，像团队"研发制度"
- 前提：Rule只是软约束非硬门禁，模型可能无视（三种典型情况）

## MCP（Model Context Protocol）

- 把仓库外能力接入AI工作链路的标准方式：拉取信息+触发外部系统动作
- Unity工程场景：对接Unity Editor编译/场景与资产/日志与状态/受控命令
- 没有MCP时AI被锁在：分析/改代码/跑本地验证，难接入CI/签名/制品/发布/回写状态
- MCP是"标准插座"：接什么/接到多细/何时允许，都要被制度与门禁管住
- 当Harness从开发闭环推到交付闭环时，MCP往往变得关键

## Skill（标准操作手册）

- 有些事情不要临场发挥/重新理解/自己猜流程，要严格按照固定步骤执行
- 例：编译Skill——找对MSBuild/日志输出到指定文件/看错误模式
- Rule告诉"这件事必须做"，Skill告诉"这件事具体怎么做"

## Sub Agent（多角色分工）

- 解决单一Agent问题：自己给自己解释/打分/说没问题/硬推任务继续
- 真实研发类比：需求分析/方案设计/开发/QA分离
- 产出写文档，交给下一Agent；不是替代，是接力

## Workflow（接力赛规则）

- 关键不是有四个跑得快的人，而是接棒规则明确
- 三层：给人看的整体链路/给系统看的阶段迁移/给角色看的接棒交棒文档
- 核心：前进/暂停/打回/重跑都有明确依据
- 上下文纪律：每棒只给当前该看的材料，避免上下文过长重点散

## Scripts（最"硬"的门禁）

- Rule告诉AI应该，Skill告诉怎么做，Scripts直接检查做没做到
- 典型总门禁脚本检查项：XAML中文/C#8语法/MessageBox.Show/硬编码UI文案/last_state.json访问/SVN认证参数/测试数量异常减少/.cs漏进.csproj
- 真正成熟的Harness越来越依赖脚本而非提示词

## 六层串联关系

```
Rule → 底线（什么事绝对不能乱来）
Skill → 高频动作标准化（这件事具体怎么做）
Scripts → 判断结果对不对（直接检查）
Sub Agent → 多角色分工（复杂任务谁来处理）
Workflow → 按顺序接力（前进/暂停/打回/重跑规则）
MCP → 往外工程系统延伸（接外接能力）
```

原文：https://mp.weixin.qq.com/s/77dyufF3MP8stHPS0BApNw
