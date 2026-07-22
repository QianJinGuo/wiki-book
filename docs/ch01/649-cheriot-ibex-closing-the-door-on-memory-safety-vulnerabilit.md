# CHERIoT-Ibex: Closing the door on memory safety vulnerabilities with hardware-enforced protection

## Ch01.649 CHERIoT-Ibex: Closing the door on memory safety vulnerabilities with hardware-enforced protection

> 📊 Level ⭐⭐ | 7.0KB | `entities/cheriot-ibex-memory-safety-hardware-enforcement.md`

## 深度分析
CHERIoT-Ibex 是微软于 2023 年开源的 CHERIoT 平台的核心实现，首次将 CHERI（Capability Hardware Enhanced RISC Instructions）能力模型落地为生产级开源硬件。 CHERI 架构通过**能力指针（Capability）** 取代传统 flat pointer，从硬件层面强制约束每个内存区域的访问权限——包括空间边界（spatial）和有效期（temporal），从根源上堵死 buffer overflow 和 use-after-free 两类最高发漏洞。
CHERIoT 在 CHERI 基础上专为嵌入式 / IoT 场景做了轻量化适配，底层选用 LowRISC 的 32 位 RISC-V 核心 Ibex。CHERIoT-Ibex 通过 CHERI Alliance 认证，验证其提供**空间安全 + 时间安全 + 细粒度隔离**三重保障，且硅成本与低功耗微控制器相当——打破了"安全必付溢价"的传统假设。
微软数据显示其每年 CVE 中约 70% 源于内存安全漏洞（CISA 报告亦指出软件产品内存安全问题的紧迫性），CHERIoT-Ibex 的定位正是从硬件层消除这类缺陷的根因。

## 实践启示
**适用场景**：对安全有强制要求的嵌入式微控制器、IoT 端点、Azure 底层基础设施固件。
**集成路径**：微软已开源完整 ISA + 工具链 + RTOS + RTL，开发者可通过 [microsoft/cheriot-ibex](https://github.com/microsoft/cheriot-ibex) 获取并参与生态。
**架构决策**：CHERIoT-Ibex 体现 silicons-to-systems 战略——安全不从软件层打补丁，而是下沉至硬件基础设施，从设计之初即嵌入纵深防御。

# "CHERIoT-Ibex: Closing the door on memory safety vulnerabilities with hardware-enforced protection"
URL Source: https://techcommunity.microsoft.com/blog/azureinfrastructureblog/cheriot-ibex-closing-the-door-on-memory-safety-vulnerabilities-with-hardware-enf/4517904
Published Time: 5/9/2026, 5:08:11 AM
Markdown Content:

# CHERIoT-Ibex: Closing the door on memory safety vulnerabilities with hardware-enforced protection | Microsoft Community Hub
Open Side Menu
[Skip to content](https://techcommunity.microsoft.com/blog/azureinfrastructureblog/cheriot-ibex-closing-the-door-on-memory-safety-vulnerabilities-with-hardware-enf/4517904#main-content)[![Image 1: Brand Logo](https://techcommunity.microsoft.com/t5/s/gxcuf89792/m_assets/themes/customTheme1/favicon-1730836271365.png?time=1730836274203)](https://techcommunity.microsoft.com/)
[Tech Community](https://techcommunity.microsoft.com/)[Community Hubs](https://techcommunity.microsoft.com/Directory)
[Products](https://techcommunity.microsoft.com/)
[Topics](https://techcommunity.microsoft.com/)
[Blogs](https://techcommunity.microsoft.com/Blogs)[Events](https://techcommunity.microsoft.com/Events)
[Skills Hub](https://techcommunity.microsoft.com/category/skills-hub)
[Community](https://techcommunity.microsoft.com/)
[Register](https://techcommunity.microsoft.com/t5/s/gxcuf89792/auth/oidcss/sso_login_redirect/provider/default?referer=https%3A%2F%2Ftechcommunity.microsoft.com%2Fblog%2Fazureinfrastructureblog%2Fcheriot-ibex-closing-the-door-on-memory-safety-vulnerabilities-with-hardware-enf%2F4517904)[Sign In](https://techcommunity.microsoft.com/t5/s/gxcuf89792/auth/oidcss/sso_login_redirect/provider/default?referer=https%3A%2F%2Ftechcommunity.microsoft.com%2Fblog%2Fazureinfrastructureblog%2Fcheriot-ibex-closing-the-door-on-memory-safety-vulnerabilities-with-hardware-enf%2F4517904)
1.   [Microsoft Community Hub](https://techcommunity.microsoft.com/)
3.   [Communities](https://techcommunity.microsoft.com/category/communities)[Products](https://techcommunity.microsoft.com/category/products-services)
5.   [Azure](https://techcommunity.microsoft.com/category/azure)
7.   [Azure Infrastructure Blog](https://techcommunity.microsoft.com/category/azure/blog/azureinfrastructureblog)
[Report](https://techcommunity.microsoft.com/blog/azureinfrastructureblog/cheriot-ibex-closing-the-door-on-memory-safety-vulnerabilities-with-hardware-enf/4517904#)

## Azure Infrastructure Blog
## Blog Post
Azure Infrastructure Blog
3 MIN READ

# CHERIoT-Ibex: Closing the door on memory safety vulnerabilities with hardware-enforced protection
[![Image 2: kunyanliu's avatar](https://techcommunity.microsoft.com/t5/s/gxcuf89792/m_assets/avatars/default/avatar-9.svg?image-dimensions=50x50)](https://techcommunity.microsoft.com/users/kunyanliu/3487734)
[kunyanliu](https://techcommunity.microsoft.com/users/kunyanliu/3487734)
![Image 3: Icon for Microsoft rank](https://techcommunity.microsoft.com/t5/s/gxcuf89792/images/cmstNC05WEo0blc?image-dimensions=100x16&constrain-image=true)Microsoft
May 08, 2026
Memory safety vulner
## 相关实体
- [05 11 The Great Memory Panic Of 2026](ch01/840-the-great-memory-panic-of-2026.html)
- [Memory In The Llm Era Iclr2026](ch01/603-llm.html)
- [Openchronicle Memory Layer](https://github.com/QianJinGuo/wiki/blob/main/entities/openchronicle-memory-layer.md)
- [Hermes 9 Module Architecture Winty](ch01/715-9.html)
- [Openclaw Prompt Context Harness](../ch11/227-openclaw.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/memory-context-systems.md)

---

