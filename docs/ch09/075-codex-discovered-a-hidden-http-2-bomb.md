# Codex Discovered a Hidden HTTP/2 Bomb

## Ch09.075 Codex Discovered a Hidden HTTP/2 Bomb

> 📊 Level ⭐⭐ | 7.6KB | `entities/califio-codex-http2-hpack-bomb-880k-servers.md`

# Codex Discovered a Hidden HTTP/2 Bomb

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/califio-codex-http2-hpack-bomb-880k-servers.md)

## 摘要

Calif.io 2026-06-02 公开披露"HTTP/2 Bomb"——一种利用 HPACK 索引引用 + 零字节流控窗口组成的远程 DoS 攻击，影响 nginx/Apache/IIS/Envoy/Pingora 五大主流 web 服务器的默认配置。Shodan 扫描发现 **880,000+** 暴露站点存在风险。该攻击链由 OpenAI Codex 编码模型发现，是 AI 作为漏洞发现者的首批公开重大披露之一。

## 核心要点

- **影响范围极大**：nginx、Apache httpd、Microsoft IIS、Envoy、Cloudflare Pingora 五大主流服务器默认配置均受影响，Shodan 估测 880K+ 站点可被攻击
- **两段已知技术被 AI 链成新攻击**：HPACK 索引引用放大（每 1 字节上行 → 70-4000 字节服务器分配）+ 零字节 WINDOW_UPDATE 持续占位
- **攻击规模**：100Mbps 家用带宽可在数秒内击垮目标；针对 Apache/Envoy 单一客户端可在约 20 秒内吃满 32GB 服务器内存
- **修复进度不一**：nginx 1.29.8 已修（commit `365694160a`，新增 `max_headers` 指令）；Apache 同日修（CVE-2026-49975）；IIS 与 Pingora **未发布补丁**，建议临时关闭 HTTP/2 或前置 header-count cap
- **AI 驱动的安全研究范式转变**：从 fix commit 反推到 working exploit 的周期被 Codex 压缩到分钟级

## 深度分析

### "放大率不来自解码量"是新型 bomb 的本质

经典 HPACK Bomb（CVE-2016-6581、CVE-2025-53020）的防御是**限制解码后 header 总大小**——服务器学聪明后加了 decoded-size cap。但 Calif.io 这次发现的新变体**几乎不消耗解码量**：header 字段本身极小，每个只有几个字节，单纯看 decoded size 根本看不出异常。放大率来自服务器为**每个索引引用维护的元数据/中间 buffer**——例如 Envoy 在每个 cookie crumb 引用时 append 到 buffer、Apache 在每次 crumb 到达时重建合并字符串。**单一资源维度（decoded size）做不出防御，必须叠加字段计数、per-stream allocation 上限、HPACK 动态表大小限制**。

### RFC 9113 §8.2.3 自身的"友好性"被武器化

Cookie 头在 HTTP/2 中可拆成多个 crumb 字段（RFC 9113 §8.2.3 明文允许），本意是兼容老服务器。但 Apache 与 Envoy **在计数限制时不把 cookie crumb 算入字段数**——这条"对老服务器友好"的协议宽容恰好成了放大引擎：Envoy 单 stream 测出 ~5700:1 RSS 放大比。**这暴露了一个反复出现的模式：协议的兼容性设计（"让旧实现能跑"）在攻击者眼里就是新的放大面**——HTTP/1.1 → HTTP/2 演进里这类隐性兼容口子值得系统性排查。

### "压到 swap 但不让 OOM" 是更阴险的攻击策略

文章 Kill Strategy 一节指出：单纯打 OOM 反而**会触发 worker respawn 而自愈**。真正有效的攻击是**让内存水位稳定在 kill threshold 之下**，把机器推进 swap，**所有其他请求都被牵连变慢**——把单点 DoS 变成全机降级。**这种"低于 OOM 阈值但高于健康水位"的攻击模式是低比特/低倍率资源耗尽类攻击的通用技巧**，DB connection pool 耗尽、文件描述符占满、inode 配额压满都同构。

### Codex 这次发现是 AI 安全研究范式的分水岭

披露明确写道："the attack chain was discovered by an AI coding model (Codex)"，且承认"any capable AI model can turn those diffs into a working exploit"。这意味着：

1. **commit-to-exploit window 从数周压缩到分钟**：人类需要 reverse engineer + PoC；AI 直接读 fix diff + 写 exploit。**所有正在或即将发布的修复都会同步变成潜在 zero-day 暴露**。
2. **协调披露成本陡增**：以前 vendor 可以"先在内部仓库修、灰度测试、再 release"争取 4-8 周窗口；现在必须**多家同步 release+协调 mitigation**，否则任何一方先 release 都会让其他家的 fix diff 被即时武器化。
3. **AI 在攻防两面同时加速**：进攻端（exploit 自动化）和防守端（fuzz、自动 patch synthesis、attack surface mapping）都在被 AI 重写，最终胜负取决于**AI 资源的部署密度而非单个研究员水平**。

### 单一客户端 32GB / 20 秒的算账

文章说"against Apache httpd and Envoy, a single client can consume and hold 32GB of server memory in ~20 seconds"。换算下来是 ~1.6 GB/秒的上行诱导分配速率。配合 100Mbps 家用带宽（≈12.5 MB/s）算账：每发 1 字节 wire，服务器分配 4000 字节（Apache/Envoy cookie 路径），1.6 GB/秒 ÷ 4000 ≈ **400 KB/s 真实上行带宽**——也就是攻击者用 1/30 的带宽就能让服务器跑满内存。**这是协议层放大攻击典型的"以小博大"特征**：设计防御时只看带宽上限是不够的，必须看**协议语义层的内存放大比**。

## 实践启示

1. **立即行动清单**：检查自家 nginx 是否 ≥ 1.29.8、Apache 是否切到 mod_http2 v2.0.41（2.4.x 仍暴露）；IIS / Pingora 用户需在 ingress / CDN 层前置 header-count cap
2. **防御要做"多维度 cap"**：decoded size **+** header field count **+** HPACK dynamic-table size **+** per-stream allocation 上限，**任何单一维度都不够**
3. **监控要盯 swap 与水位而非只看 OOM**：被攻击时 RSS 不会爆，但 swap 会异常升高、99p 请求延迟会暴涨。**单一 OOM 告警会漏掉所有"压到 swap"型攻击**
4. **协议升级时主动排查"兼容性口子"**：HTTP/2 → HTTP/3、HTTP/1.1 → HTTP/2、TLS 1.2 → 1.3 等每次协议演进都会留兼容路径，**用 AI 主动审计这些口子**比等 CVE 公开更稳妥
5. **AI 时代的安全响应要"协调披露"模式**：补丁窗口从数周变分钟，**Vendor 之间的私下同步 release 时间窗**比"单家先修"更安全——这要求平台/标准组织牵头组织协调披露

## 相关实体

- [两万字详解Claude Code源码核心机制](ch03/073-claude-code.md)
- [构建基于多智能体架构的深度思考交易系统 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/构建基于多智能体架构的深度思考交易系统-v2.md)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](ch11/207-openclaw.md)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](ch04/503-agent.md)
- [Scale Robot Reinforcement Learning With Nvidia Isaac Lab On ](ch01/837-scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on.md)
- [Nvidia Isaac Lab Sagemaker Robot Rl Humanoid](https://github.com/QianJinGuo/wiki/blob/main/entities/nvidia-isaac-lab-sagemaker-robot-rl-humanoid.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/observability-monitoring.md)

---

