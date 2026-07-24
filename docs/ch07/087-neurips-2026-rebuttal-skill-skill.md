# NeurIPS 2026 Rebuttal Skill — 开源论文回复 Skill 工作流

## Ch07.087 NeurIPS 2026 Rebuttal Skill — 开源论文回复 Skill 工作流

> 📊 Level ⭐⭐ | 1.6KB | `entities/neurips-2026-rebuttal-skill.md`

# NeurIPS 2026 Rebuttal Skill — 开源论文回复 Skill 工作流

港大 NLP 组博士生李磊开源了 Rebuttal Skill，可直接加载到 OpenCode、Claude Code、Gemini CLI 等支持 skill 的工具中使用。该 skill 将论文 rebuttal 经验整理为两阶段工作流：第一阶段分析 review 的核心问题与深层次质疑，第二阶段生成结构化的 rebuttal 回复。

## 核心方法

李磊曾在 EMNLP 2023 获最佳长论文奖，2025 年获评 EMNLP 杰出 AC。他将多年审稿经验整理为 skill，强调 rebuttal 应从审稿人和 AC 两个视角理解意见，而非逐条回复。关键原则：

- **合并共同关心的问题**：多位审稿人共同关心的问题合并回答，核心问题放在前面
- **结论和新增结果优先说明**：能补完的实验用数据直接回应，暂时做不完的写清实验设计
- **语气克制、专业**：可以纠正误解，但不要攻击审稿人或要求改分

## 技术特点

项目地址：https://github.com/TobiasLee/Rebuttal-Skill

两阶段工作流设计，帮助作者从审稿意见中识别真正可能影响最终决定的核心问题，避免篇幅越写越长、核心问题被淹没的常见陷阱。

---

