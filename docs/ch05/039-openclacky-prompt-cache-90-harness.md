# OpenClacky — Prompt Cache 命中率 90% 的 Harness 工程实践

## Ch05.039 OpenClacky — Prompt Cache 命中率 90% 的 Harness 工程实践

> 📊 Level ⭐⭐ | 13.5KB | `entities/openclacky-harness-prompt-cache.md`

## 核心结论
**「效果已经不是当前 Agent 的主要矛盾，成本才是。」**
3项任务 × 4家Agent横评（OpenRouter CSV逐请求核算）：
| Agent | 总成本 | 请求数 | Cache命中率 |
|-------|--------|--------|------------|
| **OpenClacky** | **$5.10** | **51** | **90.6%** |
| Claude Code | $5.49 | 70 | 95.2% |
| OpenClaw | $15.70 | 81 | 88.7% |
| Hermes | $30.14 | 218 | 60.3% |
成本差距 = 请求数 × cache命中率。OpenClacky是全功能Agent（WebUI/CLI/记忆/Skill/IM/浏览器/子Agent）。
---

## 高Cache命中率与多功能的结构性冲突
| 冲突场景 | 失效机制 |
|---------|---------|
| 切模型 | 模型ID写进system prompt → 立即失效 |
| 中途装skill | skill列表写进system prompt → 立即失效 |
| 日期变化 | system prompt内嵌日期 → 跨天全失效 |
| 加工具 | 工具schema变化 → 失效面扩大 |
| 独立压缩call | 100% cache miss + 主对话cache凉 |

---

## 三代失败史
### 第一代（2024-2025上）：RAG/知识库
**结论：❌ 千万不要搞任何RAG、知识库分片。直接上Agent，外加适合AI阅读的网站。**

- 准确率：97%召回率才刚够用
- 实时性无法保证（codebase更新需同步更新向量）
- 多一个会失败的部件增加延迟

### 第二代（2025中期）：多Agent工作流
**结论：❌ 不要做工作流编排。多Agent在结构上就是cache灾难。❌ 不要被benchmark绑架。把预算花在harness上。**

- 每次交接 = 一次cache miss
- 单agent 4分钟的任务 → 多agent 14分钟，成本6×

### 第三代（2025年底至今）：Ruby重写
围绕"**cache局部性**"和"**工具集稳定性**"。
---

## 核心工程决策
### 决策1：双cache标记（滚动双缓冲）
**问题场景**：单marker在history单调追加/模型回退/切模型时均失效。
**解法**：每轮标记**两条连续消息**，形成滚动双缓冲：

- 任何时刻持有两个断点：读（上一轮建立）和写（刚建立）
- 下一轮把"读"再用一次，把"写"扔掉，在新尾部写新的
- 永远不会两个buffer同时失效
**为什么是2**：2是覆盖尾部边界的最小数量。3多余，4浪费。
**额外好处**：双标记能扛住**单步回退**（两步以上概率低到可接受全miss）。

### 决策2：永不变的system prompt
**纪律**：session启动时一次性构建，之后字节冻结。
**四类动态信息的重定向方案**：
| 信息 | 处理方式 |
|------|---------|
| 当前时间/目录/OS | 写入message流 |
| 当前模型ID | 写入[session context]块 |
| 新装skill | [session context]通告 + invoke_skill热加载 |
| USER.md/SOUL.md更新 | session启动时读取，之后冻结 |
**[session context]块**：

- 标记`system_injected: true`（不被cache marker选中）
- 按日期gate（跨天才插新条）

### 决策3：invoke_skill的妙用
`invoke_skill`（16个工具之一，<200 Token）：

- 子agent = 状态隔离（主agent history不被中间过程污染）
- 动态加载skill（通过[session context]通告 + 运行时读取）
- 自进化文档处理（Python脚本在用户目录，agent可自行修改）

### 决策4：16个稳定工具
**工具schema紧贴system prompt → schema一变后面全失效**
| 类别 | 工具 |
|------|------|
| 文件读写 | file_reader, write, edit |
| 代码搜索 | glob, grep |
| 执行 | terminal |
| 浏览器 | browser |
| 网络 | web_search, web_fetch |
| 任务管理 | todo_manager, list_tasks, undo_task, redo_task |
| 交互 | request_user_feedback |
| 扩展 | invoke_skill |
| 安全 | trash_manager |

### 决策5：压缩策略
**Insert-then-Compress**（不换模型、空闲时做、压到底）
| | 独立call | Insert-then-Compress |
|--|---------|---------------------|
| 压缩call cache hit | 0% | ~95% |
| 冷token量 | ~50,000 | ~500 |
| cold-warm轮数 | 4–5 | 1 |
**空闲第3分钟触发**：防止cache TTL过期后付全价。

### 决策6：自进化文档处理
不用内置`read_pdf`等工具（工具列表膨胀）。
**第三种路径**：Python脚本copy到`~/.clacky/scripts/`，通过`terminal python3 ...`调用。脚本可由agent自行修改 + pip安装依赖。

### 决策7：No Headless浏览器
**不Headless**：内置MCP Client接管用户已有的Chrome/Edge（Remote Debugging端口）。
---

## 深度分析
###  Cache命中率的工程本质
Prompt Cache命中率的工程，本质上是**上下文边界的最小化**问题。 OpenClacky揭示了一个关键矛盾：多功能与高Cache命中率天然冲突——每增加一个动态写入system prompt的元素（模型ID、skill列表、日期），就制造一次全量Cache失效。而这个矛盾在多Agent架构下会被指数级放大：Metabase团队10个自定义Subagent的实践表明，每个Subagent各有独立system prompt，各自的Cache命名空间导致每次Agent间交接都是一次Cache miss。

