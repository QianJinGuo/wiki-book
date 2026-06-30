# Auto-Improving Agent Platform (Ashpreet Bedi)

## Ch01.559 Auto-Improving Agent Platform (Ashpreet Bedi)

> 📊 Level ⭐⭐ | 6.5KB | `entities/auto-improving-agent-platform-ashpreetbedi.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/auto-improving-agent-platform-ashpreetbedi-shensi.md)

# Auto-Improving Agent Platform (Ashpreet Bedi)
**作者**：Ashpreet Bedi（前 Airbnb/Facebook，Agno 创始人）    
**来源**：深思圈（深思SenseAI）    
**原始链接**：https://mp.weixin.qq.com/s/d_Kqaw_2nxJJDXsbHDPPgA    
**原始资料**：https://x.com/ashpreetbedi/status/2053885390717890757    
**开源**：agent-platform-railway    
**评分**：v=7, c=8, score=56    
**入库日期**：2026-05-13  
---  

## 概要
Ashpreet Bedi 的 Auto-Improving Agent 平台五工作流：Create→Improve→Extend→Hill Climb→Review；三原则（API化/数据同地/日志优先）；核心洞察——5秒反馈循环改变"值得做"边界；INSTRUCTIONS 驱动自动测试生成；Agent 行为天然可自动评分；反思：优化符合规格 ≠ 真正有用，提示词文件化是底层前提。  

## 五工作流
| 工作流 | 性质 | 核心功能 |  
|--------|------|---------|  
| Create | 从零搭 | 一句指令搭新 Agent，5-10 分钟 |  
| Improve | 向外探索 | 从 INSTRUCTIONS 生成 8-12 个探针，自动找问题，5 秒/轮，最多 5 轮 |  
| Extend | 人主导 | 外科手术式加功能，AI 执行，有冒烟测试 |  
| Hill Climb | 守住 | 批量跑整个 eval 集，按失败类型映射修代码 |  
| Review | 文档一致性 | 修文档-代码漂移，机械性漂移自动修 |  

## 三架构原则
| 原则 | 说明 | 作用 |  
|------|------|------|  
| API 化 | 每个操作可 cURL/bash 调用 | 消除"必须手动操作"的卡死环节 |  
| 数据同地 | Session/轨迹全在 Postgres | 无需跳出去捞数据 |  
| 日志优先 | Docker + 实时日志 | 5 秒反馈循环 |  

## 核心洞察
1. **5 秒反馈循环**：速度改变"值得做"的边界——人工调试几分钟到几十分钟，5 秒意味着你倒杯水回来它已经跑完十几轮  
2. **INSTRUCTIONS 驱动测试生成**：测试案例从规格说明书推导，不是人工写——你不需要会写测试，需要会写规格说明书  
3. **Agent 行为天然可自动评分**：Agent 产品即行为，有明确是非答案；比"UI 改动是否让用户更满意"更容易机器度量  
4. **提示词文件化是底层前提**：docs/ 目录下的 .md 文件让工作流可重复执行、被克隆、被 AI 自己调用  

## Improve 工作流
```  
INSTRUCTIONS → 生成 8-12 探针（正常+边界+对抗性）  
→ cURL 打到容器  
→ 读响应+日志，按 INSTRUCTIONS 承诺判断 PASS/FAIL  
→ 诊断失败 → 修代码（收紧规则/新增规则/换工具/调参数）  
→ 热重载 → 重新验证失败探针  
→ 最多 5 轮，全通过即停  
```  

## Hill Climb vs Improve
- **Improve**：捕获超出分布的失败（你之前没想到的问题）
- **Hill Climb**：确保分布内的已知问题不回退

## 局限与反思
1. **规格对齐 ≠ 真正有用**：系统高效地让 Agent 完美符合一个**错误的标准**，前提仍是人写 INSTRUCTIONS 的质量   
2. **迁移代价**：老代码库需先付迁移代价才能到达起跑点   
3. **真正的不确定**：当系统足够好时，如何知道它在优化的方向仍是我们真正想要的方向？   

## 深度分析
### 为什么自动改进在 Agent 平台率先成立
传统软件难以自动改进，核心障碍是**输入输出散落在不同工具里**——查监控、拉日志、看慢查询，每个操作摩擦都足以让自动化卡死。Ashpreet 的解法不是发明新算法，而是从架构设计的第一天就把"自动改进"刻进去：所有操作 API 化、数据同地（Postgres）、日志实时可用。三条原则缺一不可，共同构成了 5 秒反馈循环的基础设施。  
更深层的原因在于：Agent 平台的"产品"本身就是行为，而**行为天然可以机器评分**。普通 API 改版后用户的满意程度难以自动度量，但 Agent 的响应是否有意义、是否遵循指令，是非清晰的。这让"自动改进效果可度量"这件事在 Agent 领域率先成立。   

### Improve vs Hill Climb：向外探索与向内守住
这是两个不同方向的正交工作流：Improve 负责捕获**超出分布的失败**（你之前没想到的问题），Hill Climb 负责确保**分布内的已知问题不回退**。一个像探索者，不断发现盲区；一个像守卫，防止已攻下的阵地丢失。两者组合才是完整的质量保障体系。   

### 提示词文件化：被低估的底层前提
Ashpreet 把五条工作流的提示词全部写成 .md 文件放在 docs/ 目录下，而不是每次临时在 Claude Code 里打一段话。这个看似简单的"整理习惯"实际是整件事能成立的关键：它让工作流可重复执行、可被他人克隆、**可被 AI 自己调用**。没有提示词文件化，Improve 的自动化测试生成、Review 的文档漂移检测都无从谈起。   

## 实践启示
1. **从架构设计第一天就刻入三条原则**：API 化（消除手动操作卡点）、数据同地（Postgres colocate）、日志优先（5 秒反馈）。后期改造的迁移代价远高于初期投入。   
2. **INSTRUCTIONS 是真正的瓶颈**：Improve 工作流的核心不是 LLM 能力，而是规格说明书的质量。会写规格说明书比会写测试更重要——测试会从规格自动推导。   
3. **Review 工作流的价值被严重低估**：文档与代码漂移是生产软件的隐性税，在传统模式下手工修性价比极低。Review 把这门税降到了接近零。   
4. **提示词文件化是基础设施**：将工作流提示词 .md 化不只是代码整洁，而是打开"AI 自己调用工作流"这扇门的钥匙。   
5. **警惕"高效符合错误规格"陷阱**：当自动化改进稳定运行时，需要建立机制定期审视 INSTRUCTIONS 本身是否仍对应真正的用户需求。   

## 相关实体
- `Harness架构` — Agent自我改进的基础设施要求
- `Bedrock多Agent` — 企业级Agent平台的架构对比
## 相关实体
- [Servicenow Ui Is Dead Agent](ch04/503-agent.md)
- [The Ui Is Dead Long Live The Agent Servicenow Goes Headless And Opens Its Platform](ch04/503-agent.md)
- [Agent框架Owl原理详解](ch04/503-agent.md)
- [The Ui Is Dead Long Live The Agent Servicenow Goes Headless](ch04/503-agent.md)
- [Gbrain Garry Tan Yanfa Zhili](ch04/150-ai.md)

---

