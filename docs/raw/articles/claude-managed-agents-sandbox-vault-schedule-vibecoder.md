---
title: "Claude Managed Agents 脑手分离升级：sandbox、vault 和状态层怎么拼起来"
source_url: "https://mp.weixin.qq.com/s/pZMg55Ol57baA-CB3gLtxg"
author: "VibeCoder"
feed: "Vibe编码"
publish_time: "2026-06-11"
ingested: 2026-06-11
sha256: "03fb9b0ca3c87a8fef2b0a0bf9efd19f4ec68df53bbaa3e7805579ce10130679"
type: raw
tags: [anthropic, claude, managed-agents, sandbox, vault, schedule, agent-architecture, credential-management]
review_value: 7
review_confidence: 8
review_stars: 4
sources: ['anthropic-claude-managed-agents-platform-2026']
---

# Claude Managed Agents 脑手分离升级：sandbox、vault 和状态层怎么拼起来

> VibeCoder / Vibe编码 | 2026-06-11
> 原始博客：https://claude.com/blog/whats-new-in-claude-managed-agents

Anthropic 发了一篇 Claude Managed Agents 更新博客：Agent 可以按 schedule 自动运行，vault 可以保存环境变量形式的 credential，让 sandbox 里的 CLI 访问已授权服务。

这两个功能单独看都不复杂。一个像托管版 cron，一个像托管版 secret store。但放在 Claude Managed Agents 的整体对象模型里看，它其实是在补生产 Agent 的两块地基：长期运行和安全接入。

## 它到底更新了什么

Scheduled deployments 让 Agent 按 cron 触发。每次触发会启动一个新的 session，执行预先配置好的任务。比如每晚同步数据、每周跑合规扫描、每天生成业务摘要。你可以暂停、恢复、归档，也可以手动触发一次。

另一块是 vault environment variables。你把 API key 注册进 vault，声明它对应哪个环境变量名，以及允许访问哪些域名。sandbox 里的 CLI 读到的只是一个占位值。真实密钥在网络边界才被附加到请求上，并且只会发往你允许的域名。

这点挺关键。很多企业系统已经有 CLI，Notion、Sentry、Ramp、Browserbase、KERNEL 这类工具都有自己的命令行入口。让 Agent 安全调用现成 CLI，比每个系统都重新写 MCP server 轻很多。

## 脑手分离

我会把 Claude Managed Agents 看成四层。

Agent 是脑，里面有模型、system prompt、工具、MCP server 和 skill。它决定怎么拆任务、用什么工具、什么时候停下来。

Sandbox 是手。它是隔离 Linux 容器，负责跑 bash、读写文件、调用 CLI、连外部服务。Claude 文档里写得很具体：cloud sandbox 预装 Python、Node、Go、Rust、Java、Ruby、PHP、C/C++，也带 git、curl、jq、rg、SQLite、psql、redis-cli 这些工具。

Vault 是身份证。它保存第三方 credential，并在创建 session 时引用。Agent 可以代表某个用户或团队访问系统，但模型拿不到真实 secret。

Session 和 memory 是状态层。session 记录一次任务的对话、工具调用、sandbox 状态和输出；memory store 挂载到 /mnt/memory/，跨 session 持久化，用普通文件读写。

这个拆法的好处是，生产 Agent 最容易缠在一起的几件事被拆开了：谁在思考，动作在哪里执行，用哪个身份访问，哪些状态要留下。

## sandbox 和 vault 的关系

sandbox 管执行边界，vault 管身份边界。

只看 sandbox，它解决的是 Agent 能不能安全跑命令。比如它能访问哪些文件，能不能出网，可以装哪些依赖，有没有 psql 或 redis-cli。cloud environment 是配置，sandbox 是每个 session 拿到的 fresh container。多个 session 可以引用同一个 environment，但文件系统不共享。

只看 vault，它解决的是 Agent 能不能以受控身份访问外部系统。以前 MCP OAuth token 可以放 vault，这次新增的 env var credential 把 CLI 也接进来了。CLI 不需要知道平台背后怎么保护密钥，它照常读环境变量，照常发 HTTP 请求。

真正巧的地方在两层合在一起：sandbox 里的进程只看到 placeholder，真实 key 不在 shell history、不在文件系统、不在 tool result，也不会被模型复制出来。到了网络边界，平台检查域名，匹配上 allowed domains，才把真实 credential 附到请求上。

这和普通环境变量差别很大。普通 env var 对进程可读，Agent 如果能跑 env，基本就能看到。vault 的占位值机制把 secret 从进程环境里拿走，把授权动作推到出网请求那里。安全边界从进程内变量变成网络请求边界。

当然，这也意味着它最适合那些通过 HTTP 请求携带 key 的 CLI。原文也说，大多数把 key 放进 HTTP 请求的 CLI 都适配这种方式。如果某个工具必须在本地直接读真实 key、做非 HTTP 握手，兼容性就要单独评估。

## schedule 逼着你重新想状态

schedule 最大的误区，是把它想成一个一直活着的 Agent。

文档里的语义更像 session factory。deployment 绑定 cron 表达式、timezone、agent、environment、初始 user message。时间到了，平台创建一个 deployment run，然后启动一个 session。成功的 run 会关联 session_id，失败的 run 会记录错误类型。

