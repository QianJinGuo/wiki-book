# NGINX Rift: Achieving NGINX Remote Code Execution via an 18-Year-Old Vulnerability

## Ch01.112 NGINX Rift: Achieving NGINX Remote Code Execution via an 18-Year-Old Vulnerability

> 📊 Level ⭐ | 5.3KB | `entities/nginx-rift-achieving-nginx-remote-code-execution-v.md`

## 核心要点
- 来源：depthfirst.com
- 评分：v=5 c=12 (56分)
## 相关实体
- [Nginx Rift Achieving Nginx Rce Via An 18 Year Old Vulnerability](https://github.com/QianJinGuo/wiki/blob/main/entities/nginx-rift-achieving-nginx-rce-via-an-18-year-old-vulnerability.md)
- [Cogalpha Acl2026 Alpha Mining](ch01/963-20.html)
- [Tracking Tampered Chef Clusters Aef374](https://github.com/QianJinGuo/wiki/blob/main/entities/tracking-tampered-chef-clusters-aef374.md)
- [Trackingtamperedchefclustersviacertificateandcodereuse](https://github.com/QianJinGuo/wiki/blob/main/entities/trackingtamperedchefclustersviacertificateandcodereuse.md)
- [Runtime Instrumentation Of Qt6 Apps With Frida Part 1 Getting Visibility](ch01/009-runtime-instrumentation-of-qt6-apps-with-frida-part-1-get.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/nginx-rift-achieving-nginx-remote-code-execution-v.md)

## 深度分析
1. **双阶段脚本引擎的子引擎状态复位缺陷**：NGINX 的 rewrite 引擎在长度计算阶段使用 `ngx_memzero(&le, ...)` 创建完全清零的子引擎，导致 `le.is_args=0`；而实际复制阶段运行在主引擎上 `e->is_args=1`。两者状态不一致使得缓冲区大小被严重低估——长度计算时走了 else 分支（不计算转义扩展），复制时走了 if 分支（执行 `ngx_escape_uri` 将每个可转义字符扩展为 3 字节），最终写入量超出分配量。
2. **is_args 标志的永久性污染**：`ngx_http_script_start_args_code` 在 rewrite 替换字符串含问号时将 `e->is_args` 置为 1，且该标志在后续所有 script 代码评估中永不重置。这意味着任何后续 `set` 指令引用捕获组时，都会受到这个污染标志的影响，形成跨指令的状态泄露。
3. **跨请求堆布局工程（Cross-Request Heap Feng Shui）**：攻击者通过精确控制连接时序（先发送 partial headers 建立 attacker pool，再建立 victim pool，然后触发 overflow 并立即关闭 victim socket）来确保池销毁在污染字段被使用之前发生。这种技术避免了 NGINX worker 进程因内存元数据损坏而提前崩溃，使 `ngx_destroy_pool` 得以安全地遍历 `cleanup` 链表并触发代码执行。
4. **URI 安全字符的溢出约束与二进制指针注入**：漏洞提供的溢出写入的是 URI 安全字符（无 null 字节），无法直接构造含 null 的 libc 指针。解决方案是通过 POST body spraying 将任意二进制数据的 fake `ngx_pool_cleanup_s` 结构喷射到堆中固定偏移，然后利用溢出只覆写 `cleanup` 指针的低地址部分，使其指向喷射的假结构。
5. **多进程 Fork 模型对漏洞利用的影响**：NGINX worker 进程由 master fork 而来，内存空间完全复制导致堆布局在所有 worker 间高度一致且可预测。这使得攻击者可以先在一个 worker 上探测堆布局，然后切换到另一个 worker 实施稳定利用，大幅降低攻击成本。

## 实践启示
1. **立即检查配置中的 rewrite + set 组合**：在所有 NGINX 配置中搜索含 `?` 的 rewrite 规则下游是否紧跟 `set` 指令引用 `$1` 等捕获组——这是触发 CVE-2026-42945 的唯一路径。若存在，使用 `location` 拆分或重写逻辑消除该模式。
2. **使用 geoip 或 map 模块替代 request path 捕获**：若业务需要保留 rewrite 前的原始路径，不要用 `set $original_path $1` + rewrite 捕获组的方式，改为在 `map` 块中用 `$request_uri` 变量在 rewrite 前直接记录原始路径，避免触发 script 引擎的状态污染路径。
3. **在 WAF 层对 URI 参数进行长度预验证**：对于启用 rewrite 的 `location`，在 upstream 前增加 `if ($request_uri ~ "+") { return 444; }` 规则拒绝含大量 `+` 或 `%` 的 URI，阻止触发 `ngx_escape_uri` 的字符扩展路径。该规则不干扰正常请求，但能阻断基于 URI 可转义字符数量的攻击。
4. **限制 POST body 体积并关闭chunked上传**：CVE-2026-42945 的利用依赖 POST body spraying 注入二进制指针，应在对应 `location` 块中设置 `client_max_body_size 1k;` 并禁用 `_transfer-encoding: chunked`，降低喷射 heap 的可行性。
5. **升级 NGINX 前先验证版本号**：`nginx -v` 显示的版本若在 0.6.27–1.30.0 范围内立即受影响。升级路径：优先升级到 1.30.1+；若无法升级且使用 `rewrite ...? ... set $var $1` 模式，考虑临时移除 `?` 换用 `&` 并在 upstream 侧重构参数逻辑。

## 关联阅读
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/nginx-rift-achieving-nginx-remote-code-execution-v.md)

---

