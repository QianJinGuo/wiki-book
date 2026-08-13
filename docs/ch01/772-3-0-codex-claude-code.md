# 扣子 3.0 离谱更新：把 Codex、Claude Code 拉进一个项目工作？

## Ch01.772 扣子 3.0 离谱更新：把 Codex、Claude Code 拉进一个项目工作？

> 📊 Level ⭐⭐ | 8.1KB | `entities/coze-3-0-local-agent-codex-claude-code-project.md`

# 扣子 3.0 离谱更新：把 Codex、Claude Code 拉进一个项目工作？

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/coze-3-0-local-agent-codex-claude-code-project.md)

## 摘要

扣子（Coze）3.0 引入了 coze-bridge 本地 Agent 接入机制，把云端 Agent 与本地运行的 Claude Code、Codex CLI 拉进同一个项目协同。花叔实测 6 个 Agent 在同一项目里接力完成"调研 → 写稿 → 改平台 → 做 PPT"的完整流水线，还演示了手机 App 远程操控家里电脑的跨设备场景。

文章对比了扣子 3.0 与 Dynamic Workflows（Opus 4.8）两条多 Agent 路线，主张"带一支各有专长、@一下就接力上的小队"比等待万能 AI 更务实，并坦承本地 Agent 延迟与高权限安全仍是短板。

## 核心要点

- 新建 Agent 有三条路：职业模板（自媒体运营达人、调研分析师等）、常驻云 Agent、接入本地 Agent（Claude Code、Codex CLI 等）
- coze-bridge 三步接入：生成连接命令 → 本地执行 → 自动识别；本地 Agent 是高权限入口（可读写文件、执行命令），89 元/月套餐最多接 3 个
- 实测项目"AI4S 研究"拉入 6 个 Agent（阿链、调研分析师、小虾、cc、codex、自媒体运营达人），全程 @ 点名接力、上下文一直留在项目里，一次没切窗口、没手动复制粘贴
- 完整流水线四件事：调研 @codex 整理研究包 → 写稿 @阿链（挂自动化写作技能：搜最新信息、学风格规范、翻历史文章、抛选题、自审几轮）→ 改平台 @自媒体运营达人（小红书文案、封面、公众号标题等技能架）→ 做 PPT @codex（10 页 16:9、gpt-image-2 批量配图不耗 API 额度、自动转 PDF 检查）
- 行业技能包按行业打包（自媒体、金融、法律、科研），可一键整体加给任意 Agent
- 远程操控场景：手机 App 对绑定的 codex 下模糊指令"帮我把电脑里今天新修订的合同发给我"，Agent 跨网伸进家里 Mac 翻本地文件，网络从 WebSocket 退到 HTTPS 时延迟升高但事办成了
- 尚未完善：本地 Agent 延迟、高权限带来的安全顾虑

## 深度分析

### coze-bridge：云编排与本地执行之间的桥

coze-bridge 是扣子 3.0 这次更新的机制核心：在用户本地跑一个小服务，充当云端扣子与本地 CLI Agent 之间的桥。连接流程刻意设计成"生成连接命令 → 本地执行 → 自动识别"三步，把认证与握手成本压到最低。这个设计的实质是"云编排 + 本地执行"的拼合：云侧负责任务编排、技能挂载与上下文沉淀，本地侧贡献文件系统、shell 与既有工具链的真实权限。文章特别警告本地 Agent 是高权限入口，多人协作时需防范越权滥用；89 元/月套餐最多 3 个本地 Agent 的额度也说明该能力目前是面向个人与小团队的有限供给。

### 六 Agent 接力流水线：项目即共享上下文

