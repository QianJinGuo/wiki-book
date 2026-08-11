# STAROps Host Intelligent Inspection — 24/7 AI Doctor for ECS

## Ch11.202 STAROps Host Intelligent Inspection — 24/7 AI Doctor for ECS

> 📊 Level ⭐⭐ | 6.9KB | `entities/starops-host-intelligent-inspection.md`

# STAROps Host Intelligent Inspection

STAROps 主机智能巡检是阿里云全域智能运维平台 [STAROps](../ch04/430-agentic-cloud.html) 的一项核心能力，面向主机（ECS）基础设施层提供「自动体检 + AI 医生」式巡检——从事后救火转向事前防护。

STAROps 的名字代表运维四层理念：全域感知（Sense）、目标导向（Target）、自主运维（Autonomy）、业务韧性（Resilience）。主机智能巡检正是「业务韧性」的关键实现——自动为每台主机做一次覆盖 **CPU、内存、磁盘、网络、GPU、内核、硬件七大领域、超过 50 个检查项** 的全面检查。

## 与 RUM 智能巡检的姊妹关系

主机智能巡检与 [STAROps RUM Intelligent Inspection](../ch01/1199-spec.html) 是同一平台下的两个互补能力：RUM 巡检关注**用户体验层**（页面、业务路径、设备段的体验退化灰色地带），主机智能巡检关注**基础设施层**（主机内核态与硬件层的隐患）。二者共同构成 STAROps 巡检能力矩阵。

## 分层架构：STAROps 编排 + SysOM 深度诊断

STAROps 与阿里云操作系统控制台的运维组件 **SysOM** 分工协作：

- **STAROps**：面向用户的统一入口和智能运维大脑——自然语言下发巡检/排障，负责编排流程、关联全域数据、生成分级报告
- **SysOM**：操作系统层专业诊断能力提供方——提供 memgraph（内存分析）、diskanalysis（磁盘诊断）等专项诊断算子

调用关系：主机智能巡检发现异常 → STAROps 作为编排者并发调用 SysOM 底层诊断工具做深度定位 → 内核级结论汇总进巡检报告。一个是「望闻问切、统筹开方」，一个是「深入病灶、精准化验」。

## 覆盖深度：内核态 + 硬件层

普通监控只看 CPU/内存/磁盘「大众指标」，主机智能巡检把探头伸进更深层：

- **内核事件**：softlockup（业务线程饿死）、hungtask（进程僵住超两分钟）、RCU stall（内核死锁前兆）、conntrack 表满（新连接被悄悄丢弃）
- **硬件层**：处理器退化 MCE 错误、内存条即将失效 ECC 错误、硬盘濒临故障 SMART 告警、光模块老化丢包 CRC 错误

## 诊断证据链模式

一次巡检 = 发现 + 定位 + 根因 + 方案。以「业务突然变慢」为例：发现「iowait 持续偏高」→ 定位「MySQL 进程频繁 fsync」→ 根因「sync_binlog=1 让每次事务提交都要等磁盘」→ 直接给可执行方案。这背后是 STAROps 的 AI 诊断引擎，把资深 SRE 几小时甚至几天的排查功力压进一次自动巡检。

## 真实案例

1. **大促前 Slab 内存预警**：SReclaimable 异常升高占内存 30%，AI 诊断出日志采集 Agent 遍历 /proc/*/fd 产生海量 dentry 缓存，调整采集策略后释放 8GB 内核内存，避开大促 OOM 风险
2. **conntrack 表满**：使用率 92% + 「table full, dropping packet」，AI 判定 K8s 短连接场景 conntrack_max 默认值不足，调参 + keepalive 后超时消失
3. **数据库慢查询**：磁盘写延迟 5ms→200ms，AI 诊断为 O_SYNC 叠加同盘混部 IOPS 争抢，分离 WAL 与数据盘后回落到 5ms

## Agent 化五步巡检流程

用户一句自然语言「/主机巡检，对当前 workspace 的所有 ecs 做一次巡检」即可触发：Agent 读取 Skill 补齐参数（region/UID/workspace/time_range）→ 调用 SLS 异常事件查询扫描（演示：3 类 CRITICAL、102 台实例、1380 事件）→ 对关键实例并发调用 SysOM（memgraph/diskanalysis）→ 汇总分级报告（🔴 P0 需立即处置 + 🟢 P2 持续观察）。这是 **Skill + Agent + SysOM 三件套**的落地形态。

## 第 2 来源 — SysOM 巡检 Skill 开源（2026-07-28）

阿里云操作系统控制台在开源 SysOM 诊断 Skill 之后，将 **SysOM 巡检 Skill** 一并开源，两者构成「巡检发现问题 → 诊断定位根因 → 给出处置建议」的完整闭环，后续一同纳入 SysOM 技能包。

互补角度 4 条（相对第 1 来源）：

1. **19 项巡检执行项的技能化实现**：巡检 Skill 执行 19 项巡检（18 项 Normal + 1 项 Error 命中），把第 1 来源「50+ 检查项」的概念框架落到可安装的 skill 包（`npx skills add aliyun/alibabacloud-aiops-skills --skill alibabacloud-alinux-sysom-inspection`），支持 Qoder、Claude Code 等 Agent 宿主加载。
2. **真实案例数据**：一次内存告警案例——19 项巡检 37.4 秒完成，命中内存使用率 91.90%、空闲内存仅 161MB，memgraph 深度诊断定位到 python 进程独占 12.95GB 匿名内存（占总内存约 83%），处置时间「从四十分钟压到不到五分钟」。
3. **巡检→诊断→处置闭环 + 技能包组合**：巡检 Skill 负责事前发现隐患，诊断 Skill 负责事后定位根因，二者组合为 SysOM 技能包，实现「让 Agent 既能事后止损，更能事前预防」的主动运维模式。
4. **memgraph 深度诊断自动串联机制**：巡检命中高风险项后自动串起 SysOM 内置的 memgraph（内存深度分析）诊断，报告不止停在「内存高了」，而是直接给出「哪个进程占了多少、占总内存比例、可排除哪些」的根因级结论。

→ [原文存档 1](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/starops-host-intelligent-inspection-ecs-ai-doctor-2026.md)

→ [原文存档 2](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/sysom-巡检-skill-一键锁定根因.md)

---
## 关联
- 姊妹能力: [STAROps RUM Intelligent Inspection](../ch01/1199-spec.html)
- 姊妹能力: [STAROps UModel 数字孪生 + OpenAPI 嵌入（客户集成模式）](../ch01/1119-20.html)
- 平台: [阿里云 Agentic Cloud](../ch04/430-agentic-cloud.html)

---

