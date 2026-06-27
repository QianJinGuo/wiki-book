# Fake OpenAI Privacy Filter Repo Hits #1 on Hugging Face, Draws 244K Downloads

## Ch01.671 Fake OpenAI Privacy Filter Repo Hits #1 on Hugging Face, Draws 244K Downloads

> 📊 Level ⭐⭐ | 4.8KB | `entities/thehackernews-fake-openai-privacy-filter.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/thehackernews-fake-openai-privacy-filter.md)

## 关键要点
- 攻击者在 Hugging Face 上发布假冒 OpenAI 隐私过滤器仓库
- 仓库被下载 244,000 次，实际为恶意软件
- 攻击者利用 AI 社区对隐私工具的信任
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/thehackernews-fake-openai-privacy-filter.md)

## 深度分析
这起事件是 AI 开源生态系统中供应链攻击的典型案例，具有多个值得深入剖析的维度：
**1. Typosquatting + 信任溢出的组合攻击**
攻击者使用了双重伪装策略：仓库名 `Open-OSS/privacy-filter` 与官方 `openai/privacy-filter` 仅一个字符之差，同时完整复制了官方 model card 的描述。这种攻击利用了 AI 社区对 OpenAI 品牌的信任溢出效应——用户在看到熟悉的产品名称和描述时，会默认通过安全审查。244,000 次下载量和 18 小时内的 #1 排名说明，Hugging Face 的Trending 算法本身助长了这一扩散。
**2. 多阶段攻击链设计**
恶意代码的执行路径展示了高度工程化的攻击模式：

- `loader.py` → 禁用 SSL 验证 → 从 JSON Keeper 获取 payload URL → PowerShell 下载批处理脚本 → UAC 提权 → 配置 Microsoft Defender 排除项 → 下载最终木马 → 建立计划任务执行 → 自删除
- JSON Keeper 作为 dead drop resolver 允许攻击者随时切换 payload 而无需修改仓库本身
**3. 信息窃取木马的技术特征**
最终的恶意软件具备完整的间谍工具包：屏幕截图、Discord 和加密货币钱包数据、浏览器凭证（Chromium/Gecko）、FileZilla 配置、钱包种子短语，并通过 ETW 禁用和 AMSI 绕过实现持久对抗检测能力。值得注意的是攻击者使用"one-shot SYSTEM-context launcher"而非持久化机制——这说明目标是在特定会话中完成数据窃取后即消失，增加溯源难度。
**4. 共享基础设施揭示更大攻击面**
HiddenLayer 发现同一 C2 域名 `api.eth-fastscan[.]org` 同时服务于 ValleyRAT（通过恶意 npm 包 trevlo 分发）。这表明针对开源 AI 生态的攻击与传统的 APT 攻击（如 Silver Fox）可能共享基础设施和TTPs，属于同一更大规模供应链行动的一部分。
**5. Hugging Face 的安全模型缺陷**
Hugging Face 的开放上传机制 + Trending 排名算法创造了两个安全盲区：缺乏对仓库名称与官方项目相似性的自动检测，以及缺乏对 `loader.py` 等可疑脚本执行行为的自动告警。

## 实践启示
- **在任何 ML/AI 项目的 README 执行命令前，检查脚本源码**：特别是 `loader.py`、`start.bat`、`setup.sh` 等初始化脚本。此类攻击的核心是利用用户对"官方项目"的信任惰性。
- **Hugging Face 的 Trending 不等于安全认证**：在 244K 下载量和 667 stars 面前，安全审查不应该被省略。即使是热门项目，也应验证仓库的官方关联性（如检查 GitHub 官方链接、Stars 历史、贡献者数量）。
- **检查包管理器来源的完整 URL**：此事件中，npm 恶意包 `trevlo` 通过 `titaniumg` 用户分发。对于 ML 模型，验证作者账户历史和关联仓库是必要步骤。
- **企业应将 AI 模型供应链安全纳入安全扫描范围**：多数企业安全扫描覆盖了代码依赖和 npm/PyPI 包，但 Hugging Face 这类模型托管平台目前仍是盲区。将模型下载纳入安全审批流程，与第三方开源组件同等对待。
- **关注 TPR（Third-Party Risk）评估中的 AI 组件**：随着 Drata 等平台将 AI 问卷自动化引入安全评估，伪造的 AI 工具/模型本身可能成为进入企业安全评估流程的跳板。

## 相关实体
> 主题导航

- [ml-intern — Hugging Face 自主 ML 工程代理](/ch04-417-ml-intern-huggingface-autonomous-ml-agent/)
- [Adversaries Leverage AI for Vulnerability Exploitation, Augmented Operations, and Initial Access](/ch12-036-adversaries-leverage-ai-for-vulnerability-exploitation-augm/)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/2026.md)

- [LLM raiders and how to repel them](/ch01-590-llm-raiders-and-how-to-repel-them/)

---

