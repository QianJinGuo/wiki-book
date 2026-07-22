---
title: 7个月，234次提交，1690行代码：AI编程大型翻车现场：我决定全部作废，手动重写！
source_url: https://mp.weixin.qq.com/s/5wsXiGpd1wjHL9qwEqsGCw
publish_date: 2026-05-13
tags: [wechat, article, claude, coding]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: 976f8c0ee21c7f7d6d3cd3b6f773bc90e4ce6ac45d398a88e6f9d0503ac17b5d
---
# 7个月，234次提交，1690行代码：AI编程大型翻车现场：我决定全部作废，手动重写！
CSDN程序人生
2026年5月13日 09:55 江苏
【CSDN 编者按】在 Hacker News 引发 500+ 讨论的"大型翻车现场"复盘："我花了 7 个月搞'氛围编程'，结果搓出了一堆工业垃圾。" 开发者 @dropbox_miner 的这段血泪史，刺破了 AI 编程的虚假繁荣。
原文链接：https://blog.k10s.dev/im-going-back-to-writing-code-by-hand/
HN讨论：https://news.ycombinator.com/item?id=48090029
## 核心复盘
- AI 写作的"通病"：AI 写代码总喜欢给你搞出庞大的"上帝对象"（耦合严重、难以维护的臃肿代码）；
- 如果只追求 AI 瞬间产出的那种"爽感"，你会发现项目变得廉价且臃肿，最终彻底跑偏；
- 架构必须由人来定，如果你只会不断向 AI 索要功能，最终得到的只是一堆功能拼凑的垃圾。
## 项目背景
历经 234 次提交，耗时 30 个周末，几乎全是用 AI "氛围编程"搓出来的。
开源工具 **k10s**：GPU 友好的 K8s 仪表盘，GPU 界的 k9s，专为 NVIDIA 集群运维人员设计。
AI 是写代码的快枪手，但它不是架构师。你越是不加限制地让 AI 代劳，系统崩得就越快。
## Vibe Coding 的魔法时刻与崩塌
2025 年 9 月底启动项目。前几周简直是"魔法时间"：3 个周末搞定 k9s 基础克隆版，比手写快了 10 倍。
想做 GPU 集群概览"杀手级功能"时，Claude 一次就生成了 FleetView 结构体。但切换回 Pod 列表时，屏幕一片死寂。那个"上帝对象"失控了。
咬咬牙读完了 model.go——整整 **1690 行代码**，全塞进了同一个结构体里，Update() 方法 500 行，110 个 switch/case 分支。
## 五大铁律
### 铁律 1：AI 只能帮你堆功能，架构还得你来定
Claude 每次只满足当前"让功能跑起来"，不在乎这行代码会不会把之前那 49 个功能全搞崩。
解决方案：架构必须由人亲手设计，把规则强行塞进 CLAUDE.md：
```
# Architecture Invariants
- Each view implements the View trait. Views do NOT access other views' state.
- All async data arrives via AppMsg variants. No direct field mutation from background tasks.
- Adding a new view MUST NOT require modifying existing views.
- The App struct is a thin router. It owns navigation and message dispatch. Nothing else.
```
### 铁律 2：AI 的懒惰本性
AI 天生爱搞"一个结构体管所有事"，因为这最快看到效果，省去了繁琐的解耦仪式。
同一个 s 键在不同界面有三种不同功能（自动滚动/进Shell/进容器），全堆在扁平 switch 里——灾难。
```
# State Ownership Rules
- NEVER add fields to the App/Model struct for view-specific state.
- Each view is a separate struct implementing the View trait/interface.
- Each view declares its own key bindings. The app dispatches keys to the active view.
- If you need to add a keybinding, add it to the relevant view's keymap, not a global one.
```
### 铁律 3：速度的幻觉正在摧毁专注
AI 让每个功能看起来都像"免费午餐"，你的野心开始疯狂膨胀，往"上帝对象"里疯狂塞地雷。
解决方案：写"愿景文档"，明确 NOT BUILDING 边界：
```
# Scope (do NOT expand beyond this)
k10s is for GPU cluster operators. Not all Kubernetes users.
Supported views: fleet, node-detail, gpu-detail, workload. That's it.
Do NOT add generic resource views (pods, deployments, services).
```
### 铁律 4：谨慎处理位置数据
AI 把 `type OrderedResourceFields []string` 用索引下标代表列——全是"魔法数字"（ra[3]=分配率，ra[2]=计算，ra[0]=名称）。K8s API 字段顺序一换，整个程序瞬间崩溃。
```
# Data Representation
- NEVER flatten structured data into []string, Vec<String>, or positional arrays.
- All data flows as typed structs (FleetNode, PodInfo, etc.) until the render() call.
- Column identity comes from struct field names, not array indices.
```
用类型明确的 struct，让离谱的逻辑错误在编译阶段就被发现。
### 铁律 5：严禁让 AI 随意触碰状态转换
Bubble Tea 架构精髓：状态变动只能由 Update() 在收到消息后触发。
但 AI 在后台 goroutine 里开闭包直接修改 Model 字段——典型的并发编程自杀行为，造成数据竞争。
```
# Concurrency Rules
- Background tasks NEVER mutate UI state directly.
- Background tasks send results through a channel as typed messages.
- Only the main event loop applies state mutations from received messages.
- render()/view() is a PURE function. No side effects. No I/O. No channel operations.
```
## 结论
作者正在用 Rust 重写 k10s。"在动笔之前，我先亲手把设计稿敲定——接口、消息类型、所有权规则，都在第一个提示词输入之前就已写在纸上了。"