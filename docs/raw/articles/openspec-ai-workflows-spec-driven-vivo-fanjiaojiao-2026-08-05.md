---
source_url: https://mp.weixin.qq.com/s/k_7Z-pr2-XTS22dt0rsIDg
source: wechat
title: "从混乱到秩序：我如何搭建一套「规范驱动」的 AI 协作开发体系"
ingested: 2026-08-05
type: raw-article
tags: [openspec, spec-driven-development, ai-workflows, skills, hooks, ai-coding, vivo]
sha256: fc94e9eded2f60ae61bc55cda569ad0da20a32d376986e5f9470f0e6104378d8
---

# 从混乱到秩序：我如何搭建一套「规范驱动」的 AI 协作开发体系

> 作者：vivo IT 技术团队 - Fan Jiaojiao（vivo互联网技术 公众号，2026-08-05 投喂）
> 存量项目增量开发场景：自建「OpenSpec 规范层 + AI Workflows 执行层」体系，通过「规范 + 技能 + 钩子」机制对 AI 的理解、执行和校验进行系统化约束。

## 核心痛点

存量项目增量开发中 AI 的常见困境：
- AI 不了解已有架构（20+ 业务模块、封装好的 API 层、统一错误处理机制 AI 看不到）
- AI 重复造轮子（已有统一弹窗组件，AI 又单独写一套）
- AI 不知道业务上下文（串码商品逐台校验 IMEI vs 非串码直接选数量，处理逻辑混了）
- AI 修改破坏已有功能（新功能影响已有优惠互斥逻辑）
- 国际化词条混乱（重复词条、命名不规范）

关键洞察：**像培养团队成员一样培养 AI**——项目文档（了解业务）+ 开发规范（知道怎么写）+ Code Review（保证质量）+ 经验传承（避免踩坑）。

## 为什么是规范驱动而非 Prompt 驱动

| 方式 | 优点 | 缺点 |
|------|------|------|
| 长 Prompt | 简单直接 | 上下文窗口有限、难以维护、无法按需加载 |
| RAG 知识库 | 按需检索 | 被动触发、缺少流程编排、无法保证执行顺序 |
| AI Workflows | 按需加载+流程编排+自动检查 | 需要前期投入搭建 |

对话式开发 vs 规范驱动开发：对话式=每次会话从零开始、上下文靠口述；规范驱动=把项目知识编码成 AI 能理解的数据结构，按需加载，一次写好永久生效——"口头交代 vs 书面文档"。

## 系统架构（关注点分离）

```
ai-workflows/
├── workflows/    # 工作流定义（feature-development/bug-fix/hotfix/refactor）
├── skills/       # 技能库（33 技能 4 大分类）
│   ├── project/   # 项目级（8）：vue3-component/vue3-store/api-service/i18n/style
│   ├── business/  # 业务级（19）：retail-ordering/home-page...
│   ├── workflow/  # 工作流技能（4）：cross-module...
│   └── quality/   # 质量保障（2）：code-review/regression-test
├── hooks/        # 钩子系统（17 钩子）：before-message(6)/after-message(3)/after-edit(3)/skill-loaded(2)
├── templates/    # 模板库（vue/api/store/i18n）
└── schemas/      # 数据模式定义
```

核心思路：**OpenSpec 管"输入"（需求结构化），AI Workflows 管"执行"（能力组合化）**。两层解耦后更换实现方式不影响规范层，不同项目共享 project 技能、各自补充 business 技能。

## OpenSpec：变更管理系统（规范层）

每个功能开发/Bug 修复是一个 "Change"，三层文档：
- **proposal.md**：WHY/WHAT（面向产品+AI）——业务背景、目标、验收标准
- **design.md**：HOW（面向开发+AI）——架构、API、组件、数据流
- **tasks.md**：DO（面向 AI）——任务拆解、优先级、具体步骤

三层设计哲学：渐进式细化（宏观到微观每层独立审查）、关注点分离（产品只看 proposal，开发只确认 design）、AI 友好（tasks.md 直接告诉 AI"现在做第几个任务"）。

## AI Workflows：执行层

| 组件 | 作用 | 类比 |
|------|------|------|
| Workflows | 编排执行步骤 | 导航路线 |
| Skills | 封装领域经验 | 专家工具箱 |
| Hooks | 关键节点自动检查 | 质量安全网 |
| Templates | 标准化代码/文档格式 | 脚手架 |
| Schemas | 定义数据结构和验证规则 | 数据字典 |

### Skills 技能系统
技能结构：SKILL.md = 适用场景（关键词识别）+ 工作流程 + 不适用场景 + 关键检查清单。

四分类：project（8，通用技术能力）、business（19，业务领域知识）、workflow（4，多模块协调）、quality（2，代码质量保障）。

### Hooks 钩子系统（被动触发的质量守卫）
| Hook 类型 | 触发时机 | 典型用途 |
|-----------|---------|---------|
| before_message | 收到用户消息前 | 加载上下文、推荐工作流 |
| skill_loaded | 技能加载后 | 初始化技能上下文 |
| after_edit | 编辑文件后 | 代码格式化、lint 检查 |
| after_message | 消息处理后 | 日志记录、状态更新 |

关键钩子：ensure-user-review（阻止 AI 在规范文档未审查前写代码）、recommend-workflow（按意图推荐工作流）、auto-format-code（编辑后自动格式化）。

## 协同流程（信息流动闭环）

用户输入 → Hooks 触发推荐 → Workflows 编排步骤 → Skills 提供执行能力 → Templates 保证输出格式 → Hooks 再检查结果 = "输入→编排→执行→输出→验证"闭环。

- Hooks 管"什么时候用什么"
- Workflows 管"先做什么后做什么"
- Skills 管"具体怎么做"
- Templates 管"做成什么样"

