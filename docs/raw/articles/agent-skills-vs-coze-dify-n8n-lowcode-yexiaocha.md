---
title: "Agent Skills会不会淘汰Coze、Dify、N8N等低代码平台？"
author: 叶小钗
date: 2026-05-19
source_url: https://mp.weixin.qq.com/s/4OtZSJPK6-LGHjyNYfRjJw
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
source: https://mp.weixin.qq.com/s/4OtZSJPK6-LGHjyNYfRjJw
ingested: 2026-05-19
sha256: 597f916505e69d6bccc7530bad6eb887f4739d6596f29732a1eb9336a4623f3c
---
---
# Agent Skills会不会淘汰Coze、Dify、N8N等低代码平台？
（正文约3500字，来源：叶小钗，2026-05-19，HR简历筛选案例对比Skills vs Workflow）
## 案例：HR简历筛选业务流程
需求：HR上传简历→解析→提取结构化信息→按岗位评分规则打分→写入飞书多维表格
包含：文件解析/信息提取/模型判断/数据写入/多人协作/追踪
## Workflow实现（Coze/Dify）
**本质：低代码平台**，通过拖拉拽节点编排Workflow。
典型节点：上传简历→文件类型判断→PDF/Word/图片解析→原文提取→结构化抽取→岗位规则拉取→模型评分→写多维表格→返回结果
**核心特征**：
- 每个节点输入输出确定
- 整体流程可控可见
- 可追踪运行日志
- 可精确定位异常节点（手机号没写入=解析/映射/权限哪个环节问题）
**Workflow平台追求**：流程看得见/节点控得住/异常能处理/结果能入库/权限能管理/团队能协作/后续能维护
## Skills实现（Agent Skills）
**本质：把Workflow用自然语言描述，封裝成Agent可理解的可复用能力包。**
HR简历筛选skill示例（真实SKILL.md代码）：
- name/description/使用场景/必要输入（简历来源/岗位信息/候选人结果表/岗位规则表）
- 飞书脚本（scripts/feishu_bitable.py用法）
- 执行流程：确认上下文→检查字段→解析简历→提取字段→查询评分规则→模型评分→校验→dry-run预览→写入→返回摘要
- 字段映射：候选人字段+筛选字段+推荐等级取值+分数段规则
- 评分原则：不凭通用印象评分/必须给证据/不因关键词堆砌给分/不做最终录用决定
- 异常处理：解析失败/规则缺失/输出不合规/飞书写入失败/批处理部分失败
- 输出格式（Markdown表格）
## Skills vs Workflow对比
| 维度 | Skills | Workflow |
|------|--------|----------|
| 入口 | 用户直接交办任务，Agent匹配方法 | 先搭好流程，用户按流程提交 |
| 灵活性 | 高，动态理解任务上下文 | 低，参数固定 |
| 治理难度 | 高（企业环境复杂） | 低（流程固定可审查） |
| 适用场景 | 个人/小团队快速验证 | 企业生产环境 |
**临时强调需求对比**：
- Workflow：改参数/调规则
- Skills+Agent：Agent先理解这次任务具体要求，再结合skill动态执行
## 核心洞察：Skill是Workflow的另一种表达
"Skill只不过是Workflow的另一种表达方式，新瓶装旧酒，载体不同了而已。"
HR简历筛选skill里写：先解析简历→再提取字段→再拉岗位规则→再评分→再写入多维表格——这是Workflow！
"没有Skills这套工程机制前，Agent的稳定性是更加糟糕的。"
## 企业选型
**个人/小团队快速验证**：Skills更有优势——轻/快/灵活/交互自然
**企业真实生产环境**：Workflow平台更合适，因为涉及严肃问题：
- 候选人隐私保护
- 简历附件存储权限
- 联系方式查看权限
- 岗位评分规则维护
- 不同岗位规则版本管理
- 模型评分解释依据
- 筛选结果追溯
- 规则变更版本管理
→ 这些更适合显性Workflow（更易审查/权限控制/日志记录/团队交接）
## 判断
**Skills不会让Coze/Dify这类Workflow平台死掉，但会给到压力，倒逼升级。**
Coze已在变化：不再定位为工作流搭建平台，而是通过AI Coding方式实现Workflow搭建（不再需要手动拖拉拽）。
两边会向中间靠拢：Workflow平台越来越Agent化；Skills系统越来越平台化、可治理化。
## 最重要的事：Knowhow
**无论用Coze/Dify还是Skills，最终决定效果的是业务KnowHow，不是工具形态。**
HR简历筛选的真正难点：
- Java基础占多少/微服务经验占多少/高并发经验占多少
- 项目复杂度怎么看
- 只写熟悉Redis/Kafka但没项目细节，给不给高分？
- 学历一般但项目经历扎实，推不推荐？
- 两年换三家公司，风险怎么计算？
"AI应用的竞争表面上是Workflow/Skills/Agent的竞争，本质上是业务KnowHow承载方式的竞争。"
企业有没有能力把业务KnowHow变成可执行/可观测/可迭代的AI系统？
→ 没有这个能力，换什么平台都只是Demo
→ 有这个能力，Coze/Dify/N8N/Skills/Agent Runtime都只是不同阶段的承载层