# Static Devirtualization 2024

## Ch12.020 Static Devirtualization 2024

> 📊 Level ⭐⭐ | 15.9KB | `entities/static-devirtualization-2024.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/static-devirtualization-of-themida.md) | → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/back-engineering-static-devirtualization-themida.md)

## 摘要

Static Devirtualization（静态去虚拟化）是一种针对基于虚拟机的代码混淆保护器的逆向工程方法论。其核心思想是将虚拟机（VM）保护的原生代码通过符号执行（Symbolic Evaluation）提升（lift）至中间表示（IR），利用通用编译器优化 passes 逐步消除 VM 脚手架，最终恢复出可读的原生代码。该方法在 2024 年已达到成熟实用阶段，可跨 Themida、VMProtect、CodeVirtualizer 等多种基于虚拟机的代码保护器工作，仅需极少的 VM 特定知识。

## 技术背景

### 虚拟机混淆的挑战

现代软件保护器（如 Themida、VMProtect）使用自定义虚拟机将原始 x86/ARM64 指令转换为字节码（bytecode），并在 VM 内部执行。这种保护方式使得：

- 原始指令被完全隐藏
- 字节码格式为每个二进制文件独有（加密 opcode 表）
- 控制流被虚拟化，传统的反汇编/反编译工具失效

传统逆向方法（如 IDA Pro、Binary Ninja）只能看到 VM entry stub 和 handler 分发逻辑，无法直接分析被保护的函数逻辑 。

### 早期方法的局限性

早期去虚拟化研究主要依赖 **pattern matching** —— 将 VM handler 反向匹配回原始 x86 指令。这种方法的问题在于：

- handler 布局、opcode 表或调度逻辑的任何微小变化都会破坏工具链
- 无法跨版本工作，脆弱性极高
- 保护器厂商可通过小升级轻易破坏已有工具

相关早期工作可追溯到 2019 年的学术研究（arxiv 1909.01752）以及社区项目如 VMProtect-devirtualization、Dna/Mergen 等 。

## 核心技术：引导式符号执行

### BLARE2 引擎

Back Engineering Labs 开发的 BLARE2 是一个自定义 binary lifting 和重编译引擎，具备：

- 自定义 SSA IR（支持 AMD64 + ARM64）
- 完整 pass 系统与优化器
- 指令选择器、寄存器分配器、链接器
- 可将优化后的 IR 降级回原生代码并重新插入二进制

关键创新点：区别于学术 lifting 框架（如 Remill）仅能生成 LLVM IR，BLARE2 可以输出紧密且行为良好的原生代码，这是去虚拟化实用化的临门一脚 。

### 符号执行起点

Lifting 从以下初始状态开始：

- **所有寄存器和标志位均为符号值**（symbolic）
- **RSP（栈指针）被赋予具体初始值**（concrete）

这一设计决策的权衡：

- **好处**：现有 load/store 传播逻辑自动处理栈访问；RSP 算术运算可被常量折叠
- **代价**：不支持动态栈分配（如 `alloca`），但实践中虚拟化的函数很少使用动态栈分配

### 控制流具体化

当遇到 ret 指令且 RSP = `initRSP - 0x10` 时，判定为 **VMEXIT-CALL**：

- call 目标置于 RSP
- 返回地址置于 `RSP + 0x8`

若地址无法被具体化（concretize），说明：
1. 优化过程尚未运行充分
2. 该分支存在多个真实目标（如虚拟化条件跳转 VJCC）

## 优化 Pass 系统

这些 passes 之间并非独立工作——**每个 pass 喂养下一个 pass，VM 脚手架作为它们共同收敛的结果而坍缩** 。

### 完整 Pass 列表

1. **Constant Promotion & Memory Modeling** — 将 bytecode 加载提升为常量；可配置内存范围策略防止用户数据被意外提升 `
2. **Constant Folding** — 运行至收敛；每次折叠可能使新的表达式变为常量 `
3. **Dead Store Elimination** — 安全移除仅访问 VM-private 内存的 store `
4. **Instruction Combination** — 识别代数恒等式，剥离 VM handler 中的冗余运算 `
5. **Branch Folding** — 标志位计算解析为常量后，消除不透明分支目标 `
6. **VMEXIT Behavior** — 根据 RSP 位移区分 VMEXIT-CALL、VMEXIT-返回原函数 epilog 等类型 `
7. **Virtualized Control Flow** — 记录所有虚拟指令指针，避免虚拟化循环被错误展开 `
8. **Dead Dependency Analysis Pass** — 识别被 native 代码 clobber 的寄存器/标志，这些从 VM 视角看是死的 `
9. **Stack Pointer Rewrite Pass** — 将常量栈地址访问重写为 RSP-relative 形式 `

### Pass 间的协同效应示例