## 完整实战案例：vivo+ 积分券

零售下单确认页加 vivo+ 积分券（会员验证后可选多倍积分券关联商品）。难点：10+ 文件修改、与整单优惠组件/会员体系衔接、串码/非串码商品分支、与官网优惠互斥。

### 规范阶段
- AI 加载 retail-ordering 业务技能后第一轮就找到 WholeDiscount.vue、ProductInfo.vue 等关键文件，生成 proposal/design/tasks（15 个拆解任务）
- **API 中途变更**：后端改成一个接口传 skuCodeList 数组，AI 自动更新 design.md 后只改三处（API 函数签名/调用方/类型定义）——design.md 把影响范围写清楚了
- **国际化零重复词条**：AI 按 i18n 技能先扫 zhLang.ts 确认无词条后才新增，命名跟项目规范

### 实现阶段
- **架构对齐**：vue3-component 技能规则"实现组件前先检查项目中类似组件怎么写"——AI 读 OfficialWebsite.vue 后主动把逻辑收敛到 VivoPlusCoupon.vue 自包含组件，WholeDiscount.vue 只留一行调用
- **串码/非串码分支**：retail-ordering 技能记录 ImeiControlFlagEnum 枚举，AI 分支判断一开始就写对
- **设计稿还原**：MCP 工具直接读取 Figma 设计数据（精确数值而非截图估测），样式一次写对

### 效果对比
| 维度 | 没有体系 | 有体系 |
|------|---------|--------|
| 上下文 | 每换会话重新解释项目结构 | 技能一次加载即知页面/Store/枚举位置 |
| 国际化 | 重复词条/命名不规范 | i18n 技能强制"先检查再创建"，零重复词条 |
| 组件复用 | AI 自己发明弹窗写法 | 技能引导复用 useFullscreenDialog |
| API 变更 | 漏改调用方 | AI 更新 design.md 只改三处 |
| 代码质量 | 提交前人工 lint | Hook 编辑后自动检查拦截低级错误 |

### 关键数字
- 12 项功能验收标准全部通过，tasks.md 拆解 15 个任务
- 10+ 文件修改（组件/Store/API/国际化/类型定义）
- **0 个重复词条**
- retail-ordering 沉淀 13 个核心子技能

## 经验沉淀与持续优化

### 技能诞生：一次事故→一条规则→一个技能
国际化事故（AI 硬编码"请输入手机号"+ 新建重复词条 PLEASE_INPUT_PHONE）→ 写 i18n SKILL.md 四条规则（先检查 zhLang.ts→已有复用→没有按规范新增→getLanguage() 引用）→ 从此永久生效。**最好的技能不是设计出来的，是事故逼出来的。**

### 技能迭代：vue3-component 三次迭代
1. 初版：分析需求/定位文件/生成代码
2. 发现问题（调按钮颜色竟创建新包装组件）→ 加「不适用场景」节（纯样式→project/style）
3. 发现问题（组件漏国际化）→ 加强制检查清单（$t()/fullscreen-dialog/TS 类型无 any）

规律：**AI 每犯一次拦不住的错，就往技能里加一条**。技能从指南变成防错清单。控制 100-150 行，超过拆分。

### Hook 拦截案例
- ensure-user-review 阻止 AI 在未确认时创建 proposal.md 和修改代码（省至少 30 分钟审查回滚）
- auto-format-code 自动修复缩进/未使用 import/命名风格，Code Review 不被格式问题打回

### 协作模式转变：从"纠正"到"确认"
- 纠正模式：描述需求→AI 生成→发现 3 个问题→纠正→新问题→再纠正（我的角色=纠错者，80% 精力找错误）
- 确认模式：描述需求→AI 加载技能→生成 proposal→审查确认→按任务实现→Hook 自动检查（我的角色=决策者，20% 审方向 80% 想业务）

## 从零搭建：两周实践指南

1. **最小可行搭建**（第一天）：创建目录结构 + 编写第一个 project 技能（选最易出错环节，如国际化）+ 配置 ensure-user-review Hook + 编写 AGENT.md
2. **运行第一个完整功能**（第一周）：选真实但不紧急的功能，严格走完 proposal→design→tasks→审查→实现，记录"如果 AI 知道就好了"时刻→转 business 技能
3. **从能用→好用**（第二周）：技能查漏补缺（至少组件/API/国际化/Store 四技能覆盖完整）+ 增加 after-edit Hook + 沉淀踩坑经验 + 编写团队 README
4. **持续打磨**：每功能至少沉淀一个经验；技能 100-150 行控制；删除过时内容（过时知识比没有知识更危险）

## 实际效果

- AI 理解准确率从 ~60% 提升到 ~90%（减少返工）
- 知识复用跨功能、跨会话持续生效
- Hook 自动检查减少低级错误
- 新人读技能文档即可理解项目规范

## 与 RAG 的区别

RAG 是被动检索（回答"这个知识在哪"），AI Workflows 是主动编排（回答"现在应该做什么"），两者互补。

## 关联
- 与 [[entities/openspec-spec-driven-development-trae-solo|OpenSpec SDD 框架]] 的关系：本文覆盖规范层（proposal/design/tasks 三层）并补充了执行层（AI Workflows 五组件）
- 与 [[entities/ai-native-organization-methodology-ye-xiaochai-sdd-2026|叶小钗 AI 原生组织方法论]] 互补：叶小钗讲组织方法论，本文讲个人搭建规范驱动体系的落地细节
- Hooks 机制与 [[entities/graph-engineering-loop-to-graph-tencent|Graph Engineering]] 的"Loops watching loops"理念同构：都是外部监督机制防 AI 跑偏
