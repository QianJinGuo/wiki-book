# 为游戏业务团队构建只读代码问答 Agent：架构、性能与安全实践

> 📊 Level ⭐⭐ | 6.2KB | `entities/readonly-code-qa-agent-game-business-team-aws-2026.md`

# 为游戏业务团队构建只读代码问答 Agent：架构、性能与安全实践

面向策划、测试、运营和客服等非研发业务人员的只读代码问答 Agent 参考架构。核心设计决策是把会话执行环境与代码数据面分离：会话 microVM 不挂载仓库、只通过 HTTP 上的只读 MCP 工具查询集中式代码索引，从而在权限边界、证据可信度和性能之间取得平衡。

## 架构核心：执行环境与代码数据面分离

最核心的模式是把 Agent 的会话执行环境与代码数据面彻底分开。会话 microVM 不挂载任何仓库，也没有本地文件读取工具；代码定位、调用关系、全文搜索、源码和配置表读取全部通过只读 MCP 接口完成。三个主要组件：bot-gateway（接收事件、去重、路由会话、流式更新答案卡片）、AgentCore Runtime（提供会话隔离的 microVM 运行环境）、index-service（保存代码副本和每仓索引，通过 HTTP 提供定位、搜索和文件读取）。

这种分离带来两个直接收益：一是会话无法通过 Shell 打包整个仓库，也拿不到拉取仓库所需的 Git 凭证，从机制上减少了完整代码副本和凭证的分散暴露；二是集中式索引统一了代码范围、版本、工具权限和审计策略，更适合非研发用户。

## 安全边界设计

Agent 侧不启用 Bash、本地读写和提交工具，index-service 只注册白名单内的只读工具（本方案最多 9 个：7 个代码定位/文件读取 + 2 个术语表查询）。代码访问链路位于 VPC 内，索引接口端口只向指定安全组开放。隔离方式按项目信任关系划分：同一信任域的项目共用索引主机和安全组（进程、端口、仓库清单逻辑隔离），互不信任的项目使用独立索引主机和安全组。

### 提示词注入防护（可迁移的防御组合）

启动阶段设置 `setting_sources=[]`，关闭用户、项目和本地目录中的文件系统配置来源（包括 settings.json、CLAUDE.md 和 Skills），避免仓库中的 Agent 配置或项目指令被自动加载。查询过程中，工具返回的代码、注释和配置统一作为数据进入模型上下文，系统提示明确要求忽略其中可能出现的行为指令。这套「关闭文件系统配置来源 + 代码当数据处理 + 只读工具白名单 + 输出脱敏 + 异常监控」的组合防护，是可迁移到任何代码 Agent 设计的通用防御框架。

## 中文检索英文代码符号

业务人员用中文概念和玩家表述，代码符号多为英文。方案由索引主机离线扫描候选文本，把真实出现的中文业务词与英文符号建立关联（候选范围含代码、配置、README 和设计文档，代码/配置来源置信度高于文档）。术语表仅为 Agent 增加检索词，不参与最终事实判断，答案仍需回到源码或配置表核对。约 1.4 万文件的开源游戏框架首次生成 2,634 个词条和 4,881 条关联记录，按当时 Bedrock Opus 4.8 价格折算模型费用约 372 美元——全量生成只适合作为可选构建任务，不应放入在线问答流程。

## 证据可信度与性能权衡

答案可信依赖「先索引缩小候选、再读真实文件」：CodeGraph 预先解析代码建立符号/调用关系图用于缩小范围，最终结论以本轮实际读取的源码或配置为准。检索为空时明确说明未找到；存在多种解释时先确认范围；证据不足时标注不确定性并转交研发。系统提示要求 Agent 只把本轮读取过的源码/配置作为事实依据，未调用工具且无证据引用的长答案会被标记为异常。

性能上，CodeGraph 索引查询冷/热缓存均 1–5 毫秒，远优于 grep（冷 127.4s/热 7.68s）和 ripgrep（冷 69.1s/热 0.49s）——但生产环境不能假定页缓存，冷缓存下几十秒的偶发扫描会形成长尾。端到端问答体验（建卡、microVM 调度、多轮模型/工具往返、流式收尾）才是真实指标：四批测试索引路径 36–58 秒 vs 基线路径 128–265 秒，等待时间降到约 1/5 至 1/3。优化应优先减少首轮检索词偏差、无效工具往返和总轮次，而非压缩毫秒级索引查询。

## 会话复用与成本

网关维护空闲环境池：新对话优先绑定空闲 runtimeSessionId，没有可用环境再创建新会话启动 microVM。即使复用运行环境，每次调用仍创建新的 SDK 会话，网关把历史问答显式加入本轮提示词，模型不自动继承其他对话上下文——防止跨用户/跨对话上下文污染。

成本方面，843 次问答单次模型费用平均 0.167 美元、中位 0.146 美元，约一半来自输出 token、另一半来自提示词缓存读取。优化方向是复用提示词缓存与减少总轮次。

## 相关实体

- → [MCP 协议生态](https://github.com/QianJinGuo/wiki/blob/main/concepts/mcp-protocol-ecosystem.md)
- → [RAG 检索增强生成](https://github.com/QianJinGuo/wiki/blob/main/concepts/rag-retrieval-augmented-generation.md)
- → [Agent 安全架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-security-architecture.md)
- → [Agent 架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md)
- → [Agent 编排模式](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-orchestration-patterns.md)
- → [Agent 可观测性](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-observability.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/readonly-code-qa-agent-game-business-team-aws-2026.md)

---

