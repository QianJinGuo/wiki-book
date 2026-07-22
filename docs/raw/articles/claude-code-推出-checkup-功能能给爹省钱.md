---
source: wechat
source_url: https://mp.weixin.qq.com/s/Uza964BVGOqXlbYPn7CLJQ
ingested: 2026-07-09
feed_name: AGI Hunt
wechat_mp_fakeid: MP_WXS_3087832081
source_published: 2026-07-09
sha256: adcbfa23779254975a355c96102d16299a8f34514720b5b6d4f42d6dbfcf3008
---


# Claude Code 推出 /checkup 功能：能给爹省钱

刚刚，Claude Code 之父 Boris Cherny 宣布了一个新命令：/checkup。

Boris 发布 /checkup

一句话说，它的作用是给你的 Claude Code 做一次体检，把那些积了灰的东西给清出去。

重度使用 cc 的你应该都有体会：skills、MCP、插件装了一堆，CLAUDE.md 越写越长，hooks 越挂越多……而每开一个新 session，这些东西都要原封不动地塞进上下文里，占地方、费 token，还拖慢速度。

而 /checkup 要干的，便是把这一摊子给收拾干净，把上下文的空间重新腾出来，给你省钱！

01

## 体检清单

跑一次 /checkup，它会把你的整个配置从头到尾翻一遍，然后帮你做下面这七件事：

1.  清理那些没用过的 skills / MCP / 插件，省出 context 空间 

2.  把本地的 CLAUDE.md 和仓库里签入的那份做一次去重 

3.  把根目录里越长越大的 CLAUDE.md 拆成嵌套的 CLAUDE.md 加 skills 

4.  把那些跑得慢、每次都在拖累响应的 hooks 给关掉 

5.  把 Claude Code 升级到最新的版本 

6.  把 auto mode 设为默认开启（不用再一直点确认了） 

7.  把那些经常被你拒掉、但其实只读无害的命令加进预批准列表 

按 Boris 的说法，还有一些其他的小惊喜。所有改动都会先跟你确认，不会自作主张。

02

## 亲爹亲测

Boris 自己也第一时间跑了一遍，还把自己的体检报告原样给贴了出来：

Boris 跑 /checkup 的结果

结果有点惨烈……

他的 `claude` 命令本身就是坏的（一次测试把启动器给覆盖掉了）；38 个项目 skills 在 2345 个 session 里一次都没被用过；CLAUDE.md 每个 session 都要白白加载约 10k tokens。

**连 Claude Code 之父自己的安装，都已经烂成了这样。**

而清理完之后，每个 session 能省下约 5.5k tokens。也算是给爹省钱了……

/checkup 给出的选项也很克制：全部清理（推荐）、挑着来，或者只看报告不动手。所有改动都是可逆的，CLAUDE.md 的修改会留在工作区里，你可以先 git diff 看一眼再提交。

03

## 配置腐烂

/checkup 这个命令，来的也正是时候。

这半年 skills、MCP、subagents 的生态膨胀得实在太快了，见到好东西就装，装完就忘。每个人的 Claude Code 配置都在悄悄腐烂，只是没人回头去看罢了。

Boris 那 38 个从没用过的 skills，你和我的大概也好不到哪儿去吧？

我自己也去跑了一把，开始之前我的 context window 长的是这个样子（没错！我新开 Fable 了）：

我的 context window

/checkup 体检报告是这样的：

我的 /checkup 结果

共查出来了四组问题：一个残留的重复安装、4 个没用过的个人 skills、20 个只在本地禁用的 lark 系 skills，外加一个闲置的 wechat MCP 连接。全清掉的话，每个 session 能省约 830 tokens……比起 Boris 那 5.5k，我这还算干净的（在当前项目下）。

也快去给你的 Claude Code 做一次体检吧，看看它到底烂成什么样了！

◇ ◆ ◇

• Boris 发布推文：https://x.com/bcherny/status/2074997570317779038
