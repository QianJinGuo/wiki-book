---

title: "Claw Chain: Cyera Research Unveil Four Chainable Vulnerabilities in OpenClaw"
source: newsletter
source_url: https://www.cyera.com/blog/claw-chain-cyera-research-unveil-four-chainable-vulnerabilities-in-openclaw
ingested: 2026-05-19
sha256: 54c96a8e58fbf9906ae9e8e5abe39d49a44436ce0719d264b4d5f412cae5b496
review_value: 8
review_confidence: 7
review_recommendation: strong
review_stars: 4
tags: [security, vulnerability, CVE, ai-agent, openclaw, sandbox-escape]

---
# Claw Chain: Cyera Research Unveil Four Chainable Vulnerabilities in OpenClaw
Claw Chain: Cyera Research Unveil Four Chainable Vulnerabilities in OpenClaw
Vulnerability Class: Sandbox escape, privilege escalation, data exposure
CVE IDs: CVE-2026-44112, CVE-2026-44115, CVE-2026-44118, CVE-2026-44113
Highest CVSS Score: 9.6 — CRITICAL (CVE-2026-44112)
Affected Product: OpenClaw (all versions prior to April 23, 2026 patches)
Attack Vector: Agent-mediated — prompt injection, malicious plugin, supply-chain input
Exposed Instances: ~65,000 (Shodan) · ~180,000 (Zoomeye) public-facing OpenClaw servers
Cyera identified four vulnerabilities in OpenClaw, an open-source autonomous AI agent platform.
The four findings span sandbox isolation, identity, and execution validation. Combined impact: AI agents have become a primary execution surface, and the security model around them has not caught up.
CVE-2026-44112 - TOCTOU Filesystem Write Escape | CRITICAL 9.6
Time-of-check/time-of-use race condition in OpenShell sandbox allows attackers to redirect writes outside sandbox boundary.
CVE-2026-44115 - Execution Allowlist Env-Vars Disclosure | HIGH 8.8
Gap between command validation and shell execution allows environment variables (API keys, tokens, credentials) to be expanded inside unquoted heredocs.
CVE-2026-44118 - MCP Loopback Privilege Escalation | HIGH 7.8
OpenClaw trusts client-controlled ownership flag (senderIsOwner) without validating against authenticated session.
CVE-2026-44113 - TOCTOU Filesystem Read Escape | HIGH 7.7
Same race-condition pattern in read operations exposes system files and credentials outside sandbox.
Attack Chain: Malicious plugin/prompt injection → data exfiltration (CVE-44113 + CVE-44115) → privilege escalation (CVE-44118) → persistence (CVE-44112).
Key insight: Attackers can exploit the AI agent itself to execute the attack chain. Each step looks like normal agent behavior to traditional controls.