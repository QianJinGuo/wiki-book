# CLI-Anything

## Ch03.089 CLI-Anything

> 📊 Level ⭐⭐ | 7.8KB | `entities/cli-anything.md`

## Overview
CLI-Anything 是由 HKUDS 实验室（香港大学数据科学实验室）开源的 Agent 工具扩展框架，Stars 32.4k（GitHub），核心目标是将**任意软件**转化为 AI Agent 可调用的标准化 CLI 工具。
> "Today's Software Serves Humans👨‍💻. Tomorrow's Users will be Agents🤖."

## Key Facts
| Fact | Detail |
|------|--------|
| GitHub | https://github.com/HKUDS/CLI-Anything |
| Stars | 32.4k |
| Fork | 3.1k |
| 官网 | https://clianything.cc/ |
| 技术栈 | Python ≥3.10, click ≥8.0 |
| 测试 | 2,269 个测试用例，100% 通过 |

## Core Components
### CLI-Hub
`pip install cli-anything-hub` → `cli-hub install <name>` — 社区 CLI 工具的包管理 + 安装。

### SKILL 格式
统一的 `SKILL.md` 格式，通过 `npx skills add HKUDS/CLI-Anything --skill <name> -g -y` 安装。

### Agent Harness
为每个软件生成的标准化 CLI 封装。目前已支持：

- **QGIS** / agent-harness — GIS 制图
- **Blender** / agent-harness — 3D 建模
- **Audacity** / agent-harness — 音频编辑
- **ComfyUI** / agent-harness — AI 图像生成
- AdGuard Home、ChromaDB、Draw.io、CloudAnalyzer、CloudCompare

## Agent 兼容性
支持 OpenClaw, [OpenCLI](../ch03-080-opencli/), Nanobot, Claude Code, Codex, Antigravity 等主流 Agent。
安装命令：
```bash
npx skills add HKUDS/CLI-Anything --skill cli-hub-meta-skill -g -y
```   ## 真实 Demo（WeChat 实测补充）

WeChat 作者实测验证了 CLI-Anything 的工程可行性，以下 Demo 均通过实际操作产出：

### Blender：3D 无人机建模
Agent 使用 `cli-anything-blender` 逐步构建轨道中继无人机 3D 模型，每步生成实时预览，`trajectory.json` 记录完整命令-状态序列，可回放。

### FreeCAD：好奇号月球车
使用 `cli-anything-freecad` 构建好奇号风格月球车模型，FreeCAD 本身是硬核 CAD 工具，能跑通说明 CLI 覆盖的功能深度不低。

### Draw.io：完整 HTTPS 握手流程图
Agent 从零绘制 TCP 三次握手、TLS 协商、加密数据交换、四次挥手的完整时序图，产出 `.drawio` 和 `.png` 两个文件。

### 平台支持一览

| 平台 | 接入方式 | 状态 |
|------|---------|------|
| Claude Code | `/plugin marketplace add HKUDS/CLI-Anything` | **官方支持** |
| Pi Coding Agent | bash 脚本安装扩展 | 官方支持 |
| OpenCode | 复制命令文件到配置目录 | 官方支持 |
| OpenClaw | 复制 SKILL.md 到技能目录 | 社区支持 |
| Codex | bash 安装脚本 | 社区支持（实验性） |
| GitHub Copilot CLI | `copilot plugin install` | 社区支持 || Qodercli | 注册脚本 | 社区支持 |

Claude Code 接入三步：添加插件市场 → 安装插件 → 生成 CLI。

### SKILL.md 格式详解

每个生成的 CLI 附带 `SKILL.md`，格式专为 Agent 设计：

- YAML 头部：名称 + 描述
- 正文：命令组 + 子命令 + 用法示例 + JSON 输出说明

Agent 读完 SKILL.md 即知道工具能力、调用方式、返回格式。结合 CLI-Hub 元技能，Agent 可自主完成"查找 → 安装 → 读文档 → 干活"全流程，无需人工介入。

### CLI-Hub 元技能

