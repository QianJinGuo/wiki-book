---
source: wechat
source_url: https://mp.weixin.qq.com/s/I_UxKzeKMY2b65LVo4QRvw
ingested: 2026-07-05
feed_name: 科技充电站
wechat_mp_fakeid: MP_WXS_3237134318
source_published: 2026-05-11
sha256: 4908a948fab10cbdaa338e1e2eb3464ef34a702a1dc0811b292876b1b26c502e
---

# 我把 Claude cowork 搬进 Codex，踩了 4 个坑，发现了顶级模型的秘密……

大家好，我是行小招。

这周我做了件挺有意思的事：把 Claude Desktop cowork 里 Anthropic 官方的 Data、Design、Product Management 三套 plugin 搬到了 Codex，让 gpt-5.5 来用。

踩了 4 个坑，跑通后我的判断也变了：模型持续迭代，好的工作流资产能穿越模型周期。

先说为什么想搬，我对 cowork 的体感一直挺好，尤其 Data 那套是真天天用。

你问它一个数据问题，它不会甩你一段"可以这样分析"的废话，它会先理解问题，再看数据上下文，然后写 query、做探索，最后帮你 validate 一遍结论。

这背后不是 Claude 突然变聪明了，是它被一整套 plugin 和 skills 托住了。

Data plugin 里有 data-exploration、sql-queries、data-validation 这些 skill，还有 /analyze、/write-query、/build-dashboard 这些 command，它不像一个裸模型在即兴发挥，更像带着 SOP 的分析团队。

**plugin 是工具箱，skills 是手艺人的工作法。**

那能不能把这套工作流挪到 gpt-5.5 上？Anthropic 负责"怎么干"，OpenAI 负责"干得怎么样"，这个组合一旦跑通就有想象力。

但一动手就开始踩坑。

**坑一：plugin 根本不在 ~/.claude**

我第一反应去 `~/.claude/skills` 和 `~/.claude/plugins` 找，装了个寂寞，实际路径藏在 Claude Desktop 的 session 目录里：
    
    
    ~/Library/Application Support/Claude/local-agent-mode-sessions/.../  
    cowork_plugins/marketplaces/knowledge-work-plugins/

cowork 是在本地 session 里临时展开了一套 marketplace，你看不到不代表它不存在。

**坑二：Codex 不认 Claude 的身份证**

Claude 这边有 `.claude-plugin/plugin.json`，Codex 要的是 `.codex-plugin/plugin.json`，不补这个文件，Codex 压根不知道你是个 plugin。

里面要写 name、version、skills 路径，还要补 displayName、description、defaultPrompt 这些 interface 字段，这就像办暂住证，人没变，但到新城市得重新办。

**坑三：slash command 要做桥接**

cowork 里的 /analyze、/critique、/write-spec 都在 commands/*.md 下，Codex 不会直接把它们当 slash command 。

我给每个 command 做了个桥接 skill。比如 /analyze 做成 data-analyze，/critique 做成 design-critique-command。桥接 skill 不重写流程，只指回原来的 command 文件。

**真正稳的迁移，不是翻译能力，是保留能力的骨架。**

**坑四：Codex cache 不认 symlink**

最阴的一个。一开始想省事，把 `~/.codex/plugins/cache/local/data/1.0.0` 做成 symlink 指向源目录，结果 Codex 直接报 `plugin is not installed`。

改成真实目录 copy 就好了，Codex 的 plugin cache 必须是真实文件，不能 symlink 糊弄。

完整链路四步：
    
    
    1. 源目录放 ~/.agents/plugins/anthropic/<plugin>  
    2. 在 ~/.agents/plugins/marketplace.json 注册  
    3. ~/.codex/config.toml 启用 data@local、design@local、product-management@local  
    4. 复制真实目录到 ~/.codex/plugins/cache/local/<plugin>/1.0.0

验证就一种方式：新开一个 codex exec session，看能不能识别 data:*、design:*、product-management:* 这些命名空间。能看到才算成，只看磁盘文件那是自我安慰。

跑通后我把整套流程固化成了一个 skill 叫 anthropic-plugins-sync。下次想迁 Engineering、Marketing、Legal 不用再靠手感：
    
    
    python3 ~/.codex/skills/anthropic-plugins-sync/scripts/sync_anthropic_plugin.py \  
      --plugins data design product-management

脚本会自动做这几件事：

  * • 找 cowork source root，复制到 ~/.agents/plugins/anthropic
  * • 生成 .codex-plugin/plugin.json 和 桥接 skills
  * • 更新 marketplace 和 config，刷新 Codex cache

做完这一切，我对所谓"模型产品能力"的看法变了。它其实可以拆成两层：一层是模型本身，一层是工作流资产。

模型换得很快，今天 Opus 4.7，gpt-5.5，明天可能 GPT6、Opus5，但 Data 分析要看口径，Design review 要看层级，Product spec 要写 non-goals。这些东西不会因为模型换代就失效。

**好工作流资产，能穿越模型周期。**

以前我总觉得 skill 是下载来的，现在体感变了。下载来的只是原材料，跑通、改造、验证、固化之后，才算真长到你自己的系统里。

别囤积 skill，把它们跑成你的工作流。

* * *

我是行小招，持续探索 AI 在个人和企业中的落地场景，交给 AI 的是任务，留给自己的是思考。欢迎转发给你身边做技术和产品的同学，一起追逐这个时代！
