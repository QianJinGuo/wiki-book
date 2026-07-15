# Skill Issues: Compromising Claude Code with malicious skills & agents -- Part 1

## Ch01.814 Skill Issues: Compromising Claude Code with malicious skills & agents -- Part 1

> 📊 Level ⭐⭐ | 5.5KB | `entities/skill-issues-compromising-claude-code-with-malicious-skills-agents-part-1.md`

## 核心要点
- Published Time: Wed, 13 May 2026 16:58:06 GMT AI coding apps, such as Claude Code, codex, etc. are [becoming increasingly popular](https://blog.jetbrains.com/research/2026/04/which-ai-coding-tools-do-
## 相关实体
- [Skill Issues Compromising Claude Code With Malicious Skills Agents](ch01/814-skill-issues-compromising-claude-code-with-malicious-skills.html)
- [Skill System Design Three Way Comparison](../ch04/267-skill.html)
- [Claude Code Skills Mcp Rules Source Analysis](../ch07/006-claude-code-skills-mcp-rules.html)
- [Claude Code Skill Writing Guide](../ch03/076-claude-code.html)
- [打造可靠的 Ai 编程环境Claude Code Hooks 完整开发者指南 V2](../ch03/076-claude-code.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/skill-issues-compromising-claude-code-with-malicious-skills-agents-part-1.md)

- [qwen code skill testing framework: recording, playback, and](../ch04/267-skill.html)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/security-landscape.md)
## 深度分析
**Skill 文件本质上是可执行的 prompt 供应链**
Skill 文件（`.md` 格式）通过 frontmatter 中的 `allowed-tools` 字段可以在用户不知情的情况下突破权限控制。这是 Claude Code 安全模型中最关键的绕过路径：正常情况下，Claude Code 的每次工具调用都会经过 LLM 的 reason 环节——LLM 能够识别恶意命令并拒绝执行。但 `allowed-tools` 动态上下文注入（`inject-dynamic-context`）机制允许将 Bash 命令直接写入技能描述中，绕过 LLM reason 直接执行。这意味着 skill 文件实际上是一个**隐式代码执行通道**，而非纯文本提示。
**Agent `permissionMode: bypassPermissions` 的危险性**
sub-agent 的权限模式是一个独立配置项，可以在 agent 定义文件中由攻击者完全控制。当 agent 以 `bypassPermissions` 模式运行时，它完全绕过了用户的权限设置和会话级别的同意检查。这一设计的原本意图是让受信任的自动化任务无需反复确认，但在攻击场景中，agent 定义文件被恶意植入后，这个配置项就变成了远程代码执行（RCE）的开关。
**NPM 包作为攻击载体的工程优势**
相比直接执行 shell 命令，伪装成 npm 包安装具有显著的隐蔽优势：LLM 看到的是一个"安装lodash并执行"的正常开发操作，不会触发危险命令的语义识别；而恶意代码的实际执行发生在 node 运行时内部，Claude Code 对此没有感知。这与软件供应链攻击的经典模式（pip install、npm install 上的恶意包）高度相似，攻击者利用的是开发者对"安装依赖"这一常见操作的信任惰性。
**权限模型的层级与覆盖优先级**
Claude Code 的权限体系呈层级结构：用户级别 deny 规则 > agent 级别 `bypassPermissions` > 技能级别 `allowed-tools` > 会话同意提示。关键发现是：**用户级别的 `deny: ["Bash(*)"]` 是唯一能够统一覆盖所有绕过路径的安全措施**——它不依赖 LLM 的语义识别，也不受 agent 配置文件的控制。但完全禁用 Bash 也意味着 Claude Code 失去了运行测试、构建脚本和执行开发工作流的能力。

## 实践启示
- **永远不要从不受信任的来源安装 skill 文件或 agent 定义**，尤其是 GitHub 上来源不明的 awesome-claude-code-skills 类型仓库和 skills.sh 上的未审核技能。
- **在企业环境中，通过 managed settings 强制部署 `deny: ["Bash(*)"]` 并配合 workspace 级别的 tool allowlist**，在安全性和功能性之间取得平衡。
- **建立内部可信技能库并制定接入审批流程**，类似于企业对 PyPI/npm 包的安全审查流程，对 skill 文件进行人工审核后方可部署。
- **使用 sandbox 环境（bubblewrap）隔离 Claude Code 与主机文件系统和网络的直接访问**，这是技术层面最重要的纵深防御措施。
- **区分 skill 与 agent 的风险等级**：skill 中的 `allowed-tools` 动态上下文注入是最危险的单文件攻击向量；agent 的 `permissionMode: bypassPermissions` 需要用户主动配置 agent，风险次之但仍然严峻。
- **定期审计 `.claude/commands`、`.claude/skills` 和 `.claude/agents` 目录**，检查是否存在来源不明的文件，尤其是在团队协作项目中合并来自外部贡献者的代码后。
- **理解威胁模型的边界**：这本质上等同于允许在开发环境运行 `pip install` 来自任意来源的包——如果你的团队不允许在生产环境这么做，就不应该对 skill/agent 文件采取更低的标准。

---

