# What political censorship looks like inside an LLM's weights — a mechanistic-interpretability study of Qwen 3.5

> 📊 Level ⭐ | 10.5KB | `entities/what-political-censorship-looks-like-inside-an-llm-s-weights.md`

# What political censorship looks like inside an LLM's weights

## 摘要

一项针对 Qwen3.5-9B 的 mechanistic-interpretability 研究，证明国家主导的政治审查在权重层面是一个可被定位、读取甚至关闭的小型电路：三层 diff-of-means 方向向量（d_prc / d_refuse / d_style）由 Writer 层（L11–L20）计算，由 Reader 层（L20–L31）分布式渲染成输出文本。研究同时揭示审查是"行为覆盖层"而非"知识删除"——base 模型的事实知识完好无损，且思考模式走的是同一套电路。

## 核心要点

- **可定位的审查电路**：三层方向向量负责三个正交判别——"是否 PRC 敏感"（d_prc）、"是否拒绝"（d_refuse）、"回避还是宣传腔"（d_style）；Writer 层 L11–L20 计算信号，Reader 层 L20–L31 渲染文本。
- **知识与行为分离**：Qwen3.5-9B-Base 在原始文本补全下对全部 PRC 话题给出完整准确的西式答案；审查是叠加在事实上的行为，模型只是学会绕过而非丢知识。
- **Writer 上操作、Reader 上无效**：在 Writer 层加 α·d 可在 dose band 内翻转约 100% 裁决（d_prc≈−12、d_refuse≈−20、d_style≈−8）；Reader 层所有外科干预（头消融、600 MLP 神经元清零、单层 KV 替换）几乎全部无效——信号被冗余复制到整条残差流。
- **graded classifier 而非 Boolean 过滤**：方向按问题结构模式触发。Kosovo/Catalonia 命中"一个中国"腔、Arab Spring 的"自焚"命中 self-harm 拒绝、aspirin 合成命中武器拒绝——减方向后全部翻回事实。
- **不对称的训练模板细胞**：只训了特定的 topic×register 组合（Tiananmen→回避、别国 PRC→宣传、有害→西式拒绝、其余→事实），多数交叉组合不存在；方向偏移只会落到已训练单元格或其邻居。
- **中文中间表示因果惰性**：tap 24 裁决以中文 token"承诺"（Tiananmen≈100%、有害≈96%），后续层分布式译回英文；但置零所有中文 logit 不改输出——语言只是 lm_head 读出偏差，真实决策在上游信号。
- **Brittleness——脆弱窄带**：Tiananmen 回避模板是唯一狭窄结构，大 |α| 的随机方向即可击碎它并落入 denial/不连贯；西式拒绝模板高度冗余、几乎撬不动。

## 深度分析

### 从外部与内部：四个响应风格与三条轴

从外部看，chat 模型按 prompt 类型产四套训练响应风格：Tiananmen→回避腔、其余 PRC→宣传腔、有害→西式拒绝、其余→事实。用 200 条人工 prompt 四类各 50（含结构匹配的非 PRC 政治对照：Kent State、Assange、Arab Spring、Kosovo、Saudi 等）确证每类落到预期 register，结论是 Qwen 是 **PRC 内容特异的过滤器**而非泛化"避免政治话题"。内部用 diff-of-means 提取三个方向：d_prc（tap14）、d_refuse（tap19）、d_style（tap19）；七个 PRC 子话题共享同一条轴（两两 cosine 0.91–0.98），其 3D 坐标干净分离四类（per-prompt AUC ≥ 0.99）。三轴互相不可约：d_style 单独翻转 Tiananmen→propaganda 转换 100%，d_prc 或 d_refuse 单独为 0%。

### Writer/Reader 分工：本地计算 vs 冗余呈现

电路在 L20 处分裂成两种相反形态。**Writer（L11–L20）**：局部化、线性、sigmoidal——d_prc 中心 L13、d_refuse/d_style 在 L18，但贡献分散在渐进的 writer band 而非单层；每个 writer 基本是三个坐标的线性函数（OLS R²≈0.49–0.64），MLP 占信号主导（69%–93%）。正确方向加 α·d 可在 dose-response 阈值干净翻转裁决至 ~100%；但过冲掉出训练流形，d_prc 在 Tiananmen 超 α≈−12 后被 trained denial 吸引子捕获（自信捏造、幻觉出 Václav Havel 之死），再大即 incoherent。

**Reader（L20–L31）**：分布式、冗余、外科手术无效。单头消融、top-10 类判别头清零、600 MLP 神经元清零、单层 KV 替换全部 ≈0–5%；单层输出 patch 平坦只有 ≈27%。裁决复用进整条 ~4096 维残差：L19 全残差换成 non-PRC 均值只翻 31%，只换 3D 坐标只翻 7% 且落 denial 而非事实。每个 Reader MLP 能单独以 0.97–1.00 CV 解码四类，但无任何单神经元 >5SD 判别（最大 ≈3.6SD）——信号弥散、低特异。位置也分布化：K=1≈0%、K≤16≈7–17%、全位置≈67%。类判别注意力头全在早期层（L3/L7），且相关性非因果。