###  三代演进的认知迭代
三代失败的认知价值在于揭示了RAG和多Agent工作流的真实成本。 第一代RAG的教训是：90%召回率不够用，97%才刚够——这意味着向量检索必须极其精准，而精准的代价是高维护成本和低实时性。第二代多Agent工作流的教训更深刻：单Agent 4分钟的任务通过多Agent编排变成14分钟，成本上涨6倍——这说明Agent间的交接成本远大于预期，"万能Agent"与"高效协作"之间存在根本张力。

###  双Cache标记的架构意义
双Cache标记（滚动双缓冲）看似是一个Cache优化技巧，实则重新定义了session的边界模型。 传统单marker模式假设Cache段与session历史一一对应，但实际session是动态增长的——每轮对话后history变长，原marker位置的内容发生变化，导致整段Cache miss。双缓冲通过始终保持两个相邻断点，让Cache段在history增长时仍能正确对应，将Cache命中率从"依赖session结构"变成"主动管理边界"。

###  System Prompt冻结的工程哲学
System Prompt冻结原则体现了一个深层工程哲学：**不变性是最好的优化**。 当动态信息（时间、模型ID、skill列表）被强制重定向到message流或专门的session context块，system prompt变成一个静态只读段，每次请求只需付出最小增量成本。OpenClacky的实践表明，接受"skill安装后需要下次session才生效"这个摩擦，换来的是每轮请求的Cache收益——这是典型的以局部摩擦换全局优化的工程权衡。

###  工具集稳定性的隐藏价值
16个稳定工具的设计不仅是成本优化，更是一种**能力边界宣言**。 每增加一个工具，工具schema就要重新序列化到system prompt，Cache就要重新计算。OpenClacky选择用"够用但不冗余"的16个工具代替"无所不能"的大量工具，本质上是在功能完备性与Cache命中率之间做了显式的边界划定——这个边界一旦划定，工具集就成为系统的不变量，Cache优化变得可预测。
---

## 实践启示
###  优先级自查：从高命中率到功能完整
**第一步：锁定System Prompt的字节冻结**
在加入任何动态功能（skill、模型切换、日期感知）之前，先确保System Prompt在session启动时一次性构建、之后不变。这是Cache命中率的根基。具体做法：

- 将模型ID、OS信息写入专门的`[session context]`块而非system prompt本身
- 日期/时间写入message流而非system prompt
- Skill列表在session启动时渲染进system prompt，之后冻结
**第二步：实现双Cache标记**
如果你已经有单Cache标记机制，双标记是投入产出比最高的升级：

- 每轮对话末尾标记两条连续消息（形成读+写两个buffer）
- 下一轮用"读"buffer，把"写"buffer向前滚动
- 这个设计能扛住单步回退和模型切换，是Session长期运行的关键保障
**第三步：控制工具数量在稳定范围**
在追求功能全面之前，先问：这个工具的schema变化频率是多少？如果一个工具的参数经常变化，它加入工具集带来的Cache失效成本可能超过其提供的功能价值。OpenClacky的16个工具原则值得借鉴：glob和grep不合并（合并会让参数变复杂），但也不为每个场景单独添加工具。
**第四步：压缩使用Insert-then-Compress而非独立call**
如果你的Agent需要压缩历史，优先使用Insert-then-Compress而非单独发起一次压缩请求：

- 把压缩指令作为消息插入当前对话末尾（标记`system_injected: true`）
- 这样压缩请求本身也能享受Cache命中（约95%）
- 冷token量从~50,000降到~500
**第五步：避免多Agent工作流除非必要**
如果你正在考虑用多Agent架构来分担任务，先问：这些Agent之间需要多少次交接？每次交接都是一次Cache miss。如果必须用多Agent，至少确保：

- 每个Agent的system prompt高度稳定
- 交接信息最小化（只传递必要结论而非完整context）
- 考虑用invoke_skill代替独立Agent来处理子任务（更少的context复制）

###  自检清单：你的Agent离90%命中率还有多远
| 检查项 | 低Cache表现 | 高Cache表现 |
|--------|------------|------------|
| System Prompt | 每次请求动态拼接 | 启动时冻结，之后不变 |
| 日期/时间 | 每次写进system prompt | 写入message流或session context块 |
| 模型切换 | 直接改system prompt | 通过session context传递 |
| Skill加载 | 改system prompt触发失效 | 通过invoke_skill热加载 |
| 工具数量 | 几十个且经常变化 | 十几个且相对稳定 |
| 压缩策略 | 独立压缩call（0% cache） | Insert-then-Compress（95% cache） |
| 多Agent使用 | 频繁交接，每次都复制context | 用invoke_skill代替或最小化交接 |

###  关键工程判断
**「效果已经不是当前Agent的主要矛盾，成本才是。」** 这个判断的工程含义是：2026年的Agent竞争，不是模型能力的竞争，而是Harness工程化的竞争。OpenClacky在保持全功能（WebUI/CLI/记忆/Skill库/IM/浏览器自动化/子Agent/运行时切模型）的同时达到90.6%命中率，证明成本控制和功能完整性可以兼得——前提是围绕Cache局部性和工具集稳定性做系统化设计。
---

## 相关实体
## 相关实体
- [Openclacky Harness Engineering 100 Percent Cache Hit](ch05/009-harness.md)
- [Deepseek Cost Migration System Layer Kv Cache Harness](ch05/009-harness.md)
- [Openclaw Prompt Context Harness](ch05/009-harness.md)
- [Prompt Context Harness Three Evolutions](ch05/009-harness.md)
- [From Prompt To Harness Claude Official](ch05/009-harness.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/openclacky-prompt-cache-harness-v2ex-799662c56ba6.md)

---

