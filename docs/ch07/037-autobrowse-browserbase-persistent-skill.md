# Autobrowse Browserbase Persistent Skill

## Ch07.037 Autobrowse Browserbase Persistent Skill

> 📊 Level ⭐⭐ | 9.1KB | `entities/autobrowse-browserbase-persistent-skill.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/autobrowse-browserbase-persistent-skill-files.md)

# Autobrowse — 浏览器 Agent 持久记忆：技能文件作为永久技能
## 核心定位
Browserbase（Kyle Jeong, 2026-05-07）提出。核心命题：**让浏览器 Agent 的每次探索都变成可复用的永久技能**——不是向量，不是会话录像，而是任何人都能读懂的 markdown 技能文件。

## 核心问题：探索税（Discovery Tax）
**定义**：浏览器 Agent 每次会话结束后学到的一切都跟着蒸发，下次运行还得从零开始探索同一个网站。推理能力越来越强，但记忆没有改善。
**凯恩斯思想实验**：没有海马体的天才，每次从零推导出同样精妙的结论，却无法在昨天的洞察上继续前进。
**根本瓶颈**：不是推理能力，而是**记忆形式**——现有方案（会话录像、trace、embedding 向量）要么不可读、要么不可复用、要么两者兼有。

## 核心架构：五步学习循环
```
Objective → Run → Study → Iterate → Graduate (SKILL.md)
    ↑                                      ↓
    ←←←←←←←← strategy.md（跨迭代叠加）←←←←←
```
| 步骤 | 作用 |
|------|------|
| Objective | 真实任务输入 |
| Run | 产生完整 trace（工具调用、token 消耗） |
| Study | Agent 元认知反思（卡点、猜测、不必要 token） |
| Iterate | strategy.md 叠加学习笔记，跨迭代知识积累 |
| Graduate | 收敛后输出 SKILL.md + 辅助脚本 |
**收敛信号**：相邻迭代成本和轮次数改善幅度收窄时主动短路；目标不是全局最优，是"足够好+足够可靠+足够便宜"。

## 关键设计：记忆 = Markdown 技能文件
**为什么不用向量/截图**：

- 向量：不可读，跨 Agent 无法复用
- 截图：不可执行，无法版本控制
**SKILL.md 结构**：

- 名称、描述
- 推荐方法 + 备选路径
- 具体 API 调用步骤（含参数说明）
- 已知坑点和规避方式
- 辅助脚本（CLI、Python helper、CSS 选择器）
**可读性 → 可审计 → 可移交**：从"信任 Agent 输出"跃迁到"读懂 Agent 操作手册"。

## 量化效果：Craigslist 基准
**任务**：旧金山 Craigslist 两居室公寓搜索，$5000–$7000，带室内洗衣机。
| 指标 | 原始 Agent | Autobrowse 技能 | 改善 |
|------|-----------|-----------------|------|
| 耗时 | 71 秒 | 27 秒 | **2.6x ↓** |
| 成本 | $0.22 | $0.12 | **45% ↓** |
| 正确性 | 0 精准命中 | 2 精确匹配 | **✓** |
**关键洞察**：更快失败不比慢但正确更有价值——正确性是核心指标。

## 核心发现：JSON API 逆向
**Craigslist 探索发现**：

- 搜索页面全 JS 渲染，`browse snapshot` 返回 0 个可访问性引用
- 真实数据在 `https://sapi.craigslist.org/web/v8/postings/search/full`（公开 JSON API，无鉴权）
- 坑：`postal=` 参数缺失时按 IP 地理位置返回错误城市
- 人工逆向需数小时，Autobrowse 几次迭代自动发现

## 自批评：Agency 分层框架
| 层级 | 工具 | 适用场景 |
|------|------|---------|
| L0 | 确定性 Python + BeautifulSoup | 静态 HTML |
| L1 | `browse fetch` | 简单动态页面 |
| L2 | Autobrowse | 高复杂性、需探索的长尾网站 |
**原则**：先用最低 Agency 工具探一下，能拿到数据就停止；只有低 Agency 工具都失败时才升级到 Autobrowse。

## 复利与递归
**技能库复利**：每新网站 → 新技能 → 长尾任务越来越便宜。能力工厂模式。
**递归改进自身**：

- 迭代循环本身、收敛启发式、技能模板格式 → 也成为被优化的对象
- 不依赖神秘新模型能力，只需方法递归应用

