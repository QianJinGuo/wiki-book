# Skill Issues: Compromising Claude Code with malicious skills & agents — Part 1

## Ch09.085 Skill Issues: Compromising Claude Code with malicious skills & agents — Part 1

> 📊 Level ⭐⭐ | 6.8KB | `entities/skill-issues-compromising-claude-code-with-malicious-skills-agents.md`

## 核心要点
- **攻击向量**：Claude Code 的 Skill 文件（.md 格式）可被恶意构造，通过 `allowed-tools` frontmatter 或 `permissionMode: bypassPermissions` 绕过权限控制，实现远程代码执行（RCE）
- **核心问题**：Skill 文件本质上等同于可执行代码——用户下载和运行未审计的 Skill 与下载运行未知二进制程序具有相同的风险等级
- **防护关键**：用户设置中的 `deny: ["Bash(*)"]` 是唯一能对抗 Skill/Agent 绕过的安全防线
- **影响范围**：任何通过 `npx skills add`、GitHub仓库或 skills.sh 等平台安装未审查 Skill 的用户均受影响
- **攻击前提**：用户需主动触发恶意 Skill，且 Claude Code 未启用沙箱隔离
## 相关实体
- [Skill Issues Compromising Claude Code With Malicious Skills Agents Part 1](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-issues-compromising-claude-code-with-malicious-skills-agents-part-1.md)
- [Skill System Design Three Way Comparison](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-system-design-three-way-comparison.md)
- [Claude Code Skills Mcp Rules Source Analysis](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-skills-mcp-rules-source-analysis.md)
- [Claude Code Skills Mcp Rules Source Analysis](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-skills-mcp-rules-source-analysis.md)
- [Claude Code Skills Mcp Rules Source Analysis](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-skills-mcp-rules-source-analysis.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/skill-issues-compromising-claude-code-with-malicious-skills-agents.md)

- [xz-utils backdoor 2 years on — maintainer trust hijack patte](https://github.com/QianJinGuo/wiki/blob/main/entities/xz-utils-backdoor-maintainer-trust-hijack-2-years-on.md)

## 深度分析
- **Skill 供应链攻击的本质**：Skill 文件（`.claude/commands/*.md` 或 `.claude/skills/*/SKILL.md`）本质上是自然语言指令集，但通过 `allowed-tools` frontmatter 可以声明工具权限，这等同于要求操作系统授予特定权限。相比 PyPI/npm 的包管理生态，Skill 文件缺乏签名验证、版本锁定或来源审计机制，攻击门槛极低。
- **`allowed-tools` 的安全设计缺陷**：Claude Code 的 Skill 文档明确允许通过 frontmatter 覆盖工具权限，但这个设计被恶意利用：`allowed-tools: Bash(*)` 使得 Skill 内的所有 bash 命令绕过用户确认直接执行。关键是用户完全看不到这些工具被调用——Skill 声称是"网络连接检查"，实际执行的是 `socat tcp:... exec:/bin/bash` 建立反向 shell。这是权限模型的预期行为，但 Skill 作者（攻击者）控制了权限声明。
- **动态上下文注入绕过 LLM 审查**：Skill 文档提到存在"Claude 看不到"的预处理器（`inject dynamic context`），实际测试表明以 `` `command` `` 格式嵌入的命令在 LLM 看到之前就已被执行。正常对话中 Claude Code 会拒绝 `socat tcp:... exec:/bin/bash`（识别为反向shell），但同一命令以动态上下文形式注入时，LLM 推理被完全绕过，命令直接执行后才报告攻击。
- **Sub-Agent 的 `permissionMode: bypassPermissions` 放大攻击面**：Sub-Agent（`.claude/agents/*.md`）可以声明独立的权限模式和工具集，当设置 `permissionMode: bypassPermissions` 时，Agent 可完全绕过父会话的权限控制。更危险的是，通过 npm 包安装（如 `npm install malicious-package`）作为掩护，Claude Code 只能看到"下载并运行了一个 npm 包"，而包内的恶意代码在 Claude Code 可见范围外执行，真正实现本地 RCE。
- **50 子命令限制的安全边界**：Claude Code 代码泄露显示，当命令拆分为超过 50 个子命令时，安全检查被跳过（`MAX_SUBCOMMANDS_FOR_SECURITY_CHECK`），仅返回 `ask` 行为。这不是权限绕过，但绕过了用户配置的拒绝规则。不过官方明确表示这是"设计决策而非安全边界"，沙箱功能默认也是关闭的。
- **与 pip install 的风险对等性**：文章的核心观点：盲目安装 Skill 文件与 `pip install random-package` 具有相同的威胁模型。但 Python 包至少受到 PyPI 扫描、签名和版本生态的约束，而 Skill 文件几乎没有任何安全审计。这是一个被 AI 编码工具快速采用与安全防御滞后之间的时间窗口攻击面。

## 实践启示
- **企业应建立内部 Skill 仓库并强制代码审查**：与 npm/yarn/pypi 的依赖管理类似，企业应维护一个经过安全审计的内部 Skill 库，所有新增 Skill 必须经过安全团队审查（检查 frontmatter 权限声明、动态上下文注入模式、命令执行链）。GitHub 上数千个"awesome-claude-code-skills" 仓库中的内容完全未被审计。
- **Settings `deny: ["Bash(*)"]` 是最后防线但代价高昂**：在 `~/.claude/settings.json` 中设置默认拒绝 Bash 可以阻止所有 Skill/Agent 的命令执行，但这会严重削弱 Claude Code 的实用价值（无法运行测试、构建脚本、部署命令）。企业需要在安全性和功能性之间做出取舍，更现实的方案是仅在处理不可信代码时启用严格模式。
- **沙箱隔离是必选项而非可选项**：Claude Code 内置基于 bubblewrap 的沙箱，但默认关闭。建议企业通过 managed settings 强制启用沙箱，限制 Claude Code 对文件系统（尤其 `~/.ssh`、`~/.aws` 等敏感目录）和网络（出站连接限制）的访问。即使恶意 Skill 绕过权限控制，沙箱也能contain 其影响范围。
- **Sub-Agent 权限应与父会话隔离且默认 deny**：Sub-Agent 的 `permissionMode` 设计允许攻击者控制的配置文件覆盖用户安全设置。正确的做法是企业 managed settings 应强制覆盖 Agent 定义文件中的 `permissionMode`，并默认设置 `deny: ["Bash(*)"]`。同时安全审计应关注 `.claude/agents/` 目录下所有 Agent 定义文件，而非仅关注 Skill 文件。
- **npm/PyPi 等包管理器的攻击模式可迁移到 Skill 攻击**：文章证明攻击者可以构造一个看似正常的"npm 包安装测试" Skill，实际通过包内后门代码实现 RCE。企业安全培训应将"不在生产环境运行来自不可信来源的 pip/npm install" 的意识扩展到"不在 AI 编码工具中安装不可信的 Skill/Agent 定义"。WIZ 的包供应链安全指南（`wiz.io/blog/practical-package-security`）提供了通用的开发者环境安全加固建议。
- **检测与响应：MTTR 是关键指标**：如果恶意 Skill 已成功执行，止血速度至关重要。安全团队应具备快速 revoke SSH authorized_keys、revoke SES/云凭证、终止可疑进程的能力。建议在 SOC 告警体系中加入"AI 编码工具异常命令执行"的检测规则，类似于 Splunk 或 CrowdStrike 的 EDR 告警。

---

