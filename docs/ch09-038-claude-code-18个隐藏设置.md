# Claude Code 18个隐藏设置

## Ch09.038 Claude Code 18个隐藏设置

> 📊 Level ⭐⭐ | 12.9KB | `entities/claude-code-hidden-settings-18.md`

# Claude Code 18个隐藏设置

原文：Mnimiy (@Mnilax)，2026-05-23。18个设置分为三组：Claude.ai(8个)、Claude Code(7个)、API/Console(3个)。

## Claude Code 核心配置（settings.json）

### 1. enabledPlugins：禁用而非卸载
```json
{
  "enabledPlugins": {
    "formatter@acme-tools": true,
    "old-experiment@personal": false
  }
}
```
每个活跃插件加载 3K-8K token。false 保持安装但不加载，需要时用 `/plugin enable name@marketplace` 重新打开。

### 2. permissions.deny：已知 bug，需 OS 层备份
```json
{
  "permissions": {
    "deny": [
      "Read(.env)", "Read(.env.*)", "Read(**/*secret*)",
      "Bash(rm -rf:*)", "Bash(sudo:*)"
    ]
  }
}
```
**已知 bug**：deny 规则有时不生效（GitHub issue #11544）。必须配合 `chmod 600 .env` OS 层防护。

### 3. hooks.SessionStart：按分支加载 context
```json
{
  "hooks": {
    "SessionStart": [{
      "matcher": "startup",
      "hooks": [{
        "type": "command",
        "command": "cat .claude/context-$(git branch --show-current).md 2>/dev/null || true"
      }]
    }]
  }
}
```
main 分支加载 context-main.md，feat/auth 加载 context-feat-auth.md，防止 CLAUDE.md 滚雪球到 5K token。

### 4. disableAllHooks：紧急开关
```json
{ "disableAllHooks": false }
```
80% 的怪现象（莫名跑命令、会话挂起）由某个 hook 乱触发引起。出问题时切到 true 定位。

### 5. model per-project 覆盖
```json
// .claude/settings.json 在 docs 项目
{ "model": "claude-haiku-4-5-20251001" }
// infra 项目
{ "model": "claude-sonnet-4-6" }
// core-engine 项目
{ "model": "claude-opus-4-7" }
```
打开项目自动用对的模型，避免用 Opus 价格做 Haiku 1/20 成本就能搞定的事。

### 6. mcpServers enabled 标志
```json
{
  "mcpServers": {
    "github":   { "command": "...", "enabled": true },
    "postgres": { "command": "...", "enabled": false },
    "slack":    { "command": "...", "enabled": false }
  }
}
```
每个 server 吃 800-6000 token schema。12 个连接里可能只有 3 个在用，剩下 9 个每次会话消耗 25K-40K token。

### 7. cleanupPeriodDays：180 天
```json
{ "cleanupPeriodDays": 180 }
```
默认值 30 天，Dreaming 和过往对话搜索都依赖这些 transcript。改成 180 天有 6 倍信号可用，磁盘约 200MB。

## API/Console 高杠杆设置

### 8. cache_control 断点位置（最大单一成本杠杆）
```python
# 错误：断点放在用户消息后
messages = [
    {"role": "system", "content": SYSTEM_PROMPT},
    {"role": "user", "content": user_question,
     "cache_control": {"type": "ephemeral"}}
]

# 正确：断点放在稳定系统提示词后
messages = [
    {"role": "system", "content": SYSTEM_PROMPT,
     "cache_control": {"type": "ephemeral"}},
    {"role": "user", "content": user_question}
]
```
缓存读取仅需 10% 基础价格。盈亏平衡点：TTL 窗口内被读 2 次以上就划算。用 1h TTL 做跨会话不变的系统提示词。

### 9. inference_geo 数据驻留溢价
不设 inference_geo 参数可省 10%（Opus 4.7+ 在美国地区额外溢价）。仅在合规合同明确要求时才设。

### 10. Workspace 级别速率限制
每个 workspace 设账户层级的 60%-70%，留 30% 给突发需求。per-feature 上限防止一个功能把另一个饿死。

## Claude.ai 关键设置

- Memory：打开 Scope per Project 解决漂移问题
- Extended Thinking：默认设"轻量"，省 18-25% token
- Custom Styles：每个工作流配一个，是输出契约而非语气调节器
- Projects Instructions：填项目指令字段（相当于给 Claude 的 CLAUDE.md），70% 的项目都是空的
- 联网搜索引用：切到"脚注"模式，避免复制粘贴角标乱掉

## 审计脚本

