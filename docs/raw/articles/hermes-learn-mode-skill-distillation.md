---
title: "Hermes 上线 /learn 模式：从任何地方提炼任何 Skill"
source_url: "https://mp.weixin.qq.com/s/yUN3B7KVHOnXVXE5tsOSVA"
source_site: "mp.weixin.qq.com"
source_author: "DracoVibeCoding"
ingested: "2026-07-14"
sha256: "48edecc77c8b2f6c9f3dc991064791862f93aad3332f679e13f048174fd42dc1"
type: "raw-article"
tags: [hermes-agent, skill, learn-mode, cli-tools]
status: "ingested"
---

# Hermes 上线 /learn 模式：从任何地方提炼任何 Skill

> Hermes Agent 新增 `/learn` 能力，可以喂给它任何资料（GitHub 仓库/代码、PDF、API 文档、配置文件等），自动学习、提炼、封装出合适的 Skill。

## 使用流程

1. 更新 Hermes：`hermes update`
2. 使用 `/learn` 命令：`/learn <url>`（支持 GitHub 仓库、文档等）
3. Hermes 自动分析源码/文档，封装为 Skill
4. 直接在对话中使用该 Skill

## 演示案例：爬取微信公众号专辑文章

1. 选择仓库：`https://github.com/SlowGrowth1314/opencli-weixin-album`
2. 执行 `learn https://github.com/SlowGrowth1314/opencli-weixin-album`
3. 约 3 分钟后 Skill 自动创建完成，以仓库名命名
4. 补装 OpenCLI 依赖：`npm install -g @jackwener/opencli`
5. Chrome 加载 OpenCli 扩展程序
6. 将公众号专辑链接发给 Hermes，Skill 自动通过 CDP 控制浏览器爬取
7. 约 10 分钟后所有文章以 Markdown 格式保存到 `weixin-albums/` 目录

## 推荐可用的仓库

- yt-dlp/yt-dlp（视频下载）
- 3b1b/manim（数学动画）
- remotion-dev/remotion（程序化视频）
- firecrawl/firecrawl（网页抓取）
- jgm/pandoc（文档转换）
- rclone/rclone（文件同步）
- aria2/aria2（多协议下载）

## 意义

把 GitHub 当成应用市场，任意能力仓库都可以通过 `/learn` 变成 Agent 可调用的 Skill，无需手动编写 SKILL.md。
