# Anthropic's bug-hunting Mythos was greatest marketing stunt ever says curl creator

## Ch01.377 Anthropic's bug-hunting Mythos was greatest marketing stunt ever says curl creator

> 📊 Level ⭐⭐ | 9.8KB | `entities/anthropic-s-bug-hunting-mythos-was-greatest-marketing-stunt-ever-says-curl-creat.md`

## Summary
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/anthropic-s-bug-hunting-mythos-was-greatest-marketing-stunt-ever-says-curl-creat.md)

## Notes
- Value: 8/10, Confidence: 8/10

## 相关实体
- [Anthropic's bug-hunting Mythos was greatest marketing stunt ever, says cURL creator](ch01/707-anthropic.md)
- [Japan's PM orders cybersecurity review to defend against Anthropic Mythos](ch01/707-anthropic.md)

## 深度分析
### 神话破灭：Mythos 的实际能力边界
Daniel Stenberg 对 Mythos 的评估揭示了 AI 安全工具的一个核心真相：当前 AI 模型在漏洞发现上的表现受限于「已知的已知」（known knowns）。Stenberg 明确指出：「AI tools find the usual and established kind of errors we already know about. It just finds new instances of them. We have not seen any AI so far report a vulnerability that would somehow be of a novel kind or something totally new.」这一论断与 Anthropic 对 Mythos「过于危险不能发布」的描述形成尖锐矛盾——如果 Mythos 只能在已知漏洞类型内打转，它究竟危险在哪里？

### 营销叙事 vs 工程现实
Anthropic 构建 Mythos 的叙事策略是典型的「能力压制」（capability suppression）营销——通过声称模型过于强大而不能发布，制造稀缺性和话题性，触发媒体跟进和行业讨论。这种策略在 AI 领域并不罕见：GPT-4 发布时讨论的「过于危险」，Claude 3 发布时的安全边界讨论，都带有类似叙事结构。然而，Stenberg 的亲身验证表明，Mythos 在 cURL 代码库上仅发现 5 个「确认漏洞」，最终只有 1 个低危 CVE 被确认——远低于公众对「顶级 AI 安全模型」的预期。这种落差揭示了一个根本问题：当「安全」被用作营销噱头时，真实的风险评估会被稀释。

### AI 安全工具的生态位：增量辅助而非范式颠覆
Stenberg 的定量对比最有说服力：在 Mythos 之前，cURL 项目已经通过 AISLE、Zeropath、OpenAI Codex Security 等 AI 工具发现了 2-3 百个 bug，其中「probably a dozen or more」被确认为安全漏洞并发布 CVE。Mythos 的成绩（1 个低危 CVE）与这些前辈相比并无显著优势。Stenberg 的结论是：「it is not better to a degree that seems to make a significant dent in code analyzing.」这表明 AI 安全工具的当前生态位是「提升人工审查效率」的辅助工具，而非「替代人类安全研究员」的颠覆性技术。期望 AI 发现「人类无法发现的漏洞」仍是不切实际的幻想。

### cURL 作为测试基准的代表性
cURL 是全球最广泛部署的开源项目之一，其代码库经历了 30 年的安全审计和数百名维护者的审查。选择 cURL 作为 Mythos 的测试目标，实际上是一个「hard target」——在这里发现新漏洞的边际难度远高于新兴项目。Stenberg 坦诚地说：「cURL code is no stranger to AI」——项目团队已在 8-10 个月内通过 AI 工具修复了数百个问题。在这种「已充分审查」的代码基础上，Mythos 的边际贡献有限是符合预期的结果，而非 Mythos 本身的失败。真正有意义的测试应该是：在同等资源下，Mythos 相比人类安全研究员的 bug 发现率是否显著更高？目前的数据不支持这一结论。

### 信息安全社区对 AI 的复杂心态
Stenberg 的立场微妙地介于「AI 怀疑论」和「AI 实用主义」之间。他明确关闭了 cURL 的 bug bounty 计划（因为「AI slop」——低质量 AI 生成的 bug 报告泛滥），但同时承认「AI powered code analyzers are significantly better at finding security flaws and mistakes in source code than any traditional code analyzers did in the past」。这种矛盾反映的是信息安全社区对 AI 的核心焦虑：AI 提升了噪声（noise）而非信号（signal），大量无用的 bug 报告实际上消耗了维护者的有限精力。这一现象与安全社区对 AI 的更广泛讨论一致：AI 是威胁（自动化攻击）还是工具（自动化防御），取决于使用者的意图和能力。

## 实践启示
### 对 AI 安全工具开发者
1. **预期管理至关重要**：Mythos 案例表明，过度承诺「革命性突破」会反噬行业信任。开发者应采用更保守的能力声明，提供可验证的基准对比（与 SOTA 模型/人类研究员的对照实验）。
2. **测试基准标准化**：行业需要统一的 AI 安全工具评估基准（类似 SUPERNEMO、CVE 预测挑战赛），避免每个厂商自行声明能力而无客观验证。
3. **假阳性（False Positive）率的公开**：Stenberg 发现 Mythos 5 个报告中有 3 个是假阳性，这提示开发者应将「Precision@K」作为核心指标公开，而非仅宣传漏洞总数。

### 对开源项目维护者
1. **AI 辅助审计的务实态度**：AI 工具最适合用于「扩大漏洞搜索覆盖面」而非「替代人工审查」——将 AI 定位为初级审查员，人工复核作为最终关卡。
2. **对抗 AI slop 的流程建设**：Stenberg 关闭 bug bounty 是防御性举措。更建设性的方案是建立「AI 报告预处理 pipeline」：自动聚类、去重、初步分类，减少维护者的筛选成本。
3. **Prompts 的专业化**：Stenberg 指出「Human researchers have always used tools... Adding AIs to the mix gives the humans even more powerful tools to use」，暗示 prompt 工程（prompt engineering）是释放 AI 潜力的关键——维护者应投入时间设计针对项目特性的 prompts。

### 对安全研究员
1. **差异化能力培养**：Stenberg 的判断暗示，AI 时代的「真正价值」在于发现「AI 无法发现的漏洞类型」——这需要深入理解代码上下文、业务逻辑和攻击者视角，而非仅依赖模式匹配。
2. **AI 辅助工作流整合**：掌握 AI 代码分析工具（如 CodeQL、Semgrep、GPT-4o code analysis）是基础技能，但「如何向 AI 提问」和「如何验证 AI 输出」将成为区分高级研究员和初级研究员的关键。
3. **对新类型的敏感度**：Stenberg 提到「novel kind of vulnerabilities」——关注 AI 模型在多模态、跨语言、协议层等边界地带可能发现的非常规漏洞类型。

### 对企业安全团队
1. **AI SAST 的采购评估**：Mythos 案例提示，不应仅凭厂商声明的「AI 驱动的漏洞发现」就做采购决策——应要求厂商提供与项目同类型的代码库盲测结果，重点关注 Precision 和 Recall 的平衡。
2. **AI 报告的人工复核不可省略**：企业安全团队应建立 AI 扫描报告的复核流程，假阳性率过高会消耗宝贵的修复资源。
3. **开发者教育**：Mythos 事件是一个窗口，让工程团队理解 AI 安全工具的当前局限性——它们是「增量增强」而非「替代方案」，开发者仍是安全的最终责任人。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/2026.md)

### 对政策制定者
1. **AI 安全工具的营销监管**：如果 AI 厂商使用「危险到不能发布」等表述作为营销策略，监管机构应评估这是否构成误导性声明。
2. **开源安全生态的支持**：cURL 这样关键开源项目的安全维护几乎完全依赖志愿者——公共资金对 AI 安全工具开发的投入，应以「提升开源生态安全」为主要目标，而非仅服务商业客户。

---