## 相关概念
- [Hermes Agent](https://github.com/QianJinGuo/wiki/blob/main/concepts/hermes-agent.md) — self-improving 方向相通，但 Autobrowse 通过显式技能文件实现而非隐式记忆
- [Browser Harness](https://github.com/QianJinGuo/wiki/blob/main/entities/browser-harness.md) — Autobrowse 是 Browser Harness 持久记忆问题的具体答案
- [Agent Skill 编写指南](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-skill-writing.md) — SKILL.md 格式与 Skill 编写规范高度一致，Autobrowse 是这一原则在浏览器场景的工程化实践
- [Factory Mission](https://github.com/QianJinGuo/wiki/blob/main/entities/factory-mission-multi-agent-architecture.md) — 两者都解决"历史探索知识无法积累"问题，但 Factory 侧重多 Agent 协作，Autobrowse 侧重单 Agent 的跨会话持久化
- [Hermes Self-Improving Loop](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-self-improving-loop-winty.md) — 理念高度一致：都通过 markdown 技能文件实现 Agent 持久记忆，强调人类可读性作为可审计性基础，支持版本控制和迭代改进

## 深度分析
### 记忆形式才是根本瓶颈
过去两年浏览器 Agent 的推理能力突飞猛进——JS 渲染、反爬、多步流程、验证码处理均有突破。但跨会话传递知识的能力没有任何改善。Kyle Jeong 的核心论断：现有记忆方案（会话录像、execution trace、embedding 向量）要么不可读，要么不可复用。真正有用的记忆必须同时满足：能被人读懂、能被 Agent 执行、能被团队共享和版本控制。这三个条件指向同一个答案——markdown 技能文件，而非向量数据库或截图。

### 五步学习循环的收敛机制
Objective → Run → Study → Iterate → Graduate 的五步循环中，真正的知识积累发生在 Iterate 阶段——`strategy.md` 跨迭代叠加，每次新迭代先读这份笔记，确保上次学到的教训不会丢失。收敛信号是相邻迭代成本和轮次数改善幅度收窄时主动短路。关键洞察：目标不是全局最优，而是"足够好 + 足够可靠 + 足够便宜"的三重约束满足。这个终止条件本身就是一种元级别的工程决策，避免无限迭代的资源浪费。

### JSON API 逆向作为核心发现
Craigslist 基准测试揭示了一个深层模式：浏览器 Agent 的真正瓶颈往往不是推理，而是数据结构发现。搜索页面全 JS 渲染，`browse snapshot` 返回 0 个可访问性引用；真实数据藏在未文档化的公开 JSON API 中。这个发现不是靠人工调研，而是 Autobrowse 几次迭代自动完成的——这说明 Agent 在探索过程中积累的"网站结构知识"比任何静态爬虫规则都更有价值。

### Agency 分层与工具选择原则
L0（确定性 Python + BeautifulSoup）适合静态 HTML；L1（`browse fetch`）适合简单动态页面；L2（Autobrowse）适合高复杂性、需探索的长尾网站。原则很清晰：先用最低 Agency 工具探一下，能拿到数据就停止；只有低 Agency 工具都失败时才升级到 Autobrowse。这个分层框架解决的是"工具错配"问题——用大炮打蚊子或用蚊子扛大炮都是资源错配。

### 技能库的复利与递归
每新网站 → 新技能 → 长尾任务越来越便宜。能力工厂模式的核心是复利：技能库增长 → 后续任务成本下降 → 更多任务变得经济可行。更值得关注的是递归自我改进：迭代循环本身、收敛启发式、技能模板格式都成为被优化的对象。这不依赖神秘的新模型能力，只需方法递归应用。

## 实践启示
**工具选择：先探后用**。遇到网站先用 `browse fetch` 探一下，数据直接在响应里就写解析器；响应为空或需 JS 渲染才升级到 Autobrowse。避免从一开始就用高 Agency 工具，白白付探索税。
**收敛判断：边际改善收窄即停**。通常 3-5 次迭代后，相邻迭代的成本和轮次改善幅度开始收敛。记住目标不是全局最优，而是三重约束的同时满足——足够好、足够可靠、足够便宜。无限迭代是对资源的浪费。
**技能文件：可读性是一切的基础**。SKILL.md 的价值在于同时服务两个受众：Agent 能直接加载执行，人类能读懂并审计。工程师可读可编辑可版本控制，非技术人员也能发现错误。从"信任 Agent 输出"跃迁到"读懂 Agent 操作手册"是本质改变。
**正确性优先于速度**。"更快失败"的 Agent 不比"慢但正确"的 Agent 更有价值。在基准测试中，原始 Agent 60 个全市范围结果 0 精准命中，Autobrowse 技能 2 个精确匹配——这个差距才是关键。速度和成本改善是正确性解决后的副产品。
**静态 HTML 不用 Autobrowse**。167 行静态 HTML 州立法规目录跑了四次迭代、~$24 美元仍无法单次返回完整数据——这是工具错配的典型教训。这种场景用 ~200 行确定性 Python + BeautifulSoup 即可，亚秒级运行，零推理成本。
---
*Last updated: 2026-05-19*
*评审：Value 8 × Confidence 8 = 64 ✅ PASS | ★★★★*

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/ai-skill-design.md)

---

