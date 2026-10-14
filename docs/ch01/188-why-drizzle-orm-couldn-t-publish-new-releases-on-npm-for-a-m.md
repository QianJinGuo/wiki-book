# Why Drizzle ORM couldn't publish new releases on NPM for a month | vlt /vōlt/

> 📊 Level ⭐⭐⭐ | 10.7KB

> **来源**: [Why Drizzle ORM couldn't publish new releases on NPM for a month | vlt /vōlt/](https://vlt.io/blog/packument-size-limits)

On June 4th the [Drizzle ORM](https://orm.drizzle.team/) team [published on Twitter](https://x.com/DrizzleORM/status/2062629339556921581) that they were no longer able to publish new releases to NPM due to running into a 100 MB limit for 'packuments'.

This eventually [got resolved with the help of NPM support](https://x.com/andrii_sherman/status/2067495638489592156) by deleting a number of unused older versions.

There was some confusion in the replies to the tweets, and since it's not the first time we've seen this issue crop up, we thought it might be interesting to explain what this limit is, how we got here and some steps you can take to avoid running into this.

## Manifests

When you run npm publish in your project and you've successfully authenticated, the client submits the package and its metadata to the registry.

This is a big JSON object that contains:

*   A copy of your package.json.
*   A base64 encoded tarball.
*   A bunch of metadata

The registry annotates that package.json with some extra meta-data for security and other reasons, and now calls it a 'manifest'. This manifest is available on the registry after publishing. For example, here's a link to a manifest of a recent Drizzle release:

[https://registry.npmjs.org/drizzle-orm/0.45.2](https://registry.npmjs.org/drizzle-orm/0.45.2)

It mostly looks like a package.json file. Notably this is a pretty large example due to drizzle having a lot of individual ESM exports. It clocks in at **131 KB**, which is one of the bigger ones I've seen.

## Packuments

NPM was originally built on CouchDB, which is a document store (a kind of database that's more like a big key value store than a table with rows, columns and queries).

For the NPM CLI to be able to find out about all versions of a package the decision was made to create a new kind of document that has metadata about the entire package and all its versions. This is called a 'packument'.

The packument is automatically updated by the registry, and actually contains all the manifests of every version ever released. For example, you can take a look at this packument of React here:

[https://registry.npmjs.org/react](https://registry.npmjs.org/react)

This is 6MB, which is not bad for its 2,841 published versions. The registry makes an effort to strip out some unneeded elements from the manifest/package.json before adding it to the packument, but it keeps all the exports.

## The 100 MB limit.

These packuments are always downloaded in full whenever you install a new package (e.g.: not from a lockfile). So it made sense to set a sensible upper limit for how large they can be, and _100 MB_ was chosen (before compression). This limit in itself feels reasonable given how often it gets downloaded, to prevent abuse and given that it might be passed to JSON.parse() by all kinds of tools.

But you can easily see then that at Drizzle's _131 KB_ per release, it only takes about 763 releases to max out. It also seems that Drizzle recently started automatically publishing snapshot releases straight from git commits, which made them run into this limit even quicker.

Once that limit is reached, the NPM registry will simply refuse any new versions from being published.

A long time ago it would have been possible for them to simply delete old or uninteresting versions, but NPM now [prevents versions from being deleted after 72 hours of when it was published](https://docs.npmjs.com/policies/unpublish) to help with security and maintaining stability in the ecosystem.

The only option Drizzle had was to try to get in touch with the (small and understaffed) NPM team at Github so they could delete packages on their behalf, which took a while.

## Is my project at risk of hitting this limit?

Run the following command (replacing the package name) to see the size of your packument currently:

`curl -s https://registry.npmjs.org/react | wc -c | awk '{printf "%.2f MiB\n", $1/1024/1024}'`

## How can I avoid large manifests?

Probably the top suggestion we'd make is don't publish all your dev builds.

Most of your users will never care about these and they will perpetually contribute to the total download size of every future fresh install ever, which not only slows it down, it's also wasteful.

There are alternative registries available, which might be a better place for dev builds. (if your open source project needs this, we give out free accounts to our private registry product. us to get access).

If your package.json is large, it might also be wise to just keep an eye on your total packument size so you can take proactive steps before you max out.

## Fixing registry inefficiencies

In an ideal world clients could just tell the registry that they are only interested in stable packages, or which version ranges they are looking for.

This would allow the server to only return eligible versions, dramatically reducing the total bandwidth required for fresh installs.

This could be implemented as a query parameter in a backwards-compatible way. If other registries or clients are interested in putting something together, we'd love to chat!

## What our registry does

While Drizzle's packument is now back to 61 MiB, our NPM mirror is taking a slightly different approach. We work of an allow-list to only add things to the packument that we know is needed for installs.

So, running that same curl command on our mirror only has Drizzle at **1.7 MiB** so far. Lots of room to grow!

## 深度分析

### Packument 的累积式设计
NPM 早期构建于 CouchDB 文档存储之上，为了让 CLI 一次拿到包的全部版本元数据，设计出 packument——一个聚合了每个已发布版本 manifest 的巨型 JSON 文档。所有非 lockfile 的全新安装都要完整下载它，包的历史越"重"，全体用户的安装成本越高。Drizzle 单版本 manifest 因大量 ESM exports 达到 131 KB，按此规模约 763 个版本即触顶 100 MB。

### 100 MB 限制的合理性与刚性
上限本身有正当理由：packument 会被各类工具 JSON.parse()，也需要防滥用。问题在刚性：NPM 的 72 小时 unpublish 政策禁止删除旧版本，作者失去自我清理能力；而 Drizzle 从 git commit 自动发布 snapshot 的做法进一步加速触顶，最终只能求助人手不足的 NPM 团队人工删除。

### 治理路径的三层分解
文章给出的对策可分三层：发布方自律（不发布 dev build，它们永久推高每次全新安装的体积）；监控（用 curl+wc 定期检测 packument 大小，触顶前主动干预）；注册表侧重构（vlt 镜像用 allow-list 只保留安装所需条目，把 Drizzle packument 从 61 MiB 压到 1.7 MiB）。最根本的是第三层：客户端声明所需版本范围、服务端按需返回，可经向后兼容的 query parameter 实现。

### 自动化发布的放大效应
当版本发布从人工决策变成 CI 默认动作，累积速率就脱离人的直觉——这正是 [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md) 所说"自动化管道必须为系统性资源上限设预算"的典型案例。它与 [npm 供应链事故](https://github.com/QianJinGuo/wiki-public/blob/main/entities/npm-supply-chain-compromise-postmortem.md) 同属 npm 注册表生态的系统性风险，只是表现形式从安全转向容量。

## 实践启示
1. 不要把 dev/snapshot build 发布到主 registry——它们永久计入每次全新安装的下载量。
2. 用 `curl -s https://registry.npmjs.org/<pkg> | wc -c` 定期检查 packument 大小，建立触顶预警。
3. 收敛 package.json 体积与 ESM exports 粒度——单版本 manifest 越大，可发布版本数上限越低。
4. 优先选用 allow-list 型镜像注册表：61 MiB 压到 1.7 MiB 说明裁剪空间巨大。
5. 自动发布流水线必须评估版本累积速率，把 registry 配额当作与 CI 时长同类的资源预算。
6. 注册表协议设计优先向后兼容的按需查询参数，从源头消除 packument 膨胀。

→ [原文存档](https://vlt.io/blog/packument-size-limits)

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

