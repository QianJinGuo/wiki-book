# A backdoor in a LinkedIn job offer

## Ch01.150 A backdoor in a LinkedIn job offer

> 📊 Level ⭐ | 3.5KB | `entities/roman-linkedin-backdoor-supply-chain.md`

# A backdoor in a LinkedIn job offer

> Source: [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/roman-linkedin-backdoor-supply-chain.md)

## 核心要点

- **来源**: https://roman.pt/posts/linkedin-backdoor/
- **评分**: v=8, c=8, v×c=64, stars=4
- **评估理由**: Well-written first-person security case study of a real social engineering / supply chain attack via LinkedIn. Clearly structured narrative (setup, backdoor, trigger mechanism, impersonation, takeaways) with concrete technical details: npm `prepare` lifecycle script auto-executing after `npm install

## 内容提炼

Published Time: 2026-06-15T00:00:00+00:00

Markdown Content:
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

## 实践启示

- 文章的核心论点可在生产环境验证
- 与现有实体的差异化角度：本文来自 roman.pt 视角
- 引用源：[Roman Linkedin Backdoor Supply Chain](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/roman-linkedin-backdoor-supply-chain.md)
## 相关实体
- [from doer to director: the ai mindset shift](ch01/031-from-doer-to-director-the-ai-mindset-shift.md)
- [why internally-built ai fails fund accounting audits](ch01/752-why-internally-built-ai-fails-fund-accounting-audits.md)
- [back up and restore your amazon eks cluster resources using](../ch11/010-back-up-and-restore-your-amazon-eks-cluster-resources-using.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/security-landscape.md)

---

