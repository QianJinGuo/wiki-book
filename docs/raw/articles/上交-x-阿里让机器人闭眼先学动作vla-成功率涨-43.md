---
title: "上交 x 阿里：闭眼先学动作 VLA"
source: wechat
source_url: https://mp.weixin.qq.com/s/6QgldL0W5kMDTLj-lq28Vg
ingested: 2026-07-24
feed_name: 阿里技术
source_published: 2026-07-13
sha256: 40ab8095f497e3735d6d2b574214668fc30b84541fb06d31e1318ca179b0cf53
---

# 上交 x 阿里：让机器人闭眼先学动作，vla 成功率涨 43%

# 上交 x 阿里：让机器人闭眼先学动作，vla 成功率涨 43%

近年来，Vision-Language-Action（VLA）模型正在成为通用机器人操作的重要路线。

主流做法通常是把视觉观测、语言指令和机器人动作放在一起训练，让模型根据当前图像和语言目标直接预测下一步动作。

但在这个范式下，一个关键问题很少被单独拎出来讨论：

VLA 模型到底有没有真正学到"语言如何约束动作"？

标准 VLA pretraining 从一开始就把 visual grounding 和 action learning 绑定在一起。这样当然可以训练出视觉条件下的机器人策略，但也让 language-action learning 始终被包裹在视觉主导的训练过程中。模型看起来是在根据语言执行任务，实际上可能更多是在利用视觉和动作之间更直接的关联。

这正是 LA4VLA 想要研究的问题：

Language-Action Pretraining 是否应该从标准 VLA Pretraining 中被解耦出来，作为一种独立的预训练信号来研究？

为了探究这个问题，上交 & 阿里提出 LA4VLA: Learning to Act without Seeing via Language-Action Pretraining。核心思想不是让机器人最终不看图，也不是否定视觉的重要性，而是把语言-动作监督从视觉主导的 VLA 训练中显式拆出来：在没有视觉输入的设置下，让模型学习语言指令如何约束连续动作轨迹，并进一步研究这种监督如何单独使用、如何与标准 VLA pretraining 结合。

  * 论文标题：LA4VLA: Learning to Act without Seeing via Language-Action Pretraining

  * 项目主页：https://github.com/MINT-SJTU/LA4VLA

换句话说，我们希望机器人不要只依赖视觉捷径，而是能够掌握一类更基础的语言-动作规律：即使暂时"看不见"，也要知道语言中的动作词、方向词和操作意图应该对应怎样的运动模式。

01为什么标准 VLA 训练中的语言监督可能不够

问题的根源在于，标准 VLA 训练中视觉、语言和动作的监督密度并不对等。

在数据层面，一条机器人示范通常包含连续的视觉观测、机器人状态和动作轨迹，但只配有一条高层任务指令。比如一条完整轨迹可能对应一句 "clean the table"，而执行过程中实际包含靠近、抓取、抬起、移动、放置等多个局部动作阶段。视觉和动作信号是逐帧变化的，而语言信号往往在整条轨迹中保持不变。这意味着，模型看到的是大量密集的 visual-action 或 state-action 对，但语言与局部动作阶段之间的对应关系并没有被显式标出来。

在输入层面也存在类似不平衡。图像通常会被编码成大量 visual tokens，而语言指令只占输入中的一小部分。训练时，模型更容易从视觉输入中找到直接的动作预测线索，而不是充分学习语言指令如何约束动作。

因此，一个 VLA 模型可能在标准输入下看起来是 language-conditioned 的，但其动作预测实际上仍然高度依赖 visual-action association。一旦视觉输入被移除、替换，或者视觉线索与语言目标发生冲突，模型就可能偏离语言指令。

这正是 LA4VLA 想指出的问题：VLA 模型不能只是在标准输入下"看起来会听指令"，而应该真正学会语言如何约束动作。如果 language-action supervision 始终被视觉主导的训练过程淹没，模型很容易依赖视觉捷径，而不是形成稳定的语言-动作关系。  


因此，**我们将 Language-Action Pretraining 从标准 VLA Pretraining 中解耦出来，把它作为一种独立的预训练信号来研究：** 让模型显式学习不依赖具体图像和场景布局的 language-action priors，并进一步验证这种监督如何提升下游 VLA 策略、真实机器人操作和视觉扰动下的鲁棒性。

02业务背景机器人到底是在听指令，还是在跟着视觉走？

## 为了判断 VLA 策略到底是在跟随语言，还是在依赖视觉线索，我们设计了一个诊断实验：

## 保持语言指令不变，只改变视觉输入，观察模型预测出的动作轨迹是否仍然沿着指令方向运动。

实验选取方向明确的原子动作指令，例如 "move upward to approach the target" 和 "move downward to approach the target"，并构造四种视觉输入设置：

  


在原始配对输入下，模型看起来表现很好：相反方向的指令对应的轨迹能够分开，端点也大致落在指令方向上。但一旦视觉输入被移除或替换，轨迹很快变得混乱，原本清晰的方向区分消失。

