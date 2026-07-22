---
source_url: "https://mp.weixin.qq.com/s/I75todL-x4myILGGbtZc4g"
ingested: 2026-06-26
sha256: 35dd2da67bc3b965
---

# 老代码克星：36k Star的 AI 神器，跑一条命令就把项目结构整明白了！

> **来源**：极客之家，2026年5月28日
> **背景**：Understand-Anything——将代码库转化为交互式知识图谱的 Claude Code 插件，MIT 开源，36k stars

## 一句话

极客之家介绍 Understand-Anything（36k Star）：Claude Code 插件，通过 `/understand` 命令将整个项目扫描生成可拖拽、点击、搜索的交互式知识图谱，支持 Guided Tours、Diff Impact Analysis、Domain View、语义搜索，帮助快速理解老代码。

## 核心功能

### Guided Tours（引导式游览）
根据依赖关系生成代码阅读路线——从入口文件开始，沿调用链层层往下走。新同事打开图谱跟着 Tour 走一遍，比丢给他 README 文档更靠谱。

### Diff Impact Analysis（改动影响分析）
运行 `/understand-diff`，告诉用户改动的函数影响了哪些上游、哪些下游。**增量分析**——只扫改过的文件，不跑全量，真正能嵌入日常工作流。

### Domain View（业务域视图）
识别代码和业务逻辑的映射关系。比如电商项目，告诉你哪些代码管「订单处理」「支付回调」「用户认证」。技术 Leader 和产品经理不需要看懂代码，但需要知道「改这里会影响下单流程」。

### Semantic Search（语义搜索）
用自然语言提问（如「支付流程怎么走的」），不靠关键词，靠语义理解定位相关节点。

### Persona-Adaptive UI
根据角色调整信息深度——初级开发看到函数功能，架构师看到模块在整体分层中的位置和耦合度。

## 安装使用

```bash
# Claude Code
/plugin marketplace add Lum1104/Understand-Anything
/plugin install understand-anything

# 常用命令
/understand                    # 首次全量分析，之后默认增量
/understand-diff               # 改动影响分析
/understand-chat              # 语义搜索提问
/understand --language zh     # 中文版
/understand src/frontend       # 只分析子目录
/understand --auto-update     # post-commit hook 自动增量更新
```

也支持 Cursor、VS Code + Copilot、Codex、Gemini CLI。

**图谱格式**：JSON → 可 git 提交到仓库，团队共享，无需每人重复跑分析。

## Token 成本

- MIT 开源，软件免费
- 小项目（几十~百个文件）：Token 消耗忽略不计
- 中型（几百个文件）：首次全量分析约百万~千万 Token
- 增量更新日常使用消耗很小
- 大项目（上万文件 monorepo）：先用子目录限定扫描

## 适用场景

| 场景 | 适合程度 |
|------|----------|
| 接手遗留代码库的新人 | ★★★ 一小时建立全局认知，传统方式可能需要两周 |
| 管多个团队的技术 Leader | ★★★ 每个库跑一轮，JSON 提交仓库共享 |
| 200 文件以下的独立开发者/小团队 | ★★★ 成本可控 |
| 几十个文件的小工具（结构清晰） | ★ 不需要，IDE 文件树 + Claude Code 对话即可 |

## GitHub

https://github.com/Lum1104/Understand-Anything
