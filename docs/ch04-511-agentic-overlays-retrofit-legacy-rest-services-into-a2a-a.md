# Agentic Overlays -- Retrofit Legacy REST Services into A2A Agents

## Ch04.511 Agentic Overlays -- Retrofit Legacy REST Services into A2A Agents

> 📊 Level ⭐⭐ | 2.3KB | `entities/agentic-overlays-rest-to-a2a-enterprise.md`

# Agentic Overlays -- Retrofit Legacy REST Services into A2A Agents

AWS + Cisco joint proposal: "agentic overlay" pattern wraps legacy REST services into A2A-compatible agents using a thin wrapper layer, without rewriting business logic.

## Core Problem

Enterprise REST APIs are stable, well-tested, deeply embedded in production, but not designed for A2A communication. Most existing agents are REST-based or proprietary, outside the A2A framework.

## Three Approaches Comparison

| Approach | Description | Problem |
|----------|-------------|---------|
| Dual stack | REST + A2A separate endpoints | Double ops, inconsistency risk |
| Shared business logic | Refactor REST to extract shared layer | Regression risk, test burden |
| **Agentic Overlay** | Thin wrapper, no code changes | Recommended |

## Agentic Overlay Architecture

```
Legacy REST Service
    |
    +-- Agentic Overlay (thin wrapper)
        +-- A2A Agent Card (discovery metadata)
        +-- A2A Protocol Handler (JSON-RPC)
        +-- MCP Tool Interface (tool exposure)
        +-- Auth/Validation Bridge
```

Key properties:
- **No code changes**: overlay is independent layer, calls original REST API via HTTP
- **Simultaneous A2A + MCP**: one overlay exposes as both A2A agent and MCP tool
- **Eliminates agent sprawl**: reuses existing services as agents, no new infrastructure

## REST vs A2A Paradigm Difference

- **REST**: deterministic, client-server, stateless request-response, optimized for stable interfaces
- **A2A**: autonomous agent interop, agent card discovery, JSON-RPC coordination, optimized for reasoning-driven coordination

## Practical Significance

For enterprises with large REST microservice estates (finance, telecom, government), agentic overlay is the lowest-cost agent-ification path:
1. No rewrite or refactor of existing services
2. No parallel infrastructure
3. Gradual migration: overlay critical services first, then expand

## Reference

- Source: [Original Article](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/retrofit-dont-rebuild-agentic-overlays-for-transforming-lega.md)

---

