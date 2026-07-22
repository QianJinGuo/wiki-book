---
title: "Why Drizzle ORM couldn't publish new releases on NPM for a month | vlt /vōlt/"
source_url: "https://vlt.io/blog/packument-size-limits"
ingested: 2026-06-26
type: article
created: 2026-06-26
sha256: 4898ec0f91a6adb2c437c6e20bd2362e8ed9eb6d41491386b87fc89549dba80c
---

# Why Drizzle ORM couldn't publish new releases on NPM for a month | vlt /vōlt/


Published Time: Wed, 27 May 2026 13:52:58 GMT

Markdown Content:
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

