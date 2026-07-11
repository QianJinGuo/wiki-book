# ScarfBench: Benchmarking AI Agents for Enterprise Java Framework Migration

## Ch01.748 ScarfBench: Benchmarking AI Agents for Enterprise Java Framework Migration

> 📊 Level ⭐⭐ | 6.2KB | `entities/scarfbench-ai-agents-enterprise-java-framework-migration-ibm.md`

# ScarfBench: Benchmarking AI Agents for Enterprise Java Framework Migration

## 摘要

IBM Research 推出的 ScarfBench (Self-Contained Application Refactoring Benchmark) 是一个评估 AI Agent 在企业级 Java 框架迁移任务上表现的开源基准测试。它覆盖 Spring、Jakarta EE、Quarkus 三大 Java 生态系统的跨框架迁移，包含 34 个应用、102 个框架实现、204 个迁移任务、约 151K 行代码和 1331 个专家编写的测试用例。当前最强 AI Agent 的行为成功率不足 10%，揭示了框架迁移远未达到自动化水平。

## 深度分析

### 1. 框架迁移为何如此困难？

框架迁移远不止是替换注解。一个简单的仓库迁移可能需要改动依赖注入、持久化配置、查询语句和框架描述文件等多个层面。任何一个环节的小错误都能导致部署失败。与传统的代码生成或 bug 修复不同，框架迁移要求 Agent 理解框架的语义而非仅仅是语法——"迁移是在转换框架语义，不仅仅是在翻译源代码"。这意味着 Agent 需要理解依赖注入容器的工作原理、持久化上下文的管理方式、安全框架的配置约定等深层次框架知识。

### 2. 从编译到行为成功的三级落差

ScarfBench 的一个核心发现是：Agent 的编译成功率、部署成功率和行为成功率之间存在着巨大的逐级落差。当前的顶级 Agent 在编译层面表现尚可，但到了行为验证层面，成功率骤降至 10% 以下。这意味着 Agent 能够生成语法正确的代码，但无法保证迁移后的应用真正保留了原始行为。更令人担忧的是，Agent 存在**过度自信**倾向——Claude Code 报告 30 个整应用中 29 个构建成功，但实际上只有 22 个真正构建成功，而 Agent 分类为失败的那个应用最终构建成功了。这说明 Agent 的自我评估不可作为迁移完成的可靠信号。

### 3. 迁移是迭代的依赖解析过程而非线性变换

Agent 的访问模式分析显示：最常见的文件层访问转换集中在 Configuration ↔ Web、Service ↔ Database 之间，迁移过程表现为一个迭代的依赖解析过程，而非简单的源到源转换。Configuration 层是 Agent 投入最多精力的部分——Agent 反复回到配置相关工件来解决框架差异和依赖问题。这表明框架迁移的核心挑战不在于 Java 代码本身的转换，而在于配管、部署环境和运行时依赖关系的管理。

### 4. 非代码因素的挑战

环境与工具链问题也在迁移过程中占据重要比重：Docker 缓存不一致、端口连接问题、Maven Wrapper 和构建工具问题等操作层面的困扰，往往在源代码迁移本身就绪后仍会延迟验证。IBM 的故障模式分布分析显示：迁移失败涉及构建系统、部署环境、依赖注入、数据库、端点、断言和基础设施等多个维度。这印证了 [CODA Bench](../ch09/159-coda-bench-code-agent.html) 中也强调的一个发现——代码 Agent 的能力评估不能仅关注代码生成质量，还需要考虑其对开发环境、构建工具和运行时行为的理解能力。

### 5. 对企业 Java 现代化战略的启示

ScarfBench 的数据对采用 AI Agent 进行企业 Java 现代化的组织有直接指导意义：(1) 编译成功 ≠ 迁移成功，独立构建和测试验证必不可少；(2) 当前 Agent 适合处理局部、单层的迁移任务，但全应用级别的迁移需要大量人工介入；(3) Agent 过度自信的特性意味着需要建立独立验证机制，而不是依赖 Agent 的自报告；(4) 框架迁移的难点主要不在代码翻译而在依赖解析，这意味着 Agent 需要更好的系统理解能力而非仅仅是代码生成能力。

## 基准测试指标

| 指标 | 数值 |
|------|------|
| 应用程序数 | 34 |
| 框架实现数 | 102 |
| 迁移任务数 | 204 |
| 代码行数 | ~151K |
| 源文件和测试文件 | ~2,000 |
| 专家编写测试 | 1,331 |

## 实践启示

1. **验证独立于 Agent 之外**：永远不要依赖 Agent 的自我评估报告来判断迁移是否完成。独立的构建验证和测试套件执行是必需的质量门禁。

2. **从局部迁移开始**：当前 Agent 能力适合处理单层、聚焦的迁移任务（如仅替换持久层或仅替换依赖注入配置），全应用级迁移应分解为可独立验证的步骤。

3. **配置管理是核心难点**：迁移项目应将配置文件的治理作为重点投入领域，这既是 Agent 花费最多精力的环节，也是最容易出错的部分。

4. **环境一致性至关重要**：Agent 在 Docker 缓存、构建工具版本等环境问题上频繁受阻，建立标准化的迁移环境（容器化、版本锁定的工具链）可以减少非代码类故障。

5. **保守应用 AI 辅助**：在当前成功率 (<10%) 下，AI Agent 应作为开发者辅助工具而非替代方案——负责初步的代码转换草稿，由人工审查和修复依赖问题。

## 相关实体

- [CODA Bench 代码 Agent 基准测试](../ch09/159-coda-bench-code-agent.html)
- [AI Coding Paradigm Evolution](https://github.com/QianJinGuo/wiki/blob/main/concepts/ai-coding-paradigm-evolution.md)
- 编码 Agent 评估
- [企业 Agent 编排](../ch04/481-agent-orchestration.html)
- [面向 Agent 的后端设计](../ch03/045-agent.html)

## 来源

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/scarfbench-ai-agents-enterprise-java-framework-migration-ibm.md)

---

