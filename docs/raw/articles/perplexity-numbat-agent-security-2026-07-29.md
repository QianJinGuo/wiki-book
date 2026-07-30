---
title: "Securing Agents Across Perplexity’s Client Endpoints with Numbat"
source_url: "https://research.perplexity.ai/articles/securing-agents-across-perplexity%E2%80%99s-client-endpoints-with-numbat"
ingested: 2026-07-31
sha256: 26395cc69cefc955e9ec96a034e4b2fb1329a2a68a53d402614fb18b79f06ab6
---

Title: Securing Agents Across Perplexity’s Client Endpoints with Numbat

URL Source: https://research.perplexity.ai/articles/securing-agents-across-perplexity%E2%80%99s-client-endpoints-with-numbat

Published Time: Wed, 29 Jul 2026 16:35:14 GMT

Markdown Content:
AI agents must be secure to be useful. As model and system capabilities advance, so too does the vigilance required to protect users.

Early agent security research focused on prompt injections and other forms of adversarial inputs. Yet recent advances in agent autonomy give rise to security incidents that need not assume the existence of adversarial inputs—or human adversaries at all.

Rather, agents directed to pursue high-level goals, without prescriptive guidance on how to achieve those goals, can _become_ the adversary. This occurs when an agent, in response to a user-specified goal, selects a course of action that the user did not intend and would not have approved. Although such incidents were [theorized](https://arxiv.org/abs/2605.19149) only a few months ago, they have quickly become matters of [practical](https://openai.com/index/hugging-face-model-evaluation-security-incident/) concern.

Because these behaviors cannot be fully patched within the model layer, a robust defense must therefore inhabit the surrounding system, including the agent harness that serves as the model’s interface to the outside world. We are open-sourcing Numbat, our agent security suite that helps defenders prevent, detect, and mitigate agent-related incidents. Numbat identifies and directly integrates with agent harnesses commonly found on enterprise client endpoints, enforcing security rules and enabling rapid detection and response.

## Introduction

The adoption of agents poses novel security challenges for developers, adopters, and defenders alike. This is especially true when enterprises deploy agents directly on client endpoints with privileged access to enterprise systems and data.

Agent deployments on client endpoints, such as CLI-based or desktop app-based coding agents, come with varying levels of sandboxing and isolation. Users leverage these agents for countless use cases, each with their own attendant action space that can affect the endpoint itself or other systems accessible from the endpoint. Increasingly, agents are expected to operate autonomously for hours or even days. For these workflows, many users choose to delegate agent action approvals to classifiers, or bypass approvals entirely with concerningly named configuration flags such as `--dangerously-skip-permissions` and `--yolo`. The multiplicity of agent use cases and configurations, combined with the breadth of actions that coding agents can perform on privileged endpoints, makes for a risk profile that requires proactive management by security teams.

Today, we are releasing [Numbat](https://github.com/perplexityai/numbat), an open-source agent security suite we built to detect, investigate, and prevent dangerous activity from AI agents. As more companies adopt frontier agent products, Numbat empowers security teams to keep pace with the resulting security challenges. It integrates into each of the most widely used client-side agent harnesses while exposing a consistent interface across all of them. Numbat thus frees security teams from the burden of building custom safeguards and monitoring tools for each individual agent their users rely on. Numbat is available to the defender ecosystem as part of Perplexity’s membership in the[Open Secure AI Alliance](https://blogs.nvidia.com/blog/open-secure-ai-alliance/) with NVIDIA and other organizations.

![Image 1](https://framerusercontent.com/images/hwmAc23ND1x32fOVbMACqC5us48.png)

###### System architecture of Numbat-secured agents. Numbat emphasizes local-first detection and agent-agnostic forensics.

This article begins with a discussion of the security challenges motivating Numbat. We then present Numbat’s design and architecture, along with our lessons from deploying Numbat across thousands of Perplexity’s own endpoints.

## Situating the Vulnerability Landscape

The landscape of AI agent security incidents is rapidly evolving. Much of the existing agent security literature focuses on injection attacks, in which a malicious payload is introduced into model prompts or context to confuse agents into improper behavior. Injection attacks and safeguards have been [extensively studied](https://arxiv.org/abs/2603.12230), and agent developers including Perplexity have devised increasingly robust [defenses](https://arxiv.org/abs/2511.20597) against injection attacks.

But an AI agent does not need a malicious payload to create a security incident. In fact, one need not assume the existence of an adversary at all. A trusted agent, operating inside a trusted environment with administrator-approved tools, can take harmful actions simply because it is trying too hard to complete its task.

Researchers describe this failure mode as an “[accidental meltdown](https://arxiv.org/abs/2605.19149)”: harmful agent behavior triggered not by adversarial input, but by an ordinary environmental error. A missing file, failed API request, expired credential, or permission denial can send an agent searching for a workaround. In pursuing its original user-specified goal, the agent may cross security boundaries through unauthorized reconnaissance, access-control changes, secret discovery, or data exfiltration. Instead of the agent being co-opted by an attacker, the agent itself is the attacker. Moreover, the attack can target internal systems, external systems, or both, with no way of knowing until the attack is already underway.

The first widely-reported accidental meltdown arrived this month, with OpenAI’s [disclosure](https://openai.com/index/hugging-face-model-evaluation-security-incident/) of an agent-initiated attack that compromised Hugging Face’s production infrastructure. During evaluations of a prerelease GPT model, the model found itself unable to make progress on the evaluation with the context provided. To break this logjam, the model found a way to escape its sandbox testing environment and exfiltrate the evaluation answers from Hugging Face. The model leveraged its harness to escape intended network constraints, escalate privileges beyond sandbox boundaries, obtain secrets, and access secure Hugging Face systems, all to pursue the narrow objective of solving the evaluation.

Meltdowns also include unintended system mutations and deletions. Though perhaps more pedestrian than breaching an external system, these occurrences are more frequent and salient to any power user of coding agents. Deleting [production databases](https://www.tomshardware.com/tech-industry/artificial-intelligence/claude-powered-ai-coding-agent-deletes-entire-company-database-in-9-seconds-backups-zapped-after-cursor-tool-powered-by-anthropics-claude-goes-rogue) or [home directories](https://www.techtimes.com/articles/320961/20260719/gpt-56-sol-deleted-files-databases-openai-had-63x-warning-it-ignored.htm) is any developer’s worst nightmare, and agents must be able to steer clear of such behaviors throughout their execution.

AI researchers are working to mitigate these behaviors within models themselves. Although these efforts are certainly valuable, many in the research community perceive a fundamental [tension](https://arxiv.org/pdf/2511.18397) between training models for strong security properties and training those same models to accomplish increasingly complex tasks. We believe it’s unlikely that defenses focusing solely on the model layer will reduce meltdown risk to acceptable levels.

## Securing Coding Agents through Native Harness Integrations

The upshot is that agent security cannot rest solely upon model, user, or task-level safeguards. Rather, security teams need visibility into what agents actually do on client endpoints, plus controls that can stop dangerous actions before they run. These are system-level controls that must be tightly integrated with the agent harness.

Numbat provides these controls in the form of a lightweight static Go binary that plugs seamlessly into leading client-side agent harnesses. It offers live monitoring, policy enforcement, and forensic reconstruction across agent harnesses and execution environments.

The key integration points between Numbat and an agent harness are hooks, session artifacts, and OTLP telemetry. We discuss each in turn.

### Hooks

Virtually all coding agents possess a [hook](https://docs.github.com/en/copilot/concepts/agents/hooks#what-are-hooks) subsystem. Hooks allow agents to deterministically execute subroutines at prespecified points within the agent execution lifecycle. Agent users typically configure hooks to provide models with additional context in predictable ways, implement testing and verification loops, and make other enhancements to agent capabilities.

The same deterministic properties that make hooks attractive for these purposes also make them attractive for detection and response. It’s typically insufficient to catch _most_ occurrences of a potentially concerning event. Rather, one must cover _all_ such occurrences for detection and response. Numbat configures multiple types of hooks, allowing security teams and IT administrators to implement rich detection logic.

In most coding agents, certain types of hooks (commonly dubbed “pre-action” hooks) are also able to block the execution of the agent’s next action. Using these pre-action hooks, Numbat is able to implement not only detection logic but also preventative security rules to stop a meltdown from occurring in the first place.

### Session artifacts

Hooks are powerful means of implementing detection and prevention logic in real time. However, this logic must be specifiable in code. Oftentimes, an agent security incident assumes a form that could not have been foreseen in advance, let alone reduced to source code. Therefore, Numbat also has the ability to access and analyze session artifacts retroactively.

Session artifacts include many types of logs and diagnostics. Perhaps the most important type of log is the session transcript, which records the LLM conversations that dictate the agent’s sequence of actions. Power users of coding agents are already accustomed to exporting session transcripts for further analysis through harness-provided commands. But these exports are typically in plaintext format, which is ill-suited for security teams who require machine-readable logs with a consistent, predictable schema.

Numbat thus retrieves session artifacts directly from the filesystem itself. Because most client-side agent harnesses store original artifacts on the filesystem (typically within an agent-specific dot directory under `$HOME`), tapping into the filesystem provides the most direct route to this data in its most usable and pristine form. Security teams using Numbat can collect these artifacts in normalized NDJSON timeline format through `numbat scan`, either for local processing on the client endpoint or asynchronous remote analysis. Because session artifacts are static, self-contained records, Numbat is able to reconstruct these timelines even for sessions occurring long before Numbat was installed.

### OTLP telemetry

Most client-side agent harnesses offer extensive telemetry through the [OpenTelemetry](https://opentelemetry.io/) protocol (OTLP). This telemetry typically provides many signals beyond those available through hooks or session artifacts.

Numbat can function as an OTLP receiver via the `numbat collect` command. This command starts a server to which coding agents send OTLP telemetry for downstream analysis. Importantly, this server is local and listens by default only on localhost, meaning that all telemetry stays on the device by default. Security admins can then determine what to do with the logged telemetry, whether that involves implementing lightweight on-device processing, remote processing via `numbat ship`, or more involved analysis on analytics platforms such as ClickHouse.

## Deploying Numbat within Perplexity

Within Perplexity, we use Numbat to secure our engineers’ use of client-side coding agents including Claude Code, Codex, OpenCode, and Pi.

Both our prevention and detection efforts make extensive use of Numbat rules, which are implemented via each agent’s hook subsystem. We formulated several bread-and-butter rules for our own needs, many of which we shipped as part of Numbat’s [52 built-in rules](https://github.com/perplexityai/numbat/blob/main/docs/rules.md). These rules are organized into 11 behavior categories and a set of multi-step sequence detections such as secret access, exfiltration, privilege escalation, and lateral movement. Rules use CEL expressions over normalized events, and operators can add their own rules and tests without changing Numbat’s code.

For example, the built-in `privilege.sudoers_tamper` rule detects writes to sudoers policy, use of `visudo`, and attempts to install `NOPASSWD` grants. These are high-signal actions that can turn a limited agent process into persistent root access.

Individual commands do not always look malicious on their own, so Numbat also correlates sequences within an agent session. The built-in `chain.secret_manager_read_then_egress` rule detects when an agent reads a value from a common secrets-management tool and later attempts a data-bearing `curl` or `wget` request. A secret read may be legitimate. An outbound request may be legitimate. Sequenced together, they require investigation.

### Managing and monitoring Numbats across the fleet

Like [Bumblebee](https://www.perplexity.ai/hub/blog/perplexity-is-open-sourcing-bumblebee), our open-source scanner for supply-chain exposure on developer endpoints, Numbat is deployed across our fleet through MDM. Each Numbat records agent activity locally and sends structured telemetry into our centralized security systems.

From there, Perplexity Computer reviews recent Numbat findings and audit logs on a recurring schedule for suspicious or malicious behavior. It investigates detections, reconstructs relevant agent sessions, and gives additional scrutiny to actions that Numbat blocked.

![Image 2](https://framerusercontent.com/images/SV2VyeHDo97IFmP5eeZHIXvJswM.png)

###### Perplexity’s internal pipeline for monitoring Numbat telemetry. A scheduled Perplexity Computer task asynchronously reviews new signals and alerts the security team on risky activity.

Computer also looks for gaps in our coverage. It analyzes new behavior, proposes improvements to Numbat’s detections, tests those changes, and opens pull requests for human review. Once approved and deployed, those rules improve monitoring across the fleet and produce better evidence for the next investigation.

This creates a self-improving security flywheel: agents generate activity, Numbat turns that activity into normalized timelines and telemetry, Computer investigates and improves the rules, and human-reviewed updates strengthen the controls protecting future agent sessions.

## Conclusion

At Perplexity, we believe that AI agents will execute across all types of environments: local, cloud, and hybrid. Each combination of agent harness and execution environment poses unique security challenges, with the combinatorial complexity threatening to overwhelm bandwidth-strapped security teams. Agent meltdowns and other novel vulnerabilities complicate the security picture even further.

Defenses that inhabit the agent system itself can improve a user’s security posture no matter where the agent executes. This is precisely what Numbat delivers: tightly integrated agent safeguards that allow defenders to prevent, detect, and respond to concerning behavior in real time. Combining Numbat with Perplexity Computer creates a powerhouse agent security platform that empowers defenders to stay ahead of the curve.

Numbat is available today as an [open-source project](https://github.com/perplexityai/numbat) for macOS, Linux, and Windows. Our own client endpoints are secured by Numbat, enabling Perplexity team members to confidently use agents over broadly scoped tasks and long horizons. We invite security teams everywhere to leverage Numbat’s system-level approach to securing and protecting their agent deployments.
