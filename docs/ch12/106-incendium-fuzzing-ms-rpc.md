# Incendium Fuzzing Ms Rpc

## Ch12.106 Incendium Fuzzing Ms Rpc

> 📊 Level ⭐⭐ | 4.1KB | `entities/incendium-fuzzing-ms-rpc.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/incendium-fuzzing-ms-rpc.md)

# Incendium MS-RPC Fuzzing
Incendium: Microsoft RPC 接口深度模糊测试，漏洞发现方法论

## 摘要
[](/) [Remco van der Meer](/) Ethical Hacker, Security researcher

## 深度分析
Incendium 项目展示了 MS-RPC 模糊测试的方法论演进：通过递归式结构填充处理嵌套结构、通过 Union 类型识别处理 discriminant + arm 的复杂类型、以及用 ETW 替代 Process Monitor 实现全自动化。该研究最终发现了可从普通用户权限 Escalate 到 `NT AUTHORITY\SYSTEM` 的 privilege escalation 路径。
**递归模糊的核心设计**：三个函数 `New-FuzzedInstance` / `Get-FuzzFieldValue` / `New-NdrEmbeddedPointerValue` 形成 mutually recursive loop，通过 `$Depth` counter（上限 8）和 `$Visited` type set 双重 guard rail 防止无限递归，同时正确处理 NDR 两种数据布局——embedded（inline struct）和 pointer（deferred `NdrEmbeddedPointer<T>`）。这是对 MS-RPC 复杂类型系统的系统性覆盖。
**Union type 处理的关键洞察**：NDR marshaler 严格依赖 discriminant 字段决定序列化哪个 arm。如果 discriminant 与 populated arm 不匹配，会抛出 `No matching union selector` 错误。研究者采用保守策略：在 struct 内发现 Union_N 字段时，将所有 preceding integer-like 字段都设置为选中的 arm index。缓存复用场景下，含 Union 的类型必须用 `New-FuzzedInstance` 重新生成而非从缓存读取，否则 discriminant 可能与新上下文不匹配导致 marshal 失败。
**ETW 替换 ProcMon 的工程价值**：传统 ProcMon 需要独立的 GUI 工具，增加了模糊测试的复杂度。通过 `SyscallMonitor.cs` 直接调用 `StartTraceW` / `EnableTraceEx2` / `ProcessTrace` 的原生 ETW API，并使用 raw `EVENT_RECORD` 指针（在 managed `System.Diagnostics.Eventing` 中不可用），实现了完全自包含的终端内监控，包括高权限账户（S-1-5-18/19/20）syscall 实时告警。

## 实践启示
1. **模糊测试嵌套结构时实现递归遍历**：不要只填充顶层字段，对每个复杂类型字段递归调用 fuzzing 函数，同时用深度上限和类型访问记录防止无限递归和循环引用。
2. **Union 类型必须配套处理 discriminant**：不只是随机选 arm，还要设置 preceding integer fields 为对应 discriminant 值；在缓存复用场景下，对含 Union 的类型要强制重新生成。
3. **用 ETW 替代 GUI 监控工具**：在 fuzzing 场景中，ProcMon 这类 GUI 工具不适合集成到自动化 pipeline。ETW 提供纯 programmatic 的 kernel-level 追踪能力，适合 headless 环境。
4. **关注 RPC 接口的 privilege escalation**：MS-RPC 接口往往以高权限服务运行，本研究展示了用户输入如何通过 RPC 调用链到达 `system` 级别操作——这是横向移动和权限提升的经典路径。
5. **Canary + ETW 实时告警组合**：在 fuzzing 时使用可识别前缀（`incendiumrocks_`）作为 canary，配合 ETW 实时监控 file/registry 操作，实时捕获哪些 RPC 程序/端点触发了哪些路径，是高效缩小攻击面的方法。

## 相关资源
- [Agent Memory 架构](../ch04/394-perplexity-brain-self-improving-agent-memory-architecture.html)
- [Claude Managed Agents 开发者指南](../ch04/630-claude-managed-agents.html)
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/incendium-fuzzing-ms-rpc.md)

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/security-landscape.md)

---

