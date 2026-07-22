---
source: wechat
source_url: https://mp.weixin.qq.com/s/JV4-oPP0jjsBCZ4tW3Gy1g
author: stevenpxiao/腾讯技术工程
date: 2026-05-11
title: "Harness不是目的，知识才是护城河 —— 一个AI工程交付团队的知识沉淀实践"
type: raw
tags: [knowledge-management, harness-engineering, tencent, workflow, team-practice]
review_value: 9
review_confidence: 8
review_recommendation: very-strong
review_stars: 5
ingested: 2026-05-11
sha256: d82cc80d3b9ab66a5c23c033c8b77c2956c3eedf13eeac65cfda8392751f213e
---
# Harness不是目的，知识才是护城河 —— 一个AI工程交付团队的知识沉淀实践
## 核心论点
**"工作流只是管道，知识才是流过管道的活水。"**
- 模型/工具链/工作流会迭代重构，但团队在特定业务领域积累的领域模型、架构决策、最佳实践、已知陷阱、业务流程——这些知识是永恒的，不会因模型换代而失效。
- **Skill、Agent、工具链会随模型迭代更新，但领域知识是永恒的。**
## 一、三大标志性 Harness 实践对比
| 实践方 | 核心关注 | 关键动作 |
|---|---|---|
| OpenAI — Codex | 人机交互协议 | 零手写代码，通过精确的指令协议驾驭 Agent |
| Cursor — Self-Driving | 多 Agent 协同 | 背景 Agent 自动检测冲突并运行测试 |
| Anthropic — Claude Code | 长时运行稳定性 | 多层记忆系统 + CLAUDE.md 约束 |
## 二、Harness Engineering 三支柱（知识位置）
| 上下文工程 | 架构约束 | 持续治理 |
|---|---|---|
| 长/短期记忆、**知识检索注入**、渐进式披露、上下文防火墙 | Agent 编排模式、状态机设计、降级策略、安全边界 | 质量门禁、**知识生命周期**、**自动衰减**、持续进化 |
**知识管理本身就是 Harness Engineering 的核心能力，而不是附属品。**
## 三、核心论点：为什么知识沉淀比工作流更重要
### 3.1 工作流是"可替换的"，知识是"可累积的"
今天用 16 阶段状态机，明天可能用 DAG 编排。但"广告预算扣减在高并发下会超扣，需用 Redis+Lua 保证原子性"——这条知识不管工作流怎么变都有价值。
### 3.2 没有知识沉淀的工作流是"一次性"的
团队搭了复杂的 Agent 工作流，但每次从零开始。上一次踩过的坑，下一次照踩不误。这就是**没有知识闭环的工作流**——投入了工程成本，却没有让工具链变得越来越聪明。
### 3.3 知识是团队的"复利资产"
三类知识：
- **散点型知识**：孤立的事实
- **因果型知识**：A 导致 B 的推理链
- **时空型知识**：特定场景和时间窗口下才成立的经验
## 四、知识分层架构：五层存储 × 五种类型 × 三级成熟度
### 4.1 五层存储架构
| Layer | 定义 | 说明 |
|---|---|---|
| Layer 0-P | 个人偏好 (~/.ai-team/) | 纯本地，不共享（缩进风格、函数式 vs OOP） |
| Layer 0-T | 团队约定 (team-conventions/) | 团队级，Git 共享（代码规范、Commit 规范、Review 标准） |
| Layer 1 | 技术知识 (tech-wiki/) | 团队级，跨项目（Spring Boot 多租户设计模式、Optional 依赖传递陷阱） |
| Layer 2 | 业务知识 (biz-wiki/{domain}/) | 团队级，按领域（广告审核流程：提交→机审→人审→上线） |
| Layer 3 | 项目知识 (docs/knowledge/) | 项目级（当前项目数据库版本等） |
**知识可以"向上提升"**：Layer 3 的项目知识如果跨项目通用，会自动提升到 Layer 1 或 Layer 2。
### 4.2 五种知识类型（MECE 原则）
| 类型 | 定义 | 示例 |
|---|---|---|
| model | 实体定义、数据结构、关系图 | "广告计划包含预算/出价/投放时段三个核心字段" |
| decision | 技术选型、架构决策及理由 | "选择事件驱动而非 RPC 同步，因为广告状态变更需要解耦" |
| guideline | 推荐做法或禁止做法 | recommend: "公共模块变更后的兼容性检查清单" |
| pitfall | 已知风险、故障模式、排查步骤 | "广告预算扣减在高并发下会超扣" |
| process | 业务流程、状态机、操作步骤 | "广告审核：提交→机审→人审→上线" |
### 4.3 三级成熟度 + 自动衰减
```
draft（新提取，单一来源）
  ↓ 在 1 个工作流中被成功引用
verified（单项目验证）
  ↓ 在 ≥2 个不同项目中被验证
proven（成熟/可信赖）
```
**自动衰减机制**：
- proven 条目 12 个月未被引用 → 降级为 verified
- verified 条目 6 个月未被引用 → 降级为 draft
- draft 条目持续未引用 + Lint 标记 → 归档，移出活跃索引
借鉴 Karpathy LLM Wiki 的 **Lint 操作**：定期识别矛盾、孤儿页、缺失交叉引用和数据缺口。
## 五、团队知识库设计
### 独立 Git 仓库（知识的"单一事实来源"）
```
team-knowledge.git
├── knowledge-catalog.md          ← Agent 查询入口
├── .knowledge-config.yaml        ← 团队配置
├── team-conventions/            ← Layer 0-T
├── tech-wiki/                   ← Layer 1
│   ├── catalog.md
│   ├── patterns/TK-PAT-001.md
│   └── anti-patterns/TK-AP-001.md
├── biz-wiki/{domain}/           ← Layer 2
│   ├── catalog.md
│   ├── entities/BK-AD-E001.md
│   └── pitfalls/BK-AD-P001.md
├── project-profiles/
└── contributions/
    ├── pending/
    └── conflicts/
```
**独立仓库的三个理由**：跨项目共享、生命周期独立（业务项目归档但知识不消失）、权限独立。
### 三种团队角色
| 角色 | 权限 | 人群 |
|---|---|---|
| maintainer | 裁决冲突、审批 proven 提升、管理成员 | 团队负责人、资深工程师 |
| contributor | 通过工作流自动贡献 | 正式团队成员 |
| reader | 只消费不贡献 | 新成员试用期 |
### 区块链三思想借鉴（用 Git 实现）
| 区块链思想 | AI Team 实现 | 机制 |
|---|---|---|
| 不可篡改追加日志 | log.md 只追加不修改 | 每条变更记录贡献者、时间、会话哈希 |
| 贡献可溯源 | evidence.contributors[] | 类似 Git blame，粒度为知识条目级 |
| 共识机制 | maturity 多人验证提升 | draft→verified: 1人验证；verified→proven: ≥2人 + ≥2项目 |
## 六、工作流如何服务于知识沉淀
### 知识的完整生命周期：三通道沉淀
```
/flow-import（冷启动）           /flow-run（每次需求）
     │                                │
     ▼                                ▼
冷启动导入                          INIT: git pull 知识仓库
3 Agent 管道                        + 注入查询入口
→ 知识写入团队仓库                       │
                                      ▼
                              各阶段按需查询（渐进式索引）
                                      ▼
                              ARCHIVE: 知识提取 + 提升判定
                                      │
                              Layer 3: docs/knowledge-base/
                              Layer 1: tech-wiki/  ← git push
                              Layer 2: biz-wiki/  ← git push
                                      │
                                      ▼
                              下一个人的 /flow-run 自动受益
```
**三个关键时刻**：
1. **INIT 阶段**：自动 git pull 团队知识仓库，新工作流自动站在前人肩上
2. **各阶段执行中**：Agent 在决策点按需查询知识库（预算控制，精准而非贪婪）
3. **ARCHIVE 阶段**：@archiver 自动从全流程产物中提取知识条目 → decision / pitfall / guideline，执行提升判定
### 各阶段 Agent 查询预算
| 阶段 | 查询焦点 | 重点知识类型 |
|---|---|---|
| ANALYSE_PRODUCT | 业务知识 + 历史需求 | model, process, pitfall |
| ANALYZE_TECH | 技术知识 + 归档索引 | decision, guideline(avoid), pitfall |
| ARCHITECT | 架构模式 + 实体关系 | decision, model |
| IMPLEMENT | 编码实践 + 团队约定 | guideline, pitfall |
| BUILD_VERIFY | 反模式库 | pitfall, guideline(avoid) |
### /flow-import 冷启动（3 Agent 管道）
```
@doc-collector → 多源资料收集
  │（Git/TAPD/iwiki/本地文档/口述）
  ↓
@codebase-profiler → 代码画像
  │（技术栈/模块/依赖/模式，60次搜索预算）
  ↓
@knowledge-builder → 知识标准化
  （4维基线 + ≤13条知识条目 + 归档总结）
```
所有产出初始 maturity 为 draft，后续工作流逐步验证提升。
## 七、知识按需消费：三级渐进式索引
借鉴 Karpathy 的 LLM Wiki Pattern：
| 层级 | 文件 | 大小 | 作用 |
|---|---|---|---|
| Layer A: 全景目录 | knowledge-catalog.md | ~50行 | "知识库有什么？"——分类统计 + 按阶段推荐查阅路径 |
| Layer B: 分类清单 | 各目录下的 catalog.md | ~100-300行 | "这个分类有哪些条目？"——每条一行摘要 |
| Layer C: 完整条目 | TK-*.md / BK-*.md | ~50-200行 | "这条知识说了什么？"——完整内容 + 背景 + 适用场景 |
**渐进查询流程**：全景目录(~50行) → 分类清单(~300行) → 完整条目(按需) → 原始产物(深入可选)。
对比一次性推送 50 条完整知识（5000-10000 行），上下文效率提升一个数量级。
### 知识引用追踪闭环
Agent 查询知识后在输出产物中记录引用：
```json
{
  "knowledgeReferences": [
    { "id": "TK-SB-003", "title": "分页查询延迟关联优化", "usedIn": "复用评级 Step 2" },
    { "id": "BK-AD-G004", "title": "广告预算扣减并发控制规则", "usedIn": "业务规则参考" }
  ]
}
```
ARCHIVE 阶段批量更新 evidence.last_referenced → 被引用知识 maturity 自动提升，长期未引用自动衰减。
## 八、突破人机交互瓶颈：随时随地工作流流转
### 问题：Harness 工作流的"在场依赖"
典型工作日：8 小时工作中真正能坐在工位操控 Agent 的不到 4 小时。会议、通勤、吃饭时工作流就卡住。
### 解法：远程操控 + 跨设备接管（Hapi 内网版）
- 跨设备会话接管：手机/平板/电脑均可接管同一 Agent 会话
- 24 小时待机：开发机上的 Agent 持续运行
- PWA 原生体验：安装到桌面后像原生 App
- 多助手切换：支持 Codebuddy/Codex/Gemini 等
### 核心能力矩阵
| 能力 | 说明 | 对 Harness 工作流的意义 |
|---|---|---|
| 跨设备会话接管 | 手机/平板/电脑均可接管 | 工作流不因设备切换而中断 |
| 24 小时待机 | 开发机 Agent 持续运行 | 工作流可以 7×24 小时流转 |
| 自主模式 | YOLO 模式让 Agent 自主执行 | 减少人工确认频率 |
### 异步审批设计原则
- **状态持久化**：文件系统即状态机，不依赖内存或特定进程
- **断点恢复**：每个阶段入口/出口有明确持久化产物
- **异步审批**：Agent 提交产物、暂停等待，人类任意时间审批后继续
- **通知触达**：关键节点通过企业微信等渠道主动推送
## 九、落地经验
### 知识膨胀治理：Lint 机制
| 检查项 | 处理方式 |
|---|---|
| 索引不一致 | 自动修复 |
| 孤儿条目（无引用、无验证） | 降级为 draft |
| 矛盾检测（同主题相反结论） | 标记冲突，等待 maintainer 裁决 |
| 过时检测（6月未引用的 draft） | 自动归档 |
| 重复/相似条目 | 标记合并候选 |
| 成熟度衰减 | 按规则自动降级 |
Lint 触发：每完成 10 个工作流自动触发、/knowledge lint 手动触发、连续 30 天未执行时在下次 /flow-run 启动时提醒。
### Big Model vs Big Harness：务实立场
- 模型能力提升是大势所趋，但对模型能力提升应保持开放
- 再强的模型也不知道你的业务系统有哪些隐藏的坑
- **知识工程的投入是确定性回报**：每沉淀一条 proven 知识，所有后续工作流都受益
## 十、文件系统即状态机哲学
AI Team 的设计哲学：所有状态、产物、知识都以 Markdown 文件形式存在，没有数据库、没有独立平台。
- **可见性**：人可直接阅读、编辑、审查
- **可版本化**：Git 管理天然有版本历史
- **可迁移性**：不依赖任何特定平台，换工具链时知识不丢失
- **IDE 原生**：.codebuddy/ 目录驱动，IDE 原生识别
## 核心结论
**工作流是手段，知识是目的。**
- Skill、Agent、工具链会随模型迭代更新，但领域知识是永恒的
- AI Team 的每次交付都自动沉淀知识到团队共享仓库
- 新工作流启动时自动站在前人肩上
→ [[raw/articles/tencent-knowledge-harness-practice|腾讯知识沉淀体系（同一作者上篇）]]