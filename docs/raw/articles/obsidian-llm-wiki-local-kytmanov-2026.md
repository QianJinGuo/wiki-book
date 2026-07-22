---
title: "obsidian-llm-wiki-local: Obsidian本地AI知识图谱自动构建工具"
source_url: "https://mp.weixin.qq.com/s/PNoIqXxlhdyybu9E0JXe3w"
author: "obsidian黑曜石"
platform: wechat
created: 2026-05-25
ingested: 2026-05-25
sha256: pending
---

# obsidian-llm-wiki-local: Obsidian本地AI知识图谱自动构建工具

## 基本信息

- **作者**: 黑曜石（obsidian黑曜石）
- **发布时间**: 2026年5月23日
- **平台**: 微信公众号
- **原文链接**: https://mp.weixin.qq.com/s/PNoIqXxlhdyybu9E0JXe3w
- **项目地址**: https://github.com/kytmanov/obsidian-llm-wiki-local
- **开发者**: Alexander Kytmanov（俄罗斯）

## 核心价值主张

让AI主动读笔记、提炼概念、自动建立双向链接——不是等你提问的RAG，而是持续整理的"知识库管理员"。

## 工作流程（三步）

### 第一步：读取
指定目录（raw/ 或 inbox 文件夹），遍历所有 .md 文件。

### 第二步：提炼
对每篇笔记调用 Ollama 本地模型，完成三件事：
- 提取 3-7 个核心概念
- 识别人物/实体
- 判断这些概念是否已有对应页面

### 第三步：写入
- 新概念 → 在 wiki 目录下创建页面
- 已有概念 → 追加引用来源和补充观点
- 同时建立双向链接

## 实测数据

作者用 400 篇笔记实测（Qwen 2.5 7B + RTX 3060 12G）：
- 处理时间：约 20 分钟
- 生成：60+ 概念页面、200+ 双向链接
- 单篇处理时间：10-30 秒（取决于硬件和模型大小）

## 三个关键发现

### 发现一：AI发现了人脑没意识到的跨时间连接

去年9月关于"认知负荷理论"的文章，今年4月关于"Obsidian文件夹扁平化"的笔记——AI 在认知负荷页面里将两篇作为"实践案例"关联，因为扁平化本质是减少分类带来的认知负荷。

人类联想受限于最近看过什么、当时在思考什么。AI 没有这个限制——读400篇的效果跟读4篇没区别。

### 发现二：笔记质量差异被暴露

AI 提炼概念时，有些笔记能写出5个精准概念，有些只能憋出"本文讨论了某个话题"这种废话。后者共同点：都是随手剪藏、只看了标题没读完的文章。AI 无意中做了一次笔记质量审计——写不出概念的笔记，不值得存。

### 发现三：中文支持比想象好

Qwen 2.5 7B 中文概念提取准确率约 85%。偶尔把近义词当成两个概念（如"知识管理"和"知识整理"），但整体可用。更高精度可上 14B 或 32B 模型。

## 可纠错设计

打开 AI 生成的 wiki 页面，发现理解错误 → 在页面标注 `rejected` → 重新触发，AI 会换角度重新生成。第一版可能太泛——标 rejected 后，第二版更精准（如从"这是一篇关于效率的文章"变成"本文提出用52/17节律应对深度工作中注意力衰减问题"）。

## 局限性

1. **需要手动触发**：不是安装好就自动跑，需手动指定目录、手动触发
2. **模型质量决定上限**：7B 和 32B 效果差距明显，CPU 跑准确率约 70-80%
3. **不做向量检索**：擅长把零散笔记变成结构化 wiki，不擅长做搜索引擎（两者互补）

## 使用流程

1. 日常剪藏：Web Clipper 存到 inbox/ 文件夹
2. 周末编译：周六跑一次脚本，让 AI 读这周新增的笔记
3. 快速审阅：打开 Obsidian 图谱视图，检查新增概念页面——对的保留，错的标 rejected 重跑
4. 手动补链接：AI 漏掉的连接，自己补上

全程 15 分钟，比之前手动整理 2 小时效率高一个数量级。

## 技术栈

- **模型**: Ollama 本地运行（推荐 qwen2.5:7b 或 deepseek-r1:8b）
- **依赖**: Python 3.10+
- **特点**: 100% 本地运行，不依赖任何云端 API

## 安装命令

```bash
ollama pull qwen2.5:7b
git clone https://github.com/kytmanov/obsidian-llm-wiki-local.git
cd obsidian-llm-wiki-local
pip install -e .
```

配置 config.yaml 指向 Obsidian vault 路径和 Ollama 模型。
