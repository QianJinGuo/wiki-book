---
source_url: "https://www.xiaohongshu.com/explore/6a7087a90000000006005e48?xsec_source=app_share&xsec_token=CBjhtLDgr4aGkqF4rKYaATYWHUY1nmtuRPGDiFGFi4ADk="
source_author: "Adams AI Tool Notes"
source_title: "微软：给Agent更多内存可能会让它性能更差"
source_date: "2026-08-03"
source_publication: "小红书（论文解读号）"
ingested: "2026-08-03"
sha256: "30a485aa104eab4ad607e2666b1ec037c42ed17449e5ee07ee21db532284792d"
---

微软：给Agent更多内存可能会让它性能更差

微软发现，给Agent更多内存可能会让它性能表现的更差。解决办法是改变你存储的内容。

这篇论文是 PlugMem，来自微软研究院和伊利诺伊大学厄巴纳-香槟分校。

失败的原因很明显：历史记录堆积，检索淹没其中，代理花费其上下文在浏览记录中寻找那一行重要的内容。

人类记忆也不会重放事件。它保留从中提取的事实和技能。

所以内存写入器停止保存对话，而是保存两种记录类型：

- **事实**是一种稳定的陈述。部署通过 GitHub Actions 进行，绝不手动操作。
- **技能**是一种可复用的程序。在部署失败时，在接触生产环境之前阅读 Actions 运行记录。

以这种方式存储，一个通用模块在三种特定任务上击败了为特定任务构建的内存设计，且使用的令牌更少。

指标是每个上下文令牌的决策相关信息，而不是你设法保留了多少。

#howto用好AI #大模型 #ai #agent
