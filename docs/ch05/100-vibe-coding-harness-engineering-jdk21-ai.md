# 从 Vibe Coding 到 Harness Engineering：小米 JDK21 升级中可控演进的 AI 工程实践

## Ch05.100 从 Vibe Coding 到 Harness Engineering：小米 JDK21 升级中可控演进的 AI 工程实践

> 📊 Level ⭐⭐ | 2.4KB | `entities/xiaomi-harness-engineering-jdk-upgrade.md`

# 从 Vibe Coding 到 Harness Engineering：小米 JDK21 升级中可控演进的 AI 工程实践

小米技术团队运用 Harness Engineering 方法论完成 JDK 21 + Spring Boot 3.5.3 升级的真实案例。核心框架：**构建执行约束 → 沉淀工程经验 → 建立反馈闭环**。

## 三部分框架

### 1. 执行约束

- **项目上下文构建**：把隐性知识（Thrift 自动生成文件不可改、本地编译需 -Plocal 参数等）变成结构化规范
- **工程工具编排**：把工程动作封装为输入输出明确的工具，AI 只需调用

### 2. 经验沉淀（Skill 化）

- **jdk-upgrade Skill**：5 步标准流程（Maven 插件→依赖→JVM→代码→验证）+ 6 条核心约束
- **渐进式披露**：SKILL.md 入口 + references/{maven,dependency,jvm,code}.md
- **jdk-upgrade-lessons Skill**：升级后自动触发，5 维度经验总结 + 生成新版本 Skill

### 3. 反馈闭环

测试前置驱动验证：升级前写集成测试（@Timeout + 真实 Spring 上下文 + 结构化输出）→ 升级后重跑 → 失败则 AI 定位修复

## 效果数据

70% 项目一轮完成，CPU -22.5%，堆内存 -23%，P99 延迟 -18.1%，峰值 QPS +30%+

## 核心贡献

- 首次用 Harness Engineering 解决**维护性工程**（非新功能开发）——这类工作占工程团队大部分时间但此前 AI 辅助极少
- 提出**经验回流机制**：通过 jdk-upgrade-lessons Skill 把一次升级经验反哺为下版本 Skill
- 验证"AI 文档的首要读者从人变为 AI"：规范不是为了约束人，而是为了约束 AI

## 与其他实体的关系

- → [Harness Engineering](ch05/066-harness-engineering.html) — 本文是该方法论在维护性工程场景的实证
- → [Agent Skill 规范、构建与设计模式](../ch04/264-agent-skill.html) — jdk-upgrade Skill 的设计与渐进式披露机制
- → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/vibe-coding-to-harness-engineering-jdk-upgrade-xiaomi.md)

---

