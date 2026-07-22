---
title: "从 PRD 到代码：Ralph 驱动的自治 AI 智能体执行循环"
source: wechat
url: https://mp.weixin.qq.com/s/iVfaAJx4DuFuzihf0TouHA
ingest_date: 2026-07-04
vxc: 49
stars: 4
sha256: 9cfbf51d52dc6fab339519e3dfbc757b48c290e0904fb8f5992784cfedbef14f
---

# 从 PRD 到代码：Ralph 驱动的自治 AI 智能体执行循环

**来源**: 技术极简主义

**发布日期**: 2026-02-23

**原文链接**: https://mp.weixin.qq.com/s/iVfaAJx4DuFuzihf0TouHA

---

传统的软件开发流程中，我们会先写需求文档、设计文档，再进行编码。但在 AI 编程时代，尽管工具越来越强大，从 PRD 到可直接上线的代码，自动化流程仍然不够顺畅。

Ralph 正是为了解决这一问题而设计。它基于 Geoffrey Huntley 提出的 Ralph 循环模式  [1]  ，通过不断启动 AI 编码工具（Amp 或 Claude Code），逐条处理 PRD 中的任务，直到所有事项完成为止。

在上一篇文章  简单就是美！Claude Code Ralph循环机制详解  中，我们已经系统了解了 Ralph 如何接管重复性工作，并保证任务可靠完成。

在本文中，我将带你看看 Ralph 是如何实现 自动化开发 的，包括它的核心原理、完整流程、最佳实践，以及在实际项目中的应用效果。

## 核心原理

### 架构设计：Bash 循环 + AI 实例

Ralph 的架构其实很简单。核心是一个 Bash 循环脚本：每轮迭代启动一个新的 AI 实例，读取 PRD 数据，只处理一个明确的任务，然后进入下一轮。

创建 PRD  
    ↓  
转换为 JSON → prd.json（任务清单）  
    ↓  
ralph.sh（Bash 循环）  
    ↓  
启动 AI 实例 → 读取 prd.json → 选择未完成任务  
    ↓  
实现单个任务 → 运行质量检查 → 提交代码 → 更新 AGENTS.md / CLAUDE.md  
    ↓  
更新 prd.json → 将经验写入 progress.txt → 进入下一轮  
    ↓  
所有任务完成 → 输出 <promise>COMPLETE</promise>

这种设计的关键在于： 每一轮迭代都使用全新的上下文窗口。

AI 不依赖之前的对话记忆，而是通过外部存储（ Git 历史 、  progress.txt  和  prd.json  ）来获取状态。这样既避免了上下文不断累积带来的限制，也能确保每次迭代都基于最新、可审计的项目状态。

### 核心概念

每次迭代 = 全新 AI 实例

在 Ralph 的流程里，每轮都会启动一个新的 AI 实例（Amp 或 Claude Code），不沿用之前的对话记录，上下文都是全新的。

需要保留的状态，都放在外部：

- •
  Git 历史
  ：记录开发过程中的变动和约定

- •
  progress.txt
  ：保存当前进度和关键经验

- •
  prd.json
  ：任务列表及完成情况

小任务原则

每个 PRD 里的任务最好一次就能做完。任务拆得不够细，模型还没写完，上下文就快满了，后面的代码质量肯定会受影响。

比较合适的任务例子（一次迭代能完成）：

- • 添加一个数据库列并编写迁移

- • 在现有页面中新增一个 UI 组件

- • 修改一段已有的服务端逻辑

- • 给列表页加一个筛选下拉框

明显偏大的任务（需要继续拆分）：

- • 实现一个完整的仪表板

- • 新增一整套认证/登录体系

- • 对现有 API 做整体重构

AGENTS.md / CLAUDE.md 的更新很重要

每次迭代后，Ralph 会更新相关的  AGENTS.md  或  CLAUDE.md  文件，记录学习内容。这一步非常关键，因为 AI 编码工具会自动读取这些文件，使未来迭代以及后续的个人开发者都能直接受益。

适合记录的内容示例：

- •
  发现的模式
  ：这个代码库通常用 X 来实现 Y

- •
  常见陷阱
  ：修改 W 时别忘了同步更新 Z

- •
  有用的上下文
  ：设置面板的逻辑集中在组件 X 中

