---
title: "OpenAI秘密矩阵曝光！你的所有设备，被Codex连成一台超级电脑"
created: 2026-05-18
updated: 2026-05-18
type: article
platform: 新智元
author: ASI启示录
source_url:
sha256: 3c73a90e9f0e8b1744c2f0db058904748c653f5dde5c76e8438453623537c663 https://mp.weixin.qq.com/s/aU4fWgoynl53jUYv0iMxAw
source: 新智元
tags: [openai, codex, computer-use, multi-device, agent, locked-use, remote-control, distributed-computing]
---
# OpenAI秘密矩阵曝光！你的所有设备，被Codex连成一台超级电脑
来源：新智元 / ASI启示录
## 核心信息
OpenAI 正在将 Codex 升级为掌控所有硬件设备的「超级控制平面」——所有 Mac Mini、台式机、旧电脑组成完全属于你个人的 Codex 网络，成为一整个算力系统，即使锁屏都不怕。
## Codex 将所有设备连接成巨大网络
**5月14日**，OpenAI 给 ChatGPT 手机 App 更新了远程控制功能：在外面可以查看家里/公司 Mac 上 Codex 的运行状态，审批命令，派发新任务。
随后 TestingCatalog 创始人 Alexey Shabanov 爆料：OpenAI 正在为 Codex 秘密开发**跨设备控制能力**，彻底干掉 SSH 等传统连接方式。
**设置界面入口**：`设置` -> `连接` -> `控制其他设备`
点击加号，所有安装了 Codex 的设备全部绑定在一起：
- 主力 MacBook
- 公司高性能工作站
- Mac Mini
- 淘汰下来的旧电脑
在这个网络里，**手机是最高入口**，所有笔记本、Mac Mini、备用机都变成执行节点。任何一台设备都可以被远程操控，即使在睡眠状态。
不需要懂任何复杂的网络配置（SSH 密钥、内网穿透），只要登录同一个 ChatGPT 账号，AI 自己就在底层把所有的设备通道打通。
**从此，Agent 不是只在一台机器上跑，而是在你的所有设备上开始协作。**
## 开发者实例
Greg Brockman 转发了一大波开发者分享的工作流：
- 有人说自从用手机访问 Codex，自己的笔记本就变成卫星设备了，Mac Mini 成为主力机
- 他的 MacBook 和 MacMini 已成双向互连的设备，可以从任何一台设备上开始和继续任务
- Codex 始终在线，所有线程都可以从三台设备中的任何一台访问
## 终结「锁屏瘫痪」：Locked Use
现有 AI Agent 工具（如 Claude Code）的硬伤：**「锁屏即瘫痪」**——AI 操作电脑的核心是 Computer Use，需要像人类一样"看"到屏幕像素，一旦笔记本合上或进入睡眠状态，AI 就瞎了。
OpenAI 的致命杀招叫 **「Locked Use（锁定使用）」**：
正在疯狂公关 macOS 和 Windows 的系统底层权限，让 Codex 拥有在锁屏甚至休眠状态下，依然能够常驻后台、继续驱动 Computer Use 的特权。
**挑战**：这跟 macOS 的安全设计是对着干的，OpenAI 如何应对苹果仍然是未知数。
## 多机上下文共享
设备之间的连接不只是简单的远程桌面，而是彻底融合成一个**统一的逻辑大网络**。
当你需要新建工作区时，不需要在 ChatGPT 里切换"我是连 MacBook 还是连 Mac Mini"。
只需要切换项目，你的 MacBook Codex 在运行代码时，就可以直接跨越网络，读取另一台 Mac Mini 上的本地文件、上下文甚至环境变量。它们之间的知识、数据、记忆是完全同步、毫无缝隙的。
## Skills 生态爆发
开发者正在用「创始人模式」疯狂为 Codex 编写 Skills：
**案例一：代码库复杂度终结者**
```bash
npx --yes codex-complexity-optimizer
```
Codex 直接化身世界级架构师，扫描整个项目。
**案例二：本地商户获客黑客**
```bash
npx --yes local-client-prospector-skill
```
利用 Computer Use 直接去地图、本地生活平台搜索附近商铺、健身房、餐厅，逐个点进去分析，提取电话和联系方式，吐出销售 Lead 表格。
## 安全隐患
AGI Hunt 在体验 Codex 跨设备多端连接后发出警告：
**发现逻辑漏洞**：他有两台 iPhone 登录了同一个 ChatGPT 账号。在主力手机上配置好、授权连接了电脑的 Codex 之后，他震惊地发现——**第二台备用手机，在完全没有经过电脑端任何二次授权的情况下，默认就可以直接控制这台电脑的 Codex！**
当新手机尝试连接时，电脑端毫无动静，反而是手机端弹出提示：「允许此手机访问电脑上的 Codex 吗？」
## OpenAI 的真正野心
OpenAI 正在做的，是利用大模型作为通用的操作接口，把高不可攀的「分布式计算集群」，降维做成一款**傻瓜式的消费级产品**。
> AI Agent 不应该只是浏览器里的一个对话框，它应该成为下一代操作系统的灵魂，成为连接物理硬件与数字世界的超级中枢。
## 参考链接
- https://x.com/testingcatalog/status/2055708109343994335
- https://x.com/op7418/status/2055561525633642762
- https://x.com/gdb/status/2056046844921172243