最关键的是视觉冲突设置：语言仍然要求模型朝一个方向运动，但视觉输入来自相反方向的动作片段。此时，预测轨迹明显偏向视觉所暗示的方向，而不是语言指令指定的方向。也就是说，模型并不只是"不确定"，而是在视觉和语言冲突时，更倾向于跟随视觉线索。

进一步的量化结果也验证了这一观察：标准配对输入下看似良好的 direction following，在移除、替换或冲突视觉输入后显著下降，并且在视觉冲突时出现明显反向偏移。

这个诊断实验说明：标准 VLA 训练可以产生表面上的 instruction following 行为，但这种行为未必稳固建立在 language-action relationship 上。模型看起来是在听指令，实际上仍可能高度依赖配对视觉输入。

03业务背景LA4VLA：把 Language- Action Pretraining从 VLA Pretraining 中解耦出来

## 基于上面的诊断实验，LA4VLA 提出核心思想：不要一开始就把语言、视觉和动作全部耦合在一起训练，而是先把 language-action supervision 单独抽出来，让模型先学习语言如何约束动作。

在标准 VLA pretraining 中，模型同时接收视觉观测、语言指令和机器人状态，并预测动作。Visual grounding 和 action learning 从一开始就被绑定在一起。这样虽然可以学习视觉条件下的机器人策略，但 language-action 关系也容易被更密集的 visual-action 信号淹没。

LA4VLA 则将 language-action 部分显式解耦出来。在 LA pretraining 阶段，视觉输入被移除，模型只能根据语言指令和机器人状态预测动作轨迹。也就是说，模型暂时不能依赖图像中的目标位置、物体外观或场景布局，而必须关注语言指令本身如何对应到连续动作模式。

这里的 language-action supervision 并不是简单的动作类别标签。我们不是只告诉模型当前片段属于 "lift" 或 "grasp"，而是希望模型学习更完整的局部动作描述与连续动作轨迹之间的对应关系。例如：

“Lower the object downward toward the target while holding it”

**对应持物状态下，将物体向目标方向下放；**

“Transport the object to the right while holding it”

**对应持物状态下，将物体向右侧水平移动；**

“Open gripper to release and place the object onto the target surface”

**对应打开夹爪，将物体释放并放置到目标表面。**

这些 instruction 不只是说明"做什么动作"，还包含动作方向、夹爪状态、是否持物以及局部物理效果。更重要的是，它们尽量避免物体外观、背景布局和场景特定目标选择，因此不同于普通的细粒度 subtask instruction（如"把红色杯子移动到书本左边"）。这些知识并不依赖某一张具体图像，而是跨任务、跨场景可复用的 language-action 规律。

LA4VLA 希望模型先学习这些规律，形成 vision-agnostic 的 language-action priors，再在后续 VLA 训练和下游微调中结合视觉输入完成具体场景中的操作。

因此，LA4VLA 的重点不是简单提出一个新的数据集，也不是只在标准 VLA pretraining 中加入额外数据，而是提出一种新的预训练视角：Language-Action Pretraining 可以从 VLA Pretraining 中独立出来，作为一种基础的、可单独使用、也可与标准 VLA 训练互补的预训练范式。

04

LA-33K: 为独立的 Language-Action Supervision  

提供数据基础

为了实现这种预训练范式，需要构造不依赖视觉输入的 Language-Action 数据。LA4VLA 并没有额外采集新的机器人示范，而是提出了一个 pipeline 来重新组织已有的 VLA demonstrations。一条完整的 VLA 轨迹通常只对应一条高层任务指令，但轨迹内部其实包含多个局部动作阶段。

LA4VLA 将这些长轨迹切分成短的 atomic action segments，并为每个片段配上对应的低层动作描述。这样，原本隐藏在完整轨迹中的 language-action supervision 就被显式暴露出来：每个短片段都有一个更局部的语言指令，以及与之对应的连续动作轨迹。

在构建过程中，使用关键帧检测、原子动作类别约束、VLM temporal segmentation 和人工核验，将原始 VLA 数据转化为 vision-agnostic 的 LA 数据。最终得到的 LA episodes 覆盖 move、grasp、lift、transport、place、reorient、lower 等常见原子操作类别。

最终，构建了 LA-33K，包含 33,116 条经过人工核验的 Language-Action episodes。它们来自已有机器人示范，不需要额外机器人数据采集。与原始 VLA 轨迹相比，LA-33K 的每个 episode 更短、更局部，语言描述也更直接对齐到动作执行。但需要强调的是，LA-33K 的意义不只是"多了一个数据集"。更重要的是，它让原本被包裹在 VLA demonstrations 中的 language-action supervision 变成了可以被单独训练、单独分析、单独与 VLA pretraining 组合的监督信号。

05

实验结果：LA Pretraining 带来了什么？

实验在 MetaWorld 和 LIBERO 两个 benchmark 上进行评测，以下是核心结论。

