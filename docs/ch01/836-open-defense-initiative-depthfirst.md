# Open Defense Initiative | depthfirst

## Ch01.836 Open Defense Initiative | depthfirst

> 📊 Level ⭐⭐ | 5.4KB | `entities/opendefenseinitiativedepthfirst.md`

## 核心要点
- **定位**：depthfirst 公司的开放式防御倡议，旨在关键开源项目被 AI 驱动攻击者攻破前提供前沿安全能力 
- **危机背景**：Mythos 和 GPT-5.5 Cyber 已展示自主漏洞发现与利用能力，开源模型正在快速追赶，留给防御者的窗口期很短 
- **核心差异化**：depthfirst 不只是更强的模型，而是针对安全场景深度优化的"安全 harness + 可利用性定制模型 + 全系统上下文验证"体系 
- **成本优势**：$1,000 depthfirst 算力找到 FFmpeg 中 12 个内存破坏漏洞，Anthropic 同样的漏洞扫描花费约 $10,000 
- **激励规模**：提供最高 $5,000,000 算力额度，面向关键开源项目（FFmpeg、Envoy、Kata 等已加入） 
---

## 深度分析
### 1. 威胁格局：AI 漏洞发现进入自动化阶段
depthfirst 在公告中明确指出了当前安全态势的转变：前沿 AI 模型已经能够在广泛审查的代码库中自主发现并利用漏洞。这意味着：

- **漏洞发现的规模化**：传统人工代码审计受限于专家资源和时间成本，而 AI agent 可以 7×24 不间断扫描
- **开源模型的追赶**：虽然目前前沿能力仍被少数公司掌控，但开源模型正在快速追赶，一旦普及将失去"过滤器"保护
- **窗口期紧迫性**：depthfirst 自述"窗口正在关闭"——在开源模型达到前沿水平前，必须先加固关键基础设施

### 2. depthfirst 的技术差异化
depthfirst 的核心竞争力不在于"最强大的通用模型"，而在于**针对安全场景的全栈优化**：
| 组件 | 作用 |
|------|------|
| **Harness** | 让模型在代码中高效推理的结构化框架 |
| **定制化安全模型** | 后训练专注于漏洞可利用性判断 |
| **全系统上下文** | 验证漏洞是否真正可被利用，而非仅理论存在 |
这直接对应了 depthfirst 的核心论点：**model strength alone is not enough**。纯模型能力在安全场景下是不够的，需要从推理框架、模型微调到验证上下文的完整优化。

### 3. 实证数据：FFmpeg 案例
depthfirst 提供了一个具体对比案例：

- **Anthropic**：使用 Mythos 对 FFmpeg 进行数百次扫描，报告成本约 $10,000
- **depthfirst**：使用 $1,000 算力发现 FFmpeg 中 12 个内存破坏漏洞（这些漏洞在 Anthropic 扫描后仍然存在）
这组数据的含义是双重的：
1. **成本效率**：depthfirst 的安全优化体系在 token 效率上可能有数量级优势
2. **技术路线差异**：即使使用相同的底层模型，优化方向的不同也会导致检出率的显著差异

### 4. Open Defense Initiative 的运营模式
**资格认定**采用双重验证机制：
**身份验证（Identity）**：

- 与项目关联的邮箱域名（ SECURITY.md 中列出的安全联系邮箱）
- GitHub/GitLab 账号出现在 MAINTAINERS、CODEOWNERS 或治理文档中
- 最近提交记录中有合并的 commits 和 reviews
- 通过公开确认（如 pinned issue 评论、签名消息、官方站点/社交账号声明）
**权限验证（Authority）**：

- 对仓库有合并权限或同等权限
- 需要第二名维护者确认申请合法性
这种验证模式的目的是确保"坏人"无法通过该计划获得前沿安全能力。

### 5. 战略意义
Open Defense Initiative 本质上是一种**防御性不对称策略**：

- 对攻击者而言：前沿 AI 漏洞发现能力正在民主化，"谁都能用"意味着攻击门槛降低
- 对防御者而言：depthfirst 试图在开源模型达到前沿水平前，让所有关键开源项目都能获得前沿级别的防御能力
这是典型的"加速加固"逻辑：在威胁升级前建立防御优势。
---

## 相关实体
> [主题导航](https://github.com/QianJinGuo/wiki/blob/main/moc/cybersecurity-privacy.md)

- [Cline releases open-source agent runtime SDK](../ch04/003-agentrun.html)
- [Versa takes aim at fragmented enterprise security with CSPM, orchestration update, and AI agent controls](ch01/1089-rag.html)
- [Mythos for Offensive Security: XBOW's Evaluation](../ch12/030-mythos.html)
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/opendefenseinitiativedepthfirst.md)
- [open defense initiative](ch01/834-open-defense-initiative.html)

---

