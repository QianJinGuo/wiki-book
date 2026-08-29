# Skill 编排的 6 种依赖关系

> 📊 Level ⭐⭐ | 3.0KB | `entities/skill-orchestration-6-dependencies.md`

# Skill 编排的 6 种依赖关系

## 摘要

系统性梳理多 Skill Agent 系统中的 6 种依赖关系：数据依赖（context 传递）、顺序依赖（前缀 vs 动态规划）、工具/环境依赖（注入思维）、版本依赖（文件名版号）、权限依赖（auth 优先）、循环依赖（线性天然免疫）。核心原则：context 是 skill 之间唯一的信息通道；敏感信息走代码变量层不走 context。

## 核心要点

1. **数据依赖**：context 追加是朴素解法，超过 5-7 个 skill 需摘要压缩，应对 lost-in-the-middle
2. **顺序依赖**：固定流程用文件名数字前缀（01_/02_），分叉路径用动态规划层——不要过早设计
3. **工具依赖**：依赖注入——context 开头注入环境快照，skill 保持无状态；密钥脱敏避免通过 context 泄露
4. **版本依赖**：文件名带版本号（v1/v2），同时解决「用新不用旧」和「可回溯回滚」两个需求
5. **权限依赖**：auth skill 永远第一个跑，但鉴权 token 不进 context（模型可见）——通过代码变量层传递

## 深度分析

### context 作为唯一信息通道的双刃剑

context 的追加式增长是所有 skill 编排方案的基础假设，但它的天花板在实践中被低估：5-7 个 skill 后，模型对中间信息的关注度急剧下降。摘要压缩不是可选项，而是必选项。

### 敏感信息的「通道选择」

文章区分了「给模型看的」和「给程序用的」两条通道：context 是前者，代码变量是后者。API 密钥、鉴权 token 等敏感信息应走后者，避免模型在生成回复时意外泄露。这一原则在工具环境依赖和权限依赖中都将复用。

## 实践启示

1. 固定的多 skill 流程先用数字前缀排序——透明可读，比动态规划更值钱
2. 超过 5-7 个 skill 的链条必须考虑摘要压缩
3. 敏感信息走代码变量层，不走 context 层
4. 文件名版本号是简单但有效的版本管理——保留历史才有回滚能力

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)

---

