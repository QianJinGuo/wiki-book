# 浏览器自动化：从GUI到OpenCLI

## Ch01.1149 浏览器自动化：从GUI到OpenCLI

> 📊 Level ⭐⭐ | 3.1KB | `entities/浏览器自动化从gui到opencli.md`

# 浏览器自动化：从GUI到OpenCLI

**来源**: 阿里云开发者

**发布日期**: 2026-04-14

**原文链接**: https://mp.weixin.qq.com/s/-ARMTu_h7KbFMvVMnMJghA

---

阿里妹导读

文章讲述放弃不稳定的前端UI自动化操作，采用解析并复现底层API请求的方式，来解决浏览器自动化的效率与稳定性难题。（文章内容基于作者个人技术实践与独立思考，旨在分享经验，仅代表个人观点。）

为什么我们需要浏览器自动化

如今大量业务系统都跑在浏览器里——运营配置后台、工单处理系统、发布运维平台。如果能让这些系统自动运转，对提效和智能化运营的价值不言而喻。

但现实是，Agent 想操控浏览器，路并不好走。

现有方案的困境

OpenCLI 的思路

核心想法很简单：不跟网页界面较劲，直接抓它背后的 API。

浏览器里看到的数据，本质上都是前端从某个接口拿回来的。把这个接口找出来、把请求复现出来，比点按钮靠谱得多。

快速上手

npm install -g @jackwener/opencli

直接使用：

opencli list                              # 查看所有命令opencli list -f yaml                      # 以 YAML 列出所有命令opencli hackernews top --limit 5# 公共 API，无需浏览器opencli bilibili hot --limit 5# 浏览器命令opencli zhihu hot -f json                 # JSON 输出opencli zhihu hot -f yaml                 # YAML 输出

原理分析

### AI Agent 探索工作流

步骤
工具
做什么

0. 打开浏览器
browser_navigate
导航到目标页面

1. 观察页面
browser_snapshot
观察可交互元素（按钮/标签/链接）

2. 首次抓包
browser_network_requests
筛选 JSON API 端点，记录 URL pattern

3. 模拟交互
browser_click  +  browser_wait_for
点击"字幕""评论""关注"等按钮

4. 二次抓包
browser_network_requests
对比步骤 2，找出新触发的 API

5. 验证 API
browser_evaluate
fetch(url, {credentials:'include'})  测试返回结构

6. 写代码
—
基于确认的 API 写适配器

### 懒加载机制

> [!CAUTION]> 你（AI Agent）必须通过浏览器打开目标网站去探索！  > 不要只靠 `opencli explore` 命令或静态分析来发现 API。  > 你拥有浏览器工具，必须主动用它们浏览网页、观察网络请求、模拟用户交互。  
### 为什么？  
很多 API 是懒加载的（用户必须点击某个按钮/标签才会触发网络请求）。字幕、评论、关注列表等深层数据不会在页面首次加载时出现在 Network 面板中。如果你不主动去浏览和交互页面，你永远发现不了这些 API。

### 五级认证策略

OpenCLI 提供 5 级认证策略。使用  cascade  命令自动探测：

opencli c

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/浏览器自动化从gui到opencli.md)

---

