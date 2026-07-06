# NGINX Rift: Achieving NGINX Remote Code Execution via an 18-Year-Old Vulnerability | depthfirst

## Ch12.048 NGINX Rift: Achieving NGINX Remote Code Execution via an 18-Year-Old Vulnerability | depthfirst

> 📊 Level ⭐⭐ | 8.7KB | `entities/nginx-rift-achieving-nginx-rce-via-an-18-year-old-vulnerability.md`

# NGINX Rift: Achieving NGINX Remote Code Execution via an 18-Year-Old Vulnerability | depthfirst

Published Time: 2026-05-13T12:00:00.000Z
**TLDR: We used depthfirst's system to analyze the NGINX source code, and it autonomously discovered 4 remote memory corruption issues, including a critical heap buffer overflow introduced in 2008. We further investigated the exploitability of the issues, and developed a working proof of concept demonstrating RCE with ASLR off. If you use _rewrite_ and _set_ directives in your NGINX configuration, you're at risk.**
In mid-April, I was chatting with a colleague about the most vulnerable spot in our infrastructure. Since most of our services live entirely inside a private network, our app platform is the only exposed surface. He joked that achieving remote code execution on our web service would mean hacking into depthfirst completely. Hacking the web service itself is not my usual focus. However, the idea of hacking the underlying web server intrigued me, which directed my attention to NGINX.
NGINX is the most popular web server today, powering nearly a third of all [websites globally](https://w3techs.com/technologies/overview/web_server%5D). Its high performance architecture makes it the undisputed leader for handling massive volumes of web traffic. From serving static content to acting as an essential reverse proxy, it sits at the critical edge of the modern internet. A single vulnerability in this core infrastructure can therefore expose countless backend systems to severe risks.
Internally, we have an autonomous system that specializes in analyzing low level software. Analyzing NGINX simply required a single click to onboard the repository and trigger the analysis. After six hours of scanning, the system identified 5 security issues including a high severity finding, which is a heap overflow issue when handling NGINX `rewrite` directive.

## 深度分析

**1. 18 年静默的内存损坏：经典状态机的两面-pass 设计缺陷**
CVE-2026-42945 的本质是一个精妙的状态机缺陷：NGINX 脚本引擎采用"两次-pass"设计——第一次计算所需内存长度，第二次执行实际拷贝。 关键问题出在 `is_args` 标志位上：当 `rewrite` 指令的替换字符串包含问号时，`ngx_http_script_start_args_code` 会将 `e->is_args = 1` 永久设置在主引擎上。但在计算长度时，`ngx_http_script_complex_value_code` 创建了一个全新零初始化的子引擎 `le`， 其 `le.is_args = 0`。长度计算因此走向未转义的分支，而拷贝时却使用主引擎（`is_args=1`）进入了转义分支——这个状态不一致在 2008 年就存在，18 年来无人发现。

**2. 高度可控的堆溢出：溢出大小由 URI 内容精确控制**
与传统的堆溢出相比，CVE-2026-42945 提供了极高的可利用性：溢出大小完全由攻击者提供的 URI 中可转义字符数量决定。 通过在请求 URI 中填充加号（`%2B`），每个字符都会被 `ngx_escape_uri` 扩展为三个字节，产生可控的缓冲区溢出。这种"精确制导"式的溢出大小控制大大降低了利用难度——攻击者只需精心构造 URI 载荷即可，无需依赖复杂的堆布局操作。

**3. 多进程架构的意外助攻：确定性堆布局与跨请求 Heap Feng Shui**
NGINX 的多进程模型（worker fork 自 master）在安全性上本是一项优势（隔离性），但对利用却构成了意外的帮助：每次 worker 重启后的堆布局完全一致。 更精妙的是跨请求 heap feng shui 技术：攻击者通过控制连接时序，让 victim pool 精确相邻于 overflow pool，在触发 overflow 后立即关闭 victim 连接， 从而在 NGINX 尝试使用损坏的 pool 字段之前就触发 `ngx_destroy_pool`，直接遍历 `pool->cleanup` 链表执行任意函数指针。

**4. 自主代码审计的成熟度标志：从"发现"到"可利用性证明"的全链路自动化**
depthfirst 的系统在 6 小时内完成 NGINX 代码分析，报告 5 个漏洞，其中 4 个被确认，并进一步自动生成 RCE PoC。 这标志着 AI 辅助代码审计已达到实用化阶段：过去需要资深安全研究员数周才能完成的漏洞挖掘和利用开发，如今可以在数小时内由自动化系统完成。F5 随后在同一天发布安全公告的事实 也表明厂商对这类 AI 发现的问题响应机制已相当成熟。

## 实践启示

1. **立即审查 NGINX 配置中的 rewrite + set 组合**
   CVE-2026-42945 影响 NGINX 0.6.27 至 1.30.0 的所有版本（以及 F5 WAF、NGINX App Protect 等衍生版本），任何包含 `rewrite` 指令（替换字符串含 `?`）紧接着 `set` 指令的配置都存在风险。建议使用 `nginx -T` 全文搜索现有配置，并优先在测试环境验证。

2. **无法立即升级时的临时缓解措施**
   如果无法立即升级 NGINX，可在 `rewrite` 指令后避免使用 `set` 指令引用捕获组，或将 `set` 放在 `if` 条件块内以改变执行上下文。 更彻底的做法是审查所有 `set` 指令，确认没有引用 `rewrite` 正则表达式的捕获组。

3. **将 NGINX 纳入常态化漏洞扫描，且需覆盖配置层**
   传统 SCA（软件成分分析）仅覆盖已知 CVE，而 NGINX 的历史漏洞表明配置指令组合也可能触发内存损坏。安全团队应建立 NGINX 配置审计机制，在每次配置变更后自动检测潜在的 dangerous directive 组合（如 `rewrite` + `set` + `$1`）。

4. **关注自主代码审计工具在 C/C++ 代码库中的应用**
   depthfirst 的案例表明，AI 驱动的静态分析已能在 6 小时内从零发现 NGINX 级别的复杂漏洞。对于拥有大量 C/C++ 遗留代码的组织，引入这类工具可能是发现内部积累了十几年的"沉睡漏洞"的最经济路径。

5. **RCE 利用链中 POST body spraying 技术的防御**
   攻击者使用 POST 请求体喷射伪造 `ngx_pool_cleanup_s` 结构以绕过 URI 字符集限制。 虽然完全阻止此向量需要修复底层漏洞，但可通过限制单 IP 的并发连接数、监控异常大的 POST 请求体大小等方式增加利用难度。

## 相关实体
- [Nginx Rift Achieving Nginx Remote Code Execution V](ch12/048-nginx-rift-achieving-nginx-remote-code-execution-via-an-18.md)
- [Trackingtamperedchefclustersviacertificateandcodereuse](https://github.com/QianJinGuo/wiki/blob/main/entities/trackingtamperedchefclustersviacertificateandcodereuse.md)
- [Tracking Tampered Chef Clusters Aef374](https://github.com/QianJinGuo/wiki/blob/main/entities/tracking-tampered-chef-clusters-aef374.md)
- [Npm Supply Chain Compromise Postmortem](../ch04/229-ai.md)
- [Cogalpha Acl2026 Alpha Mining](../ch01/897-20.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/nginx-rift-achieving-nginx-rce-via-an-18-year-old-vulnerability.md)

---

