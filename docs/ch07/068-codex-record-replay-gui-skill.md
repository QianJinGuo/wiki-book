# Codex Record & Replay：GUI 演示到可复用 Skill 的工作流捕获

## Ch07.068 Codex Record & Replay：GUI 演示到可复用 Skill 的工作流捕获

> 📊 Level ⭐⭐ | 3.1KB | `entities/codex-record-replay-skill-generation-vibecoder.md`

# Codex Record & Replay：GUI 演示到可复用 Skill 的工作流捕获

OpenAI 为 Codex 上线 Record & Replay 功能：在 macOS 上演示一次 GUI workflow，Codex 把它编译成可复用的 Skill。不是屏幕录制，而是 **workflow capture**——具体操作被抽象为结构化步骤、可变输入和验收条件。

## 技术链路：录制 → 转译 → 回放

**录制阶段**依赖 Computer Use（需要 macOS Screen Recording + Accessibility 权限）。Codex 观察完成流程所需的动作和窗口内容。

**转译阶段**是核心抽象：停止录制后，Codex 生成 Skill 草稿，把具体操作拆成稳定步骤、可变输入、隐藏偏好和验收方式。例如创建 issue 时，Skill 沉淀的是标题格式、默认 label、描述模板，而不是第几个按钮被点到。

**回放阶段**，Codex 读取 Skill 并调用当前环境可用工具（Computer Use、browser actions、已安装插件）完成任务。准确说法：record once, compile to Skill, then execute with tools。

## 生态定位

Record & Replay 在 Codex 生态中的位置：

| 层级 | 组件 | 职责 |
|------|------|------|
| 项目规则 | AGENTS.md | 长期约束和约定 |
| 可复用流程 | **Skill** | 触发条件 + 输入 + 步骤 + 验证 |
| 团队分发 | Plugin | 打包和共享 |
| 外部系统 | MCP / connector | 结构化接 API |

Record & Replay 是 **Skill 生成器**——降低 Skill 创作门槛，把散落在个人手里的操作经验变成可维护资产。

与 [Agent Skill 写作指南](ch04/245-skill.md) 的关系：传统 Skill 写作要求人手动定义触发条件、输入拆分、步骤表达、失败处理；Record & Replay 提供了"先演示再生成草稿"的替代路径。

## 适用场景与边界

**适合**：低风险高频流程（报表下载、内容发布前置检查、内部系统记录创建）。流程重复、步骤稳定、输入可参数化。

**不适合**：涉及密钥/支付/隐私的流程；结果无法验证的操作；有 API/MCP 却录 GUI 的场景（短期快，长期维护成本高）。UI 变化会导致回放稳定性下降。

## 局限

- 仅 macOS，排除欧洲经济区/英国/瑞士
- 依赖 Computer Use 权限和安全边界
- 官方未公开底层事件 schema（坐标 vs 控件树 vs OCR）
- `[features].computer_use = false` 会同时禁用 Record & Replay

---

