# Introducing computer use in Gemini 3.5 Flash

## Ch01.842 Introducing computer use in Gemini 3.5 Flash

> 📊 Level ⭐⭐ | 3.0KB | `entities/gemini-3-5-flash-computer-use.md`

## Introducing computer use in Gemini 3.5 Flash

> **Background**: Google Blog, 2026-06-25. Google introduces native computer use capabilities in Gemini 3.5 Flash, enabling the model to interact with UI elements, click buttons, type text, and navigate applications autonomously.

## Core Capabilities

### What Is Computer Use?

Computer use allows Gemini 3.5 Flash to:
- **See** the screen via screenshots
- **Understand** UI elements and their functions
- **Act** by clicking, typing, scrolling, and navigating
- **Reason** about multi-step workflows

### Architecture

```
User Intent
    |
    v
Gemini 3.5 Flash (multimodal)
    |
    +-- Screenshot Analysis
    |   (vision understanding)
    |
    +-- Action Planning
    |   (reasoning about next steps)
    |
    +-- Action Execution
    |   (mouse/keyboard control)
    |
    v
Task Completion
```

### Key Technical Details

1. **Native multimodal integration**: Computer use is built into the model, not a separate tool
2. **Screen understanding**: Can identify buttons, text fields, menus, and other UI elements
3. **Multi-step reasoning**: Plans and executes complex workflows across multiple screens
4. **Error recovery**: Can detect and recover from unexpected UI states

### Use Cases

- **Web automation**: Filling forms, navigating websites, extracting information
- **Desktop application control**: Operating native applications
- **Testing and QA**: Automated UI testing workflows
- **Data entry**: Automating repetitive data input tasks

## Comparison with Other Computer Use Implementations

| Feature | Gemini 3.5 Flash | Claude Computer Use | OpenAI Operator |
|---------|-----------------|--------------------|----|
| Native integration | Yes | Yes | Yes |
| Multimodal | Yes (native) | Yes | Yes |
| Model | Gemini 3.5 Flash | Claude 3.5 Sonnet | GPT-4o |
| Availability | Preview | GA | Limited |

## Implications for Agent/Harness Engineering

1. **Agent UI automation becomes mainstream**: Major providers now offer computer use natively
2. **Reduced reliance on custom browser automation**: Agents can interact with any UI, not just APIs
3. **New testing paradigms**: Computer use enables testing approaches that were previously impractical
4. **Security considerations**: Computer use capabilities require careful sandboxing and permission models

## Related

- [Gemini 3.5 Frontier Intelligence](/ch01-402-gemini-3-5-frontier-intelligence-with-action/)
- [Agent Harness Engineering Survey 2026](/ch04-069-agent-harness-engineering-a-survey/)

-> [Original Archive](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/gemini-3-5-flash-computer-use.md)

---

