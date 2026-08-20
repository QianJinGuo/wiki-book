# TennisVAR：基于击球证据的体育视频战术推理（Event→Relation→Evidence→Tactic）

## Ch01.1255 TennisVAR：基于击球证据的体育视频战术推理（Event→Relation→Evidence→Tactic）

> 📊 Level ⭐⭐ | 4.4KB | `entities/tennisvar-stroke-evidence-tactical-reasoning-sports-video-2026.md`

# TennisVAR：基于击球证据的体育视频战术推理

## 核心问题：从「看见动作」到「还原战术决策」

多模态大模型已能看视频、识别动作、生成比赛点评，但面临「感知到理解」的鸿沟：模型能说「球员通过主动进攻赢下这一分」，却无法指出到底是哪几拍建立了优势、哪一拍改变了攻防态势。厦门大学、上海创智学院、上海交通大学团队提出的 TennisVAR 要补的正是这一块——沿着一连串击球还原背后的战术逻辑，并把支撑判断的具体击球证据找出来。

## 新任务与新基准：TRACE

团队提出体育赛事视频理解新任务——**基于击球证据的战术推理（stroke-evidence-grounded tactical reasoning）**，并构建大型网球推理 Benchmark **TRACE**：11189 个回合视频、41485 次击球事件、25429 个战术单元、11189 组问答，数据来自 109 场职业比赛、72 名球员，覆盖大满贯、巡回赛、奥运会与团体赛事。TRACE 设计三级战术体系（6/17/25 个类别，覆盖发球、接发、底线组织、上网转换、防守反击），问题难度分三级：事实感知 / 战术理解 / 决策推理。

## 架构：Event→Relation→Evidence→Tactic

整套架构概括为四个词：**事件→关系→证据→战术**。

1. **EPM 事件解析模块**：融合三类线索（DINOv3 视觉语义、短时运动特征、TrackNet 网球轨迹），将连续视频转化为明确的击球事件（谁打的、什么技术、方向、结果、触球帧）。
2. **TGTR 战术图引导时序推理模块**：把每次击球变成图上的节点，建立时间关系（前一拍到后一拍）与同一球员的连续决策关系，使模型能追踪「A 自己连续几次做了什么选择」而非仅 A-B-A-B-A。
3. **Evidence Router 证据筛选**：针对问题筛选支撑结论的关键击球证据。

## 实验结果：通用大模型「话说得像」≠「真看懂」

通用大模型在 ROUGE/BLEU 等文本相似度指标上不难看，但在击球证据定位上直接崩溃：GPT-5.5 零样本 T-F1@8 仅 37.03、T-IoU@4 仅 24.54，而 TennisVAR 分别做到 73.04 和 56.19。即使与 TRACE 数据 SFT 的基线相比，TennisVAR 在 T-F1@8 提升 19.94 个百分点、T-IoU@4 提升 33.03、分层战术 F1 提升 6.08。在最难的 Q3「决策推理」任务中优势持续存在。

消融实验显示：去掉 TGTR 后整体得分下降 9.07 个百分点、T-F1@8 下降 17.14；保留图推理但去掉 Evidence Router 后分层战术 F1 下降 10.18。即让模型变强的不是「看更多视频」，而是把击球事件、事件关系、问题相关证据明确建模出来。

## 通用启示

TennisVAR 的范式远超网球：体育视频高价值信息往往是「为什么」——结论发生在最后，但原因分散在此前的一连串动作中。要求 AI 把推理链真正「交出来」（发生了哪些事件、关系、关键证据、决定性步骤、如何形成判断）是缩小「感知到理解」鸿沟的关键路径。这也印证了多模态大模型细分领域应用的老问题：**模型话说得像，不一定代表视频真的看懂了**。

## 相关

- 视频理解与生成 → [Video Generation Models](https://github.com/QianJinGuo/wiki/blob/main/concepts/video-generation-models.md)
- 基准与评测设计 → [Llm Benchmark Landscape](https://github.com/QianJinGuo/wiki/blob/main/concepts/llm-benchmark-landscape.md)
- 推理能力 → [Reasoning Models](https://github.com/QianJinGuo/wiki/blob/main/concepts/reasoning-models.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/tennisvar-stroke-evidence-tactical-reasoning-sports-video-2026.md)

---

