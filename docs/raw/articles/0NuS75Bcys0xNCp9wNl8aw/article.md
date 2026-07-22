# 从「不敢发」到「天天发」：AI Agent 时代的 CI/CD 生存指南

> 吕超 · 阿里技术 · 2026年7月7日 18:08 · 浙江

> a1 CLI — 数十万行 Go、数百个命令、上百个真实 API 冒烟用例、十余条 CI 流水线的生产级 CLI 工具，日均活跃数万用户。核心挑战：如何 **harness AI 的随机性**。

---

## 背景：a1 CLI

统一研发命令行工具，覆盖仓库管理、合并请求、CI/CD 流水线、应用发布、需求缺陷等研发全链路。AI Agent 深度参与代码生成、测试生成、工作项分析。三个多月上百个正式版本，最近 30 天几乎每个工作日发布一个版本。

---

## 第一道防线：代码准入

**分层 + 快速反馈 + 逃生舱** 三位一体。

| 层 | 门禁 | 类型 |
|----|------|------|
| 1 | 单元测试 + E2E 覆盖率 ≥75% | 硬阻断 |
| 2 | 全量冒烟测试（真实 API，命名隔离） | 硬阻断 |
| 3 | 文档同步检查 + 测试清单一致性检查 | 硬阻断 |
| 4 | 命令下线规范检查（4 项规范：废弃入口/测试/文档/smoke） | 硬阻断 |

**逃生舱机制**：MR 标题含 `[skip-pages-check]` 等标记可跳过特定门禁。机器守规矩，人保留最终决策权。

---

## AI 生成的动态冒烟测试 — 驯服随机性的核心战场

AI Agent 提交的代码变更涉及新增命令或 flag，已有测试覆盖不到。**让 AI 自己写测试来验证 AI 的代码变更**，形成「AI 自检」闭环。

### 核心流程
```
build-cli ─────┐
                ├→ prepare-bundle → llm-generate-spec → run → collect-summary
build-dynsmoke ─┘                       │
                  detect-denylist-change → denylist-manual-review（两段式人工卡点）
```

1. **影响面分析**：`git diff` 自动识别受影响命令，提取 `--help` 文本和 surface diff
2. **LLM 生成测试 spec**：命令上下文注入 prompt，LLM 生成符合 JSON schema 的测试用例
3. **执行与命名隔离**：跑真实 API，`DYNSMOKE_RUN_ID`（pipeline 实例 ID）确保资源全局唯一
4. **Stop hook 自愈**：`stop-validate-spec.sh` 校验输出格式，不合规则拒绝要求 LLM 重生成（最多 3 次，防止无限死循环）

### 约束 AI 随机性的五把锁

1. **Schema 约束**：`dyn_spec_schema.md` 定义严格 JSON 结构
2. **Prompt 工程**：完整命令上下文内联到 prompt，不给自由发挥空间
3. **Deny-list 机制**：`denied_commands.go` 维护不可测命令前缀（管理类/日志类命令），prepare 和 run 双重剔除
4. **Deny-list 两段式人工卡点**：检测 diff 改动 deny-list → 自动激活人工审核；未命中则跳过。异常时 fail-safe（输出 `changed=true`）
5. **唯一 ID 隔离**：每次运行的测试资源名称全局唯一

---

## CI 历史反馈闭环 — 让 AI 从失败中学习

AI Agent 无状态，重跑会犯完全相同错误。**人为赋予 AI「短期记忆」**。

**狗食（Dogfooding）模式**：a1 CLI 在自己的 CI 流水线里调用自己查询 CI 运行记录。
```bash
a1 ci run list --branch "$branch" --per-page 10 \
  --pipeline "$PIPELINE_ID" --repo "$REPO" -f json
```

**双重过滤**：按 Pipeline ID + Commit SHA 精准定位失败日志。单 step 日志截 16KB 防 prompt 超长。

**Soft-skip**：CI 历史获取失败绝不阻塞流水线 → `|| true`，LLM 看到 "CI history unavailable" 后 best-effort 继续。

---

## 发布准入

```
smoke → beta-release(5%灰度) → manual-review → analyze-beta-telemetry
  → telemetry-review(条件触发) → auto-release-tag → deploy-pages
```

### Beta Telemetry 分析（4 维度）
- 整体失败率
- Top 失败命令
- CI vs 非 CI 失败率对比
- 错误类型分布

**Fail-safe**：telemetry 查询失败 → `has_anomaly=true` — 查不到数据 = 无法证明安全。

### 版本一致性保障
beta 构建时记录 commit SHA + 版本号 + 发布时刻为 artifact，下游 auto-release-tag 读取 artifact SHA 打 tag，非当前 HEAD。避免中间有 commit 注入。

---

## 约束 AI 随机性七策略

| 策略 | 作用阶段 | 具体实现 |
|------|----------|----------|
| 约束 | AI 生成 | Schema + Prompt + Deny-list |
| 缩小 | AI 生成 | 影响面分析 → 精准生成 |
| 反馈 | AI 生成 | CI 历史注入短期记忆 |
| 隔离 | 执行 | 唯一 ID + 命名隔离 |
| 数据验证 | 发布 | Beta telemetry 真实数据 |
| 分层验证 | 发布 | 多层门禁 |
| 逃生舱 | 全程 | Skip 标记不阻塞 |

> **核心思想**：不要试图让 AI 100% 正确，而是要构建一个「即使 AI 犯错也不会造成灾难」的系统。

---

## 展望

1. AI 自主决策（异常则自动回滚 / 灰色地带升级给人）
2. 全量覆盖率（连带影响推测 + 测试用例复利效应）
3. 长期记忆（跨 pipeline 跨时间的高频失败模式库）
4. 数据反哺（线上 telemetry 驱动测试优先级）

---

*原文来自微信公众号：阿里技术 · 已按知识库入库标准存档*
