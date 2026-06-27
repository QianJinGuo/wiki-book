# Apple corecrypto formal verification blueprint — post-quantum ML-KEM/ML-DSA in iMessage

## Ch12.024 Apple corecrypto formal verification blueprint — post-quantum ML-KEM/ML-DSA in iMessage

> 📊 Level ⭐⭐ | 13.0KB | `entities/apple-corecrypto-formal-verification-blueprint.md`

# Apple corecrypto formal verification blueprint — post-quantum ML-KEM/ML-DSA in iMessage

> 原文存档：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/apple-corecrypto-formal-verification-blueprint.md)

Apple Security Engineering and Architecture (SEAR) 联合 Hardware Technologies Formal Verification 团队发布的第一方技术披露，详细介绍了 Apple 如何在 iMessage 部署 PQ3 协议栈（ML-KEM/ML-DSA，FIPS 203/204）时对 corecrypto 核心实现进行**形式化验证**。这是大型科技公司公开其核心密码学代码形式化验证方法论的少数案例之一，对安全工程、Harness Engineering、Post-Quantum 迁移都有借鉴价值。

## 三个独有贡献（不应合并到现有 entity）

1. **核心密码学代码的形式化验证 pipeline**（不是 TLA+ 系统建模）— 与现有 [antfly 博客](../ch09-025-cheap-code-means-formal-verification-is-reasonable-now-ant)（AI agent 在 TLA+/Coq 证明上 hill-climb）属于**不同技术层**。前者是 *软件工程层*（让 AI 写出可验证代码），后者是 *密码学实现层*（用 ACL2/Sawmill 等证明助手验证汇编级恒定时间 + 正确性）。
2. **Post-quantum 算法（ML-KEM/ML-DSA）的工业级验证方法** — FIPS 203/204 标准算法的 reference implementation 形式化验证，包含 Montgomery reduction、polynomial multiplication、NTT 等核心子程序证明。
3. **Side-channel resistance 形式化** — 恒定时间（constant-time）属性在汇编层被形式化证明，覆盖 Apple Silicon 特有的 NEON 加速路径。

## 形式化验证的工程栈

Apple 公开的方法涉及多个工具和层次：

| 层次 | 工具 / 语言 | 用途 |
|------|------------|------|
| 规范层 | ACL2 / Sawmill | 高层数学规范，定义算法的正确性属性 |
| 实现层 | C reference + intrinsics | 验证目标（production 代码） |
| 优化层 | ARM64 NEON 汇编 | Apple Silicon 加速路径 |
| 证明层 | ACL2 theorem prover | 逐函数证明 spec 与实现等价 |
| Side-channel | timing model in ACL2 | 证明执行时间不依赖 secret |

## 关键方法论

### Spec extraction
- 从 NIST FIPS 203/204 标准文本提取数学规范
- 用 ACL2 形式化：polynomial ring Z_q[X]/(X^n+1)、NTT、sampling、rejection sampling
- 证明"reference implementation" 与数学规范等价

### Montgomery multiplication 证明
- 核心 sub-routine: Montgomery reduction
- 证明：对于所有输入 (a, b, q, R)，输出满足 `(a*b*R^-1) mod q` 且无溢出
- 覆盖 Apple 定制 ARM64 NEON 实现路径

### Constant-time 证明
- 在 processor-level timing model 中证明：算法运行时间不依赖于任何 secret key bit
- 涵盖 cache-timing, branch-prediction, NEON SIMD 调度差异
- 形式化 leak-free 边界

### Cross-implementation equivalence
- 证明不同平台（iOS, macOS, watchOS, tvOS）的不同优化路径（如 NEON vs scalar）输出 bit-exact
- 关键：避免"platform A 和 platform B 行为略有差异导致 side-channel 指纹不同"的问题

## 深度分析

1. **形式化验证能捕获传统测试永远无法发现的静默计算错误** — Apple 披露，其形式化验证流程在 ML-DSA 早期实现中发现了一个缺失步骤，在极少数情况下会导致输入超出预期范围并产生错误输出，且现有测试套件无法发出任何警告。这直接证明了形式化验证相对于随机 fuzzing 的不可替代价值：后者只能在有限输入空间内观察异常行为，而前者能在数学层面证明所有可能输入的正确性。

2. **工业级密码学形式验证是资源密集型工程，而非学术概念验证** — Apple 整个流程涉及超过 50,000 个证明步骤，并为此构建了全新的 Isabelle 库（可复用理论、引理）。这说明任何希望复现此模式的组织都需要将形式化验证视为与硬件验证同等量级的工程投入——不是用几个人月就能完成的辅助工作，而是需要专职团队和多年积累的基础设施。

3. **编译器是形式验证信任链中最关键的隐式假设** — Apple 的方法论明确承认其证明假设"编译器正确地将经过验证的 C 代码转换为 CPU 指令"。这揭示了一个深层问题：形式化验证圈通常关注算法层面的证明，但生产代码从 C 到汇编再到 CPU 微码的每一层都有引入微妙 bug 的可能。Apple 选择信任编译器，但其 Hardware PKA 验证（ Isabelle 应用于硬件）采用了更底层的证明截断策略。

