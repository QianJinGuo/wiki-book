# Netflix Nebula ArchRules: 跨越数千个 Java 仓库的 ArchUnit 规模化实践

## Ch11.090 Netflix Nebula ArchRules: 跨越数千个 Java 仓库的 ArchUnit 规模化实践

> 📊 Level ⭐⭐ | 10.2KB | `entities/netflix-nebula-archrules.md`

# Netflix Nebula ArchRules: 跨越数千个 Java 仓库的 ArchUnit 规模化实践

> 原文存档：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/scaling-archunit-with-nebula-archrules.md)

> **Core insight**: Netflix 通过 Nebula ArchRules 插件将单仓库 ArchUnit 规则扩展为跨 polyrepo 的可共享、可版本化规则库——利用 Gradle Module Metadata 的 variant 选择机制，实现"bundled rule libraries"自动检测和执行，无需每个仓库单独配置。

## 为什么选择 ArchUnit

Netflix 采用 polyrepo 策略，拥有数万个 Java 仓库。JVM Ecosystem 团队构建 Nebula Gradle 插件套件，为这些仓库提供构建逻辑共享、标准构建方式和 artifact 发布能力。但在一次与 library backwards-incompatible change 相关的 incident 后，团队需要更好的 API lifecycle 管理工具。

ArchUnit 是流行的 OSS 库（3.5k stars, 84 contributors），用于在 JUnit suite 中强制执行"架构"代码规则。它使用 ASM（而非 AST）分析实际编译后的 bytecode，这意味着无论代码如何产生，都分析的是实际将运行的代码。这带来了三个 distinctive features：1) Works cross-language (JVM)，不依赖特定语言语法；2) 暴露 builder API 模式，写规则容易；3) 也有 lower-level API 用于编写更复杂的自定义规则。

相比 AST 工具（如 PMD），ArchUnit 分析 bytecode 而非源代码，因此代码无论用何种语言产生都能分析，且 syntactic sugar 不会隐藏应找到的代码。相比自定义规则编写，ArchUnit 提供 type-safe Java code 和 fluent API，有 IDE  guidance，可直接 unit test——而 PMD 的 XPath 规则是原始字符串，没有 IDE 支持。

## ArchRules 架构：规则库插件 + 运行插件

**ArchRules Library Plugin** 添加额外的 `archRules` source set 到 Gradle 项目。在其中可以创建实现 `ArchRulesService` 接口的类，该接口有单一抽象方法返回 `Map<String, ArchRule>`。规则和依赖不会打包到主代码，而是打包成带有 `arch-rules` classifier 的独立 Jar，发布时作为带有 `arch-rules` usage 属性的独立 variant。

**ArchRules Runner Plugin** 允许规则在代码上被评估。对于 bundled rule libraries，runner plugin 会自动检测这些规则并仅在使用该 library 作为依赖的 source sets 中运行。通过 Gradle Module Metadata 下游项目可自动发现和消费这些规则。runner plugin 为每个 source set 创建单独配置，将 `archRules` classpath 与 `runtimeClasspath` 组合，选择 `arch-rules` variant，然后用 ServiceLoader 发现规则定义。

两种规则库 flavor：**Standalone Rule Libraries** 不包含主代码，只有 archRules，用于定义针对代码的规则（如 Core Java APIs 或 OSS 库）或通用规则（如"不要使用标记为 @Deprecated 的代码"）；**Bundled Rule Libraries** 同时包含主代码和 archRules，推荐使用这种方式，因为 runner 能自动检测并只在使用该 library 的 source sets 中运行规则。

## 案例：API Lifecycle 注解追踪

解决原始问题——library 作者如何知道下游项目是否错误使用了他们的 API——团队用 ArchRules 构建了追踪平台。Library 作者编写 ArchRules 来检测注解使用情况，范围限定在他们 library 的 package 内。例如检测"package 外不应使用 deprecated API"的规则：任何 residing outside of the library's package 的类都不应依赖 deprecated 类，或访问 deprecated target。

Netflix 内部 Nebula standard Gradle wrapper 和 plugin suite 在每个项目的 main-branch CI build 上自动启用 ArchRules runner，并向内部 Developer Portal 发送自定义 reporter。这样 library 作者可以轻松看到所有下游消费者使用其 experimental、deprecated 或非 public API 的报告，知道哪些项目会受到影响。

## 规模与效果

Netflix 正在 5000+ 仓库上运行 358 条（还在增加）规则，检测近百万问题。其中约 1000 个是"High" priority 规则（会导致 build 失败）。这使得团队能够快速洞察大型 microservices fleet，识别承载最关键技术债务的区域，从而更容易集中和优先安排工作。

