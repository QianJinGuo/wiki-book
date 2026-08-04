---
title: "别等 Spec 写完才发现不对：AI 编程时代，一文讲透如何用 /Prototype 直接看效果"
source_url: "https://mp.weixin.qq.com/s/tJDyL5L6SmcSZaRH-0WNrw"
author: 运维有术 / 术哥无界
platform: WeChat
ingested: 2026-08-04
slug: matt-pocock-prototype-skill-shuge-2026-08-04
sha256: 8805f5f0c7f7033026a763b23e3ab8ab6d720f3c7c06edca08f9115a5ddde1dd
---

🚩 2026 年「术哥无界」系列实战文档 X 篇原创计划 第 186 篇，AI 编程最佳实战「2026」系列第 66 篇

大家好，欢迎来到 术哥无界 | ShugeX ｜ 运维有术。我是术哥，一名专注于 AI 编程、AI 智能体、Agent Skills、MCP、云原生、AIOps、Milvus 向量数据库的技术实践者与开源布道者！Talk is cheap, let's explore。无界探索，有术而行。

[图片:AI 编程时代 Prototype 方法论信息图封面]

## 1. 一个真实的需求：给订单追踪页加搜索

AI 编程圈有个普遍现象，Matt Pocock 说这让他"非常抓狂"：很多人拿到 AI 第一反应是——我得先写一份详细的需求文档。他们把全部精力投入写一份事无巨细的 spec，指望 AI 照单抓药、一次命中。结果呢？AI 产出了一堆奇怪的东西，和想象中完全不同。

假设你接到一个需求：给一个基于 React 的订单状态追踪页加搜索功能。页面上有 5 种订单状态、筛选器、分页、批量操作。状态之间有复杂的转换逻辑。

如果你选择 Spec 驱动的方式，流程大概长这样：

Round 1。写一份 Spec："订单详情页，顶部显示订单号和状态标签，中间是物流时间线，底部是商品清单。状态标签用不同颜色区分。" AI 生成了一版。时间线是竖的，状态标签全蓝的。

Round 2。改 Spec："时间线用横向步骤条，已完成的绿色、进行中的蓝色、取消的灰色。时间线下方显示预计送达时间。" AI 生成第二版。步骤条太宽溢出了手机屏，预计送达时间没考虑时区。

Round 3。补 Spec："步骤条在小屏幕上自动换行。预计送达时间标注时区。" AI 生成第三版。布局对了，但步骤条只有三个节点，实际有六种状态没覆盖。商品清单的图片加载失败时没有占位图。

Round 4。再补 Spec……这时候已经花了 40 分钟，写了 800 字的 Spec，产出了 4 版没法用的代码。

每一轮都是纯文字 → 凭空想象 → 拿到代码 → 发现不对 → 重新描述。信息损耗越滚越大。

Matt Pocock 的 Skills 仓库里，prototype skill 的定义就一句话："A prototype is throwaway code that answers a question"。它解决的正是上面那个问题——在你还没法用语言精确描述需求的时候，先用可运行的代码把问题可视化。用眼睛做评审，而不是用文字做翻译。

[图片:Spec 驱动模式的信息损耗循环示意图]

## 2. 为什么 AI 让"先做原型"变得划算

传统开发里，写一份 prototype 的成本不低——可能要半天搭环境、半天做交互。所以大多数时候，我们选择先写 spec。"文字总比代码便宜"。

但 AI 改变了这个等式。根据 Matt Pocock 的 prototype skill 设计，一个原型有三个要求：

- 一条命令就能跑（pnpm <name>、python <path>、bun <path>）
- 默认无持久化（状态在内存里）
- 跳过打磨（没有测试、没有错误处理、没有抽象层）

在 AI 辅助下，这些约束意味着几分钟就能生成一个可运行的原型。当原型的成本趋近于零，你讨论的保真度就应该更高。

这就是 Matt Pocock 倾向于在更高保真度上做更多讨论的原因——不是因为 spec 没用，而是因为 AI 让原型变得足够便宜。便宜到值得在"它应该长什么样"或"这个状态机对不对"的问题上，直接看运行效果而不是读文字描述。

## 3. 保真度：什么问题该写 spec，什么问题该做原型

保真度（fidelity）是讨论的精确程度。不同的问题需要不同保真度的讨论方式。有些问题讨论两句就够——文件怎么组织、接口叫什么名字、用什么设计模式。这些是低保真度问题，写几行文字就能对齐。spec 够用。

有些问题必须看到运行效果才能判断——交互细节、布局节奏、状态机边界条件。这些是高保真度问题，文字描述的精度不够。每多一轮翻译就多一层损耗。

