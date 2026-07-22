---
title: "Introducing Vercel Connect"
source_url: "https://vercel.com/blog/introducing-vercel-connect"
ingested: "2026-06-19"
sha256: "7da4dbd325ba3f4b"
type: article
tags: [article]
---

# Introducing Vercel Connect


Published Time: 2026-06-17T09:17:12.380Z

Markdown Content:
Giving your agents access to your tools, data, and services is what makes them useful. As agents perform deeper work across systems, authenticating and authorizing that access becomes central to your application architecture.

Today, agent access is usually granted through long-lived provider tokens stored in your environment variables, provisioned for everything your agent might need. These tokens are shared across every user, never expire, and give your agent full reach across every task, no matter how small the job.

A vault makes that token harder to steal. It doesn't make it less dangerous. The problem is what happens when the token leaks: everything it can touch is now exposed.

We built [Vercel Connect](https://vercel.com/connect) to solve this problem. Now in Public Beta, Vercel Connect replaces the stored token with runtime credential exchange. You register a connector once. When your agent has work to do, your app proves its identity to Vercel Connect and gets back a short-lived credential, scoped to the task. Everything you used the token for still works. The agent just requests access each time instead of holding it.

![Image 1: Diagram of three agents (a Support Agent, a Code Review Agent, and a Data Analyst Agent) connecting through Vercel Connect to Slack, Linear, and Snowflake.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F1i9Ba8UZlv3GRk3fUKgzW5%2F548ad7b33db56629e03e3822063b6741%2FConnect_imagery_-_light.png&w=1920&q=75)![Image 2: Diagram of three agents (a Support Agent, a Code Review Agent, and a Data Analyst Agent) connecting through Vercel Connect to Slack, Linear, and Snowflake.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F3UNGvCYEUyJvuPhwjKQVlC%2Ffc11d0e2eb0b39fc4f4d997ec70be145%2FConnect_imagery_-_dark.png&w=1920&q=75)

Each agent reaches its service through Vercel Connect, with its own scoped tokens and triggers.

## [Link to heading](http://vercel.com/blog/introducing-vercel-connect#register-a-connector-once,-then-reuse-it-across-projects-and-environments)**Register a connector once, then reuse it across projects and environments**

A connector is a reusable connection between your Vercel team and a provider like Slack or GitHub. You create it once from the dashboard or the CLI, then attach it to the projects and environments that need it, with project-level access controls.

`vercel connect create slack --name mybot`

Create a Slack connector

The relationship with the provider becomes a single entity you can see and manage, not something scattered across a dozen environment variable panels where a rotation means hunting down every copy.

Your coding agent can run this setup too. Install the vercel-connect skill with `npx skills add vercel/vercel-plugin --skill vercel-connect`, and it can create and attach connectors for you.

## [Link to heading](http://vercel.com/blog/introducing-vercel-connect#request-scoped-tokens-at-runtime)**Request scoped tokens at runtime**

With a connector in place, the agent asks for a credential only when it has work to do. The [`@vercel/connect`](https://www.npmjs.com/package/@vercel/connect) SDK returns a token you use immediately against the provider API, and no provider secret lives in your app.

app/lib/connect-token.ts

`import { getToken } from '@vercel/connect';const token = await getToken('slack/mybot', {  subject: { type: 'app' },});`

Request a token at runtime

Tokens are short-lived, with a lifetime that depends on the provider. The SDK refreshes them automatically, so you never rotate a secret by hand. That leaves one question. If your app holds no secret, what proves it's allowed to ask?

## [Link to heading](http://vercel.com/blog/introducing-vercel-connect#the-app-proves-its-identity-with-oidc)**The app proves its identity with OIDC**

The proof is an identity your app already has. Every deployment on Vercel gets an OIDC identity, and when your app or agent requests a token, the SDK presents that identity to Vercel Connect. Vercel Connect verifies it, checks that the project and environment are allowed to use the connector, and returns the provider credential. That round trip is the runtime credential exchange.

The same identity is available during local development through `vercel link` and `vercel env pull`, and outside Vercel, the SDK accepts a Vercel access token. Either way, there is no provider secret in your app to leak, commit, or copy between environments.

## [Link to heading](http://vercel.com/blog/introducing-vercel-connect#scope-each-token-to-exactly-what-the-task-needs)**Scope each token to exactly what the task needs**

Not every task needs the same reach, even within a single agent. One step might read a repository while the next opens an issue. Each requests exactly the access it needs, and the request itself sets limits. A request can include:

*   Provider scopes

*   An installation ID

*   Resource restrictions

*   Provider-specific authorization details

GitHub is the sharpest example because it can restrict a token to specific repositories and permissions.

app/lib/github-token.ts

`import { getToken } from '@vercel/connect';const token = await getToken('github/mybot', {  subject: { type: 'app' },  authorizationDetails: [    {      type: 'github_app_installation',      repositories: ['myorg/repo1'], // one repo, not the whole org      permissions: ['contents:read'], // read-only, not write    },  ],});`

Scope a token to one repository, read-only

The deployment agent can read that one repository and do nothing else. A fine-grained GitHub App install can be narrow too, but an install is a standing grant, set up once and trusted from then on. This limit exists for one request, one task. Least privilege becomes the shape of the request.

## [Link to heading](http://vercel.com/blog/introducing-vercel-connect#act-on-behalf-of-a-specific-user,-with-per-user-token-scoping)**Act on behalf of a specific user, with per-user token scoping**

A shared bot token gives every user's request the same identity and reach. Vercel Connect lets you set that identity. Switch `subject` from the app to a named user, and the token acts on that user's behalf, scoped to what that user authorized.

app/lib/user-token.ts

`import { getToken } from '@vercel/connect';const token = await getToken('linear/mybot', {  subject: { type: 'user', id: 'user_123' },});`

Request a token for a specific user

When a user first grants access, `startAuthorization` runs the consent flow through a callback URL, a webhook, or a device code. After that, the agent requests tokens as that user.

## [Link to heading](http://vercel.com/blog/introducing-vercel-connect#contain-access-by-environment,-and-revoke-it-when-you-need-to)**Contain access by environment, and revoke it when you need to**

A connector is attached to the projects and environments you choose, so you can run a separate connector for development, preview, and production instead of pointing one at all three. When each environment has its own connector with an authorization grant and scopes, a credential compromised in development cannot be replayed against production.

Separate connectors limit where a credential works, but they don't pull back access already issued. That's normally the painful part. With a stored token, that means a rotation. You mint a new secret, update every place the old one lived, and redeploy whatever depended on it. With Vercel Connect, you revoke the connector's tokens, either your own or all of them.

`# Revoke just your own tokens for a connectorvercel connect revoke-tokens slack/mybot --my-tokens# Or revoke every token, across all users and installationsvercel connect revoke-tokens slack/mybot --all-tokens`

Revoke a connector's tokens

What revoking d
