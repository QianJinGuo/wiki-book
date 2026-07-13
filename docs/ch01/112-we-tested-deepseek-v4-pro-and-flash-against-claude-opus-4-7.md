# We Tested DeepSeek V4 Pro and Flash Against Claude Opus 4.7

## Ch01.112 We Tested DeepSeek V4 Pro and Flash Against Claude Opus 4.7

> 📊 Level ⭐ | 5.2KB | `entities/wetesteddeepseekv4proandflashagainstclau.md`

## 核心要点
- AI/ML 技术文章
- 技术分析和方法论
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/wetesteddeepseekv4proandflashagainstclau.md)

## 相关实体
> [主题导航](https://github.com/QianJinGuo/wiki/blob/main/moc/cybersecurity-privacy.md)

- [We Tested DeepSeek V4 Pro and Flash Against Claude Opus 4.7 and Kimi K2.6](ch01/439-deepseek.html)
- [We Tested DeepSeek V4 Pro and Flash Against Claude Opus 4.7 and Kimi K2.6](ch01/679-deepseek-v4.html)
- We Tested DeepSeek V4 Pro and Flash Against Claude

## 深度分析
### 1. 复杂工作流测试揭示模型间真实差距
FlowGraph spec 包含 20 个端点、持久状态、租约管理、重试和事件流，是一个比常规编程基准更重的基础设施测试。Claude Opus 4.7 在此类测试中得 91 分，DeepSeek V4 Pro 得 77 分，Kimi K2.6 得 68 分，DeepSeek V4 Flash 得 60 分。表面代码覆盖率的差距在缩小，但涉及时间、恢复或移动部件协调的硬代码路径中的正确性差距依然存在 。

### 2. 租约过期处理是所有模型的共同弱点
DeepSeek V4 Pro 和 Flash 都存在相同的过期租约完成 bug：worker 在其租约过期后仍可标记 step 为成功完成。这与 Claude Opus 4.7 的多过期租约 bug 以及 Kimi K2.6 缺失实时事件流的问题形成呼应。恢复逻辑在竞争条件下始终是此 spec 中最难一次做对的部分 。

### 3. 端点路由挂载错误是 DeepSeek V4 Flash 的致命伤
DeepSeek V4 Flash 将 `/workflows/key/:key/runs` 端点实际挂载在 `/runs/key/:key/runs`，导致客户端请求正确路径时返回 404。其测试套件直接调用内部函数而非通过 HTTP API，因此测试通过但实际使用失败——这是低成本模型常见的"测试覆盖与实际可用性脱节"的典型案例 。

### 4. Flash 级别的工具调用可靠性超出预期
$0.02 的成本下，DeepSeek V4 Flash 在 Kilo CLI 中的工具调用表现稳健：编辑前读取文件、在合理时机安装依赖和运行测试套件、没有因错误命令陷入重试循环。即使代码有缺陷，agent 循环本身运行干净——这打破了"便宜模型工具调用最先崩溃"的惯例认知 。

### 5. 成本效益比开创了新的测试维度
DeepSeek V4 Flash 每分成本比 Kimi K2.6 便宜约 30 倍，比 Opus 4.7 便宜约 100 倍。60/100 的分数本身不值得用于复杂后端构建，但 $0.02 一次尝试的价格改变了一切：同一任务尝试三四次比较的成本仍低于一次 Kimi K2.6 运行 。

## 实践启示
### 1. 在 AI 编程评估中纳入代码正确性深层检查
团队不应仅依赖测试套件通过率评估 AI 生成的代码。DeepSeek V4 Pro 的 npm test 通过但 npm run build 失败——必须将构建成功、端点可达性、HTTP API 实际响应等指标纳入评估体系，才能发现表面覆盖下隐藏的缺陷 。

### 2. 对工作流系统中的租约/过期逻辑必须进行专项测试
租约过期后的处理是几乎所有模型都会出错的领域。在评估用于构建工作流编排系统的 AI 模型时，应设计专门的测试用例：验证 worker 崩溃后租约是否正确释放、过期租约的 step 是否真正被阻止完成、并发竞争条件下的调度是否正确 。

### 3. 利用低成本模型进行快速原型探索
DeepSeek V4 Flash 的 $0.02 成本使其适合用于：需求验证阶段的多方案快速尝试、技术可行性探索时的大量小任务并行探索。在最终方案确定后，再使用更高质量的模型进行精化。关键是将 AI 输出定位为"受控的一次性尝试"而非最终可用代码 。

### 4. 为 Flash 级别模型建立差异化的代码审查清单
DeepSeek V4 Flash 的典型缺陷集中在：HTTP 路由挂载错误、验证逻辑过于严格（拒绝合法输入）、状态机恢复逻辑中的边界条件。审查其输出时应重点检查：端点路由是否与 spec 一致、输入验证是否允许 spec 范围内的所有 JSON 类型、失败恢复时是否存在孤立的 step 状态 。

### 5. 结合促销价格评估模型的真实成本效益
DeepSeek 75% 折扣将 V4 Pro 的成本从 $2.25 降至约 $0.55，低于 Kimi K2.6 的同时分数高出 9 分。评估 AI 模型成本时，应关注实际促销价格而非列表价格，尤其对于有明确截止日期的促销活动，应计算折扣期内的最优使用窗口 。

---