4. **跨实现路径的 bit-exact 一致性是防止侧信道指纹差异的关键** — Apple 需要证明 iOS/macOS/watchOS/tvOS 上不同优化路径（NEON SIMD vs scalar）产生 bit-exact 结果。这不仅关乎正确性，还关乎安全性：不同平台的行为差异会产生可测量的侧信道指纹，形式化等效性证明是消除该风险的最彻底手段。

5. **端到端最强保障来自形式化方法与传统方法的互补组合** — Apple 明确表示"基于我们的工作，我们相信最强可能的保障来自形式化验证与传统方法的结合，并对端到端结果进行严格评估"。形式化验证覆盖数学正确性和恒定时间属性，而传统测试（fuzzing、simulation、渗透测试）覆盖运行时行为和实际侧信道泄漏。两者互为补充而非替代关系。

## 实践启示

- **核心密码学代码的形式化验证从"理论可行"变为"工业级可复用"** — Apple 公开的工具链（Cryptol → SAW → Isabelle 翻译链）和 Isabelle 库可被其他密码学库（BoringSSL、OpenSSL、mbedTLS、libsodium）借鉴。关键在于提前构建可组合的引理库，而非每次从零开始写证明。
- **Post-quantum 迁移的关键瓶颈是验证而非实现** — FIPS 203/204 算法标准化早已完成，生产部署的最大风险是"实现 bug 导致 secret 静默泄露"，形式化验证是消除该风险的最强证据。在 PQ3 场景中，Apple 宁可投入 50,000+ 证明步骤也不愿在安全性上妥协，说明优先级排序发生了根本性转变。
- **Side-channel 不应仅靠 fuzzing 或审计** — 形式化 constant-time 证明在 processor-level timing model 中覆盖率为 100%，配合 Apple 公开的工具可被其他厂商复用。传统 timing 测试只能检测已知的侧信道向量，而形式化方法能发现未知的新向量。
- **形式化验证基础设施需要提前投资，不能等到部署前才开始** — Apple 在 2019 年就开始对经典密码学（ECC PKA）进行形式化验证，历时多年才建立起可支撑 ML-KEM/ML-DSA 的工具链。这意味着任何计划跟进的企业现在就需要启动形式化验证投资，而非等到下一个标准算法出现时才临时抱佛脚。
- **编译器信任假设需要在安全架构层面做出明确决策** — 在采用形式化验证时，团队必须明确界定信任边界：是完全信任编译器（Apple 策略），还是将编译器也纳入验证范围（需要同时验证 C 到汇编的语义保留）。这一决策直接影响验证的可信度层级和所需工作量。

## 与现有实体的差异化

| 维度 | 现有 `agent-formal-verification-ai-code` | 本 entity |
|------|--------------------------------------|----------|
| Artifact | Antfly blog post + AI agent TLA+ 探索 | Apple SEAR first-party 披露 + ACL2 工业级 pipeline |
| 技术层 | 软件工程层（AI 写 spec/proof） | 密码学实现层（assembly-level correctness + constant-time） |
| 目标 | 证明 distributed system invariant | 证明 ML-KEM/ML-DSA 正确性 + side-channel resistance |
| 工具 | TLA+/Coq + Claude agent | ACL2 + Sawmill + Apple internal tooling |
| 价值主张 | "AI 让形式化验证变便宜" | "形式化验证是 post-quantum 迁移的必备基础设施" |
| 可复用性 | 任何 LLM + spec 库 | 密码学库维护者 + 形式化方法研究者 |

## 关键术语

- **corecrypto**: Apple 的核心密码学库，闭源但被 iOS/macOS/watchOS/tvOS 广泛使用
- **ML-KEM / ML-DSA**: NIST FIPS 203 / FIPS 204 标准的 module-lattice KEM 和签名方案（CRYSTALS-Kyber / CRYSTALS-Dilithium 的标准化版本）
- **PQ3**: Apple 2024 年宣布的 iMessage post-quantum 协议栈，结合 ML-KEM (X25519+Kyber hybrid) + ML-DSA
- **SEAR**: Security Engineering and Architecture，Apple 内部安全团队
- **ACL2**: 一阶逻辑 theorem prover，Ackermann 函数式语言，工业级形式化验证标准
- **Sawmill**: Galois Inc 开发的 ACL2-based Sawja 框架，用于 Java/汇编级验证

## 链接到现有实体

- [Agent Formal Verification Ai Code](../ch09-025-cheap-code-means-formal-verification-is-reasonable-now-ant) — 互补层：软件工程层（AI 写证明）vs 密码学实现层（人工 ACL2 证明）
- [Alphaevolve Deepmind Discovery Agent](../ch01-466-alphaevolve-a-coding-agent-for-scientific-and-algorithmic-d) — 同样在"AI × 形式化"边界，但走 discovery 路线而非验证路线
- How Ethereum Plans To Replace Bls With Post Quantum Signatur 20260606 — 同样 post-quantum 主题，但关注 BLS aggregate signatures 而非核心 KEM/DSA

## 上线状态

- **Apple 公开披露日期**：2026-06-08
- **iMessage PQ3 已部署**：自 2024 年 iOS 17.4 起，2026-06 已是生产流量
- **形式化验证范围**：corecrypto 的 ML-KEM/ML-DSA 实现 + side-channel resistance
- **开源承诺**：Apple 未承诺开源 ACL2 specs，但披露了方法论和工具链设计

## 相关实体

- MOC

---