ArchUnit 提供非常具体和详细的失败信息，是自动修复工具的良好输入信号。Netflix 正在探索将确定性解决方案（如 OpenRewrite）和非确定性解决方案（如 LLM）与 ArchRules 结合。配对简单的规则编写和确定性结果的 ArchUnit 与能正确解释结果以解决手头问题的自动修复工具，将是非常强大的组合。

## 关键数据/实践启示

- **ASM/bytecode 而非 AST 分析**：ArchUnit 分析实际运行代码，无视语言差异和 syntactic sugar，这对 polyglot JVM 环境至关重要
- **Gradle Module Metadata variant 选择**：通过 `arch-rules` usage 属性实现规则的独立 variant 发布和下游自动消费，无需 N+1 配置
- **Bundled Rule Libraries 自动检测**：Runner plugin 自动发现 bundled 规则并仅在使用该 library 的 source sets 中运行，实现"规则跟随 library"的精细化执行
- **ServiceLoader 自动发现**：Library plugin 自动生成 service loader registration entry，runner 通过 ServiceLoader 发现规则，无需手动注册
- **5000+ 仓库 / 358 条规则 / 近百万问题检测**：规则规模化后使技术债务可见、可量化、可优先处理
- **自动修复的未来方向**：ArchUnit 的详细失败信息 + OpenRewrite/LLM 自动修复是下一个前沿

## 深度分析

### 1. ArchRules：架构决策的代码化执行
Netflix Nebula ArchRules 将架构约束从"文档规范"转化为"可执行规则"——系统自动检测架构违规（如服务间非法依赖、循环引用、API 版本不兼容），而非依赖人工审查。这与"infrastructure as code"的理念一致：架构规则也应是代码，可版本化、可测试、可自动执行。

### 2. 架构治理的规模化需求
Netflix 数百个微服务的架构治理不可能靠人工——ArchRules 解决的是"规模×变化率"的组合问题：服务多、变化快、依赖复杂，人工审查既慢又不可靠。自动化的架构治理是微服务规模化的必要条件。

### 3. 与 `Netflix Real Time Service Topology` 的互补
ArchRules 定义"架构应该怎样"，Service Topology 展示"架构实际怎样"——两者结合形成完整的架构治理闭环：规则定义→实时检测→违规告警→修复验证。

### 4. 误报率是架构规则系统的关键挑战
过于严格的规则会产生大量误报，团队会学会忽略告警；过于宽松则漏过真正的违规。ArchRules 需要持续调校规则敏感度。

### 5. 架构规则的可移植性
Netflix 的 ArchRules 是针对自身微服务生态设计的，但规则模式（依赖方向、API 兼容性、资源使用限制）是通用的——其他组织可以借鉴模式但需要定制具体规则。

## 实践启示

### 1. 微服务 >50 个时：引入自动化架构治理
当微服务数量超过 50 个时，人工架构审查不再可行。引入 ArchRules 类的系统自动检测违规。

### 2. 从最关键的 3-5 条规则开始
不要试图一次性定义完整的架构规则集。从最关键的可执行约束开始（如"服务 A 不能直接调用服务 B 的数据库"）。

### 3. 将架构规则纳入 CI 流水线
架构规则检测应集成到 CI 中——每次提交都验证架构约束，而非事后审查。

### 4. 定期审查规则的误报率
每季度审查告警数据：哪些规则产生最多误报？是否需要调整阈值？规则是否仍反映当前架构决策？

### 5. 结合实时拓扑图形成治理闭环
架构规则 + 实时服务拓扑 = 完整治理：规则定义预期，拓扑展示现实，差异驱动行动。

## 相关实体
- [Netflix Metadata Service Model Lifecycle Graph](https://github.com/QianJinGuo/wiki/blob/main/entities/netflix-metadata-service-model-lifecycle-graph.md)
- [Netflix Live Operations Human Infrastructure](https://github.com/QianJinGuo/wiki/blob/main/entities/netflix-live-operations-human-infrastructure.md)
- [Netflix Switchboard Lightbulb Model Routing](https://github.com/QianJinGuo/wiki/blob/main/entities/netflix-switchboard-lightbulb-model-routing.md)
- [Netflix Druid Interval Aware Caching](https://github.com/QianJinGuo/wiki/blob/main/entities/netflix-druid-interval-aware-caching.md)
- [High Throughput Graph Abstraction At Netflix](ch11/103-high-throughput-graph-abstraction-at-netflix-part-i.html)

## 相关引用

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/scaling-archunit-with-nebula-archrules.md)

---

