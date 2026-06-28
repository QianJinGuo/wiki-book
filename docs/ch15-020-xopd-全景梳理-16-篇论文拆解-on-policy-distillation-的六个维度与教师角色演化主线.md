## Ch15.020 xOPD 全景梳理：16 篇论文拆解 On-Policy Distillation 的六个维度与教师角色演化主线

> 📊 Level ⭐⭐⭐ | 7.9KB | `entities/xopd-on-policy-distillation-landscape-banana-2026.md`

# xOPD 全景梳理：On-Policy Distillation 六维分类与演化主线

## 核心结论

OPD（On-Policy Distillation）领域在 2026 年初密集爆发 16+ 篇论文，表面是各种 loss 变种竞赛，底层演化主线是：**"教师"角色从全程保姆逐步退化为鉴别器**——到 RLRT，教师只负责告诉学生"什么不是你的"，reward 负责告诉学生"什么是对的"。

> "OPD 会是终局吗？不会，但它揭示的视角会是终局的一部分——post-training 的 teacher signal 不应该是静态的，它应该跟着 student 当前的状态、能力、置信度、对错动态调整。"

## 六维分类框架

每篇 xOPD 论文的设计可沿六个维度定位：

### 维度 1：Loss 怎么写

| 变体 | 代表工作 | 核心做法 |
|------|----------|----------|
| Reverse KL | vanilla / SDPO / SRPO | 标准 token 级 KL 散度 |
| Token 概率比→advantage weight | RLSD / RLRT | 师生概率比直接调 GRPO magnitude |
| Advantage 符号切 RL/KL | AOPD | 正 advantage=exploitation，非正=imitation |
| 信任区域 reverse↔forward KL | TrOPD | 可信区 reverse KL，outlier 区 forward KL |
| Rubric reward→GRPO | ROPD | LLM rubric 打分替代 logit matching |
| Outcome 约束 trajectory KL 序 | Uni-OPD | 让 token KL 接受 trajectory outcome 监督 |
| OPSD 降级为 sigmoid 门控 | SDAR | 主目标仍是 RL，OPSD 为辅助项 |

### 维度 2：教师信号怎么来

| 来源 | 代表工作 | 说明 |
|------|----------|------|
| White-box logits | vanilla 大多数 | 需要 teacher 白盒访问 |
| Black-box rubric/verbal | ROPD | AUC 0.90 vs logits AUC 0.35 |
| Self-distill privileged context | SDPO / RLSD / RLRT / SDAR | 同模型不同信息条件 |
| 正确 vs 错误 sibling rollout 对比 | RLCSD | 对照减掉风格漂移 |
| 模型自己的不同 mode | OPSDL | 短上下文版教长上下文版 |

### 维度 3：哪些 token/sample 该被加权

| 策略 | 代表工作 |
|------|----------|
| 均匀 | vanilla |
| 按 advantage 符号 | AOPD |
| 按 step divergence | SOD |
| 按信任区域 + outlier 处理 | TrOPD |
| 按 teacher endorse/reject 极性 | SDAR |
| 对错对比→task token 集中 | RLCSD |
| 只在 r=0 | SRPO |
| 只在 r=1 | RLRT |
| cosine alignment 过滤 | Apple |

### 维度 4：教师拉学生的方向

- **大多数**：把 student 往 teacher 拉（standard distillation）
- **RLRT**：第一个反过来——成功时奖励 student 偏离 teacher 的 self-driven token
- **Apple**：有些 token 上根本不该拉（信号负价值）
- **TrOPD**：有些 token 不是不该拉，是 reverse-KL 数值会爆，得换 forward KL

### 维度 5：算力/数据效率

| 策略 | 代表工作 |
|------|----------|
| 在线 sampling | 默认 |
| Offline cache | Lightning OPD（4× 算力节省） |
| Self-distill 无外部 teacher | OPSDL / OPSD 整条线 |

### 维度 6：PI 结构（Privileged Information）

Many Faces of OPD 的关键区分：

| PI 类型 | 含蒸效果 | 代表场景 |
|---------|----------|----------|
| **Shared-rule** | ✅ 聚合=内化规则 | 系统提示词、风格指令、对齐偏好 |
| **Instance-specific** | ❌ 聚合=拍糊+幻觉 | 具体题目的 GT、特定文档 |

> 学生在 inference 时会幻觉性地说出"如参考答案上所言"——它学到的不是解题能力，而是"有 GT 在条件里"这件事的统计痕迹。

## 演化主线：教师角色逐步退化

