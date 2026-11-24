# A backdoor in a LinkedIn job offer

> 📊 Level ⭐⭐⭐⭐ | 9.4KB

> Source: [原文存档](https://roman.pt/posts/linkedin-backdoor/)

## 核心要点

- **来源**: https://roman.pt/posts/linkedin-backdoor/
- **评估理由**: Well-written first-person security case study of a real social engineering / supply chain attack via LinkedIn. Clearly structured narrative (setup, backdoor, trigger mechanism, impersonation, takeaways) with concrete technical details: npm `prepare` lifecycle script auto-executing after `npm install

## 内容提炼

![Image 1: A backdoor in a LinkedIn job offer](https://roman.pt/posts/linkedin-backdoor/splash_hu_6f6d450d0d33e225.png)
Last week, I got a LinkedIn message from a recruiter at a small crypto startup. We exchanged a few messages over a couple of days, she described a broken proof-of-concept they needed a lead engineer for, and then sent me a public GitHub repo to review. Specifically, she asked me to “check out the deprecated Node modules issue.”

It’s not uncommon to ask for a review of an existing codebase, but something felt off and raised an alarm in my head, so I decided to get a bit extra paranoid.

Instead of cloning and installing dependencies, I spun up a throwaway VPS on Hetzner, cloned the repo there, and pointed [Pi](https://pi.dev/) at it in read-only mode, with only file-reading tools enabled:

```
pi --tools read,grep,find,ls
```

I asked the agent to review the codebase and flag anything suspicious. It stopped almost immediately at `app/test/index.js`.

## The backdoor

The repo felt like a React frontend with a Node backend. The trap was in `app/test/index.js`, about 250 lines disguised as a test suite. In

## 关键洞察

- Well-written first-person security case study of a real social engineering / supply chain attack via LinkedIn. Clearly structured narrative (setup, backdoor, trigger mechanism, impersonation, takeaways) with concrete technical details: npm `prepare` lifecycle script auto-executing after `npm install

## 深度分析

### 攻击链拆解：一条完整的"信任链劫持"路径

这次攻击没有利用任何技术漏洞，每个环节都在借用真实世界的信任：recruiter 以真实加密初创公司的招聘话术开局，用"check out the deprecated Node modules issue"这句寻常工程指令诱导目标执行 `npm install`。仓库本体毫无越权行为——后门藏在约 250 行伪装成测试套件的 `app/test/index.js` 里：URL 由 `protocol/domain/path/token` 等碎片拼装成 `https://rest-icon-handler.store/icons/77`，payload 则埋在成片注释掉的测试代码中间（第 225 行），执行服务器返回的任意内容。真正的杀伤机制在触发层：`app/index.js` 自身 `require('./test')`，而 `package.json` 把它挂进 `prepare` 脚本——npm 在 `npm install` 后自动运行 `prepare`，于是"装依赖"这个最日常的动作就是引爆点。与 xz-utils 那种维护者信任被长期劫持的路径（[Xz Utils Backdoor Maintainer Trust Hijack 2 Years On](https://github.com/QianJinGuo/wiki-public/blob/main/entities/xz-utils-backdoor-maintainer-trust-hijack-2-years-on.md)）不同，这里劫持的是"招聘者→候选人"的社交信任，但两者殊途同归：都在开发者最没有防备的常规动作里埋雷。攻击者把 URL 拆成碎片的用意也值得注意：`store`、`rest-icon-handler`、`/icons/`、`77` 各自成段，是对"全文检索完整恶意域名"这类静态扫描的直接对抗——任何一环单独看都无害。payload 本身只需一行混淆的 minified 代码，藏在 250 行测试噪音里，人和静态工具都容易放过。

### 双重身份盗用：攻击的工业化成本结构

攻击者动用了两层被盗用的真实身份：仓库里 39 个 commit 全部署名一位从未接触过该仓库的真实全栈工程师——他有正常的 LinkedIn 主页、个人网站和长历史的 GitHub 账号，此前已被冒名过并一直在举报类似仓库；recruiter 头像则属于一位真实的知名艺术记者，履历毫无技术背景——但当作者假装装不上依赖时，"她"立刻变成精通 npm 与 Node 版本的专家并催促运行 `npm install`。这说明攻击已经工业化：偷来的真实身份负责通过人工审查（contributor graph、LinkedIn 档案），攻击脚本负责技术杀伤。防御侧的对应启示是——身份信号（贡献历史、头像、履历）已不能作为信任锚点，只能降级为待验证的声明。更冷的一点是攻击的持续性：作者已向 GitHub 举报仓库、向 LinkedIn 举报 recruiter，但截至发文仓库仍然在线。平台侧"举报→下架"回路的滞后，意味着防御不能依赖事后清理，只能前移到执行时。

### 为什么 `prepare` 钩子是理想的投毒点

npm 的生命周期脚本设计把"代码执行"默认绑进了"依赖安装"：`prepare` 运行 `app:pre`（即 `node app/index.js`），而 npm 文档规定 `prepare` 在 `npm install` 后自动运行，用户无需任何显式触发。这使它与 LiteLLM 供应链投毒（[Litellm Supply Chain Poisoning Higress Wasm Sandbox 2026 10 23](https://github.com/QianJinGuo/wiki-public/blob/main/entities/litellm-supply-chain-poisoning-higress-wasm-sandbox-2026-10-23.md)）和 Checkmarx Jenkins 插件供应链攻击（[Checkmarx Jenkins Plugin Compromised In New Supply Chain Attack](https://github.com/QianJinGuo/wiki-public/blob/main/entities/checkmarx-jenkins-plugin-compromised-in-new-supply-chain-attack.md)）共享同一个结构性弱点：包管理器把"取回代码"与"运行代码"合并成一个动作。本文的独特点在于入口不是公共注册表而是私域投递（LinkedIn 私信 + 定向仓库），绕开了所有面向 registry 的扫描防线——在威胁模型上这属于针对开发者的社会工程向量（[Agent Security Threat Models](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-threat-models.md)），而非传统的包投毒。与 TanStack npm 供应链事件（[Postmortem Tanstack Npm Supply Chain Compromise Tanstack Blog](https://github.com/QianJinGuo/wiki-public/blob/main/entities/postmortem-tanstack-npm-supply-chain-compromise-tanstack-blog.md)）、npm 供应链事后复盘（[Npm Supply Chain Compromise Postmortem](https://github.com/QianJinGuo/wiki-public/blob/main/entities/npm-supply-chain-compromise-postmortem.md)）代表的 registry 侧污染相比，私域投递的代价是攻击面被限制在单个目标，收益是几乎不可能被依赖图级别的自动扫描提前发现——这是一次成本-收益结构完全不同的低频高值攻击。

### 只读 agent 审计：价值与边界

作者的处置流程值得标准化：不本机 clone，而是在 Hetzner 开一次性 VPS，以只读模式（仅 read/grep/find/ls 工具）运行 Pi 审查代码，agent 几秒内即标记 `app/test/index.js`，作者认为这比亲自读代码更高效。但他刻意停在"仓库会执行服务器返回的任意内容"这一证据上，没有放行二阶段 payload 观察回连——这是正确的取舍：沙箱内观察二阶段有取证价值，但在可疑基础设施上主动执行恶意代码的风险不可控。只读 agent 审计的边界同样清楚：它能发现"这份代码在做什么"，却发现不了"包名被抢注、镜像被替换"这类不在目标仓库文本里的投毒；后者需要 [Agent Sandbox](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-sandbox.md) 之外的完整供应链校验（lockfile 完整性、来源证明）配合。同样值得抄的是"最坏情况假设"：作者从第一条消息就起疑，把整个审查放进一次性环境执行；他自己承认换个疲惫或赶时间的日子，很可能已经先跑了 `npm install`——所以安全流程必须假设人的状态会失败，用环境隔离兜底，而不是依赖持续的警觉。

## 实践启示

- 文章的核心论点可在生产环境验证
- 与现有实体的差异化角度：本文来自 roman.pt 视角
- 引用源：[Roman Linkedin Backdoor Supply Chain](https://roman.pt/posts/linkedin-backdoor/)
## 相关实体
- from doer to director: the ai mindset shift
- why internally-built ai fails fund accounting audits
- [back up and restore your amazon eks cluster resources using](https://github.com/QianJinGuo/wiki-public/blob/main/entities/back-up-and-restore-your-amazon-eks-cluster-resources-using-velero-amazon-web-se.md)
- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/security-landscape.md)

---

