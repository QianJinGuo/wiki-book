---

title: "WorkOS Pipes: Third-party integrations without the headache"
type: raw
source: newsletter
source_url: https://workos.com/blog/workos-pipes-third-party-integrations
fetcher: jina
review_value: 7
review_confidence: 7
review_recommendation: worth-reading
ingested: 2026-05-18
sha256: 94c499754bdd2678b692cfce3e7ea24b299c65baf379d1bc03126820251c4467

---
Title: WorkOS Pipes: Third-party integrations without the headache
URL Source: https://workos.com/blog/workos-pipes-third-party-integrations
Published Time: Jan 15, 2026
Markdown Content:
January 15, 2026
January 15, 2026
Building modern applications increasingly means connecting to multiple third-party services. We built Pipes to handle OAuth flows, token management, and provider setup for you.
![Image 1](https://cdn.prod.website-files.com/621f84dc15b5ed16dc85a18a/671bf5b044cedc753d432c9c_TBDJCFH1R-U07PVV2CN3H-a6448d0659be-512.png)
Zack Proser
![Image 2](https://cdn.prod.website-files.com/621f84dc15b5ed16dc85a18a/671bf5b044cedc753d432c9c_TBDJCFH1R-U07PVV2CN3H-a6448d0659be-512.png)
![Image 3](https://cdn.prod.website-files.com/621f84dc15b5ed16dc85a18a/66bcaee61f7609eb2495d480_Dan%20Dorman.png)
![Image 4](https://cdn.prod.website-files.com/621f84dc15b5ed16dc85a18a/671fa9936599b1dad13bb0ef_62509aad98308e5335d71dc5_mh.webp)
![Image 5](https://workos.com/blog/workos-pipes-third-party-integrations)
![Image 6](https://workos.com/blog/workos-pipes-third-party-integrations)
January 15, 2026
Whether you're syncing GitHub pull requests, accessing Google Calendar data, or integrating with Slack, these connections have become essential. But if you've ever implemented OAuth flows for third-party integrations, you know the reality: managing access tokens, handling refresh logic, storing credentials securely, and navigating each provider's unique setup process.
We built Pipes to handle all of that for you.
## The problem with third-party integrations
Every third-party integration follows a similar pattern. You need to register an app with the provider, implement an OAuth flow, store access tokens securely, handle token refreshes, manage scopes, and deal with errors when tokens expire.
Multiply that by every service you want to integrate with, and you've spent days on infrastructure that doesn't differentiate your product.
This problem gets even more complex with AI applications, which often need to pull data from multiple sources to provide context and functionality. The more integrations you want to offer, the more time you spend on plumbing instead of features.
## What is Pipes?
Pipes is our answer to integration overhead. It's a simple API and widget that lets you connect your application to third-party data sources without managing the authorization infrastructure yourself.
We handle secure token storage, automatic token refresh, OAuth flow implementation, and provider-specific configuration. You make a single API call to get a fresh access token, and we guarantee it's valid and ready to use.
## How it works
The integration experience has two parts.
First, your users see the Pipes widget in your application—an embeddable UI component that lists available integrations. Users can enable integrations with a simple checkbox, no complex setup required on their end.
Second, when you need to access data from a connected service, you call our API to retrieve the access token. That's it. One API call that returns a fresh, valid token you can immediately pass to the third-party service.
```
// Get a fresh access token from Pipes
const token = await workos.pipes.getAccessToken({
  userId: user.id,
  provider: 'github'
});
// Use it directly with the provider's SDK
const github = new GitHubClient(token);
const pullRequests = await github.getPullRequests();
```
We handle everything else behind the scenes: refreshing expired tokens, managing scopes, storing credentials securely, and surfacing errors when re-authorization is needed.
## Real-world use cases
Consider a project management tool that wants to connect GitHub pull requests to tasks. With Pipes, users can link their GitHub account through your app's settings, and you can immediately start syncing PR status, adding comments programmatically, and keeping everything in sync. No need to build and maintain GitHub's OAuth flow yourself.
Or imagine an AI assistant that needs access to a user's Google Calendar and Gmail to provide intelligent scheduling suggestions. Even if your users sign in through SSO (like Okta), they can still authorize their Google services through Pipes independently. The integration flow is decoupled from authentication, giving you more flexibility in how you build your app.
Other use cases we've seen include internal tools that need CRM data, developer platforms that integrate with multiple code repositories, and productivity apps that pull from various Google Workspace products.
## Getting started faster with shared credentials
One feature we're particularly excited about is shared credentials. When you're building and testing integrations, you can use WorkOS-provided OAuth applications for each provider. You don't need to create a Google Cloud project, register a GitHub app, or navigate any provider's console. Just select the scopes you need and start developing immediately.
Shared credentials are available for development and testing only—for production, you'll configure your own OAuth applications with each provider.
But during the development phase, this removes a significant barrier to getting started. When you're ready for production, switching to your own credentials is straightforward.
## Supported providers
Pipes supports a growing list of popular services. At launch, we included GitHub, Google, Slack, and Salesforce. We've since expanded to include Asana, Box, Dropbox, Front, GitLab, HelpScout, Hubspot, Intercom, and Sentry.
Each provider is fully supported with token management, refresh handling, and scope configuration. We'd love to hear what other providers you'd like to see—the integrations you need most will help us prioritize our roadmap.
## Different from OAuth providers
You might be wondering how Pipes relates to our existing OAuth provider feature, which already lets you retrieve tokens from authentication providers. Both are valuable, but they solve different problems.
Our OAuth provider tokens work great when your integration maps directly to how users sign in. If users log in with Google, you can access their Google Calendar through those tokens. But if users log in with SSO through Okta, you can't get Google Calendar access through the authentication flow.
Pipes solves this by decoupling integrations from authentication. Users can sign in however they want and separately authorize the specific services your app needs. The Pipes widget makes this clear and user-friendly, presenting integrations as distinct capabilities rather than authentication methods.
## What you don't have to worry about
### Token storage and security
We store all access tokens and refresh tokens securely, encrypted at rest. You never need to build or maintain a secure credential store.
### Token refresh logic
OAuth tokens expire. We automatically refresh them before they become invalid, so you always get a working token from our API.
### Provider registration during development
With shared credentials, you skip the tedious process of registering apps with each provider while you're building. Every provider has different requirements, different dashboards, and different quirks. We've done it once, so you can focus on your integration logic first and handle provider registration when you're ready for production.
### Error handling
When tokens can't be refreshed (because a user revoked access, for example), we provide clear error responses so you can prompt for re-authorization appropriately.
### Scope management
Configure the specific permissions your integration needs through our dashboard, and we'll request them during the authorization flow.
## Get started with Pipes
Pipes is available now. Check out our [documentation](https://workos.com/docs/pipes) to start building, or reach out to our team via Slack or [email](mailto:support@workos.com) if you have questions about how Pipes fits into your architecture.
We're excited to see what you build with it, and we'd love your feedback on which providers and features matter most to you.
Want to learn more about WorkOS? [Check out our other products](https://workos.com/) for authentication, directory sync, and audit logs.