Matt Pocock 的 wayfinder skill 对此有一个明确的切换信号：当关键问题变成 "how should it look" 或 "how should it behave" 时，切到 prototype。

换句话说——如果你们还在讨论"要不要加这个功能"或"接口怎么设计"，继续 grilling 就行。一旦讨论焦点变成"它应该长什么样"或"这个状态转换对不对"，文字就不够了。得上可运行代码。

| 问题类型 | 保真度需求 | 推荐方式 | 信号 |
|---|---|---|---|
| 架构选择、模块划分 | 低 | grilling / to-spec | 能用一句话说清 |
| 接口设计、数据结构 | 中低 | grilling + spec | 能画草图对齐 |
| 布局、交互节奏 | 高 | prototype（UI） | "我想看看它长什么样" |
| 状态机、业务逻辑边界 | 高 | prototype（Logic） | "我不确定这个 edge case 对不对" |
| 整体技术方案 | 中 | grilling → to-spec | 多轮讨论能收敛 |

[图片:保真度光谱：从低保真到高保真的讨论方式对比]

## 4. 两条链路：Spec 驱动 vs 原型驱动

Matt Pocock 的 Skills 仓库定义了两条清晰的链路。

**Spec 驱动链路**

grill-with-docs → to-spec → to-tickets → implement → code-review

信息载体是文字。每一轮"写 spec → AI 生成 → 发现不对 → 改 spec"都是一次翻译。你脑子里的画面要翻译成文字，AI 再把文字翻译成代码，你再把代码翻译回画面。每一跳都有损耗。

**原型驱动链路**

grill-with-docs → prototype → 反馈循环 → handoff → implement

信息载体是可运行代码。你不再需要描述"搜索结果应该按时间倒序排列"，而是直接看到页面上搜索结果的排序。然后说"B 变体的排序方式对了，但 A 变体的筛选器交互不行"。

Matt Pocock 在 prototype 的 to-spec 模板里专门留了一个口子："if a prototype produced a snippet that encodes a decision more precisely than prose can, inline it"

意思是——如果原型产出的代码片段比文字更精确地表达了某个设计决定（比如一个状态机、一个 reducer 的签名、一个类型定义），可以直接内联到 spec 里。注明来自 prototype。

可运行代码是最高精度的需求文档。这不是一句口号，而是 prototype skill 在架构层面的设计意图。

## 5. Prototype 的两条分支

Prototype 不是"写个 demo"这么笼统。Matt Pocock 把它分成两条结构完全不同的分支。选错了会浪费整个原型。

**UI 分支：给设计问题跑个分**

触发信号："What should this page look like?"、"I want to see a few options"

UI 原型的核心思路：在同一路由上生成结构不同的变体，用 ?variant= URL 参数切换。三个关键约束：

1. 变体必须结构不同。不是只换颜色、换文案——而是不同布局、不同信息层级、不同主要操作。源码原文："Variants must be structurally different — different layout, different information hierarchy, different primary affordance, not just different colours"。如果两个变体只是卡片背景色从蓝变绿，那不是 prototype，是 tweak。
2. 优先嵌入已有页面（sub-shape A）。把变体挂载到已有的路由上，保留现有的数据获取、参数和鉴权，只换渲染部分。这样变体是在真实环境中被评估的——有真实的 header、真实的 sidebar、真实的数据密度。一个空白路由上的所有变体都会"看起来还行"，因为没有上下文。
3. 新路由兜底（sub-shape B）。只有当原型确实没有已存在的页面可以挂载时才用。路径包含 prototype 字样，比如 /prototype/order-search。

**Matt Pocock 的实操 demo：tldraw 搜索原型**

Matt 在演示中给一个基于 tldraw 的图表应用加搜索功能。数据模型很复杂——图表 + 图表的历史快照。他不确定搜索栏应该长什么样、应该如何交互。于是跑了 prototype。

AI 生成了三个结构不同的变体：
- A 版：搜索框在上方，结果按图表名称分组显示
- B 版：左侧有分组筛选器，可以向下钻取
- C 版：所有结果平铺展示，没有筛选器

Matt 逐个评审——不是写一份评估文档，而是看着运行效果直接说感受："A 的搜索框位置很好，但分组方式不太对。B 的筛选器挺不错。C 的布局最干净。"

这个环节是整个方法论的精华。他不是在"选最好的那个"，而是在收集设计决策。每个变体都编码了一些设计选择，他的反馈就是把这些选择做取舍。

原型会话花了约 10 万 token 后，Matt 做了一次 compact（上下文压缩），然后口述反馈："我喜欢 A 的搜索框，也喜欢 C 的布局。" AI 生成 D 版本，把两者融合。

