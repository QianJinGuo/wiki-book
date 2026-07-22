---
title: 打造可靠的 AI 编程环境：Claude Code Hooks 完整开发者指南
source_url: https://mp.weixin.qq.com/s/cPfbk0ssRk1MHkBJ27E00w
publish_date: 2026-05-16
tags: [wechat, article, claude, agent, rag, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: 0fd2cda2607fb097b5d1a9673ffae74bb4bbe676388446ca9b257856229fe6e1
---
# 打造可靠的 AI 编程环境：Claude Code Hooks 完整开发者指南
Claude Code 擅长写代码，但它本质上仍然是一个概率系统。你可以要求它在每次编辑文件后运行 Prettier。你可以把这个指令写进  ` CLAUDE.md  ` 。但有些时候，它就是会……忘记。
** Claude Code hooks  ** 解决的正是这个问题：在每次操作前、过程中和之后提供确定性的控制，让这些规则变成真正会被执行的流程。
过去几个月里，我在多个项目中使用了 hooks，它已经成为整个 Claude Code 工作流中不可或缺的一部分。本文会从基础讲起，带你搭建一套可以直接落地使用的配置。
##  Claude Code Hooks 是什么？
Claude Code hooks 本质上就是一些你自己定义的操作，比如 shell 命令、HTTP 调用，或者额外的提示，它们会在 Claude Code 的不同阶段自动执行。
和写在提示词里的约定不一样，hooks 是  ** 一定会触发的  ** ，不会被「忘掉」。这也意味着你可以更稳定地控制一些事情，比如代码格式化、安全检查、通知，或者整个开发流程里的自动化步骤。
###  概率性问题
关键点在这里：  ** CLAUDE.md 里的规则更像是建议，而不是强制执行的约束  ** 。
你可以写下  ` “编辑 TypeScript 文件后总是运行 npx prettier --write”  ` ，大多数时候 Claude 会照做。但问题就在于——「大多数时候」是不够的。当你需要统一代码格式、阻止代码进入生产，或者记录关键操作时，这种不确定性就会变成隐患。
这其实是所有 AI 编码工具都会遇到的问题：Claude 本质上是语言模型，是基于概率工作的。你可以通过上下文去引导它，但没办法保证它每次都按规则执行。
###  Hooks 如何解决这个问题
Hooks 的思路很直接：不再依赖 LLM 的「记不记得」，而是直接在关键节点插入确定性的执行逻辑。
它们会在特定的生命周期阶段触发，比如工具运行前（  ` PreToolUse  ` ）、运行后（  ` PostToolUse  ` ）、收到通知时、会话开始，或者 Claude 停止时。可以把它理解成给 AI 编码流程加了一层「自动执行的钩子」，有点类似 Git hooks，只不过作用对象换成了 Claude。
目前主要有四种类型：
* •  ** command  ** ：执行 shell 脚本
* •  ** HTTP  ** ：发送 webhook 请求
* •  ** prompt  ** ：做一次简单的 LLM 判断（比如是/否）
* •  ** agent  ** ：启动一个带工具能力的子 agent
实际用下来，大部分场景用 command 就够了，能覆盖 90% 的需求。
##  Hooks 工作原理：事件驱动的四步流程
Claude Code hooks 的执行流程其实很简单：当某个事件触发（比如  ` PreToolUse(Write)  ` ）时，系统会先检查匹配规则，看有没有对应的 hook 需要执行。如果匹配上，就运行你的 hook 脚本，并通过 stdin 传入一段 JSON 数据。
脚本执行完之后，会根据退出码决定下一步：
* • 返回  ` 0  ` ：继续执行原操作
* • 返回  ` 2  ` ：直接阻止这次操作
不管你用的是哪种类型的 hook，这套流程都是一样的。
###  事件 → 匹配器 → Hook → 退出码（4步流程）
每个 hook 的执行流程其实就是这四步：
    1. 事件触发          例如 PreToolUse(Write)  
           |  
    2. 匹配器检查        看 "Write" 是否命中 hook 的匹配规则  
           |  
    3. Hook 执行         运行脚本，通过 stdin 收到 JSON  
           |  
    4. 退出码决定        0 = 放行 | 2 = 拦截 | 其他 = 报错
传给脚本的 JSON 里，会包含这次操作的完整信息，比如  ` tool_name  ` 、  ` tool_input  ` （文件路径、内容、命令）以及一些会话上下文。你只需要读这个 JSON，然后按自己的规则处理，最后返回一个退出码。
在  ` PreToolUse  ` 这种场景里，退出码  ` 2  ` 特别有用：它可以直接拦下这次操作，并把你输出的内容作为反馈返回给 Claude。Claude 会根据这段反馈调整接下来的行为。
###  配置作用域：用户、项目和本地
Hooks 可以放在三个层级的  ` settings.json  ` 中：
作用域  |  文件  |  提交到 Git？  |  用例
---|---|---|---
User  |  ` ~/.claude/settings.json  ` |  否  |  个人默认配置（通知、格式化偏好）
Project  |  ` .claude/settings.json  ` |  是  |  团队共享规则（文件保护、测试、lint）
Local  |  ` .claude/settings.local.json  ` |  否（gitignore）  |  当前项目的个人覆盖
实际用下来，  ** 最有价值的是 Project 这一层  ** 。把 hooks 写进  ` .claude/settings.json  ` 并提交到仓库后，团队里的每个人都会自动用上同一套规则，不需要再手动配置一遍，也更不容易出现环境不一致的问题。
除了在  ` settings.json  ` 或插件中配置，hooks 也可以直接定义在  ** skills  ** 和  ** subagents  ** 里，通过 frontmatter 声明。这类 hooks 作用域仅限组件生命周期，并在执行结束后自动清理。
** 注意  ** ：在 subagent 中定义的  ` Stop  ` hook，会自动转换为  ` SubagentStop  ` ，因为子 agent 结束时触发的就是这个事件。
###  ` if  ` 字段：更细粒度的过滤
从 Claude Code v2.1.85 开始，hooks 支持  ` if  ` 字段，可以按参数过滤，而不只是看工具名称。比如以前你只能匹配  ` Bash  ` ，那所有 Bash 命令都会触发；现在可以只针对像  ` git push  ` 这样的特定命令生效：
    {  
      "matcher": "Bash",  
      "if": "tool_input.command matches 'git push'",  
      "hooks": [{ "type": "command", "command": "./scripts/check-branch.sh" }]  
    }
这个改动其实很关键。以前要么匹配太宽（所有 Bash 都触发），要么只能把判断逻辑写在脚本里，配置和实现混在一起，容易变乱。现在可以直接在配置层把范围收紧，逻辑更清晰，也更好维护。
###  JSON 输出：更精细的控制
除了退出码，hooks 还可以返回结构化 JSON，用来更精确地控制行为。
** PreToolUse：执行前控制  **
    {  
      "hookSpecificOutput": {  
        "hookEventName": "PreToolUse",  
        "permissionDecision": "allow",  
        "permissionDecisionReason": "安全读取操作",  
        "updatedInput": { "command": "modified-command" },  
        "additionalContext": "Context for Claude"  
      }  
    }
常见字段说明：
* •  ` allow  ` ：直接放行（跳过权限检查）
* •  ` deny  ` ：阻止执行，并说明原因
* •  ` ask  ` ：让用户确认
* •  ` updatedInput  ` ：在执行前修改参数（比如改命令）
* •  ` additionalContext  ` ：给 Claude 补充信息
** PermissionRequest：权限阶段控制  **
    {  
      "hookSpecificOutput": {  
        "hookEventName": "PermissionRequest",  
        "decision": {  
          "behavior": "allow",  
          "updatedInput": { "command": "npm run lint" }  
        }  
      }  
    }
** Stop / SubagentStop：结果阶段约束  **
    {  
      "decision": "block",  
      "reason": "测试失败。请在完成测试前修复它们"  
    }
##  Hooks 事件类型：快速参考表
Claude Code 在整个运行过程中提供了 20 多种 hook 事件（可以在官方文档和 changelog 里查到完整列表）。但实际用下来，最常用的还是这几个：  ` PreToolUse  ` 、  ` PostToolUse  ` 、  ` Notification  ` 和  ` Stop  ` 。
像  ` ConfigChange  ` 、  ` FileChanged  ` 这些新一点的事件，更适合做一些高级自动化。
下面是一个常用事件的速查表：
事件  |  何时触发  |  可阻止？  |  常见用例
---|---|---|---
** SessionStart  ** |  会话开始时  |  否  |  注入上下文、初始化环境
** UserPromptSubmit  ** |  用户提交提示时  |  是  |  输入校验、内容过滤
** PreToolUse  ** |  工具执行之前  |  是  |  阻止危险命令、保护关键文件
** PermissionRequest  ** |  权限请求弹出时  |  是  |  自动批准或拒绝
** PermissionDenied  ** |  权限失败时  |  否  |  记录审计、告警
** PostToolUse  ** |  工具完成之后  |  否  |  自动格式化、运行测试、记录操作
** PostToolUseFailure  ** |  工具执行失败后  |  否  |  错误处理、补偿逻辑
** Notification  ** |  Claude 发送通知时  |  否  |  桌面通知、Slack 推送
** SubagentStart  ** |  子 agent 启动时  |  否  |  监控执行过程
** SubagentStop  ** |  子 agent 结束时  |  是  |  校验输出结果
** TaskCreated  ** |  新任务创建时  |  是  |  做任务跟踪
** TaskCompleted  ** |  任务完成时  |  是  |  做任务跟踪
** Stop  ** |  Claude 完成响应时  |  是  |  收尾清理、生成总结
** ConfigChange  ** |  配置变更时  |  是  |  热更新配置
** FileChanged  ** |  文件变化时  |  否  |  触发构建、刷新缓存
** WorktreeCreate  ** |  创建 Git worktree 时  |  是  |  初始化环境
** PreCompact  ** |  上下文压缩前  |  是  |  保存关键状态
** PostCompact  ** |  上下文压缩后  |  否  |  恢复关键上下文
** SessionEnd  ** |  会话结束时  |  否  |  清理资源、记录日志
大部分场景，其实用好  ` PreToolUse  ` 和  ` PostToolUse  ` 就够了。如果再加一个  ` SessionStart  ` ，基本可以覆盖大多数日常自动化需求。
##  四种 Hook 类型详解
Claude Code 支持四种 hook 类型：
类型  |  速度  |  复杂度  |  最适合  |  示例
---|---|---|---|---
Command  |  快  |  低  |  格式化、拦截、记录  |  编辑文件后运行 Prettier
HTTP  |  中  |  中  |  外部集成、webhook  |  完成后通知 Slack
Prompt  |  慢  |  中  |  简单判断  |  ` “这段代码是否安全？”  `
Agent  |  最慢  |  高  |  复杂校验  |  检查代码是否符合项目规范
###  Command Hooks（主力军）
Command hooks 本质上就是执行一段 shell 命令，并通过退出码决定结果。执行时会通过 stdin 拿到一份 JSON，里面包含当前操作的所有信息。
    {  
      "hooks": {  
        "PreToolUse": [{  
          "matcher": "Bash",  
          "hooks": [{  
            "type": "command",  
            "command": "jq -r '.tool_input.command' | grep -q 'rm -rf /' && exit 2 || exit 0"  
          }]  
        }]  
      }  
    }
大多数实际场景都会用到它——比如代码格式化、文件保护、通知、以及各种自动化流程。优点也很直接：快、简单、可控。
** 实用技巧  ** ：可以加上  ` async: true  ` ，让 hook 在后台执行，不阻塞 Claude 的流程，适合用在日志记录、通知这类不需要同步完成的操作。
###  HTTP Hooks（外部集成）
HTTP hooks 会把当前事件以 JSON 的形式 POST 到一个 URL，然后根据返回的状态码决定结果。它很适合用来对接外部系统，比如发消息到 Slack、Discord、PagerDuty，或者接入你自己的监控和仪表板。如果需要更严格的控制，也可以在执行操作前先请求外部服务，让它来决定是否放行。
    {  
      "hooks": {  
        "Stop": [{  
          "matcher": "",  
          "hooks": [{  
            "type": "http",  
            "url": "https://your-api.com/claude-webhook"  
          }]  
        }]  
      }  
    }
和 command hooks 不同，这里没有「退出码」，而是完全依赖  ** HTTP 状态码 + 响应内容  ** 。
Response  |  行为
---|---
** 2xx + 空 body  ** |  成功，相当于  ` exit 0  `
** 2xx + 文本  ** |  成功，文本会作为上下文传给 Claude
** 2xx + JSON  ** |  成功，按 command hooks 的 JSON 结构解析
** 非 2xx 状态码  ** |  不会阻止，只记录错误并继续
** 连接失败 / 超时  ** |  不会阻止，只记录错误并继续
** 关键区别  ** ：HTTP 状态码本身无法阻止操作，即使返回 4xx / 5xx，也只是记录错误，流程还是会继续。如果你真的想「拦住」某个操作，必须返回 2xx + 特定 JSON 结构：
    {  
      "hookSpecificOutput": {  
        "hookEventName": "PreToolUse",  
        "permissionDecision": "deny",  
        "permissionDecisionReason": "被安全策略阻止"  
      }  
    }
HTTP hooks 支持在 headers 里使用环境变量，但前提是：  ** 这些变量必须显式写在  ` allowedEnvVars  ` 里  ** 。这是为了避免无意中泄露敏感信息。
    {  
      "type": "http",  
      "url": "https://hooks.example.com/validate",  
      "headers": {  
        "Authorization": "Bearer $API_KEY",  
        "X-Team-Id": "$TEAM_ID"  
      },  
      "allowedEnvVars": ["API_KEY", "TEAM_ID"]  
    }
有一个很容易忽略的点：  ** 未声明的变量会被解析为空字符串，不会报错  ** 。
###  Prompt Hooks（AI 驱动的决策）
Prompt hooks 会把当前事件的数据再交给 Claude，让它做一次简单判断（通常是放行还是阻止）。返回结果是一个 JSON，比如  ` "decision": "allow"  ` 或  ` "block"  ` ，同时带上简单的理由。
    {  
      "hooks": {  
        "PreToolUse": [{  
          "matcher": "Bash",  
          "hooks": [{  
            "type": "prompt",  
            "prompt": "这个 bash 命令在生产环境中运行安全吗？考虑：它是否修改系统文件、删除数据或访问敏感凭据？"  
          }]  
        }]  
      }  
    }
这类 hook 要慎用——每触发一次，就相当于多跑了一次模型调用，既有延迟也有成本。
但在一些确实需要「判断」的场景下，它很有用，比如：
* • 这个数据库迁移是不是有破坏性
* • 这段代码是否存在明显风险
这种主观判断，用规则很难写清楚，用 prompt hook 反而更合适。另外，prompt hook 用的模型就是你当前会话里的模型，不需要单独配置。
###  Agent Hooks（工具辅助验证）
Agent hooks 会启动一个子 agent，这个子 agent 可以用 Read、Grep、Glob 等工具，在做决定之前先去读文件、查代码。
    {  
      "hooks": {  
        "PreToolUse": [{  
          "matcher": "Write",  
          "hooks": [{  
            "type": "agent",  
            "prompt": "检查正在写入的文件是否遵循项目的命名约定和导入模式。阅读 .claude/CONVENTIONS.md 了解规则。"  
          }]  
        }]  
      }  
    }
可以把它理解成：在关键操作前，先让「另一个 Claude」帮你做一轮更深入的检查。
这也是最强的一种 hook，但代价也最大——更慢、更复杂。一般只在那种必须看上下文才能判断的高风险场景下使用，比如代码规范校验、复杂逻辑检查等。
##  7 个生产级 Hook 示例（开箱即用）
在实际项目里，最常用的一些 hooks 基本都围绕这几件事：自动格式化（Prettier / Black）、保护关键文件、任务完成时发通知、会话开始时注入上下文、代码变更后跑测试、限制分支操作，以及记录所有工具使用。
下面的每个示例，都是可以直接用的  ` settings.json  ` 片段，放到  ` .claude/settings.json  ` 就能生效。如果想看更多玩法，可以参考社区里的一些整理（比如  awesome-claude-code  [1]  ）。
###  1\. 自动格式化
    {  
      "hooks": {  
        "PostToolUse": [{  
          "matcher": "Write|Edit",  
          "hooks": [{  
            "type": "command",  
            "command": "FILE=$(jq -r '.tool_input.file_path // .tool_input.file' /dev/stdin); case \"$FILE\" in *.ts|*.tsx|*.js|*.jsx) npx prettier --write \"$FILE\" 2>/dev/null;; *.py) black \"$FILE\" 2>/dev/null;; esac; exit 0"  
          }]  
        }]  
      }  
    }
这个 hook 会在每次  ` Write  ` 或  ` Edit  ` 后触发，从 stdin 的 JSON 里拿到文件路径，然后按文件类型运行对应的格式化工具。
最后的  ` exit 0  ` 很关键——不管格式化有没有成功，都不会阻止 Claude 的操作。一般来说，格式化失败不应该打断流程。
一个实用建议：如果你是多语言项目，可以顺手加上：
* •  ` *.go  ` →  ` gofmt  `
* •  ` *.rs  ` →  ` rustfmt  `
###  2\. 保护敏感文件
    {  
      "hooks": {  
        "PreToolUse": [{  
          "matcher": "Write|Edit",  
          "if": "tool_input.file_path matches '(\\.env|\\.env\\.local|package-lock\\.json|yarn\\.lock|pnpm-lock\\.yaml)'",  
          "hooks": [{  
            "type": "command",  
            "command": "echo '{\"message\": \"BLOCKED: 此文件受保护。请手动编辑。\"}' && exit 2"  
          }]  
        }]  
      }  
    }
关键点是  ` exit 2  ` ：它会阻止这次操作，并把你输出的 JSON 当作反馈返回给 Claude。Claude 收到后一般会改成提示你手动处理。  ` if  ` 这一层也很重要——只在匹配这些文件时才触发，不会影响其他正常写入操作。
###  3\. 完成通知
    {  
      "hooks": {  
        "Notification": [{  
          "matcher": "",  
          "hooks": [{  
            "type": "command",  
            "command": "MSG=$(jq -r '.message // \"Claude Code 任务完成\"' /dev/stdin); if [ \"$(uname)\" = 'Darwin' ]; then osascript -e \"display notification \\\"$MSG\\\" with title \\\"Claude Code\\\"\"; else notify-send 'Claude Code' \"$MSG\"; fi; exit 0"  
          }]  
        }]  
      }  
    }
适用于 macOS（osascript）和 Linux（notify-send）。  ` matcher  ` 为空表示会匹配所有通知事件。你可以放心把长任务丢给 Claude，然后切去做别的事，等系统弹窗提醒你结果就行。
###  4\. 会话上下文注入
    {  
      "hooks": {  
        "SessionStart": [{  
          "matcher": "",  
          "hooks": [{  
            "type": "command",  
            "command": "echo '{\"message\": \"项目: '\"$(basename $(pwd))\"' | 分支: '\"$(git branch --show-current 2>/dev/null || echo none)\"' | 最后提交: '\"$(git log --oneline -1 2>/dev/null || echo none)\"'\"}'; exit 0"  
          }]  
        }]  
      }  
    }
这会把当前项目名、Git 分支和最近一次提交带入每个会话。Claude 会自动读取这些信息，不用你再手动说明当前在哪个分支上。
###  5\. 自动运行测试
    {  
      "hooks": {  
        "PostToolUse": [{  
          "matcher": "Write|Edit",  
          "if": "tool_input.file_path matches '\\.(ts|tsx|js|jsx|py)$'",  
          "hooks": [{  
            "type": "command",  
            "command": "FILE=$(jq -r '.tool_input.file_path' /dev/stdin); TEST_FILE=$(echo \"$FILE\" | sed 's/\\.[^.]*$/.test&/'); if [ -f \"$TEST_FILE\" ]; then npx jest \"$TEST_FILE\" --no-coverage 2>&1 | tail -5; fi; exit 0",  
            "timeout": 30000  
          }]  
        }]  
      }  
    }
如果检测到对应的测试文件存在，它会在 Claude 修改源代码后自动运行测试。  ` tail -5  ` 用来控制输出长度，避免日志太长，  ` timeout  ` 则防止测试卡住或失控。这个配置和 AI 驱动的代码审查流程配合得很好。
###  6\. 分支保护强制执行（高级）
    {  
      "hooks": {  
        "PreToolUse": [{  
          "matcher": "Bash",  
          "if": "tool_input.command matches 'git push.*(main|master|production)'",  
          "hooks": [{  
            "type": "command",  
            "command": "echo '{\"message\": \"BLOCKED: 直接推送到受保护分支。使用功能分支并打开 PR。\"}' && exit 2"  
          }]  
        }]  
      }  
    }
这会阻止任何对 main、master 或 production 分支的  ` git push  ` 操作。Claude 会收到失败反馈，并通常会改为建议你切到功能分支再提交。
###  7\. 安全审计日志（高级）
    {  
      "hooks": {  
        "PostToolUse": [{  
          "matcher": "Bash",  
          "hooks": [{  
            "type": "command",  
            "command": "INPUT=$(cat /dev/stdin); CMD=$(echo \"$INPUT\" | jq -r '.tool_input.command'); echo \"[$(date -u +%Y-%m-%dT%H:%M:%SZ)] BASH: $CMD\" >> .claude/audit.log; exit 0"  
          }]  
        }]  
      }  
    }
它会把 Claude 执行的每一条 Bash 命令记录到审计日志中，并附带 UTC 时间戳。这个日志在做安全审查或者回溯「当时到底执行了什么」时特别有用。一般建议把  ` .claude/audit.log  ` 加到  ` .gitignore  ` 里，避免被提交到仓库。
##  开箱即用的 Hooks 入门配置
一个比较通用的入门配置，通常会包含这几类 hooks：
* • 文件编辑后自动格式化
* • 任务完成时发送通知
* • 保护敏感文件
* • 会话开始时注入上下文
* • 在结束时做一些清理（Stop hook）
基本上可以用在每一个新项目中，可以根据具体技术栈做一点调整，但整体结构基本不变。
###  完整配置
    {  
      "hooks": {  
        "SessionStart": [{  
          "matcher": "",  
          "hooks": [{  
            "type": "command",  
            "command": "echo '{\"message\": \"项目: '\"$(basename $(pwd))\"' | 分支: '\"$(git branch --show-current 2>/dev/null)\"' | Node: '\"$(node -v 2>/dev/null)\"'\"}'; exit 0"  
          }]  
        }],  
        "PreToolUse": [{  
          "matcher": "Write|Edit",  
          "if": "tool_input.file_path matches '(\\.env|\\.env\\..+|.*lock\\.json|.*lock\\.yaml)'",  
          "hooks": [{  
            "type": "command",  
            "command": "echo '{\"message\": \"受保护的文件。请手动编辑。\"}' && exit 2"  
          }]  
        }],  
        "PostToolUse": [{  
          "matcher": "Write|Edit",  
          "hooks": [{  
            "type": "command",  
            "command": "FILE=$(jq -r '.tool_input.file_path // .tool_input.file' /dev/stdin); case \"$FILE\" in *.ts|*.tsx|*.js|*.jsx) npx prettier --write \"$FILE\" 2>/dev/null;; *.py) black \"$FILE\" 2>/dev/null;; *.go) gofmt -w \"$FILE\" 2>/dev/null;; esac; exit 0"  
          }]  
        }],  
        "Notification": [{  
          "matcher": "",  
          "hooks": [{  
            "type": "command",  
            "command": "MSG=$(jq -r '.message // \"完成\"' /dev/stdin); osascript -e \"display notification \\\"$MSG\\\" with title \\\"Claude Code\\\"\" 2>/dev/null || notify-send 'Claude Code' \"$MSG\" 2>/dev/null; exit 0"  
          }]  
        }],  
        "Stop": [{  
          "matcher": "",  
          "hooks": [{  
            "type": "command",  
            "command": "echo '[STOP] '\"$(date +%H:%M:%S)\"'' >> .claude/session.log; exit 0"  
          }]  
        }]  
      }  
    }
###  如何针对你的技术栈定制
技术栈  |  格式化命令  |  测试命令  |  监视扩展名
---|---|---|---
** Node/TypeScript  ** |  ` npx prettier --write  ` |  ` npx jest --no-coverage  ` |  ` .ts, .tsx, .js, .jsx  `
** Python  ** |  ` black  ` |  ` pytest -x  ` |  ` .py  `
** Go  ** |  ` gofmt -w  ` |  ` go test ./...  ` |  ` .go  `
** Rust  ** |  ` rustfmt  ` |  ` cargo test  ` |  ` .rs  `
把前面那些 hooks 示例里的格式化命令、测试命令和文件匹配规则，替换成你当前技术栈对应的版本就行了，整体结构基本不用动。
###  验证 Hooks 是否生效
可以用下面三种方式快速确认 hooks 有没有正常工作：
** 1\.  ` /hooks  ` 命令  **
在 Claude Code 里输入  ` /hooks  ` ，可以看到当前注册的所有 hooks，包括匹配器和启用状态。这是最直接的查看方式。
** 2\. 检查配置文件  **
直接查看配置：
* •  ` ~/.claude/settings.json  ` （用户级）
* •  ` .claude/settings.json  ` （项目级）
确认你的 hooks 是否真的写进去了、有没有拼写或结构问题。
** 3\. 快速开关  **
在  ` settings.json  ` 里加上  ` "disableAllHooks": true  ` 可以临时关闭所有 hooks（不用删配置）。需要恢复时，删掉这一行或改成  ` false  ` 即可。
##  CI/CD 集成与实践
Claude Code 的 hooks 在 Headless 模式（  ` claude -p  ` ）下同样可以工作，不过有一些需要注意的差异：
* •  ` Notification  ` hooks 依然会触发，但在 CI 环境里更适合改成写日志，而不是发桌面通知
* •  ` PreToolUse  ` 返回退出码 2 时，可以直接中断流程，用于插入人工审核步骤
在实际项目中，通常会把 hooks 和 CI 一起用，比如在 GitHub Actions 里通过  ` anthropics/claude-code-action@v1  ` 跑自动化流程，把格式化、校验、拦截这些逻辑统一放进去。
###  Headless 模式行为
Hook 事件  |  交互模式  |  Headless 模式  |  CI 建议
---|---|---|---
PreToolUse (退出 2)  |  阻止并提示  |  暂停（可  ` --resume  ` ）  |  用于强制人工审批
PostToolUse  |  正常执行  |  正常执行  |  保留格式化、日志等操作
Notification  |  桌面通知  |  仍触发（无 UI）  |  改为写日志或发 Slack
Stop  |  执行清理  |  执行清理  |  用于收集 CI 产物
SessionStart  |  注入上下文  |  注入上下文  |  注入 CI 环境变量
在 Headless 模式下，有一个很容易被忽略但非常实用的点：当 PreToolUse 返回退出码 2 时，并不会只是简单失败，而是暂停整个流程，等待你用  ` --resume  ` 恢复。这相当于在 CI 流水线里加了一个「人工审批节点」，可以在关键操作前强制人工介入。
###  GitHub Actions 集成
这是一个最小可用的 GitHub Actions 示例，用来在 CI 中运行 Claude Code：
    - name: 运行 Claude Code  
      uses: anthropics/claude-code-action@v1  
      with:  
        prompt: "审查此 PR 并建议改进"  
        allowed_tools: "Read,Grep,Glob"  
      env:  
        ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
你的  ` .claude/settings.json  ` 会跟着仓库一起进入 CI 环境，所以这些 hooks 在 CI 里的触发方式和本地是一样的。需要注意的是，如果某些 hooks 依赖本地环境（比如  ` osascript  ` 这种桌面通知），最好加上兜底逻辑或者条件判断，避免在 CI 里出问题。
###  团队 Hook 管理
在团队里，一个比较稳定的做法是按作用域分层管理 hooks：
* •  **` .claude/settings.json  ` （提交到仓库）  ** —— 放团队共享规则，比如文件保护、自动格式化、分支保护。这一层相当于「团队规范」，所有人都会生效。
* •  **` .claude/settings.local.json  ` （gitignore）  ** —— 放个人配置，比如通知方式、自定义日志、实验性 hooks，只对自己生效。
* •  **` ~/.claude/settings.json  ` （全局）  ** —— 放跨项目的默认设置，比如通知风格、格式化偏好。
团队统一规则（类似  ` .editorconfig  ` ） + 本地个人配置（类似 IDE 设置）。当共享 hooks 固化在仓库里之后，「在我机器上没问题」的情况会明显减少。
##  常见问题与故障排查
###  Hook 没有触发
** Matcher 拼写问题  ** ：matcher 区分大小写，比如  ` "write"  ` 不会匹配  ` Write  ` 。可以用  ` /hooks  ` 查看实际的工具名称。
** JSON 格式错误  ** ：少一个逗号或括号，整个 hooks 可能直接失效，而且没有明显提示。可以用  ` jq . settings.json  ` 检查格式。
** 被全局禁用了  ** ：检查是否存在：  ` "disableAllHooks": true  ` ，如果有，所有 hooks 都不会执行。
###  Hook 运行但不阻止
** 退出码用错了  ** ：  ` exit 1  ` 表示「执行出错」，不是「阻止操作」。  如果要拦截，必须用  ` exit 2  ` 。这是最常见的坑。
** 没有返回提示信息  ** ：阻止操作时，最好返回一段 JSON，让 Claude 知道原因：  ` echo '{"message": "阻止: 原因"}'  `
###  无限循环
** Stop hook 触发了新的操作  ** ：如果你的  ` Stop  ` hook 里又去写文件、执行命令，可能会再次触发 Claude 的流程，从而进入循环。建议  ` Stop  ` hook 只做「被动操作」，比如记录日志、发送通知、清理资源。
** PostToolUse hook 引发二次编辑  ** ：如果  ` PostToolUse  ` hook 修改了文件，就会再次触发  ` PostToolUse  ` ，形成连锁反应。建议限制 matcher（只匹配特定文件或操作）或使用  ` if  ` 条件避免重复触发。
###  性能问题
** SessionStart 太重  ** ：所有  ` SessionStart  ` hooks 会在启动时同步执行，如果数量多或逻辑复杂，就会拖慢启动。建议使用轻量操作，每个最好在 1 秒内完成。
** 热路径里跑重脚本  ** ：  ` PreToolUse  ` 和  ` PostToolUse  ` 会频繁触发，如果里面有网络请求或重计算，很容易拖慢整体速度。建议给 hook 加  ` timeout  ` （毫秒）或者把逻辑拆到 HTTP hook / 后端服务里处理.
** 没有做缓存  ** ：如果每次都重复做同样的检查（比如查当前分支、判断是否受保护），性能会很差。建议把结果缓存到临时文件，避免每次都跑一遍 Git 或其他命令。
####  引用链接
` [1]  ` awesome-claude-code:  _ https://github.com/hesreallyhim/awesome-claude-code  _
** 既然看到这里了，如果觉得有启发，随手点个赞、推荐、转发三连吧，你的支持是我持续分享干货的动力。  **