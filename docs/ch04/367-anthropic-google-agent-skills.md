# 从 Anthropic 到 Google：Agent Skills 正在进入\"设计模式\"阶段

## Ch04.367 从 Anthropic 到 Google：Agent Skills 正在进入\"设计模式\"阶段

> 📊 Level ⭐⭐ | 7.8KB | `entities/cong-anthropic-dao-googleagent-skills-zhengzai-jinru-sheji-moshi-jieduan.md`

# 从 Anthropic 到 Google：Agent Skills 正在进入"设计模式"阶段
架构师（JiaGouX）  我们都是架构师！
Google Cloud Tech 前些日子发布了一篇 Agent Skill 设计模式文章：《5 Agent Skill design patterns every ADK developer should know》。
文章把常见 Skill 分成 5 类：Tool Wrapper、Generator、Reviewer、Inversion、Pipeline。
现在回头看，5 个名字本身可能没有那么重要。

## 相关实体
- [从 Anthropic 到 Googleagent Skills 正在进入设计模式阶段](ch04/392-agent-skills.html)
- [Anthropic Google Agent Skills Design Patterns](ch04/484-anthropic-google-agent-skills.html)
- [Anthropic 14 Skill Patterns Best Practices](../ch01/361-anthropic-14-skill.html)
- [Anthropic 官方技能最佳实践14 个可复用的 Agent Skills 设计模式](ch04/392-agent-skills.html)
- [Anthropic Agent Skills Design Patterns 14](ch04/251-anthropic-agent.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/cong-anthropic-dao-googleagent-skills-zhengzai-jinru-sheji-moshi-jieduan.md)

## 深度分析

Google 的 5 个 Agent Skill 设计模式补上了 Skill 生态中的关键缺口：Anthropic 解决了 Skill 的格式、加载和跨产品使用问题，而 Google 补上的是 Skill 内容内部的工作流设计模式。 Skill 作为一种「过程资产」而非「提示词模板」，其内部组织结构直接决定了 Agent 能否稳定复用团队经验。格式统一之后，难点就转移到了：这个 Skill 的工作流逻辑，到底该按什么结构组织。

每个设计模式背后都对应着一种常见的 Agent 失败模式。Tool Wrapper 解决「Agent 不懂某个领域」的问题，将 API 规范、框架手册等长篇参考资料从系统提示词中分离，按需加载；Generator 解决「输出格式不稳定」的问题，通过模板和风格指南分离让每次输出可预期；Reviewer 解决「审查标准难复用」的问题，将检查清单版本化，Agent 负责应用标准而非临时发明标准；Inversion 解决「Agent 没问清需求就开始生成」的问题，通过阶段化访谈强制 Agent 在进入最终方案前收集足够约束；Pipeline 解决「复杂任务跳步骤」的问题，通过检查点确保前置条件满足后才进入下一阶段。

Skill 与 Harness 是同一件事的两面。Harness 负责运行时主循环（上下文怎么组、工具怎么调、状态怎么留、错误怎么反馈），Skill 负责把某类可复用方法带进运行时（这类 API 怎么写、这类文档怎么生成、这类代码怎么审）。Skill 是 Harness 可以按需加载的过程模块，这意味着 Skill 不是独立的提示词工程问题，而是 Agent 产品工程系统的一部分。

Skill 的治理风险值得特别关注：一次误判如果只发生在当前会话，影响有限；但如果被写进 Skill 并被 Agent 持续复用，就可能把错误经验固化为长期规则。因此需要区分信任策略——官方内置 Skill 信任度较高，团队自写 Skill 需要走 review 和测试，Agent 自动生成的 Skill 默认是草稿需要人工确认，第三方 Skill 默认不信任需要安全审查。

从更宏观的视角看，Agent 工程正在经历一个分界点：从「怎么写好一句 prompt」到「怎么设计可执行的工作流」。Skill 的出现意味着团队经验、流程、清单、模板、排障方法开始被做成模型可发现、可加载、可执行的工作单元。这不是文档形式的小变化，而是工程团队需要开始回答「哪些经验值得沉淀」「哪些规则常驻哪些按需加载」「哪些判断交给模型哪些动作交给脚本」这些传统工程问题。Skill 很小，低门槛到 Markdown 就能写；但只要进入真实工作流，就会牵出上下文、工具、权限、评估、版本和治理等一系列工程设计问题。

## 实践启示

团队准备沉淀第一个 Skill 时，建议从一个很窄的流程开始——固定服务的发布检查、某个框架的代码审查、数据口径变更评审、Incident 复盘模板、PR 合并前安全检查、客户方案生成前的信息收集。这类流程足够高频能复用，边界又足够窄方便验证。在动手写正文之前，先问清楚：这个 Skill 主要是在注入知识、生成模板、审查结果、收集需求，还是跑流程？模式选对了，内容设计才不容易走偏。

description 字段是路由契约，不是简介。触发范围太宽 Agent 会乱用，太窄又可能用不上。更清楚的写法是说明具体场景：当用户要发布 Next.js 服务到 Vercel 时、检查预览环境时、处理构建失败时、回滚部署时使用。SKILL.md 如果无限变长，很快会变成另一个系统提示词——稳定但很长的规范放 references/，固定输出模板放 assets/，确定性重复性动作尽量放 scripts/，主文件只保留路由、流程、边界和加载规则。

生产级 Skill 通常需要检查点。需求没问完不生成架构方案，API 清单没确认不生成最终文档，测试没跑过不宣称修复完成，风险项没分级不进入发布建议，破坏性操作没确认不执行。这类门控一旦写得含糊，Agent 很容易自己补完后面的步骤。能落到「禁止继续」的地方，就把禁止继续的条件写清楚。失败路径的处理同样重要——怎么识别失败，失败时先收集什么证据，哪些可以自动重试，哪些需要停下来问人，哪些动作不能为了完成任务而绕过去。

Skill 一旦进入团队工作流，就更接近代码资产而非临时文档，需要版本化和审查机制：每个 Skill 有 owner，每次修改走 review，高风险 Skill 有测试样例，关键流程有变更记录，废弃规则定期清理。第三方 Skill 默认不信任，先读再启用。此外，带脚本的 Skill 应按可执行代码对待，不按普通文档对待——只要 Agent 能调工具、读文件、改代码、发请求，Skill 就可能间接影响真实系统。

对于 Agent 工程团队来说，真正决定上限的不是模型有多强，而是把工作流、评测、上下文管理写成长期可运营工程的能力。Skill 正好是 Agentic Engineering 里最朴素的一块砖：它不是模型层的能力，而是工程层的接口。当 Skill 的格式已经有共识，难点就转到了内部设计；当接口一旦出现，后面拼的就不只是文采，而是工程设计。

---