Matt 强调了一个关键细节：原型直接集成在 live page 上，不是独立路由。因为这样呈现的是代码实际运行方式——"更诚实的呈现"。

UI 原型还有一个浮动底部切换栏：左箭头/右箭头 + 当前变体标签，键盘 ←→ 也可切换。在生产构建中隐藏（通过 process.env.NODE_ENV !== 'production' 控制）。

文件命名示例：在 /settings 路由上做搜索 UI 原型，变体文件可能是：

```jsx
// 在已有的 settings 页面路由上
const variant = searchParams.get('variant') ?? 'A';
return (
  <>
    {variant === 'A' && <VariantA {...data} />}
    {variant === 'B' && <VariantB {...data} />}
    {variant === 'C' && <VariantC {...data} />}
    <PrototypeSwitcher variants={['A','B','C']} current={variant} />
  </>
);
```

**Logic 分支：给状态机跑个边界**

触发信号："Does this state machine handle the edge case?"、"I want to feel out what the API should look like"

Logic 原型的核心思路：纯逻辑终端小程序 + TUI shell。关键约束：逻辑模块必须可移植、纯净。源码原文："Keep it pure: no I/O, no terminal code, no console.log for control flow"。

一个 Logic 原型的典型结构：

```python
# order_state.py — 可移植纯模块（可以搬进真实代码库）
def transition(state: OrderState, event: OrderEvent) -> OrderState:
    """
    纯 reducer：(state, event) => state
    没有 I/O，没有 terminal code
    """
    if state == "pending" and event == "confirm":
        return "confirmed"
    if state == "confirmed" and event == "ship":
        return "shipped"
    if state == "shipped" and event == "deliver":
        return "delivered"
    # edge case: 确认后还能取消吗？
    if state == "confirmed" and event == "cancel":
        return "cancelled"
    raise ValueError(f"非法转换: {state} + {event}")

# tui_shell.py — throwaway TUI 包装
import order_state
# 每帧：清屏 → 渲染当前状态 → 等待键盘输入 → dispatch → 重渲染
```

Logic 原型的产出有两层：TUI shell 是 throwaway，但那个纯逻辑模块可以直接搬进生产代码。这就是 prototype 的"答案"——不是代码本身，而是代码验证过的那个设计决定。

**分支选错的代价**

Matt Pocock 在 SKILL.md 里写得很直接："Getting this wrong wastes the whole prototype"。把 UI 问题走 logic 分支——你写了一堆 reducer 和状态机，但还是不知道页面应该长什么样。把 logic 问题走 UI 分支——你搞了三个漂亮的变体，但状态机的边界条件根本没验证。判断标准很简单：问题的关键词是 "look" 还是 "behave"。

[图片:UI 原型与 Logic 原型的分支对比]

## 6. Prototype 的通用规则

不管走哪条分支，六条通用规则都适用：

1. **Throwaway from day one，明确标记。** 原型代码放在实际使用位置附近，但命名要让路过的读者一眼看出是 prototype。不要让下一个读者误以为这是生产代码。
2. **一条命令就能跑。** 用户必须能不假思索地启动它。如果是 pnpm 项目就 pnpm prototype，如果是 Python 就 python prototype.py。
3. **默认无持久化。** 状态在内存里。持久化是原型要检查的东西，不是它应该依赖的。如果问题本身涉及数据库，用一个名字清晰的 scratch DB 或本地文件，标上 "PROTOTYPE — wipe me"。
4. **跳过打磨。** 没有测试、没有错误处理（除了让原型能跑起来的最小限度）、没有抽象层。目的是快速学到东西，不是写漂亮代码。
5. **Surface the state。** 每次 action 或 variant switch 后，打印/渲染完整的相关状态。让用户能直接看到"什么变了"。
6. **完成后 capture answer。** 验证过的决定迁入真实代码，原型本身作为 primary source 提交到 throwaway branch，不是 main。主分支只保留验证过的决定。

## 7. 原型如何进出主链路

原型不是写完就结束了。Matt Pocock 设计了一个清晰的进出机制。

**出：handoff 出 → 新会话跑 prototype**

当 grilling 进行到某个问题需要"看到运行效果"才能继续时，用 /handoff 把当前对话压缩成一份 handoff document，保存到 OS 临时目录。然后开一个新会话，加载 handoff 文档，跑 /prototype。Handoff 文档不重复其他产物（specs、plans、ADRs、issues、commits），只引用。它还包含一个 suggested skills 部分，告诉下一个 agent 应该调用哪些 skill。

**迭代：compact + 口述反馈**

