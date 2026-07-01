# Scaling ArchUnit with Nebula ArchRules

## Ch11.248 Scaling ArchUnit with Nebula ArchRules

> 📊 Level ⭐⭐⭐ | 8.0KB | `entities/scaling-archunit-with-nebula-archrules.md`

# Scaling ArchUnit with Nebula ArchRules

> **来源**: Netflix Tech Blog · John Burns, Emily Yuan · 2026-05-08

## 摘要

Netflix JVM Ecosystem 团队通过 Nebula ArchRules 插件，将 ArchUnit 架构规则从单仓库 JUnit 测试扩展到跨 5,000+ 仓库的规模化治理。核心创新：规则库与业务代码解耦、通过 ServiceLoader 自动发现、Gradle Module Metadata 实现变体发布。当前已在生产环境运行 358 条规则，检测近 100 万个问题。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/scaling-archunit-with-nebula-archrules.md)

## 核心要点

1. **Polyrepo 规模化挑战**：Netflix 拥有数万个 Java 仓库，需要跨仓库共享构建逻辑和架构规则
2. **ArchUnit 优于 AST 工具**：基于字节码（ASM）而非源码 AST，跨 JVM 语言通用；fluent API 易于编写自定义规则
3. **Bundled Rule Libraries**：规则与库代码打包发布——下游项目引入依赖时自动获得该库的架构规则
4. **自动化规则执行**：Nebula 标准 Gradle wrapper 自动在每个项目启用 ArchRules runner，结果上报内部开发者门户
5. **生产规模验证**：358 条规则 × 5,000+ 仓库 ≈ 近 100 万个问题（约 1,000 个高优先级）

## 深度分析

### 背景：Polyrepo 的治理困境

