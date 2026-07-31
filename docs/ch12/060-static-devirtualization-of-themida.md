# Static Devirtualization of Themida

## Ch12.060 Static Devirtualization of Themida

> 📊 Level ⭐⭐ | 7.5KB | `entities/static-devirtualization-of-themida.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/static-devirtualization-of-themida.md)

## 摘要
本文由 Back Engineering Labs 发布，展示了一种**通用静态去虚拟化（Static Devirtualization）框架**，核心思想是将 VM 保护的二进制代码通过符号执行（symbolic evaluation）提升（lift）至中间表示（IR），再利用一系列通用优化 passes 将虚拟机的所有"脚手架"逐一消除，最终将代码回填（reinsert）至原生 x86/ARM64。该方法在 Themida、VMProtect 等多种基于虚拟机的代码保护器上均适用，仅需少量 VM 特定知识——尤其是在处理虚拟条件分支（VJCC）时需要 Themida 特有的 `branch_taken_flag` 追踪。

## 核心方法
### 引导式符号执行（Guided Symbolic Evaluation）
devirtualization 的起点是将原生指令提升至可操作的 IR。Back Engineering Labs 使用自研的 **BLARE2** 引擎（自定义 SSA IR，支持 AMD64 和 ARM64，包含完整 pass 系统、优化器、指令选择器、寄存器分配器和链接器）完成这一任务。 关键设计决策：

- 符号执行开始时，**所有寄存器和标志位均为符号值**，除了 RSP（栈指针）被赋予具体初始值
- 保持 RSP 具体化（concrete）的好处：现有的 load/store 传播逻辑自动处理栈访问，任何调整 RSP 的算术操作可被常量折叠，无需特殊处理。代价是动态栈分配（如 `alloca`）不受支持，但在虚拟化函数中罕见
- 当遇到 ret 指令且 RSP = `initRSP - 0x10` 时，判定为 **VMEXIT-CALL**：call 目标置于 RSP，返回地址置于 `RSP + 0x8`

### 通用优化 Passes 的协同崩塌效应
devirtualization 的真正力量来自一组通用优化 passes 的**协同收敛**。这些 passes 之间相互依赖——一个 pass 的输出为下一个 pass 提供输入——最终导致整个 VM 脚手架自动坍塌。
1. **常量提升与内存建模（Constant Promotion & Memory Modeling）**：将 bytecode 加载地址提升为常量，为后续常量折叠提供具体操作数
2. **常量折叠（Constant Folding）**：运行至不动点，将解码算术、handler 表索引、VPC 更新数学全部折叠为常量
3. **无效存储消除（Dead Store Elimination）**：VM 私有内存中的存储在 VMEXIT 后无观察效果，安全删除
4. **指令组合（Instruction Combination）**：识别冗余算术（自抵消操作、冗余掩码、恒等乘法），逐步剥离混淆噪声
5. **分支折叠（Branch Folding）**：标志位计算折叠为常量后，依赖常量的条件分支可静态消解

### Themida 特有的 VJCC 处理
这是少数需要 VM 特定知识的场景之一。Themida 的 VJCC handler 在 **VIP 推进之前**先评估条件并写入 `branch_taken_flag`，这意味着符号执行在 VIP 解析之前就遇到分支叉点——两条路径均需探索，每条路径的正确 VIP 必须通过追踪条件 VPC 更新逻辑获得。相比之下，VMProtect 的 VIP 就是最后加载模块值，逻辑简单得多。

### 回填（Lowering）阶段的关键约束
devirtualized 代码要被 IDA、Binary Ninja 等工具正常加载，关键约束是**寄存器压力**。若寄存器分配器发生 spill（溢出至栈），devirtualized 函数获得独立的栈帧，导致栈传递参数的地址计算错误，整个函数在反编译器中无法正确解析。因此，高质量的后端（tight, well-behaved native code）是 devirtualization 的临门一脚——这是作者对 LLVM-based 方案持保留态度的原因。

## 深度分析
### 框架可移植性的来源
本文最重要的方法论贡献不是针对 Themida 的具体技巧，而是**最大化通用性、最小化 VM 特定知识**的设计哲学。Themida 的架构与 VMProtect 本质不同（VM context 存在于二进制自身而非原生栈），但 devirtualization 方法是通用的。这是因为绝大多数 passes（常量折叠、DSE、指令组合、分支折叠）都是标准编译器优化，不依赖任何 VM 内部细节。VM 特定知识只在两个地方出现：VJCC 的 `branch_taken_flag` 追踪和 VMEXIT 的 RSP 模式识别。

### Pattern Matching 的失效与结构化方法的胜利
作者在早期研究中曾尝试 pattern matching（将 VM handler 反向匹配回 x86 指令），但发现这一方法不可扩展：handler 布局、opcode 表或调度逻辑的任何微小变更都会在整版本范围内破坏工具链。这与软件逆向工程中"anti-pattern matching"的设计趋势一致——保护器厂商正是利用这一漏洞主动破坏基于特征的检测工具。结构化符号执行方法则对 VM 内部表示变化具有天然鲁棒性。

### 符号执行防御的边界
文章最后坦承：当 obfuscator 将分支目标编码为带有不透明值（opaque values）的 MBA 表达式时，符号执行无法 concretize 分支目的地。但这类 MBA 表达式目前已可被presentation [YouTube] 中描述的技术轻易约简——这说明防御与攻击的技术博弈仍在动态演进，静态去虚拟化并非终极解决方案。

## 实践启示
### 二进制安全研究
- 从事恶意软件分析或漏洞挖掘的研究者，若遇到 Themida/VMProtect 保护的二进制，可使用本文描述的框架思路：使用 Triton/Remill 升提 IR → 运行通用优化 passes → 尝试回填原生代码
- 关键前置条件：RSP concretization 意味着**不支持动态栈分配函数**——分析前需确认目标函数没有 `alloca`
- VMEXIT 模式识别是判断保护类型（call-shaped exit vs. return-to-epilog）的重要信号

### 工具链构建
- 通用优化 passes 的效果强依赖于运行至收敛（running to convergence）：单次 pass 可能触发新的常量折叠机会，需循环迭代直至 IR 稳定
- BLARE2 的后端设计（tight native output）是其区别于学术 lifting 框架的核心优势。若自建工具链，需要在 LLVM 后端投入大量工程精力
- 符号执行引擎的初始 RSP concretization 策略需根据目标二进制进行调整——某些 Themida 变体可能在 VM entry 时修改 RSP

### 软件保护评估
- 若评估一款软件保护产品的抗逆向能力，可参照本文检测其 VM handler 的符号执行可 concretize 程度：handler 越复杂、MBA 混淆越深，静态 devirtualization 的难度越高
- Themida 的嵌套虚拟化（nested virtualization）能力——VM context 存在于二进制自身——是其区别于 VMProtect 的架构优势，也是更难 devirtualize 的原因之一

## 相关实体
- [Static Devirtualization of Themida](https://github.com/QianJinGuo/wiki/blob/main/entities/back-engineering-static-devirtualization-themida.md)
- [Static Devirtualization of Themida](https://github.com/QianJinGuo/wiki/blob/main/entities/static-devirtualization-themida.md)
- [static devirtualization of themida](ch12/062-cve-2026-20182-unauthenticated-cisco-sd-wan-control-plane-c.html)

---

