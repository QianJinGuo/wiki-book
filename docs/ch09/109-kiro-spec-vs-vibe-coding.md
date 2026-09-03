# 用 Kiro 构建行业专业软件：Spec vs Vibe Coding 的分层结论

> 📊 Level ⭐⭐ | 3.0KB | `entities/kiro-building-seismic-wave-processing-spec-vibe-coding.md`

# 用 Kiro 构建行业专业软件：Spec vs Vibe Coding 的分层结论

Kiro 是一个 AI 原生开发环境。在一项为期 5 天、实际编码约十余小时的行业垂直软件开发实践中（陆上地震勘探多次波压制处理系统），交付约 2,408 行代码与文档，涵盖预测反褶积、双曲 Radon 变换、SRME 三种经典算法，以及 CLI、桌面 GUI 与多炮并行流水线。

## 核心论点：Spec vs Vibe Coding 的分层适用边界

本文的核心方法论贡献是提出了 **"内核用 Spec、外围用 Vibe、衔接靠接口"**的分层开发范式：

- **算法内核（Spec 驱动）**：采用 Speck 固化统一接口规范，确保算法实现的正确性、可测试性和可维护性。Spec 驱动适合确定性高、边界明确的逻辑核心。
- **外围交互（Vibe Coding）**：GUI 和 CLI 等用户交互层采用探索式迭代快速成型，Vibe Coding 让快速试错成为可能。
- **衔接层**：通过明确的 API 接口连接 Spec 内核与 Vibe 外壳，保持系统整体的一致性。

## 行业专业软件的 AI 赋能路径

文章记录了一个重要观察：AI 工具不会替你突破方法的物理边界（地震波压制方法本身的数学物理限制依然存在），但 AI 能显著降低"将领域知识转化为可运行、可扩展代码"的成本。

在投入产出方面，5 天时间（实际编码十余小时）完成从需求分析到交付一个可运行的行业软件系统，代表了 AI 辅助开发行业垂直软件的新效率水平。

## 算法实现验证

三种经典地震信号处理算法在 Kiro 中实现，并在小合成数据上验证：
- **预测反褶积**：接近论文最佳水平
- **双曲 Radon 变换**：受方法本身限制，效果有限
- **SRME**：受数据条件限制，效果有限

项目坦诚讨论了算法在小合成数据上的适用边界，强调工程落地价值而非指标刷榜。

## 相关实体

- [OpenSpec/Spec-Driven Development](../ch05/046-openspec.html)
- [Spec-Driven Development 认知框架](https://github.com/QianJinGuo/wiki/blob/main/entities/spec-driven-development-cognitive-framework.md)
- [Spec-Driven Development 总结](https://github.com/QianJinGuo/wiki/blob/main/entities/sdd-spec-driven-development-summary-qoder.md)
- [Beyond Vibe Coding](https://github.com/QianJinGuo/wiki/blob/main/entities/beyond-vibe-coding-directed-generation-design-uxmag.md)
- [AI 生产力悖论](../ch04/257-ai.html)

---

