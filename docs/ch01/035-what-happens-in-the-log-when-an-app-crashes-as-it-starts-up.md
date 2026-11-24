# What happens in the log when an app crashes as it starts up?

> 📊 Level ⭐⭐ | 11.0KB

## 核心要点

Practical and specific macOS debugging guide from a trusted source, with actionable techniques and concrete error codes for diagnosing startup crashes.

## 深入分析

> 来源：[原文存档](https://eclecticlight.co/2026/05/29/what-happens-in-the-log-when-an-app-crashes-as-it-starts-up/)

本篇来自 TLDR AI Newsletter 推荐。

### 错误码语义：从码表反推具体缺陷

日志最有诊断价值的产出之一是签名验证返回的错误码本身。原文整理的常见错误码表中，-67062（代码完全未签名）最为常见；-67030 表示 Info.plist 或签名被修改过，-67054 指向某个 sealed 资源缺失或失效，-67021 则对应嵌套代码被改动。这些码的粒度足够细，能把"签名坏了"缩小到具体缺陷类别：作者仅改动 Info.plist 里的一个字符，破坏了 CDHashes，日志便准确报出 -67030。掌握这张对照表后，看到错误码即可直接反推排查方向——重新签名、修复 plist，还是检查资源文件。

### 日志的多进程接力叙事

启动崩溃日志在结构上是一份多进程接力记录：Finder 报告双击动作，syspolicyd 与 trustd 先行发起签名验证，lsd 反复抛出同一个错误码，launchservices 随后给出更详细的错误描述，amfid 再次独立验证一遍，最后由内核执行裁决并以 `kernel ASP: Security policy would not allow process` 收尾。同一个错误在链条上被多个子系统重复确认，由此可得两个推论：单看某一层的一条记录容易误判，必须读完整链条才能定位失败真正发生在哪一层；各条目的"证词"来自不同进程视角，交叉比对能还原出比任何单条记录都完整的故障图像。

### 可观测性的不对称分布

四种常见崩溃原因在日志中留下的痕迹量差异极大，这决定了取证策略必须分层。代码签名错误和 translocation 由系统组件多层记录，几乎不可能漏掉；偏好设置问题只有在应用使用标准 `cfprefsd` 机制时才有 XPC 连接与 Loading Preferences 条目可循，而使用自定义偏好机制的应用（`cfprefsd` 与 `defaults` 命令均不覆盖）几乎不留任何痕迹；文档打开失败最隐蔽，唯一知道真相的进程是应用自身，第三方应用又很少往日志写入有用信息。换言之，日志的可观测性由"谁负责记录"决定：系统层故障天然自带证人，应用内部故障则依赖开发者自己的日志意识，痕迹稀薄的类型只能靠排除法间接推断。

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

