---
created: '2026-06-07'
feed_name: Netflix Tech Blog
ingested: '2026-06-07'
review_confidence: 8
review_recommendation: strong
review_value: 8
sha256: 3858a59f65f848bf7b4f5b38cc391ef9b4622a8616e01b0938fa53aa644e0cdc
source: rss
source_url: https://netflixtechblog.com/scaling-camera-file-processing-at-netflix-6dab2b1e80be?source=rss----2615bd06b42e---4
tags:
- article
title: Scaling Camera File Processing at Netflix
type: source
updated: '2026-06-07'
---

# Scaling Camera File Processing at Netflix

_Orchestrating Media Workflows Through Strategic Collaboration_

Authors: [Eric Reinecke](<https://www.linkedin.com/in/ericreinecke/>), [Bhanu Srikanth](<https://www.linkedin.com/in/bhanusrikanth/>)

### Introduction to Content Hub’s Media Production Suite

At Netflix, we want to provide filmmakers with the tools they need to produce content at a global scale, with quick turnaround and choice from an extraordinary variety of cameras, formats, workflows, and collaborators. Every series or film arrives with its own creative ambitions and technical requirements. To reduce friction and keep productions moving smoothly, we built [Netflix’s Media Production Suite (MPS)](<https://netflixtechblog.com/globalizing-productions-with-netflixs-media-production-suite-fc3c108c0a22>) with the goal of automating repeatable tasks, standardizing key workflows, and giving productions more time to focus on creative collaboration and craftsmanship.

A critical part of this effort is how we handle image processing and camera metadata across the hundreds of hours and terabytes of camera footage that Netflix productions ingest on a daily basis. Rather than build every component from scratch, we chose to partner where it made sense–especially in areas where the industry already had trusted, battle-tested solutions.

This article explores how Netflix’s Media Production Suite integrates with FilmLight’s API (FLAPI) as the core studio media processing engine in Netflix’s cloud compute infrastructure, and how that collaboration helps us deliver smarter, more reliable workflows at scale.

### Why We Built MPS

As Netflix’s production slate grew, so did the complexity of file-based workflows. We saw recurring challenges across productions:

  * File wrangling sapping time from creative decision-making
  * Inconsistent media handling across shows, regions, or vendors
  * Difficult to audit manual processes that are prone to human error
  * Duplication of effort as teams reinvented similar workflows for each production



Content Hub Media Production Suite was created to address these pain points. MPS is designed to:

  * Bring efficiency, consistency, and quality control to global productions
  * Streamline media management and movement from production through post-production
  * Reduce time spent on non-creative file management
  * Minimize human error while maximizing creative time



To achieve this, MPS needed a robust, flexible, and trusted way to handle camera-original media and metadata at scale.

### The Right Tool for the Job

From the start, we knew that building a world-class image processing engine in-house is a significant, long-term commitment: one that would require deep, continuous collaboration with camera manufacturers and the wider industry.

When designing the system, we set out some core requirements:

  * **Inspect, trim, and transcode original camera files and metadata** for any Netflix production with trusted color science
  * **Support a wide variety of cameras and recording formats** used worldwide while staying current as new ones are released
  * **Run well in our paved-path encoding infrastructure,** enabling us to take advantage of proven compute and storage scalability with robust observability



FilmLight develops Baselight and Daylight, which are commonly used in the industry for color grading, dailies, and transcoding. Their FilmLight API (FLAPI) allows us to use that same media processing engine as a backend API.

Rather than duplicating that work, we chose to integrate. FilmLight became a trusted technology partner, and FLAPI is now a foundational part of how MPS processes media.

### The Media Processing Engine

MPS is not a single application; it’s an ecosystem of tools and services that support Netflix productions globally. Within that ecosystem, the FilmLight API plays the following key roles.

  1. Parsing camera metadata on ingest



Productions upload media to Netflix’s **Content Hub** with [ASC MHL](<https://theasc.com/society/ascmitc/asc-media-hash-list>) (Media Hash List) files to ensure completeness and integrity of initial ingest, but soon after, it’s important to understand the technical characteristics of each piece of media. We call this workflow phase “inspection.”

Footage ingested with MPS is inspected using FLAPI and all metadata is indexed and stored

At this stage, we:

  * Use FLAPI to gather **camera metadata** from the original camera files
  * Conform the workflow critical fields to **Netflix’s normalized schema**
  * Make it **searchable and reusable** for downstream processes



This metadata is integral to:

  * Matching footage based on timing and reel name for automated retrieval
  * Debugging (e.g., why a shot looks a certain way after processing)
  * Validations and checks across the pipeline



FLAPI provides consistent, camera-aware insight into footage that may have originated anywhere in the world. Additionally, since we’re able to package FLAPI in a Docker image, we can deploy almost identical code to both cloud and our production compute and storage centers around the world, ensuring a consistent assessment of footage wherever it may exist.

2\. Generating VFX plates and other deliverables

Visual effects workflows constantly push image processing pipelines to their absolute limits. For MPS to succeed, it must generate images with **accurate** framing, **consistent** color management, and **correct** debayering/decoding parameters — all while maintaining rapid turnaround times.

To achieve this, we leverage Netflix’s [Cosmos](<https://netflixtechblog.com/the-netflix-cosmos-platform-35c14d9351ad>) compute and storage platform and use open standards to provide predictable and consistent creative control.

At this phase, we use the FilmLight API to:

  * **Debayer** original camera files with the correct format-specific decoding parameters
  * Crop and de-squeeze images using **Framing Decision Lists (ASC FDL)** to ensure spatial creative decisions are preserved
  * **Apply ACES Metadata Files (AMF),** providing repeatable color pipelines from dailies through finishing
  * Generate **an array of media deliverables** in varied formats



These processes are automated, repeatable, and auditable. We deliver AMFs alongside the OpenEXRs to ensure recipients know exactly what color transforms are already applied, and which need to be applied to match dailies.

Because we use FilmLight’s tools on the backend, our workflow specialists can use Baselight on their workstations to manually validate pipeline decisions for productions before the first day of principal photography.

### The Media Processing Factory in the Cloud

Finding an engine that competently processes media in line with open standards is an important part of the equation. To maximize impact, we want to make these tools available to all of the filmmakers we work with. Luckily, we’re no strangers to scaled processing at Netflix, and our [Cosmos compute platform](<https://netflixtechblog.com/the-netflix-cosmos-platform-35c14d9351ad>) was ready for the job!

#### Cloud-first integration

The traditional model for this kind of processing in filmmaking has been to invest in beefy computers with large GPUs and high-performance storage arrays to rip through debayering and encoding at breakneck speed. However, constraints in the cloud environment are different.

Factors that are essential for tools in our runtime environment include that they:

  * Are **packageable as Serverless Functions in Linux Docker images** that can be quickly invoked to run a single unit of work and shut down on completion
  * Can **run on CPU-only instances** to allow us to take advantage of a wide array of available compute
  * Support **headless invocation** via Java, Python, or CLI
  * **Operate statelessly,** so when things do go wrong, we can simply terminate and re-launch the worker



Operating within these constraints lets us focus on increasing throughput via parallel encoding rather than focusing on single-instance processing power. We can then target the sweet spot of the cost/performance efficiency curve while still hitting our target turnaround times.

When tools are API-driven, easily packaged in Linux containers, and don’t require a lot of external state management, Netflix can quickly integrate and deploy them with operational reliability. FilmLight API fit the bill for us. At Netflix, we leverage:

  * **Java** and **Python** as the primary integration languages
  * **Ubuntu-based Docker images** with Java and Python code to expose functionality to our workflows
  * **CPU instances in the cloud and local compute centers** for running inspection, rendering, and trimming jobs



While FLAPI also supports GPU rendering, CPU instances give us access to a much wider segment of Netflix’s vast encoding compute pool and free up GPU instances for other workloads.

To use FilmLight API, we bundle it in a package that can be easily installed via a Dockerfile. Then, we built Cosmos Stratum Functions that accept an input clip, output location, and varying parameters such as frame ranges and AMF or FDL files when debayering footage. These functions can be quickly invoked to process a single clip or sub-segment of a clip and shut down again to free up resources.

#### Elastic scaling for production workloads

Production workloads are inherently spiky:

  * A quiet day on set may mean minimal new footage to inspect.
  * A full VFX turnover or pulling trimmed OCF for finishing might require **thousands of parallel renders** in a short time window.



By deploying FLAPI in the cloud as functions, MPS can:

  * Allocate compute on demand and release it when our work queue dies down
  * Avoid tying capacity to a fixed pool of local hardware
  * Smooth demand across many types of encoding workload in a shared resource pool



This elasticity lets us swarm pull requests to get them through quickly, then immediately yield resources back to lower priority workloads. Even in peak production periods, we avoid the pain of manually managing render queues and prioritization by avoiding fixed resource allocation. All this means **lightning-fast** turnaround times and **less anxiety** around deadlines for our filmmakers.

### Designed for Seasoned Pros and Emerging Filmmakers

Netflix productions range from highly experienced teams with very specific workflows to newer teams who may be less familiar with potential pitfalls in complex file-based pipelines.

MPS is designed to support both:

  * Industry veterans who need to configure precise, bespoke workflows and trust that underlying image processing will respect those decisions.
  * Productions without a color scientist on staff — those who benefit from guardrails and sane defaults that help them avoid common workflow issues (e.g., mismatched color transforms, inconsistent debayering, or incomplete metadata handling).



The partnership with FilmLight lets Netflix focus on workflow design, orchestration, and production support, while FilmLight focuses on providing competent handling of a wide variety of camera formats with world-class image science!

### Collaboration and Co-Evolution

Netflix aimed to integrate MPS into a wider tool ecosystem by developing a comprehensive solution based on emerging open standards, rather than making MPS a self-contained system. Integrating FLAPI into our system requires more than an API reference–it requires ongoing partnership. FilmLight worked closely with Netflix teams to:

  * Align on **feature roadmaps** , particularly around new camera formats and open standards
  * Validate the **accuracy and performance** of key operations
  * Debug **edge cases** discovered in large-scale, real-world workloads
  * **Evolve the API** in ways that serve both Netflix and the wider industry
  * Create **a positive feedback cycle with open standards** like ACES and ASC FDL to solve for gaps when the rubber hits the road



One example of this has been with the implementation of [ACES 2](<https://draftdocs.acescentral.com/background/about-aces-2/>). FilmLight’s developers quickly provided a roadmap for support. As our engineering teams collaborated on integration, we also provided feedback to the ACES technical leadership to quickly address integration challenges and test drive updates in our pipeline.

This collaborative relationship–built on open communication, joint validation, and feedback to the greater industry–is how we routinely work with FilmLight to ensure we’re not just building something that works for our shows, but also driving a healthy tooling and standards ecosystem.

### Impact

While much of this work takes place behind the scenes, its impact is felt directly by our productions. Our goal with building MPS is for producers, post supervisors, and vendors to experience:

  * Fewer delays caused by missing, incomplete, or incorrect media
  * Faster turnaround on VFX plates and other technical deliverables
  * More predictable, consistent handoffs between editorial, color, and VFX
  * Less time spent troubleshooting technical issues, and more time focused on creative review



In practice, this often shows up as the absence of crisis: the time a VFX vendor doesn’t have to request a re-delivery, or the time editorial doesn’t have to wait for corrected plates, or the time the color facility doesn’t have to reinvent a tone-mapping path because the AMF and ACES pipeline are already in place.

### Looking Ahead

As camera technology, codecs, open standards, and production workflows continue to evolve, so will MPS. The guiding principles remain:

  * Automate what’s repeatable
  * Centralize what benefits from standardization
  * Partner where deep domain expertise already exists



The integration with FilmLight API is one example of this philosophy in action. By treating image processing as a specialized discipline and collaborating with a trusted industry partner, Netflix is delivering smarter, more reliable workflows to productions worldwide.

At its core, this partnership supports a simple goal: reduce manual workflow and tool management, giving filmmakers more time to tell stories.

### Acknowledgements

This project is the result of collaboration and iteration over many years. In addition to the authors, the following people have contributed to this work:

  * Matthew Donato
  * Prabh Nallani
  * Andy Schuler
  * Jesse Korosi



* * *

[Scaling Camera File Processing at Netflix](<https://netflixtechblog.com/scaling-camera-file-processing-at-netflix-6dab2b1e80be>) was originally published in [Netflix TechBlog](<https://netflixtechblog.com>) on Medium, where people are continuing the conversation by highlighting and responding to this story.
