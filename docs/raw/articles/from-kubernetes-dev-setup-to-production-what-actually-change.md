---

title: "From Kubernetes Dev Setup to Production: What Actually Changes"
type: raw
tags: [newsletter]
source: newsletter
source_url: https://georg-schwarz.com/blog/from-kubernetes-demo-to-production-platform/
sha256: 97d73c3cd325
created: 2026-05-19
updated: 2026-05-19
review_value: 9
review_confidence: 9

---
Published Time: 2026-05-08T00:00:00.000Z
Markdown Content:
![Image 1: From Kubernetes Dev Setup to Production: What Actually Changes](https://georg-schwarz.com/blog/diff-docs-landingpage-hero.webp)
May 8, 2026
The application already ran on Kubernetes. But that did not make it production-ready.
The starting point was a development-style setup: local minikube deployment, local certificates, `*.127.0.0.1.nip.io` domains, generated credentials, bundled development dependencies, and manual Helm sequencing.
Moving towards a production deployment changed the operating model. Delivery moved to GitOps, secrets moved to SOPS, object storage moved outside the cluster, database backups became restore-tested, identity flows were customized, and observability gave us a baseline for operating the application.
This article is not about how to deploy an app to Kubernetes. It walks through what had to change after it already ran there.
**This post is for:** Founders, CTOs, platform engineers, and product teams who already have an application running on Kubernetes but need to make it reliable, repeatable, observable, and safe to operate.
* * *
## TL;DR
*   Running on Kubernetes is not the same as being production-ready.
*   The work followed a deliberate order: make the building blocks work, make the product usable, make change controlled, then make operations recoverable and observable.
*   Most production-readiness work was integration focused: identity, storage, ingress, secrets, GitOps, backups, and user-facing flows had to line up.
*   GitOps improved deployment control, but also contributed to a better repository structure and streamlined validation checks.
*   Backups became particularly meaningful after restore checks were automated. Until then, they were mostly optimism with YAML.
## Building something similar?
I work with teams on exactly this kind of transition: from working deployments to systems they can safely run, observe, recover, and evolve.
[Let’s talk.](https://cal.eu/georg-schwarz/infrastructure-strategy-call)
## Context
Over the past few weeks, we took [diff/docs](https://docs.diffforge.com/), a hosted deployment of [La Suite Numerique Docs](https://github.com/suitenumerique/docs), from a development-style Kubernetes setup to something that behaves more like a production platform. Operating an application is more than “it deploys”. We aimed for repeatable delivery, guarded change management, recovery paths, monitoring, and policy controls.
If you want to know more about [diff/docs](https://docs.diffforge.com/), check out [Philip’s announcement post](https://www.heltweg.org/posts/hosting-an-open-alternative-to-google-docs-for-digital-sovereignty/).
## The Starting Point
The starting point already worked for its intended purpose: development.
[La Suite Numerique Docs](https://github.com/suitenumerique/docs) already provides a [Kubernetes installation guide](https://github.com/suitenumerique/docs/blob/main/docs/installation/kubernetes.md). It is a useful teaching setup: start a local minikube deployment, generate local `mkcert` certificates, use `*.127.0.0.1.nip.io` domains, install nginx ingress, and deploy development dependencies for Keycloak, MinIO, PostgreSQL, and Redis through the provided `helm-dev-backend` chart.
The upstream documentation is clear about the intent: this setup is meant to explain how the system works and needs to be adapted for production.
For [diff/docs](https://docs.diffforge.com/) that meant we started with a documented product architecture and a development-oriented Kubernetes deployment. The task was to turn that baseline into an externally hosted product.
Local certificates, local domains, generated development credentials, dependency containers, and manual Helm sequencing are fine for learning and testing. But they are not enough for a service that needs stable domains, real identity flows, persistent storage, repeatable delivery, backup/restore paths, policy checks, observability, and day-2 operations.
The work focused on closing the gap between “the app runs locally” and “the team can safely change, recover, observe, and evolve the system.”
## Understand The Runtime Architecture
Before touching deployment mechanics, we had to be clear about what diff/docs actually was in runtime terms.
The product was more than a single stateless web container. It was an application surface with several components all working together.
At a high level, the architecture looked like this:
![Image 2: Runtime architecture of diff/docs with application, identity, database, cache, object storage, ingress, GitOps, and observability components](https://georg-schwarz.com/blog/diff-docs-architecture.webp)
*   **La Suite Numerique Docs application** as the primary user-facing service, split into multiple deployments
*   **PostgreSQL** for transactional data and application state
*   **Redis** for cache and real-time/session support
*   **S3-compatible object storage** for uploaded media and binary assets
*   **OIDC identity provider** for login and token flows
*   **Ingress/gateway layer** for TLS termination, host/path routing, and redirects
Not required by the application itself, but necessary for operating it as a product:
*   **GitOps controller** for converging the cluster toward the desired state in Git
*   **Observability stack** for metrics, dashboards, and alerting
At this point, we were mostly identifying interfaces and capabilities, not final implementations.
The product needed a PostgreSQL-compatible database, Redis-compatible cache, S3-compatible object storage, OIDC identity, HTTP routing, deployment reconciliation, and observability. Which operator, chart, or implementation should provide each capability was a separate decision.
That separation helped. We could first agree on the contracts the product needed, then pick components that fit those contracts and the way we wanted to operate the system.
## The Timeline
The order below is not meant as a universal checklist. It is the order we chose for this project because the system first needed to become usable before it could become governable.
Broadly, the work moved through four stages:
1.   Make the building blocks work.
2.   Make the product work end-to-end.
3.   Move change control into Git and restructure environments around reconciliation.
4.   Make operations observable, recoverable, and sustainable.
That sequencing mattered. Adding GitOps or policy too early would not have fixed broken login flows, media paths, or migration permissions. But once the product worked end-to-end, continuing with manual deployment and implicit operator knowledge would have created a different kind of risk.
This is a common pattern in platform projects. The right next step depends on the dominant risk at that point in time. Early on, the dominant risk was integration failure. Later, it became uncontrolled change. After that, it became operational confidence.
## Capability 1: Make Infrastructure Repeatable
The first stage was intentionally unglamorous: replace or harden the development-style building blocks one by one.
The development setup proved which dependencies the product needed. The production baseline had to decide how each dependency should be operated.
The main building blocks were:
*   Ingress via [Envoy Gateway](https://gateway.envoyproxy.io/) and [Gateway API](https://gateway-api.sigs.k8s.io/)
*   TLS and certificate lifecycle via [cert-manager](https://cert-manager.io/)
*   Database via [CloudNativePG](https://cloudnative-pg.io/)
*   Cache via the [OT-CONTAINER-KIT Redis Operator](https://github.com/OT-CONTAINER-KIT/redis-operator)
*   S3-compatible object storage, initially via the [Garage Operator chart](https://github.com/rajsinghtech/charts/pkgs/container/charts%2Fgarage-operator) for a product-like development setup
*   Identity via the [Keycloak Operator manifests](https://www.keycloak.org/operator/installation#_installing_by_using_kubectl_without_operator_lifecycle_manager) vendored in a local wrapper chart
At this point, each dependency needed to become installable, reconcilable, upgradeable, and understandable in a repeatable way. The final production architecture could still evolve.
Object storage is a good example. Garage was useful because it made the S3-compatible interface available in the improved development setup. The later production choice could still be different as long as the application contract stayed stable.
This stage is easy to underestimate because it does not look impressive in a demo. But production maturity starts with boring installs and understanding how operators behave. If the database operator, gateway controller, object store, and identity provider cannot be installed repeatedly, the application sitting on top of them inherits that uncertainty.
## Capability 2: Integrate The Product End-To-End
Once the components existed, we wired the Docs application into them and immediately hit reality. Since we deviated from the development setup, we faced some integration challenges that we had to overcome:
*   migration permissions were not right
*   default account creation needed explicit handling
*   media upload and serving paths broke at the edge
*   OIDC login and logout flows needed corrections
*   real-time collaboration had to be enabled and stabilized
This was the “getting it to actually work” chapter. Successful component installation was only the baseline. The real test was product flow: users signing in, creating content, uploading media, and using the product through the external routes they would see in practice.
The important detail is that most problems appeared at the seams between components. PostgreSQL worked. Object storage worked. The gateway worked. Keycloak worked. The product still needed integration fixes before it behaved correctly.
For example, media handling is rarely just “upload file to S3”. It also involves URL generation, gateway paths, authorization behavior, public/private object decisions, content-type handling, and how the frontend renders stored assets after the upload succeeds.
## Capability 3: Move Delivery To GitOps
After the product worked end-to-end, the next risk was no longer basic functionality. It was change control.
The largest architectural shift was moving from manual or script-heavy deployment to Flux-managed reconciliation. Git became the deployment API, and operational work started to align around desired state rather than imperative install sequences.
The goal we set for ourselves:
*   Git becomes the deployment API.
*   [Flux](https://fluxcd.io/) reconciles desired state into the cluster.
*   [SOPS](https://github.com/getsops/sops) keeps secrets encrypted alongside environment configuration.
*   Runbooks shift to reconciliation workflows instead of imperative install steps.
*   Chart and release boundaries are reshaped to match Flux reconciliation behavior.
*   Environment changes become reviewable and auditable before they reach the cluster.
![Image 3: Comparison of manual deployment commands and GitOps reconciliation with Flux](https://georg-schwarz.com/blog/diff-docs-manual-deployment-vs-gitops.webp)
The path there was iterative. Some bootstrap and sync changes were added, reverted, and reapplied before the structure settled. That is normal. GitOps did not arrive in one commit. It changed repo layout, release boundaries, branching habits, secret handling, and day-to-day operations.
In practice this meant we moved from running a sequence of commands to committing and pushing a change and letting the controller converge. That also changed the operational questions. Instead of asking which command was run last, we could inspect the source of truth, reconciliation status, suspended resources, drift, and controller conditions.
Some production infrastructure decisions also settled around this shift. Object storage is one example: production moved to Hetzner managed S3, provisioned through Terraform, while the application continued to depend on the same S3-compatible interface. That kept object storage outside the cluster in production without changing the application contract.
## Capability 4: Restructure The Repository For Environments
Introducing Flux made the repository structure more important.
Once the controller reconciles what is in Git, the repository is no longer only documentation or deployment input. It becomes part of how the system is operated. That made some earlier shortcuts visible: manifests that had grown around the first working setup, repeated edge configuration, unclear environment boundaries, and too much coupling between application and infrastructure concerns.
This iteration reduced technical debt in the deployment model instead of adding product features. We moved toward:
*   shared base definitions for common application, edge, and operator wiring
*   environment overlays for differences between deployments
*   Flux `Kustomization` boundaries that reflected deployable units
*   cleaner separation between application concerns and infrastructure concerns
*   clearer runbooks for bootstrap and operation
The value came from making future changes smaller, easier to review, and less dependent on remembering how the first working deployment happened.
At this point, Git described the desired state and the repository had clearer environment boundaries. The next problem was reducing the chance that bad desired state would be accepted in the first place.
## Capability 5: Add Validation And Policy Guardrails
Once Flux was in place, we focused on reducing operational risk before increasing change velocity. The guardrails included:
*   CI validation for YAML, Helm, and baseline correctness
*   pre-commit checks to catch drift earlier
*   policy checks with [Kyverno](https://kyverno.io/)
*   stricter versioning and release discipline
This phase matters because GitOps without validation just gives you fast, automated mistakes. The controller will faithfully reconcile broken intent if broken intent is what you put into Git.
Preventing all possible errors would be unrealistic. We focused on catching cheap, mechanical, and policy-relevant errors before they reached reconciliation.
The important boundary was between validation before reconciliation and feedback after reconciliation.
CI and pre-commit checks could catch malformed YAML, broken Helm rendering, obvious repository mistakes, and policy violations. They could not prove that the product still behaved correctly after the cluster converged.
That gave us a practical split:
| Stage | What it answered |
| --- | --- |
| Pre-commit | Does the change pass local formatting and consistency checks? |
| CI validation | Do YAML, Helm, and policy checks pass before merge? |
| Flux reconciliation | Did the cluster accept and apply the desired state? |
| Runtime observation | Does the deployed system behave as expected? |
CI did not need to cover everything to be useful. It caught cheap mistakes early and left runtime questions to the mechanisms that can actually observe runtime behavior.
Once delivery was controlled through Git and guarded by validation, the focus shifted from deploying safely to operating safely. That meant proving we could recover from failure and see what the system was doing.
## Capability 6: Verify Backup And Restore
Production means assuming failure is inevitable.
We added database backup integration and restore-check automation. A daily cron job restores the database into a separate container and runs sanity checks against the restored data.
![Image 4: Successful CloudNativePG restore check job showing a completed database restore validation](https://georg-schwarz.com/blog/diff-docs-cnpg-restore-job.webp)
The job also acts as living documentation for the restore path. Instead of a runbook that slowly drifts away from reality, the restore procedure exists as executable operational knowledge.
That changed the backup posture from “configured” to “continuously exercised.” A backup configuration can exist for months without anyone knowing whether restore works, whether credentials are correct, whether retention behaves as expected, or whether the restored database contains the data the application actually needs.
The restore check answered the questions we cared about most:
1.   Can we restore into a clean target?
2.   Can the restored database start correctly?
3.   Does the expected application data exist?
4.   Is the restore path exercised regularly enough to catch breakage?
5.   Does the documented procedure still match the executable restore path?
A backup that has never been restored is still an assumption. Restore checks turn that assumption into evidence.
## Capability 7: Build Useful Observability
In parallel with recovery work, observability matured from having dashboards toward understanding the system when something changes. The baseline included:
*   Prometheus and Grafana
*   targeted dashboards for Flux, database, identity, ingress, and cache
*   synthetic availability checks against the public endpoint every few seconds
*   alert tuning to reduce noise and improve actionability
![Image 5: Grafana dashboard showing Flux reconciliation health and controller status for diff/docs](https://georg-schwarz.com/blog/diff-docs-grafana-flux.webp)
Grafana alone was not the milestone. Dashboards are cheap to create and expensive to trust if nobody knows what they mean.
The synthetic checks were deliberately simple. They answered one basic external question: can the product be reached right now through the path users actually take? That is still far from a complete observability model, but it is a useful first external signal.
![Image 6: Grafana dashboard showing synthetic availability checks for the diff/docs public endpoint](https://georg-schwarz.com/blog/diff-docs-grafana-synthetic.webp)
Our observability approach answers the following operational questions:
*   Is reconciliation healthy?
*   Is the public endpoint reachable from outside the cluster?
*   Is the database accepting connections and staying within resource limits?
*   Are login flows failing?
*   Is ingress returning unexpected status codes?
*   Are Redis/cache issues affecting user-visible behavior?
*   Which alert requires action, and which one is just noise wearing a serious hat?
The last question matters more than most teams admit. Alert fatigue is not a people problem first; it is usually an instrumentation and ownership problem.
## Capability 8: Polish User-Facing Operational Flows
By the final stretch, the work looked less like infrastructure bring-up and more like product operations. That included:
*   consistent hostnames and domain moves
*   landing page and auth redirect behavior
*   branding and UI polish
*   custom images for selected deployments, including Keycloak customization
*   steady dependency and chart upgrades
This is often misunderstood as “just polish.” It is integration work across identity, edge routing, releases, and user experience.
![Image 7: Customized Keycloak login screen for diff/docs](https://georg-schwarz.com/blog/diff-docs-keycloak-customized.webp)
![Image 8: Customized diff/docs application interface with project branding](https://georg-schwarz.com/blog/diff-docs-docsapp-customized.webp)
Users do not experience your platform through your architecture diagram. They experience it through whether links work, redirects make sense, login behaves consistently, uploads render correctly, and maintenance does not randomly invalidate their workflow.
That is also why this stage is valuable in a reference project. It shows that production readiness is not only cluster internals. A platform can be technically sophisticated and still feel broken if the user-facing flows are inconsistent.
## Development Setup Vs Production Baseline
Looking back, the work can be summarized as a shift across several dimensions.
| Area | Development-style setup | Production-ready baseline |
| --- | --- | --- |
| Deployment | Manual or script-heavy | GitOps reconciliation through Flux |
| Repository | Encodes setup history | Flux `Kustomization` boundaries, shared bases, and environment overlays |
| Secrets | Local/generated development values | Environment-scoped secrets encrypted with SOPS |
| Database | Installed and reachable | Backed up and restored daily through an automated check |
| Ingress | Local `*.127.0.0.1.nip.io` routes work | Stable domains, TLS, redirects, and edge behavior are verified |
| Identity | Development Keycloak works | Customized Keycloak with tested login, logout, redirects, and token flows |
| Object storage | Local S3-compatible dependency | Hetzner managed S3 via Terraform, with media paths verified |
| Change control | Operator knowledge and command sequencing | Git as deployment API, with PR review, CI, policy, and reconciliation status |
| Observability | Mostly internal component visibility | Dashboards, alerts, and synthetic checks answer operational questions |
| Operations | Maintainer-dependent procedures | Runbooks plus executable checks for recurring operations |
None of these changes are especially exotic on their own. The value comes from making them work together.
## What Still Comes After Baseline Production
What we built was a strong baseline. Living through day-2 operations means turning that baseline into repeated operational practice.
The next steps are less about adding components and more about exercising the system:
*   run failure drills regularly, such as database restore, identity outage, expired certificates, and bad rollouts
*   run structured load and soak tests, then feed findings back into capacity limits, autoscaling, and architecture decisions
*   define and track service-level objectives for availability, latency, and recovery time
*   document incident response paths so failures have clear investigation and recovery steps
*   tighten upgrade policy into a calendarized release train with canary or staged rollout gates where useful
*   continuously prune alert noise and measure mean time to detect and recover
In other words: Production is not a state you reach once. It is a habit of repeatedly testing, operating, and improving the system.
## Closing
The path from a Kubernetes development setup to a production platform was not a single migration. It was a sequence of capability upgrades: installability, integratability, operability, controllability, recoverability, observability, and product cohesion.
If you are currently at “it runs on my cluster”, you are not behind. You are at the start of the real work.
That work is worth doing because the reward is not just uptime. It is confidence: confidence that changes are safe, incidents are recoverable, and the platform can evolve without every improvement turning into a small adventure.
This is also the kind of work I do as a freelance engineer and consultant: helping teams turn working systems into systems they can safely operate and evolve.
## Building something similar?
I work with teams on exactly this kind of transition: from working deployments to systems they can safely run, observe, recover, and evolve.
[Let’s talk.](https://cal.eu/georg-schwarz/infrastructure-strategy-call)