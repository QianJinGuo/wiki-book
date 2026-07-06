# Agent Skill 进阶模式与治理

## Ch01.407 Agent Skill 进阶模式与治理

> 📊 Level ⭐⭐ | 11.6KB | `entities/agent-skill-writing-advanced.md`

## 五种进阶模式（Anthropic 官方实践经验）
### 模式一：顺序工作流编排
适用：需要严格按顺序执行的多步流程。
明确步骤依赖关系、在每步加验证、提供失败时的回滚指令。

### 模式二：跨 MCP 协调
适用：工作流跨越多个外部服务。
例如：Figma 导出（Drive MCP）→ 项目文件夹创建（Drive MCP）→ 开发任务创建（Linear MCP）→ 交付摘要发布（Slack MCP）

### 模式三：迭代优化循环
适用：需要多轮优化才能达到质量标准的输出。
初稿生成 → 质量检查（`scripts/check_report.py`）→ 逐项修复 → 再次验证 → 重复直到通过质量标准 → 最终输出

### 模式四：上下文感知的工具选择
适用：同一个目标，根据文件类型或场景选择不同工具。
决策树示例：大文件（>10MB）→ 云存储 MCP；协作文档 → Notion/Google Docs MCP；代码文件 → GitHub MCP

### 模式五：领域专业知识内嵌
适用：需要将复杂的合规规则、行业知识内嵌到工作流中。
例如支付合规流程：处理前（合规检查）→ 合规通过则执行支付处理，否则标记待人工审核 → 生成审计报告

## 安装与团队治理
### 三种安装方式
**方式 A：命令行安装（推荐）**
```bash
npx skills add <skill-name>
```
**方式 B：手动放置文件**
直接复制 Skill 文件夹到 `~/.qoder/skills/`（用户级）或 `<项目根>/.qoder/skills/`（项目级）。
**方式 C：Qoder Quest 模式内置生成**

### 两级安装策略
| 级别 | 路径 | 适用场景 |
|------|------|---------|
| 用户级（全局） | `~/.qoder/skills/` | 个人偏好、跨项目通用 |
| 项目级 | `<项目根>/.qoder/skills/` | 团队规范、项目特定流程（推荐提交 Git） |

### Git 协作最佳实践
```bash
git add .qoder/skills/
git commit -m "feat: add api-standard skill v1.0"
git push  # 团队成员 git pull 后立即生效
```

## YAML Frontmatter 完整规范
### 禁止事项
- ❌ 禁止在 description 中使用 XML 尖括号 `< >`
- ❌ 禁止 name 中含 `claude` 或 `anthropic`（保留词）
- ❌ 禁止 name 有空格或大写（必须 kebab-case）

### Description 三个黄金原则
1. **同时说明"做什么"和"什么时候用"** — 不能只说"帮助处理项目"，要说明触发条件
2. **包含用户实际会说的话（触发词）** — 用户不会说专业术语，要预测自然语言
3. **控制长度不超过 1024 字符** — Frontmatter 会被加载到系统提示词，过长占上下文

### 完整可选字段
```yaml
metadata:
  author: 团队名
  version: 1.0.0
  mcp-server: github
  category: development
  tags: [api, documentation, testing]
  documentation: https://your-docs-url.com
  support: support@company.com
```

## 实战调试案例：从需求到可用 Skill
*来源：[如何把经验装到Skills](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/how-to-encode-experience-into-skills.md)*

### 调试背景
SaaS 产品经理每周评估 1-10 家客户定制需求工作量，认真做完后真正付费的客户可能不到 5%。

### 三轮调试过程
**第一轮：Skill 干太多事 → 基准飘移**

- 一个 Skill 同时输出解决方案 + 用户故事 + 流程图 + 工作量评估
- 结果：15 人天经验判断 → Skill 给出 30-59 人天
- 根因：方案设计（偏发散）和工作量评估（偏收敛）不应混在同一 Skill
**第二轮：只给约束，不给方法 → 教条执行**

- 把比例约束写死（测试是后端 1/3-1/2、前端是后端 1/2）
- 结果：15 人天 → 44 人天，数字规整但完全不对
- 根因：AI 执行约束很听话，但不理解背后的判断框架
**第三轮：给经验，更给判断逻辑 → 可用**

- 四条关键原则：
  1. **需求是 1，方案是 1**：需求未搞清楚前不评工作量；方案未定时不给时数
  2. **明确拆解路径**：需求→场景→模块→功能→原子任务，链路闭环
  3. **五步法**：按顺序逐层展开，不按角色拍脑袋
  4. **给参考系，不给铁律**：比例是参考系而非硬规则

### 判断 Skill 可用的两条标准
1. **颗粒度合适**：不能粗到只剩总人天，也不能细到全是不懂的技术项
2. **结果符合经验**：经验判断 10 人天 → 上下 20% 波动可接受

### 核心洞见
> Skills 不是替你"发明"工作经验，而是帮你把已有经验稳定地复用出来。Skill 的价值 = 你讲清楚多少判断标准和方法论，而非给出多长的提示词。
→

