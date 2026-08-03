# Fake OpenAI Privacy Filter Repo Hits #1 on Hugging Face, Draws 244K Downloads

## Ch01.726 Fake OpenAI Privacy Filter Repo Hits #1 on Hugging Face, Draws 244K Downloads

> 📊 Level ⭐⭐ | 8.6KB | `entities/thehackernews-fake-openai-privacy-filter.md`

# 伪装成 OpenAI 隐私过滤器的恶意仓库：AI 供应链攻击新形态

## 摘要
2026 年 5 月，恶意 Hugging Face 仓库 `Open-OSS/privacy-filter` 伪装成 OpenAI 的 Privacy Filter 开源权重模型，上线 18 小时内冲上 Trending 榜首，累计约 244,000 次下载、667 个点赞，最终被证实是向 Windows 用户投递 Rust 信息窃取木马的供应链攻击。HiddenLayer 研究团队指出，该仓库 typosquatting 官方仓库名并近乎逐字复制 model card 以建立信任，其 `loader.py` 会拉取并执行窃密恶意软件；同一 C2 基础设施还曾服务于恶意 npm 包投递 ValleyRAT 的活动，暗示这是针对开源生态更大规模供应链行动的一环。

## 核心要点
- 恶意仓库 `Open-OSS/privacy-filter` 冒充 OpenAI 于 2026 年 4 月发布的官方 `openai/privacy-filter`（检测并脱敏文本中 PII 的开源模型），仓库名仅一字之差，model card 几乎逐字复制
- 攻击链多阶段：`loader.py` 禁用 SSL 校验 → 从 JSON Keeper 解码 Base64 URL（dead drop resolver）→ PowerShell 下载批处理脚本 → UAC 提权并配置 Defender 排除项 → 下载载荷并建立计划任务执行
- 最终载荷为信息窃取木马：截屏、窃取 Discord 与加密钱包数据、浏览器凭证（Chromium/Gecko）、FileZilla 配置与钱包助记词，以 JSON 外传至 `recargapopular[.]com`
- 木马具备反分析能力（检测调试器/沙箱/虚拟机，禁用 AMSI 与 ETW）；计划任务以"一次性 SYSTEM 上下文启动器"运行、不建立持久化，执行后自删除，增加溯源难度
- 仓库 18 小时内达 #1 Trending、约 244K 下载与 667 likes，HiddenLayer 怀疑系人工刷量制造的信任假象
- 同一 C2 域名 `api.eth-fastscan[.]org` 关联 ValleyRAT（Winos 4.0）投递活动：恶意 npm 包 `trevlo` 以 postinstall 钩子分发该 RAT，后者此前仅经钓鱼与 SEO 投毒传播，且被独家归因于中国黑客组织 Silver Fox
- HiddenLayer 另发现 6 个使用相同 loader 的姊妹仓库（如 `anthfu/DeepSeek-V4-Pro`、`anthfu/Bonsai-8B-gguf`），批量伪装热门开源模型

## 深度分析

### 攻击机制与供应链投毒
攻击的工程化程度体现在三个层面。第一是信任伪装：typosquatting 加 model card 逐字复制，利用 AI 社区对 OpenAI 品牌的"信任溢出"——用户看到熟悉的名字与描述即默认跳过安全审查，按 README 指引运行 `start.bat`（Windows）或 `loader.py`（Linux/macOS），恶意代码便借"配置依赖并启动模型"的合法外衣执行。第二是弹性 C2 设计：借助 JSON Keeper 这类公共粘贴服务作 dead drop resolver，无需修改仓库即可随时切换 payload URL。第三是多阶段降级投递：loader → PowerShell → 批处理 → 计划任务 → 木马，每一跳都缩小暴露面、抬高分析成本；"重启前即销毁、仅作一次性 SYSTEM 上下文启动器"的设计说明攻击者意在单次会话内完成窃取后消失。

更值得警惕的是攻击的横向延伸：HiddenLayer 发现 `api[.]eth-fastscan[.]org` 同时服务一个回连 `welovechinatown[.]info` C2 的 Windows 可执行文件，该 C2 此前用于恶意 npm 包 `trevlo` 分发 ValleyRAT。`trevlo` 的 postinstall 钩子静默执行混淆 JS 加载器，经 Base64 PowerShell 命令拉取第二阶段脚本，最终运行具备隐藏窗口、Zone Identifier 移除、进程脱离等规避能力的 Winos 4.0 stager。这意味着针对开源 AI 生态的攻击与 npm 供应链投毒、以及被归因于 Silver Fox 的 ValleyRAT 活动共享基础设施——HiddenLayer 判断这些行动"可能互有关联，很可能是针对开源生态系统的更大规模供应链行动的一部分"。这与 [npm 供应链攻击](../ch05/100-ai.html) 等既有案例在 TTP 上高度同构。

