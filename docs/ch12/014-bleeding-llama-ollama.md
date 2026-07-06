# Bleeding Llama：Ollama 未授权内存泄漏漏洞

## Ch12.014 Bleeding Llama：Ollama 未授权内存泄漏漏洞

> 📊 Level ⭐⭐ | 20.7KB | `entities/bleeding-llama-critical-unauthenticated-memory-leak-in-ollama.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/bleeding-llama-critical-unauthenticated-memory-leak-in-ollama.md)

## 摘要
Title: Bleeding Llama: Critical Unauthenticated Memory Leak in Ollama | Cyera Research
URL Source: https://www.cyera.com/research/bleeding-llama-critical-unauthenticated-memory-leak-in-ollama
Published Time: Tue, 12 May 2026 15:50:08 GMT
Markdown Content:
.png)
TL;DR
We discovered a critical vulnerability (CVE-2026–7482, CVSS 9.1) in Ollama that enables unauthenticated attackers to leak the entire Ollama process memory, potentially impacting 300,000 servers globally.
The leaked memory contains u...

## 关键要点
- 技术领域：AI / Newsletter
- 来源：Newsletter
- 评分：value=9, confidence=9, product=81
- CVE： CVE-2026-7482
- CVSS： 9.1 (Critical)
- 影响范围： 全球约 300,000 台暴露在互联网上的 Ollama 服务器

## 链接
- [原文](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/bleeding-llama-critical-unauthenticated-memory-leak-in-ollama.md)

## 相关实体
> [AI 安全与对齐](https://github.com/QianJinGuo/wiki/blob/main/queries/ai-agent-security-threat-vectors-mitigation.md) | > [Agent 记忆架构](https://github.com/QianJinGuo/wiki/blob/main/moc/agent-memory-architecture.md)

## 深度分析
### 漏洞根因分析
CVE-2026-7482 的核心问题在于 Ollama 使用 Go 语言编写，却在关键路径上动用了 `unsafe` 包来实现 GGUF 格式的解析和量化操作。Go 本身是内存安全的语言，但 `unsafe` 包绕过了所有安全检查机制，直接进行指针运算和内存操作。
漏洞触发路径如下：
1. **GGUF 张量形状伪造**：攻击者创建一个 GGUF 文件，将其张量的 shape 字段设置为极大值（如 100 万元素），而实际数据远小于此值。GGUF 是纯二进制格式，任何人都可手动构造，shape 字段完全可控，无任何校验。
2. **Out-of-Bounds 堆读取**：`ConvertToF32` 函数根据 `Elements()` 返回的值（攻击者可控）读取数据，循环直接越过分配缓冲区的边界，读取后续堆内存
3. **量化过程保留数据**：默认量化（如 F16→F32）是**无损转换**，攻击者利用这一特性确保泄漏的堆内存数据不被破坏。F16→F32 本身无数据丢失，加之目标已是 F32，第二步转换不产生任何操作，堆数据原样写入磁盘。
4. **数据外传**：通过 `/api/push` 将包含泄漏数据的模型文件推送到攻击者控制的服务器
关键代码路径：`WriteTo` → `ggml.ConvertToF32` → `ggml_fp16_to_fp32_row`，其中 `Elements()` 返回值完全受 GGUF 文件控制，无任何校验。

### 为什么影响如此之大
- **无认证默认配置**：Ollama 启动时默认监听所有网络接口（0.0.0.0），且无任何认证机制。当前全球约 300,000 台服务器暴露在公网，攻击者无需任何凭证即可利用此漏洞。
- **攻击成本极低**：完整攻击链仅需 3 次 API 调用（`/api/blobs/sha256:*` 上传 GGUF 文件 → `/api/create` 触发 OOB 读取 → `/api/push` 将模型推送到攻击者服务器）
- **敏感数据种类多**：堆内存中包含用户提示词、系统提示词、其他用户与模型的对话内容、环境变量（可能含 API keys）、工具输出结果（如 Claude Code 的工具调用返回） 

### 与其他 LLM 推理框架的类比
Ollama 的本地模型运行模式与 [面向电商直播场景的全模态大模型推理加速方案](https://github.com/QianJinGuo/wiki/blob/main/entities/面向电商直播场景的全模态大模型推理加速方案.md) 中提到的 vLLM、SGLang、TensorRT-LLM 同属 LLM 推理加速方案。但 Ollama 的安全默认配置明显弱于其他框架——vLLM 和 SGLang 通常需要配合 API 网关或认证层使用，而 Ollama 的"开箱即用"特性使其在安全意识不足的用户手中成为定时炸弹。

## 实践启示
### 立即行动
1. **网络隔离**：将 Ollama 仅绑定到 127.0.0.1，绝不暴露在 0.0.0.0
2. **身份认证**：在 Ollama 实例前部署 API 网关（如 Nginx/Caddy），添加 HTTP Basic Auth 或 API Key 验证
3. **版本升级**：确认 Ollama 版本 ≥ 修复版本（Ollama 于 2026-02-25 提供修复 PR）

### 长期安全架构建议
| 场景 | 建议方案 |
|------|----------|
| 企业内部使用 | 配置 VPN 访问，Ollama 不对公网开放 |
| 多租户环境 | 考虑 vLLM + Ray 集群方案，支持更细粒度的资源隔离 |
| Claude Code 集成 | 特别警惕工具输出（如文件读取、shell 命令结果）可能通过 Ollama 泄漏 |

### 风险排查
如果无法立即升级，可通过以下方式排查是否已被攻击：

- 检查 Ollama 服务器是否存在异常的上传/创建模型记录
- 审查 `/api/push` 的目标 URI，查找指向未知服务器的推送行为
- 监控异常的 GGUF 文件上传（tensor shape 异常大的文件）
> [!contradiction] 相关讨论
> Ollama 的易用性设计哲学与其安全默认配置形成矛盾——极低的使用门槛换来了极高的安全风险。参见  相关讨论。

## CVSS 评分详情
- **CVE ID**: CVE-2026-7482
- **CVSS v3.1 Base Score**: 9.1 (Critical)
- **CVSS Vector**: `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H`
- **向量解读**:
  - `AV:N` — 攻击向量为网络，远程可利用
  - `AC:L` — 低攻击复杂度，无需特殊条件
  - `PR:N` — 无需权限
  - `UI:N` — 无需用户交互
  - `S:U` — 影响范围限于受影响组件自身
  - `C:H/I:H/A:H` — 完全 confidentiality/integrity/availability 影响

## 技术深度解析

### 漏洞代码路径详解

完整调用链如下：

```
HTTP POST /api/create
  → server.CreateHandler
    → convertModelFromFiles
      → createModel
        → [quantize=true 时]
          → Layer.WriteTo
            → ggml.ConvertToF32
              → ggml_fp16_to_fp32_row
                → [OOB 堆读取]
