---
title: "Harness 工程分享：LLM Agent 的 prompt cache 命中率 90% 实战"
author: yafeilee（V2EX PRO）
date: 2026-05-14
source: https://www.v2ex.com/t/1212780
sha256: 799662c56ba6
review_value: 8
review_confidence: 7
review_score: 56
review_recommendation: 入库
tags:
  - harness
  - prompt-cache
  - llm-agent
  - openclacky
  - cache-hit-rate
  - ruby
  - engineering
  - multi-agent
  - rag
  - cost-optimization
  - skill-system
  - invoke-skill
  - compression
  - browser-automation
---

## 三年失败史
### 第一代（2024-2025上）：RAG / 知识库
**实际失败原因**：
- 成本高：codebase更新需同步更新向量，实时性无法保证
- 准确率有限：90%召回率不够用，**97%才刚够用**
- 多了一个会失败的部件（向量库），增加延迟
**结论：千万不要搞任何RAG、知识库分片。直接上Agent，外加一个适合AI阅读的网站即可。**
### 第二代（2025中期）：SWEBench / 多Agent工作流
**实际失败原因**：
- 每个sub-agent各有system prompt，各自cache命名空间 → **每次交接=一次cache miss**
- 单agent 4分钟的任务 → 多agent编排到14分钟，成本6×
- SWEBench刷分与用户实际感受严重脱节
**结论**：
- ❌ 不要做工作流编排。多Agent在结构上就是cache灾难。AI是万能的。
- ❌ 不要被benchmark绑架。把工程预算花在harness上，不要花在编排上。
### 第三代（2025年底至今）：Ruby重写
围绕"**cache局部性**"和"**工具集稳定性**"组织。
---
## 核心决策1：双cache标记 + 允许失败回退
### 问题：单marker的三个失效场景
1. **history单调追加**：第N轮在`messages[-1]`打marker → 第N+1轮history又长了，原marker位置内容变了 → 整段history cache miss
2. **模型回退一次tool call**：工具报错/Ctrl-C重试 → "原本最后一条"被丢弃，单marker直接作废
3. **运行时切模型**：marker位置抖动 → 切换成为新的cache miss事件
### 解法：双标记（滚动双缓冲）
```
第N轮：[..., msg_A, msg_B(*), msg_C(*)]
                        ↑      ↑
                  marker1   marker2
第N+1轮：[..., msg_A, msg_B(*), msg_C(*), msg_D(*)]
                        ↑      ↑         ↑
                  (仍在)  (仍在)    新marker
```
任何时刻持有两个断点——一个"刚建立的"（写）和一个"上一轮建立的"（读）。下一轮把"读"再用一次，把"写"扔掉，再在新尾部写一个。**永远不会出现两个buffer同时失效的瞬间。**
### 为什么是2，不是3或4
- 每多一个marker → 多一次cache write（按写入费率收费）
- 2是覆盖尾部边界的最小数量
- 3多余，4浪费
### 额外好处：单步回退仍能命中
单marker在回退时直接作废；**双标记能扛住单步回退**（两步以上回退概率已低到可接受全miss一次）。
---
## 核心决策2：永不变的system prompt
**核心纪律：system prompt在session启动时一次性构建，之后字节冻结。**
任何"想往system prompt里塞动态信息"的需求 → 重定向到别的位置。
### 四类天然想插入system prompt的动态信息
| 信息类型 | 解决方案 |
|---------|---------|
| 当前时间/工作目录/OS | 写入message流，而非system prompt |
| 当前模型ID | 写入[session context]块 |
| 用户装新skill | 启动时渲染进system prompt，之后冻结 |
| USER.md/SOUL.md更新 | 同上，session内不再变 |
### [session context]块
```python
[Session context: Today is 2026-05-13, Tuesday.
Current model: claude-sonnet-4-6.
OS: macOS. Working directory: /Users/.../project]
```
- 标记为`system_injected: true`，不会被cache marker选中
- 按日期gate：同一天内只注入一条
- **组装顺序比内容更要紧**
### Skill列表处理
Skill列表在session启动时渲染进system prompt，之后冻结。session中途装的新skill → 模型通过`[session context]`通告知道名称，通过`invoke_skill`热加载。
接受这个摩擦：装skill是低频操作，cache命中是每轮都在享受的收益。
---
## 核心决策3：invoke_skill的妙用
`invoke_skill`是OpenClacky 16个工具之一，**最核心的设计，只占system prompt不超过200 Token**。
### 子agent = 状态隔离
子agent的中间过程隔离在自己session里。主agent history不被污染。
### 动态加载skill，不改system prompt
通过`[session context]`通告 + `invoke_skill`的运行时读取组合实现。不改system prompt、不改工具列表、不重启session。
### 自进化文档处理
首次安装时把Python脚本copy到`~/.clacky/scripts/`，agent通过`terminal`调用。遇到新格式可自行`write`修改脚本 + `pip install`装依赖 → 下次同类文件就解决了。
---
## 核心决策4：控制稳定可靠的工具集 16个
**工具schema紧贴system prompt之后。schema一变，后面全失效。**
### 16个工具
| 类别 | 工具 | 说明 |
|------|------|------|
| 文件读写 | file_reader, write, edit | |
| 代码搜索 | glob, grep | |
| 执行 | terminal | tshell命令 |
| 浏览器 | browser | 接管Chrome/Edge |
| 网络 | web_search, web_fetch | |
| 任务管理 | todo_manager, list_tasks, undo_task, redo_task | |
| 交互 | request_user_feedback | |
| 扩展 | invoke_skill | 调用skill |
| 安全 | trash_manager | 安全删除 |
### 设计原则
- **简化参数**：参数越少，模型出错概率越低
- **够用但不冗余**：glob和grep是两个工具而非一个（合并会让参数变复杂）
- **为每个工具写丰富的测试用例**：1600+用例覆盖各种场景
---
## 核心决策5：压缩——不换模型、空闲时做、压到底
### 压缩是cache命中率最大的单点威胁
### 结论一：不要换模型压缩
| | 独立call方案 | Insert-then-Compress |
|--|-------------|---------------------|
| 压缩call的cache hit | 0% | ~95% |
| 压缩期间cold token | ~50,000 | ~500 |
| 主session cold-warm轮数 | 4–5 | 1 |
Insert-then-Compress：把压缩指令作为消息插进当前对话末尾（标记`system_injected: true`），走正常请求路径。
### 结论二：20–30万token是压缩甜区
### 结论三：空闲第3分钟启动压缩
跑idle计时器：用户停止输入90秒后检查 → 若history接近压缩阈值 → 立刻触发压缩（此时cache仍热）。
**效果**：用户思考几分钟后回来 → session已经压缩好+cache warm。而非面对cache过期的长history（一轮可能付10×成本）。
---
## 核心决策6：自进化工具能力
不用`read_pdf`、`read_excel`等内置工具（会让工具列表膨胀）。
**第三种路径**：
1. 首装时copy Python脚本到`~/.clacky/scripts/`
2. Agent通过`terminal python3 ~/.clacky/scripts/read_pdf.py <file>`调用
3. 脚本跑不过 → agent自己`write`修改 + `pip install`装依赖
把文档处理从工具层面拉到脚本层面，避免工具列表膨胀 + 避免硬编码C扩展依赖。
---
## 核心决策7：内置浏览器工具，No Headless
不用Headless浏览器（用户看不见，无法建立信任；反爬检测问题）。
**第三种路径**：内置MCP Client，接管用户已在跑的Chrome/Edge（开启Remote Debugging端口）。
- daemon进程首次调用时启动，后续跨多次tool call保持存活
- 对模型暴露高层语义动作（snapshot、click、type、navigate、screenshot）
---
## 选Ruby的理由
动态语言 + 元编程：method_missing、define_method、class_eval让Skill自进化、动态加载、工具注册等能力在运行时实现。
---
## 核心判断
**「效果已经不是当前Agent的主要矛盾，成本才是。」**
Prompt cache命中率的工程，是2026年LLM Agent开发者的核心竞争力。