反馈循环

Ralph 只有在存在反馈机制时才能高效运行：

- •
  类型检查
  ：及时捕获类型错误

- •
  自动化测试
  ：验证功能行为是否正确

- •
  持续集成（CI）
  ：保持通过状态，避免错误在迭代间累积

### 工作流程

理解了 Ralph 的核心概念之后，接下来可以看看它在真实项目中的用法。整体流程其实并不复杂，本质上是一个清晰的三步闭环，把需求一步步推进到可用代码。
1. 创建 PRD（产品需求文档）

使用 Ralph 的第一步，是先把需求讲清楚。你可以直接用它自带的 PRD 技能来生成需求文档：

# 加载 PRD 技能并创建需求文档  
加载 prd 技能，为「你的功能描述」创建 PRD

在生成过程中，工具会针对一些关键细节向你确认，比如边界条件、使用场景等。根据你的回答，它会整理出一份结构化的 PRD，并保存到  tasks/prd-[feature-name].md  。
2. 转换为 Ralph 格式

生成 PRD 之后，需要把它转换成 Ralph 能理解的 JSON 格式：

# 加载 Ralph 技能并转换 PRD  
加载 ralph 技能，将 tasks/prd-[feature-name].md 转换为 prd.json

Ralph 技能会解析 Markdown 格式的 PRD，把每个用户故事和任务拆分出来，生成一个结构化的  prd.json  文件。
3. 启动 Ralph 循环

当 PRD 和  prd.json  准备好后，就可以启动 Ralph 循环，让 AI 实例逐条执行任务：

# 使用 Amp（默认）  
./ralph/ralph.sh [max_iterations]  

# 使用 Claude Code  
./ralph/ralph.sh --tool claude [max_iterations]

参数说明:

- 

•
--tool
指定使用的 AI 工具，可选
  amp
  或
  claude

- 

•
max_iterations
最大迭代次数，默认是 10 次

运行后，Ralph 会进入一个自治循环，自动执行以下步骤：

步骤 1：创建功能分支

git checkout -b feature/your-feature-name

Ralph 会读取  prd.json  里的  branchName  字段，自动在 Git 中创建对应的功能分支并切换过去。这样每个任务都有自己独立的分支环境，出问题也方便回滚和管理。

步骤 2：选择下一个任务

Ralph 会从  prd.json  中选出优先级最高、且尚未完成（passes: false）的用户故事。每一轮循环只处理一个任务，保证 AI 实例足够专注，也能有效降低出错的风险。

步骤 3：实现单个故事

Ralph 会为当前任务启动一个全新的 AI 实例，只专注处理这一条用户故事。由于任务本身被控制在合适的规模内，通常可以在一个上下文窗口内完成，输出也更集中、更可靠。

步骤 4：运行质量检查

在任务实现完成后，Ralph 会自动执行质量检查，包括：

- •
  类型检查
  ：比如 TypeScript 的
  tsc --noEmit

- •
  单元测试
  ：例如
  npm test

- •
  自定义检查命令
  ：可根据项目需要添加其他命令

步骤 5：提交代码

当所有质量检查通过后，Ralph 会自动提交代码：

git add .  
git commit -m "feat: [Story ID] - [Story Title]"

如果检查未通过，AI 会尝试修复问题并重新运行检查，确保每次提交的代码都是可靠且可用的。

步骤 6：更新任务状态

提交成功后，Ralph 会在  prd.json  中将对应任务标记为已完成：

{  
  "id": "US-001",  
  "title": "添加用户登录表单",  
  "passes": true  // 从 false 变为 true  
}

步骤 7：记录学习内容

Ralph 会把本轮迭代中学到的经验写入  progress.txt  ，内容包括：

- •
  代码模式
  ：例如「这个功能通常用 X 实现」

- •
  遇到的坑和解决方案

- •
  有用的上下文信息
  ：例如「设置面板逻辑在组件 X 中」

后续迭代的新 AI 实例会读取这些内容，形成一个持续学习的机制，让每轮循环都能更顺畅。

步骤 8：重复或退出

Ralph 会检查  prd.json  中的任务状态：

- •
  还有未完成任务
  → 返回
  步骤 2
  ，处理下一个任务

- •
  所有任务完成
  → 输出
  <promise>COMPLETE</promise>
  并结束循环

