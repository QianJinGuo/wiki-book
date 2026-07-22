# ElementsClaw：AI驱动超导材料发现

## Ch01.1098 ElementsClaw：AI驱动超导材料发现

> 📊 Level ⭐⭐ | 3.5KB | `entities/ai-superconductor-discovery-elementsclaw.md`

> 阿里达摩院联合中国人民大学高瓴人工智能学院、中国科学院大学发布首个专攻超导材料发现的AI智能体 ElementsClaw（元素虾），仅用 28 GPU 小时即从 240 万种已知稳定晶体中预测出 6.8 万种潜在超导体，实验验证发现 4 种全新超导体，所有预测数据已开源。

## 核心数据

- **算力消耗**：28 GPU 小时（对比人类 100 多年仅发现 2000+ 超导材料）
- **筛选范围**：240 万已知稳定晶体
- **预测结果**：6.8 万种可能具有超导性的材料
- **实验验证**：发现 4 种全新超导体（Hf₂₁Re₂₅ 2.5K、Zr₄VRe₇ 3.5K、HfZrRe₄ 5.9K、Zr₃ScRe₈ 6.5K）
- **预测命中率**：40%（自然材料中超导比例约 3%）
- **数据开源**：240 万晶体预测数据库已开放 https://science.damo-academy.com/#/material

## 技术架构

ElementsClaw 采用「通专融合」架构：

- **专用模型 Elements**：10 亿参数几何深度图神经网络，预训练 1.25 亿分子/晶体结构，22 个材料学基准达 SOTA，首次在非 LLM 架构验证 Scaling Law
- **四把「钳子」**：
  - Elements-T：预测超导临界温度，MAE 仅 0.99K
  - Elements-C：判断是否超导，AUC 0.996
  - Elements-E：预测能量和稳定性
  - Elements-G：生成全新晶体结构
- **LLM 智能体层**：调工具、读论文、查数据库、分析可合成性、设计实验方案、自我进化（发现新数据后自动微调模型）

## 四种发现路径

这 4 种新超导体分别代表 AI 的 4 种不同发现能力：

1. **「漏网之鱼」— Hf₂₁Re₂₅ (2.5K)**：存在于理论数据库但从未被人类实验验证
2. **「沉冤得雪」— Zr₄VRe₇ (3.5K)**：人类算错结构，AI 纠正后确认超导
3. **「无中生有」— HfZrRe₄ (5.9K)**：不在任何已知数据库，AI 自主生成新结构
4. **「举一反三」— Zr₃ScRe₈ (6.5K)**：AI 总结结构模体，搜索相似体系发现新超导体

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/ai-superconductor-discovery-elementsclaw-2026.md)

---