```
bytecode load 被提升为常量 
→ 解密运算被折叠 
→ handler 索引变为具体 
→ handler 表查找被解析 
→ 下一 handler 地址成为常量
```

VM 脚手架由此逐步崩溃 。

## Themida 特有的 VJCC 处理

这是少数真正需要 VM 特定知识的场景之一。

在 Themida 的 VJCC handler 中：

- 条件先被求值并将结果写入 `branch_taken_flag`
- VIP（Virtual Instruction Pointer）直到 handler 末尾才推进

这意味着符号执行在 VIP 被解析之前就遇到了分支叉点：

- 两条路径都需要被探索
- 每条路径的正确 VIP 必须通过 handler 底部的条件 VPC 更新逻辑追踪，而非从单一加载中读取

相比之下，VMProtect 的 VIP 就是最后加载模块值，逻辑简单得多 。

## 降级（Lowering）阶段的关键约束

### 寄存器压力

如果寄存器分配器发生溢出（spill），devirtualized 代码会产生自己的栈帧。这会导致：

- 栈传递参数的地址计算错误
- IDA、Binary Ninja 等反汇编器误读函数调用
- 恢复的代码无法正确加载

**目标**：产生可执行输出，使其在任何反汇编器中都干净地加载，没有多余的栈帧或 artifacts 。

### LLVM 的局限性

作者对 LLVM-based 方案持保留态度：

- LLVM 在生成能够干净地重新插入二进制的紧凑行为良好原生代码方面存在固有困难
- 让 LLVM 发出 tight, well-behaved native code 是一个独立项目
- 这是去虚拟化区别于一般二进制订简的特殊约束

## 防御与对抗的演进

### MBA 混淆的对抗

通过带不透明值的 MBA（Mixed Boolean-Arithmetic）表达式隐藏分支目标是早期对抗符号执行的方法。但这类 MBA 表达式目前已能被现有技术轻易约简（参见相关演示） 。

### 更强的防护技术

更强的技术（如 CodeDefender 在重型保护层级中实现的技术）可从根源上使符号执行变得不可行，但具体细节超出本文范围 。

## 2024 年技术成熟度

截至 2024 年，静态去虚拟化技术已达到以下成熟度：

| 维度 | 状态 |
|------|------|
| Themida 去虚拟化 | ✅ 成熟，跨版本有效 |
| VMProtect 去虚拟化 | ✅ 成熟 |
| 嵌套虚拟化支持 | ✅ 支持（Themida 架构） |
| ARM64 支持 | ✅ BLARE2 原生支持 |
| LLVM 后端替代方案 | ⚠️ 需要大量工程投入 |
| 对抗 MBA 混淆 | ✅ 可约简 |
| 对抗更强混淆技术 | 🔄 持续演进 |

## 深度分析

### 通用优化是去虚拟化的主力，而非 VM 特定知识

本文最重要的颠覆性观点是：去虚拟化绝大部分工作由通用编译器优化 passes 完成，VM 特定知识仅在处理控制流时（即虚拟分支和虚拟化调用场景）才是必需的 。这与社区长期依赖 pattern matching 的路线截然不同——pattern matching 将每个 VM handler 反向匹配回 x86 指令，但 handler 布局、opcode 表或调度逻辑的任何微小变化都会破坏整个工具链。相比之下，基于符号执行 + 通用优化 passes 的方法天然跨版本、跨保护器工作，因为 passes 作用于 IR 而非特定 VM 行为。

### Concrete RSP 的设计权衡：牺牲动态栈支持换取整体简洁

BLARE2 将 RSP 设为具体初始值而非符号值，这是一个经过深思熟虑的设计决策。将 RSP 符号化需要编写专用的栈传播逻辑，而保持 RSP 具体值意味着现有 load/store 传播逻辑自动处理栈访问，RSP 算术运算可被常量折叠，无需特殊处理 。代价是：不支持 `alloca` 或编译器生成的变长数组（VLAs），因为栈位移不再是静态可知的。但实际上，需要虚拟化的函数很少使用动态栈分配，这一限制在实践中几乎不构成问题。

### 寄存器压力是降级阶段的决定性约束

降级（Lowering）阶段的最大工程挑战是寄存器压力。如果寄存器分配器发生溢出（spill），devirtualized 代码会产生自己的栈帧，直接导致：IDA、Binary Ninja 等反汇编器将误读栈传递参数的地址，恢复的代码无法正确加载 。这解释了为什么作者对 LLVM-based 方案持保留态度——LLVM 生成能够干净地重新插入二进制的紧凑行为良好原生代码是一个独立项目。这不是 IR 质量问题，而是后端工程问题：让 LLVM 发出 tight, well-behaved native code 需要在每一步都与 LLVM 框架搏斗。

### VJCC handler 是真正的 VM 特定知识孤岛

