# What happens in the log when an app crashes as it starts up?

> 📊 Level ⭐⭐ | 13.1KB

## 核心要点

Practical and specific macOS debugging guide from a trusted source, with actionable techniques and concrete error codes for diagnosing startup crashes.

## 深入分析

> 来源：[原文存档](https://eclecticlight.co/2026/05/29/what-happens-in-the-log-when-an-app-crashes-as-it-starts-up/)

本篇来自 TLDR AI Newsletter 推荐。

### 崩溃瞬间的日志子系统解剖

以签名验证失败为例，从双击到内核裁决的全部发言被压缩在约 110 毫秒内（00.940943 → 01.053627）：Finder 记录动作后，syspolicyd 发起 SecTrustEvaluateIfNecessary 策略评估，trustd 执行 SecKeyVerifySignature 密码学验证，lsd 以同一错误码反复报错，launchservices 给出带架构细节的正式错误描述，amfid 再独立复验一遍，最后由内核 AMFI 做出裁决。结构性事实是：应用代码从未获得运行机会——内核在 hook..execve 阶段直接杀死 xpcproxy，整条故障叙事完全由系统守护进程书写。因此对签名类崩溃取证，应在系统进程名下检索条目，而不是到应用名下找日志。

### 同一缺陷的三层编码：错误码、内核错误号与进程控制语义

日志里的数字是三层并行编码，混读必然误诊。第一层是签名验证错误码（-67030、-67054、-67062 等），出自 securityd/lsd/amfid，粒度最细，对照码表即可反推缺陷类别；-67062（完全未签名）最常见，-2147409652 指证书被吊销，-67007/-67013 表示 envelope 过时，可见码表横跨签名格式与证书生命周期两族缺陷。第二层是内核内部错误号（load code signature error 4、MACF policy: 1），只表达策略拒绝这一事实，不解释原因。第三层是进程控制语义：被 hook..execve 杀死的是 xpcproxy 而非应用本体，最终落到 Security policy would not allow process 的终局。同一个"改了 Info.plist 一个字符"的缺陷，amfid 层先报 -67030，随后又报 -420（签名无效），码值不同却指向同一处 CDHashes 破坏。正确读法是先用第一层定位缺陷类别，再用第二、三层确认系统确实因此拒绝执行；拿内核错误号去查码表是方向性错误。

### 从日志条目回溯根因的五步取证链

原文实践可提炼为一条五步取证链。第一步锚定时间窗口：时钟显示秒数，约 45 秒选中应用、00 秒整双击、至少 5 秒不碰键鼠，LogUI 新窗口会预设起始时间。第二步定位锚点：双击在日志中表现为四条几乎相同的 softball sendAction 条目，第四条之后的第一条记录即崩溃链起点。第三步按词汇指纹归入故障家族：出现 SecTrustEvaluate/SecKeyVerifySignature 属签名类，出现 SecTranslocateCreateSecureDirectoryForURL 与 AppTranslocation 长路径属 translocation 类，出现 com.apple.cfprefsd.daemon/agent 的 XPC 连接属偏好类，三者皆无则大概率是文档打开失败。第四步用工具栏右侧 Messages/Processes 菜单按应用名过滤，收窄条目集。第五步追到 kernel ASP: Security policy would not allow process 终局行确认裁决确实发生，再回码表把错误码翻译成可执行的修复动作。链条要害在双端确认：起点锚在用户动作，终点锚在内核裁决，中间各层互为印证，只看单层极易误判。

### 可观测性的不对称分布与分层取证策略

四种崩溃原因在日志中的痕迹量呈极端不对称，这决定取证顺序必须分层。签名错误与 translocation 由系统组件多层记录，几乎不可能漏看；偏好设置问题只有在应用走标准 cfprefsd 机制时才有 XPC 连接与 Loading Preferences 条目可循，而使用自定义偏好机制的应用 cfprefsd 与 defaults 均不覆盖，几乎不留任何痕迹；文档打开失败最隐蔽，唯一知道真相的是应用自身，第三方应用又很少往日志写入有用信息。背后的规律是可观测性由"谁有义务记录"决定：系统层的失败自带证人，应用内部的失败只能依赖开发者自己的日志意识。对痕迹稀薄的类型则反向走排除法：先排除签名、translocation、偏好三类，余下假设借助崩溃报告而非日志验证。

## 扩展内容

当 macOS 应用在启动时崩溃，日志记录了从点击到崩溃的完整链条。理解这条链条是诊断的关键起点。 

### 日志捕获的时间窗口技巧

文章作者 Howard Oakley 提出的核心方法是利用菜单栏时钟的秒数来精确捕获日志。具体步骤是：先将时钟设置为显示秒数，然后在秒数接近 45 时选中应用，等秒数到达 00 时双击打开应用（但不能提前），之后至少 5 秒内不触碰鼠标或键盘，等待崩溃发生并显示通知或崩溃日志。这个技巧的价值在于为 LogUI 等日志工具提供了一个预设的起始时间点，可以直接提取崩溃前后 5 秒的日志条目，而无需手动计算时间范围。这种方法的精确度来自于 macOS 日志系统的时间戳机制——每个条目都带有精确到毫秒的时间戳，使得双击操作本身在日志中呈现出四个几乎相同的 `AppKit Finder sendAction:` 条目（用软球 emoji 标记），这成为定位崩溃时间窗口的天然锚点。

### 代码签名错误的级联验证链

代码签名验证失败是启动崩溃中最容易从日志识别的类型之一，因为整个验证过程呈现为一条清晰的多阶段级联链。当双击应用后，日志首先记录对签名的调用（`SecTrustEvaluateIfNecessary` → `SecKeyVerifySignature`），然后在 `lsd` 进程中重复出现同一个错误码多次（如 `-67030`），接着在 `launchservices` 中以更详细的方式报告，最后由 AMFI（Apple Mobile File Integrity）再次确认并由内核执行最终裁决。整个链条以 `kernel ASP: Security policy would not allow process` 结束，表明内核安全策略直接阻止了该进程执行。这个级联结构意味着，仅凭单个错误码（如 -67030）无法判断问题的根本原因——必须追踪整个链条才能确定是哪一层的验证失败。在实践中，作者修改了 Info.plist 中的单个字符，导致 CDHashes 变化，引发了 -67030 错误，这表明即使是微小的配置文件损坏也可能导致整个签名验证链失败。

### 应用 translocation 的双重证据模式

与应用 translocation（ translocation）相关的崩溃呈现独特的日志模式，需要同时找到两类证据：创建易职 translocation 目录的进程，以及应用实际从该 translocation 位置运行的证据。日志中的关键线索是 `/private/var/folders/.../AppTranslocation/` 路径的出现——这是一个由 macOS 自动创建的安全隔离目录，用于限制从互联网下载的应用对系统资源的访问。当应用被 translocation 后，其实际运行路径变为这种长路径格式，而正常的应用运行路径则直接指向 `/Applications/` 或用户目录。日志中的 `com.apple.runningboard _executablePath` 条目会明确显示应用的可执行文件路径，如果该路径包含 `AppTranslocation` 字符串，则表明 translocation 正在发生。这个双重证据模式的重要性在于，仅找到 translocation 目录创建记录并不足以证明 translocation 是崩溃的直接原因——必须同时确认应用确实从该路径被执行。

### 偏好设置问题的 XPC 连接追踪

对于涉及偏好设置文件（Preferences）的启动崩溃，日志追踪的核心是观察应用与 `cfprefsd`（Core Foundation Preferences Daemon）之间的 XPC 连接建立过程。在正常启动中，日志会显示两条平行的 XPC 连接建立记录：一条指向 `com.apple.cfprefsd.daemon`（系统级偏好设置），另一条指向 `com.apple.cfprefsd.agent`（用户级偏好设置）。当应用加载偏好设置时，会记录 `Loading Preferences From User CFPrefsD` 和 `Loading Preferences From System CFPrefsD` 两条条目。崩溃通常发生在这些条目出现后不久，表明问题与偏好设置文件的读取或解析有关。值得注意的是，作者指出对于使用自定义偏好设置机制的应用（不通过 `cfprefsd`，也不被 `defaults` 命令覆盖），日志中几乎不会留下任何有用信息，这使得这类问题的诊断更加困难。

### 文档打开失败：最隐蔽的崩溃类型

在四种常见的启动崩溃原因中，"Failed to open document"（文档打开失败）是最难在日志中找到证据的类型。这是因为唯一知道发生了什么错误的进程是应用本身，而第三方应用通常不会向日志写入有意义的信息。与代码签名错误（整个系统多层验证）或 translocation（操作系统明确记录路径转换）不同，文档打开失败完全依赖于应用自身的日志记录意识。这意味着对于缺乏良好日志实践的应用，诊断工具只剩下交叉验证法：通过排除其他三种更明显的崩溃原因来间接推断问题所在。在 LogUI 中，可以通过将工具栏右侧的菜单设置为 **Processes**，然后在搜索框中输入应用名称来过滤相关条目——但即使这样做，许多情况下也不会有任何有用的信息出现。

## 实践启示

1. **用时钟秒数法固定采样窗口**：菜单栏时钟显示秒数，秒数约 45 时选中应用、秒数到 00 时双击，随后至少 5 秒不碰键鼠；LogUI 新窗口会把起始时间预设为打开应用的时刻，直接提取 00 秒起 5 秒内的条目，无需手算时间范围。

2. **以 softball emoji 条目为检索锚点**：双击在日志中表现为四条几乎相同的 `AppKit Finder sendAction:` 条目，第四条之后的第一条记录就是崩溃链条的起点；找不到时把 LogUI 工具栏右侧菜单切到 Messages 或 Processes，按应用名过滤。

3. **见到签名错误码先查码表再下结论**：-67062（完全未签名）最常见，-67030 指向 Info.plist 或签名被改，-67054 是 sealed 资源缺失；但单个错误码只说明缺陷类别，要继续追到 `kernel ASP: Security policy would not allow process` 这行最终裁决，才能确认问题出在哪一层验证，避免只凭 lsd 层的重复报错就动手修复。

4. **判定 translocation 需凑齐双重证据**：既要找到 `SecTranslocateCreateSecureDirectoryForURL` 的目录创建记录，也要确认应用确实从 `/private/var/folders/.../AppTranslocation/` 长路径运行（看 runningboard 的 `_executablePath` 条目）；只有创建记录不足以认定它是崩溃原因。

5. **偏好设置崩溃盯紧 cfprefsd 的 XPC 连接**：按时间顺序确认 `com.apple.cfprefsd.daemon` 与 `com.apple.cfprefsd.agent` 两条连接建立、`Loading Preferences From User/System CFPrefsD` 条目出现后随即崩溃，即可锁定偏好文件读写环节；若应用使用自定义偏好机制，不要在日志里浪费时间。

6. **对"最安静"的崩溃类型用排除法**：文档打开失败几乎不在日志留痕，先用 Processes 过滤确认不是签名、translocation、偏好这三类，再回头检查应用能否打开同类文档（损坏或不兼容），必要时借助崩溃报告而非日志取证。

## 相关实体
- [Reasoning Lift](https://github.com/QianJinGuo/wiki-public/blob/main/entities/reasoning-lift.md)
- [Rajveerbachkaniwalacom Blog 2026 05 24 On The Difficulty Of Pasting A Pic](https://github.com/QianJinGuo/wiki-public/blob/main/entities/rajveerbachkaniwalacom-blog-2026-05-24-on-the-difficulty-of-pasting-a-pic.md)
- [Brethorstingcom Blog 2026 05 Domain Expertise Has Always Been The ](https://github.com/QianJinGuo/wiki-public/blob/main/entities/brethorstingcom-blog-2026-05-domain-expertise-has-always-been-the-.md)
- [Kristoffit Blog Fix Your Asserts](https://github.com/QianJinGuo/wiki-public/blob/main/entities/kristoffit-blog-fix-your-asserts.md)
- [Seangoedeckecom Build Agents Not Pipelines](https://github.com/QianJinGuo/wiki-public/blob/main/entities/seangoedeckecom-build-agents-not-pipelines.md)

## 相关主题

- [原文存档](https://eclecticlight.co/2026/05/29/what-happens-in-the-log-when-an-app-crashes-as-it-starts-up/)

---

