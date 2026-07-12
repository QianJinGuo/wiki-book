# Static Devirtualization of Themida

## Ch12.018 Static Devirtualization of Themida

> 📊 Level ⭐⭐ | 17.3KB | `entities/static-devirtualization-themida.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/back-engineering-static-devirtualization-themida.md)

## 摘要

| 字段 | 内容 |
|------|------|
| Title | Static Devirtualization of Themida |
| URL Source | https://back.engineering/blog/09/05/2026/ |
| 来源 | Back Engineering Labs Newsletter |

## 关键要点

- **技术领域**：二进制安全 / 软件逆向工程 / 混淆对抗
- **核心贡献**：提出一种通用静态去虚拟化框架，可跨 Themida、VMProtect 等多种基于虚拟机的代码保护器工作，仅需少量 VM 特定知识
- **评分**：value=9, confidence=9, product=81

## 核心方法论

### 引导式符号执行（Guided Symbolic Evaluation）

Back Engineering Labs 提出的静态去虚拟化方法，其核心思想是将原生 x86/ARM64 指令提升（lift）到一种可变的中间表示（IR），然后通过引导式符号执行（guided symbolic evaluation）驱动整个 lifting 过程向前推进 。

与以往针对 VMProtect 的方案不同，该方法刻意将 VM 特定知识的依赖降到最低，这也是它能够跨多个版本 Themida 以及其他基于虚拟机的混淆器工作的根本原因 。

**BLARE2 引擎**：Back Engineering Labs 维护的自研二进制 lifting 和重编译引擎，支持自定义 SSA IR（AMD64 + ARM64）、完整 pass 系统、优化器、指令选择器、寄存器分配器和链接器 。

### 符号执行的核心机制

lifting 从所有寄存器（除 RSP 外）和标志位均为符号值的状态开始，直到遇到无法确定下一指令指针的控制流指令为止 。若地址无法被具体化（concretize），则说明两种情况：要么优化过程尚未运行充分，要么该分支存在多个真实目标（如虚拟化条件跳转） 。

**Concretizing Stack Pointer**：设计决策——将 RSP 保持为具体值，使加载/存储传播机制自动处理栈访问，栈指针算术运算无需特殊处理即可被常量折叠。代价是不支持动态栈分配（如 alloca），但实践中虚拟化的函数很少使用动态栈分配 。

## 优化 Pass 系统

常量提升与内存建模是整个去虚拟化链条中的第一环 。VM 字节码通过内存加载进入计算图，而常量提升 pass 将这些加载值提升为常量，使周围的解密运算（handler 解密逻辑、opcode 表索引、VPC 更新数学）能够逐步折叠消失，最终暴露出具体的 handler 地址 。

死存储消除（Dead Store Elimination）在此时是安全的，因为消除的 stores 作用域仅限于 VM 私有内存（Themida 专用 section 中的虚拟机构上下文、虚拟栈等），这些内存对原始程序完全不可见 。

### Pass 间的协同效应

这些优化 pass 之间并非独立工作——字节码加载被提升为常量，使周围的解密运算折叠，生成具体的 handler 索引，进而解析 handler 表查找，暴露下一个 handler 地址为常量 。每个 pass 喂养下一个 pass，VM 脚手架作为它们共同收敛的结果而坍缩 。

**完整的 pass 列表**：
1. **Constant Promotion & Memory Modeling** — 字节码加载提升为常量，可配置内存范围策略防止用户数据被意外提升
2. **Constant Folding** — 运行至收敛，每次折叠可能使新的表达式变为常量
3. **Dead Store Elimination** — 安全地移除仅访问 VM-private 内存的 store
4. **Instruction Combination** — 识别代数恒等式，折叠可知结果的操作，剥离 VM handler 中的冗余运算
5. **Branch Folding** — 标志位计算解析为常量后，消除不透明分支目标
6. **VMEXIT Behavior** — 根据 RSP 位移区分 VMEXIT-CALL、VMEXIT-返回原函数 epilog 等类型
7. **Virtualized Control Flow** — 记录所有虚拟指令指针，避免虚拟化循环被错误展开
8. **Dead Dependency Analysis Pass** — 识别被 native 代码 clobber 的寄存器/标志，这些从 VM 视角看是死的
9. **Stack Pointer Rewrite Pass** — 将常量栈地址访问重写为 RSP-relative 形式

## Themida 特有的虚拟化条件跳转

这是少数真正需要 VM 特定知识的场景之一 。在 Themida 的 VJCC handler 中，条件先被求值并将结果写入 `branch_taken_flag`，VIP 直到 handler 末尾才推进 。

这意味着符号执行在 VIP 被解析之前就遇到了分支叉点，两条路径都需要被探索，每条路径的正确 VIP 必须通过 handler 底部的条件 VPC 更新逻辑追踪，而不是从单一加载中读取 。

> **Warning**: 模式匹配 VM handler 不是推荐的方法 。任何对 VM-specific 行为的依赖都会使工具变得脆弱——handler 布局、opcode 表或调度逻辑的小变化可能无声地破坏整个版本范围的工具 。

## 降级（Lowering）阶段

将优化后的 IR 降级回原始 ISA（指令集架构） 。这一阶段涵盖指令选择、寄存器分配、汇编，以及将恢复的代码链接回二进制 。

**关键约束：寄存器压力** 。如果寄存器分配器发生溢出，去虚拟化后的代码会产生自己的栈帧，这会立即导致通过栈传递参数的函数调用被 IDA、Binary Ninja 等反汇编器误读 。

**架构选型**：对于需要还原被虚拟机保护器混淆的二进制代码的场景，作者明确倾向于自研 lifting 框架（如 BLARE2）而非基于 LLVM 的方案 。LLVM 的后端在生成能够干净地重新插入二进制的紧凑行为良好原生代码方面存在固有困难——这是去虚拟化区别于一般二进制订简的特殊约束 。

## 实验结果

去虚拟化后的输出在功能上与原始代码 1:1 等价 。但值得注意的是，后端选择了不同的指令和寄存器，这是寄存器分配器和指令选择器做出不同选择的结果——关键是没有发生寄存器溢出 。

恢复的代码保持与原始代码一样紧凑和干净，没有多余的栈帧或 artifacts 。重要的是，去虚拟化后的代码不仅是结构上相似，而是完全可执行的——恢复的函数可以作为原生代码运行，在反汇编器中干净地加载，行为与原始实现完全相同 。

![原始代码 in IDA（虚拟化前）](https://back.engineering/code-before-virt.png)

![去虚拟化后的代码](https://back.engineering/code-after-virt.png)

**开源仓库**：[themida-devirt](https://github.com/backengineering/themida-devirt) 包含原始二进制、虚拟化后的二进制和去虚拟化后的二进制，可供读者直接检查和比较结果 。

## 对抗符号执行的方向

对于混淆器而言，要阻止符号执行使间接跳转目标永远无法被具体化，一种简单方法是通过带不透明值的 MBA 表达式对其进行编码 。

但这类 MBA 表达式现在已能被现有技术轻易约简（参见 [相关演示](https://www.youtube.com/watch?v=3LtwqJM3Qjg)） 。

更强的技术（如 CodeDefender 在重型保护层级中实现的技术）可从根源上使符号执行变得不可行，但具体细节超出本文范围 。

## 跨混淆器泛化能力

本文技术经少量修改后可应用于多种基于虚拟机的保护器 ：

- **VMProtect**
- **CodeVirtualizer**
- **vmp2**
- **vxlang**
- **EagleVM**
- **covirt**
- **binprotect**

## 深度分析

### 符号执行是去虚拟化的主引擎，而非 VM handler 模式匹配

Back Engineering Labs 方法的核心洞察是：去虚拟化的主要工作量由**通用的编译器级优化 pass** 驱动，而非 VM-specific 的 handler 行为理解 。该方法刻意避免了对 VM handler 进行逆向和模式匹配的做法——作者明确指出自己曾经尝试过 handler 模式匹配，结论是"不scalable"（handler 布局、opcode 表或调度逻辑的小变化可能无声地破坏整个版本范围的工具）。这与许多学术和工程社区的早期路线形成鲜明对比：那些方案通常花费大量精力逆向 VM 架构，然后用启发式规则将 VM handler 反向映射回原生 x86 指令，结果是脆弱且难以维护。该方法的成功在于将"理解 VM"降为最小必要输入，把主要工作量交给 Constant Folding、DCE、Instruction Combination 等通用优化 pass 去完成 。

### Pass 间的协同收敛是 VM 脚手架坍缩的驱动机制

该方法揭示了一个重要的系统思维：VM 脚手架的"坍缩"不是单一 pass 的功劳，而是多个 pass 迭代收敛的结果 。字节码加载被提升为常量 → 解密运算折叠 → handler 索引变为常量 → handler 表查找被解析 → 下一 handler 地址暴露为常量，每个 pass 的输出为下一个 pass 创造条件。这是一个正反馈循环，最终使 VM 的所有控制流和数据流基础设施暴露为常量并被消除。这种"pass 协同收敛"的思想在编译器优化中常见，但将其应用于 VM 去虚拟化的洞察是：VM 的字节码解释器本身也是一种"被优化的程序"，当常量足够多时，整个解释器执行路径都可以被折叠 。

### Themida VJCC handler 是 VM-specific 知识的最后堡垒

尽管该方法总体上最小化 VM 依赖，但 Themida 的虚拟化条件跳转（VJCC handler）是例外：它要求两条符号执行路径同时探索，并需要通过 `branch_taken_flag` 追踪条件 VPC 更新逻辑来确定每个分支的真实 VIP 。这与 VMProtect 的条件跳转处理方式有根本差异——VMProtect 中 VIP 是单一加载值，可以从最后模块加载中直接读取；而 Themida 中 VIP 推进被延迟到 handler 末尾，导致符号执行必须在两条路径上同时推进，直到 flag 被解析。这说明**跨混淆器的通用去虚拟化框架仍然需要为每个混淆器保留少量但关键的控制流处理逻辑**，只是这些逻辑的 scope 被压缩到了最小必要集合 。

### 自研 lifting 框架 > LLVM 的核心原因是"重新插入二进制"约束

作者明确偏好自研 lifting 框架（如 BLARE2）而非基于 LLVM 的方案（如 Remill），原因是：去虚拟化的最终目标不是生成可读的 IR 用于静态分析，而是生成**能够重新插入原始二进制**并在反汇编器中干净加载的原生代码 。LLVM 的后端设计目标是生成高性能的程序代码，它在寄存器分配和指令选择上追求性能而非二进制兼容性——当寄存器分配器溢出时，它会生成一个栈帧，这在一般程序中是正常行为，但在去虚拟化场景下会导致栈传递参数的函数调用被反汇编器完全误读 。自研框架可以精确控制何时触发溢出、何时避免溢出，以及栈帧的布局，而 LLVM 的优化决策对用户不透明。

### 注册压力是降级阶段的核心约束，溢出代价是语义级别的误读

寄存器压力在降级阶段是最需要关注的约束 。一旦寄存器分配器发生溢出，恢复的代码会产生自己的栈帧，这会导致栈传递参数的函数调用被 IDA、Binary Ninja 等反汇编器误读——不是"显示不够清晰"，而是"参数指向完全错误"，使恢复的代码在实践中无法使用。这解释了为什么去虚拟化工具的评估不能只看"还原后的代码结构是否与原始代码相似"，而必须看"恢复的代码是否能够作为原生代码运行并在反汇编器中干净加载" 。

## 实践启示

1. **采用符号执行 + 通用优化 pass 路线，而非 handler 模式匹配路线**。Back Engineering Labs 明确指出模式匹配 VM handler 的方法在可维护性和跨版本支持上存在根本缺陷 。对于需要开发去虚拟化工具的团队，应该将工程投入放在 Constant Folding、DCE、Instruction Combination 等通用优化 pass 上，这些 work 在不同 VM 保护器之间可以复用。只有在控制流处理（如 Themida VJCC handler）时才需要 VM-specific 逻辑。

2. **在 lifting 阶段将 RSP 保持为具体值以简化实现**。这一设计选择意味着不需要编写专门的栈传播逻辑，现有的 load/store 传播机制可以自动处理所有栈访问 。代价是放弃对 `alloca` 和动态栈分配的支持，但实践中虚拟化函数很少使用这些特性。对于需要处理动态栈分配的场景，可以考虑 lifting 阶段保留 RSP 为符号值，并在后续添加栈传播 pass。

3. **实现 Virtualized Control Flow 记录以防止 IR 爆炸**。虚拟化循环如果被错误展开，IR 会指数级增长 。解决方案是：在 lifting 过程中记录所有遇到的虚拟指令指针（VIP），当遇到 backedges 时识别为循环而非继续展开。这对于 Themida 和 VMProtect 等所有基于虚拟机的保护器都是必要的。

4. **将 BLARE2 或 Triton/Remill 作为起点，但预留自研降级后端的投入**。对于想复现该方法的团队 ，Triton 或 Remill 可以提供干净的 IR，是较好的起点。但要达到"生成可重新插入二进制的原生代码"的目标，最终需要一个自研的降级后端来精确控制寄存器分配策略以避免溢出 。建议将整个工作分为"lifting + 优化"（可用现有框架）和"lowering + 重插入"（需要自研）两个阶段分别投入。

5. **通过 GitHub 仓库 themida-devirt 获取 ground truth 验证**。该仓库包含原始二进制、虚拟化二进制和去虚拟化后二进制三个版本 ，可以直接比较输入和输出。建议将其作为开发和调试过程中的质量基准——不仅验证"代码是否看起来正确"，更要验证"恢复的代码是否能在反汇编器中干净加载且行为与原始代码 1:1 等价"。

6. **考虑 MBA 混淆作为对抗符号执行的应对措施**。如果你是混淆器实现者，想对抗符号执行驱动的去虚拟化，简单地使用带不透明值的 MBA 表达式编码间接跳转目标已不再足够（现有技术可以轻易约简）。更强的技术来自 CodeDefender 的重型保护层级——但具体实现超出本文讨论范围。

## 相关实体

- → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/back-engineering-static-devirtualization-themida.md)
- [Static Devirtualization of Themida](https://github.com/QianJinGuo/wiki/blob/main/entities/back-engineering-static-devirtualization-themida.md)（另一版本）
- [Static Devirtualization of Themida](ch12/100-static-devirtualization-of-themida.html)（另一版本）

- [Static Devirtualization 2024](ch12/020-static-devirtualization-2024.html)
- [static devirtualization of themida](ch12/062-cve-2026-20182-unauthenticated-cisco-sd-wan-control-plane-c.html)

---

