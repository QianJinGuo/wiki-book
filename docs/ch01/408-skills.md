# 【实践案例】我用Skills实现了个自媒体知识管理神器！

## Ch01.408 【实践案例】我用Skills实现了个自媒体知识管理神器！

> 📊 Level ⭐⭐ | 10.8KB | `entities/实践案例我用skills实现了个自媒体知识管理神器.md`

# 【实践案例】我用Skills实现了个自媒体知识管理神器！

**来源**: 叶小钗

**发布日期**: 2026-05-02

**原文链接**: https://mp.weixin.qq.com/s/YDnhytrpl26ozXgGvauc1Q

---

## 痛点：自媒体知识管理的低效困境

作为一名内容创作者，经常需要从各种渠道搜集和整理信息，但这个过程始终充斥着低效与痛苦。典型场景：刷到一条内容扎实的视频时，脑中会闪过"这段内容如果能转成文字就好了"的念头。然而现实操作往往是：先收藏、再截图，最后把链接丢进"稍后处理"的收藏夹。等到真正需要整理时，当时的灵感与上下文早已消失。

## 解决方案：Krawl 系统

作者将繁琐的流程封装成了一个 Claude Skill，并进一步扩展为完整的 Krawl 系统——一个基于 Claude Skills 机制的知识库管理系统。

## 认识 Claude Skills

Anthropic 官方定义的 Agent Skills：模块化的能力，用于扩展 Claude 的功能。每个 Skill 封装了指令、元数据和可选资源（脚本、模板），当场景匹配时 Claude 会自动调用。

### Skills 三要素与渐进式披露

Agent Skills 的三大组成要素构成了上下文的三个层级，遵循**渐进式披露（Progressive Disclosure）**原则——分阶段、按需加载信息，而不是在任务开始时就将所有内容全部塞入上下文窗口中。

1. **元数据（始终加载）**：名称、描述、标签。Claude 启动时扫描所有已安装 Skills 的元数据，纳入系统提示（System Prompt），用于意图匹配和触发判断。占用上下文极小。
2. **指令（触发时加载）**：当用户请求与 Skill 描述匹配时，Claude 通过 bash 从文件系统读取对应 SKILL.md 文件，加载完整内容。
3. **代码与资源（按需加载）**：复杂的 Skill 可包含多个文件，形成完整知识库。Skill 将这些资源与指令一起打包，实现完整任务闭环。

### Skills 安装方式

**方式一：官方技能市场（推荐）**
```bash
/plugin marketplace add anthropics/skills
/plugin list
/plugin install document-skills@anthropic-agent-skills
```

**方式二：手动创建自定义技能**
在 `~/.claude/skills/` 中创建文件夹，编写 `SKILL.md`，放入脚本工具。目录结构：
```
~/.claude/skills/douyin-summary/
└── SKILL.md
```

SKILL.md 示例：
```yaml
---
name: douyin-summary
description: 抖音视频总结助手
---
# 工作流程
1. 识别用户输入中的 douyin.com 链接
2. 调用 scripts/fetch_douyin.py 获取视频文案
3. 提取核心观点并结构化输出
```

## Krawl 系统架构

### 核心设计思想

Krawl 采用了一种 **"Dynamic Router"（动态路由）与"Lazy Loading"（按需加载）** 相结合的架构，核心原则包括：

- **懒加载**：系统启动时只扫描技能的元数据（Markdown Frontmatter），不加载具体的 Python 代码
- **元控制**：系统提供一个核心的 Meta-Tool `load_skill`，LLM 根据任务需求自主决定加载哪个技能
- **资源隔离**：技能的代码和工具定义在需要时动态注册到当前会话中

### 核心实现

**1. 技能元数据结构（SkillInfo）**：轻量级结构持有技能信息，核心目的是占位，不直接加载代码对象。‌

```python
@dataclass
class SkillInfo:
    name: str
    description: str  # 从 skill.md 的 frontmatter 读取
    is_loaded: bool = False
    content: str = ""
    tools: List[Dict[str, Any]] = field(default_factory=list)
    handlers: Dict[str, ToolHandler] = field(default_factory=dict)
    module_path: str = ""
```

**2. SkillManager 轻量扫描**：系统启动时只遍历目录并读取 Markdown 的头部描述，不加载任何 Python 代码，保证启动速度和低内存占用。‌

**3. 动态加载机制（Dynamic Activation）**：当且仅当 LLM 决定使用某个技能时，才通过 `activate_skill` 方法动态加载对应的代码文件和工具，并将新工具注册到活跃列表。‌

**4. Meta-Tool 实现**：系统暴露 `load_skill` 作为唯一自带的"初始技能"，LLM 用它发现和加载其他技能。加载成功后返回 Manual（skill.md 的内容）和新工具的列表。

### 完整交互流程

