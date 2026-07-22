---
title: Code Intelligence – Changelog
sha256: 5cd011814bdd7665a1b345bf398f89c52e840d12a260da010807f366cf04e318
source: newsletter
source_url: https://linear.app/changelog/2026-05-14-code-intelligence
tags: [linear, code-intelligence, software-development, tooling]
fetcher: jina
review_value: 5
review_confidence: 12
review_stars: 4
ingested: 2026-05-16
---
Markdown Content:
# Code Intelligence – Changelog
[Skip to content →](https://linear.app/changelog/2026-05-14-code-intelligence#skip-nav)
*   [](https://linear.app/homepage)
*       *   Product
    *   Resources
    *   [Customers](https://linear.app/customers)
    *   [Pricing](https://linear.app/pricing)
    *   [Now](https://linear.app/now)
    *   [Contact](https://linear.app/contact)
    *   [Docs](https://linear.app/docs)
    *   [Open app](https://linear.app/login)
    *   [Log in](https://linear.app/login)
    *   [Sign up](https://linear.app/signup)
[Changelog](https://linear.app/changelog)
[May 14, 2026](https://linear.app/changelog/2026-05-14-code-intelligence) Share
## [Code Intelligence](https://linear.app/changelog/2026-05-14-code-intelligence)
![Video 1](https://webassets.linear.app/files/ornj730p/production/a889007e7f7502ea871d6d2d2be250a962b05cc9.mp4)
Elapsed 00:00
Seek to:00:00/Duration 00:00
Remaining−00:00
Code Intelligence gives Linear Agent controlled access to your codebase, turning repositories into shared product context your whole team can use.
With Code Intelligence, Linear Agent can reason about how your product actually works, not just what’s captured in issues, projects, and docs. Ask how a feature is implemented, why something behaves a certain way, what a change might affect, or which technical constraints should shape a plan or customer request without digging through the codebase or interrupting an engineer.
PMs can write sharper specs, Support and Sales can answer technical questions with more confidence, and Engineering can investigate bugs, regressions, and unfamiliar parts of the system faster.
To set up Code Intelligence, a workspace admin should:
1.   Install the [GitHub integration](https://linear.app/docs/github#enable-the-github-integration) and enable code access
2.   Turn on Code Intelligence in [AI Settings](https://linear.app/settings/ai/code-intelligence)
From there, admins can choose which repositories to include and whether access is limited to members with existing GitHub permissions or available to the entire workspace.
Code Intelligence is now available in public beta for Business and Enterprise plans, and free to use during the beta period. See the [docs](https://linear.app/docs/code-intelligence) for more details.
Fixes
*   Agent  Fixed an issue where the agent chat could not be closed while an attachment modal was open
*   Agent  Fixed natural-language confirmations in Slack threads being recognized while awaiting approval, even without an `@Linear` mention
*   Android  Removed the non-responding Linear workspace user from mention autocomplete so only the agent variant appears
*   Boards  Fixed shared multi-team board views showing different status column orders to different viewers
*   Comments Cmd/CtrlF now expands collapsed comment threads when a hidden reply matches the search
*   Customer requests  The empty-state `Add request` button on a project’s customer requests page now opens the create form
*   Dashboards  Fixed double confirmation when deleting a new unnamed dashboard
*   Docs  Fixed anchor links in the docs “On this page” sidebar replacing the URL hash correctly
*   Editor  Fixed the overflow menu trigger on block images disappearing when the menu opened
*   Imports  Fixed migrated document issue links so fallback deep links open in the destination workspace
*   Inbox  Fixed a bug causing notifications for deleted issues to show up in inbox without issue details
*   Integrations  Fixed Sentry installation getting stuck on “Continue in the Linear app” when started from Sentry’s directory
*   Issues  Fixed the status icon hit area in issue lists so near-edge clicks change status instead of opening the issue
*   Projects  Fixed project progress tooltips behaving consistently across List, Board, and Timeline
*   Projects  Prevented project updates from being created with a start date after the target date
*   Releases  Fixed release search by version
*   Releases  Fixed release sync applying provided names to existing releases, not just newly created ones
*   Slack  Fixed automation comments appearing in Slack as the Linear bot instead of “Linear (via Linear)”
*   Zendesk  Fixed the Include message toggle reliably inserting the ticket message when enabled, even with a template applied
Improvements
*   Agent  Linear Agent can now resolve and unresolve comment threads, including in automation flows triggered in triage
*   Agents  Users can now queue follow-up messages while an agent is still working, and they’ll send when the current turn completes
*   Android  Added a long-press menu for folders in Favorites with rename and remove actions
*   Comments  Added a hint below the comment input on duplicate issues pointing to the canonical issue
*   Documents  Added a Last edited column and matching sort option to the team documents table
*   Duplicates  Issue popovers now show the canonical issue when hovering over a duplicate
*   Favorites  Favorited teams now show the Team Details hover card
*   Favorites  Added the ability to favorite a team
*   Issues  Added a delegation footer to issue cards in AI chat showing the agent name and live status
*   Issues  Added an animated desktop tab indicator for issues and pull request reviews when a coding agent is actively working
*   Notifications  Added an option to hide sidebar notification badges
*   Projects  Added a No milestone quick filter at the bottom of the milestones list in the project sidebar
*   Releases  Added contextual menu actions for attaching documents and links
*   Settings  Added a Manage button to the current plan card in billing settings with actions to switch plans, change billing period, or cancel
*   Settings  Added a Switch plan modal in billing settings for changing plans without leaving the page
*   Team  Showed the team icon next to the Team documents group header in the Documents tab
API
*   Projects  Added `slackChannelId` and `microsoftTeamsChannelId` fields on `Project` to return the IDs of connected chat channels
*   Releases  Added `createdAt`, `startedAt`, and `completedAt` fields to release inputs to support backdating
*   SCIM  SCIM user payloads now always populate user groups
MCP server
*   `save_project` no longer accepts issue-level label IDs, and label arrays sent as JSON strings are parsed instead of silently wiping existing labels
*   Added `slackChannelId` and `microsoftTeamsChannelId` fields on `Project` to return the IDs of connected chat channels
*   Added `initiative` and `cycle` parameters to the `save_document` tool to create or reparent documents under an initiative or cycle
*   Unknown tool parameters now return a validation error instead of being silently dropped
Keyboard shortcuts
*   Fixed Alt letter shortcuts (e.g., Alt R) being treated as plain letter presses on Linux/Windows
[](https://linear.app/)
### Product
*   [Intake](https://linear.app/intake)
*   [Plan](https://linear.app/plan)
*   [Build](https://linear.app/build)
*   [Diffs](https://linear.app/diffs)
*   [Monitor](https://linear.app/monitor)
*   [Pricing](https://linear.app/pricing)
*   [Security](https://linear.app/security)
### Features
*   [Asks](https://linear.app/asks)
*   [Agents](https://linear.app/agents)
*   [Customer Requests](https://linear.app/customer-requests)
*   [Insights](https://linear.app/insights)
*   [Mobile](https://linear.app/mobile)
*   [Integrations](https://linear.app/integrations)
*   [Changelog](https://linear.app/changelog)
### Company
*   [About](https://linear.app/about)
*   [Customers](https://linear.app/customers)
*   [Careers](https://linear.app/careers)
*   [Blog](https://linear.app/blog)
*   [Method](https://linear.app/method)
*   [Quality](https://linear.app/quality)
*   [Brand](https://linear.app/brand)
### Resources
*   [Switch](https://linear.app/switch)
*   [Download](https://linear.app/download)
*   [Documentation Docs](https://linear.app/docs)
*   [Developers](https://linear.app/developers)
*   [Status](https://linearstatus.com/)
*   [Enterprise](https://linear.app/enterprise)
*   [Startups](https://linear.app/startups)
### Connect
*   [Contact us](https://linear.app/contact)
*   [Community](https://linear.app/join-slack)
*   [X (Twitter)](https://x.com/linear)
*   [GitHub](https://github.com/linear)
*   [YouTube](https://www.youtube.com/@linear)
### Legal
*   [Privacy](https://linear.app/privacy)
*   [Terms](https://linear.app/terms)
*   [DPA](https://linear.app/dpa)
[Privacy](https://linear.app/privacy)[Terms](https://linear.app/terms)[DPA](https://linear.app/dpa)