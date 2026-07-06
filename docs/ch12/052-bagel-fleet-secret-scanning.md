# bagel — Fleet 级 Secret Scanning 守护开发工作站

## Ch12.052 bagel — Fleet 级 Secret Scanning 守护开发工作站

> 📊 Level ⭐⭐ | 8.5KB | `entities/bagel-fleet-secret-scanning-dev-workstation-2026.md`

# bagel — Fleet 级 Secret Scanning 守护开发工作站

> **Background**: RecycleBin.zip 2026-05-25 长文，介绍其开源的 `bagel` 工具如何把 secret scanning 从 CI 边界检查升级为开发机 file system daemon 级实时防护，并针对 2026 年新出现的 AI 编程助手 IDE plugin 风险做专门覆盖。

## 核心定位

**为什么 dev workstation 才是 secrets 真正泄漏面：**
- 公开泄漏案例 70%+ 起源于开发者本地：`~/.aws/credentials` 被 IDE 插件读取、`git add .` 误提交、`.env` 备份到云盘
- 现有 CI gate + pre-commit hook 的盲区：仅在 commit/push 时拦截，无法阻止「本地调试时把 token 贴进 `curl`」「AI 编程助手读取工作目录后泄露给 LLM API」「编辑器 plugin 写入 telemetry 文件夹」等 runtime 行为
- 真正的「Defense in depth」需要在 **file system layer** 持续监听，而不是只在 git 边界

## bagel 工具架构

`bagel` 是 RecycleBin.zip 开源的 Rust 实现（github.com/RecycleBinzi/bagel）：

- **Daemon 模式**：`bagel watch ~/code` 启动后监听整个文件树，新文件/修改/重命名触发 re-scan
- **Pre-commit 模式**：`bagel scan --staged` 在 git 提交前扫描 staged 文件
- **Detector plugins**：内置 14 个 provider（AWS、GCP、GitHub、OpenAI、Slack、Stripe 等），每条规则用 `regex + entropy + provider-context` 三段式判定，降低误报
- **输出格式**：JSON / SARIF / plain text，可直接对接 GitHub Code Scanning、GitLab Code Quality、自建 dashboard

## Fleet 级部署

- 通过 `fleet.yaml` 描述组织拓扑（team → repo → developer-machine-tag），`bagel fleet apply` 推送到所有开发机
- MDM（Jamf / Intune）配合：开发机开机自动安装 daemon、开机自启
- 集中 dashboard：每个 developer 看自己的 findings，组织看聚合视图（哪些 team 泄漏最多、哪类 secret 出现频率上升）
- 误报反馈闭环：developer 标记 false-positive → rule 调优 → 自动 re-scan

## 集成 GitHub Actions + SARIF

```yaml
- name: Bagel scan
  run: |
    bagel scan --staged --format sarif > bagel.sarif
- uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: bagel.sarif
```

- SARIF → Code Scanning Dashboard 自动出 PR check、security tab 可见
- 增量扫描：相比全量扫描，daemon 模式内存占用 < 50MB，CPU 闲时 < 1%

## 与 AI 编程助手的交互风险

- 2026 年起新发现：Cursor / Continue / Claude Code 等 IDE plugin 会读取工作区文件 → 上传到 LLM provider
- 如果 `~/.aws/credentials` 在工作区路径下，**会被 LLM 看到**（即使没主动询问）
- bagel 的 daemon 模式正好覆盖这个场景：实时监听新文件，AI plugin 一旦尝试读取 secret 文件，立即 block + alert
- 与传统 secret scanning 互补：CI gate 防 commit，daemon 防 runtime access

## 实战数据 + 部署建议

- RecycleBin.zip 自家 400 人 engineering org 部署 6 个月：捕获 17 起真实泄漏事件
  - 10 起在 commit 前（pre-commit hook 触发）
  - 6 起在 editor plugin（daemon 触发）
  - 1 起在 AI 编程助手（daemon 触发，cursor 读取了 .env）
- 误报率从首月 38% 降至第三月 11%（rule 调优效果）
- 部署成本：每 100 dev machines 约 2-3 台 SRE 兼职维护，工具本身 MIT 开源免费

## 与现有 secret scanning 工具对比

| 工具 | 部署位置 | 实时性 | AI 编程风险覆盖 | License |
|------|----------|--------|----------------|---------|
| gitleaks | CI / pre-commit | 仅边界 | ❌ | MIT |
| trufflehog | CI / pre-commit | 仅边界 | ❌ | AGPL |
| detect-secrets | CI / pre-commit | 仅边界 | ❌ | Apache 2.0 |
| **bagel** | **File system daemon + CI** | **实时** | **✅** | **MIT** |

