---
title: "Grafana 13.1 release: observability as code updates, extending Grafana Assistant across more data sources, and more"
source_url: "https://grafana.com/blog/grafana-13-1-release-all-the-latest-features/"
ingested: 2026-06-26
type: article
created: 2026-06-26
sha256: 488a658ef5ed1262d99c37c7e0c96bd62272792e9846c3f3fb9d3978e79f41fb
---

# Grafana 13.1 release: observability as code updates, extending Grafana Assistant across more data sources, and more


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

Git Sync can now [sign commits with GPG, SSH, or S/MIME keys](https://grafana.com/whats-new/2026-06-23-git-sync--verified-commits/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text), so your Git provider marks them as verified. This means teams with branch protection rules that require signed commits can now use Git Sync without friction. Until now, Git Sync could only create unsigned commits, which caused pushes to be rejected in those repositories.

To enable signing, configure a signing key on the repository, and Git Sync will automatically sign every commit it makes to that branch. If no signing key is configured, commits remain unsigned.

To learn more about Git Sync, check out our [documentation](https://grafana.com/docs/grafana/latest/as-code/observability-as-code/git-sync/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text).

## [](http://grafana.com/blog/grafana-13-1-release-all-the-latest-features/#extending-the-reach-of-grafana-assistant)Extending the reach of Grafana Assistant

We're continuing to [expand where and how you can use Grafana Assistant](https://grafana.com/blog/grafana-assistant-everywhere/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text), our AI-powered agent in Grafana Cloud. From connecting to more data sources across your stack to making Assistant easier to access in self-managed environments, these updates help bring AI-powered observability to wherever your data (and Grafana instance) lives.

### [](http://grafana.com/blog/grafana-13-1-release-all-the-latest-features/#using-assistant-with-additional-data-sources)Using Assistant with additional data sources

With Grafana 13.1, you can [use Assistant to directly query](https://grafana.com/whats-new/2026-05-30-query-snowflake--jira--dynatrace--and-five-more-directly-from-grafana-assistant/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text) eight additional Grafana data sources: **[Snowflake](https://grafana.com/grafana/plugins/grafana-snowflake-datasource/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text)**,**[Oracle](https://grafana.com/grafana/plugins/grafana-oracle-datasource/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text)**,**[Elasticsearch](https://grafana.com/grafana/plugins/elasticsearch/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text)**,**[Dynatrace](https://grafana.com/grafana/plugins/grafana-dynatrace-datasource/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text)**,**[Honeycomb](https://grafana.com/grafana/plugins/grafana-honeycomb-datasource/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text)**,**[Zabbix](https://grafana.com/grafana/plugins/alexanderzobnin-zabbix-app/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text)**, **[Jira](https://grafana.com/grafana/plugins/grafana-jira-datasource/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text)**, and **[MongoDB](https://grafana.com/grafana/plugins/grafana-mongodb-datasource/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text)** (shown below).

![Image 5: Blog image](https://grafana.com/mw/_next/image/?url=https%3A%2F%2Fa-us.storyblok.com%2Ff%2F1022730%2F1999x1004%2F051d2af1f5%2Fgrafana-assistant-mongodb-data-source.png&w=3840&q=75)

This makes it easier to ask a single question and get an answer that draws from across your observability stack, your databases, and your project-tracking tools—no context switching required. For example, an investigation that starts with an alert can pull in error rates from Dynatrace, query performance from Oracle and recent deployments from Jira, all in one conversation.

For each data source, Assistant queries your data using natural language, correlates signals across sources, and visualizes the results as Grafana dashboards.

### [](http://grafana.com/blog/grafana-13-1-release-all-the-latest-features/#assistant-now-pre-installed-in-grafana-enterprise)Assistant now pre-installed in Grafana Enterprise

Grafana Assistant now [comes pre-installed in Grafana Enterprise](https://grafana.com/whats-new/2026-06-23-grafana-assistant-is-now-pre-installed-in-grafana-enterprise/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text), with no plugin installation required. If you're a Grafana Enterprise user, you can connect your Grafana Cloud account to start using Assistant right away.

If you're a Grafana OSS user, you can still get access to Assistant by installing the plugin from the [Grafana plugin catalog](https://grafana.com/grafana/plugins/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text) and connecting your Grafana Cloud account.

## [](http://grafana.com/blog/grafana-13-1-release-all-the-latest-features/#faster-more-flexible-dashboarding)Faster, more flexible dashboarding

Grafana 13.1 brings a batch of improvements that make building and exploring dashboards faster and more flexible.

### [](http://grafana.com/blog/grafana-13-1-release-all-the-latest-features/#section-level-variables-for-rows-and-tabs)Section-level variables for rows and tabs

_Generally available in all editions of Grafana_

In Grafana 13, we introduced section-level variables, a feature that lets you apply variables to each row or tab in a dashboard, so you can reduce clutter and improve the overall organization of your dashboards. With the 13.1 release, these [variable types are now generally available](https://grafana.com/whats-new/2026-06-11-section-level-variables-for-rows-and-tabs-now-generally-available/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text).

Traditionally, dashboard variables have applied to the whole dashboard at once: if you changed an `$instance` variable, for example, this would update every panel together. That was a big limitation when a single dashboard spanned more than one service, such an API gateway and a database. Teams would have to split services across separate dashboards just to give each its own filters, making it difficult to achieve a unified view of their data.

Section-level variables solve for this. Each row or tab can now carry its own independent variables, so an API gateway row can scope to one set of instances while a database row scopes to another, all in the same dashboard.

### [](http://grafana.com/blog/grafana-13-1-release-all-the-latest-features/#a-revamped-query-editor)A revamped query editor

_Available in public preview in all editions of Grafana_

The [improved query editor experience](https://grafana.com/blog/grafana-13-release-all-the-latest-features/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text#build-complex-queries-faster) we introduced as private preview in Grafana 13, which makes complex panels easier to build and manage, is [now in public preview](https://grafana.com/whats-new/2026-06-19-revamped-query-editor--now-in-public-preview-with-multi-select-and-stacked-view/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text), with two new capabilities:

1.   **Multi-select with bulk action**: You no longer have to manage queries, expressions, and transformations one at a time. Instead, you can click **Select…**in the sidebar footer to enter multi-select mode. From there, you can check the specific items you want to work with. A new bulk actions bar also lets you delete, hide, or show several queries at once, switch the data source for multiple queries in a single step, or enable and disable transformations in bulk.

2.   **Stacked view**: When you want to see the whole pipeline at once, the stacked view lays out all of your queries, expressions, and transformations in a single scrollable list.

Overall, these two new features combined with incremental improvements to the original release make creating and editing complex queries more straight-forward and faster than ever before.

### [](http://grafana.com/blog/grafana-13-1-release-all-the-latest-features/#more-dashboarding-and-visualization-updates)More dashboarding and visualization updates

In addition to the new query editor and section-level variables, other data visualization updates in Grafana 13.1 include:

*   **[Quick filters and data grouping](https://grafana.com/whats-new/2026-05-13-quick-filters-and-data-grouping-are-now-generally-available/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text)**
: The new **Filter and Group by** dashboard control combines filtering and grouping in one place, so exploring data is faster and more intuitive. 

*   **[Panel style presets](https://grafana.com/whats-new/2026-05-26-panel-styles-are-now-generally-available/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text)**
(shown below): Apply curated colors, thresholds, and display options to time series, stat, gauge, bar gauge, and bar chart panels with a single click in the panel editor. 

![Image 6: A screenshot of a drop-down menu for pre-set panel styles that you can select.](https://grafana.com/mw/_next/image/?url=https%3A%2F%2Fa-us.storyblok.com%2Ff%2F1022730%2F1999x1052%2Fe20b1f007c%2Fgrafana-13-1-panel-styles.png&w=3840&q=75)

For more details, check out our [What’s New](https://grafana.com/docs/grafana/latest/whatsnew/whats-new-in-v13-1/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text) and [data visualization docs](https://grafana.com/docs/grafana/latest/visualizations/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text).

## [](http://grafana.com/blog/grafana-13-1-release-all-the-latest-features/#pdc-support-for-more-data-sources)PDC support for more data sources

_Generally available in Grafana Cloud_

With [Private Data Source Connect (PDC)](https://grafana.com/docs/grafana-cloud/connect-externally-hosted/private-data-source-connect/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text), you can create a private, encrypted tunnel between your Grafana Cloud stack and data sources running inside private networks, VPCs, or on-premises environments.

With Grafana 13.1, we’ve added PDC support for three new data sources: **[MQTT](https://grafana.com/grafana/plugins/grafana-mqtt-datasource/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text)**, **[GitHub](https://grafana.com/grafana/plugins/grafana-github-datasource/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text)**, and**[IBM Db2](https://grafana.com/grafana/plugins/grafana-ibmdb2-datasource/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text)**.

With this update, you can connect Grafana Cloud to MQTT brokers for real-time IoT and sensor data; GitHub Enterprise Server instances for source control and project metrics; and IBM Db2 databases running on-premises or in a private cloud.

To get started, deploy a PDC agent inside your private network, then configure your data source in Grafana Cloud using its internal DNS name. To learn more, refer to the [Private Data Source Connect learning path](https://grafana.com/docs/learning-paths/private-data-source-connect/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text).

## [](http://grafana.com/blog/grafana-13-1-release-all-the-latest-features/#learn-more-about-grafana)Learn more about Grafana

For an in-depth list of all the new features in Grafana, check out our [Grafana documentation](https://grafana.com/docs/grafana/latest/?pg=blog&plcmt=body-txt), the [Grafana changelog](https://github.com/grafana/grafana/blob/main/CHANGELOG.md), or our [What's New documentation](https://grafana.com/docs/grafana/latest/whatsnew/whats-new-in-v13-1/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text).

We invite you to engage with the [Grafana Labs community forums](https://community.grafana.com/?pg=blog&plcmt=body-txt). Share your experiences with the new features, discuss best practices, and explore creative ways to integrate these updates into your workflows. Your insights and use cases are invaluable in enriching the Grafana ecosystem.

## [](http://grafana.com/blog/grafana-13-1-release-all-the-latest-features/#upgrade-to-grafana-131)Upgrade to Grafana 13.1

[Download Grafana 13.1](https://grafana.com/grafana/download/13.1.0?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text) today or experience all the latest features by signing up for Grafana Cloud, which offers an actually useful forever-free tier and plans for every use case. Sign up for a [free Grafana Cloud account](https://grafana.com/auth/sign-up/create-user/?pg=grafana-13-1-release-all-the-latest-features&plcmt=in-text) today.

Our [Grafana upgrade guide](https://grafana.com/docs/grafana/latest/upgrade-guide/?pg=blog&plcmt=body-txt) also provides step-by-step instructions for those looking to upgrade from an earlier version to ensure a smooth transition.

We extend our heartfelt gratitude to the [Grafana community](https://grafana.com/blog/2023/12/12/the-story-of-grafana-documentary-the-community-behind-the-code/?pg=grafana-12-4-release-all-the-latest-features&plcmt=in-text)!

Your contributions, ranging from pull requests to valuable feedback, are crucial in continually enhancing Grafana. And your enthusiasm and dedication inspire us at Grafana Labs to persistently innovate and elevate the Grafana platform.

_[Grafana Cloud](https://grafana.com/products/cloud/?pg=blog&plcmt=body-txt)_ _is the easiest way to get started with metrics, logs, traces, dashboards, and more. We have a generous forever-free tier and plans for every use case._ _[Sign up for free now](https://grafana.com/auth/sign-up/create-user/?pg=blog&plcmt=body-txt)_ _!_

Tags