```bash
#!/usr/bin/env bash
# claude-audit.sh
echo "=== 已启用插件数 ==="
jq '.enabledPlugins // {} | to_entries | map(select(.value==true)) | length' ~/.claude/settings.json
echo "=== 已启用 MCP server 数 ==="
jq '.mcpServers // {} | to_entries | map(select(.value.enabled==true)) | length' ~/.claude/settings.json
echo "=== cleanupPeriodDays ==="
jq '.cleanupPeriodDays // 30' ~/.claude/settings.json
# 目标：插件 3-5 个，MCP 3 个，cleanupPeriodDays 180
```

## 未入选设置（已排除）

- Adaptive Reasoning 开关：默认已最优，手动覆盖无显著效果
- Skill 自动激活：渐进式披露已调教很好，保持开启
- Workspace max_tokens：会毁掉代码生成场景

## 深度分析

### 成本控制的层级思维

这18个设置揭示了一个核心模式：Claude Code的成本优化本质上是**信息路由与缓存策略的工程问题**。enabledPlugins、mcpServers、cleanupPeriodDays 都围绕同一个目标——减少每次会话的 token 消耗。

**插件与 MCP 的 token 陷阱**最容易被忽视。每个插件加载3K-8K token，每个 MCP server 的 schema 吃800-6000 token。这些是静默成本——不会触发任何警告，但累计效应显著。12个MCP连接里可能只有3个真正在用，剩下9个每次会话消耗25K-40K token，这是一个月120万token级别的浪费。

**缓存控制的断点选择**是单一最大杠杆。cache_control 放在系统提示词后而非用户消息后，缓存读取仅需10%基础价格。被引用2次以上就划算，用1h TTL做跨会话不变的系统提示词，这是工程层面的精准控制。

### 模型选择的成本经济学

per-project model 覆盖的精髓在于**用正确规模的模型处理对应复杂度的问题**。Haiku处理文档编辑（成本1/20 Opus），Opus处理核心引擎逻辑。这是token分配的基本效率——用Opus价格做Haiku能搞定的事是纯粹的浪费。

### Hook 机制的失控风险

hooks.SessionStart 按分支加载 context 是聪明的设计，但它也是双刃剑。disableAllHooks 作为紧急开关的存在说明80%的怪现象源自某个hook乱触发。hook机制强大但脆弱，需要谨慎管理。

## 实践启示

### 立即可行动的清单

1. **审计插件与 MCP**（5分钟）：运行审计脚本，确认活跃插件≤5个，活跃MCP≤3个。多余的立即设为false而非删除。

2. **调整 cleanupPeriodDays**（1分钟）：从30天改为180天。磁盘成本约200MB，但Dreaming和过往对话搜索的信号价值6倍于此。

3. **cache_control 断点审查**（代码相关）：检查所有API调用，确保断点放在稳定系统提示词后。这是最大单一成本杠杆。

4. **per-project model 配置**（团队协作）：为每个项目配置对应的默认模型。docs用Haiku，infra用Sonnet，core用Opus。

5. **权限双重保护**：permissions.deny 配合 `chmod 600 .env` OS层防护，deny规则有bug不能作为唯一防线。

### 中期优化方向

- **分支context策略**：实现按分支加载不同context文件的机制，防止CLAUDE.md滚雪球到5K token
- **MCP按需启用**：只保留当前项目真正需要的MCP连接，其余保持disabled状态
- **inference_geo审查**：确认是否真的需要数据驻留，除非合规合同明确要求否则不设置

### 关键警示

> **cache_control 是 30-90% 账单降幅的杠杆，但前提是断点位置正确**——放在不变的系统提示词后，而非每次变化的用户消息后。

> **permissions.deny 有已知 bug**（GitHub issue #11544），不能作为安全防线的唯一依托，必须配合 OS 层权限控制。

> **hook 机制是双刃剑**：强大的 context 加载能力伴随着失控风险，出问题时先切 `disableAllHooks: true` 定位。

## 相关实体
- [Claude Code Performance Benchmarking](/ch09-031-claude-code-性能基准评测/)
- [打造可靠的 Ai 编程环境Claude Code Hooks 完整开发者指南 V2](/ch01-565-打造可靠的-ai-编程环境-claude-code-hooks-完整开发者指南/)
- [Claude Code Source Architecture](/ch01-240-claude-code-源码拆解-从启动到多-agent-扩展层/)
- Claude Code Openclaw Memory Vector Db Doubt
- [Skill System Design Three Way Comparison](/ch01-215-ai-agent-架构设计-七-skills-系统设计-openclaw-claude-code-hermes-age/)

---