## 三个独有贡献

1. **File system daemon 范式** — 把 secret scanning 从"git 边界检查"扩展为"file system 持续守护"，对 runtime 行为（editor plugin、AI assistant）有原生保护
2. **Fleet 级组织部署** — `fleet.yaml` + MDM 推送到所有 dev machine，集中 dashboard + 误报反馈闭环，覆盖传统单点工具盲区
3. **AI 编程助手风险覆盖** — 业界首次明确覆盖"IDE plugin 读取 .env → 上传 LLM"这条新攻击路径，实战捕获 1 起真实事件

## 深度分析

1. **从边界防御到持续守护的范式转移**：传统 secret scanning 工具（Gitleaks、TruffleHog）把防线设在 git commit/push 边界，本质上是"犯错后再拦截"。bagel 的 file system daemon 模式把防线延伸到 runtime——只要文件出现在磁盘上，无论来自 curl 粘贴、IDE 插件写入还是 AI 助手读取，都在监听范围内。这不是简单的"多层防御"，而是防御重心的转移：从依赖人的自觉性转向依赖系统的持续感知。

2. **Dev workstation 才是 secrets 的真正泄漏面**：70%+ 的 secrets 公开泄漏事件起源于开发者本地，而非外部攻击者直接入侵。根源在于：开发过程天然产生大量临时 token 和调试凭证，且开发者 workstation 的访问控制远弱于生产环境。bagel 的 daemon 部署在每台开发机上，正是针对这个被传统方案忽视的泄漏源头发力。

3. **AI 编程助手重新定义了"访问"的含义**：传统安全模型假设未经授权的读取是可检测的，但 AI 编程助手在后台静默读取工作目录文件并上传到 LLM 提供商——开发者完全不知情。bagel 的 daemon 实时监听文件访问行为，第一次在 OS 层面覆盖了"AI 助手静默读取 → secret 外泄"这条路径，填补了传统方案的全盲区。

4. **Fleet 级部署的核心价值在于组织拓扑映射**：`fleet.yaml` 将 team → repo → developer-machine-tag 的层级关系纳入扫描策略，使得安全策略可以按组织结构差异化部署，而不是一刀切的全局配置。配合 MDM 实现开机自启和集中 dashboard，形成一套可运营的闭环系统，这是传统单点 secret scanning 工具无法提供的组织级价值。

5. **工具开源不等于低成本运营**：bagel 本身 MIT 许可、Rust 实现、内存占用 <50MB，部署门槛看似很低。但 RecycleBin.zip 数据显示误报率从首月 38% 降至第三月 11%——这条曲线背后的 rule 调优工作才是真实成本。Fleet 级 secret scanning 的持续运营，本质上是一个以规则维护为核心的安全运营问题，而非单纯的工具部署问题。

## 实践启示

- 在 2026 年将"file system daemon"模式纳入 secret scanning 工具链，与 CI gate 形成互补，覆盖 runtime 阶段的所有泄漏场景
- AI 编程助手（Cursor / Continue / Claude Code 等）在企业内部推广时，必须同步制定 IDE plugin 文件访问策略，限制其在包含敏感配置的工作目录中的活动权限
- 评估 bagel 或类似 fleet 级工具时，重点关注组织的规则维护能力和误报反馈闭环机制，而非仅看工具功能本身；每 100 台开发机的持续运营需要 2-3 名 SRE 兼职投入
- 借助 MDM（Jamf / Intune）和 `fleet.yaml` 实现 daemon 全量推送，确保开机自启和扫描策略与组织拓扑同步更新，是 fleet 级secret scanning 落地的关键步骤
- 配合 [Agent Security Attack Defense](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-security-attack-defense.md) 中定义的"防御层级"框架，将 secret scanning 从单点 CI 检查升级为 OS 层持续监控，是 DevSecOps 在 2026 年的重要进化方向

## 关联主题

- [Bedrock Agentcore Secrets Manager Identity](ch03/045-agent.md) — AWS Bedrock AgentCore 的 secret 管理视角（云端 secret 而非本地泄漏）
- [Trail Of Bits Skill Scanner Bypass Distribution](ch04/258-skill.md) — Trail of Bits 的 Skill scanner 工具，AI 编程安全的另一个维度
- [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/recyclebin-zip-secret-scanning-fleet-bagel-2026.md)

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/security-privacy-landscape.md)

---

