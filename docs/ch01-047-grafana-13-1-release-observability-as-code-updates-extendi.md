# Grafana 13.1 release: observability as code updates, extending Grafana Assistant across more data sources, and more

## Ch01.047 Grafana 13.1 release: observability as code updates, extending Grafana Assistant across more data sources, and more

> 📊 Level ⭐ | 7.9KB | `entities/blog-grafana-13-1-release-all-the-latest-features.md`

# Grafana 13.1 release: observability as code updates, extending Grafana Assistant across more data sources, and more

> **来源**: [Grafana 13.1 release: observability as code updates, extending Grafana Assistant across more data sources, and more](https://grafana.com/blog/grafana-13-1-release-all-the-latest-features/)

Published Time: 2026-06-24

Markdown Content:
![Image 1: Grafana 13.1 release: observability as code updates, extending Grafana Assistant across more data sources, and more](https://grafana.com/mw/_next/image/?url=https%3A%2F%2Fa-us.storyblok.com%2Ff%2F1022730%2F1200x628%2Fe0de6fdd6d%2Fgrafana-13-1-meta-image.png&w=3840&q=75)

•

2026-06-24•9 min

[![Image 2: Twitter](https://a-us.storyblok.com/f/1022730/18x14/455626a417/icon-twitter-gray.svg)](https://twitter.com/intent/tweet?text=Grafana%2013.1%20release%3A%20observability%20as%20code%20updates%2C%20extending%20Grafana%20Assistant%20across%20more%20data%20sources%2C%20and%20more&url=https%3A%2F%2Fgrafana.com%2Fblog%2Fgrafana-13-1-release-all-the-latest-features%2F)[![Image 3: Facebook](https://a-us.storyblok.com/f/1022730/8x14/08ec63c702/icon-facebook-gray-sm.svg)](https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fgrafana.com%2Fblog%2Fgrafana-13-1-release-all-the-latest-features%2F)[![Image 4: LinkedIn](https://a-us.storyblok.com/f/1022730/16x16/6788867fe2/icon-linkedin-grey.svg)](https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fgrafana.com%2Fblog%2Fgrafana-13-1-release-all-the-latest-features%2F)

Earlier this year, [Grafana 13 laid the groundwork](https://grafana.com/blog/grafana-13-release-all-the-latest-features/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text) for making it easier and faster than ever to turn your data into actionable insights.

With our latest minor release, Grafana 13.1, we're building on that foundation, expanding observability as code, bringing Grafana Assistant to more data sources, and streamlining the everyday workflows teams rely on to visualize, analyze, and act on their data.

Below are just some of the highlights from Grafana 13.1. If you want to explore _all_ the latest updates, please refer to the [changelog](https://github.com/grafana/grafana/blob/main/CHANGELOG.md) or our [What’s New documentation](https://grafana.com/docs/grafana/latest/whatsnew/whats-new-in-v13-1/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text).

## [](http://grafana.com/blog/grafana-13-1-release-all-the-latest-features/#managing-dashboards-as-code-whats-new-in-git-sync)Managing dashboards as code: what's new in Git Sync

[Git Sync](https://grafana.com/docs/grafana/latest/as-code/observability-as-code/git-sync/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text), a feature that brings native GitOps workflows into your Grafana instance, [reached general availability](https://grafana.com/blog/git-sync-grafana/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text) with the release of Grafana 13. We added features to give you more flexibility and control when managing your dashboards as code, including GitHub App authentication and support for GitLab, BitBucket, and pure Git.

But we didn’t stop there. Grafana 13.1 brings four more enhancements to Git Sync that make it even easier to incorporate observability as code into your day-to-day workflows.

### [](http://grafana.com/blog/grafana-13-1-release-all-the-latest-features/#import-dashboards-straight-into-a-provisioned-folder)Import dashboards straight into a provisioned folder

_Generally available in all editions of Grafana_

You can now [import dashboard JSON](https://grafana.com/whats-new/2026-06-23-git-sync--import-dashboards-from-the-ui-to-simplify-adding-them-in-a-synced-folder/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text) straight into a Git Sync-provisioned folder, picking the file path, branch, commit message, and workflow as part of the import.

From a folder, hit **Import** and Grafana walks you through a provisioned import flow: pick the file path, branch, commit message, and workflow, and the dashboard is committed back to your repository as part of the import.

Uniqueness is path-based, so two dashboards can share a title as long as they live at different paths in the repo, and a conflicting path stops the import before anything is overwritten.

### [](http://grafana.com/blog/grafana-13-1-release-all-the-latest-features/#sync-dashboards-at-the-root-level)Sync dashboards at the root level

_Generally available in all editions of Grafana_

You can now [sync dashboards at the root level](https://grafana.com/whats-new/2026-06-23-git-sync--dashboard-synchronisation-now-available-at-root-level/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text), without a containing folder, so provisioned dashboards can live alongside your non-provisioned ones. This is useful when a repo represents your whole Grafana setup, or when forcing everything under one folder doesn’t align with how your team organizes dashboards.

Pick **Sync external storage directly at root level without a containing folder** in the setup wizard and your provisioned dashboards land at the root, alongside everything else, instead of being scoped under a single folder.

### [](http://grafana.com/blog/grafana-13-1-release-all-the-latest-features/#make-dashboard-context-visible-by-default)Make dashboard context visible by default

_Available in public preview in all editions of Grafana_

Git Sync-provisioned folders [now render their](https://grafana.com/whats-new/2026-06-23-git-sync--readmemd-files-added-to-a-folder-in-git-are-displayed-in-the-ui/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text)`README.md` inline by default, so the context for a folder travels with it.

Just drop a `README.md` next to your dashboards in the repo and it shows up in Grafana, including links, ownership notes, runbooks, or whatever your team wants to see sitting alongside their dashboards.

### [](http://grafana.com/blog/grafana-13-1-release-all-the-latest-features/#sign-commits-automatically)Sign commits automatically

_Generally available in in all editions of Grafana_

Git Sync can now [sign commits with GPG, SSH, or S/MIME keys](https://grafana.com/whats-new/2026-06-23-git-sync--verified-commits/?pg=grafana-13-1-rele

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/blog-grafana-13-1-release-all-the-latest-features.md)

---

