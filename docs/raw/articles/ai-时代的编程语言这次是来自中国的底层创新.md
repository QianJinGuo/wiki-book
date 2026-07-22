---
type: source
source_url: https://mp.weixin.qq.com/s/FG_-DEwSw0_ubBE36tMeeA
sha256: 0c2d32e0ae6e28d1478c5d7929f737ba2587697f6e49865849ce946ce7349530
ingested: 2026-07-09
source: 机器之心（微信公众号）
source_title: AI 时代的编程语言，这次是来自中国的底层创新
source_published: 2026-07-09 12:40
review_value: 7
review_confidence: 8
review_stars: 4
---

# AI 时代的编程语言，这次是来自中国的底层创新

> 来源：机器之心 | 微信公众号 | 2026-07-09
> URL：https://mp.weixin.qq.com/s/FG_-DEwSw0_ubBE36tMeeA

MoonBit — 从设计之初就面向 Agent 协作、快速反馈和工程闭环的编程语言，来自中国团队。

## 一、MoonBit 是一条内置"形式化证明"的软件流水线

MoonBit 从设计之初同步构建了编译器、构建系统、包管理器、测试框架、文档工具和 AI 编程助手。这种"语言即工具链"的思路，在 AI 编码时代有直接的工程意义。

核心不是一次性生成代码，而是"生成—编译—诊断—修复—测试"的闭环。MoonBit 的编译器和构建系统一体设计，没有在遗留工具链上打补丁的历史负担，为快速迭代和清晰的诊断信息提供了架构基础。

形式化验证纳入原生工具链：通过定义 Hoare triples 的方式，提供比使用专用形式化证明语言更好的书写体验；AI 可以对代码有选择地证明，同时无需提供完整的证明链条。AI 生成代码的"可检查性"会提升一个台阶：模型写出代码，编译器检查类型，验证器检查性质。

以二分查找为例，MoonBit 可以完整验证（包括整数溢出预防），Java 标准库中同样的 bug 在生产环境运行了近十年才被发现。

## 二、AI原生应用场景：自带沙箱的跨平台部署能力

Wasm 输出：MoonBit 编译成 Wasm 字节码，通过 Mooncakes 包管理分发。Agent 或用户一条命令即可运行。可移植、可嵌入、可隔离。同一份逻辑可进入云函数、边缘节点、浏览器、插件系统、Agent runtime。

原生沙箱模型：每个 Skill（包）可附带策略文件，声明需要的环境变量、允许访问的网络端点。运行时通过 `--experimental-policy` 加载策略后，程序网络访问受约束。资源依赖变成显式、可审计的声明。

已有案例：Crater、Golem Cloud 的 Wasm Component、MoonXi-net（浏览器）、Choir（深度学习框架）、多 Agent 编排。

## 三、AI友好的后发优势

IEEE TSE 论文《No Resource, No Benchmarks, No Problem?》将 MoonBit 和 Gleam 放在"no-resource programming languages"下评测。MoonBit 可见语料约为 Gleam 七分之一，但在 few-shot 和 RAG 上下文学习中提升高于 Gleam。McEval-Hard 上，继续预训练后 MoonBit pass@1 25.86%（Gleam 12.47%），instruction transferring 后 32.60%（Gleam 26.08%）。

Mooncakes（包管理网站）库数量过万，累计下载超 400 万次。

AI 不会去掉工程门槛。生态成熟度、工业验证、开发者心智和长期维护能力，仍然是核心问题。新语言必须同时回答：模型能不能高效学会，生态能不能快速长起来，开发者愿不愿意在真实项目中采用。
