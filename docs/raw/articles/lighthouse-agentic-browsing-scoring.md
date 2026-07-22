---
title: "Lighthouse Agentic Browsing Scoring"
source_url: "https://developer.chrome.com/docs/lighthouse/agentic-browsing/scoring"
author: "Chrome DevTools Team"
publish_time: "2026"
ingested: 2026-06-23
sha256: 8fc88aebabfc9cdb15e487a545191416fd59853c72745ed9221c1ada36fced5d
source: newsletter
---

# Lighthouse Agentic Browsing Scoring

The Agentic Browsing category evaluates how well your site is constructed for machine interaction through a set of deterministic audits.

## How the category is scored

Unlike other Lighthouse categories, the Agentic Browsing category does not have a weighted average score from 0 to 100. Because the standards for the agentic web are still emerging, the current focus is to gather data and provide actionable signals rather than a definitive ranking.

Instead of a score, the report displays:

*   **A fractional score**: A ratio showing how many agentic readiness checks your site passes.
*   **Pass or Fail status**: Specific audits may emit errors or warnings if technical requirements (like WebMCP schema validity) are not met.
*   **Informational counts**: The category header may include a _pass ratio_ to help you observe overall progress at a glance.

## Why results fluctuate

While the audits are deterministic, your results may fluctuate due to changes in how your site registers its tools or responds to agentic requests. Common causes include:

*   **Dynamic tool registration**: If your site registers WebMCP tools using JavaScript (Imperative API), the timing of these registrations can affect whether they are captured during the Lighthouse snapshot.
*   **Variability in A11y tree construction**: Significant changes to DOM size or complexity can impact the structure of the accessibility tree, which is a core metric for agentic navigation.
*   **Cumulative Layout Shift (CLS)**: Layout shifts caused by ads, images without dimensions, or injected content can move elements between the time an agent identifies them and the time it attempts an interaction.

## How audits are determined

Lighthouse uses a set of deterministic signals to evaluate your page. This ensures that the audits are reproducible and suitable for integration into CI/CD pipelines.

### Web MCP Integration

Lighthouse calls the Chrome DevTools Protocol (CDP) `WebMCP` domain to monitor tool registration events. It verifies both declarative tools (defined in HTML) and imperative tools (defined in JS).

### Agent-Centric Accessibility

Agents rely on the accessibility tree as their primary data model. Lighthouse filters a specific subset of accessibility audits that are critical for machine interaction, such as:

*   **Names and labels**: Ensuring every interactive element has a programmatic name.
*   **Tree integrity**: Verifying that roles and parent-child relationships are valid.
*   **Visibility**: Confirming that content is not hidden from the accessibility tree while being interactive.

### Stability and Discoverability

*   **Cumulative Layout Shift (CLS)**: Measures visual stability, which is critical for agents relying on element positioning.
*   **llms.txt**: Checks for the presence of a machine-readable summary at the domain root.

## What can developers do to improve?

To improve your site's agentic readiness:

*   **Adopt WebMCP**: Use the WebMCP API to explicitly expose your site's logic and forms to AI agents.
*   **Ensure a sound a11y tree**: Prioritize semantic HTML and proper ARIA labeling, as these are the "machine-eye view" of your page.
*   **Optimize for stability**: Reduce layout shifts to ensure that agents can reliably interact with your UI without elements moving unexpectedly.
