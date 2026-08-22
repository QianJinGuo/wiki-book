# 让 Agent 成为音视频工作台：AI MediaKit CLI + Skill 发布

## Ch04.761 让 Agent 成为音视频工作台：AI MediaKit CLI + Skill 发布

> 📊 Level ⭐⭐ | 3.5KB | `entities/ai-mediakit-cli-skill-agent-workstation.md`

# 让 Agent 成为音视频工作台：AI MediaKit CLI + Skill 发布

## 核心内容

本文来自字节跳动技术团队，介绍了火山引擎在 2026 Force 源动力大会上正式发布的 **AI MediaKit CLI + Skill**——一套面向 AI Agent 的音视频工作台入口工具。

**发布背景：**
- AI 视频生成已解决"从无到有"的问题，但一条视频从生成出来到可以发布，仍需大量音视频处理工作：理解素材、裁剪拼接、加字幕、画质增强、格式适配等全链路工作
- Agent 在音视频领域面临特殊挑战：视频是画面、音频是声波，Agent 活在符号世界而音视频活在感官世界
- 音视频工具不能只是 API 的简单封装——Agent 需要知道能力范围、输入要求、任务状态、产物位置等结构化信息

**AI MediaKit CLI + Skill 的三部分：**
1. **AI MediaKit CLI**：面向 Agent 的原生命令行工具，开发者和 Agent 可直接用命令完成视频裁剪、拼接、加字幕、画质增强、字幕擦除等任务
2. **AI MediaKit Skills**：面向 Agent runtime 的工具集，按四大能力域拆分——剪辑（byted-mediakit-editing）、视频处理（byted-mediakit-video）、图像处理（byted-mediakit-image）、音频处理（byted-mediakit-audio）。用户可在 Agent 对话窗口直接描述需求，由 Agent 理解意图、编排能力并交付结果
3. **Agent 友好的任务机制**：将 task_id、任务查询、轮询等待、终态结果回收等流程下沉到工具层，让 Agent 不必靠"记忆"判断何时回来查任务

**关键设计理念：**
- **能力结构化**：Agent 可通过 Skill 描述理解每个能力的用途、输入和调用方式
- **长任务可回收**：CLI + Skill 将任务提交、状态查询、终态判断和结果回收沉到工具层
- **端云协同**：基础剪辑任务本地完成（低成本）、重算力任务交给云端（画质增强/字幕擦除），Agent 无需理解底层算力细节
- **多入口统一底座**：企业走 API、开发者和 CI 走 CLI、Agent 用户走 Skill，连接同一套 AI MediaKit 能力体系

**安装方式：**
- 一行命令：`npx @volcengine/mediakit-cli install -y`
- 或告诉 Agent：帮我安装 mediakit cli 和 skill：https://github.com/volcengine/mediakit-cli

AI MediaKit 沉淀了 **100+ 音视频原子能力**，覆盖视频理解、剪辑、字幕、画质增强、字幕擦除、转码、音频处理、图像处理等环节。CLI + Skill 作为这些能力面向 Agent 生态的标准化入口，旨在让 Agent 不仅拥有生成内容的"大脑"，还拥有处理和交付音视频的"工作台"。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/ai-mediakit-cli-skill-agent-workstation.md)

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)

---

