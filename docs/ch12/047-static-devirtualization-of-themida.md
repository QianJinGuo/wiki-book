# Static Devirtualization of Themida

> 📊 Level ⭐⭐ | 8.5KB | `entities/back-engineering-static-devirtualization-themida.md`

> -> [原文存档](https://back.engineering/blog/09/05/2026/)

## 摘要

本文由 Back Engineering Labs 发表于 2026 年 5 月，系统阐述了对 Themida（CodeVirtualizer）保护的二进制进行静态去虚拟化的完整技术路径。核心主张：去虚拟化的绝大部分工作由通用编译器优化 passes 完成，VM 特定知识仅在处理虚拟化条件跳转（VJCC）时才成为必需，这与社区长期依赖 pattern matching 的脆弱路线形成鲜明对比。

## 关键要点

- Themida 支持嵌套虚拟化（nested virtualization），VM context 和虚拟栈位于 binary 内部而非原生栈上
- Pattern matching 方法已被证明不可扩展——handler 布局的微小变化即可破坏整个版本范围的工具链
- Guided Symbolic Evaluation 将原生指令提升为 SSA IR，通过让优化解析未知分支目标来驱动提升
- 保持 RSP 具体值是关键设计决策：load/store propagation 自动处理栈访问，代价是不支持 alloca（实践中极少遇到）
- 九个 optimization passes 每个 pass 喂养下一个，VM 脚手架作为它们共同收敛的结果而坍缩
- Themida 的 VJCC handler 中条件先被求值写入 `branch_taken_flag`，VIP 直到 handler 末尾才推进
- BLARE2 区别于 Remill 等学术框架的关键：可将优化后 IR 降级回紧密原生代码并重新插入 binary
- MBA 表达式已可被轻易约简，更强的保护技术（如 CodeDefender）使符号执行不可行

## 深度分析

### Themida 架构与 devirtualization 策略

Themida 的 VM 架构与 VMProtect 的最大差异在于支持嵌套虚拟化——VM context 和虚拟栈存储在 binary 内部，使得多层保护成为可能。但从 devirtualization 角度看，这个架构细节并不显著影响方法论：唯一需要 VM 特定知识的组件是虚拟分支（VJCC）和 VMEXIT 行为。作者早期尝试过 pattern matching 方法（vmp2 项目），但明确表示它无法扩展。保护器厂商对 handler 布局或调度逻辑的任何微小调整都会无声地破坏整个工具链。因此本方法论刻意最小化 VM 特定知识，这正是它能跨 Themida 多个版本工作的原因。

### Guided Symbolic Evaluation 与 RSP 具体化

核心思路是将原生指令提升到 malleable IR，然后通过让优化过程解析未知分支目标来驱动提升向前推进。提升从所有寄存器和标志符号化开始，逐条反汇编并提升指令，直到下一条指令指针无法确定。此时取决于控制流指令类型：ret 指令表示最后对 RSP 的存储即为下一个 IP；其他情况下地址无法具体化说明要么优化尚未运行充分，要么分支存在多个真实目标（如虚拟化 JCC）。

RSP 的处理是经过深思熟虑的设计决策。保持 RSP 为具体初始值意味着：现有的 load/store propagation 机制自动处理栈访问，RSP 算术运算可被常量折叠而无需特殊处理。替代方案是保持 RSP 符号化并编写专用栈传播逻辑——工作量更大且无实际收益。代价是不支持 alloca 或变长数组，但需要虚拟化的函数很少使用此类分配。

BLARE2 是自研的 lifting 框架，具备自定义 SSA IR、AMD64/ARM64 支持、完整的 pass system 和 linker。Linker 是区别于大多数 lifting 框架的关键——BLARE2 可以将优化后 IR 降级回原生代码并重新插入 binary，产生与原始代码近乎 1:1 的输出。作者指出 Triton 或 Remill 可完成大部分前端工作，但在后端——让 LLVM 发出紧密、可重新插入的原生代码——存在显著差距。

### 优化 Passes 的协同收敛

完全还原虚拟化不需要穷举编译器优化。少量 passes 运行至收敛即可坍缩整个 VM 脚手架，关键在于 passes 之间的级联效应：bytecode load 提升为常量 → 解密运算折叠 → handler 索引具体化 → handler 表查找解析 → 下一 handler 地址成为常量。

**Constant Promotion & Memory Modeling** 将 VM bytecode 加载提升为常量。BLARE2 的 load/store propagation 是可配置的——程序员指定哪些内存范围可安全提升，防止 VM-private 提升触及用户数据。传播在字节级别建模，正确处理重叠 store。两个失败模式：从会被写入的地址提升会产生错误结果（store tracking 存在的理由）；过度提升会破坏原始程序语义。

**Dead Store Elimination** 在此场景下安全，因为目标是 VM-private 内存。Themida 使用自己的 section 存放 VM context 和虚拟栈，对原始程序不可见。一旦 lifting 到达 VMEXIT，任何仅访问 Themida section 的存储都可被证明是死的。跳过此 pass 的代价可见：VM handlers 不断 shuffle 状态，没有 DSE 这些 store 作为悬空表达式持久存在于 IR 中。配合 Dead Dependency Analysis 才能产生真正干净的函数语义 IR。

### VJCC 与虚拟化控制流

Themida 的虚拟化条件分支处理是少数真正需要 VM 特定知识的场景。VMProtect 中 VIP 就是最后加载的模块值，逻辑简单。但 Themida 的 VJCC handler 中，条件先被求值写入 `branch_taken_flag`，VIP 直到 handler 末尾才被推进。这意味着符号执行在 VIP 解析前就遇到分支分叉——两条路径都需探索，每条路径的正确 VIP 必须通过 handler 底部的条件 VPC 更新逻辑追踪。

每次遇到 VIP 都需要记录，否则 backedge 会被误认为需要无限展开。VMP 中跟踪 VIP 直截了当（bytecode 编码了下一个 handler 地址），但 Themida 中需要遵循 `branch_taken_flag` 直到 VIP 发散点。

### Lowering 与寄存器压力

降级阶段的最大工程挑战是寄存器压力。如果寄存器分配器发生 spill，devirtualized 代码会产生自己的栈帧，导致 IDA、Binary Ninja 等反汇编器误读栈传递参数地址。目标是产生在任何反汇编器中都干净加载的可执行输出。这解释了作者对 LLVM-based 方案的保留态度——让 LLVM 发出 tight、reinsertable 的原生代码需要在每一步都与框架搏斗，这不是 IR 质量问题而是后端工程问题。

## 实践启示

1. **最小化 VM-specific 知识**：任何对 VM 特定行为的依赖都会使工具脆弱。基于符号执行 + 通用优化 passes 的方法天然跨版本、跨保护器工作，因为 passes 作用于 IR 而非特定 VM 行为。
2. **引导符号执行而非急于决策**：当指令指针无法确定时，说明优化还没运行足够距离，或分支有多个真实目标。继续运行优化直到可以具体化，而非对未知分支做仓促决策。
3. **可配置的内存范围策略**：load/store propagation 必须区分 VM 脚手架和反映原始程序语义的加载。store 追踪防止从被写入的地址提升，可配置的 range 策略防止过度提升。
4. **寄存器分配器需主动监控**：溢出直接破坏恢复代码的正确性。应在寄存器分配器周围设置监控机制，当溢出趋势出现时主动触发 IR 重写以腾出寄存器。
5. **后端工程独立规划**：学术框架在 IR 生成方面已成熟，但到达「干净可重插入的原生代码」仍需大量工程投入。应将后端工程视为独立项目。
6. **MBA 对抗已失效**：不透明值 MBA 表达式隐藏分支目标是早期对抗手段，但目前已能被轻易约简。更强方向是从符号执行根本上不可行的角度设计混淆。

## 相关实体

- [Static Devirtualization 2024](018-static-devirtualization-2024.html)
- [Static Devirtualization of Themida](056-static-devirtualization-of-themida.html)

---

