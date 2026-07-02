# Pi：轻量级开源 Agent 底座

## Ch04.559 Pi：轻量级开源 Agent 底座

> 📊 Level ⭐⭐ | 2.1KB | `entities/pi-agent-lightweight-base-rekota.md`

# Pi：轻量级开源 Agent 底座

## 摘要

Pi 是一个轻量级开源 Agent 项目，定位为个人开发者的 Agent 底座。核心架构 = LLM + 工具 + 循环，提供模型适配、工具调用、上下文管理、事件循环、安全执行等基础组件。生态中的 Gondolin 项目提供微虚拟机沙箱隔离。

## 架构特点

### 核心设计

Pi 不是大而全的 Agent 框架，也不是黑盒产品。它拆得比较清楚，方便二次开发：

- **模型适配层** — 支持多种 LLM 接入
- **工具调用系统** — 默认工具：Read / Write / Edit / Bash
- **上下文管理** — 清晰的上下文处理机制
- **事件循环** — Agent 主循环驱动
- **终端交互** — CLI 接口
- **安全执行** — 权限控制和沙箱隔离

### 工具设计哲学

默认工具很少但克制——Read / Write / Edit / Bash 四件套。工具少不意味着弱，反而更方便做权限控制和沙箱隔离。这与"工具越多越强"的传统思路形成对比。

## Gondolin 沙箱

Pi 生态中的 Gondolin 项目提供微虚拟机（micro-VM）执行环境隔离，避免 Agent 直接操作宿主机文件系统或执行危险命令。这是让 Agent 真正去改代码、跑命令时的关键安全组件。

## 与其他框架的对比

| 维度 | Pi | 大框架 |
|------|-----|--------|
| 定位 | 个人开发者底座 | 企业级全栈 |
| 复杂度 | 轻量，易上手 | 重量，学习成本高 |
| 工具数量 | 默认 4 个 | 通常 20+ |
| 安全机制 | Gondolin 微 VM | 各框架实现不同 |
| 二次开发 | 方便 | 受框架约束大 |

## 来源

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/pi-agent-lightweight-base-rekota.md)

---

