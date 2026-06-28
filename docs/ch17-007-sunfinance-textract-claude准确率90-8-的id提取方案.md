## Ch17.007 SunFinance: Textract+Claude准确率90.8%的ID提取方案

> 📊 Level ⭐⭐ | 7.9KB | `entities/aws-sun-finance-ai-id-extraction-fraud-detection.md`

## 核心内容
SunFinance将AWS Textract（文档 OCR）+ Claude（智能理解）结合，ID提取准确率从79.7%提升至90.8%，成本降低91%。系统每月处理330万次ID验证，支撑信贷审批全流程。

## 三个关键洞察
### 1. Hybrid Textract+Claude架构
Textract负责基础OCR（文本提取），Claude负责语义理解（判断提取内容是否合法、与表单关系）。两者组合比分用各自单独使用效果更好——OCR做好结构化提取，LLM做最终判断。

### 2. 准确率提升的工程路径
79.7%→90.8%的提升来自：① 预处理优化（图像增强提升OCR质量）② prompt工程优化（让Claude更准确地判断字段关系）③ 反馈循环（将Claude的错误案例加入训练数据）。非一蹴而就。

### 3. 91%成本降低的来源
从自建CV模型（需要GPU服务器、维护团队）→ Textract API调用（serverless，按调用计费）+ Claude API。成本结构从固定成本变成可变成本，规模效应显著。

## 与知识库的连接
- → [OS-level Actions](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aws-bedrock-agentcore-os-level-actions-browser.md)：未来Agent可替代人工完成整个ID验证流程
- → [LLM-as-Judge](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aws-reinforcement-fine-tuning-llm-as-judge.md)：Claude做ID判断本质上是做judge

## 深度分析
### OCR+LLM混合架构的内在逻辑
SunFinance案例验证了一个核心原则：专业化工具做擅长的事，LLM做理解判断。Amazon Textract负责可靠的字符级OCR提取，Claude负责语义层面的结构化理解。两者组合的关键在于——OCR做好结构化提取，LLM做最终判断——这比让LLM直接处理图像更有效，因为LLM的PII保护机制会阻碍直接从身份证件提取敏感信息 。

### Claude的PII保护机制是直接用LLM做ID提取的核心障碍
测试显示单独使用Claude Sonnet 4进行ID提取只有61.8%准确率，甚至低于79.7%的基线。根本原因不是模型能力不足，而是Claude内置的隐私保护机制——它会主动拒绝从身份证件等敏感文档提取PII信息 。这解释了为什么混合架构中LLM必须位于OCR之后而非之前。

### 多层OCR降级策略的工程意义
采用Textract（主）+ Rekognition（备）的双层OCR设计，用额外的一次API调用换取系统韧性。当Textract返回低置信度结果时自动降级到Rekognition，这种设计避免了单点失败，尤其在处理低质量扫描、异常角度或损坏证件时效果显著 。

### 向量相似度搜索的选型教训
欺诈检测中背景相似度分析揭示了文本嵌入与视觉嵌入的本质差异：文本嵌入（Claude描述背景后比对）达到91%准确率但精确率仅27.8%、召回率21.7%；视觉嵌入达到96%准确率、80%精确率、52%召回率 。直接用多模态Embedding做向量化的路线显著优于先做文本描述再做匹配的路线。

## 实践启示
### 1. 文档处理场景优先考虑混合架构
当处理身份证、发票、合同等结构化文档时，OCR+LLM的混合方案通常优于单独使用任何一种技术。关键是把"字符提取"和"语义理解"分离，让专业OCR处理字符级任务，LLM专注于关系判断和格式标准化 。

### 2. 验证规则是提升准确率的低成本高回报手段
SunFinance在OCR+Claude之后加入了ID号码格式化验证、日期标准化、文档类型规范化等规则，这些规则"捕捉住了OCR提取了正确字符但格式不一致的边缘情况" 。对于中国身份证、营业执照等有明确格式规范的文档，格式校验规则应该是标准配置。

### 3. Serverless架构支持快速迭代
6周的概念验证周期内技术方案每周都在演进，AWS Lambda+Step Functions的serverless设计允许团队"修改和部署单个Lambda函数而不需要停机" 。这对于需要快速试错的生产AI项目至关重要。

### 4. 欺诈检测需要多层防御
单一欺诈检测方法的召回率永远不够。视觉模式检测（检测屏幕照片、数字篡改）单独使用时对已知模式有95%+置信度；背景相似度检测（检测欺诈团伙）单独使用时对已知模式召回率仅55%、对新模式16.7%。两者组合才能覆盖不同类型的攻击向量 。

### 5. 成本结构转型释放新市场
从自建CV模型（GPU服务器+维护团队=固定成本）→ Textract API + Claude API（serverless+按调用计费=可变成本），91%成本降低使低价值贷款场景首次具备经济可行性 。对于服务小微信贷、助贷等低毛利场景，成本结构的优化直接决定了业务是否成立。
---
*Source: [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aws-sun-finance-ai-id-extraction-fraud-detection.md)*

## 相关实体
- [AI Detection and Response (AIDR): A Zero-Impact Operating Model](ch12-068-glasswasm-webassembly-malware-found-in-trojanized-open-vsx.html)
- [AWS Model Agility: 6步LLM跨代际迁移框架](ch11-143-aws-generative-ai-model-agility-framework.html)
- [Securing AI agents: How AWS and Cisco AI Defense scale MCP and A2A deployments](ch07-027-securing-ai-agents-aws-cisco-ai-defense-给-mcp-a2a-加上企业级.html)
- [MLflow v3.10：生成式AI开发新特性](ch11-038-aws-mlflow-v310-generative-ai-development.html)
- [用 Kiro构建 AI：基于 AWS 基础设施快速构建企业级 Agentic AI 平台 | 亚马逊AWS官方博客](ch04-144-用-kiro构建-ai-基于-aws-基础设施快速构建企业级-agentic-ai-平台-亚马逊aws官方博客.html)
- [AI 驱动的跨云网络搭建：用 Claude Code 和 Kiro CLI 实现 AWS-腾讯云 IPSec VPN 双隧道互联 | 亚马逊AWS官方博客](ch09-009-ai-驱动的跨云网络搭建-用-claude-code-和-kiro-cli-实现-aws-腾讯云-ipsec-vpn-双.html)
- [在 Amazon Bedrock 上为 Claude 应用设计稳健的 Prompt Cache 策略](ch11-058-amazon-bedrock-claude-prompt-cache.html)
- MOC

---