原型跑起来之后，不是一次定型。Matt 的实际操作是：

1. 生成 3 个变体，用 ?variant= 切换
2. 口述反馈——"A 的搜索框位置对了，但分组方式不对。B 的筛选器不错。C 的布局最干净"
3. 做一次 compact（上下文压缩），把长会话压缩到可继续的长度
4. 继续口述——"我喜欢 A 的搜索框，也喜欢 C 的布局"
5. AI 生成融合版 D，把多个变体的优点合并
6. 再改两轮——"把预计送达时间移到步骤条上方""商品图片加个骨架屏加载态"，每轮 15 秒出结果

关键细节：原型直接集成在 live page 上，不是独立路由。Matt 强调这是"更诚实的呈现"——因为原型展示的是代码实际运行的方式，而不是一个隔离的 demo 环境。

**进：prototype 完成 → handoff 回**

原型迭代满意后，再次 /handoff，把原型的结论（哪个变体被选中、哪些设计决策被验证）压缩成文档，回到原始会话。原始会话引用 handoff doc，继续推进。

**交给 AFK agent 实施**

原型完成后，下一步不是自己重构。交给 AFK agent（Away From Keyboard，后台异步 agent）：
- 接入真实功能
- 删除原型临时代码
- 确保符合原始设计意图

因为 discuss → prototype 的过程已经产出了一份富含设计决策的可运行资产，实施 agent 可以直接参考——不需要从文字 spec 反推设计。

**原型做完不必然直接 implement**

这是很多人容易误解的地方。原型验证完设计决定之后，有两条路：
- 直接 implement——如果问题简单、原型答案清晰、且改动范围小
- 回到 to-spec / to-tickets——如果原型揭示的问题比预期复杂，需要先把原型的结论沉淀成 spec，再拆票实施

Matt Pocock 在 to-spec 和 to-tickets 的模板里都专门留了引用 prototype 代码片段的接口。原型的答案可以 feed into spec——"if a prototype produced a snippet that encodes a decision more precisely than prose can, inline it"。

原型是提升讨论保真度的手段，不是交付物。它的价值在于"回答了一个问题"，而不在于代码本身。

## 8. 三处反例：别这么干

**反例一：把原型直接 promote 成生产代码**

这是最常见的错误。原型是在无测试、最小错误处理的约束下写的——源码明确说 "The variant code was written under prototype constraints (no tests, minimal error handling). Rewrite it properly when you fold it in." 把原型代码直接搬进主分支，等于把一个"快速验证工具"当成"生产级实现"。

**反例二：变体只差颜色不差结构**

源码原文："Variants that differ only in colour or copy. That's a tweak, not a prototype. Real variants disagree about structure." 三个变体，A 是蓝色卡片、B 是绿色卡片、C 是红色卡片——这不是 prototype，这是 wallpaper。真正的变体应该在布局、信息层级、主要操作上有本质区别。

**反例三：UI 问题走 Logic 分支（或反之）**

你不知道搜索结果页应该长什么样，于是写了一个 reducer 来处理搜索状态——这答非所问。或者，你不确定订单状态机的边界条件对不对，于是做了三个漂亮的 UI 变体——状态机的 edge case 根本没验证。

## 9. 判断准则：什么时候该干什么

| 信号 | 动作 |
|---|---|
| 讨论还在"要不要做"、"接口怎么设计" | 停在 grilling |
| 讨论变成"它应该长什么样"、"我想看看几个选项" | 切 prototype（UI） |
| 讨论变成"这个状态机对不对"、"edge case 怎么处理" | 切 prototype（Logic） |
| 原型验证完，结论清晰，改动小 | 直接 implement |
| 原型验证完，揭示的问题比预期复杂 | 回到 to-spec / to-tickets |
| 讨论到不了高保真度但硬要写 spec | 停下来，先 grilling 搞清楚问题本身 |

一句话总结：Prototype 是"用运行代码代替文字描述来讨论设计"的手段。什么时候你觉得"光说不清楚了"，就是该做原型的时候。

[图片:完整的决策流程图：从 grilling 到 prototype 到 implement]

说明：本文内容基于 Matt Pocock Skills 开源项目（mattpocock/skills）源码分析和官方文档整理而成，源码分析基于本地仓库版本，尚未在生产环境中完成全场景验证。文中引用的 Matt Pocock 原话来自其公开演示和 GitHub 仓库。文中的配置模板和参数建议仅供参考，实际效果请以你的业务数据和环境测试结果为准。如果有实际使用经验，欢迎在评论区分享交流。

好啦，谢谢你观看我的文章，如果喜欢可以点赞转发给需要的朋友，我们下一期再见！敬请期待！
