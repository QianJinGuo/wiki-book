---
source_url: "https://mp.weixin.qq.com/s/fyugPyHo1gY8A_5XXCi8sQ"
ingested: 2026-06-26
sha256: 5209779193000c9d
---

# Claude Code 泄露后的漏网之鱼 claude-code-best 这两个月到底演进了什么

## 项目背景

Claude Code 自 2.1.88 版本泄露后，GitHub 做了全网清理，但 claude-code-best/claude-code 社区仓库留存了下来，基于泄露代码继续演进。截至 2026年5月22日，已发到 v2.6.5，PR 已合并 136 个。

## 演进方向

### 1. 多模型支持

最早一批 PR 就接入了 OpenAI-compatible、Gemini、Grok。后续继续补 DeepSeek、MiMo、Grok thinking，修 usage 字段映射，修 reasoning_content 多轮回传。

**Provider Registry**：默认内置 cerebras、groq、qwen、deepseek，支持用户用 `~/.claude/providers.json` 覆盖。

OpenAI-compatible 这层能覆盖 Ollama、vLLM、DeepSeek、Qwen、Groq 等大量端点。

**坑**：tool schema、streaming、usage、thinking、cache token、reasoning_content 都有细节差异需要适配。

### 2. 远程控制

Remote Control Server、Bridge、ACP、acp-link、SSH Remote、后台 session 模块，目标是把本地 CLI 变成能被外部系统驱动的 agent 节点。

- `agent.ts`：暴露 session 创建、恢复、加载、列表、fork 和关闭
- `bridge.ts`：把内部 QueryEngine 的 SDKMessage 转成 ACP SessionUpdate，向外汇报 token usage、context window 和 cost

**关键 issue #1244**：--acp 模式下 extended thinking 和 tool_use 同回合时，约 60% 概率触发 Anthropic 400。分析指向内部消息序列重复 push。难点在于三套消息规范之间来回转换时不能破坏 role alternation 和 tool_use/tool_result 配对。

### 3. SearchExtraTools（关键设计）

在 `src/constants/tools.ts` 里，`CORE_TOOLS` 全量进初始 prompt，non-core built-in 和 MCP 工具都 deferred，需要先 search，再 execute。

解决两个问题：
1. 上下文爆炸：几十上百个工具 schema 全塞给模型，上下文会爆
2. 供应商兼容：原先贴近 Anthropic 的 defer loading 到了 OpenAI-compatible/Gemini/Grok 路径上需要显式替代

**TF-IDF 索引**：`toolIndex.ts` 用 tool name、searchHint、prompt description 建 TF-IDF 索引，检索时做 cosine similarity，给中文 query 加 CJK bigram guard。

**边界 bug**（#1230）：async subagent 能 search 到 deferred tool，却不能调用 ExecuteExtraTool，因为 allowlist 漏了。后修复。

### 4. Local Memory 和 Vault

**Local Memory**：用 `~/.claude/local-memory/<store>/<key>.md` 做多 store 本地记忆。
- 路径校验、1MB 上限
- tmp + rename 原子写
- bounded read（最多 64 key/turn）
- 内容包在 `<user_local_memory untrusted="true">` 里，提醒模型当用户数据不要当指令

**Local Vault**：受控密钥使用层。
- 优先走 OS keychain，fallback 到 AES-256-GCM 文件加密
- passphrase 支持环境变量、文件或自动生成
- VaultHttpFetchTool 只允许 HTTPS，权限绑定到 `vault_auth_key@host`

### 5. Autofix PR 闭环

`/autofix-pr` 已形成完整 workflow：
1. 检测当前 repo 和 PR 参数，抢 singleton monitor lock
2. teleport 到远程 session
3. 记录初始 PR head SHA
4. 用 completionChecker 轮询 PR 状态和 CI 状态
5. 远端 agent 输出 `<autofix-result>`
6. 本地用 contentExtractor 从 log 里抽出来，回流给本地模型

**当前限制**：
- cross-repo 只是安全校验，真正跨 repo clone path 还没实现
- webhook 分支有 feature gate，但 kairos client 没接上

### 6. Feature 诚实度

README 很热闹，但真实稳定性要看 `scripts/defefines.ts`：

**已关闭的 feature**：
- `UDS_INBOX` 和 `LAN_PIPES`：Node 环境卡住，默认构建注释掉
- `SKILL_LEARNING`：无限写入 skill 文件，导致文件非常庞大（#379）
- `TEAMMEM`：邮箱文件无限增长

**项目特点**：feature 很激进，工程边界也很诚实。会快速加功能，也会快速回滚或关开关。

## 总结

最有研究价值的方向：
- Provider adapter 源码
- 工具上下文压缩（SearchExtraTools + TF-IDF）
- ACP 和 remote task 实现
- Autofix PR cross-repo 扩展

生产使用需谨慎：尤其 ACP、Windows、LAN/Pipe、skill learning 这些路径，必须结合 issue、feature flag 和测试覆盖一起判断。
