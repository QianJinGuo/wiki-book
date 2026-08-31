---
title: "DeepSeek Harness 源码拆解：PTC模式+创造模式+Cordis框架"
source_url: "https://mp.weixin.qq.com/s/ihj-v64dHQR-HSzTUVBa3w"
author: "百度Geek说（Cheer）"
ingested: "2026-08-31"
sha256: "c7fd71bc84cef64fabb828833f2eeb45f5e792414789af7aba5bd08b7e7e3f02"
source_type: "wechat_mp"
---

# DeepSeek Harness：重新设计 Agent 运行时

> 原文：https://mp.weixin.qq.com/s/ihj-v64dHQR-HSzTUVBa3w
> 基于 dsh 0.1.1-rc.2 源码阅读

## 概述

作者基于 dsh 0.1.1-rc.2 源码阅读与试用，从 Agent loop 起步，顺着两个"没看懂的模式"深挖：PTC 模式将多次工具调用改写为写一段程序（五次往返压成一次）；创造模式让模型在运行中提交插件、动态增删自身工具。再往下拆解底层 Cordis 框架的时间与空间两个维度设计。

**核心判断：dsh 是为"持续学习"目标打造的运行时骨架，是自进化 Agent 的设计思路，尚未成为成熟的编码产品。**

## Agent Loop：与 Codex/Claude Code 无本质差别

dsh 的基本循环：外层按 turn 推进，内层执行 step，每步请求模型并处理 tool call。模型对外仍是"给工具、等调用、拿结果"。单看 Agent loop 难以看出主要差异。

关键引用梁文锋观点：DeepSeek 的 AGI 路线——CoT → Agent → **持续学习**。dsh 的 harness 就是在为持续学习搭建运行时基础。

## PTC 模式（Programmatic Tool Calling）

模型用一段程序把已有工具组合起来，改的是调用流程不是工具本身。

**标准模式**：每个工具独立调用，grep → 回来 → read(文件1) → 回来 → read(文件2) → 回来... 每趟往返都是一次完整请求，中间结果都回到上下文。

**PTC 模式**：工具变成程序里可以调的函数。模型写一段代码，dsh 在本地执行，只有最终结果回到上下文。a sequence that would be five round trips becomes one。

来自 Cloudflare 的 Code Mode 思路：模型见过几百万行真实代码，见过的 tool-calling 轨迹要少得多，写程序比发调用更顺手。

关键限制：程序里的子调用仍经过 dsh 工具管线（前置钩子、监控守卫、执行、结果处理）；程序在新开 Worker 线程里运行，权限按 bash 同级对待。

## 创造模式（Creation Mode）

允许模型在运行过程中提交一个插件，把原本不存在的工具注册进当前运行时。

四步流程：检查当前运行时 → 提交插件 → 显式启动版本 → 新工具从下一轮请求可用。停止时撤销插件，工具一起从工具列表撤销。

**关键设计**：
- 提交和运行分两步：提交时保存检查但不执行，显式启动后才运行
- 同一插件可提交多版本，记录当前启动版本
- 更新：先停止旧版，再启动新版；失败时旧版保留但需显式重启动
- 回退的是插件版本和运行时登记，不是已发生的副作用
- 动态插件只存在于进程内存，重启后消失

**PTC + 创造模式 = 自进化的两个台阶**：先编排已有能力（PTC），再新增自己的能力（创造）。

## Cordis 框架：时空两个正交维度

底层设计藏在 vendor/Cordis 框架中，配有一篇论文《A Programming Paradigm for Spatiotemporal Composability》（北大+DeepSeek）。

**时间维度**：一个组件被移走时，它对环境做过的改动能不能全部退回去（可逆性）。

**空间维度**：组件之间的依赖能不能写明白、被找到，并且在依赖换人时自动重新接上（依赖注入）。

创造模式要的正是这两条：中途撤掉插件不能留残骸，换掉一个别人在用的组件不能把用它的人弄坏。
