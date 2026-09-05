---
source: wechat
source_url: https://mp.weixin.qq.com/s/No81T-3bAgXRfD5UnEcTeQ
ingested: 2026-07-05
feed_name: 高可用架构
wechat_mp_fakeid: MP_WXS_3000551159
source_published: 2026-06-02
sha256: 0c7c500e6aac7edbc75eb162f5d842b9dfb02968f43e5704c9558562ce045b73
---

# 自我进化的 Agent Skill：微软 SkillOpt 到底解决了什么？

导读：本文是对 Microsoft SkillOpt 的全面教程，详细讲解如何将 AI agent 的“skill”（自然语言指令块）作为可训练对象，通过迭代编辑提升性能，而无需微调模型权重。

  


SkillOpt 模拟深度学习训练循环：目标模型执行任务、优化器提出有限编辑、验证集严格把关，仅接受提升分数的改动，在 6 个基准测试中实现显著增益，且输出小型、可读、可移植的 best_skill.md 文件。

  


作者 @hooeem 是一位 AI agent 优化创作者，专注于用现代技术栈将屏幕时间转化为现金流。

  


读完这篇文章，你会学会怎么拿 Microsoft 的 SkillOpt，指向你自己的 skill，放着它跑，回来的时候拿到的 skill 已经可以衡量地比起点更好了。

现在大家还在手动调 skill：加规则、删行、跑 eval、看 agent 的表现、再重复来一遍。

SkillOpt 干掉的是猜的部分。

  


我每次写文章都希望做到：哪怕读者完全不知道 skill 是什么，读完这篇也能学会。所以对有些人来说，下面有些段落可能是在教你已经会了的东西，直接划过去看你想看的部分就行。

所谓「skill」，就是一段你在 agent 干活前交给它的自然语言指令：流程、输出规则、该做什么、不该做什么。SkillOpt 把这个文件当成可以**训练** 的东西——有点像训练模型，只不过被训练的是文本，不是权重。它会让你的 agent 跑一批样例任务，看哪些地方对了、哪些地方错了，然后提出对 skill 的小改动，**只有这个改动在预留的样例上把分提高了才保留。**  最终输出就是一个紧凑文件。

开始前先问一句：SkillOpt 到底适不适合你？

当**你的任务输出可以拿已知正确答案来对照检查** 时，SkillOpt 就是对的工具。抽取、分类、结构化生成、有参考答案的问答、能跑或不能跑的代码——只要任务有正确答案，都在适用范围内。

如果「正确」这件事本身不存在，那它就不是你该用的工具。

**目录：**

  1. **SkillOpt 是什么？**
  2. **SkillOpt 为什么这么强？**
  3. **你必须给它什么。**
  4. **安装和配置（附官方链接）**
  5. **跑起来**
  6. **阅读结果并部署**
  7. **调参（给硬核玩家）**
  8. **诚实的限制**
  9. **回报**

好，来提升我们的 skills。

## 1：SkillOpt 是什么？

SkillOpt 是一个文本空间优化器。这个名字就说明了一切，拆开来看。

当人们改进一个模型时，通常改两类东西。权重，也就是 fine-tuning——贵，而且在封闭的前沿模型上基本做不了。或者 prompt——便宜，但基本是一次性猜测，不会从发生过的事情里学习。SkillOpt 改的是第三类东西：一个放在你和冻结模型之间的、持久化的 **skill 文档** 。模型不变。变的是 skill。

它作为一个循环运行，里面有四个活动部件，这个循环刻意模仿了训练神经网络的方式：

> 一个**冻结的目标模型** 用当前 skill 来执行你的任务。

> 一个**优化器模型** （第二个 LLM，只在训练期间使用）读取成功和失败的结果，然后提出结构化编辑：加这条规则，删那一条，替换这一行。

> 一个**有边界的编辑预算** 限制了 skill 每一步能改多少，所以它会逐渐改进，而不是被改得面目全非。论文把这叫「文本学习率」。

