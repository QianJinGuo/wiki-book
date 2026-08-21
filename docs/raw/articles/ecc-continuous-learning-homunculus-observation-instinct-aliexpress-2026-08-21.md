---
source_url: https://mp.weixin.qq.com/s/hohfm3DuhVqAePXIgnrQOA
ingested: 2026-08-21
sha256: 38328e900f06fc5435e11a0f8c9883851b7d130ccc5f178acd71c0a9f7f56312
title: "Agent 如何形成肌肉记忆？从工具调用到本能沉淀的持续学习闭环（ECC continuous-learning 源码解析）"
author: AliExpress技术
source: 微信公众号
type: raw
tags: [agent-skills, continuous-learning, instinct, homunculus, tool-call-observation, self-evolution, hook, muscle-memory, ecc, everything-claude-code, memory]
---

# Agent 如何形成肌肉记忆？从工具调用到本能沉淀的持续学习闭环

> 原始来源：https://mp.weixin.qq.com/s/hohfm3DuhVqAePXIgnrQOA
> 作者：AliExpress技术（阿里巴巴国际站，第一方技术账号，原创，2026-08-21）
> 对象：ECC（Everything Claude Code）的 continuous-learning 模块，参考 GitHub affaan-m/ECC + humanplane/homunculus

## 核心命题

你能写进记忆的，只是那些你意识到、且说得清的偏好；但真正决定效率的往往是你自己都没察觉的思维习惯（如遇到报错先查最近 git 变更而非全库 grep）。这些习惯从不出现在你的描述里，却清清楚楚记录在每一次执行轨迹中。

ECC（Everything Claude Code，Anthropic 黑客马拉松获胜者）的 **Continuous Learning（持续学习）模块**试图把这些习惯捞出来：后台静默观察 Agent 的每一次工具调用，不关心你说了什么、只关心它做了什么，从真实执行轨迹中自动提炼高频行为模式，沉淀成带触发条件和置信度的「本能」文件，下次遇到相似场景自动加载生效。不改模型权重、不需要手写规则，只在**上下文层**完成闭环。

## 模块总览：从工具调用到本能落盘的自动闭环

四部分：
1. **项目初始化**：前置工作，确定观察记录与本能文件的存放位置，确保观察者进程可用（Hook 配置、项目身份识别、进程守护）
2. **行为采集**：行为采集器（observe）把工具调用变成结构化观察记录，落盘到 observations.jsonl，攒够量时通知观察者进程（observer-loop）
3. **模式识别**：观察者进程从积累的观察流中识别反复奏效的行为模式（两种唤醒方式、多层门禁、四类待识别模式、LLM 调用）
4. **本能积累与管理**：把识别出的模式积累成可复用的本能文件，归档已处理观察记录，通过本能管理中枢提供查看/聚类/进化等生命周期管理

## 项目初始化

### Hook 配置
注册 **PreToolUse 与 PostToolUse**、匹配所有工具，每次使用工具前后调用行为采集器 observe.sh：前者记录「打算做什么」，后者记录「完成状态」，两者搭配判断动作是否有效。异步执行，不阻塞主流程。

### 项目身份识别
按项目维度隔离数据，产出 PROJECT_ID / PROJECT_NAME / PROJECT_DIR，各项目独立观察、分析与积累。

### 进程守护
「懒启动 + 自动回收」：周期性检查活跃会话，无活跃会话且空闲超 30 分钟即自行退出；下次使用 Agent 时由行为采集器按需拉起。

## 行为采集

### 行为事件接收
每次 Hook 触发做两件事：①检查观察者进程是否存在，已退出则自动启动；②读 stdin JSON Payload（tool_name / tool_input / tool_response / session_id / cwd 等），抽字段、正则匹配敏感信息（api_key/token/secret/password/authorization）替换为 `[REDACTED]`，再追加记录。

### 观察记录追加
追加写入观察记录文件。达到 min_obs 后，获取观察者进程 PID，发送 **SIGUSR1** 信号使其进入识别模式。

## 模式识别

### 两种唤醒方式
- **信号唤醒**：频繁使用 Agent 时，观察记录迅速累积，每满一定数量发一次 SIGUSR1 唤醒——干得多学得快
- **定时唤醒**：计数器攒不满时，观察者进程持循环定时器按固定间隔自动唤醒兜底

