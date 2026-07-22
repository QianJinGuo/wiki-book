sha256: 5ecd5f4232e44ae02b382b71b1c4b8050e38179ebad5cc2bf4f50fe92fc3dd25
---
title: "Two days, one engineer, zero guesswork: Simplifying a complex modernization with IBM Bob"
source_url: "https://www.ibm.com/new/product-blog/novacomp-simplifying-a-complex-modernization-with-ibm-bob"
type: article
created: 2026-06-30
ingested: 2026-06-30
---

# Two days, one engineer, zero guesswork: Simplifying a complex modernization with IBM Bob


Markdown Content:
_Editor’s Note: IBM Bob is generally available. This post is part of a short series of technical customer stories that dive into how IBM’s AI development assistant helped modernize legacy codebases, create new documentation, ensure compliance and suggest critical security updates._

In Fall 2025, IT consultancy [Novacomp](https://crnova.com/en/home/) took on a challenging upgrade for its internal operations: modernize a business-critical Java REST API without disrupting existing business logic. It’s the kind of project that would take a three- to five-person Novacomp team a couple months to complete: hunting down outdated dependencies, manually performing complex upgrades—all while managing security exposure and preserving all the behaviors and underlying contracts.

As an IBM partner, Novacomp was part of the preview for [IBM Bob](https://www.ibm.com/products/bob), IBM’s AI-based integrated development environment (IDE). The firm decided to audition IBM Bob as part of their internal modernization effort.

The results were impressive. By using IBM Bob, a Senior Solution Architect and 2026 IBM Champion (Novacomp’s Jorge De Trinidad) completed the complex upgrade in two days. The result was roughly 98% faster than would normally be required with a bigger team. Novacomp reports that IBM Bob is far more than a code generator. It provides contextual, detailed codebase analysis, proactively suggests structural improvements and upgrades and even lays out roadmaps for future upgrade options.

In this post, we’ll dig into the core use case, the details of the architecture that IBM Bob modernized and the benefits IBM Bob provided to Novacomp and its client.

The core use case for this Novacomp client project was a structural upgrade: replatforming a layered logical monolith to enable a cloud-native, microservices architecture. The applications consist of enterprise REST APIs written with older versions of Java and legacy dependency trees that were increasingly costly to maintain and challenging to secure.

The API’s consumers were engineering teams in IT infrastructure contexts, including teams working around a change data capture (CDC) environment. This tool monitors replications of IBM technology and exposes APIs used by internal stakeholders.

As these were business-critical APIs, the Novacomp team faced the challenge of strict functional preservation. They needed to keep the business logic and API contracts stable while upgrading the architecture.

Before modernization, the reference architecture was a layered Java service: REST controllers, a service layer and Java persistence API (JPA) repositories backed by a relational database with dependency management handled through Maven or Gradle (see the diagram presented ahead).

![Image 1: Diagram displaying Novacomp’s modernization project process using IBM Bob](https://assets.ibm.com/is/image/ibm/novacompbobarch?fmt=png-alpha&dpr=on%2C1&wid=320&hei=180)

As a foundational driver of the modernization, IBM Bob was more than a code generator; it was a repository-aware assistant embedded in an engineering validation loop. Bob’s recommendations needed to be contextually aware of the existing codebase, have high explainability for its technical recommendations and provide opportunities for engineers to validate and refine them.

In essence, IBM Bob needed to act as a “cognitive amplifier” rather than a replacement for developer decisions. For example, during the upgrade of Java and Spring Boot versions, IBM Bob reviewed code structure, configuration and dependencies to propose incremental changes grounded in the code.

It identified and explained deprecated annotations, potential breaking changes between framework versions, and offered a full dependency analysis before upgrading. While Bob continuously validated changes with clean builds and dependency conflict resolution, it included humans in the loop by stopping for architectural review. Its traceable change documentation acted as acceptance criteria before engineers approved merging of changes.

After modernization, the architecture was still layered but became structurally cleaner and more future-ready: upgraded Java (Java 17 to Java 21 LTS), modern [Spring Boot](https://www.ibm.com/think/topics/java-spring-boot), a consolidated and validated dependency tree and refactored configurations aligned with current cloud-native practices. Deprecated annotations and legacy patterns were removed, vulnerable libraries were eliminated and the architecture was better aligned with modern deployment models and compatible with containerization.

IBM Bob’s value in this scenario showed up in four practical ways:

*   **Modernization guidance relevant to the codebase.** IBM Bob recommended upgrades not only for Java but also for other tools commonly used in the Java system, including Maven, Gradle and Spring Boot.
*   **Impact analysis without weeks of manual archaeology.** The workflow shifted from trial-and-error upgrades to a more governed process that surfaces breaking changes, transitive dependency interactions and subtle configuration shifts earlier.
*   **Documentation and test modernization as part of the change.** The modernization effort included generating updated documentation and renewing test cases to match the upgraded stack.
*   **Risk reduction that engineers can defend.** Even when CVE counts were not the headline, the migration itself carried risk, especially around framework changes and dependency alignment. IBM Bob reduced that risk by making changes more systematic and reviewable.

Several outcomes from this modernization project matter for engineering leaders, as they map directly to cost, risk and delivery predictability:

*   **Faster modernization cycles with fewer surprises.** Turning “months” into “days” changes how upgrades can be scheduled and governed, especially when the alternative is long-running work that blocks teams and inflates coordination costs.
*   **Lower operational risk during migration.** The chance that manual upgrades introduced regressions or downstream security and stability issues in production was greatly reduced.
*   **Better developer experience through structure and documentation.** Legacy systems often outlive the teams that built them. The modernization workflow generated clear documentation and a record of incremental, atomic changes, which supports a workflow that balances rapid evolution with risk mitigation.
*   **Concrete, real-world catches.** One example surfaced during analysis was a variable that didn’t perform its intended job—the kind of subtle issue that can persist for years because it hides inside “working” code.
*   **More holistic coverage.** Many AI coding agents can write code but lack the essential context for modernization. However, IBM Bob has awareness of dependencies, configurations, tests and downstream impacts.

IBM Bob also provided Novacomp with a set of recommendations on how to approach various routes to upgrade from old versions to new ones (microservices versus a more “traditional” method, for example). This approach enabled the creation of a transformational roadmap, with IBM Bob as a guide that justifies its recommendations.

A significant impact for Novacomp beyond IBM Bob’s role in this particular refactor project was the discovery of a repeatable modernization method. IBM Bob enables the use of AI to illuminate dependency and configuration realities early, keep humans in control of architectural decisions and treat documentation, testing and governance as outputs, not afterthoughts.

That repeatability is what makes the approach scalable for a consultancy model. The same workflow can be applied as preventive assessment before major upgrades, as part of pull request review to prevent breaking changes and technical debt accumulation earlier in the development process.

It also supports different delivery motions. It can cover “software factory” delivery where the work is done within a controlled environment and staff augmentation where clients adopt licenses so joint teams can collaborate with consistent tools and governance.

By building on IBM Bob as an AI-first modernization layer, Novacomp turned a complex high-risk Java and Spring Boot upgrade into a governed, repeatable engineering practice. This practice helps reduce migration risk, improves maintainability and makes it easier for teams to evolve critical services without rebuilding the foundation each time.

[Explore a free trial to see how developers build quality code faster](https://bob.ibm.com/trial)

[Register for the webinar](https://www.ibm.com/forms/mkt-webinar-5acdb)[](https://www.ibm.com/forms/mkt-webinar-5acdb)

Franz Peter Kroll

Country Manager, Novacomp Mexico

[Chad Jennings](https://www.ibm.com/think/author/chad-jennings.html)

Global Head of Customer Voice and Product Experience

IBM