CLI-Hub 的"元技能"允许 Agent 直接读 Hub 目录，自主选择安装哪个 CLI。安装命令：
```bash
pip install cli-anything-hub
cli-hub install <name>
```
覆盖范围：Blender/GIMP/Krita/FreeCAD/QGIS/OBS Studio/Shotcut/UniMol Tools/Zotero/Obsidian/Stable Diffusion WebUI/ComfyUI/Ollama 等。

## 深度分析
### 设计哲学：软件eating向的范式转换
CLI-Anything 背后是一个根本性的范式判断：**未来软件的主要用户将是 AI Agent 而非人类**。HKUDS 实验室提出的口号 "Today's Software Serves Humans, Tomorrow's Users will be Agents" 精准地捕捉了这一趋势。CLI-Anything 的本质是将这一愿景落地为可操作的工程框架。

### 技术架构：三层解耦
CLI-Anything 的技术架构分为三层：

- **CLI-Hub**：包管理层，负责发现、安装、升级社区贡献的 CLI 工具封装
- **SKILL.md**：格式标准层，定义如何描述一个 CLI 工具的能力、参数、返回值
- **Agent Harness**：适配层，为每个目标软件（如 QGIS、Blender）生成符合 SKILL 规范的标准化封装
这种三层解耦确保了框架的可扩展性——新增一个软件的适配只需编写对应的 Harness 和 SKILL.md，无需修改框架核心。

### 与 OpenCLI 的差异化定位
CLI-Anything（32.4k ⭐）与 （17.1k ⭐）代表了两种不同的 CLI 化思路：
| 维度 | CLI-Anything | OpenCLI |
|------|-------------|---------|
| 发起方 | 学术实验室（HKUDS） | 社区 |
| 核心焦点 | Agent 工具标准化 | 通用 CLI 封装 |
| 生态 | SKILL 市场 + CLI-Hub | 插件体系 |
| 代表案例 | QGIS/Blender Agent Harness | 通用工具链 |

### 工具层战争的战略意义
CLI-Anything 的 Star 数量（32.4k）远超同类项目，其战略价值在于：**谁控制了 Agent 与软件之间的接口层，谁就占据了 AI Native 工具生态的核心节点**。HKUDS 通过开源 CLI-Anything，实际上是在争夺这个接口层标准的制定权。

## 实践启示
### 1. 工具封装的标准化的价值
CLI-Anything 证明了一个核心观点：**工具封装的价值不在于"能用"，而在于"被可靠调用"**。2,269 个测试用例 + 100% 通过率的工程质量要求，使得 Agent 调用这些 CLI 工具时的失败率大幅降低。这是 Harness Engineering 的最佳实践样本。

### 2. Skill 市场是 Agent 生态的 App Store
CLI-Hub + SKILL.md 的组合本质上是一个轻量级的 Skill Market。类比移动互联网时代应用商店的垄断利润，Agent 时代的 Skill Market 将成为兵家必争之地。开发者和研究机构应当关注这个赛道的建设机会。

### 3. 学术实验室的开源战略值得借鉴
HKUDS 通过 CLI-Anything 建立了在 Agent Tools 领域的技术影响力，Stars 32.4k 的数据表明学术驱动型开源如果找准工程化落地点，同样可以形成广泛社区认可。这对于 AI 研究机构的开源战略有参考价值。

### 4. 多 Agent 协作中的工具标准化
在  和 CLI-Anything 的生态中，多个 Agent 协同时面临的挑战是工具的一致性问题。标准化是解决协作复杂度的关键——当所有 Agent 都通过统一的 SKILL 接口调用工具时，工具的提供方无需感知调用者是哪个 Agent。

## 与 [Hermes-Agent](../ch04-418-hermes-agent/) 的关系
 支持通过 Skill 机制调用外部 CLI 工具，CLI-Anything 正是此类工具的重要来源之一。

## Related
- [AutoCLI](../ch03-111-autocli/) — 极速网页信息获取 CLI
- [AgentBrowser](../ch04-451-agentbrowser/) — AI 专用浏览器

## 相关实体

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/05-11-the-great-memory-panic-of-2026.md)

- [GBrain](../ch01-220-gbrain-yc-ceo-garry-tan-的-postgres-native-ai-第二大脑-5-大设计决策/)

---

