---
source_url: "https://developers.googleblog.com/announcing-genkit-middleware-intercept-extend-and-harden-your-agentic-apps/"
ingested: 2026-06-26
sha256: 7fd95d61885204f3
---

# Announcing Genkit Middleware: Intercept, extend, and harden your agentic apps
Published Time: 2026-05-14
Markdown Content:
MAY 14, 2026
[Genkit](https://genkit.dev/) is an open-source framework for **building full-stack, AI-powered and agentic applications for any platform** with support for TypeScript, Go, Dart, and Python. Building a production-ready agentic applications and AI features requires more than powerful models and careful prompting. You might need retries and fallbacks for maximum reliability, human approval before destructive tool calls, and observability across every layer.
Genkit solves this with **middleware**: composable hooks that intercept generation calls, including the tool execution loop, and inject custom behaviors. The middleware system is available today in TypeScript, Go, and Dart, with Python support coming soon.
## **How Genkit middleware works**
Every `generate()` call in Genkit runs a **tool loop**: the model produces output, any requested tools execute, the results feed back into a new model call, and the cycle repeats until the model is done. Middleware hooks attach at three layers of this loop:
| Hook | When it runs | Typical use |
| --- | --- | --- |
| Generate | Once per tool-loop iteration | Context injection, message rewriting, conversation-level logic |
| Model | Once per model API call | Retry, fallback, caching, latency logging |
| Tool | Once per tool execution | Human-in-the-loop, sandboxing, per-tool logging |
## **Pre-built middleware**
Genkit offers several pre-built middleware solutions for common use-cases. Here's what's available today:
### **1. Retry**
Automatically retries failed model API calls on transient errors (`RESOURCE_EXHAUSTED, UNAVAILABLE`, etc.) using exponential backoff with jitter. Only the model call is retried; the surrounding tool loop is not replayed.
```
resp, err := genkit.Generate(ctx, g,
    ai.WithModelName("googleai/gemini-flash-latest"),
    ai.WithPrompt("Summarize the quarterly earnings report."),
    ai.WithUse(&middleware.Retry{
        MaxRetries:     3,
        InitialDelayMs: 1000,
        BackoffFactor:  2,
    }),
)
```
Go
Copied
### **2. Fallback**
Switches to an alternative model when the primary model fails on a specified set of error codes. Useful for falling back to a completely different provider when your primary model exceeds its quota.
```
resp, err := genkit.Generate(ctx, g,
    ai.WithModelName("googleai/gemini-flash-latest"),
    ai.WithPrompt("Analyze this complex document..."),
    ai.WithUse(&middleware.Fallback{
        Models: []ai.ModelRef{
            anthropic.ModelRef("claude-sonnet-4-6", nil), // fall back to Claude
        },
        Statuses: []core.StatusName{core.RESOURCE_EXHAUSTED},
    }),
)
```
Go
Copied
### **3. Tool approval**
Restricts tool execution to an allow-list. Any tool not on the list triggers an interrupt, enabling human-in-the-loop confirmation before the action proceeds.
```
resp, _ := genkit.Generate(ctx, g,
    ai.WithPrompt("Delete the temp files"),
    ai.WithTools(deleteFilesTool),
    ai.WithUse(&middleware.ToolApproval{
        AllowedTools: []string{}, // empty = every tool call interrupts
    }),
)
if len(resp.Interrupts()) > 0 {
    interrupt := resp.Interrupts()[0]
    // Prompt the user for approval, then resume with the approval flag.
    approved, _ := deleteFilesTool.RestartWith(interrupt,
        ai.WithResumedMetadata[DeleteInput](map[string]any{"toolApproved": true}),
    )
    resp, err := genkit.Generate(ctx, g,
        ai.WithMessages(resp.History()...),
        ai.WithTools(deleteFilesTool),
        ai.WithToolRestarts(approved),
        ai.WithUse(&middleware.ToolApproval{}),
    )
    fmt.Println(resp.Text())
}
```
Go
Copied
### **4. Skills**
Scans a directory for `SKILL.md` files and injects their content into the system prompt. Also exposes a `use_skill` tool so the model can load specific skills on demand.
```
resp, err := genkit.Generate(ctx, g,
    ai.WithPrompt("How do I deploy this service?"),
    ai.WithUse(&middleware.Skills{SkillPaths: []string{"./skills"}}),
)
```
Go
Copied
### **5. Filesystem**
Gives the model scoped access to the local filesystem through injected tools (`list_files`, `read_file`, `plus write_file` and `edit_file` when writes are enabled). Path safety is enforced so the model can never escape the root directory.
```
resp, err := genkit.Generate(ctx, g,
    ai.WithPrompt("Create a hello world program in the workspace"),
    ai.WithUse(&middleware.Filesystem{
        RootDir:          "./workspace",
        AllowWriteAccess: true,
    }),
)
```
Go
Copied
## **Building custom middleware**
The pre-built middleware covers common scenarios, but the real power of the system is in writing your own. Imagine you're building an agentic customer-support app and need to ensure the model never mentions competitor products or internal pricing data. Rather than encoding these rules in every prompt, you can enforce them deterministically with middleware.
Custom middleware follows a simple contract across all languages: provide a name and a factory function that returns the hooks you want. The factory is called once per `generate()` invocation, and you implement only the hooks you need.
Here's a complete, custom content filter in ~20 lines of code:
```
// ContentFilter rejects model responses containing any forbidden term.
type ContentFilter struct {
    ForbiddenTerms []string `json:"forbiddenTerms"`
}
func (ContentFilter) Name() string { return "app/contentFilter" }
func (f ContentFilter) New(ctx context.Context) (*ai.Hooks, error) {
    return &ai.Hooks{
        WrapModel: func(ctx context.Context, p *ai.ModelParams, next ai.ModelNext) (*ai.ModelResponse, error) {
            resp, err := next(ctx, p)
            if err != nil {
                return nil, err
            }
            text := strings.ToLower(resp.Text())
            for _, term := range f.ForbiddenTerms {
                if strings.Contains(text, strings.ToLower(term)) {
                    return nil, fmt.Errorf("content filter: response contains %q", term)
                }
            }
            return resp, nil
        },
    }, nil
}
```
Go
Copied
You can even compose and stack different middleware solutions. Middleware stacks left-to-right, with the first listed being the outermost wrapper and so on:
```
resp, err := genkit.Generate(ctx, g,
    ai.WithModelName("googleai/gemini-flash-latest"),
    ai.WithPrompt("What CRM should our customer use?"),
    ai.WithUse(
        &middleware.Retry{MaxRetries: 3},           // outer: retries the inner stack
        &ContentFilter{                              // inner: validates model output
            ForbiddenTerms: []string{"CompetitorCRM", "RivalCo", "internal price"},
        },
    ),
)
```
Go
Copied
Here `Retry` wraps `ContentFilter`, which wraps the model call. Order matters, and Genkit makes it explicit.
If you think you’ve built a middleware that will be valuable to other developers, you can publish it as a package for others to benefit from!
## **The Developer UI experience**
You can use the Genkit [Developer UI](https://genkit.dev/docs/go/devtools/) to inspect, test, and debug your application, including middleware execution. When you register middleware, it becomes visible in the Dev UI: you can inspect its configuration, trace execution through each hook layer, and test different combinations.
![Video 3](https://storage.googleapis.com/gweb-developer-goog-blog-assets/original_videos/middleware.mp4)
## **Get started**
We’re excited for the capabilities that Genkit middleware unlocks for your apps, and we’re looking forward to seeing what custom middleware you’ll build to solve for your use-cases. Check out the [middleware documentation](https://genkit.dev/docs/go/middleware/) to dive deeper, or [get started with Genkit](https://genkit.dev/docs/go/get-started/) if you're new to the framework.
Have an idea for a new pre-built middleware? [File an issue](https://github.com/genkit-ai/genkit/issues). We'd love to hear what would improve your development experience!
Happy coding! 🚀
[](https://developers.googleblog.com/announcing-genkit-middleware-intercept-extend-and-harden-your-agentic-apps/)
Previous
Next
[](https://developers.googleblog.com/build-long-running-ai-agents-that-pause-resume-and-never-lose-context-with-adk/)