---
title: "复制这套神仙配置，让Claude Code全自动修Bug！告别每天重复教AI写代码"
source: wechat
source_url: https://mp.weixin.qq.com/s/RRvZ-MfdcU0hU1TTpcPtkg
author: 你说的完全正确
feed_name: AI寒武纪
review_value: 8
review_confidence: 8
review_recommendation: strong
review_stars: 4
date: 2026-05-27
created: 2026-05-28
updated: 2026-05-28
tags: [claude, claude-code, hooks, memory, claude-md, self-improvement, workflow]
type: article
provenance_state: synthesized
sha256: 60c0850b475cbc544bc0441edd21ce6faa9a4740e4bd534affb1be403b58c40d
---

# 复制这套神仙配置，让Claude Code全自动修Bug！告别每天重复教AI写代码

> **来源**：AI寒武纪（你说的完全正确），2026年5月27日
> **背景**：Boris Cherny（Claude Code 创始人）采访爆料：Claude 团队内部已停止人为修复 Claude 的错误，改用自动化配置让 Claude 自己修复它们。本文详解这套配置的具体实现。

## 核心问题：Claude 为什么总犯重复错误

根本原因是 Claude 没有跨会话记忆。每次新会话都从零开始，昨天花 20 分钟修的 bug，明天照样会出现。

## 方案一：会自己成长的 CLAUDE.md

CLAUDE.md 应该随着每次错误不断扩充。不是写人格设定，而是写具体的、可执行的规则：

\`\`\`
## 规则
- 绝对不要重构、重命名或清理无关代码
- 所有数据库查询走 services/，不要写在组件里
- 每次改完代码运行 npx tsc --noEmit
- 每次改完跑测试，失败了先修好再继续
- 提交前缀规范：feat:、fix:、docs:、refactor:、test:、chore:
- 绝对不用 enum，用字面量联合类型代替
- 绝对不要 force push
- 先跑 migration 再跑测试

## 从错误中学到的
- 不要在 packages/ui 里装本该装在 apps/web 的包
- stop-loss 函数必须返回数字，不是布尔值（2026-05-12 生产环境出过问题）
\`\`\`

关键是「从错误中学到的」这一节。每次纠正 Claude 之后，加一句「更新 CLAUDE.md，这样你就不会再犯这个错了」。

**研究建议**：甜蜜点是 12 条规则、200 行以内。超过这个范围，执行率会明显下降。

## 方案二：PostToolUse 钩子，实时捕捉错误

PostToolUse 在 Claude 写完或编辑完文件后立即运行，在问题扩散之前把它抓住：

\`\`\`json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write(*.ts)",
        "hooks": [
          { "type": "command", "command": "npx prettier --write $file" },
          { "type": "command", "command": "npx tsc --noEmit 2>&1 | head -20" }
        ]
      }
    ]
  }
}
\`\`\`

## 方案三：Stop 钩子，质量门禁

Stop 钩子在每次 Claude 说「我完成了」的时候触发，在 Claude 真正结束之前验证工作是否达标：

\`\`\`json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          { "type": "command", "command": "npm test 2>&1 | tail -5; echo "Exit code: $?"" }
        ]
      }
    ]
  }
}
\`\`\`

如果测试失败，Claude 会看到失败输出后自动继续工作修复，不需要人工干预。

**关键规则**：Stop 钩子里一定要检查 stop_hook_active。当这个值为 true，说明 Claude 已经因为前一个 Stop 钩子在继续工作，直接 exit 0 退出。不加这个检查，钩子会让 Claude 永远卡在循环里出不来。

## 方案四：PreToolUse 钩子，错误发生之前就拦截

PreToolUse 在 Claude 执行工具之前运行，用来过滤输入、阻止代价高昂的操作：

\`\`\`json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash(cat *log*)",
        "hooks": [
          { "type": "command", "command": "grep -n 'ERROR\\|WARN' $file | head -50" }
        ]
      },
      {
        "matcher": "Write(**/.env*)",
        "hooks": [
          { "type": "command", "command": "echo 'BLOCKED: Cannot write to .env files' && exit 1" }
        ]
      }
    ]
  }
}
\`\`\`

## 方案五：自动重试模式

修复失败的测试。最多尝试 3 次。每次尝试之后：1. 跑测试；2. 通过则完成；3. 失败则读错误信息换一种思路；4. 3 次都失败则说明尝试了什么、还有什么没修好。

**必须设置次数上限**。没有上限，Claude 可能陷入无限重试，烧掉大量 token。

## 方案六：跨会话记忆

三层记忆系统：
- **CLAUDE.md**：捕获项目级规律
- **/memory**：捕获会话级学习
- **Dreaming**：Claude 在后台处理历史会话、自动积累持久知识，不需要手动添加

## 配置前后的对比

**配置之前**：
- Claude 写代码，你跑测试，4 个失败
- 你逐一解释每个失败
- Claude 修了 3 个，顺带又引入 1 个新 bug
- 每个功能来回 45 分钟
- 同样的错误明天还会出现

**配置之后**：
- Claude 写代码，钩子自动格式化并检查每个文件
- Claude 说完成，测试自动跑
- 测试失败，Claude 读错误继续修
- CLAUDE.md 阻止昨天的错误重演
- 记忆系统阻止上周的错误重演
- 每个功能 10 分钟

---

*本文为 AI寒武纪原创文章*