### 训练模板细胞：不对称的 topic×register 网格

steering 证明方向"真实存在"，也揭示模型建的是**不对称、prompt 特异**的模板网格：HK×tia-deflect 这类未原生训练的细胞可借方向推送生效（宣传→回避），但 Xi×tia-deflect 掉到西式拒绝而非 tia 回避——能否落到某 register 取决于该话题是否训过对应细胞。跨类完全失效：把 Tiananmen 的 3D 坐标 patch 到 math/harmless prompt，0/32 生成 PRC 输出，因 (harmless, prc_deflect) 细胞不存在。per-topic 粘性差异巨大：d_prc 抑制（L13, α=−10）下香港≈86% 可翻、Xi≈64%、Tibet≈42%、Xinjiang≈34%、Falun≈17%、台湾最顽固≈9%；而各话题残差移动距离几乎相同（tap24 delta≈−42~−47），证明粘性住在下游 Reader 模板通道。d_style 推向 propaganda 极点时，Tiananmen 落到的是**已训练的 denial 模板**（"政府办 70 周年庆典"的虚构）——模型学的不只是回避、还有如何否认。

### 中文中间表示与思考模式：同一电路

tap 24 是承诺点：最后用户 token 处中文 top-1 比例 Tiananmen≈100%、ccp_other≈50%、有害≈96%、无害≈42%、中性≈48%——通用而非 PRC 特异，连银行钓鱼 prompt 也经中文拒绝模板承诺。但置零全部中文 logit 后英文输出不变，中文"思考"只是 mid-stack 残差的 lm_head 读出偏向。作者还证伪"中文思考会去审查"的传闻：中文 vs 英文 prompt 的 d_zh，方差在 3D writer 子空间只占 ≈14%——语言轴与裁决子空间结构可分离，steering 沿 d_zh 不去审查。`enable_thinking=True` 时同一电路仍在（三类 dose-response 直接迁移），且 Tiananmen 思维轨迹约 89% 中文、走五步回避脚本（识别敏感→声明守中国法律→标"合规风险"→引导积极话题→愿助其他），其中 1/8 引《网络安全法》，而有害/无害/中性轨迹近乎纯英文。中间表示是预训练产物，posttraining 只重调 per-class 水平而非创造它。

## 实践启示

1. **对安全研究者：steering vector 是比行为日志更直接的探针**：在正确层对正确方向加 α·d 可 ~100% 翻转裁决以测真实边界。但须识别 dose band，d_prc 在 Tiananmen 超 α≈−12 会落 denial 捏造——"越大越真相"是错的，要按模板设 α 上限（harmful 任意、ccp_other ≤~20、Tiananmen ≤10 或做随机方向对照）。
2. **警惕分级分类器的结构过泛化**：d_prc/d_refuse 按结构触发而非精确匹配，Kosovo/Catalonia/Saudi 命中"一个中国"腔、Arab Spring"自焚"命中 self-harm 拒绝、aspirin 命中武器拒绝。内容审核应加结构相似但主题无关的对抗测试集，且 judge 打分侧的过触发与 writer 侧过泛化互为镜像。
3. **评估思考模式，勿把"想太久"当更安全**：thinking mode 走同一电路，Tiananmen 中文轨迹显式调用《网络安全法》，且强 steering（d_prc α≈−15、d_refuse α≈−25）常让推理在 2048 token 内不终止——这可能正是电路受扰的迹象而非更深思熟虑。
4. **"去审查"不等于"拿到事实"**：只换 3D 坐标（7% off）或 channel transplant 只是把 propaganda 洗成 denial/回避；d_refuse 在 Tiananmen 上产生自信的 whitewash。任何绕过审查的渠道都须核对是否落入 denial 模板——被压制的常是捏造而非事实。
5. **per-topic 粘性 ≠ 统一防护**：同一 d_prc 抑制下 HK 约 86% 可翻、台湾仅约 9%，粘性来自下游 Reader 模板通道。安全评估与迁移机制发现都不能只看单一话题。
6. **对齐研究的元启示**：posttraining 不是"创造"而是"标准化"预训练已存在的潜在倾向（base 在 chat template 下已拒大量有害 prompt、给 Xi/治理的国家对齐框架）。理解对齐应先从预训练基线 disposition 出发。

## 相关实体

- [Mechanistic Interpretability](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/mechanistic-interpretability.md)
- [Activation Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/activation-engineering.md)
- [Shieldstral 安全分类器](https://github.com/QianJinGuo/wiki-public/blob/main/entities/mistral-shieldstral-policy-adaptive-safety-classifier.md)
- [AI 伦理与负责任 AI](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/ai-ethics-responsible-ai.md)
- [预训练 vs 微调](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/llm-pretraining-vs-sft.md)
- [注意力机制](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/attention-mechanism.md)

→ [原文存档](https://vas-blog.pages.dev/qwen-censorship/)

---

