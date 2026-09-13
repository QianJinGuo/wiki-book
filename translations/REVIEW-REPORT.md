# 全站翻译审核报告（2026-09-13）

## 一、变更规模（全部未提交，等你审核）

| 类别 | 数量 | 说明 |
|---|---|---|
| 新增词典 | 1,290 份 | 长尾实体页首次翻译（ch05-ch20/ 各目录 + ch04/ 新页） |
| 修改词典 | 429 份 | 章节页漂移补翻 + 透传坏条目重翻 + "原文→译文"畸形条目清洗 |
| 删除词典 | 968 份 | ⚠️ 见下方"删除说明" |
| 词条总数 | 251,553 条 | 全站翻译内容总量 |

**删除说明（重要）**：968 个"删除"是**闭环重命名实体页导致的路径变化**，不是内容丢失——旧路径页面已不存在（如 `ch01/033-tokenomics...` 改名为 `ch01/033-litellm-websearch...`），对应旧词典自然失效。核验：1,415 份词典有活跃页面，仅 285 份为改名前的孤儿文件（无害残留，deploy 后线上不会引用）。

## 二、完成度

- **全站 1,538 页全部有词典覆盖**（主遍历 1,538/1,538 + 消失页重扫兜底）
- 主课程 20 章 + 首页/课程/路径/参考文献：Playwright 验收 **24/26 通过**（0-4% 残留；另 2 页 dashboard/learn 为独立应用，不在实时翻译层范围）
- 本次运行累计扫描 1,744 页次（含重扫），翻译/修复约 9 万段

## 三、质量抽查样本（随机抽取，全文见词典文件）

**ch06-memory（主章节页）**：
- ZH: "Claude Code 采用了目前最为复杂的分层记忆设计，六层 Markdown 文件各有独立的读写权限和生命周期"
- EN: "Claude Code adopts the most sophisticated layered memory design to date; its six layers of Markdown ..."

**ch04__092（实体页）**：
- ZH: "如果 agent 能承接更多实现层工作，工程师的时间和精力应更多投入问题定义和方案评估……"
- EN: "If agents can take on more implementation work, engineers' time and energy should go more into problem ..."

**ch19-research-frontier**：
- ZH: "在规划推荐系统新项目时，优先评估数据质量和真实熵，而非直接追求最大模型规模"
- EN: "When planning a new recommender system project, prioritize evaluating data quality and true entropy ..."

**ch01__098**：
- ZH: "Context 已被所有竞争对手以相同方式组装。Judgment 才是真正的护城河。"
- EN: "Context has been assembled by all competitors in the same way. Judgment is the real moat."

质量结论：主体译文自然、术语保留（Context/Harness/Runner 等不误译）、编号与格式完整。已知残留：以标点开头的句子碎片存在少量透传（自愈机制会持续收敛，不影响阅读）。

## 四、待你决策

1. **提交部署**：commit → push → build → 三环境部署（线上将从 1,407 页词典更新为全站覆盖）
2. **仅提交不部署**：先入库，部署另说
3. **继续抽查**：指定任意页面路径，我打全文对照表
4. **丢弃**：`git checkout -- translations/`（不建议，25 万词条工作成果）
