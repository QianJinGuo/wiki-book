---
source_url: "https://mp.weixin.qq.com/s/tlp_EJuG61OI4_9V0TOrpQ"
source: wechat
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
ingested: 2026-05-23
sha256: ""
---

# 清华连发2篇自进化Skill，Agent彻底活了

**来源：** PaperToday | 2026年5月23日
**核心论文：**
- EmbodiSkill: Skill-Aware Reflection and Evolution for Embodied Skill Self-Evolution（arxiv:2605.10332）
- SkillEvolver: A Meta-Skill for Online Skill Learning from Failures in Agent Self-Evolution（arxiv:2605.10500）

## 核心问题
传统 Agent 依赖静态技能手册——遇到手册未覆盖的新情况就犯错，且每次犯同一个错，只能不断手动更新手册。两篇论文从不同角度攻克**自进化问题**。

## EmbodiSkill：让Agent学会区分"我到底哪里出了问题"

### 核心创新：四种反思类型
Agent 失败后**先判断"是手册写错了，还是我没按手册做"**，而不是无脑改技能：

1. **执行失败反思**：技能操作步骤本身有问题 → 更新操作步骤
2. **规范失败反思**：技能的注意事项/踩坑记录过时 → 更新注意事项
3. **理解失败反思**：Agent 误解了操作意图 → 重写操作意图描述
4. **组合失败反思**：操作步骤和意图描述都正确但衔接有问题 → 重写两者衔接

消融实验证明：去掉任何一种反思都会导致性能明显下降。

### 技能组织结构
技能被组织成 `{意图} + {操作} + {注意事项}` 结构：
- `{意图}` = 核心操作步骤
- `{注意事项}` = 踩坑记录和注意事项

每次反思后，Agent 更新技能的对应部分，进入下一轮 **"执行→反思→更新"螺旋**。

### 性能
- 超过 GPT-5.2 直接执行 **X%**
- 超过 G-Memory **Y%**
- 比技能无感知进化方法相对提升 **Z%**

## SkillEvolver：管理其他技能进化的元技能

### 核心定位
SkillEvolver 本身就是一个**元技能（Meta-Skill）**——一个管理其他技能进化的技能。

### 两个关键创新
**① 方案多样性（Population-based）**：每次迭代不只有一个方案，而是生成**多个候选**（有的激进，有的保守，有的走不同路径），避免 Agent 陷入"每次都用同一个方式失败"的困境。

**② 轨迹对比 + 机械检查**：把成功轨迹和失败轨迹摆在一起对比，从差异中提炼改进点。交给一个 **Validator**，执行 9 项机械检查（格式完整性、一致性、可执行性等），拦截了 **W%** 的低质量更新。

### 关键特性
- 更新的是技能的**参数化表示**，不是模型权重
- 意味着 **Skill-agnostic**（与模型无关，任何 Agent 都能用）

## 总结
- EmbodiSkill：解决"如何判断技能哪里出了问题"（诊断层）
- SkillEvolver：解决"如何自动生成技能改进方案"（生成层）
- 两者结合 → Agent 技能自进化闭环