这就带来一个工程后果：不要把跨天状态塞进 sandbox 临时文件。

如果每天跑一个日报 Agent，它今天在 /tmp/report.csv 留下的文件，不该假设明天还在。明天是新的 session、新的 sandbox。需要留下来的东西要放在合适的位置。

短期中间产物放 sandbox。一次任务的过程放 session event stream。跨任务的偏好、项目规范、运行摘要放 memory store。业务里的权威数据放数据库、SaaS、仓库或你自己的产品后端。

memory store 的设计我挺喜欢。它的入口很实在：直接挂载成 /mnt/memory/ 下的目录。Agent 用 read、write、edit、grep 这些普通文件工具维护记忆。写入会同步回 store，还能用 read_only 和 read_write 控制权限。

文件系统形态有一个朴素优点：人能看，程序能扫，版本也容易做。对 Agent 来说，能 grep 的记忆比一个黑盒向量库更可控。

## 这套东西适合什么场景

我会优先拿它试三类任务。

第一类是固定节奏的后台流程，比如日报、周报、合规扫描、销售线索刷新、招聘跟进、生产日志巡检。这类任务天然适合 schedule，失败了也容易人工补救。

第二类是已有 CLI 的企业工具链。内部系统经常先有 CLI，再有 SDK，再考虑协议化开放。vault env vars 让这些 CLI 可以先跑起来，后面再决定要不要做 MCP。

第三类是需要访问私有数据，但不想把 secret 暴露给模型的 Agent。比如查数据库里的用量异常、读 Sentry 事件、上传 Notion 文件、调用浏览器基础设施。vault 和 network allowlist 合起来，能把访问面压得比较窄。

我暂时不会把它直接放在强事务写路径里。比如自动退款、自动改账、自动删除生产数据，这些动作需要额外的 approval、幂等设计、回滚策略和业务审计。Managed Agents 给了执行层，不代表业务控制可以省掉。

## 和编码 Agent 的区别

很多人会把它和 Claude Code、Codex、Cursor、Windsurf 放一起比较。我觉得要分开看。

IDE 里的 Agent 更偏即时协作。它读当前代码、改文件、跑测试、让你 review diff。Claude Code 的动态工作流也偏复杂开发任务拆分和并行执行。

Managed Agents 更像后端 worker。它面向长任务、异步任务、生产系统连接、session 状态、vault 身份、memory 持久化。它不只是帮你写代码，更多是在帮产品把 Agent 变成一个能部署、能调度、能审计的运行单元。

和 OpenAI Codex cloud tasks 对比也能看出差异。Codex 文档里说 secrets 会在 task execution 解密，但为了安全只提供给 setup scripts，agent phase 前移除。Managed Agents 这次强调的是 Agent 运行期通过 CLI 访问外部系统，真实 secret 在网络边界附着。这两个设计都合理，只是目标不同。

Codex 更偏代码任务里的依赖安装和仓库变更。Managed Agents 在往生产系统连接走。

## 落地时怎么设计

我会先画一张状态表。

Agent config 放通用行为：模型、prompt、工具、MCP、skill。Environment 放运行依赖：包、网络策略、sandbox 类型。Vault 放用户或团队 credential。Session 放一次运行。Memory store 放跨运行知识。外部系统继续保存业务事实。

然后挑一个低风险流程试。比如每天早上读取产品指标、查 Sentry、新建一份摘要，最后发到 Slack 或 Notion。实验目标很具体：看四个边界能不能顺。schedule 能不能稳定触发，sandbox 能不能跑现成工具，vault 能不能安全访问服务，memory 能不能记住长期规则。

这里没必要做一堆低价值 ablation。比如反复验证不用 vault 会不会泄密，意义不大；反复尝试十种 schedule 粒度，也不影响架构判断。先回答一个问题：这套托管边界能不能减少你维护 cron、secret、runner、日志和状态同步的成本。

如果答案是能，再往更高价值的流程推。比如销售账户刷新、合规报告、客户用量异常检测、浏览器技能目录验证。每一步都保留人工确认点，等输出稳定后再放宽自动化。

## 总结

Claude Managed Agents 这次更新让我更明确地看到一个方向：生产 Agent 的竞争点已经从模型回答，转向运行系统。

模型当然重要，但 Agent 真进业务以后，难点经常是模型之外的东西：命令在哪里跑，密钥怎么用，任务怎么定时，失败怎么查，上次运行留下来的知识放哪儿。

sandbox、vault、session、memory 这几个对象把边界画清楚了。sandbox 让动作可控，vault 让身份可控，session 让一次运行可追踪，memory 让长期知识有地方放。

这套架构还在 beta，很多细节会变。可它已经给了一个很实用的设计信号：把 Agent 当成生产 worker 来设计，而不是把聊天窗口接上几个工具就上线。对真正要落地的人，这个信号比功能列表更重要。

## 参考链接

Claude Blog: https://claude.com/blog/whats-new-in-claude-managed-agents
Managed Agents Overview: https://platform.claude.com/docs/en/managed-agents/overview
Vaults: https://platform.claude.com/docs/en/managed-agents/vaults
Memory: https://platform.claude.com/docs/en/managed-agents/memory
OpenAI Codex cloud environments: https://developers.openai.com/codex/cloud/environments
