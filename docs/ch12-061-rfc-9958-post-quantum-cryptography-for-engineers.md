# RFC 9958: Post-Quantum Cryptography for Engineers

## Ch12.061 RFC 9958: Post-Quantum Cryptography for Engineers

> 📊 Level ⭐⭐ | 7.1KB | `entities/rfc9958.md`

# RFC 9958: Post-Quantum Cryptography for Engineers

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/rfc9958.md)

## 摘要

RFC 9958 是 IETF 于 2026 年 6 月发布的 Informational RFC，由 Banerjee 等人撰写，面向密码学工程师的后量子密码学（PQC）实施指南。该文档的核心论点是：PQC 过渡不是简单的算法替换（drop-in replacement），而是需要**协议级别的重新设计**。文档覆盖了 CRQC 威胁模型、NIST/ISO 标准化算法、KEM 与签名方案的工程差异、PQ/T 混合方案、以及从 Mosca 模型推导的过渡时间线。

## 核心要点

### CRQC 威胁模型：对称 vs. 非对称

RFC 9958 明确区分了量子计算对对称密码学和非对称密码学的不同威胁级别：

**对称密码学（AES、HMAC-SHA256 等）**：Grover 算法提供理论上的二次加速，但其高度不可并行化。即使部署 256 台量子计算机，运行时间仅减少 16 倍。专家共识是 AES-128 在实践中仍然安全，密钥长度不一定需要翻倍。NIST 在 PQC 评估中仍以 AES-128/192/256 作为安全级别基准，表明对 AES 稳定性的信心。

**非对称密码学（RSA、ECC、DH 等）**：Shor 算法可以高效解决整数分解和离散对数问题，这是当前公钥密码学的数学基础。研究表明，CRQC 可在数小时甚至数秒内破解 RSA-2048。由于增加密钥大小无法提供安全解决方案（RSA 密钥需要达到数 GB 级别），必须**完全替换算法**。

### NIST 标准化 PQC 算法

截至 RFC 9958 发布时，NIST 已标准化以下 PQC 算法：

**KEM（密钥封装机制）**：
- **ML-KEM**（FIPS 203）：基于模块格的 KEM，提供 IND-CCA2 安全性
- **HQC**：基于准循环码的编码算法，已被 NIST 选入标准化但尚未发布

**数字签名**：
- **ML-DSA**（FIPS 204）：基于模块格的签名算法，使用 Fiat-Shamir with Aborts 框架
- **SLH-DSA**（FIPS 205）：无状态哈希签名算法，唯一标准化的无状态哈希签名方案
- **FN-DSA**（FIPS 206，尚未发布）：基于 NTRU 格的签名算法，以紧凑性著称

一个关键差异：传统算法（如 RSA、ECC）可以同时用作 KEM 和签名方案，而目前没有单一 PQC 算法能同时实现两种功能。这意味着协议升级时必须分别替换。

### PQC 三大类别

RFC 9958 将 PQC 方案分为三大类：

1. **基于格（Lattice-based）**：利用格中的"陷门"问题，公钥和签名比经典方案大约 6-100 倍，是通用替换的最佳候选（ML-KEM、ML-DSA、FN-DSA、FrodoKEM）
2. **基于哈希（Hash-based）**：安全性基于底层哈希函数，分为有状态（XMSS、LMS）和无状态（SLH-DSA）两类。有状态方案需要额外的运维复杂度
3. **基于编码（Code-based）**：始于 1970-80 年代的 McEliece 和 Niederreiter 工作，包括 Classic McEliece、HQC、BIKE

### KEM vs. 传统密钥交换的根本差异

RFC 9958 指出 KEM 的 API 与传统密钥协商/密钥传输机制存在本质差异，这直接影响协议设计：

- **密钥协商（DH/ECDH）**：双方各贡献一个公私钥对
- **密钥传输（RSA 加密）**：一方选择对称密钥并加密给另一方
- **KEM**：`Encaps()` 操作涉及发送方选择的随机性，因此 KEM-based 协议**不能同时**是 AKE（认证密钥交换）和 NIKE（非交互密钥交换）

这意味着某些互联网协议需要重新设计，要么引入额外的网络往返，要么在安全属性上做出取舍。

## 深度分析

### Mosca 模型与过渡时间线

RFC 9958 引用的 Mosca 模型是理解 PQC 过渡紧迫性的关键框架：

- **x** = 系统和数据需要保持安全的时间
- **y** = 完全迁移到 PQC 基础设施所需的年数
- **z** = CRQC 出现前的剩余时间

当 x + y > z 时，数据已经处于不安全状态。对于数据机密性，"harvest now, decrypt later"（HNDL）攻击意味着今天未实施量子安全策略的加密数据未来可能被破解。对于认证，虽然签名通常生命周期短，但基础设施依赖的根密钥可能嵌入硬件设备中数十年。

文档特别强调：不要低估加速 CRQC 出现的因素——更快的量子计算进展、更高效的 Shor 算法变体，以及**私有的国家级量子研究**可能比公开研究领先数年。

### PQ/T 混合方案的工程挑战

RFC 9958 详细讨论了后量子与传统（PQ/T）混合方案：

- **混合机密性**：结合 PQC KEM 和传统 KEM 的共享秘密
- **混合认证**：同时使用 PQC 和传统签名
- **KEM Combiner 设计**：最简单的 combiner 是拼接 `ss1 || ss2`，但要保留 IND-CCA2 属性需要更复杂的构造

混合方案的价值在于：即使 PQC 算法被发现存在漏洞，传统算法仍提供保护；反之亦然。但这增加了协议复杂度和计算开销。

### 受限设备与网络的影响

PQC 过渡对受限设备（IoT、智能卡、嵌入式系统）的影响尤为严重：
- PQC 密钥和签名尺寸显著增大（10-100x）
- 智能卡应用需要同时更换卡片和读卡器
- 性能敏感应用需要支持 PQC 硬件加速的 CPU
- 安全敏感应用需要 PQC TPM、TEE、安全飞地等

迁移时间 y 不仅包括部署时间，还包括集成、测试、审计、重新认证的时间，以及供应商生产 PQC-ready 产品的前置时间。

## 实践启示

1. **立即开始混合密钥交换部署**：PQ/T 混合密钥交换相对自包含，通常只需更改密码学库（如 OpenSSL），可以尽早积累运维经验
2. **评估你的实际迁移时间 y**：不要只考虑"打补丁"的时间，要考虑硬件更换、审计、认证的完整周期
3. **保护长期敏感数据优先**：HNDL 攻击意味着今天未保护的加密数据未来可能被破解，这是最紧迫的威胁
4. **关注 KEM 的协议级影响**：KEM 不是 DH 的 drop-in replacement，某些协议需要引入额外往返或重新设计
5. **FN-DSA 实现的侧信道风险**：FN-DSA 签名对侧信道攻击高度敏感，除非使用常量时间 64 位浮点运算

## 相关实体

- [后量子安全采用分析](/ch12-098-on-post-quantum-security-adoption/) — PQC 采用策略和威胁评估框架
- 以太坊 BLS 后量子替换 — 区块链场景的 PQC 迁移案例
- 密码学敏捷性（Cryptographic Agility）是 PQC 过渡的底层设计原则
- [Cisco SD-WAN 漏洞 — 安全基础设施需要持续更新的例证](/ch12-015-resecurity-cve-2026-20182-unauthenticated-cisco-sd-wan-co/)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/rfc9958.md)

---

