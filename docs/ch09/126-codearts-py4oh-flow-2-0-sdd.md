# 华为云码道（CodeArts）重构图形编程项目实践 — Py4OH-Flow 2.0 SDD 案例

## Ch09.126 华为云码道（CodeArts）重构图形编程项目实践 — Py4OH-Flow 2.0 SDD 案例

> 📊 Level ⭐⭐ | 6.1KB | `entities/codearts-py4oh-graphics-refactoring-sdd.md`

# 华为云码道（CodeArts）重构图形编程项目实践 — Py4OH-Flow 2.0 SDD 案例

> 本文是华为云码道（CodeArts）在实际企业项目——Py4OH-Flow 2.0（基于 Blockly 的跨平台可视化编程工具重构）中的完整工程实践记录。核心亮点：利用 CodeArts 的 Spec-Driven Development（SDD）工作流，将 9 万行历史遗留代码以约 2 万行全新代码等价替换，代码量缩减近 80%。

## 项目背景

Py4OH（Python for OpenHarmony）是一个专为开源鸿蒙操作系统构建的 Python 语言支持层与软硬件一体化解决方案，由电子科技大学开源鸿蒙技术俱乐部指导老师、奇林波科技旗下蜀鸿会技术社区创始人唐佐林发起。

Py4OH 工具链包括：
- **Py4OH-REPL**：交互式命令行工具，通过 USB 或 Wi-Fi 连接设备实现类似 Linux Shell 的灵活交互
- **Py4OH-IDE**：集成开发环境
- **Py4OH-Flow**：低代码平台（Blockly 可视化编程）— 本次重构核心目标

Py4OH-Flow 1.0 版本基于开源项目二次开发，长期积累了大量历史遗留问题：编译环境依赖 Python 2.7（已于 2020 年停止维护）、修改必须编译后才能看到效果、二次开发的补丁式修改导致代码耦合严重、缺乏工程化规范。

## SDD 工作流：规格驱动开发的核心实践

本项目最核心的开发范式中，特性规格文档（`.codeartsdoer/specs/` 目录）完整记录了各项功能的 "做什么"（What）：

| 规格领域 | 典型特性 |
|---------|---------|
| 自制积木体系 | 创建弹窗、名称只读、参数默认值、参数拖拽、视觉增强、类型标签、编辑功能 |
| 数据结构积木 | 列表增强、字典增强、集合增强、元组增强 |
| 控制与运算 | if-else 控制块、运算扩展、统一颜色 |
| 工程化 | 代码生成器重构、废弃 API 检测、国际化、扩展选择器 |

每个 spec 明确了技术约束（参数上限 10 个、名称正则校验规则）、向后兼容策略（旧版数据自动补字段）、边界条件（空条件用 `False` 占位），使 AI 辅助编码不会偏离设计意图。

## AI 辅助编码的三类角色

CodeArts AI 代码智能体在本项目中承担了三类关键角色：

1. **规格到代码的自动翻译**：根据 spec 中定义的接口约束，自动完成类型定义扩展、Modal 组件初始化逻辑、右键菜单注入、关联积木批量刷新
2. **代码审查与漏洞修复**：发现并修复了 5 个潜在问题（dispose 后 render、字段缺失、静默销毁引用积木、缺少编辑入口、进程失败无错误提示）
3. **老代码审阅与语义提取**：从 9 万行历史代码中提取积木定义、代码生成逻辑和业务规则的功能语义，剔除冗余以全新架构生成等价代码

## Py4OHBridge 双客户端架构

项目通过 Py4OHBridge 单例屏蔽平台差异：

```
Py4OHBridge (单例)
 ├── getPlatform() → 检测 electronAPI 判断环境
 ├── ReplSSEClient (Web)
 │     ├── EventSource → /api/repl 接收输出
 │     ├── fetch POST → /api/repl 发送指令
 │     └── 自动重连 (3s 间隔)
 └── ReplIPCClient (Electron)
       ├── electronAPI.onPy4OHMessage → 接收输出
       ├── electronAPI.sendPy4OHCode → 发送指令
       └── notifyReady → 通知主进程渲染就绪
```

## 安全防护体系

前端与 Py4OH-REPL 的所有交互指令均经由 `Py4OHCommandBuilder` 统一构建，内置三层安全防护：危险字符正则检测、路径遍历防护（`..` 与 `\0` 拦截）、输入长度限制。Electron 主进程额外执行危险代码模式检测（`import os`、`exec()`、`__import__()` 等）。

## 上下文感知能力

CodeArts AI 智能体具备深度上下文感知：理解 Blockly mutator 机制、Py4OHBridge 双客户端通信模式、React Hooks 状态管理模式；自动使用 `BlockTextKey`/`ModalTextKey` 枚举键；理解 Service 单例模式、发布-订阅模式；修改 `CustomBlockFlyoutService` 时自动关联积木定义、弹窗组件、校验逻辑、i18n 翻译文件。

## 关系页面

- `华为云码道（CodeArts）商用新版本` — 同平台的产品能力侧描述（2026年7月商用新版本）
- `SDD 实践：Lattice 团队 AI 编码` — 同主题的 SDD 落地实践
- `高德 SDD + Harness 团队 AI 编码范式` — SDD 范式层面案例
- `OpenSpec: Spec-Driven Development (Trae Solo)` — SDD 方法论对比
- `Agent Harness Engineering 范式` — 更广义的 Harness 框架
- `Agent Harness Skill 系统实战指南` — Skill 体系与 SDD 的结合

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/codearts-py4oh-graphics-programming-refactoring.md)

---

