# AutoCLI / OpenCLI / AgentBrowser / CLI-Anything 调研

## Ch01.689 AutoCLI / OpenCLI / AgentBrowser / CLI-Anything 调研

> 📊 Level ⭐⭐ | 6.6KB | `entities/autocli-opencli-agentbrowser-research.md`

# AutoCLI / OpenCLI / AgentBrowser / CLI-Anything 调研

> **整理时间**：2026年4月24日

## 一、CLI-Anything — 让所有软件都变为 Agent 原生 ⭐32.4k

**GitHub**：https://github.com/HKUDS/CLI-Anything
**Stars**：32.4k | Fork：3.1k
**官网**：https://clianything.cc/
**标语**：*"Making ALL Software Agent-Native"* — 今日软件服务于人类，明日用户将是 Agent

### 核心定位

> "Today's Software Serves Humans👨‍💻. Tomorrow's Users will be Agents🤖."
> "CLI-Anything: Bridging the Gap Between AI Agents and the World's Software"

将**任意软件**转化为 Agent 可用的 CLI 工具，通过标准化的 Skill/AGENT.md 格式让 AI Agent 无缝调用。

### 核心组件

| 组件 | 说明 |
|------|------|
| **CLI-Hub** | `pip install cli-anything-hub` → `cli-hub install <name>` 浏览/安装社区 CLIs |
| **SKILL** | 统一的 `SKILL.md` 格式，`npx skills add HKUDS/CLI-Anything --skill <name> -g -y` 安装 |
| **Agent Harness** | 为每个软件（如 QGIS/Blender/Audacity/ComfyUI 等）生成的标准化 CLI 封装 |

### 支持的软件生态（部分）

```
QGIS/agent-harness    # GIS 制图
audacity/agent-harness # 音频编辑
blender/agent-harness  # 3D 建模
comfyui/agent-harness  # AI 图像生成
adguardhome/agent-harness
chromadb/agent-harness
drawio/agent-harness
cloudanalyzer/
cloudcompare/
```

### 与 OpenClaw/Agent 兼容

支持 OpenClaw, Nanobot, Claude Code, Codex, Antigravity 等 SKILL 兼容 Agent。
安装命令：
```bash
npx skills add HKUDS/CLI-Anything --skill cli-hub-meta-skill -g -y
```

### 技术规格

- Python ≥3.10
- click ≥8.0
- 输出格式：JSON + Human-readable
- 测试：2,269 个测试用例，100% 通过

## 二、OpenCLI — 万物皆可 CLI 的 AI 原生运行时

**GitHub**：https://github.com/jackwener/OpenCLI
**Stars**：17.1k
**标签**：`cli` `ai-agents` `ai-tools`

### 核心定位

> "Make Any Website & Tool Your CLI. A universal CLI Hub and AI-native runtime."

将**任何网站、Electron 应用、本地二进制工具**转换为标准化的命令行接口，专为 AI Agent 设计的统一 AGENT.md 集成方案。

### 核心特性

| 特性 | 说明 |
|------|------|
| **万物 CLI 化** | 任何网站/工具 → 标准化 CLI 接口 |
| **AI 原生运行时** | 内置 AI Agent 支持，AGENT.md 集成 |
| **统一工具发现** | Agent 可发现、学习和执行工具 |

### 与 Agent 生态的关系

- 支持通过 `AGENT.md` 格式让 AI Agent 无缝发现和调用工具
- 定位为 AI Agent 的"工具网关"

## 三、AutoCLI — 极速内存安全的网页信息获取工具

**GitHub**：https://github.com/nashsu/AutoCLI
**Stars**：2.4k
**技术栈**：Rust（`.cargo` 目录，内存安全）
**相关**：autocli-skill — 给 ClaudeCode/OpenClaw/Agent 使用的 Skill（591 stars）

### 核心定位

> "Blazing fast, memory-safe command-line tool — Fetch information from any website with a single command"

用一条命令从任意网站获取信息，**极速 + 内存安全**。

### 支持平台（55+）

