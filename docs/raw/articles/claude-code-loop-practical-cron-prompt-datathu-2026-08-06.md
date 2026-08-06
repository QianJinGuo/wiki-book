---
title: "Claude Code 的 /loop 实操教程来了"
source_url: "https://mp.weixin.qq.com/s/kNy2P-CEtOlWDvtsddygdw"
author: "王大鹏"
publisher: "数据派THU"
published: 2026-08-06
ingested: 2026-08-06
language: zh
type: raw-article
sha256: "0771ef6a484d358a00a5196f07108933c18f9f40430fa0897235ec5760d6a9fb"
---

# Claude Code 的 /loop 实操教程来了

> 数据派THU（背靠清华大学大数据研究中心）发布，作者王大鹏（"精神抖擞王大鹏"公众号主理人）。用 Claude Code 跑一个真实的 scheduled loop（监控公众号更新），从设计到运行跑通，并拆解 /loop 源码。

## 认知对齐：Claude Code 里 agent 被"唤醒"的几种形态

很多人以为 Loop Engineering 只是 /loop 一个命令，但 Claude Code 里 agent 的自动化触发有五种形态，共同构成 Loop Engineering 的设计空间：

1. **/loop**（Scheduled loop）：按时间表重复执行——每 5 分钟检查一次部署状态、每天早上 10 点审查 PR
2. **/goal**（Goal loop）：设定目标，agent 持续工作直到达标或卡住——所有测试通过、构建成功、PR 就绪
3. **hooks**：特定事件确定性触发脚本——agent 编辑文件后自动跑 lint、一轮结束前自动验证构建
4. **subagent spawn**：主 agent 并行执行拆分后的任务，每个子 agent 带自己的 goal 做验证循环
5. **workflow**：不确定拆分什么类型/何时拆分时，让 LLM 决定子 agent 的组合方式

实际工作流里这些形态会组合使用。示例（How I AI 播客）：一个 scheduled loop 每周五触发，主 agent 分析本周 PR 并识别缺失的 skill，然后 spawn 多个子 agent，每个子 agent 用 goal loop 验证一个 skill 是否真正可用。

## 场景：监控竞品公众号文章更新

想持续追踪同领域公众号，有更新就知道。没有 loop 时：被动看、RSS 工具扫（公众号需额外转 RSS）——被动靠推荐不可靠，会错过时效性强的内容。cron 脚本也能做，但 **cron 脚本是死的**：公众号内容常需 cookie token，过期了它就静默失败，第二天才发现少了一天数据。

loop 的做法：让 agent 定时醒来、自己判断状态、自己决定做什么——正常就同步，异常就即时报告，而不是无脑执行然后挂掉。

### 工具准备

- **wx-mp-rss-core**：基于微信公众平台 API 的文章获取工具，扫码登录拿 token（token 通常 3 天过期）
- 监控对象：Datawhale 等两个 AI 方向公众号（fakeid 从订阅链接提取）

### loop prompt 设计

```
/loop 30m 你是一个公众号文章同步 agent。工作目录是当前目录。每次被唤醒时执行以下决策流程：
1. 读取 sync_state.json 检查上次状态
   - 如果上次是 token_expired：先测试 token 是否恢复，未恢复则报告"仍在等待扫码"并退出本轮
   - 如果上次是 success：继续正常同步
2. 用 wx_token.json 凭证请求两个公众号的最新文章
3. 对比 sync_state.json 的 known_articles，识别新增文章
4. 根据结果决策：
   - API 返回 ret=200003/invalid session → 状态改为 token_expired，通知用户扫码，不重试
   - 有新文章 → 更新 sync_state.json，输出新文章标题
   - 无新文章 → 简短报告"无更新"
5. 更新 sync_state.json（含 status, last_check_time, known_articles, check_count）
```

输入回车后 Claude Code 立刻做了两件事：创建 cron job（`*/30 * * * *`，每 30 分钟触发）+ 立刻执行第一轮。

## 第一轮：正常同步

- 读取 sync_state.json → status success，继续
- 请求 Datawhale API → ret:0 成功；请求另一个公众号 API → ret:0 成功
- 对比 known_articles → 发现新文章
- 更新 sync_state.json

状态文件示例：
```json
{ "status": "success", "last_check_time": "2026-06-24T22:44:00", "check_count": 1,
  "articles_synced": 8, "known_articles": ["..."] }
```

到这一步，跟 cron 脚本没有本质区别。**区别从第二轮开始。**

## 第二轮：无更新时的极简响应

loop 自动触发后：读取状态 → 请求成功 → 无新增 → 输出只有一行："📋 同步结果：无更新"。状态文件只改 check_count 和 last_check_time。

关键不是"它报告了无更新"——**而是它知道什么时候不该做事**。cron 脚本每次都全量执行完整逻辑；这个 loop 在"没有新东西"时决策路径最短，token 消耗最低。

## Token 失效：loop 和 cron 的区别

微信公众平台 token 几小时就过期。API 返回 `{"base_resp":{"ret":200003,"err_msg":"invalid session"}}`。

- **cron 脚本**：取决于错误处理写了多少。大多数人的脚本：报错 → 退出 → 日志里躺一行 traceback → 第二天发现数据断了一天
- **loop 的 agent 反应**：
  - 请求 API → 返回 ret=200003
  - 判断：这不是内容问题，是凭证过期
  - **不重试**（关键决策）
  - 更新 sync_state.json：status → "token_expired"
  - 输出：⚠️ Token 已过期，需要重新扫码登录

下一次 loop 被唤醒时，不会盲目重试 API。先读状态文件，看到 token_expired，先做一次轻量检测（调一个简单 API 试 token 是否恢复），未恢复就直接退出："仍在等待扫码，本轮跳过"。也可在 prompt 后续加外部通知机制，即时重新扫码续上。

**核心判断**：同样是"执行失败"，agent 区分了"内容层面的问题（值得重试）"vs"基础设施层面的问题（需要人介入）"。**这个判断不在调度器里，在 prompt 里。**

## 从源码看 /loop 到底做了什么

读 Claude Code 源码，/loop 的机制很简单，本质就是 **cron + prompt**：

```
用户输入: /loop 30m <prompt>
↓
loop.ts 解析: interval=30m → cron="*/30 * * * *"
↓
CronCreate: 创建定时任务, recurring=true
↓
立刻执行一次 prompt（不等第一个 tick）
↓
cronScheduler.ts: setInterval(check, 1000) 每秒检查
↓
到期 → onFire(prompt) → 注入消息队列 → agent 开始新 turn
```

**没有 evaluator，没有自动判断"是否达标"的系统组件。** /loop 做的事就是"定时唤醒 prompt"。

那"判断是否达标"、"决定继续还是停止"、"区分错误类型"这些智能从哪来？**在你设计的 prompt 里。** 循环的"智能"不在基础设施里，在你写的那段 prompt 里。调度器只做一件蠢事：到时间了，把 prompt 塞给 agent。但那段 prompt 承载了一整套决策逻辑——什么条件下该做事、什么条件下该停、什么条件下该喊人。

## 设计哲学：Loop 的第一步是先写 skills

整个 demo 里 Claude Code 做的事情其实不复杂：调 API、比对列表、写文件——任何 Python 脚本都能做。区别在**异常处理的设计方式**。

Loop prompt 的异常处理是运行时判断——agent 看到一个未预见的返回值，能基于对上下文的理解做出合理决策，即使你没有在 prompt 里逐一列举所有错误码。

所以设计 Loop 首先的流程不是 loop 本身的六大组件，而是**处理问题的那个 skill**——你得先有解决问题的方法。
