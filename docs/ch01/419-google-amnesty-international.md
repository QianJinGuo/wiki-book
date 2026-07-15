# Google & Amnesty International：联手打击商业间谍软件

## Ch01.419 Google & Amnesty International：联手打击商业间谍软件

> 📊 Level ⭐⭐ | 11.0KB | `entities/google-amnesty-spyware-detection.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/google-amnesty-spyware-detection.md)

> 来源：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/google-amnesty-spyware-detection.md)

## 核心要点
- value=9, confidence=8, product=72
- Well-sourced expert article
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/google-amnesty-spyware-detection.md)

## 相关实体
- [Google and Amnesty International teamed up to make Android spyware detectable](../ch12/067-google-and-amnesty-international-teamed-up-to-make-android-s.html)

## 深度分析
### 背景：商业间谍软件对公民社会的威胁

### Intrusion Logging：首个主流设备商专项取证功能
具体而言，Intrusion Logging 会专门记录以下安全事件：

- **设备解锁（device unlocking）**：记录设备解锁的时间、方式和频率
- **物理访问（physical access）**：检测设备是否曾被他人物理接触
- **间谍软件安装与移除（spyware installation and removal）**：追踪可疑应用的安装和卸载行为
Amnesty International 在其技术简报中指出，这是**主流设备厂商首次发布专门用于增强高级数字威胁取证检测和响应能力的功能**。此前，独立调查人员（digital forensics researchers）只能依赖系统本身并非为取证设计的临时性日志文件，而 surveillance groups 对这些取证手段的了解程度已显著提升。

### 与其他防御功能的对比
Intrusion Logging 的推出使 Google 加入了对抗高级威胁的防御阵营，与以下已有功能形成互补：
| 功能 | 厂商 | 定位 |
|------|------|------|
| Lockdown Mode | Apple | 高风险用户的攻击面缩减 |
| Memory Integrity Enforcement | Apple | 防止内存级别的代码注入 |
| Strict Account Settings | WhatsApp | 防止账户劫持和间谍软件链接 |
| Intrusion Logging | Google (Android) | 取证日志记录，支持事后分析 |

### 局限性与已知约束
Amnesty International 在技术简报中也坦承了 Intrusion Logging 的若干限制：
1. **平台版本要求**：需要 Android 16，目前仅限 Pixel 设备
2. **账户绑定要求**：设备必须关联 Google 账户
3. **敏感数据暴露风险**：日志可能包含浏览器浏览历史等敏感信息，安全共享机制至关重要
4. **日志可被删除**：攻击者若获得 root 访问权限，仍可删除相关日志；Ó Cearbhaill 表示后续版本将加强此类防护
5. **部分攻击无法检测**：若攻击者具备 root 级别访问权限，部分日志保护机制可能失效
从积极面看，大量实际攻击并不需要 root 权限即可完成，因此 Intrusion Logging 仍能有效检测相当比例的入侵行为。

### 合作模式：Google + Amnesty International + Reporters Without Borders
Intrusion Logging 并非 Google 独自开发，而是与多个民间社会组织协作设计的成果。Google 2026 年度安全和隐私更新博客专门提及了与 Amnesty International、Reporters Without Borders 等组织的合作。这一合作模式体现了科技公司与公民社会组织在对抗 state-sponsored 和商业 surveillance 方面的新型协作路径。

## 实践启示
### 如何启用 Intrusion Logging
对于面临高级威胁风险的用户（如记者、维权律师、活动家），启用路径如下：
2. 进入 **Settings > Security & privacy > Advanced Protection > Intrusion Logging**
3. 日常使用中保持日志记录开启
4. 若怀疑发生安全事件，**导出并分享日志给专业取证分析师**

### 对 Spyware Vendors 的影响
Intrusion Logging 的推出对商业 spyware 生态构成了实质性压力：

- **提高攻击成本**：攻击者需要额外构建清除取证日志的能力
- **增加暴露风险**：即使入侵成功，若用户导出日志，调查人员可获得关键证据
- **推动防御竞争**：随着 Android 率先推出专项取证功能，其他平台（尤其是 iOS）可能面临跟进压力

### 值得关注的后续发展
- Google 承诺在后续版本中强化对日志删除攻击的防护
- 该功能向更多 Android 16 设备（Pixel 以外的厂商）的扩展情况
- Apple 是否会在 iOS 平台上推出类似的取证日志功能，形成平台间防御态势的对比

## 关联追踪
本篇内容与以下实体构成关联阅读：

-  — 同一合作的不同切入角度
-  — 同一新闻事件的平行存档
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/google-amnesty-spyware-detection.md) — CyberScoop 记者 Tim Starks 报道，2026-05-12 发布

## 扩展阅读：商业间谍软件生态详解

### 主要厂商与产品线

| 厂商 | 核心产品 | 已知客户 | 主要特征 |
|------|----------|----------|----------|
| NSO Group (以色列) | Pegasus | 60+ 国家政府 | 零点击漏洞利用、极度隐匿 |
| Cellebrite (以色列) | UFED | 全球执法机构 | 物理提取、数据解锁 |
| Cytrox (北马其顿) | Predator | 多国政府 | 复杂持久化能力 |
| Candiru (以色列) | unknown | 中东政府 | 定点攻击工具 |
| DarkMatter (阿联酋) | unknown | 阿联酋政府 | 国家级攻击能力 |

### Pegasus 攻击案例时间线

**2016-2017：Pegasus 首次曝光**

- Citizen Lab 披露 Pegasus 被用于追踪阿联酋异议人士 Ahmed Mansoor
- NSO Group 否认但随后被证实

**2021：飞马座项目（Project Pegasus）**

- Forbidden Stories 与 Amnesty International 合作调查
- 50,000+ 记者、活动家、政府官员被列入潜在目标
- 法国总统马克龙、巴基斯坦总理等政要被列为目标

**2022-2024：持续演进**

- NSO Group 被美国商务部列入实体清单
- 欧盟启动对 Pegasus 的调查
- 更多零点击漏洞利用手段被披露

### 间谍软件的技术演进路径

**第一代（2010-2015）**：需用户交互的钓鱼链接，依赖用户点击
**第二代（2016-2020）**：零点击漏洞利用，无需用户交互即可入侵
**第三代（2021至今）**：混合利用 + 持久化 + 隐匿删除

关键演进特征：

- 从「需要用户点击」到「零点击」
- 从「单设备攻击」到「设备集群联动」
- 从「事后取证」到「实时监控」

### Android vs iOS 攻击面对比

| 维度 | Android | iOS |
|------|---------|-----|
| 碎片化程度 | 高（多厂商、多版本） | 低（统一系统） |
| 零点击漏洞价值 | 较低（漏洞市场价格） | 极高（可达 $2.5M） |
| 取证工具可用性 | Cellebrite/UFED 成熟 | 相对受限 |
| 厂商响应速度 | 较快（开源可审计） | 较慢（封闭生态） |

### 民间社会组织在对抗间谍软件中的角色

- 核心职能：技术取证实录、威胁情报分析、政策倡导
- 代表性成果：Pegasus Project 核心技术支持方
- 在 Intrusion Logging 开发中的角色：需求定义、功能验证、部署建议

**Citizen Lab（多伦多大学）**

- 专注于发现国家支持的网络攻击
- 多次率先披露 NSO Group 攻击活动
- 与科技公司建立漏洞披露合作机制

**Reporters Without Borders (RSF)**

- 新闻自由倡导组织
- 为高风险记者提供数字安全培训
- 在 Google-Amnesty 合作中提供「用户视角」需求输入

### 国际监管框架进展

** Wassenaar Arrangement（瓦森纳协定）**

- 2013 年将入侵软件纳入出口管制
- 2020 年进一步明确「零点击」漏洞利用技术管控

**欧盟《反间谍软件法》（2024）**

- 对商业间谍软件销售实施更严格限制
- 要求供应商获政府批准才能出口

**美国商务部实体清单**

- 2021 年将 NSO Group、Candiru 列入清单
- 限制美国技术与这些公司交易

### 未来展望：Spyware Detection 的技术方向

**1. 硬件级安全 enclave**

- 将取证日志存储在硬件级安全区域
- 即使操作系统被攻破也无法篡改日志
- 类似于 Apple 的 Secure Enclave 理念

**2. 远程日志同步**

- 将关键日志实时加密同步到可信第三方
- 防止攻击者本地删除
- 挑战：隐私风险、延迟问题

**3. AI 辅助异常检测**

- 利用机器学习识别间谍软件行为模式
- 自动化初步筛查降低专家依赖门槛
- 当前局限：误报率高、难以对抗新型攻击

---