### 多层门禁判断
避免观察者进程频繁进入识别模式：
- **observer-loop 层**：ANALYZING 锁（正在分析→设 PENDING 排队）+ 60s 信号冷却
- **guardian 层**：Gate1 活跃时段（8:00-23:00）+ Gate2 项目冷却（同项目 <300s）+ Gate3 键鼠空闲（离开 >30min）

已知不足：整个观察记录文件归档造成观察浪费，解决法=增加行号指示器，只归档指示器之前的记录。

### 四类待识别模式

| 模式 | 触发特征 | 产出本能 |
|------|---------|---------|
| 用户纠正 | 刚 Edit 完某处紧接着又改成别的样子；或报错后重试 | "做 X 时优先用 Y" |
| 错误修复 | tool_complete 输出有报错 → 随后几个工具改好 → 再次成功 | "遇到错误 X，试试 Y" |
| 重复工作流 | 同一串工具序列反复出现（Edit → Bash 跑测试 → Edit） | "做 X 时按 Y→Z→W 步骤" |
| 工具偏好 | 工具选择规律（特定任务用特定 Bash 命令） | "需要 X 时用工具 Y" |

### LLM 调用
识别模式后启动非交互式 LLM 子进程：先采样最近 500 条观察记录（避免膨胀文件投喂），组装提示词（从哪四类找模式、同一模式 3 次以上才算成立、产出带触发条件和置信度的本能文件）。关键工程细节：入口检查只允许交互式终端/IDE 会话；精简档位 ECC_HOOK_PROFILE=minimal 跳过非必要 Hook；--yolo 自动批准写文件权限；**递归熔断**——分析子进程带 QODER_HOOK_RUNNING=1，被它触发的 Hook 立即退出，避免无限递归。

## 本能积累与管理

### 本能规范
本能文件含：id（kebab-case）、trigger、confidence、domain（code-style/testing/git/debugging/workflow/file-patterns）、source、scope（project/global）、project_id、project_name、执行动作、证据链条。作用域决策：拿不准默认 project 避免污染全局。置信度：按频次定初值（3-5 次=0.5，6-10=0.7，11+=0.85），随时间动态调整（-0.02 每周衰减）。

### 本能管理中枢 instinct-cli.py
- `status`：列出项目级 + 用户级本能
- `import`/`export`：导入导出，团队共享，按 ID + 置信度合并
- `evolve --generate`：聚类——2+ 成技能 / 3+ 且 avg 置信度≥0.75 成 Agent
- `promote`：同 ID 在 2+ 项目且 avg 置信度≥0.8 → 写入用户级目录
- `projects`：读 projects.json，删除/合并项目数据

## 与记忆系统的关系

- **持续学习在上游，负责「发现」**：静默观察工具调用，从执行轨迹提炼高频行为模式，沉淀成本能文件
- **记忆系统在下游，负责「固化与加载」**：借 Agent 原生静态记忆/自动记忆机制把积累的本能注入上下文

观察 → 提炼 → 沉淀 → 注入 → 产生新行为 → 再观察，形成全自动闭环。

## 应用

### 应用方式（本能注入上下文的三种方式）
1. **聚类进化为 Skill / Agent**：按触发条件聚类，成簇封装为 Skill 或子 Agent，借原生记忆机制注入
2. **会话开始时全量注入高置信本能**：配置 Hook，会话启动时筛出置信度达标的本能拼成文本注入初始上下文
3. **按场景检索并动态注入**（更理想）：本能 trigger 字段本就是「适用场景」描述，向量化后每轮对话前按当前任务做相似度检索，只注入命中的少数几条——把本能从「常驻上下文」变成「按需加载」，省预算又提相关性

### 应用方向
- **沉淀个人隐形工作习惯**：固化无意识的探索顺序、试错路径与工具偏好
- **上下文成本优化**：观察数据量化「哪些弯路最烧 token」，把最贵的弯路固化成本能后测算平均任务 token 消耗与动作步数下降
- **业务规则浮现**：从反复调用序列里提炼业务约束（如「转化率分母必须是曝光去重 UV」）
- **提取 good case 建评测基线**：符合高置信本能的成功轨迹作 good case，反之 bad case，构建 Agent 回归评测基线

## 参考资料
- https://github.com/affaan-m/ECC/tree/main/skills/continuous-learning-v2
- https://github.com/humanplane/homunculus

（End）
