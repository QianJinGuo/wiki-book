# EntryPoint Hijacking

## Ch01.521 EntryPoint Hijacking

> 📊 Level ⭐⭐ | 8.3KB | `entities/entrypoint-hijacking.md`

# "EntryPoint Hijacking"
# EntryPoint Hijacking
Published Time: 2026-05-13T12:25:17+00:00
Markdown Content:
The technique of EntryPoint Hijacking introduces a stealthier approach to code injection, as it doesn't rely on API calls that create a new thread within the process context, and it is independent of the attack chain. Arbitrary code is written to memory, but it executes only when the process legitimately creates a new thread. This enables threat actors to evade EDR defenses and extend their dwell time within the environment.

## Playbook
Windows processes dynamically load multiple modules (DLLs) into memory at runtime. Each module contains a **_DllMain()_**function that the operating system automatically invokes in response to process and thread creation or termination events. The Windows loader function (_**ntdll!Lrdp***_) maintains a record of each DLL loaded, with its properties to manage these invocations, including the **EntryPoint** address. Sophisticated threat actors can overwrite the _EntryPoint_ function of the targeted DLL to redirect the execution flow to attacker-controlled code whenever the loader function calls the _DllMain()_. However, hijacking the _EntryPoint_ introduces challenges for threat actors, such as process stability issues, race conditions and crashes.
[Kurosh Dabbagh Escalante](https://x.com/_Kudaes_) released the [EPI](https://github.com/Kudaes/EPI) (EntryPoint Injection) proof of concept in 2023 and introduced a documented method to abuse the _EntryPoint_ property of a DLL. EPI patches the _EntryPoint_ of a loaded DLL (_kernelbase.dll_) and uses the _QueueUserWorkItem_ from inside the redirected _EntryPoint_. The malicious code is executed on a thread-pool thread. [Hugo Valette](https://x.com/RWXstoned) approached the same technique during x33fcon 2025, and released two proof-of-concepts examples called [LdrShuffle](https://github.com/RWXstoned/LdrShuffle), demonstrating EntryPoint Hijacking within the same and remote processes. It should be noted that _LdrShuffle_ handles the execution differently, even though both proof of concepts hijack the same property.

## 深度分析
EntryPoint Hijacking 之所以被视为高级代码注入技术，是因为它从根本上利用了 Windows 加载器（loader）的正常行为，而非依赖任何专有的恶意 API。整个攻击链不触发 `CreateRemoteThread`、`NtCreateThreadEx` 等常见的线程创建 API，从而绕过了大量基于 API 调用日志的 EDR 检测机制。
**核心机制拆解**
Windows 进程的每个加载 DLL 都拥有一个 EntryPoint 地址，记录在 PEB（Process Environment Block）的 `LDR_DATA_TABLE_ENTRY` 结构中。当进程或线程创建/终止事件发生时，ntdll 的 `LdrpDx` 流程会遍历已加载模块列表，依次调用其 `_DllMain()` 函数。攻击者的关键技术动作分为以下几步：
1. **定位目标 DLL**：通过 PEB → `PEB_LDR_DATA` → `InMemoryOrderModuleList` 遍历已加载模块，找到目标 DLL（如 `kernelbase.dll`）的 `LDR_DATA_TABLE_ENTRY`。
2. **保存原始状态**：在修改前记录 `EntryPoint` 和 `OriginalBase`，确保后续可恢复。
3. **注入恶意代码**：将 shellcode 或恶意 loader 写入进程内存（通常为 `VirtualAlloc` 分配的 private heap）。
4. **篡改 EntryPoint**：将 `pDte->EntryPoint` 指向攻击者控制的代码地址。
5. **触发执行**：等待下一个线程创建事件，loader 自动调用被篡改的 EntryPoint，shellcode 在合法线程上下文中执行。
6. **恢复现场**：执行完毕后迅速将 `EntryPoint` 恢复为原始地址，防止进程崩溃。
这一设计使得检测极为困难——因为攻击窗口极短（EntryPoint 被篡改到恢复之间可能仅几百毫秒），EDR 的周期性内存扫描很难捕获。
**两种 PoC 的实现差异**
EPI（LdrShuffle）和 EPI（Kurosh Dabbagh Escalante）虽然都利用 `EntryPoint` 属性，但实现路径不同：

- **EPI（Kurosh）**：patch `kernelbase.dll` 的 EntryPoint，从被篡改的入口调用 `QueueUserWorkItem`，将恶意逻辑调度到线程池线程执行。loader 执行阶段使用线程池而非新建线程，有助于逃避基于新线程创建的检测。
- **LdrShuffle（Hugo Valette）**：支持同进程和跨进程注入，使用 `Runner()` helper 在 heap 中传递执行参数和函数指针。i>5 的 DLL 跳过逻辑用于规避前 5 个系统关键 DLL 的篡改，以维护进程稳定性。
两种实现都涉及 `DontCallForThreads == 0` 配置——该标志控制是否允许线程相关调用。若设为 1，所有线程操作被阻断，任何复杂 API（如 `InternetOpenW`）都会触发死锁。因此，涉及 C2 通信的代码必须在独立线程中运行。
**技术本质总结**
EntryPoint Hijacking 的本质是"滥用 Windows 加载器的正常调度机制"。它将恶意代码植入已有进程内存，并利用进程自身创建线程的事件触发执行，完全避开了"新建线程=可疑"的传统检测范式。这是一种典型的" living off the land"攻击变体，依赖系统合法组件完成攻击目标。

## 实践启示
**对于红队（Red Team）**

- EntryPoint Hijacking 非常适合在高度监控环境中建立持久化，因为它不依赖异常 API 调用，不会在传统的进程行为监控中产生明显信号。
- 跨进程注入时（如 LdrInject），需要确保目标进程的 DLL 加载顺序稳定，避免因 DLL 版本或加载时机不同导致.EntryPoint 寻址失败。
- 实施前需评估目标进程的稳定性——高频创建线程的进程（如浏览器）可能因为 EntryPoint 被频繁调用而导致 race condition 或崩溃风险升高。
- 建议在实验环境中测试 `DontCallForThreads` 配置，避免死锁。
**对于蓝队（Blue Team）和 SOC**

- **短期**：在 Sysmon Event ID 10（Process Access）中关注 `GrantedAccess == 0x143A`（`PROCESS_VM_READ | PROCESS_VM_WRITE | PROCESS_VM_OPERATION`）的可疑 handle 开启行为，结合该进程的外向网络流量进行关联分析。
- **中期**：部署类似 `LdrShuffleDetect` 的主动检测工具，每 10 秒对高价值进程（lsass、浏览器、Office、EDR 自身）进行快照，检测三项核心条件：EntryPoint 地址是否超出 DllBase 范围、内存类型是否从 MEM_IMAGE 变为 MEM_PRIVATE、OriginalBase 是否为堆指针。
- **长期**：将 EntryPoint Hijacking 纳入 purple team 演练清单，验证现有 EDR 是否能通过行为关联（而非单一 API 检测）识别此类攻击。建议组织进行年度 MITRE ATT&CK T1055（Process Injection）变体演练，确保检测覆盖度与时俱进。
**通用建议**
代码注入技术的检测已从"监控恶意 API"向"完整性校验 + 行为关联"演进。EntryPoint Hijacking 的短窗口特性意味着：没有持续性内存监控能力的 EDR 将难以检测，组织应评估自身 EDR 的进程内存完整性检测能力，并将此类高级注入技术纳入检测规则迭代规划中。
## 相关实体
- [Entrypointhijacking](https://github.com/QianJinGuo/wiki/blob/main/entities/entrypointhijacking.md)
- [Entrypointhijacking](https://github.com/QianJinGuo/wiki/blob/main/entities/entrypointhijacking.md)
- [Npm Supply Chain Compromise Postmortem](ch04/069-ai.md)
- [How We Built Cognitive Memory For Agentic Systems](ch03/045-agent.md)
- [Stripe Sessions 2026 Ai Agents](ch04/328-stripe-sessions-2026-ai-agents.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/entrypoint-hijacking.md)

---