> 一个 **验证门**  会在预留的集合上跑编辑后的 skill，只有分数上升了才接受这次编辑。失败的编辑会被拒绝并记住，优化器就不会反复提出同样的改动。

部署出来的结果就是一个小文件。在论文的六个 benchmark 里，作者报告最终的 best_skill.md 大约 380 到 2,000 tokens 不等，而且只来自 **1 到 4 次被接受的编辑。**  小到几分钟就能读完、审完。

  


给视觉型学习者看的图。

## 2：SkillOpt 为什么这么强？

两个原因。它在完全不碰权重的方法里效果异常好，而且产物可迁移。

**它真的有效。**作者在六个 benchmark 上评估了 SkillOpt，涵盖搜索问答、电子表格、文档、多模态问答、数学，以及一个 embodied-agent 任务；目标模型七个，执行模式三种：direct chat、Codex harness 和 Claude Code harness。他们报告，在测量的  **52 个（模型、benchmark、harness）单元格里，SkillOpt 全部都是最佳或并列最佳** 。在 GPT-5.5 的 direct chat 上，六个 benchmark 的平均分从无 skill 的 58.8 升到 82.3，**+23.5 分**，并且在每个单元格都击败了最强竞争 baseline，平均领先 **+5.4 分** 。他们报告的单项跃升包括 SpreadsheetBench 从 41.8 到 80.7，OfficeQA 从 33.1 到 72.1。

这是摘要：

  


后面我会给你论文链接。

有个细节值得记住：最大的收益落在程序性任务上。也就是那些模型需要在工具使用和输出格式上更规矩，而不是需要更多原始知识的任务。这告诉你 SkillOpt 在哪儿最值——模型有能力但做事毛躁的任务。

**它可迁移。**  这是长期最重要的部分。因为输出只是调用冻结模型的普通文本，作者报告训练出的 skill 可以跨设置迁移：一个在 Codex harness 内训练的电子表格 skill，迁移到 Claude Code harness 后报告 **+59.7 分** 的提升；一个在更大 GPT 变体上训练的 skill 改善了较小的模型；一个在某个数学 benchmark 上训练的 skill，到另一个数学 benchmark 上也能带来正收益。

## 3：你必须给它什么。

这是大多数文章会跳过的部分，也是决定你能不能成功的部分。

**SkillOpt 提供评分机器。你提供标准答案。**  循环会打分、把关、编辑，这些都在 repo 里。但 repo 不可能知道你的任务里什么样的输出才算正确——只有你知道。所以你的工作是给它一组样例任务，每个任务配一个正确答案。

repo 写得很明确：不会附带数据集，数据集你得自己准备。SkillOpt 期望一个**拆分目录** ，里面有三个子文件夹，每个文件夹里各有一个 JSON 文件：
    
    
    data/my_split/  
    ├── train/items.json     # 优化器学习用的样例  
    ├── val/items.json       # 预留样例，验证门用它打分  
    └── test/items.json       # 锁起来，只用于最终报告  
    

每个 items.json 都是一组任务。SearchQA 格式最简单、最容易借用：
    
    
    [  
      {  
        "id": "unique_item_id",  
        "question": "Who wrote the novel ...",  
        "context": "[DOC] relevant passage text ...",  
        "answers": ["expected answer"]  
      }  
    ]  
    

answers 字段就是你的标准答案。这就是「搭建自己的 scorer」的全部。对一个可以客观检查的任务来说，它会收敛成一件事：把样例和它们的正确答案列在一个 JSON 文件里。你不是在写评分系统——比较逻辑已经在 benchmark 的环境代码里了，也就是 skillopt/envs//dataloader.py。

**最便宜的路径：借用现有 benchmark 的格式**

不要发明新的任务类型。**把你的任务表达成最接近的内置 benchmark，复用它的 config 和 scorer。**  对大多数「正确回答这个问题」或「抽取这个字段」的 skills 来说，那就是 SearchQA：一个 question，可选的 context，以及一个由内置 scorer 匹配的简短标准答案。把数据整理成 items.json，指向 configs/searchqa/default.yaml，你一行 Python 都不用写。

