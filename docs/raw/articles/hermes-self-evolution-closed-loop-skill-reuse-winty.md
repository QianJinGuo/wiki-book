---
title: "从一次任务到一次进化：完整拆解 Skill 创建、复用、修补链路"
author: winty
date: 2026-05-19
source_url: https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
source: https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA
ingested: 2026-05-19
sha256: 9401124611effb8034a1d7574521697e8077ee8d93590f7dd7883cc9e8ff21ad
---
---
# 从一次任务到一次进化：完整拆解 Skill 创建、复用、修补链路
（正文约5500字，来源：winty/前端Q，Hermes自进化系统第二章第5篇，2026-05-19）
## 背景
Hermes自进化系统第二章第5篇，补全完整闭环视角。前面4篇讲了4个零件（Memory/Skill/Nudge Engine/Review Agent），本文串起6阶段完整链路。
## 完整闭环：6个阶段
| 阶段 | 零件 | 内容 |
|------|------|------|
| 1 接收任务 | — | 用户提需求，Agent不立刻动手，先查是否干过类似的事 |
| 2 检索Memory+Skill | Memory+Skill | 查相关事实（如"用yarn不用npm"）+ 查现成SKILL.md |
| 3 执行任务 | Agent Loop | 调工具/跑命令/多轮对话，失败/纠正事件被记录成session trace |
| 4 Nudge触发 | Nudge Engine | 任务结束时扫事件：成功→中优先级；失败→高优先级；用户纠正→立刻触发；连续3次相似→触发Skill提炼 |
| 5 Review复盘 | Review Agent | 4步：收集素材→分类信息→3把尺子筛选→决定写哪/怎么写 |
| 6 写入/Patch | Memory Store | 新建/Memory patch/Skill patch，版本号+1，写入时间戳 |
**金句**：闭环跑一次，系统就稍微变强一点。下次命中Skill直接复用 = 进化具体发生的瞬间。
## 真实案例：npm发包任务跑3次
### 第1次：首次发包，12步，失败
- 没有任何Skill可用，从0开始摸索
- 最后失败：忘了在publish前build，包发了但里面是空的
- **产出**：Review Agent写了Skill 0.1（publish-to-npm.md）+ 踩坑笔记"一定要先build"
### 第2次：第二次发包，9步，成功但有遗漏
- 命中Skill 0.1，按手册执行，不再问版本策略/lint等
- 小遗漏：changelog没写（Skill 0.1里changelog步骤写得太抽象）
- **产出**：Review Agent patch Skill 0.2，具体化changelog步骤（明确写出"用changesets工具，新增minor版本变更条目"）
### 第3次：第三次发包，6步，一次成功
- 命中Skill 0.2，按手册一次跑通（lint+测试→build→bump版本→写changelog→git tag→npm publish）
- **产出**：Skill升级到1.0（稳定版本，已过3次以上完整验证），更新"成功复用次数"计数
**12→9→6步** = 自进化在数字层面最直观的体现。不是模型变聪明了，是系统积累的经验在帮模型省路径。
## 数据在闭环里的4个容器
### 容器1：Session Trace
- **写入方**：Agent Loop
- **内容**：结构化事件流（用户原始需求/每次工具调用输入输出/每轮回复/用户中途打断纠正/最终结果）
- **格式**：结构化事件流，不是纯文本
### 容器2：Review Input
- **写入方**：Nudge Engine
- **内容**：Trace + 用户反馈 + 触发原因
- Nudge Engine做一层"打包"：标注触发原因/附加用户显式反馈/标注优先级（高/中/低）
- 打包后丢进Review队列
### 容器3：Review Output
- **写入方**：Review Agent
- **内容**：结构化"写入计划"（不直接写文件）
- 格式示例：
```yaml
- target: memory.project
  action: append
  content: "数据库是 PostgreSQL"
- target: skill.publish-to-npm
  action: patch
  diff: "在 step 3 后插入：写 changelog"
```
- **安全检查**：写入前过linter，检查是否违反基本规则（如不要往全局USER.md写项目特定信息）
### 容器4：Memory + Skill 文件
- **写入方**：Memory Store
- **操作**：append / patch / new
- 写入时自动加时间戳+来源标注、自动版本+1、写入"变更日志"
**金句**：数据有节制地流，系统才不会膨胀。每个容器都做了过滤/打包/转换。分层节流的设计是Hermes工程上最值钱的一处。
## 5个可观测指标
| 指标 | 健康值/趋势 | 含义 |
|------|------------|------|
| Skill命中率 | >40%健康，>70%警惕过度抽象 | 命中有Skill的新任务比例 |
| 任务平均步数 | 随时间下降 | 同类任务执行步数递减 |
| 失败重复率 | ≤3次 | 同一类失败最多踩3次就该进Skill |
| 用户纠正频率 | 随时间下降 | 同样错误被反复纠正说明USER.md没写/没被prompt读出 |
| Skill写入率 | 前期升→后期稳，patch>新建 | 3个月后仍大量新增=系统未收敛 |
**任一指标长期不动 = 闭环某一节断了。**
## 4个亲测观察
1. **进化不是线性的，是阶段性跃迁**：5天没变化，第6天突然很顺——某个高频Skill终于稳定下来让一类任务从摸索变成一键执行
2. **失败信号驱动的进化最明显**：复盘成功→优化（省1~2步）；复盘失败→质变（避开整类陷阱）。别怕Agent失败，怕的是失败后没复盘
3. **闭环里最弱的环节是检索**：Skill写出来了，但用户措辞变一点就漏过。建议第一个看Skill的trigger设计是否覆盖各种说法
4. **每周10分钟人工review**：扫.hermes/memory/和.hermes/skills/——删拟人化偏好/删过度抽象Skill/精简太啰嗦条目/归档没用Skill。"高度自动+极少人工"是当前现实解法
## 对"自进化"的理解
**最值钱的3点设计**：
1. 分层解耦：每个零件只关心自己的事，不互相耦合
2. 多重过滤：Nudge一次/Review一次/Linter一次，让噪音难进Memory/Skill
3. 可观测：5个指标随时能告诉你闭环健不健康
**个人Agent和企业级Agent的分水岭**：以上3点。
## 章节定位
- 第二章：个人Agent自进化
- 第三章：Hermes源码架构深挖（Agent Loop/Prompt Assembly/MemoryStore/Skill Manager）
- 第四章：从个人Agent到企业级Skill Hub的工程化跨越