```
vanilla OPD (全程保姆)
  → Apple 诊断 (很多 token 帮倒忙)
    → SOD (加信任度门)
      → TrOPD (有些 token 数值上没法听)
        → ROPD (logit AUC < 0.5, 换 rubric)
          → Lightning (不必全程在场, 离线缓存够)
            → SRPO (做对时闭嘴)
              → RLCSD (信号里混了风格腔调, 对照减掉)
                → SDAR (拒绝信号未必可信, 软性衰减)
                  → RLRT (退化为鉴别器: 只标记"什么是学生自己的")
```

**RLRT 的标志性翻转**：Qwen3-4B-Base 在 6 个数学 benchmark 上比 GRPO +18%，仅仅是把 token 权重分子分母对调 + 只在正确轨迹 apply。

## 关键诊断发现

### Apple Unmasking OPD (arXiv 2605.10889)

- 成功轨迹上 teacher alignment ≈ 0.001（几乎正交）——白白浪费梯度预算
- 失败轨迹上 alignment ~0.05，显著正向
- 只保留 positive alignment 的 52% token → 10-15× 有效信号
- **Comprehensibility 假设**：梯度信号只有在 student 能 parse 时才有用
- 0.6B self-distillation > 32B 外部 teacher 2-3×

### RLCSD 风格漂移诊断 (arXiv 2606.11709)

- **Privilege-induced style drift**：style token 信号均值 0.263，task token 只有 0.083（3× 差距）
- 解法：用错误提示做对照，逐字节模板相同→风格漂移在相减中抵消

### Many Faces of OPD (arXiv 2605.11182)

- OPSD 学到的是所有 PI 上的边际聚合策略
- Shared-rule PI → 内化 ✅；Instance-specific PI → 幻觉 ❌
- **RLVR-adapted teacher**：teacher 的 benchmark 分数甚至不需要更高，只要分布跟 student 更贴

## Self-Distillation vs 外部 Teacher 两条线

| 维度 | 外部 Teacher OPD | Self-Distillation (OPSD) |
|------|-----------------|-------------------------|
| KL 方向 | Reverse KL (mode-seeking) | Forward KL 更稳 (mode-covering) |
| 原因 | capacity gap 存在 | 共享权重，无 capacity gap |
| PI 角色 | teacher 本身就是 privileged | PI sharpen student conditional |
| 代表 | vanilla / SOD / TrOPD / ROPD | SDPO / RLSD / RLRT / RLCSD |

Self-Distilled Reasoner 验证：full-vocab logit distillation > sampled-token policy gradient（与 DeepSeek V4 工程结论一致）。

## 教育学类比

> "OPD 这一波从 vanilla 到 RLRT 的演化，几乎是把教育学争论在算法层面重新跑了一遍——从'老师即标准答案'，到'老师只在学生卡住时出手'，再到'老师只负责识别哪些是学生自己做出的选择'。"

| 教育学派 | 对应 xOPD | 核心 |
|----------|-----------|------|
| 传统课堂 | vanilla OPD | 老师提供标准答案，学生精确复刻 |
| 脚手架理论 | SOD / SDAR | 老师在学生卡住时出手 |
| 激进 unschooling | RLRT | 连脚手架都不该有，学生自己摸 |
| 建构主义 | Many Faces / Self-Distill | 老师是"更好信息条件下的自己" |

## Reading List（精选 Top 5）

| 论文 | arXiv | 必读度 | 核心贡献 |
|------|-------|--------|----------|
| Apple Unmasking OPD | 2605.10889 | ⭐⭐⭐⭐ | 诊断：什么时候 work/不 work |
| Many Faces of OPD | 2605.11182 | ⭐⭐⭐⭐ | OPSD 何时塌：shared-rule vs instance-specific |
| RLRT (Rebellious Student) | 2605.10781 | ⭐⭐⭐ | 教师角色翻转，+18% |
| RLCSD | 2606.11709 | ⭐⭐⭐ | 对比抵消风格漂移 |
| Self-Distilled Reasoner | 2601.18734 | ⭐⭐⭐ | OPSD 源头，forward KL 胜出 |

完整 16 篇 reading list + arXiv 链见原文附录。

## 相关实体
- [Opd Revisiting Failure Modes Simple Fixes Storm](ch01-760-karpathy-anthropic-vibe-coding-software3-0.html)
- [Rlhf Dpo Grpo Alignment](ch01-710-2026-年面向-llm-的-rl-方法总结-从-ppo-到-dpo-到-grpo-再到多智能体-rl.html)
- [Deepseek V4 Training 58 Page Paper Deep Dive](ch01-751-deepseek-v4是怎么训练出来的-58页论文深入解读.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xopd-on-policy-distillation-landscape-banana-2026.md)

---
