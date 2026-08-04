# EntryPoint Hijacking

## Ch01.077 EntryPoint Hijacking

> 📊 Level ⭐ | 7.4KB | `entities/entrypointhijacking.md`

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/entrypointhijacking.md)

## 摘要
EntryPoint Hijacking（入口点劫持）是一种不依赖任何线程创建 API 的隐蔽代码注入技术：攻击者将恶意代码写入目标进程内存后并不立即执行，而是篡改某个已加载 DLL 的 EntryPoint 属性，等待进程"合法"创建新线程时由 Windows 加载器自动触发。由于整条攻击链不调用 CreateRemoteThread 等常见恶意 API，且 EntryPoint 在触发后会迅速恢复，该技术能有效规避 EDR 检测并延长驻留时间。

## 核心要点
- **攻击面**：Windows 加载器通过每个 DLL 的 EntryPoint 属性识别并调用 _DllMain()；攻击者覆写该属性（如 kernelbase.dll）即可将执行流重定向到恶意代码。
- **触发机制**：恶意代码不主动执行，而是等待进程正常创建新线程时由 loader 自动调用，全程无"新建线程"痕迹，且独立于攻击链。
- **代表性 PoC**：EPI（Kurosh Dabbagh Escalante，2023）patch kernelbase.dll 的 EntryPoint，经 QueueUserWorkItem 在**线程池线程**执行；LdrShuffle（Hugo Valette，x33fcon 2025）支持同进程与跨进程注入——两者劫持同一属性但执行路径不同。
- **稳定性工程**：LdrShuffle 以 i>5 跳过前五个系统关键 DLL、执行后立即恢复 EntryPoint、并用 Runner() 在堆上传递参数，规避进程崩溃、竞态与死锁。
- **检测难点**：EntryPoint 被篡改后立刻复原，EDR 的定时内存扫描只能命中极短的劫持窗口。
- **有效检测**：组合完整性校验——对比 OriginalBase 与 DllBase、监控 EntryPoint 内存类型从 MEM_IMAGE 变为 MEM_PRIVATE、校验 OriginalBase 是否为堆指针。
- **行为指标**：Sysmon Event ID 10 中 GrantedAccess 含 0x143A（PROCESS_VM_READ|WRITE|OPERATION）的句柄请求，关联对应进程的出站流量。

## 深度分析
### 技术原理：把加载器的正常机制变成武器
Windows 进程运行时动态加载多个 DLL，加载器（ntdll!Ldrp）维护每份已加载模块的记录（PEB 的 LDR_DATA_TABLE_ENTRY），其中包含 EntryPoint 地址；当进程或线程创建、终止事件发生时，loader 会依据该记录调用对应模块的 _DllMain()。攻击者的关键动作是覆写目标 DLL 的 EntryPoint，把执行流重定向到攻击者控制的代码——恶意代码因此搭上进程"合法创建新线程"的顺风车被执行，而不是由攻击者显式创建线程。

劫持 EntryPoint 并非没有代价：直接篡改会带来进程稳定性问题、竞态条件与崩溃风险，因此实现必须精雕细琢。LdrShuffle 的 RestoreLdr() 遍历 PEB 加载器结构，把 EntryPoint 与 OriginalBase 恢复为备份值；DontCallForThreads == 0 是允许线程相关调用的布尔开关，若置 1 则线程操作被阻断，任何复杂 API（如 InternetOpenW）都会因线程同步问题触发死锁——接收 C2 回调的 API 因此必须在独立线程中运行。

### 两条实现路线：EPI 与 LdrShuffle 的分野
两个公开 PoC 劫持同一 EntryPoint 属性，但执行机制不同。EPI 分配内存并写入 loader（负责解密、分配并运行 shellcode），patch 目标进程的 PEB 后利用进程线程池执行，loader 完成后恢复 PEB 原状，避免新线程指向 shellcode 从而规避检测；LdrShuffle 则以 Runner() 辅助程序完成 API 调用，执行参数与函数指针存放在堆上的 DATA_T 结构（含 runner、bakEntryPoint、bakOriginalBase、event、ret、args 等字段），并支持通过 LdrInject 向远程进程注入 shellcode。iPurple 团队的复刻版本用 NtQueryInformationProcess 获取目标进程 PEB 地址后，同样 patch kernelbase.dll 的 EntryPoint。