###  第一，单独 LA pretraining 已经有效，且收益覆盖仿真、跨架构和真实机器人 

  


这说明 LA pretraining 不是某个模型或某个仿真 benchmark 上的特定 trick。即使预训练阶段不使用视觉输入，模型学到的 language-action priors 仍然可以迁移到不同 VLA 架构，并显著提升真实机器人中的语言条件操作能力。

###  第二，LA pretraining 优于 matched VLA pretraining 

在相同原子动作片段上，保留视觉输入做 VLA pretraining，并不如移除视觉输入做 LA pretraining：

  


这说明，在相同原子动作片段上，LA pretraining 不只是改变了预训练信号的形式，而且带来了比 matched VLA pretraining 更好的下游效果。相比保留视觉输入继续学习 vision-language-action 关联，移除视觉输入后，模型需要更直接地学习 instruction 与 action trajectory 之间的对应关系；这种更集中的 language-action supervision，反而为后续 VLA 策略提供了更有效的预训练信号。

###  第三，LA 和 VLA supervision 可以互补 

这里的 No 表示不做预训练、直接下游微调；VLA 表示保留视觉输入的标准 VLA pretraining；LA 表示移除视觉输入的 Language-Action pretraining；LA-VLA 表示两阶段结合 LA 与 VLA supervision；MixPT 表示在同一预训练阶段混合 LA 与 VLA 数据。

在 MetaWorld 上：

No 69.73% → LA 83.00% → LA-VLA 86.75% → MixPT 87.53%

在 LIBERO 上：

No 92.85% → LA 95.30% → MixPT 95.75% → LA-VLA 96.28%

我们也在真实机器人上验证了 LA4VLA。三个任务分别是 Press Button、Place Book 和 Place Drink，它们都需要机器人根据语言指令选择正确目标。

真实机器人平均成功率：

No 38.3% → VLA 48.3% → LA 81.7% → MixPT 83.3%

在视觉扰动下，平均成功率为：

No 27.5% → VLA 42.5% → LA 67.5% → MixPT 70.0%

  


实验结果可以概括为一句话：

  * Language-Action Pretraining 是一种独立有效的预训练信号；它优于 matched VLA pretraining，也可以与标准 VLA supervision 形成互补。 LA supervision 提供不依赖具体图像的 language-action priors，VLA supervision 保留视觉输入并提供 visual grounding。二者结合后，在仿真、真实机器人和视觉扰动下都带来稳定收益。

06

为什么 LA Pretraining 有效？

除了下游成功率，我们还进一步观察了 LA pretraining 对模型行为和内部表示的影响。

从方向跟随结果可以看到，经过 LA pretraining 后，即使没有视觉输入，模型仍然能根据语言指令预测出清晰分开的相反方向轨迹。也就是说，动作方向不再轻易被其他输入带偏，而是更稳定地跟随语言指令。

从 t-SNE 可视化可以看到，标准 VLA-trained policy 的内部表示中，不同方向指令混在一起；而 LA-pretrained policy 的表示会按照指令方向形成更清晰的聚类，相反方向也被分到不同区域。

这说明 LA pretraining 不只是提升了最终成功率，也让模型在动作预测前形成了更清晰的 instruction-conditioned representation。换句话说，模型内部真的更好地学到了"语言如何约束动作"。

07

这篇工作的核心贡献

## 总结来看，LA4VLA 的贡献不只是提出一个新的数据集或一个新的模型，而是把一个重要问题明确拆了出来：Language-Action Pretraining 可以从标准 VLA Pretraining 中被解耦，并作为一种独立、有效、可互补的预训练范式。

具体来说，本文主要贡献包括：

  


这些结果共同说明：显式的 language-action supervision 是 VLA 学习中一个值得被单独建模和系统研究的关键方向。

08

写在最后：先学会“听懂动作”，

再学会“看见世界”

VLA 模型的目标不是只看图，也不是只听语言，而是把视觉、语言和动作结合起来，让机器人能够在真实世界中执行复杂任务。但如果从训练一开始就把视觉、语言和动作完全耦合在一起，语言-动作关系可能会被更密集的视觉-动作信号淹没。模型看起来能执行语言指令，但在视觉变化或视觉冲突下，可能仍然更倾向于跟着视觉走。

LA4VLA 提供了一种新的思路：先把 Language-Action Pretraining 从 VLA Pretraining 中解耦出来，让模型在没有视觉输入的情况下学习语言如何约束动作；再将这种语言-动作先验与视觉 grounding 结合起来，用于下游 VLA 策略学习。

这不是为了让机器人不看世界，而是为了让机器人在看见世界之前，先学会理解动作。

Learning to Act without Seeing，最终是为了更好地 Seeing and Acting with Language.

* * *

  


论文：LA4VLA: Learning to Act without Seeing via Language-Action Pretraining   


机构：上海交通大学 & 阿里巴巴   


代码：https://github.com/MINT-SJTU/LA4VLA

  


  


欢迎留言一起参与讨论~
