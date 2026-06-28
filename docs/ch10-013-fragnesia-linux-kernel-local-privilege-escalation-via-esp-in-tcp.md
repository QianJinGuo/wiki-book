## Ch10.013 Fragnesia: Linux Kernel Local Privilege Escalation via ESP-in-TCP

> 📊 Level ⭐⭐ | 7.9KB | `entities/fragnesia-linux-kernel-local-privilege-escalation-via-esp-in-tcp.md`

## 漏洞概述

Fragnesia 由安全研究员 Hyunwoo Kim（DirtyFrag 原始发现者）披露，是 DirtyFrag 漏洞修补过程中的一个意外副作用。该漏洞影响 Linux 内核的 XFRM ESP-in-TCP 实现，允许非特权本地攻击者通过确定性页缓存污染原语修改内核页缓存中只读文件的内容，最终获取 root 权限。

## 技术分析

### 攻击向量与根本原因

漏洞根源在于 Linux XFRM ESP-in-TCP 实现中 **skb（socket buffer）合并时共享页片段处理不当**。具体攻击路径如下：

1. **阶段一：页片段植入**：攻击者先将文件支持页（file-backed pages）splice 到 TCP 接收队列，此时 socket 尚未切换到 `espintcp` ULP（Upper Layer Protocol）模式
2. **阶段二：模式切换与就地解密**：当 ESP 处理启用后，内核在原位（in-place）解密队列中的数据，利用 AES-GCM 密文流特性实现对底层页缓存的受控污染
3. **阶段三：单字节覆写**：攻击者通过精心构造的 ESP 安全关联（Security Association），反复触发对缓存文件页的单字节可控写入

###  exploit 利用链路

研究者演示的完整利用链包括：

1. 利用 user namespace 和 network namespace 在隔离命名空间内获取 `CAP_NET_ADMIN` 权限
2. 通过 `NETLINK_XFRM` 安装精心构造的 ESP 安全关联
3. 反复触发受控单字节写入，覆盖 `/usr/bin/su` 的开头字节，替换为调用 `setresuid(0,0,0)` 并执行 `/bin/sh` 的小型 ELF payload
4. 攻击仅修改页缓存内存中的二进制文件，不改变磁盘上的实际文件

### 与 DirtyFrag 的关键差异

| 维度 | DirtyFrag | Fragnesia |
|------|-----------|-----------|
| 前置要求 | 需要 host 级特权 | 无 host 级特权要求 |
| 命名空间 | 通常需要用户命名空间 | 通过 namespace 获取 `CAP_NET_ADMIN` 即可 |
| 影响范围 | 更多的内核模块 | 主要影响 XFRM ESP-in-TCP |

### 缓解因素

- **AppArmor 限制**：Ubuntu 等发行版默认对非特权用户命名空间启用 AppArmor 限制，需要额外绕过才能成功利用
- **模块加载**：如果 `esp4`、`esp6`、`rxrpc` 模块未加载则不受影响

## 深度分析

### DirtyFrag 修补反模式：过度特化导致新漏洞

Fragnesia 的本质是 DirtyFrag 补丁的「修补反模式」——安全补丁在修复原始漏洞时引入了新的攻击面。原始 DirtyFrag 通过修改 `pipe_buf_get()` 引用计数逻辑堵住了漏洞，但这个修补策略在 ESP-in-TCP 的 skb 合并路径中产生了遗漏：AES-GCM 的密文流特性使得 in-place 解密操作天然地具有对底层页缓存的可控写入能力，而 DirtyFrag 的补丁没有考虑到这个特殊的解密路径。

### 页缓存污染 vs 直接覆写：攻击原语的质量差异

Fragnesia 与传统内核提权漏洞的关键区别在于其攻击原语的特性：页缓存污染（而非直接磁盘覆写）具有两个独特的性质——**持久性条件**（攻击效果仅在内存中存在，重启后消失）和**范围限定性**（只影响已缓存的页帧）。这个特性反而成为攻击优势：攻击者可以「定向修改」内存中的 su 二进制文件，而不触发磁盘文件的完整性检测，同时通过后续利用管道或其他方式维持 root shell 的持续运行。

### Namespace 隔离的边界：边界检查的局部有效性问题

Fragnesia 利用链的第一步依赖 user namespace 隔离来获取 `CAP_NET_ADMIN`，这揭示了一个 Linux namespace 安全模型的深层假设：边界检查在各自独立的 namespace 内部有效，但 namespace 之间的资源交互（特别是内核全局状态如页缓存）并不受 namespace 边界的保护。换言之，CAP_NET_ADMIN 在 isolated namespace 内部可以被用来执行影响 host 级页缓存的操作，这是 namespace 隔离模型的一个已知但常被忽视的安全边界。

### IMA/EVM 作为最终防线：完整性测量的局限性

内核完整性子系统 IMA（Integrity Measurement Architecture）和 EVM（Extended Verification Module）提供了针对页缓存篡改的检测能力，但其有效性受到两个限制：测量的是文件系统层行为而非内存页缓存行为（攻击在页缓存层面发生，晚于 IMA 的测量点）；在云环境和容器化部署中启用 IMA/EVM 的性能开销通常难以接受。这说明内核安全是一个多层纵深防御问题，不存在单一银弹解决方案。

## 实践启示

### 立即行动项

1. **模块禁用（临时缓解）**：如无需 ESP 功能，禁用相关内核模块：
   ```bash
   rmmod esp4 esp6 rxrpc
   printf 'install esp4 /bin/false
install esp6 /bin/false
install rxrpc /bin/false
' > /etc/modprobe.d/fragnesia.conf
   ```

2. **用户命名空间限制**：在不影响业务的前提下，限制或禁用非特权用户命名空间

3. **补丁管理**：关注各 Linux 发行版提供的内核安全更新，及时应用 vendor 补丁

### 检测与响应

- **监控指标**：可疑的 namespace 创建、XFRM 操作异常、AF_ALG 滥用
- **事件响应**：如怀疑已被利用，需重启系统或清除页缓存以移除内存中被篡改的二进制文件：
  ```bash
  echo 1 | tee /proc/sys/vm/drop_caches
  ```

### 纵深防御建议

- 内核安全模块（AppArmor/SELinux）应启用并配置最小权限原则
- 定期审计非特权用户是否具备 `CAP_NET_ADMIN` 能力
- 考虑使用内核完整性保护机制（如 IMA/EVM）检测页缓存篡改

## 相关实体
- [Drinking Llms](ch01-574-getting-llms-drunk-to-find-remote-linux-kernel-oob-writes-a.html)
- [Agent Harness Architecture Design Production Guide](ch04-021-ai-agent.html)
- [Weve Been Here Before Ai Vulnerability Research](ch01-457-claude-managed-agents-harness.html)
- [Microsoft Zero Days Researcher Disgruntled](ch12-089-mystery-microsoft-bug-leaker-keeps-the-zero-days-coming.html)
- [5235705](ch12-057-meta-u-turns-on-encryption-push-for-instagram-as-dms-go-plai.html)

---