| 类别 | 平台 |
|------|------|
| 社交媒体 | Twitter/X, Reddit, Xiaohongshu |
| 视频 | YouTube, Bilibili |
| 新闻/社区 | HackerNews, Zhihu |
| 桌面控制 | Electron apps |
| 本地工具集成 | gh, docker, kubectl |

### autocli-skill 关联

专为 ClaudeCode / OpenClaw / Agent 设计的 Skill，让 AI Agent 能够：
- 获取整个互联网的信息
- 抓取任意网页内容

## 四、AgentBrowser — AI Agent 的专用浏览器

### elizaOS/agentbrowser (25 stars)
**定位**："A browser for your agent"

### zabarich/agentbrowser (2 stars)
**定位**：TypeScript 原生的自主浏览器 Agent，Node.js 运行，灵感来自 browser-use

### AshtonVaughan/agentbrowser (2 stars)
**定位**：专为 AI Agent 打造的浏览器运行时

| 特性 | 说明 |
|------|------|
| **语义工具（Semantic Tools）** | 结构化理解页面内容 |
| **站点记忆（Site Memory）** | 记住站点结构 |
| **自愈执行（Self-Healing）** | 自动修复执行错误 |
| **MCP 服务器** | 支持 Model Context Protocol |

### 共同特征

- **Playwright** 或类似浏览器自动化框架
- **隐身模式**（Stealth Mode）
- **智能元素查找**
- **LLM 友好的页面摘要**

## 五、横向对比

| 项目 | Stars | 核心定位 | 技术栈 | 目标用户 |
|------|-------|---------|--------|---------|
| **CLI-Anything** | 32.4k | 让所有软件 Agent 原生化 + CLI-Hub 生态 | Python | 各类 Agent 用户 |
| **OpenCLI** | 17.1k | 万物 CLI 化 + AI 运行时 | TypeScript/JS | AI Agent 开发者 |
| **AutoCLI** | 2.4k | 极速网页信息获取 | Rust | 需要抓取数据的用户/Agent |
| **AgentBrowser** | ~25 | AI 专用浏览器 | Python/TS | 需要浏览器自动化的 Agent |

## 六、关键洞察

### CLI-Anything 的野心（32.4k Stars ⭐）

将**一切软件**（QGIS、Blender、Audacity、ComfyUI 等）转化为 Agent 可调用的标准化 CLI，通过 CLI-Hub 生态实现"一键安装 + 即插即用"，是当前最热门的 Agent 工具扩展方案。

### OpenCLI 的专注

聚焦于**网站/应用转 CLI** 这一场景，打造 AI Agent 的"工具网关"，通过 AGENT.md 实现统一集成。

### AutoCLI 的垂直场景

聚焦**信息获取**垂直场景，用 Rust 实现高性能 + 内存安全，适配 55+ 平台，并通过 Skill 赋能 Agent。

### AgentBrowser 的演进方向

从通用浏览器自动化 → **专供 AI Agent 使用**的浏览器：语义理解、站点记忆（跨会话）、自愈能力（错误恢复）。

## 相关概念

- [开源 Agent 框架生态](https://github.com/QianJinGuo/wiki/blob/main/concepts/open-source-agent-frameworks.md) — CLI-Anything/OpenCLI 属于 Agent 工具扩展层，与自主 Agent 框架形成互补
- [Claude Code 工具设计演进](https://github.com/QianJinGuo/wiki/blob/main/concepts/claude-code-tool-design-evolution.md) — AutoCLI/autocli-skill 直接面向 Claude Code/OpenClaw 等 CLI Agent，是工具设计趋势的案例

## 相关资源

- CLI-Anything：https://github.com/HKUDS/CLI-Anything
- CLI-Hub：https://clianything.cc/
- OpenCLI：https://github.com/jackwener/OpenCLI
- AutoCLI：https://github.com/nashsu/AutoCLI
- autocli-skill：https://github.com/nashsu/autocli-skill
- AgentBrowser (elizaOS)：https://github.com/elizaOS/agentbrowser

---
*整理自 GitHub 搜索，2026年4月*

---

