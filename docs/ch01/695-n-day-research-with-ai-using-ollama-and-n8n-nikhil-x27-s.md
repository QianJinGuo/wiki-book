# N-Day Research with AI: Using Ollama and n8n | Nikhil&#x27;s Cybersec Blog

## Ch01.695 N-Day Research with AI: Using Ollama and n8n | Nikhil&#x27;s Cybersec Blog

> 📊 Level ⭐⭐ | 6.6KB | `entities/ghostbyt3-github-io-blog-nday-research-ai.md`

# "N-Day Research with AI: Using Ollama and n8n | Nikhil&#x27;s Cybersec Blog"
# N-Day Research with AI: Using Ollama and n8n | Nikhil&#x27;s Cybersec Blog
|N-Day Research with AI: Using Ollama and n8n | Nikhil&#x27;s Cybersec Blog Gh0stByt3 Blog Tags About Home Blog Tags About Published on March 21, 2026 N-Day Research with AI: Using Ollama and n8n Research Background I have been working on N-day research for the past year, focusing specifically on Microsoft components. During this time, I developed several tools to support and streamline my research. Some of these tools include: Diffrays - https://github.com/pwnfuzz/diffrays It leverages IDA Pro and the IDA Domain API to extract pseudocode of functions and perform structured diffing between patched and unpatched binaries. WinDriver-EXP - https://github.com/ghostbyt3/WinDriver-EXP This repository includes PoC exploits for vulnerabilities in Windows drivers, showcasing flaws that can result in privilege escalation, arbitrary code execution, or other security risks. Ghidra-Headless-VT - https://github.com/ghostbyt3/ghidra-headless-vt Simple Python scripts to automate Ghidra&#x27;s version tracking from the command line. Nday-Automation - Private This utilizes the MSRC API to find specific components, runs Ghidra Headless VT, generates a report, and sends it to Notion for further manual analysis. Since there is a growing trend toward AI-driven analysis, I wanted to evaluate whether an AI model could analyze patched and vulnerable functions and independently identify the underlying vulnerability. This approach could be especially useful for initial triage and enabling faster analysis. So, I decided to experiment with the tools I already have and extend my workflow further. I started by deploying a local LLM and building from there. Local LLM Setup It is pretty easy to deploy a local LLM with Docker and Ollama, this is not a guide but it might help to get start with it. Also, choosing a proper model is based on your machine. Having a powerful GPU gives you better LLM to be run locally. Let’s start with installing Ollama in docker. docker run -d -v ollama:/root/.ollama -p 11... [truncated]

## 深度分析
### 1. 技术架构分层
该方案并非单点工具，而是形成了**三层架构**：
| 层级 | 组件 | 职责 |
|------|------|------|
| 提取层 | Ghidra Headless VT / Diffrays | 从补丁/漏洞二进制中提取函数级差异 |
| 分析层 | Ollama (qwen3-coder:30b) + n8n AI Agent | 基于 RAG context 进行漏洞推理 |
| 知识层 | Qdrant 向量数据库 | 存储历史 CVE 笔记、博客文章，形成知识检索增强 |
这是一个**自动化漏洞初筛系统**的典型设计思路——不追求 AI 直接输出精确 CVE 编号，而是通过结构化 diff + LLM 推理生成候选报告，供人工复核。

### 2. RAG 集成的实际价值
作者在 n8n 中引入了三个 RAG 输入源：

- RSS Feed 订阅安全博客
- 手动 URL 提交
- 文档直接上传
这些数据经 embedding model (qwen3:embedding) 转为向量后存入 Qdrant。AI Agent 在分析目标函数时，会先检索向量库中的相关上下文，再生成报告。这一步至关重要——直接让 LLM 从零分析陌生的二进制 diff 效果很差，但有历史漏洞模式作为参考，检索增强能显著提升推理准确性。

### 3. Token 瓶颈与工程妥协
模型上下文窗口是核心限制。作者使用 tiktoken 计算 token 长度，将 prompt 压缩到约 20k tokens 以确保模型有足够 reasoning space。这直接导致：

- 无法一次性发送所有补丁函数 diff
- 可能漏掉实际漏洞所在的 patched function
- 依赖人工经验选择优先分析的函数
这是当前架构的**最大工程取舍**——以 token 换推理质量。

### 4. 与传统 N-day 研究流程的对比
| 维度 | 传统方式 | 本方案 |
|------|----------|--------|
| 人工介入点 | 全程需要 | 仅初筛 + 报告复核 |
| 速度 | 慢，单个 CVE 可能需数天 | 快，自动化流水线 |
| 准确性 | 高（专家判断） | 中等（LLM 幻觉限制） |
| 成本 | IDA Pro 授权 + 人力 | 消费级 GPU + 开源模型 |
本质上这是一个**人机协同**的定位，而非全自动漏洞发现。

## 实践启示
1. **小模型足够做初筛**：4B 参数的 qwen3:4b-q4_K_M 可本地运行，30B 的 qwen3-coder:30b 用于分析阶段——分层使用模型能兼顾速度与推理能力。
2. **n8n 作为工作流编排层**：低代码可视化 workflow 降低了自动化流水线的搭建门槛，特别适合串联 webhooks、数据处理节点和 AI Agent。
3. **RAG 是必要投资**：没有历史上下文库，纯 LLM 分析二进制 diff 的效果会大打折扣。对于专注特定厂商（本文是 Microsoft）的安全研究员，建议持续积累该厂商的 CVE 分析笔记并向量化。
4. **自动化报告不等于最终结论**：生成的报告应作为人工审查的起点，而非直接提交。LLM 可能在相似代码模式上产生合理但错误的推断。
5. **上下文窗口管理是工程难点**：实际部署时需要像作者一样，用 token 计算工具动态裁剪输入，而非简单截断。
6. **开源工具链可行性**：整个链路（Docker + Ollama + n8n + Qdrant + Ghidra）均可免费搭建，对于资源有限的独立安全研究员具有较高的参考价值。
## 相关实体
- [Affirmmapsroadto100Bgmvwithcardaicommerc](../ch05/090-ai.html)
- [Amazon Quick Research Agentic Multi Source Citation](../ch11/217-amazon-quick.html)
- [Building Web Search Enabled Agents With Strands And Exa](../ch04/446-building-web-search-enabled-agents-with-strands-and-exa.html)
- [Build Real Time Voice Streaming With Amazon Nova Sonic And Webrtc](../ch11/286-amazon-nova.html)
- [Fine Tune Llm With Databricks Unity Catalog And Amazon Sagemaker](ch01/637-fine-tune-llm-with-databricks-unity-catalog-and-amazon-sagem.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/ghostbyt3-github-io-blog-nday-research-ai.md)

---

