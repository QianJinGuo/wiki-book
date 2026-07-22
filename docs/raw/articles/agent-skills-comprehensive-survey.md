---
source_url: "https://mp.weixin.qq.com/s/uVSHYFtwx27t4lEgl-yp6w"
source: wechat
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
ingested: 2026-05-23
sha256: ""
provenance_state: archived
---

# 来了，首篇Agent Skills系统性综述！

**来源：** PaperToday | 2026年5月12日
**论文：** A Comprehensive Survey on Agent Skills: Taxonomy, Techniques, and Applications（arxiv:2605.07358v1）

## 核心框架
技能生命周期四阶段：**表示→获取→检索→进化**

## 技能定义
S = (M, R, C) 三元组：
- M（Main instruction）：主指令文档
- R（Resources）：辅助资源
- C（Condition）：触发条件

## 三种技能类型
- 纯文本型：参考文档、示例、模板
- 纯代码型：可执行脚本、函数
- 混合型：文本 + 代码（Claude Code/Cursor）

## 四条获取路径
1. 人类专家手写（种子层）
2. 从经验中提炼（Voyager/Reflexion/ExpeL）——最主流
3. 遇到新任务时即时构建（CREATOR/ToolMakers）
4. 从外部资料挖掘（冷启动）

## 检索四策略
语义向量/关键词/生成式/结构化检索
**关键：召回率 ≠ 执行成功率**

## 进化五环节
修订→验证→策略耦合→仓库级进化→运行时治理
（含"投毒技能"安全风险警告）

## 技能生态
SkillNet 30万+ / ClawHub 4万+ / SkillsMP 70万+

## 参考
- https://arxiv.org/abs/2605.07358v1
- https://github.com/JayLZhou/Awesome-Agent-Skills
