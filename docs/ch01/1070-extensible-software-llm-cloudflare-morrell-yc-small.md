# 可扩展软件（Extensible Software）：LLM 时代的软件形态——Cloudflare Morrell 与 YC Small Software

## Ch01.1070 可扩展软件（Extensible Software）：LLM 时代的软件形态——Cloudflare Morrell 与 YC Small Software

> 📊 Level ⭐⭐ | 5.9KB | `entities/extensible-software-llm-era-cloudflare-morrell-small-software-2026.md`

# 可扩展软件（Extensible Software）：LLM 时代的软件形态——Cloudflare Morrell 与 YC Small Software

## 核心命题

LLM 让「写代码」成本趋零，软件形态从「发布那天就定稿的静态 Web 软件」转向**可扩展软件（Extensible Software）**：用户用自然语言描述需求，AI 生成代码挂到软件预留的扩展点上运行。真正的门槛不是让 AI 写出代码，而是**决定这段代码能碰到什么**。

## 两条约束与 Small Software

过去二十年产品经理的死结：开发者只做服务最大用户群的功能，且界面复杂度有上限——受众只有几百人的功能会拖累几百万人的产品。vibe coding 让「只服务一个人或一小撮人」的**小软件（Small Software，YC 的 Pete Koomen 提法）**成本低到不值一提，会计、医生、律师等数千种职业都可拥有自己趁手的工具。结论是：想让更多人用上智能体，别指望把他们变成工程师，**该动的是软件**。

## 让陌生代码跑起来的五道关

写扩展的成本归零后，收扩展的地方还没有。Morrell 列出运行用户代码的**五道关**：

1. **钱**：百万用户各挂几行代码，不能每人开容器。标准是代码未调用时成本≈0，调用一次价格压到几分之一美分；单台机器能塞多少用户全看内存开销。
2. **冷启动**：用户代码在响应关键路径上，起容器理想值是个位数毫秒。
3. **限额**：CPU/内存/网络请求数/请求大小/返回内容/日志速率每一项都得卡死上限（Heroku 死循环打印 hello world 的经典事故）。
4. **隔离（两层）**：崩溃不能影响他人；恶意代码不能逃逸、不能窥探其他租户，还得防 Spectre 类推测执行攻击。
5. **代码要真能做事**：什么都碰不到的代码没有用。

## 三代委托模型：API 密钥 → Proxy → Capability

- **第一代 直接给 API 密钥**：灵活但危险——拿到密钥的代码可 POST 给第三方，也能拿你基础设施去 DoS。
- **第二代 中转层（proxy）**：用户拿到不透明令牌，代理验完换真凭据再转发，顺带白名单+限流。比裸奔强但维护代价高——收窄权限要在代理里写过滤逻辑并随上游 API 演进持续改，且几乎不可能想全用户行为。
- **第三代 能力（capability）**：不给钥匙不给地址，直接递一个现成函数（如「把那封已批准的邮件取回来」），凭据从头到尾没进用户代码的地盘。附带好处：TypeScript 能力定义丢给 LLM 比 OpenAPI JSON 更省 token 更准。**真正的门槛是决定代码能碰到什么。**

## 四条隔离路线

1. **嵌入式解释器**：Lua、QuickJS 或自造。
2. **V8 Isolates**：直接复用 Google 的 V8 安全加固——Cloudflare Dynamic Workers、Node isolated-vm、Rivet secure-exec。
3. **MicroVM**：砍掉 USB/显卡/磁盘模拟，只留骨架，隔离最硬、能跑二进制、有完整 POSIX，代价开销大——Firecracker、libkrun。
4. **WASM + WASI**：安全起点最漂亮（权限全靠宿主显式授予），代价工具链复杂。

四者不是互相替代：WASM 可跑在 V8 Isolates 或 MicroVM 里；MicroVM 在编译打包、测试扩展环节照样有用。

## Sandstorm.io 的回归：Cloudflare OS

十年前 Cloudflare Workers 技术负责人 Kenton Varda 的 Sandstorm.io 主张「每份文档跑在自己沙箱里，不发钥匙只发能力」，因「没人有耐心手工打包软件」而失败。2026-08-05 Cloudflare 以 Apache 2.0 重新开源为 **Cloudflare OS**，Varda 称「差不多是我那个秘密十年大计的集大成」——当年缺的那份耐心，AI 补上了。

## 平台侧的分工与治理

OpenAI《Codex as a Platform》开源智能体框架讲的是同一件事：把智能体嵌进用户本来在用的软件里，界面/业务上下文/工具/审批边界归应用方，智能体循环和沙箱执行归框架。当公司鼓励员工 vibe coding 做工具，几百上千个应用谁来维护、数据访问边界谁定、token 如何轮转、GDPR 怎么办——Morrell 的答案是：给员工一个**根本没有令牌可泄露的地方去部署**，数据访问交给平台团队统一兜底合规。产品经理的活儿随之改变：不必覆盖长尾需求，但必须设计稳定的扩展点、能力接口与长期兼容性承诺。

## 相关概念

- [Vibe Coding 范式](https://github.com/QianJinGuo/wiki/blob/main/concepts/vibe-coding-paradigm.md)
- [Karpathy 软件 3.0](../ch04/298-agentic.html)
- [Erik Schluntz Vibe Coding in Production](https://github.com/QianJinGuo/wiki/blob/main/entities/erik-schluntz-vibe-coding-in-production.md)
- [Cloudflare Kitesurf](../ch03/006-agent.html)
- [Agent 作为软件 3.0 底座](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-as-software-3-0-substrate.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/extensible-software-llm-era-cloudflare-morrell-small-software-2026.md)

---