可视化流程图 ： 查看交互式流程图  [2]  （支持动画演示每个步骤）

这样，每轮迭代都会自动推进任务，直到整个 PRD 完全实现。
自动归档历史运行

每次启动新功能时，Ralph 会自动把之前的运行记录归档到  archive/YYYY-MM-DD-feature-name/  目录。这样既保持了项目根目录的整洁，又完整保留了历史记录，方便日后查阅或回溯。

## 快速上手指南

Ralph 提供多种安装方式，你可以根据项目需求灵活选择。

### 前置条件

使用 Ralph 前，需要先准备好以下环境：

- 

AI 编程工具（二选一） ：

- 

• Amp CLI

- 

• Claude Code

- 

jq  工具（用于处理 JSON） ：

- 

• Windows（PowerShell，需管理员权限）：

python
  winget install jqlang.jq
- • Mac：

python
  brew install jq

- 在项目中初始化 Git 仓库 ：

cd my-project  
git init

### 方式一：项目内复制

将 Ralph 相关文件复制到你的项目中：

# 在项目根目录执行  
mkdir -p ralph  
cp /path/to/ralph/ralph.sh ralph/  

# 根据使用的 AI 工具，复制对应的提示词模板  
cp /path/to/ralph/prompt.md ralph/prompt.md    # 用于 Amp  
# 或者  
cp /path/to/ralph/CLAUDE.md ralph/CLAUDE.md    # 用于 Claude Code  

chmod +x ralph/ralph.sh

### 方式二：全局技能安装

将 Ralph 相关技能复制到 Amp 或 Claude 的配置目录中，实现跨项目复用：

# 对于 Amp  
cp -r skills/prd ~/.config/amp/skills/  
cp -r skills/ralph ~/.config/amp/skills/  

# 对于 Claude Code  
cp -r skills/prd ~/.claude/skills/  
cp -r skills/ralph ~/.claude/skills/

### 方式三：Claude Code 插件安装（推荐）

这是最简单的方式，直接从市场安装：

# 1. 添加市场  
/plugin marketplace add snarktank/ralph  

# 2. 安装插件  
/plugin install ralph-skills@ralph-marketplace

安装后可用的技能：

- •
  /prd
  — 生成产品需求文档

- •
  /ralph
  — 将 PRD 转换为
  prd.json
  格式

在实际使用中，这些技能通常不需要你手动调用。当你在 Claude 中发出以下类似请求时，它们会自动触发：

- •
  "create a prd"
  ,
  "write prd for"
  ,
  "plan this feature"

- •
  "convert this prd"
  ,
  "turn into ralph format"
  ,
  "create prd.json"

### 配置 Amp 的 auto-handoff（推荐）

如果任务太大，超出了单个上下文窗口，建议开启 Amp 的 auto-handoff 功能，自动切换上下文，保证 Ralph 可以处理大型任务。

在  ~/.config/amp/settings.json  中添加：

{  
  "amp.experimental.autoHandoff": { "context": 90 }  
}

## 实战教程

接下来，让我们通过一个完整的实例，看看 Ralph 在实际项目中是如何发挥作用的。

### 示例：使用 Claude Code 构建任务管理器应用

步骤一：初始化项目

# 创建项目  
mkdir ralph-todo-app  
cd ralph-todo-app  

# 初始化 Git 仓库  
git init

步骤二：创建 PRD

首先，使用  /prd  技能创建产品需求文档：

/prd 创建一个简单、清晰、可扩展的 Todo 应用，支持本地存储持久化。功能包括：新增、编辑、删除以及筛选待办事项

AI 会收集需求细节，生成结构化 PRD 文档，并保存到  tasks/prd-todo-app.md  。

prd-todo-app.md 内容：

步骤三：转换为 Ralph 格式

有了 PRD 后，需要将其转换为  prd.json

/ralph tasks/prd-todo-app.md

AI生成的结果：

prd.json 内容：

步骤四：复制 Ralph 相关文件

将 Ralph 相关文件复制到你的项目中：

# 在项目根目录  
cp ~/.claude/plugins/marketplaces/ralph-marketplace/ralph.sh ralph/  

cp ~/.claude/plugins/marketplaces/ralph-marketplace/CLAUDE.md ralph/CLAUDE.md  

