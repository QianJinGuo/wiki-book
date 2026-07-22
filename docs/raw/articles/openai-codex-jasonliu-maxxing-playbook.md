---
source_url: "https://mp.weixin.qq.com/s/sUdAmzf5ymUMBxWKFVxnwg"
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
ingested: 2026-05-23
sha256: ""
---

# OpenAI大神教你如何榨干Codex

**来源：** 量子位 | 2026年5月23日
**核心人物：** Jason Liu（Instructor作者，现OpenAI Codex团队）

## 核心心法

### 长期线程存活模式
Jason Liu 把 Codex 改造成**能长期运行、持续接管任务的工作系统**：
- 每个工作流一个置顶线程（管日程/管开源项目/监控社交平台）
- 通过 Command-1 到 Command-9 **一键跳转**
- 线程跨月存活，项目背景、沟通习惯、历史决策自然沉淀
- **口述代替打字**：完整保留原始思路，不用刻意优化Prompt

### Heartbeats + @computer 组合拳
**Heartbeats**：给 Agent 加定时任务调度层（相当于 cron）

**实战案例**：
- **Chief of Staff 线程**（每30分钟跑一次）：扫描 Slack + Gmail，判断优先级，起草草稿但不发送，最终由人决定
- **动画项目**：每15分钟检查 Slack 审阅线程，同事提反馈 → Codex 重新渲染 + 回复到线程（Slack MCP 不支持文件上传时，Agent 自己用 @computer 点击 Add file）
- **亚马逊退款**：洗澡前让 Codex 盯客服排队状态 → 等洗完澡出来退款已到账
- 扩展场景：Google Docs评论、GitHub PR Review——**有反馈就自动推进下一步**

### 验证机制（最重要）
> "没有验证机制的野心，顶多算个愿望而已。"

案例：让 Codex 把 Python Rich 库迁移到 Rust——**硬性要求通过所有单元测试**。测试通过 = 任务完成；失败 = Agent 继续修。

### Goal 模式（正式转正）
明确最终目标和验收标准 → Codex 自主持续推进（几小时到数天），中途可查进度/调方向/暂停。

### Obsidian 本地记忆层
**核心思路**：个人工作记忆不应该托管在平台内部。

- 所有长期线程从 Obsidian vault 起步（TODO/people/projects/agent/notes）
- AGENTS.md 顶层写规则：人员信息/项目推进/待办办结变动 → 同步更新知识库
- **放弃 Codex 内置记忆系统**，核心数据存本地可控文件
- Codex 的 Chronicle（屏幕截取构建上下文）还在实验阶段，不够成熟
- **文件系统仍然是最可靠的记忆基础设施**

### Codex 侧边栏升级
- 直接渲染 Markdown、筛选表格、阅览 PDF/PPT
- 内置浏览器 + JavaScript 控制网页
- 常用交付形式：带 JS 和 CSS 的单文件 index.html（不用部署，打开就跑）
- **Connectors 和 Skills** 作为可复用工作流模板

### 远程能力（锁屏也能干活）
电脑锁屏后 Codex 继续工作，手机端实时查看/审批/接管任务。

## 参考链接
- https://x.com/jxnlco/status/2057153744630890620