你可以借用的六种内置类型：

  


**需要多少样例？**

研究论文的完整运行用了几百个样例，但它自己的分析显示，程序性 benchmark 只用一小部分就已经能快速爬升，而搜索类任务在训练池大约 20% 后就接近饱和了。**先从小规模开始。20 到 40 个样例就足够拿到真实信号，也足够便宜地跑第一轮。**  按大约 4:1:5 拆成 train、val、test，这和论文的默认拆分比例一致。确认循环有帮助之后，再继续加量。

**当 exact-match 不够时**

如果你的正确答案不是短标准字符串，如果「正确」需要判断，兜底方案是 **LLM-as-judge**  scorer：另一个模型按照你写的 rubric，把每个输出评成 0 到 1。这个方案是支持的——repo 接受 OpenAI 和 Anthropic keys——但这条路更难，也更不可靠。一个噪声很大的 judge 会接受坏编辑、拒绝好编辑，整个循环就会漂移。只有在 exact-match 真的无法表达你的任务时才走这条路。如果走了，rubric 要写紧，并且手动抽查评分。第一次跑，选一个能客观打分的任务，完全绕开这条路。

标准答案就是整场游戏的核心。下游所有东西都信它。

  


## 4：安装和配置

我不会相信一个网上匿名用户写的安装指南，所以也不指望你信我。直接给 repo：

https://github.com/microsoft/SkillOpt[1]

https://microsoft.github.io/SkillOpt/[2]

继续。

## 5：跑起来

核心命令是 scripts/train.py。下面是大致用法，使用你借用的 SearchQA config：
    
    
    python scripts/train.py \  
        --config configs/searchqa/default.yaml \  
        --split_dir /path/to/your/my_split \  
        --optimizer_model gpt-5.5 \  
        --target_model gpt-5.5 \  
        --num_epochs 4 \  
        --batch_size 40 \  
        --out_root outputs/my_first_run  
    

这里有两个角色要理解：

> **\--target_model**  是使用 skill 的模型，也就是你会部署的那个。把它设成你在生产里实际跑的模型，可以是 OpenAI、Anthropic 或本地模型部署名。

> **\--optimizer_model**  是提编辑方案的模型。它只在训练期间运行，不会随你的 skill 一起发布，部署时成本为零。论文发现更强的优化器会产出更好的 skill，所以这里用你负担得起的最好模型。但它只是训练时的奢侈品，不是必需品。

**先便宜地跑**

在真正花钱前，用一次刻意的小而便宜的运行，证明这个循环对你的数据有帮助：

> 两个角色用**同一个模型** （--optimizer_model = --target_model）。论文显示，目标匹配的优化器依然能拿回大部分收益，所以这不是一个必须依赖更大老师模型的 distillation trick。

> 把 **\--num_epochs**  降到 1 或 2，把 **\--batch_size**  降到你的数据集大小。

> 用你的 20 到 40 个样例拆分，别一上来就几百个。

观察收益。如果一次小运行都能让验证分数动起来，就扩大规模。如果完全没变化，你的任务可能没有给优化器足够信号——先回去修样例，别继续花钱。

**给它你自己的起始 skill**

如果你已经有一个手写 skill，比如现成的 Claude Skill 文档，就不需要从 benchmark 的默认内容开始。起始 skill 定义在所选 configs//default.yaml 里。打开这个文件，找到初始 skill 文本的位置，把你的内容贴进去。SkillOpt 就会进化你的 skill，而不是从零构建——这通常正是你想要的。它保留已经有效的部分，修掉无效的部分。

**它会写出什么**

每次运行都会输出一个结构化文件夹：
    
    
    outputs/my_first_run/  
    ├── best_skill.md           # ← 你要部署的文件  
    ├── history.json            # 每一步的训练历史  
    ├── skills/skill_vXXXX.md   # 每一步的 skill 快照  
    ├── steps/step_XXXX/        # 每一步的编辑和 eval 结果  
    ├── slow_update/epoch_XX/   # 跨 epoch 整合日志  
    └── meta_skill/epoch_XX/    # 优化器侧笔记，不发布  
    