以"用户想要保存一个抖音视频"为例：

1. **系统初始化**：SkillManager 扫描 skills 目录，读取元数据，系统知道有 `link_ingest` 技能但未加载代码
2. **意图识别**：LLM 分析用户意图"用户想保存视频，这匹配 link_ingest 的描述"，决定调用 `load_skill(skill_name="link_ingest")`
3. **动态加载**：系统读取 `link_ingest/skill.md` 完整内容，动态 import `execute.py`，将工具 `save_link_knowledge` 注册到会话
4. **执行任务**：LLM 调用 `save_link_knowledge(url="...")`，系统下载视频、提取字幕、存入数据库
5. **最终响应**：LLM 组织自然语言回复："视频已保存！标题是《...》，已归档到视频分类中。"

### Skill 实现标准协议

每个 Skill 脚本（`execute.py`）必须遵循标准协议，包含三个部分：
- **TOOLS**：工具定义，告诉 LLM 这个技能能做什么（名称、描述、参数）
- **HANDLERS**：处理器映射，工具名称到处理函数的映射
- **实现函数**：实际的业务逻辑

## 深度分析

### Skills 模式解决了什么问题？

Skills 模式的核心价值在于**知识的沉淀与复用**——反复使用的流程被固化为可复用的模块，避免每次重复造轮子。其模块化架构使每个技能独立，易于测试、维护和扩展。通过组合不同技能，可以构建复杂的工作流。最被低估的价值在于提升工具调用的准确性——当 LLM 知道"我拥有这个技能的描述和能力"时，它会更精确地匹配用户意图与具体工具。

### 渐进式披露的设计哲学

Progressive Disclosure（渐进式披露）是 Claude Skills 设计中最精妙的部分。它解决了 Agent 系统的一个核心矛盾：LLM 的上下文窗口是有限的，但可用的工具和知识是无限的。通过分三层——元数据（始终加载、极小开销）→ 指令（触发时加载）→ 资源（按需加载）——实现了从"知悉存在"到"了解用法"再到"执行任务"的平滑过渡。这与人类认知中"知道有什么工具可用 → 需要时查阅说明书 → 实际使用"的模式高度一致。

### Dynamic Router + Lazy Loading 的工程价值

Krawl 的动态路由设计对构建生产级 Agent 系统有重要参考价值。它解决了随着技能数量增长带来的两个核心问题：启动延迟（不预加载所有代码）和上下文污染（只在需要时注册工具）。Meta-Tool `load_skill` 的设计模式——让 LLM 自己决定何时加载什么技能——可以推广到任意大规模工具集的 Agent 架构中。

### 从单点 Workflow 到系统化 Agent

作者特别指出"严格来说这个场景其实 Workflow 已经是最优解了"，但选择 Agent 路线是因为 Workflow 只解决单点问题，而 Workflow 背后有更大的探索空间——构建完整的、AI 自动完成的从内容抓取、整理到知识管理的全过程。这种从"Workflow 解决单点"到"Agent 系统化覆盖全流程"的思维升级，是 Agent 工程中的一个典型范式演进路径。

## 实践启示

1. **从解决具体问题的小 Skill 开始**：不要一开始就构建复杂的系统。先做一个能解决具体问题的小 skill，验证思路。Skill 的粒度要适中——不宜过大（一个 skill 只做一件事），也不宜过小（避免 skill 爆炸难以管理）。建议按业务领域划分，每个 skill 对应一个完整的用户故事。

2. **元控制 + 懒加载是 Agent 工具集架构的最佳实践**：当 Agent 可用的工具或 skill 超过 5-10 个时，应当引入 Meta-Tool 机制让 LLM 自主选择加载。这避免了将所有工具定义塞入系统提示的开销，同时保持了 Agent 的能力完整性。

3. **Skills 机制可移植性极强**：skill 与系统解耦的设计使得可移植性成为天然优势。如果其他项目需要类似能力，只需复制对应的技能文件夹，即可实现能力的即插即用。对于内部工具平台建设，这是一个值得复用的参考架构。

4. **设计明确的错误处理和版本管理**：为每个 skill 设计明确的错误处理机制，记录使用日志便于调试和优化。考虑 skill 版本管理以支持回滚。这在生产环境中部署 Agent 技能系统时尤为重要。

5. **渐进式披露是 Agent 上下文管理的关键原则**：无论是构建 Skill 系统还是设计 Agent 提示词，都应遵循"先元数据、再指令、最后资源"的分层暴露策略。这能在有限的上下文窗口内最大化 Agent 的能力覆盖范围。

## 相关实体

- **Claude Skills 架构与渐进式披露**
- **Agent 元工具与动态加载**
- **知识管理 Agent 系统**
- **Agent 插件与技能市场生态**

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/实践案例我用skills实现了个自媒体知识管理神器.md)

---

