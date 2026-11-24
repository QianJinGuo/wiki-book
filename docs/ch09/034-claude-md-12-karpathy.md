# CLAUDE.md 12 条规则：Karpathy 扩展模板

> 📊 Level ⭐⭐⭐ | 9.1KB

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.8**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/claude-code-12-rules-karpathy-extension.md`，一手来源仍见下方 sources。

## 机制与论文
- [Hermes Agent 深度解析（阿里云/飞樰）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-deep-dive.md) — 自进化内外双路径+四维工程7934字rv9全版
- [王云鹤眼中的Harness：复杂优化问题，AGI灵魂争夺之战](https://github.com/QianJinGuo/wiki-public/blob/main/entities/wangyunhe-harness-optimization-agentsoul.md) — Agent=Models+Harness联合优化
- [AgentMemory：Coding Agent 本地记忆系统](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentmemory-coding-agent-local-memory.md) — 本地记忆运行时
- [DeepSeek V4 DS4C Antirez 本地推理实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deepseek-v4-ds4c-antirez-local-inference-qbitai.md) — ds4.c非对称量化
- [Claude Code 身世：从安全对齐到开发工具的革命](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-origin-safety-alignment-boris-2026.md) — 安全对齐起源

## 工程实践
- [Karpathy CLAUDE.md — 四条行为准则让 AI 编程 Agent 减少结构性失败](https://github.com/QianJinGuo/wiki-public/blob/main/entities/karpathy-claude-md-rules.md) — CLAUDE.md四行为准则rv9
- [Claude Code Skills 实战指南 — 发现机制、编写与安全](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-skills-practical-guide-discovery-frontmatter.md) — 发现机制与安全
- [CLAUDE.md 规则从 Karpathy 的 4 条增加到 12 条](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-md-12-rules-mnilax.md) — 12规则rv9主版
- [Claude Code Skills / MCP / Rules 源码分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-skills-mcp-rules-source-analysis.md) — 三个注入位置
- [Claude Code Prompt 提示词体系源码解析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-prompt-source-analysis.md) — 六大prompt模块全版
- [Harness 工程搭建式业务 Agent 评测方案：Claude Code 作 Harness 搭建者](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineered-business-agent-evaluation-aliyun-boyu.md) — CC搭评测Harness，1.5周→1-2天
- DeepSeek Code Harness — DSH 28k主版
- [鹅厂 Skill 写作完整 Playbook：14 章节 end-to-end 实战 + 工程化评估（腾讯一线踩坑 + Anthropic 官方做法整合）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tencent-skill-writing-complete-playbook-jackjchou.md) — 14章节skill写作playbook
- [Claude Code SKILL.md 写作指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-skill-writing-guide.md) — SKILL.md写作
- [李继刚 23 个 Skills 深度拆解——认知工序流水线](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ljg-skills-deep-dive-datastudio-2026.md) — 李继刚23 Skills认知工序流水线拆解
- [Claude Code 为什么会忽略指令：四类失效原因 + 五层规则框架](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-why-instructions-ignored-jia-gou-x-2026.md) — 指令失效四类
- [Claude Code Dynamic Workflows 实战模式与构建技巧](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-dynamic-workflows-thariq-practical-patterns.md) — 3失败6模式11用例
- [Using Claude](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-html-artifacts.md) — HTML unreasonable effectiveness主版
- [300万人在存的Claude提示词](https://github.com/QianJinGuo/wiki-public/blob/main/entities/300万人在存的claude提示词.md) — 提示词工程框架
- [Harness Engineering 系统性解读](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-systematic-explainer.md) — 李宏毅课程解读7933字最全版
- [Agent Browser 僵尸进程排查与定时清理（Claude Code + QoderWork 实战）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-browser-zombie-process-cleanup-qoderwork-2026.md) — 僵尸进程排查自愈实践
- [Claude Code /checkup 功能：清理 Skills/MCP 提升性能](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-checkup-feature-boris-cherny-2026.md) — 配置腐烂治理
- [Autoresearch: AI Agent-Driven Algorithmic Development (File Compression Experiment)](https://github.com/QianJinGuo/wiki-public/blob/main/entities/autoresearch-agent-algorithmic-development-file-compression-2026.md) — 压缩算法autoresearch实验
- [Thariq（Claude Code工程师）的Fable 5使用心法：地图≠领土，用未知消除法突破模型瓶颈](https://github.com/QianJinGuo/wiki-public/blob/main/entities/thariq-fable-5-usage-mindset-map-territory-unknown-unknowns.md) — 地图领土未知消除法

## 深度分析

### 规则数量的边际账：遵循率为何没有崩
原文用 6 周、30 个代码库、50 个任务的跟踪数据给出了一个反直觉结论：规则从 4 条加到 12 条，遵循率只从 78% 滑到 76%，几乎是无痛扩展。关键在于每条新规则都对应一个可观察的失败模式，而不是泛泛的态度要求——这正好解释了"认真思考"这类不可测试的措辞遵循率只有约 30%。但扩展存在悬崖：条数涨到 14 时遵循率从 76% 直接掉到 52%，说明行为契约的容量有硬上限，超过后规则之间开始互相干扰。换句话说，CLAUDE.md 的扩展空间不是按"想到就加"计的，而是按"还有多少未覆盖的失败模式"计的。

### 新增 8 条的靶点：从"写对代码"到"管好 agent"
Karpathy 的 4 条针对单次写代码的失败——瞎猜假设、过度复杂化、顺手改坏邻接代码、没有验证循环。到 2026 年 5 月，失败面整体迁移：agent 互相打架、hook 级联触发、skill 加载冲突、跨 session 工作流断裂。新增规则因此分布在三个层面：模型与代码的边界（规则 5 把路由、重试、状态码处理、确定性变换交回普通代码，模型只做判断类工作）、资源与状态管理（规则 6 的 4000/30000 token 硬预算、规则 10 的逐步检查点）、多源一致性（规则 7 暴露冲突而非折中平均、规则 8 先读再写、规则 11 服从既有约定、规则 12 失败要显眼）。这与本 wiki 对长程任务的诊断一致：agent 跑得越久，漂移越要靠预算与检查点这类机制性约束兜底，单靠目标驱动不够，参见 [harness 工程长程任务](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-long-term-agent-tasks.md)。

### 负面清单比正面规则更有信息量
"没有效果的做法"一节是全文最锋利的部分：重述 Karpathy 4 条的规则没有增量价值；依赖可能不存在的工具会静默失败；往 CLAUDE.md 里放例子会让模型过拟合例子而非规则；"像资深工程师"毫无作用，因为模型本来就自认为是。这些反例共同给出一条筛选标准：每条规则必须能回答"它防止哪种具体错误"，回答不了就删——按真实失败模式调过的 6 条规则，胜过 12 条用不上的规则。原文标题里的 11% 与正文的 3% 数字并不一致，但两个口径下"规则显著降低错误率"的方向一致，引用时应注明口径差异。

### 与 wiki 已有规则体系的接续
12 条模板在 wiki 内有清晰的演进链：Karpathy 4 条走红并获 12 万 star 的传播过程见 [Karpathy CLAUDE.md 134k star 现象](https://github.com/QianJinGuo/wiki-public/blob/main/entities/andrej-karpathy-claude-md-134k-stars-2026.md)，规则文本本身的迭代与勘误记录在主版及其勘误版 [CLAUDE.md 12 条规则勘误版](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-md-12-rules-mnilax-cf2019.md)，指令失效的归因框架则见下方工程实践列出的四类失效条目。本文的独特贡献不在规则本身，而在把"该写几条、什么才有资格进 CLAUDE.md"从经验之争变成了带对照组数据的工程决策。

## 实践启示

1. **把 CLAUDE.md 当行为契约，不当愿望清单**：写每条规则前先问"它防止哪种已观察到的错误"，答不上来的直接删；按项目痛点精简过的 6 条胜过通用 12 条。
2. **预算必须写成数字**：per-task 4000、per-session 30000 tokens，接近上限就总结后重启会话；"控制好篇幅"这类模糊措辞不会产生行为。
3. **给模型划清工作边界**：分类、草拟、摘要、抽取交给模型；路由、重试、状态码处理、确定性变换写成普通代码，能被状态码回答的问题不需要模型判断。
4. **冲突摊开处理，拒绝折中平均**：两种矛盾模式二选一（更近或更多测试的那个）并说明理由、标记另一方待清理，"两边都讨好"的代码是最差代码。
5. **长任务每步设检查点**：每步之后总结已完成、已验证、待办三件事，无法向自己复述的状态不要继续往下跑。
6. **守住 12 条红线**：14 条时遵循率从 76% 崩到 52%；新增规则的门槛是存在对应失败模式，而不是"觉得有用"。

---