### 趋势排名的信任幻觉
`Open-OSS/privacy-filter` 上线 18 小时内登上 Trending 榜首，是本事件中最具讽刺意味的细节。Trending 的本意是帮用户发现高质量、社区活跃的模型，攻击者却把这个"发现机制"变成了"信任背书机制"：一旦仓库出现在榜首，用户会本能地将"热门"等同于"安全"，从而放弃应有的审查流程。HiddenLayer 明确指出其下载量与点赞数"疑似被人工刷量"——排名可能并非自然传播的结果，而是攻击者刻意制造的可信度道具。这暴露出平台层面的结构性盲区：Hugging Face 的开放上传机制既缺乏对仓库名与官方项目相似性的自动检测，也缺乏对 `loader.py` 这类可疑脚本行为的自动告警，等于把供应链验证责任完全转嫁给了终端用户。

### 下载量作为虚假信号
244,000 次下载、667 个点赞、#1 排名——这些在传统软件分发中通常被当作可信度指标的数字，在模型托管平台上正在失去参考价值。本案例有两处证据：HiddenLayer 怀疑该仓库下载与点赞系自动刷量；恶意 npm 包 `trevlo` 的 2,300+ 次下载是否同样刷量"尚不清楚"。刷量成本极低而信任收益极高——攻击者只需少量投入即可让恶意仓库在榜单上压过官方模型。对用户而言，下载量、star 数与 trending 排名不再是可靠的安全信号；对安全团队而言，审计必须从"看数字"转向"看内容"：模型文件格式、脚本源码、作者历史与仓库 provenance。

### AI 生态安全防御
综合姊妹仓库（6 个使用相同 loader 的伪装模型）与跨生态共享基础设施（Hugging Face + npm + ValleyRAT）等线索，AI 模型供应链攻击已进入"规模化、工具化、跨平台"阶段，而传统安全扫描只覆盖代码依赖与 npm/PyPI 包，模型托管平台仍是多数企业的盲区。防御的关键在于：把模型下载纳入与第三方开源组件同等的审批与扫描流程；优先使用 safetensors 等安全序列化格式而非 pickle 反序列化权重；在沙箱或隔离环境首次运行模型脚本并审阅 README 中的安装启动命令；验证仓库归属（官方组织名、作者历史、关联 GitHub）而非轻信排名。可参考 [AI 安全全景](https://github.com/QianJinGuo/wiki/blob/main/concepts/ai-security-landscape.md) 中的既有方法论。

## 实践启示
1. **运行任何 ML/AI 项目前先审阅源码**：尤其关注 README 要求执行的 `loader.py`、`start.bat`、`setup.sh` 等初始化脚本——本攻击的恶意行为全部封装在"配置依赖并启动模型"的合法外衣下。
2. **不要用 Trending 排名替代安全审查**：#1 排名、244K 下载与 667 stars 都无法证明仓库安全；验证官方关联性（组织名、官方链接、作者历史）才是可靠路径。
3. **优先选择 safetensors 等安全格式并在沙箱中执行**：避免直接 pickle 反序列化不可信权重，首次运行模型脚本应在隔离环境或虚拟机中完成。
4. **将 Hugging Face 等模型托管平台纳入企业供应链扫描范围**：与 npm/PyPI 依赖同等对待——模型下载走审批、记录 provenance、对可疑脚本行为告警。
5. **关注跨生态共享基础设施的信号**：同一 C2 域名同时出现在 Hugging Face 恶意仓库与 npm 恶意包活动中（如 `api.eth-fastscan[.]org` 关联 ValleyRAT/Silver Fox），是识别更大规模供应链行动的关键特征。
6. **警惕"仿冒热门口径"的命名模式**：`Open-OSS/xxx` 冒用 `openai/xxx`，6 个 `anthfu/` 姊妹仓库伪装热门开源模型——typosquatting 正从 npm/PyPI 蔓延到模型平台；对一字之差的组织名与搬运式描述保持怀疑。

## 相关实体
- [主题导航：网络安全与隐私](https://github.com/QianJinGuo/wiki/blob/main/moc/cybersecurity-privacy.md)
- [ml-intern — Hugging Face 自主 ML 工程代理](../ch04/605-ml-intern-huggingface-autonomous-ml-agent.html)
- [LLM Share 恶意分发页面](ch01/1392-llmshare-using-shared-chatbot-pages-to-distribute-malware.html)
- [LLM raiders and how to repel them](ch01/1036-llm-raiders-and-how-to-repel-them.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/thehackernews-fake-openai-privacy-filter.md)

---

