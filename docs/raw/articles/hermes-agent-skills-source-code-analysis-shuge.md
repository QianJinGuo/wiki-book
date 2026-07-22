---
source_url: "https://mp.weixin.qq.com/s/JbBYx6WdGaD9rrGE2bWN6g"
ingested: 2026-06-26
sha256: f3c57bb6348ddc85
---

# Hermes Agent Skills 源码级拆解：3级渐进加载 × 6步调度 × 5维安全扫描

> 源码分析版（vs [[entities/hermes-skill-system|Hermes Agent Skill 系统深度解析]] winty版）

## 核心定位

Hermes 两套记忆机制：
- **通用记忆**（MEMORY.md、USER.md）：存储"知道什么"——用户偏好、项目信息
- **Skills**：过程性记忆（Procedural Memory），存储"怎么做"——工作流、最佳实践

Skills 遵循 **agentskills.io 开放标准**，非私有格式。

## 渐进式披露（Progressive Disclosure）

三个加载层级：

| Level | 调用 | 内容 | Token |
|---|---|---|---|
| 0 | `skills_list()` | `[{name, description, category}, ...]` | ~3k |
| 1 | `skill_view(name)` | Full content + metadata | varies |
| 2 | `skill_view(name, path)` | Specific reference file | varies |

懒加载思路：Agent 先扫 Level 0 列表，判断相关 Skill，再按需加载完整内容。

## 6步斜杠命令调度

源码：`agent/skill_commands.py`

1. 解析斜杠命令，提取 Skill 名称和用户指令
2. 调用 `skill_view()` 加载完整 Skill 内容
3. 执行模板变量替换（`${HERMES_SKILL_DIR}`、`${HERMES_SESSION_ID}`）
4. 可选执行内联 Shell 片段（默认关闭）
5. 注入 Skill 目录信息和配置值
6. 组装为用户消息发送给 Agent

**内联 Shell 执行**默认关闭，需在 `config.yaml` 手动开启。

## 条件激活

Frontmatter 四个字段让 Skill 根据工具可用性自动显示/隐藏：

| 字段 | 行为 |
|---|---|
| `fallback_for_toolsets` | 当列出的 toolset 可用时隐藏 |
| `fallback_for_tools` | 当列出的工具可用时隐藏 |
| `requires_toolsets` | 当列出的 toolset 不可用时隐藏 |
| `requires_tools` | 当列出的工具不可用时隐藏 |

内置 `duckduckgo-search` 用了 `fallback_for_toolsets: [web]`——配了 FIRECRAWL_API_KEY 时自动隐藏降级方案。

## Skills Guard：五维安全扫描

源码：`tools/skills_guard.py`。所有从 Hub 安装的第三方 Skill 都经过扫描：

| 维度 | 检测目标 |
|---|---|
| 数据泄露 | curl/wget 泄露环境变量、SSH/AWS 目录访问 |
| 提示注入 | `ignore previous instructions`、角色劫持 |
| 破坏性命令 | `rm -rf /`、fork bomb |
| 持久化后门 | crontab、启动项 |
| 网络监听 | `nc -l`、`socat` 等反向 Shell 模式 |

还检测 **base64 编码的混淆命令**。

### 四档信任等级

| 等级 | 来源 | 策略 |
|---|---|---|
| builtin | 随 Hermes 发布 | 始终信任 |
| official | `optional-skills/` 目录 | 内置信任 |
| trusted | openai/skills 等知名仓库 | 较宽松策略 |
| community | 其他来源 | 非危险级别可 `--force` 覆盖；dangerous 始终阻止 |

## Bundle 系统

把多个经常一起用的 Skill 打成一个 Bundle：

```yaml
name: backend-dev
skills:
  - github-code-review
  - test-driven-development
  - github-pr-workflow
```

使用 `/backend-dev` 一条命令激活三个 Skill。Bundle 和 Skill 同名时，Bundle 优先。

## 外部 Skill 目录

```yaml
skills:
  external_dirs:
    - ~/.agents/skills
    - /home/shared/team-skills
```

## SKILL.md 结构

官方同侪技能大小在 **8-14k 字符**，超过 20k 应拆到 `references/*.md` 里。

## 避坑指南

1. Frontmatter 格式：`---` 闭合前后需换行，不可有 BOM
2. Skill 文件太大：超过 20k 字符应拆到 `references/*.md`
3. 条件激活字段逻辑：`fallback_for_toolsets` 是"可用时隐藏"，不是"可用时显示"
4. 支撑文件路径限制：`write_file` 限制在 `references/`、`templates/`、`scripts/`、`assets/` 四个子目录，单文件上限 1 MiB
5. 优先用 `patch` 而不是 `edit`
6. 内联 Shell 输出上限 4000 字符

## Skill vs Tool 边界

| 维度 | Skill | Tool |
|---|---|---|
| 实现方式 | 指令 + Shell 命令 | Python 代码集成 |
| 依赖 | 无额外依赖 | 可能有重依赖 |
| 分发 | 一个 SKILL.md 文件 | 需合并到主仓库 |
| 适用场景 | API 封装、工作流编排 | 二进制数据处理、实时事件 |

---

> 同主题：[[entities/hermes-skill-system|Hermes Agent Skill 系统深度解析]]（winty版，2026-05-14）
