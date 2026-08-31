---
title: "zg（zvec-grep）正式开源：本地检索，不止于关键词"
source_url: "https://mp.weixin.qq.com/s/Kqi13mAjN_Rh3EvN8TjWHg"
author: "阿里技术（飞鸿）"
ingested: "2026-08-31"
sha256: "02249c4b131906088221633186ac096aae3930a12b884d8ccbb5c782a4c77c07"
source_type: "wechat_mp"
---

# zg 正式开源：本地检索，不止于关键词

> 原文：https://mp.weixin.qq.com/s/Kqi13mAjN_Rh3EvN8TjWHg
> 项目：https://github.com/zvec-ai/zvec-grep

## 概述

zg（zvec-grep）是面向人与 Agent 的本地优先检索基础设施，基于 Zvec 向量检索与 BM25，结合 ripgrep（rg），从代码、文档等本地内容中提取并组织信息。通过 CLI 与 MCP 提供语义检索、BM25、混合检索和 rg 精确匹配能力。

**核心问题**：Agent 处理复杂任务时，检索输入从明确符号转变为自然语言描述，与代码/文档实际表述缺乏词汇对应。仅依赖文本匹配容易遗漏，扩大搜索又产生大量无排序结果。Agent 需多轮构造查询、执行搜索、读取文件，增加调用/时间/上下文消耗。

## 设计目标

- **全流程检索**：语义检索→BM25→混合检索→rg 精确匹配，覆盖从模糊探索到精确验证
- **多文件格式**：代码（C/C++/Go/Java/JS/TS/Python/Rust/Vue/Svelte）、文档（Markdown/RST/HTML/XML）、数据（CSV/JSON/TOML/YAML）
- **上下文高效**：融合排序+紧凑预览+来源保留，减少无关内容消耗
- **本地优先**：文件扫描、索引、Embedding 默认设备内完成，远程需显式授权

## 三步上手

```bash
npm install -g @zvec/zvec-grep  # 安装
zg install                        # 自动发现 Codex/Claude Code/Cursor/OpenCode，配置 MCP
zg index                          # 建立本地索引（默认 local/potion-code-16m-v2，16M 模型，32MiB 缓存）
```

CLI 检索：`zg query --human "theme preference persistence on startup"`
Agent 检索：通过 MCP 直接调用，同一份索引复用。

## 评测结果

### SWE-QA-Bench（20 个真实代码仓库问答）
- 工具调用减少 **>50%**，输入 Token 减少 **~50%**，评审得分提升 **+1.50**

### BrowseComp-Plus（80 个深度研究问题）
- 准确率 98.67% → **99.00%**
- 输入 Token 减少 **37.56%**，工具调用减少 **43.52%**，Agent 耗时减少 **38.58%**

## 本地 Embedding

内置 11 种端侧模型。默认 local/potion-code-16m-v2（16M 级静态模型），在 SWE-QA-Bench 上接近 qwen3.7-text-embedding 效果，Django 仓库（3,457 文件）M4 Pro 索引耗时 <30 秒。

## 未来方向

增强检索能力（图检索+查询规划）、拓展内容边界（PDF/Word/PPT/OCR）、提高上下文效率、增强本地能力（iOS/Android 适配）。
