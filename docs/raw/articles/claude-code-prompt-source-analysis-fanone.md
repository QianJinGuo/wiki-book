---
title: 【图解】Claude Code 源码解析 ｜Prompt 提示词模块
source_url: https://mp.weixin.qq.com/s/ogougiFVBLXAY2IihS94JA
publish_date: 2026-05-08
tags: [wechat, article, claude, agent]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: c029f207960e490b992a3644fc22b23c3c76aa4c13227c2c7a9d4e248ebd9ea1
---

# Memory 标题
正文...
```
**Step 2**：文件入口加到 `MEMORY.md`（仅作索引，不写正文）
### Memory 读取时机
- memory 看起来相关时去读
- 用户明确要求 recall/check/remember 时必须读
- 用户说 ignore memory 时，当 memory 为空
- memory 内容可能过时——提到文件/函数/flag 时先验证是否还存在
### 搜索历史上下文的顺序
1. 先搜 memory topic files
2. 不够再搜 transcript jsonl