Netflix 采用 [polyrepo 策略](https://netflixtechblog.com/towards-true-continuous-integration-distributed-repositories-and-dependencies-2a2e3108c051)，拥有数万个 Java 仓库。JVM Ecosystem 团队的使命是：
- 提供标准构建方式（Nebula Gradle 插件）
- 保持依赖更新
- 可靠发布 artifacts
- 在开发者偏离「铺好的路」(paved road) 或代码存在技术债时提供构建时反馈

触发事件：一个库发布了向后不兼容的变更导致线上事故。问题不在于库作者鲁莽——被删除的代码已 deprecated 多年，但作者无法知道下游还有哪些项目在使用。这暴露了 API 生命周期管理的系统性缺陷。

### 为什么选择 ArchUnit

Netflix 定义了 API 生命周期注解体系：
- `@Deprecated`（Java 标准库）
- `@Public`（自定义，标记供下游使用的 API）
- `@Experimental`（自定义，标记新 API 可能不稳定）
- 未标注 = internal

但需要工具来检测下游项目是否违反这些注解约束。对比了三个方案：

**AST 工具（如 PMD）**：
- 规则语法依赖——Kotlin/Scala 需要重写规则
- 语法糖可能绕过规则检测
- 自定义规则编写困难（XPath 字符串，无 IDE 支持）
- 测试需单独启动 PMD 进程

**ArchUnit（字节码分析）**：
- 基于 ASM 分析编译后的字节码——不关心源码语言
- Fluent API（类型安全的 Java 代码，IDE 补全）
- 保留类关系图，规则可遍历类依赖和调用链
- 简单的单元测试支持

```java
// ArchUnit 规则示例：禁止使用 Guava Optional
ArchRuleDefinition.priority(Priority.MEDIUM)
    .noClasses()
    .should()
    .dependOnClassesThat()
    .haveFullyQualifiedName("com.google.common.base.Optional")
    .because("Java Optional is preferred over Guava Optional");
```

### Nebula ArchRules 架构

#### 规则库插件 (Library Plugin)

在 `archRules` source set 中实现 `ArchRulesService` 接口：

```java
public class GuavaRules implements ArchRulesService {
    static final ArchRule OPTIONAL = ArchRuleDefinition
        .priority(Priority.MEDIUM)
        .noClasses().should()
        .dependOnClassesThat()
        .haveFullyQualifiedName("com.google.common.base.Optional");

    @Override
    public Map<String, ArchRule> getRules() {
        return Map.of("guava optional", OPTIONAL);
    }
}
```

关键设计：
- 规则代码不与主代码打包——以 `arch-rules` classifier 的独立 JAR 发布
- 使用 Gradle Module Metadata 的 `usage` attribute 标记变体
- ServiceLoader 注册自动生成

#### 两种规则库模式

**Standalone Rule Libraries**：仅包含 archRules，无主代码。适用于：
- 对 Core Java API 或 OSS 库的规则（如「禁止使用 Joda Time」）
- 通用规则（如「不使用 @Deprecated 代码」）

**Bundled Rule Libraries**：主代码 + archRules 一起发布。优势：
- Runner Plugin 自动检测依赖中的 bundled rules
- 仅在使用该库的 source set 中运行对应规则
- 规则与库的 API 紧密耦合，维护同步

#### 规则执行器插件 (Runner Plugin)

- 为每个 source set 创建独立的 Gradle Work Action
- Classpath 隔离：`*archRuleRuntime` = archRules classpath + runtimeClasspath（arch-rules variant）
- ServiceLoader 发现 `ArchRulesService` 实现
- 规则违规以二进制序列化写入文件

**自定义配置**：
```groovy
archRules {
    ruleClass("com.netflix.nebula.archrules.deprecation") {
        priority("HIGH")  // 覆盖规则优先级
    }
}
```

可配置：禁用特定 source set 的规则执行、设置失败阈值（高优先级失败导致构建失败）。

### 报告系统

- **JSON 报告**：收集所有 source set 的输出，生成单一 JSON 文件
- **Console 报告**：人类可读格式，包含详细英文描述 + 精确的代码行指针
- **自定义报告**：读取二进制文件或 JSON 构建自定义报告

### 生产案例：API 生命周期管理

回到最初的事故场景——库作者使用 ArchRules 检测下游对 deprecated API 的使用：

```java
ArchRuleDefinition.priority(Priority.MEDIUM)
    .noClasses().that(resideOutsideOfPackage(packageName + ".."))
    .should()
    .dependOnClassesThat(resideInAPackage(packageName + "..").and(are(deprecated())))
    .orShould().accessTargetWhere(...)
    .allowEmptyShould(true)
    .because("Deprecated APIs are subject to removal");
```

Netflix 的 Nebula 标准 Gradle wrapper 自动在每个项目启用 runner，结果上报内部开发者门户。库作者可以：
- 查看哪些下游项目使用了 deprecated/experimental/non-public API
- 确认「breaking change」是否真的会 break 下游
- 精确定位需要协调的项目

### 规模与未来方向

**当前规模**：358 条规则 × 5,000+ 仓库 ≈ 近 100 万个问题（约 1,000 个高优先级）

**OSS 规则库**：
- **Nullability**：强制 JSpecify `@NullMarked` 注解（智能排除 Kotlin 代码）
- **Gradle Plugin Best Practices**：强制 Gradle 插件编写最佳实践
- **Joda/Guava Rules**：阻止使用已被标准库取代的库
- **Security Rules**：检测已知 CVE 漏洞 API 的使用

**未来方向**：
1. **自动修复 (Auto-remediation)**：结合 OpenRewrite（确定性）和 LLM（非确定性）自动修复违规
2. **IDE 集成**：将 ArchRule 失败信息作为 IDE inspection 展示
3. 持续扩展规则覆盖范围

## 实践启示

1. **架构治理规模化**：ArchRules 的核心创新是将「架构规则」从单仓库测试提升为组织级治理工具——规则与代码解耦、自动发现、自动执行
2. **Bundled Rules 模式**：库作者将使用规则与库代码一起发布，是最强大的实践——下游项目无需额外配置即可获得保护
3. **字节码 vs AST**：对于跨 JVM 语言的组织，字节码分析（ArchUnit）比 AST 分析（PMD）更通用——一次编写规则，Kotlin/Scala/Java 通用
4. **渐进式治理**：通过优先级分级（HIGH 导致构建失败、MEDIUM 仅报告）实现渐进式技术债治理
5. **自动修复的潜力**：ArchUnit 的精确报告（具体代码行 + 违规描述）是自动修复工具的理想输入信号

## 相关实体

- [持续集成 (CI)](https://github.com/QianJinGuo/wiki/blob/main/concepts/continuous-integration-ai.md)

---