Themida 的 VJCC handler 构造与 VMProtect 有本质区别，是少数真正需要 VM 特定知识的场景之一 。在 Themida 中，条件先被求值并将结果写入 `branch_taken_flag`，VIP 直到 handler 末尾才推进，这意味着符号执行在 VIP 被解析之前就遇到了分支叉点——两条路径都需要被探索，每条路径的正确 VIP 必须通过 handler 底部的条件 VPC 更新逻辑追踪。相比之下，VMProtect 的 VIP 就是最后加载模块值，逻辑简单得多。这解释了为什么跨保护器去虚拟化框架必须为 Themida 的 VJCC 处理单独建模。

### MBA 混淆的对抗性演化

带不透明值的 MBA（Mixed Boolean-Arithmetic）表达式是早期对抗符号执行的手段——通过编码分支目标来阻止常量折叠 。但这类 MBA 表达式目前已能被现有技术轻易约简（参见 Back Engineering 的演示）。更强的技术（如 CodeDefender 在重型保护层级中实现的技术）可从根源上使符号执行变得不可行。这揭示了攻防博弈的演进方向：防御方在持续寻找无法被通用优化简化的混淆手段，而进攻方（devirtualization）必须持续扩展 passes 的通用性。

## 实践启示

### 优先实现 Dead Store Elimination + Dead Dependency Analysis 组合

这两个 passes 协同工作产生的是「看起来像函数而非 VM 解释器」的 IR 。VM handlers 不断通过 context 和虚拟栈 shuffle 状态，没有 Dead Store Elimination，这些 store 作为无消费者、无原生可见输出路径的悬空表达式持久存在于 IR 中。配合 Dead Dependency Analysis（识别被 native 代码 clobber 的寄存器/标志），才能真正从 VM 脚手架中打捞出干净的函数语义。

### 降级阶段全程监控寄存器压力，避免 spill 发生

寄存器溢出直接破坏恢复代码的正确性和可用性 。工程实现中应该在寄存器分配器周围设置监控机制，当分配器报告溢出趋势时主动触发 IR 重写（例如简化表达式树、合并相邻操作）以腾出寄存器，而非被动接受溢出后再 spill。目标是产生可执行输出，使其在任何反汇编器中都干净地加载，没有多余栈帧。

### 对 LLVM 后端保持清醒认知：IR 质量不等于后端质量

学术 lifting 框架（如 Remill）在 IR 生成方面已经相当成熟，但到达「干净可重插入的原生代码」这最后一公里仍需要大量工程投入 。如果目标是实用化 devirtualization 工具，应该将后端工程视为独立项目来规划，而非假设 LLVM 能够开箱即用解决所有问题。BLARE2 的自定义后端正是为此设计——为 devirtualization 场景量身打造的 IR → Native 流水线。

### 将 VM-specific 知识限制在 VJCC 和 VMEXIT-CALL 判断两点

其余所有优化 passes（常量提升、常量折叠、死存储消除、指令组合、分支折叠等）都是通用编译器技术 。在架构设计时应将这些通用 passes 视为核心组件，VM-specific 处理仅在必要时介入：VJCC 的 `branch_taken_flag` 追踪逻辑，以及基于 RSP 位移判断 VMEXIT-CALL/VMEXIT-返回/VMEXIT-不支持指令三类出口的分类逻辑。这种分离确保了框架的跨版本和跨保护器能力。

### 防御方视角：MBA 混淆需升级至不可简化类

对于软件保护器的开发者而言，基于不透明值的 MBA 表达式已不足以抵御现代符号执行 + 常量折叠技术组合 。更强的方向是 CodeDefender 重型保护层级中实现的技术——从符号执行根本上不可行的角度设计混淆。这要求保护器设计者持续关注去虚拟化技术的能力边界，并在混淆手段上保持代际领先。

## 相关工具与框架

- **BLARE2** — Back Engineering Labs 自研，商用级 binary lifting 和重编译引擎
- **Triton** — 符号执行引擎，可用于 IR 提升
- **Remill** — LLVM-based lifting 框架，IR 质量好但后端有限
- **themida-unmutate** — ergrelet 开发的 Themida 去混淆工具
- **VMProtect-devirtualization** — JonathanSalwan 社区项目

## 相关实体

- [Static Devirtualization of Themida](https://github.com/QianJinGuo/wiki/blob/main/entities/static-devirtualization-themida.md) — 完整技术分析（2026）
- [Static Devirtualization of Themida](ch12/018-static-devirtualization-of-themida.html) — 方法论详解
- [Static Devirtualization of Themida](https://github.com/QianJinGuo/wiki/blob/main/entities/back-engineering-static-devirtualization-themida.md) — 实践启示
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/static-devirtualization-of-themida.md)
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/back-engineering-static-devirtualization-themida.md)

---

