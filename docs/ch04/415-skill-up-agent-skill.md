# 阿里开源 skill-up：让 Agent Skill 可评测可回归

## Ch04.415 阿里开源 skill-up：让 Agent Skill 可评测可回归

> 📊 Level ⭐⭐ | 8.5KB | `entities/alibaba-skill-up-agent-skill评测回归.md`

# 阿里开源 skill-up：让 Agent Skill 可评测可回归

阿里巴巴开源 skill-up——一个专门面向 Agent Skill 开发者的命令行评测框架，目标是「让 Agent Skill 的每一次迭代都可被验证、可被回归」。过去一年 Agent Skill 迅速成为 AI 应用领域的核心基础设施，但写一个能「跑起来」的 Skill 已经不难，难的是回答：它到底好不好用？装上它之后 Agent 的行为真的符合预期吗？下次有人改了一行描述会不会悄悄退化？换一个 Agent 引擎还表现一致吗？Skill 是 prompt、文件与工具配置的组合，对模型版本、引擎实现、输入措辞高度敏感，长期缺少一种「声明一次、随时回放」的方式来固化预期。

三个大概率发生的场景暴露了同一个问题——Skill 缺少标准化的评测框架：场景一 Skill 悄悄退化但没人在评审阶段察觉（同事改了 SKILL.md 描述后 Skill 退化成纯文本回答）；场景二换个引擎行为就变了（同样的提示语输出结构完全不同，但每次都要手工触发、手工对比、手工记笔记）；场景三评测逻辑散落各处无法复用（本地一套、CI 一套，新增一条用例要同时改好几处）。skill-up 把「加载用例 → 启动 Agent → 发送输入 → 收集回复 → 判定是否通过 → 生成报告」这一整套流程稳定地串起来，并被本地开发和 CI 流水线共同复用。

## skill-up 是什么与四个核心设计

