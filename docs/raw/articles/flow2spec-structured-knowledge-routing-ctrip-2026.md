---
title: "Flow2Spec：在开发过程中自然长出知识图谱的 Agent 工程框架"
source_url: "https://mp.weixin.qq.com/s/enxFJ-bEIvYI_PxuPYRbsg"
publish_date: 2026-07-01
tags: [wechat, ctrip, flow2spec, knowledge-graph, agent, structured-knowledge, routing-protocol, intent-recognition]
review_value: 9
review_confidence: 9
review_recommendation: neutral
sha256: e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7
---

# Flow2Spec：在开发过程中自然长出知识图谱的 Agent 工程框架

作者：Lands（携程高级前端开发工程师）
开源地址：https://github.com/Lands-1203/Flow2Spec

## 核心论点

项目知识不能只靠"写下来"，还要能被路由、被组合、被校验、被持续更新。

Flow2Spec 不是要求你先做一场大规模文档工程。它更推荐的方式是：先初始化空骨架 → 生成架构说明 → 真实需求来了 Agent 按知识路由 → 实现后把确认的事实同步回知识库。知识是在需求澄清、技术方案、代码实现、修复问题、知识同步、提交代码的过程中逐步长出来的。

## 知识库接口：路由协议

```
.Knowledge/
  manifest-routing.json    # 机读路由清单
  matchers/                # 关键词分片
  topics/                  # 主题摘要
  stock-docs/              # 已落地能力长文档
  req-docs/                # 需求/技术方案文档
```

Agent 读取顺序：manifest-routing.json → matcher 分片 → topic 摘要 → topicDependencies → stock-docs/req-docs → 源码兜底。

## 渐进式读取四步

1. **match**：先读 manifest-routing.json，按任务读对应 matcher 分片，缩小候选范围
2. **expand**：通过 topicDependencies 展开依赖主题
3. **verify**：检查知识覆盖是否足够、是否缺关键依赖、是否需要先反问用户
4. **act**：确认可执行后才进入实现/修改

## 多依赖与正确性验证

topic 声明依赖关系，Agent 命中主主题时先展开依赖，确保不读到一半规则。

**知识库正确性验证**：Agent 从源码找到答案后，判断该事实是否已写入 topic。如果没写或不够细，提示用 f2s-kb-distill 提取入库——不让每次新知识只留在本次聊天里。

## 意图识别

f2s-intent 开关：高置信新增→feat，高置信修复→fix，需求不清→req-clarify，询问/讨论→普通对话。

## 五层约束

1. 入口层：声明读取顺序和禁止项
2. 配置层：执行任何技能前先读配置开关
3. 路由层：所有任务先读 manifest，不直接全仓搜索
4. 技能层：每个技能定义前置检查、确认点和收口方式
5. 门禁层：checklist、知识落盘前确认、源码问答强制收口、提交前知识覆盖检查

## 开发闭环

需求 → f2s-req-clarify → f2s-req-tech → Agent 渐进读取 → 实现 → changeTracking → f2s-kb-sync → f2s-git-commit。每步留下可追踪资产。

## 常用命令

/f2s-req-clarify    需求澄清
/f2s-req-tech       生成技术方案
/f2s-kb-feat        新增能力并同步知识
/f2s-kb-fix         修复问题并修正知识
/f2s-kb-add <路径>   解析已有模块入库
/f2s-kb-sync        全局/批量同步到知识库
/f2s-kb-distill     把本轮问答提取入库
/f2s-git-commit     提交前检查