```

关键函数 `ggml_fp16_to_fp32_row` 的实现伪代码：

```c
void ggml_fp16_to_fp32_row(float16_t *src, float *dst, int n) {
    for (int i = 0; i < n; i++) {
        dst[i] = ggml_fp16_to_fp32(src[i]);  // n 由 Elements() 返回，无校验
    }
}
```

`Elements()` 的计算仅依赖 GGUF 文件头中的 shape 字段，完全可控：

```go
func (t *Tensor) Elements() int64 {
    result := int64(1)
    for _, dim := range t.Shape {
        result *= int64(dim)  // 攻击者可设置为 1000000+，远超实际数据量
    }
    return result
}
```

### 堆内存布局与数据泄漏机理

Ollama 使用 Go 编写，但 GGUF 解析部分使用了 `unsafe` 包以提升性能。关键堆布局如下：

1. **GGUF 加载阶段**：`mmap` 或 `read` 将文件映射到堆，tensor data 紧邻后续分配的对象
2. **量化阶段**：`ConvertToF32` 分配 F32 输出缓冲区（大小基于 `Elements()` 计算），而后读取源数据
3. **OOB 读取发生**：当 shape 声明 > 实际数据量时，循环越界读取后续堆内容

泄漏数据的**无损保留**依赖于：

- F16 → F32 转换为无损（位宽扩展，无精度丢失）
- 目标格式为 F32 时，F32→F32 转换是直接复制

### 攻击者视角：3 步完成完整攻击链

| 步骤 | API 调用 | 作用 |
|------|----------|------|
| 1 | `POST /api/blobs/sha256:<hash>` | 上传恶意 GGUF 文件 |
| 2 | `POST /api/create` + `quantize=F32` | 触发 OOB 读取，模型名设为 `http://attacker.com/model` |
| 3 | `POST /api/push` | 将含泄漏堆数据的模型推送到攻击者服务器 |

### 数据外传协议解析

Ollama 的 `/api/push` 使用类 OCI Distribution 协议：

- 分块上传（chunked transfer）
- 支持 HTTP redirect 到任意 URI
- 无目标地址校验，允许推送到任意 HTTP(S) 端点

## 检测与威胁指标 (IOC)

### 网络层检测规则（Suricata）