## 相关实体
- [Agent Skill 高质量编写规范](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-skill-writing-practices.md)

- [Agent Skill 评估与迭代](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-skill-writing-evaluation.md)
- [SkillSieve — Agent Skill 安全检测三层框架（arXiv 2604.06550）](https://github.com/QianJinGuo/wiki/blob/main/entities/skillsieve-agent-skill-security.md)

## 深度分析
### 渐进式披露是五种进阶模式的底层架构
Anthropic 官方提出的五种进阶模式并非独立技巧，而是同一底层机制在不同复杂度场景下的展开。这个底层机制即**渐进式披露（Progressive Disclosure）**：YAML Frontmatter 承担"目录"角色，SKILL.md 正文承担"书籍"角色，scripts/references/assets 承担"附录"角色。
五种模式可以统一在这个框架下理解：
| 模式 | 复杂度层级 | 披露重点 |
|------|-----------|---------|
| 顺序工作流编排 | 单层正文 | 步骤编号 + 验证点前置 |
| 跨 MCP 协调 | 正文 + scripts | 工具调用序列脚本化 |
| 迭代优化循环 | 正文 + references | 质量检查脚本 + 阈值标准 |
| 上下文感知工具选择 | 正文 + references | 决策树或条件分支逻辑 |
| 领域专业知识内嵌 | 正文 + references + scripts | 合规规则库 + 脚本判断 |

### 调试案例揭示的 Skill 本质
三轮调试过程清晰地展示了 Skill 编写的核心矛盾：**规则与判断框架的区别**。
第一轮失败原因是**职责混杂**——方案设计（发散思维）与工作量评估（收敛思维）处于同一认知模式，却硬塞进同一 Skill。Skill 的粒度必须对齐**认知模式的边界**，而非任务边界的表面划分。
第二轮失败原因是**把经验压缩成规则而丢失判断框架**。比例约束（测试是后端 1/3-1/2）是经验的外在表现形式，真正的判断框架是：先理解需求复杂度，再理解方案结构，最后才轮到比例参考系。AI 执行约束极精确，但不理解约束背后的前提条件。
这揭示了一个关键原理：**Skill 的价值与你讲清楚多少判断标准和方法论正相关，而非与你给出多长的提示词正相关。** 最有效的 Skill 不是告诉 AI"怎么做"，而是告诉它"在什么前提下用什么方法判断"。

### 团队治理与 Skill 生命周期的内在联系
两级安装策略（用户级 vs 项目级）不只是路径区别，而是**版本治理模型的区别**。项目级 Skill 天然适合 Git 协作，因为它的生命周期与项目代码同步，有明确的 commit 历史和回滚能力。用户级 Skill 更接近个人配置，缺乏团队可见性。
这个设计选择影响深远：需要跨团队共享的 Skill 应当强制项目级安装并提交 Git；个人偏好的 Skill 留在用户级，不进入协作流程。

## 实践启示
### 设计进阶 Skill 的四条原则
1. **先定义判断框架，再给执行规则**：在给出比例、阈值等数值约束前，先说明这些数值在什么前提下适用。不先定义前提的规则只会产生"教条执行"——AI 精确执行了错误的东西。
2. **认知模式一致性**：同一 Skill 内所有步骤应处于相同或相近的认知模式（都是收敛、或都是发散），避免在 SKILL.md 中混合"方案设计"与"评估判断"两种不同认知类型的任务。
3. **脚本替代语言描述**：对于确定性操作（如格式检查、兼容性验证、数值计算），优先用脚本而非自然语言描述。代码的确定性消除语言歧义，AI 执行脚本不会出现解读偏差。
4. **触发描述即产品需求文档**：Description 的三个黄金原则（做什么 + 什么时候用 + 触发词）本质上是在给 Skill 写产品需求文档。要假设用户不会主动查阅 Skill 文档，Description 必须在用户说出自然语言时就完成匹配。

### 避免三种典型失败模式
| 失败模式 | 症状 | 根因 | 修复方向 |
|---------|------|------|---------|
| 职责混杂 | 一个 Skill 输出多类型结果，基准飘移 | 不同认知模式混在同 Skill | 拆分 Skill，边界对齐认知模式 |
| 规则堆砌 | 给了很多约束但结果教条 | 只有规则没有判断框架 | 补全前提条件链和适用边界说明 |
| 触发漂移 | 该用时不用，不该用时乱用 | Description 缺乏触发词或负向说明 | 补充用户自然语言触发词 + NOT USE 说明 |

### 团队推广的最小可行路径
参照十二步最小闭环实践路径，团队引入进阶 Skill 建议走**安装 → 测试 → 定制 → 提交 Git** 四步：
```

# 安装一个已有 Skill 验证流程可行性
npx skills add <skill-name>  # 选择项目级安装

# 测试触发准确性（不少于 10 个正向 + 5 个负向用例）
# 定制触发词使其匹配团队用语
# 修改 description，加入团队实际场景的触发词
# 提交 Git，队友 git pull 后即生效，无需额外操作
git add .qoder/skills/<skill-name>/
git commit -m "feat: adopt <skill-name> for <team-context>"
```

---