重新运行同一条命令会从最后完成的步骤自动恢复，中断的运行不会白费。

如果你想实时看进度，还有一个可选的监控 dashboard：
    
    
    pip install -e ".[webui]"  
    python -m skillopt_webui.app        # add --share for a public link  
    

## 6：阅读结果并部署

运行结束后，真正重要的有两件事。

**读 best_skill.md。**  它很短，而且是普通英文。你会看到它把一条泛泛的指令变成了具体、来之不易的规则——那种认真做了一天任务的人会写下来的规则。在论文的电子表格案例研究中，一条模糊的「使用 Python 并保留 workbook」skill，进化成了更具体的规则，比如检查真实 workbook 而不是 preview，即使 prompt 提到了 formulas 也要写入已求值的静态值。因为只包含少量被接受的编辑，你可以读完每个变化，判断自己是否信任它。这种能审计的特性本身就是 feature。你部署的是能理解的文本，不是你无法理解的权重。

**在预留数据上确认收益。**  不要只信训练分数。对 test split 运行 eval 脚本，也就是循环从未碰过的那一份：
    
    
    python scripts/eval_only.py \  
      --config configs/searchqa/default.yaml \  
      --skill outputs/my_first_run/best_skill.md \  
      --split valid_unseen \  
      --split_dir /path/to/your/my_split  
    

valid_unseen 是测试集，valid_seen 是验证集，all 会跑全部。把这个 skill 的测试分数和 no-skill baseline 对比——也就是用空 skill 或默认 skill 跑同样的 eval。差值就是它在你任务上的收益。这是唯一应该决定你是否发布它的数字。

**部署。**  best_skill.md 就是一段文本。把它放进 agent 里承载流程性指令的位置：对 direct-chat agent 来说，把它加到 system prompt 前面；或者保存成你的 harness 会加载的 skill / procedural-memory 文件。部署就这么完成了。没有权重变化，没有推理时优化器，循环里也没有额外的东西。只是一个更好的指令文件。

## 7：调参

不理解这些也能跑 SkillOpt。但如果你是 nerd，想深入折腾，想聪明地调 configs 而不是瞎猜，下面是这些开关的作用。每个都是对某个训练概念的刻意类比。

**有边界的编辑（「文本学习率」）。**  每一步最多应用少量编辑，由一个预算限制——论文叫它 Lt，默认 4，逐渐衰减到 2。这就是 SkillOpt 和直接让模型「重写我的 prompt」之间的区别。无边界重写会擦掉已经有效的规则，过拟合到最近一次失败。有边界的编辑让每个版本贴近上一个版本，skill 会积累改进而不是来回乱跳。论文的 ablation 显示，任何中等预算都好过无边界重写。

**验证门。**  每个提出的编辑都会在预留样例上测试，只有分数严格提高时才接受。平分会被拒绝。它把「模型觉得这个编辑不错」变成「这个编辑可测量地不错」，也是方法不会悄悄漂进胡话里的原因。它也是最关键的承重部件——这就是为什么第 3 节存在。验证门的诚实程度，只取决于你喂给它的标准答案有多诚实。

**被拒编辑缓冲区。**  没通过验证门的编辑不会只是丢掉。它造成的分数下降会被记录下来并反馈给优化器，优化器就不会反复提已经失败过的东西。论文报告说，移除这个 buffer 会让结果明显下降。部署时没有任何成本，纯粹是训练期的记忆。

**slow / meta update。**  每个 epoch 结束时，SkillOpt 会把当前 skill 和上一个 epoch 的版本比较，然后把一个更长周期的「哪些东西持久有效」笔记写入 skill 的受保护区域——快速编辑不能覆盖它。这就是 momentum term。论文报告，在电子表格任务的 ablation suite 里，同时移除 slow 和 meta updates 造成了最大单项下降。meta-skill 部分停留在优化器侧，不会随部署文件发布。

  