"AI4S 研究"项目的演示说明多 Agent 协作的关键不在于模型数量，而在于共享的项目级上下文。6 个 Agent（模板 Agent、挂自动化写作技能的阿链、本地 codex）在同一项目内被 @ 点名接力：研究包、写作风格规范、历史文章、选题方案、初稿与自审结论全部沉淀在项目上下文里，一次没切窗口。对照 [多模型协作交接](ch01/1219-claude.html) 那类"人肉搬运上下文"的模式，coze-bridge 把交接损耗从"人当 API"降为"项目即共享记忆"，与 [Harness 工程](../ch05/065-harness-engineering.html) 的工作现场沉淀方向一致。另一个细节是 codex 做 PPT 时内置 image-gen 调用 gpt-image-2 批量生成配图且不消耗用户 API 额度——本地 Agent 的既有工具能力被云侧任务直接复用，是桥接机制的隐性收益。

### 远程操控：Agent 走出浏览器与办公桌

手机遥控家里电脑的演示把 Agent 的使用场景从"人坐在电脑前"扩展为"活留在电脑、人走到哪都够得着"。用户刻意给出模糊指令（"今天新修订的合同"，不指名文件与文件夹），考验 Agent 的意图理解与本地文件检索能力——它真的跨网伸进了家里那台 Mac 翻本地文件。值得记录的工程细节是网络路径从 WebSocket 退化到 HTTPS 后延迟明显上升：云端到本地 Agent 的实时通道在移动网络下并不稳定，需要协议降级兜底，延迟与可靠性正是文章"尚未完善"清单里本地 Agent 延迟问题的具体体现。

### 两条多 Agent 路线的编排哲学之争

文章把 Dynamic Workflows（Opus 4.8）与扣子 3.0 放在一起对比：前者用脚本编排上百个子 Agent，追求快和规模；后者强调"人 + 云 Agent + 本地 Agent 同一项目"，像带小团队一样 @ 点名接力。分歧的本质是编排哲学——中心化脚本调度，还是人机混合的自组织协作。作者倾向后者："与其干等一个什么都会的万能 AI，不如现在就带一支各有专长、@一下就接力上的小队。"这与 [多智能体协作循环](../ch05/006-loop-engineering.html)、[本地编码 Agent](../ch09/174-using-local-coding-agents.html) 等方向共享同一个判断：单模型能力不再是瓶颈，分工、交接与组织方式才是决定产出的变量。

## 实践启示

1. **把"接入本地 Agent"当作能力边界的分水岭**：云端 Agent 擅长编排与内容生产，本地 Agent 才有文件系统与 shell 高权限；接入前先盘点哪些任务必须落在本地。
2. **用项目上下文代替人肉交接**：让多个 Agent 共享同一项目上下文、以 @ 点名接力，避免人充当"API"在模型间反复搬运状态；上下文连续性比 Agent 数量更关键。
3. **用行业技能包而非从头调教**：按行业（自媒体、金融、法律、科研）整体挂技能包，比逐个手写 prompt 更快获得领域化行为。
4. **远程场景先设计网络降级预案**：WebSocket 不稳时自动退到 HTTPS 并接受更高延迟，同时为长耗时任务设计异步确认机制。
5. **高权限本地 Agent 必须纳入安全边界**：限制可访问目录、敏感文件与命令白名单；多人协作时明确谁能绑定新的本地 Agent。
6. **以"一条完整流水线接力跑通"为验收标准**：看多 Agent 配置能否不切窗口地跑完调研 → 写稿 → 改稿 → 出 PPT，而非单点能力演示。

## 相关实体

- [本地编码 Agent 的使用实践](../ch09/174-using-local-coding-agents.html)
- [Claude 做方案，Codex 写代码：多模型协作交接](ch01/1219-claude.html)
- [AI 军团式多智能体协作循环](../ch05/006-loop-engineering.html)
- [Strands 多智能体框架](../ch04/779-strands-agents.html)
- [OpenClaw 多智能体团队搭建](../ch11/253-openclaw.html)
- [Claude Code 源码核心机制](../ch03/084-claude-code.html)
- [Harness 工程](../ch05/065-harness-engineering.html)
- [Claude Code 大型代码库团队部署](../ch05/042-agent-harness.html)
- [Karpathy × Boris：Software 3.0 编程地图](ch01/1135-llm.html)
- [MOC：工作流编排](https://github.com/QianJinGuo/wiki/blob/main/moc/workflow-orchestration.md)

---

