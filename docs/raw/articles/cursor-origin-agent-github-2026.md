---
source: rss
source_url: https://mp.weixin.qq.com/s?__biz=MzIwNzc2NTk0NQ==&mid=2247619635&idx=1&sn=1b7ab087fe918f76608f4439f6b27c46
ingested: 2026-08-19
feed_name: WeChat-夕小瑶科技说
source_published: 2026-08-18
sha256: f4662114686ca529557fdb32e7c87757462227163c5430c366c7f83999f8e4c2
---

# Cursor上线Origin，为Agent重建GitHub

原创 丸美小沐 2026-08-18 09:38 北京

刚刚，Cursor宣布上线一个全新的代码托管平台——Origin，并开启早期Beta测试，即日起向所有付费方案用户推送。

这是Cursor第一次把「代码存放在哪里」纳入自己的产品边界。

此前，Cursor主要负责写代码、改代码和调用AI Agent，项目仓库、Pull Request 以及团队协作流程，大多仍然发生在 GitHub 上。

现在，Cursor开始自己提供代码仓库，让开发者可以直接在Cursor中新建、克隆和推送项目。

Cursor将Origin 称为**「面向智能体时代的 Git forge」。**

言下之意，GitHub属于上一个时代。

GitHub 诞生于2008年，它的整套协作模型是围绕人设计的：一个开发者开一个分支，提一个 PR，等同事审完再合并。节奏以「人天」为单位。

而AI Agent改变了这个节奏。当一个人同时指挥五个、十个 Agent 干活时，它们会在同一时间克隆仓库、开出大量分支、高频提交、彼此 rebase，还会产生一堆相互依赖、需要按顺序合并的变更。

传统 Git 托管平台的协作流程在这种密度下会开始「排队」：PR 相互阻塞，冲突需要人挨个仲裁。

仓库的架构跟不上AI写代码的速度，Origin想解决的就是这个问题。

2025年12月，Cursor收购了代码审查工具Graphite。后者以「堆叠式PR」（stacked pull requests）工作流著称，专长正是处理多个相互依赖的变更并行推进，原本用于帮人类团队解决PR排队问题。如今，这套机制被重新用在了机器协作上。

不过按官方说法，真正的Agent原生功能要稍后才会推出。现阶段，Origin主要提供两种工作模式。

## ◈两种用法：托管，或同步

Origin目前有两种工作模式。

**第一种，是直接把代码托管在Origin。**

Cursor 客户端新增了一个「Codebase」标签页，作为 Origin 仓库的统一入口。

用户点击「+ New」创建代码库并为其命名，这个名称会成为仓库 URL 的一部分，例如：

> `cursor.com/codebase/acme-corp`

创建完成后，页面会引导用户安装Origin CLI。

Origin 托管的仍然是标准 Git 仓库，日常操作方式与 GitHub 等代码托管平台基本一致，可以继续使用 `git clone`、`git pull`、`git push` 等常用 Git 命令克隆、拉取和推送代码；区别主要在于远程仓库地址和托管平台不同。

**第二种，是把现有GitHub仓库同步到Origin。**

用户连接GitHub账号、选择组织后，可以自行挑选需要同步的仓库。

GitHub仓库和Origin原生仓库会并列出现在Codebase页面中，仓库名旁的图标则用于区分代码究竟来自哪里。

同步后的GitHub仓库会与Origin实时更新（秒级）。

开发者可以在Origin中浏览、搜索和拉取代码，也可以直接查看完整的Pull Request时间线、提交记录、CI检查项和变更文件，在编辑器内审阅diff、留言甚至完成合并。

PR里的讨论同样支持双向同步：在Cursor里留下评论，会同步发布到GitHub；在GitHub上回复或者添加表情，也会在数秒内出现在Cursor中。

分配给你的GitHub Review，也可以直接在Cursor里处理。

但这里有一条非常重要的边界。

对于从GitHub同步过来的项目，代码推送依然进入GitHub，GitHub继续充当这些项目的“source of truth”，也就是权威代码源。

在开放范围上，Origin 目前仍是early beta，仅向付费方案用户逐步推送，免费用户暂不覆盖；企业组织的管理员可以选择不启用。

**生态：首批接入 Vercel、Depot、Buildkite**

Cursor还同步推出了应用扩展体系。在仓库的Apps标签页中连接部署平台Vercel后，每个PR都会自动获得一个预览部署，可供测试和评论，合并后由Vercel部署到生产环境。

CI方面接入了Depot与Buildkite两家持续集成服务商，两者都能直接运行用户现有的GitHub Actions工作流，Buildkite还支持其原生流水线。

官方称更多集成「即将到来」。

## ◈发布时机：赶上 GitHub 宕机，也赶上自己换东家

Origin 上线当天，GitHub 恰好遭遇全球性服务中断。

8月17日13:40（UTC）起，GitHub核心服务陆续降级，Pull Requests、Issues、Actions、Webhooks、API与Copilot等均受影响。网页与API整体错误率一度约20%，仓库归档与源码下载错误率接近50%。

Downdetector显示，高峰时超过一万名用户报告异常。事故持续约3小时20分钟，至16:59（UTC）多数服务恢复，Copilot恢复相对滞后。

而在三天前，SpaceX刚完成对Anysphere的600亿美元全股票收购交割，Cursor被并入新设的SpaceX AI部门。

这笔交易于6月16日宣布，创下风险投资支持的初创公司最大退出纪录。Origin上线因此也被部分观察者解读为SpaceXAI「垂直整合AI技术栈」战略落地的第一个动作。

AI写代码越来越快，仓库也得跟上。

[跳转微信打开](<https://wechat2rss.xlab.app/link-proxy/?k=5c7a4b7a&r=1&u=https%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzIwNzc2NTk0NQ%3D%3D%26mid%3D2247619635%26idx%3D1%26sn%3D1b7ab087fe918f76608f4439f6b27c46>)