# Mac / Linux  
chmod +x ralph/ralph.sh

步骤四：运行 Ralph 循环

Windows（Git Bash）：

sh ./ralph/ralph.sh --tool claude 10

Mac / Linux：

./ralph/ralph.sh --tool claude 10

步骤五：查看 progress.txt

progress.txt  会记录每次迭代中 AI 学到的内容：

这些信息会在后续迭代中自动提供给新的 AI 实例，帮助形成知识积累。
步骤六：查看 Git 提交历史

git log --oneline ralph/todo-app

每次提交都是原子化且可独立验证的，这让代码审查和回滚变得非常简单。

最终成果

经过上面几个步骤，我们的任务管理器应用应用就成功开发出来了！

## 常用技巧与最佳实践

### 浏览器验证

对于前端任务，如果验收标准需要在浏览器中验证。Ralph 会根据你安装的  dev-browser  技能或  playwright  MCP 服务，自动执行相关操作：

- • 自动打开浏览器

- • 导航到目标页面

- • 与 UI 交互，确认功能是否正常

### 监控与调试

当你想了解 Ralph 当前运行状态时，可以使用以下命令：

# 查看哪些任务已完成  
cat prd.json | jq '.userStories[] | {id, title, passes}'  

# 查看之前迭代记录的学习内容  
cat progress.txt  

# 查看最近的 Git 提交历史  
git log --oneline -10  

# 查看当前所在分支  
git branch

### 自定义提示词模板

将  prompt.md  （Amp）或  CLAUDE.md  （Claude Code）复制到项目中后，可以根据项目实际情况进行定制：

- • 添加项目特定的质量检查命令

- • 写入代码库约定和编码规范

- • 提供技术栈相关的常见陷阱或注意事项

### 适用场景

✅ 适合 Ralph 的情况：

- •
  功能迭代
  ：添加新功能或修复 Bug

- •
  小模块开发
  ：独立功能模块

- •
  明确需求
  ：有清晰的 PRD 和验收标准

- •
  原型开发
  ：快速构建 MVP

❌ 不太适合的情况：

- •
  探索性开发
  ：需求不明确，需要大量试验

- •
  大规模重构
  ：涉及多个文件的系统性变更

- •
  安全关键代码
  ：需要人工严格审查的部分

- •
  性能优化
  ：需要深入分析系统架构的场景

### 常见问题

Q1：Ralph 在某次迭代中卡住了

A：解决方法：

# 查看当前未完成任务  
cat prd.json | jq '.userStories[] | select(.passes == false)'  

# 手动运行质量检查，找出问题  
npm run typecheck  
npm run test  

# 修复问题后，重新启动 Ralph  
./ralph/ralph.sh

Q2：任务太大，AI 无法在单个上下文窗口内完成

A：手动编辑  prd.json  ，将较大的任务拆分成多个小任务；如果使用 Amp，可以启用  auto-handoff  功能，让 Ralph 自动处理超大任务，并在不同上下文间继续执行。
Q3：AGENTS.md 更新不准确

A：检查并修正  AGENTS.md  ，然后在  prompt.md  或  CLAUDE.md  中添加明确指令，保证未来迭代能正确记录学习内容。

## 写到最后

Ralph 通过自治循环模式，带来了一种新的 AI 编程思路：不再指望单个 AI 实例完成所有事情，而是通过迭代和共享记忆，让多个 AI 实例协作完成复杂任务。

这背后其实是一种信任的变化：不再盯着每一步对不对，而是相信模型在反复尝试中会慢慢走对；相信反馈能把跑偏的地方拉回来；也相信边界条件不会让成本失控。

正如 Geoffrey Huntley 所说：

Ralph 不是用来取代开发者，而是自动化那些枯燥的部分，让我们能专注于更有趣的工作。

如果你也希望提高 AI 协作开发的效率和质量，不妨在下一个项目中试试 Ralph。

GitHub 地址 ：https://github.com/snarktank/ralph
引用链接

[1]  Ralph 循环模式:  https://ghuntley.com/ralph/ 

[2]  查看交互式流程图:  https://snarktank.github.io/ralph/

既然看到这里了，如果觉得有启发，随手点个赞、推荐、转发三连吧，你的支持是我持续分享干货的动力。
