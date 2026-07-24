---
source_url: "https://mp.weixin.qq.com/s/xZrMucZ4O5nMbGcc66H18g"
source_title: "深度拆解SkillCorpus：首个大规模智能体开源Skill筛选框架"
source_author: "模智空间"
source_date: "2026-07-24"
ingested: "2026-07-24"
sha256: "29b979b159a05ab26d2b155400e17fdcd0ee7cceaff98136a04ebbabcb9ba5bb"
source_type: "weixin"
---

# 深度拆解SkillCorpus：首个大规模智能体开源Skill筛选框架

**作者:** 模智空间
**时间:** 2026年7月24日 16:25

SkillCorpus 是一个大规模智能体 Skill 筛选框架，从 82 万+ 社区技能文档中经多层流水线清洗、去重、安全质检与分类评级，最终沉淀 96,401 份标准化 Skill，并配套专属检索匹配系统。

## 六阶段构建流水线

1. **结构/格式检查**：筛选标准 SKILL.md 格式、合理长度
2. **去重**：精确匹配 + 语义匹配 + LLM 判定，去除 64% 候选者（82 万份中近 60% 重复）
3. **质量打分**：AI 裁判从三个维度打分——Utility（实用性）、Robustness（鲁棒性）、Safety（安全性）
4. **安全与授权**：5 条硬性安全规则（命令注入/提示词注入/危险执行/权限绕过/违法内容），仅保留 MIT/Apache 2.0 协议
5. **归类入库**：打标签 + 向量化

最终 96,401 条技能分为 16 大类：Dev 开发(22.4%)、Data 数据处理(14.1%)、Writing 文稿写作(8.2%)、DevOps-Infra(7.8%)、Multimedia(7.5%)、Testing(6.4%)、AI-ML(5.5%)等。

## 三级检索系统

1. **粗筛**：根据任务描述快速捞出数百个候选
2. **精排**：精细排序模型打分排序，取 Top 几十
3. **LLM 精准筛选**：大模型通读完整 Skill，返回 0-2 条真正适配的技能

## 评测结果

407 个真实任务，3 套基准（SkillsBench/QwenClawBench/GDPVal），2 套框架（Raven/OpenClaw），2 款开源大模型 + Claude Opus：

- SkillsBench：平均 +7.5%，Raven + 397B 模型 +13.4%，Claude Opus +8%
- QwenClawBench：平均 +2.79
- GDPVal：平均 +1.51（天花板效应）

关键发现：
- **Harness 执行逻辑决定涨幅**：Raven 执行「推理→运行脚本→校验→修正」完整闭环，提升远高于 OpenClaw（写完代码就终止、不校验）
- **Skill 覆盖度直接决定涨幅**：高匹配 +25.1%，中匹配 +6.2%，低匹配 +2.2%
- **流程适配度 > 质量分数**：匹配的 Skill 能救回失败任务（工业故障标准化），不匹配的 Skill 会限制模型自主创新，降低效果（PPT 内嵌 Excel 修改任务）
- **局限性**：打分依赖 LLM 文本判断无沙箱实测、仅英文场景、静态快照无更新机制