### 检测：为什么点状扫描失效，完整性校验才是出路
由于 EntryPoint 会被迅速恢复，EDR 的点状内存扫描只有在恰好命中劫持窗口时才能发现问题，可靠检测必须做组合拳：一是完整性校验，对比 OriginalBase 与 DllBase，二者不一致即说明入口点被篡改；二是内存属性监控，检测 EntryPoint 所在内存从 MEM_IMAGE (0x1000000) 变为 MEM_PRIVATE (0x20000)——表明 shellcode 正在私有堆中运行；三是校验 OriginalBase 的合法性（例如是否为堆指针）。文章给出的 LdrShuffleDetect 用 CreateToolhelp32Snapshot 枚举进程快照，再以 ReadProcessMemory 从 PEB 一路读取 LDR_DATA_TABLE_ENTRY 并持续监视 EntryPoint，每 10 秒对全进程扫描一次，已成功检出 LdrShuffle、EPI 与 iPurple 私用工具的劫持尝试；命中条件按严重度分级（三项全挂 Critical、OriginalBase 为堆指针 High、内存不在 image 区 Medium 等）。

### 检测体系的演进方向
文章的核心结论是：EDR 不应再追逐恶意软件常用的 API 名单，而应关联多个行为来识别 EntryPoint 属性的篡改——例如把 Sysmon Event ID 10 中 GrantedAccess=0x143A 的句柄开启行为与进程的出站流量做关联分析。同时，组织应将 EntryPoint Hijacking 纳入 purple team 操作清单，验证现有 EDR 部署能否有效检出；若缺乏该能力，可复制检测 PoC 部署到多个端点并将日志转发至 SIEM，在初始访问阶段尽早发现威胁，缩小入侵爆炸半径。

## 实践启示
1. **Purple Team 演练**：将 EntryPoint Hijacking 加入操作清单，用 EPI / LdrShuffle / LdrInject 对 lsass、浏览器、Office、EDR 自身等高价值进程做注入测试，验证 EDR 能否靠行为关联而非单一 API 规则检出。
2. **部署完整性检测**：在关键端点部署 LdrShuffleDetect 或其变种，按 10 秒周期扫描并告警，规则覆盖三项条件——EntryPoint 超出 DllBase 范围、内存类型 MEM_IMAGE→MEM_PRIVATE、OriginalBase 非法（如堆指针）。
3. **SIEM 关联分析**：监控 Sysmon Event ID 10 中 GrantedAccess=0x143A（PROCESS_VM_READ | PROCESS_VM_WRITE | PROCESS_VM_OPERATION）的句柄请求，并与对应进程的出站网络流量做时间关联，作为早期预警信号。
4. **蓝队纵深防御**：攻击者的执行仍依赖进程正常功能（QueueUserWorkItem、线程池），因此限制进程权限、收紧句柄访问掩码、监控异常内存分配，可缩短攻击者的可用操作窗口。
5. **规则迭代方向**：放弃"仅封禁 CreateRemoteThread"式的旧规则，转向 PEB 完整性持续监控 + 内存属性变更检测 + WriteProcessMemory 调用上下文关联的组合式检测策略。
6. **红队实施提示**：涉及 C2 回连的 API 必须在独立线程中运行（DontCallForThreads 配置下复杂 API 会死锁），且 EntryPoint 必须用后即恢复，否则目标进程崩溃会暴露行踪。

## 相关实体
> [主题导航](https://github.com/QianJinGuo/wiki/blob/main/moc/cybersecurity-privacy.md)

- [EntryPoint Hijacking](ch01/077-entrypoint-hijacking.html)
- [安全态势全景](https://github.com/QianJinGuo/wiki/blob/main/moc/security-landscape.md)
- [Cilium Tetragon：eBPF 运行时安全](ch01/1266-rag.html)

---