在 Skill 目录下放一份 evals/eval.yaml 和若干 evals/cases/*.yaml，用声明式方式写清楚评测在什么环境里跑、用哪个 Agent 引擎、跑哪些用例、用什么方式判定通过，然后执行 `skill-up run ./evals/eval.yaml` 逐用例执行并产出结构化报告：每条断言的通过情况与证据、汇总通过率与耗时/token 消耗、进程退出码（0 全部通过，可直接接入 CI 作为合并门禁），还能输出 JUnit XML 和可视化 HTML 报告。与其它评测工具相比，它是 framework-orchestrated 的独立 CLI（不需要 AI 会话驱动，天然适合嵌进 CI）、把断言拆成 expect+judge 两层、面向 Agent Skill 这一具体对象（安装被测 Skill、跨引擎回放、验证工具调用）。

四个核心设计：**其一，声明式评测配置**——环境、引擎、模型、用例、判定策略全部写在 YAML 里而非散落在脚本控制流中，新增一条用例往往只是新增一份几十行的 YAML。**其二，expect + judge 分层判定**——expect 是本地零成本的确定性检查（文件是否存在、输出是否包含关键词、退出码）作为门槛先跑，通过后才执行 judge（rule_based 规则匹配 / script 脚本退出码 / agent_judge 评审 Agent 语义判断），让大部分明显失败在不消耗 token 的本地阶段就被拦截，CI 不会被大模型偶发抖动无端阻断。**其三，多引擎支持**——内置 claude_code / codex / qodercli / qwen_code 适配，`--engine` 一个参数切换，同一份评测集在多个引擎上跑完取最大公约数就是这个 Skill 真正稳定的行为边界。**其四，结构化报告天生对 CI 友好**——Schema 与 Anthropic 评测产物兼容，额外提供 JUnit XML 和 HTML，对已用 Anthropic 风格 evals.json 的项目支持 import 一键迁移。

## 多轮会话评测与重型端到端评测

早期 Skill 评测大多是「一问一答」，但真实用户是一句一句地说、Agent 一步一步地做。skill-up 支持在一个用例里定义多条连续的用户消息，逐条发送并在每条回复后检查结果：真实的会话保持（每轮同一会话，Agent 记忆完整）、逐轮质量门控（post_condition 每轮回复后立即检查，不达标可早停省 token）、跨轮值传递（正则从某轮回复提取 token 自动填入后续消息）、精确到轮的最终判定（断言某轮是否调用了某个工具）。post_condition 是「过程门卫」（值不值得继续下一轮），judge 是「最终裁判」（整场对话最终算不算通过），不要在 judge 里重复 post_condition 已把关的断言。以「删除前必须确认」为例：第一轮用户要求删除时断言回复必须包含确认类词且未调用 delete_file，第二轮用户确认后才允许调用。

重型端到端评测（如「代码工程升级」类 Skill）的特征是依赖真实运行环境、输入是代码仓库而非文本、判定在产物层面（与标准答案逐行 diff）、单条用例耗时长。skill-up 用逐层收窄的判定漏斗承接：第一层 expect 只检查最便宜确定的信号；第二层证据脚本做过滤后 diff 并输出结构化 JSON（不做语义判断，只提供确定性证据）；第三层 agent_judge 结合 diff 判断差异是否合理（工程升级往往存在合理差异）。引入 agent_judge 不是把判定交给模型「凭感觉」——评审 Agent 的输入首先来自证据脚本产出的确定性材料，报告完整保留 trace、diff、judge 输入输出供人复核。评审规则接近领域手册时用「judge-agent with skill」：给评审 Agent 单独安装评测专用 Skill（judge Skill 只安装给评审 Agent 不安装给被测 Agent，保证评测语义隔离），criteria 只留一句入口说明。skill-up 不替代 CI，而是接管「评测语义和执行框架」这一层，与 CI 平台、CI 镜像、证据脚本分工明确。

## 集团内部落地：从约 1200 行手搓脚本到一份声明

skill-up 已在集团内部承接真实业务 Skill 评测。一次「重型端到端评测」迁移前完全手搓：约 623 行 Shell 脚本、近 300 行配置解析代码和上百行 CI 编排，合计约 1200 行，评测语义散落在互不相邻的目录里。迁移后通用编排逻辑删除，Skill 安装、Agent 调用、用例执行、judge 判定、报告生成全部交给框架，仓库只保留业务特有的用例清单、评测声明、证据脚本和少量报告渲染辅助。收益包括：声明式结构让「这条用例要做什么、整体怎么判」打开 YAML 就能看清；分层判定让廉价失败快速返回；跨引擎回归从「重写整套安装脚本」变成「改一个参数」；本地和 CI 共享同一份评测语义；新增用例成本变成一份约 40 行的 YAML；每次评测的 HTML 报告发布成可访问链接——「评测只有被看见才有价值，而被看见的前提是路径足够短」。这位同学起初判断「这个场景太重了，skill-up 应该承接不了」，迁移完成后这个判断被推翻了。

上手路径有两条：路径 A 用随仓库开源的 skill-upper Agent Skill 自动生成评测集——读取 SKILL.md 和相关脚本、推断适合怎么评测，说一句「评测当前 Skill」即生成 eval.yaml 和 cases/*.yaml 并调用 skill-up 跑一遍；路径 B 纯 CLI 上手（curl 安装脚本 + `skill-up run`）。skill-up 的定位一句话概括：用简单易懂的声明式配置，固化我们对 Agent Skill 的预期，让代码评审和 CI 流水线都能有效验证它，把 Skill 的质量从「靠肉眼和记忆维护」变成「可声明、可回放、可回归」。

## 相关实体

- [阿里 SkillUp 评测框架](ch04/366-alibaba-skill-up-agent-skill.html)
- [阿里 SkillUp Agent Skill 评测](ch04/366-alibaba-skill-up-agent-skill.html)
- [Agent 评测基准](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmarks.md)
- [评测 Harness 设计](https://github.com/QianJinGuo/wiki/blob/main/concepts/evaluation-harness-design.md)
- [Agent Harness Skill 系统实践](../ch05/066-agent-harness.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/阿里开源-skill-up让-agent-skill-可评测可回归.md)

---