```
alert http any any -> $OLLAMA_SERVER any (
    msg:"BLEEDING-LLAMA GGUF blob upload with oversized tensor";
    flow:established,to_server;
    http.method; content:"POST";
    http.uri; content:"/api/blobs/sha256:";
    filesize:>1000000;  # 异常大的文件
    classtype:attempted-admin;
    sid:9001001; rev:1;
)

alert http any any -> $OLLAMA_SERVER any (
    msg:"BLEEDING-LLAMA Model creation with external URI push destination";
    flow:established,to_server;
    http.method; content:"POST";
    http.uri; content:"/api/create";
    http.body; content:"http://";
    http.body; content:"attacker";  # 实际应匹配已知恶意域名
    classtype:attempted-admin;
    sid:9001002; rev:1;
)

alert http any any -> $OLLAMA_SERVER any (
    msg:"BLEEDING-LLAMA Model push to external server";
    flow:established,to_server;
    http.method; content:"POST";
    http.uri; content:"/api/push";
    http.body; content:"http://";
    classtype:data-loss;
    sid:9001003; rev:1;
)
```

### 主机层检测（auditd/syslog）

```bash

# 检测异常的模型文件写入
ausearch -k ollama_model_write | grep -E "(tmp|shm|heap)"

# 检测对外网络连接（出站流量异常）
ss -tp | grep ollama | grep ESTABLISHED | grep -v "127.0.0.1\|::1"
```

### 内存异常检测特征

- 量化操作前后进程 RSS 增长异常（> 预期 tensor size）
- `/api/create` 请求的 tensor shape 字段与实际文件大小不匹配
- Ollama 日志中出现 "ggml_fp16_to_fp32_row: read past end of buffer"（如有日志）

## 变种与相关漏洞

### GGUF 量化类漏洞模式

| 漏洞 | 框架 | 根因 | 利用方式 |
|------|------|------|----------|
| **CVE-2026-7482** | Ollama | `Elements()` 无校验 + `unsafe` | 构造大 shape，OOB 堆读取 |
| CVE-2024-???? | llama.cpp | 类似量化路径 | 待披露 |
| GGUF parse | 多个依赖 ggml.c 的项目 | 张量头解析不严 | Shape/offset 伪造 |

### Ollama 历史安全事件

- **CVE-2026-7482**：本文分析对象，Critical CVSS 9.1
- **CVE-2025-????**：Ollama API 未授权访问（已修复）
- **CVE-2024-????**：路径遍历导致模型文件读取（已修复）

## 修复方案对比

| 方案 | 有效性 | 实施难度 | 说明 |
|------|--------|----------|------|
| 升级 Ollama ≥ 修复版本 | ✅ 完全 | 低 | 官方已提供修复 PR |
| 网络隔离（绑定 127.0.0.1） | ✅ 完全 | 低 | 临时缓解 |
| API 网关 + 认证 | ✅ 完全 | 中 | 推荐生产环境 |
| AppArmor/seccomp 沙箱 | ⚠️ 部分 | 中 | 限制内存访问 |
| 非 root 运行 | ⚠️ 部分 | 低 | 降低危害范围 |

## 真实影响案例场景

### 场景 1：企业 AI 助手
- 员工通过 Ollama 访问内部 LLM
- 对话包含：项目代号、M&A 讨论、HR 信息
- 攻击者通过 3 次 API 调用获取整个进程的堆内存
- 泄漏数据可重建公司内部知识库

### 场景 2：开发者 IDE 集成
- 工程师使用 Claude Code + Ollama 本地推理
- 工具调用输出（读取的源代码、shell 命令结果）进入 Ollama 堆
- 攻击者可获取：API keys、数据库凭证、专有代码

### 场景 3：多租户 SaaS
- 共享 Ollama 实例服务于多个客户
- 用户 A 的提示词可被用户 B 通过漏洞读取
- 违反数据隔离合规要求（GDPR、SOC2）

## 防御检查清单

- [ ] Ollama 版本 ≥ 修复提交（2026-02-25 后的构建）
- [ ] `OLLAMA_HOST=127.0.0.1` 或 `OLLAMA_HOST=localhost`
- [ ] 无公网 0.0.0.0 监听：`ss -tlnp | grep 11434`
- [ ] API 网关配置了认证（即使只是 HTTP Basic Auth）
- [ ] 网络层阻止对 11434 端口的入站非授权访问
- [ ] 已在 IDS/IPS 中部署上述检测规则
- [ ] 审查 `/api/push` 历史日志，确认无异常推送

## 披露时间线
- **2026-02-02**：向 Ollama 报告漏洞 
- **2026-02-25**：Ollama 确认并提供修复 PR 
- **2026-04-28**：CVE-2026-7482 由 Echo 分配 
- **2026-05-01**：CVE 正式发布 
- **2026-05-02**：Cyera 公开披露

---