## 8：诚实的限制

**成本是真实的，而且要预付。**  两个模型跨 epochs 和 batches 运行，会烧 API tokens。论文用测试集每提升一个点消耗多少百万 tokens 来衡量训练成本，从便宜的程序性任务上大约 0.6M，到长多模态任务上的 46M。我刻意不引用美元数字——每 token 价格会变，我也无法验证今天的费率。你要为它预留预算，这也正是第 5 节强调先便宜跑一轮的原因。好消息是：这个成本是一次性的。一旦你拿到 best_skill.md，用它就不会增加任何东西。没有优化器，没有额外调用。前期确实要花一笔钱。

**垃圾答案，垃圾 skill。**  验证门相信你的答案。如果你的样例是错的或不一致，SkillOpt 会忠实地朝错误目标优化。把精力花在样例集上——它是决定一切的输入。

**它无法在没有「正确」的地方制造正确。**  这里重申开头的筛选条件，因为这是最常见的周末浪费方式：如果你的任务没有可检查的正确答案，这就不是你的工具。

## 9：长期回报

这就是为什么它改变的是你构建 skills 的方式，而不只是这一个 skill。

只要做过一次，你就拥有了一个**可迁移、可检查、可复用的产物。**  一个文本文件，不是黑箱。你可以读它、手动编辑它、用版本控制管它、交给队友。因为它调用的是冻结模型，而不是被烘焙进某个模型里，论文的迁移结果暗示它可以跟着你走：跨模型规模、跨执行 harness、迁移到邻近任务，不需要重新跑任何东西。

skills 不再是每次出问题就凭直觉重写的一次性 prompts，而会变成**你训练、验证、保留，并向前携带的资产。**  你会用在模型上的那套优化工具——证据、学习率、验证检查、momentum——现在也能用在 agent stack 里那个过去纯靠手工打磨的层上。

你不再猜测一个改动有没有帮助。你在测量它，只保留赢的改动。

**P.S.**  整个方法成败都取决于一个输入：一组带正确答案的样例。剩下的只是两条命令——前提是你把它用在真实问题上。

**链接：**

Paper: https://arxiv.org/pdf/2605.23904[3]

Repo: https://github.com/microsoft/SkillOpt[1]

好玩意儿：https://microsoft.github.io/SkillOpt/[2]

## 参考阅读

  


  * [Harness工程: C端 AIGC 内容生产自优化闭环实践](<https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565218&idx=1&sn=799c6fbe20a3ae9e92e08473863ce742&scene=21#wechat_redirect>)
  * [Claude Opus 4.8 发布：更强判断力、更长自主工作时间，Claude Code 迎来动态工作流](<https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565214&idx=1&sn=78807bb2aea9a01bd5cc17f2509d03d1&scene=21#wechat_redirect>)
  * [从Prompt、Context到Harness，工程的三次进化与终局之战](<https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565205&idx=1&sn=aea966676548461c85cfc3013153d187&scene=21#wechat_redirect>)
  * [我用 Claude 搭了个自动新闻简报，30天后比我刷了一年的信息还有用](<https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565201&idx=1&sn=ab375d5344a6a9b476fe1bb0c185227a&scene=21#wechat_redirect>)

#### References

  1. https://github.com/microsoft/SkillOpt: https://github.com/microsoft/SkillOpt
  2. https://microsoft.github.io/SkillOpt/: https://microsoft.github.io/SkillOpt/
  3. https://arxiv.org/pdf/2605.23904: https://arxiv.org/pdf/2605.23904
  4. 原文：https://x.com/hooeem/status/2061528919786791154

如果你也在关注 AI 应用如何真正落地到生产环境，2026.6.26 - 6.27 GIAC 深圳站值得关注。这次大会会集中讨论智能应用开发、架构演进，以及来自一线实践的经验与案例。

  


识别二维码可申请大会体验门票，点击阅读原文了解大会详细议程。
