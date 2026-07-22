---
title: "Building Reliable Agentic AI Systems"
source_url: "https://martinfowler.com/articles/reliable-llm-bayer.html"
author: "Kent Beck, Martin Fowler"
publish_time: "2026-06"
ingested: true
sha256: "pending"
---

# Building Reliable Agentic AI Systems


Published Time: Tue, 16 Jun 2026 12:33:35 GMT

Markdown Content:
Preclinical drug discovery is inherently complex and data-intensive. Researchers face the significant challenge of efficiently accessing and analyzing vast volumes of information generated during this critical phase. Traditional keyword-based search methods, often reliant on rigid Boolean logic, frequently fall short when confronted with the nuanced and intricate nature of preclinical research questions.

The advent of Large Language Models (LLMs) has presented a transformative opportunity. By combining the generative power of LLMs with the precision of information retrieval systems, [Retrieval-Augmented Generation](http://martinfowler.com/articles/gen-ai-patterns/#rag) (RAG) has emerged as a promising technique. This approach holds the potential to revolutionize preclinical data access, enabling researchers to pose complex questions in natural language and receive accurate, context-rich answers grounded in proprietary data.

Recognizing this potential early, Bayer committed to exploring how these technologies could address longstanding challenges in preclinical research.

In this post, we share that journey—how Bayer's early investment in generative AI has resulted in PRINCE, an agentic AI system built on Agentic RAG. This case study explores the technical architecture, engineering decisions, and lessons learned in transforming preclinical data retrieval from a challenging maze into an intuitive conversational experience.

Many of the engineering decisions behind PRINCE can now be understood through the lens of context engineering and harness engineering, although when the system was first designed we did not use these terms. Context engineering shaped what information each model received, what it did not receive, and how context moved between specialized steps such as research, reflection, and writing. Harness engineering shaped the scaffolding around the models: orchestration, tool boundaries, state persistence, retries, fallbacks, validation, reflection loops, observability, and human review.

While this post focuses on the technical architecture and engineering challenges, our paper published in [Frontiers in Artificial Intelligence](https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2025.1636809/full) covers the product evolution and business impact in more detail.

## The Challenge: Navigating the Preclinical Data Maze

The preclinical research landscape at Bayer, like many large pharmaceutical organizations, is characterized by a diverse and extensive array of data. This includes highly structured datasets from various studies, alongside vast amounts of unstructured information embedded within text documents such as study reports, publications, and regulatory submissions. Researchers frequently encountered significant hurdles in accessing and analyzing this information effectively:

*   Data Silos: information was fragmented and scattered across numerous disparate systems and repositories, making it exceedingly difficult to gain a comprehensive, holistic view of preclinical data related to a specific compound or study. 
*   Limited Search Capabilities: traditional keyword-based search engines struggled with the complexity and variability of preclinical terminology and research questions, often yielding irrelevant, incomplete, or overwhelming results. 
*   Time-Consuming Manual Analysis: extracting specific insights or compiling information across multiple documents required considerable manual effort, diverting valuable researcher time away from core scientific activities.

These inherent challenges highlighted a clear need for a more efficient, intelligent, and integrated approach to preclinical data retrieval and analysis.

## The Solution: PRINCE - An Evolutionary Platform

To address these challenges, Bayer developed the Preclinical Information Center (PRINCE) platform. PRINCE was conceived as a unified gateway to preclinical data, initially focusing on consolidating previously siloed structured study metadata and exposing them in a “Searchable” manner. This initial phase allowed users to apply advanced filters and retrieve information primarily from structured study metadata.

However, a significant portion of Bayer's valuable preclinical knowledge resides within unstructured PDF study reports accumulated over decades. Due to numerous system migrations over the years, the structured metadata associated with these reports could be incomplete, missing, or even contain incorrect annotations. Crucially, the authoritative “gold standard” information was consistently present within the approved PDF study reports.

The emergence of Generative AI, particularly RAG, provided the key to unlocking this wealth of unstructured data. By integrating RAG capabilities, PRINCE began to shift the paradigm from a filter-based 'search' tool to a natural language 'ask' system, enabling researchers to query the content of these study reports directly.

This evolution reflects PRINCE's progression through three distinct phases:

1.   Search: the initial phase focused on creating a unified gateway to thousands of nonclinical study reports, consolidating multiple in-house data silos from various preclinical domains into a searchable format, primarily leveraging structured metadata.
2.   Ask: this phase introduced an AI-powered question-answering system utilizing Retrieval Augmented Generation (RAG). This enabled researchers to derive insights directly from unstructured data, including scanned PDFs from historical reports, by posing questions in natural language.
3.   Do: the current phase positions PRINCE as an active research assistant capable of executing complex tasks. This is achieved through the integration of multi-agent systems, allowing the platform to handle intricate queries, orchestrate workflows, and support activities like drafting regulatory documents.

This deliberate evolution from Search to Ask to Do represents a strategic response to the industry's need for greater efficiency and innovation in preclinical development. By providing researchers with increasingly powerful tools to access, analyze, and act upon preclinical data, PRINCE aims to enable faster data-driven decision-making, reduce the need for unnecessary experiments, and ultimately accelerate the development of safer, more effective therapies.

## System Architecture: Engineering a Reliable Agentic RAG System

The system functions as an interactive conversational UI, powered by a robust backend infrastructure. Its architecture, designed for handling complex queries and delivering accurate, context-rich answers, is orchestrated using _LangGraph_ and served via a _FastAPI_ application.

[Figure 1](http://martinfowler.com/articles/reliable-llm-bayer.html#system-container-view.png) provides the system context—UI, backend, data stores, LLM fallbacks, and observability—while [Figure 2](http://martinfowler.com/articles/reliable-llm-bayer.html#new-research-workflow.png) zooms into how the system coordinates its specialized agents.

![Image 1](http://martinfowler.com/articles/reliable-llm-bayer/system-container-view.png)

Figure 1: System context and supporting platforms.

*   User Request: the process begins when a user submits a request through the Conversational UI which is built with React.
*   Orchestration: the user's request is routed to a LangGraph-based orchestration layer in the backend. This workflow engine coordinates a multi-stage process that progresses through clarifying user intent, thinking and planning, conducting research (using RAG and Text-to-SQL), validating data completion, and finally generating a response through the Writer agent. The workflow includes deliberate pause points and feedback loops to ensure data completeness before proceeding. (We explore the details of this agentic workflow in a dedicated section later.)
*   Data Retrieval and State Management: the Researcher agents interact with a comprehensive and distributed data ecosystem: 

    *   Vector representations of all study reports are stored in _OpenSearch_, forming the core _knowledge base_ for information retrieval.
    *   Curated _structured data_, resulting from various ETL and harmonization processes, is accessed via _Athena_.
    *   The _state_ of the agent's execution is meticulously tracked. After each logical step (a LangGraph node execution), the corresponding state is persisted in _PostgreSQL_ using a _LangGraph checkpointer_.
    *   Broader _application-level state_ is managed in _DynamoDB_.

*   The system leverages internal GenAI platforms that host models from OpenAI, Anthropic, Google, and open-source providers. These platforms expose all models via a unified OpenAI-compatible endpoint, making it easy to swap models and choose the best tool for each task. They also manage the control plane, enforcing rate limits and other safeguards to prevent abuse.
*   Resilience and Error Handling: robustness is a critical design principle, with multiple fallback mechanisms in place: 

    *   If a specific LLM fails, the system automatically retries the request several times before falling back to an alternative model or platform to ensure service continuity.
    *   To recover quickly from transient failures, retries are implemented at both the individual LLM call level and the logical node level (i.e., an entire step in the agent's plan).
    *   Also, agents are provided the context of the errors so that they can chart a different trajectory or alternative plan of action as a response.

*   Observability and Evaluation: the entire system is monitored for performance and reliability: 

    *   General system health and metrics are tracked using _Cloudwatch_.
    *   _Langfuse_ serves as the primary observability tool, providing detailed traces of all production traffic. This allows for in-depth debugging of issues. Furthermore, evaluation datasets are stored and managed within Langfuse, making it easier to analyze performance scores and diagnose specific failures. The evaluation is done using RAGAS evaluation framework. The live traffic evaluation is done on a daily basis while the dataset evaluation is done whenever significant changes are made to the core workflow, prompts, or underlying models.

*   Final Response: once the agents have processed the request and generated a satisfactory response, it is sent back to the Conversational UI to be presented to the user.

A design principle running through this architecture is context discipline. Larger context windows did not remove the need to be selective about what each agent sees. In early iterations, putting too much information into the context made the system harder to steer and harder to evaluate. PRINCE therefore avoids treating the prompt as one large container for all available information. Instead, different stages receive different context: planning context for Think & Plan, retrieval context for the Researcher Agent, evidence context for the Reflection Agent, and synthesis context for the Writer Agent. This reduces context pollution and makes the system easier to debug, evaluate, and improve.

These steps ensure that the system can provide reliable and contextually relevant answers to a wide range of complex queries by leveraging a sophisticated, multi-agent architecture and a diverse set of powerful tools and data sources.

## The Agentic RAG System

PRINCE incorporates an agentic [RAG](http://martinfowler.com/articles/gen-ai-patterns/#rag) system ([Figure 2](http://martinfowler.com/articles/reliable-llm-bayer.html#new-research-workflow.png)) to handle complex user requests that require multiple steps, reasoning, and interaction with different tools or data sources. This setup, implemented using _LangGraph_, orchestrates the overall workflow and leverages _Researcher Agent_, _Writer Agent_, and _Reflection Agent_ for specific tasks. The system is designed to be robust and reliable, with multiple fallback mechanisms in place to ensure that the system can continue to function even if some of the components fail.

![Image 2](http://martinfowler.com/articles/reliable-llm-bayer/new-research-workflow.png)

Figure 2: The research workflow.

### Clarify User Intent

The _Clarify User Intent_ step serves as the first line of defense against ambiguity. As the system scaled to include diverse domains like toxicology and pharmacology, simple user queries often became ambiguous, making it difficult to automatically select the right tools. Rather than relying on expensive trial-and-error across all data sources, the system proactively asks clarifying questions to pinpoint the specific domain or data type.

This ensures the system enhances the query with the necessary constraints to target the correct tools. We are also optimizing this by developing _domain-level selection_ in the UI, which will allow users to pre-filter valid tools upfront. To further reduce friction, the system also provides AI-assisted source recommendations: when a user has not selected any data source — or has selected several without a clear focus — the model analyzes the intent behind the user's query and suggests the most relevant sources. The user retains full control and can accept, adjust, or override the recommendation, ensuring domain expertise always has the final say. This “fail-fast” mechanism prevents wasted execution on vague queries, while careful tuning ensures the system remains unobtrusive when the intent is already clear.

From a context engineering perspective, this step is the first assembly decision in the workflow: it constrains which tools, domains, and data sources will be in scope before any retrieval begins, ensuring subsequent agents receive a focused rather than open-ended problem.

### Think & Plan: Process Reflection

The _Think & Plan_ step is responsible for devising a strategy to fulfill the user's request. This critical component gives the system a dedicated space to reason about the next steps before taking action—a technique inspired by [Anthropic's Think tool](https://www.anthropic.com/engineering/claude-think-tool). Importantly, this step performs _process reflection_: evaluating whether the agent is making the right progress toward its end goal and is on right trajectory, rather than evaluating the data itself.

In multi-step agentic workflows, particularly those involving many sequential actions, process reflection is essential. Consider a scenario where the system needs to execute 50 steps to complete a complex task. At each juncture, the system must ask: Am I taking these steps in the right manner? Am I making the progress I'm supposed to make? Is the current trajectory leading toward the user's goal? The _Think & Plan_ step provides this metacognitive capability, allowing the system to reflect on its own workflow and adjust its strategy accordingly.

This “thinking space” has proven particularly valuable in scenarios involving multiple tool calls. When PRINCE was initially developed, it had only a couple of tools: one for RAG-based retrieval and another for Text-to-SQL queries. However, as we integrated more data sources to expand the system's capabilities, the number of available tools grew significantly. With this explosion of tools came an inherent challenge: overlapping concerns and domain boundaries across different tools.

For example, multiple tools might serve similar but subtly different purposes—querying structured metadata versus unstructured reports, or retrieving study summaries versus detailed experimental data. When presented with tools that belong to similar domains but handle slightly different data, the LLM would sometimes struggle to select the most appropriate tool for a given query. By introducing a dedicated thinking step, the system can explicitly reason about which tool best matches the user's intent, evaluate the characteristics of each available tool, and make a more informed decision. This approach led to a dramatic improvement in the accuracy of tool selection.

Beyond tool selection, the _Think & Plan_ step is essential for orchestrating multi-step processes. Many complex queries in PRINCE require a series of tool calls where the output of one tool must be analyzed before determining the next action. For instance, the system might first query structured metadata to identify relevant studies, then use those study IDs to retrieve detailed information from unstructured reports, and finally synthesize the findings. Without a dedicated space for process reflection, the system would attempt to execute these steps linearly without evaluating whether each step is bringing it closer to the goal. With the thinking step in place, the system can pause, assess its progress in the workflow, and intelligently plan the subsequent tool calls needed to complete the user's request.

### The Researcher Agent

The _Researcher Agent_ serves as the system's primary information gatherer. As we onboard new scientific domains onto PRINCE, we consistently observe that data falls into two primary categories: _structured_ and _unstructured_. While specific implementation techniques may vary across domains — for instance, leveraging Snowflake Cortex Analyst for pharmacology queries for Text-to-SQL versus other more custom methods for toxicology—the fundamentals behind these retrieval strategies remain consistent.

As PRINCE expands across multiple preclinical domains, a single Researcher agent with a flat tool list becomes increasingly hard to manage. Many tools operate on similar concepts—“studies”, “findings”, “assays”—but point to different underlying datasets, schemas, and regulatory interpretations depending on the domain. For example, when a user refers to “the study”, the relevant context might be a repeat‑dose toxicology study, a cardiovascular safety pharmacology package, or a particular assay in aggregated mass‑data tables, each with its own preferred sources of truth.

To avoid one monolithic agent juggling overlapping tools and subtly different data contracts, we are actively evolving the Researcher capability into a hierarchy of domain‑specific sub‑agents. In this proposed architecture, each domain agent will own its own toolset (for example, toxicology RAG + tox metadata SQL, or pharmacology RAG + assay‑level SQL) along with tailored prompt instructions that encode how that domain’s data model works, which tables or indices are authoritative, and how to interpret key concepts. We anticipate this will keep responsibilities coherent, reduce accidental cross‑domain leakage, and make it easier to reason about and test retrieval behaviour per domain.

To effectively harvest insights from this diverse landscape, the Researcher Agent employs a [hybrid retriever](http://martinfowler.com/articles/gen-ai-patterns/#hybrid-retriever) approach focused on two distinct patterns:

*   Retrieval-Augmented Generation (RAG): for processing unstructured data, primarily PDF reports.
*   Text-to-SQL: for querying structured data housed in Amazon Athena.

This dual-strategy allows the system to bridge the gap between narrative scientific reports and quantitative experimental data.

In this updated vision, the top‑level Researcher Agent is designed to act as a coordinator rather than a single all‑knowing component. Given the clarified user intent and any explicit domain selection from the UI, it will route the query to the appropriate domain sub‑agent, which can then decide how to combine RAG and Text‑to‑SQL within its own boundary. This pattern aims to preserve the simplicity of “one researcher” from the user’s perspective, while internally allowing each domain to evolve its own tools, schemas, and retrieval recipes without destabilizing the rest of the system.

#### Retrieval-Augmented Generation (RAG) for Unstructured Data

Given the vast repository of thousands of preclinical study reports and other unstructured documents, RAG is essential for extracting relevant insights by grounding LLM responses in this specific knowledge base. The RAG pipeline comprises a comprehensive ingestion process and a sophisticated query-time architecture.

**Ingestion Process:** Preclinical study reports, mostly PDFs spanning decades and often including scanned documents with complex tables, are first centralized into an S3 data lake and passed through an extraction pipeline tuned for this corpus. The extracted text is normalized into structured JSON and then chunked using a strategy that preserves enough scientific context while keeping chunks efficient for retrieval.

Each chunk is enriched with study‑ and section‑level metadata from Amazon Athena (for example study ID, compound, species, route, page, and parent section), which later enables precise metadata filtering in the RAG layer. Finally, these annotated chunks are embedded and indexed in [Amazon OpenSearch Service](https://aws.amazon.com/opensearch-service/), forming the vector store that backs semantic and metadata‑aware retrieval over both the historical corpus and the daily deltas as new or updated reports arrive.

**Query-Time RAG Pipeline:** When a user submits a query, the system initiates a multi-stage retrieval process. This pipeline is engineered to effectively retrieve the most relevant and trustworthy information from the vector database to ground the LLM's response.

To illustrate this pipeline, consider the example query: “Were any of the following clinical findings observed in study T123456-2: piloerection, ataxia, eyes partially closed, and loose faeces?”. The system processes this query through the following steps:

*   Keyword Extraction: the user's natural language query is first analyzed by an LLM. Through careful prompt engineering, the model is instructed to extract keywords highly relevant for keyword search within our document corpus (e.g., “piloerection”, “ataxia”, “eyes partially closed”, “loose faeces”).
*   Metadata Filter Generation: concurrently, the LLM generates a metadata filter based on the query. For example, a filter eq(study_id, T123456-2) is extracted to narrow the search space. This filter is dynamically generated using few-shot prompting with various permutation and combination examples provided to the model, ensuring it can handle diverse filtering requests.
*   Query Expansion: to ensure comprehensive retrieval and account for variations in phrasing and terminology, [query expansion](http://martinfowler.com/articles/gen-ai-patterns/#query-rewrite) (multi query or query rewrite) is performed by a smaller, faster model. This generates n=5 semantically similar queries based on the original question. For the example query, this might include variations like:

    *   “Clinical symptoms reported in research T123456-2, including goosebumps, lack of coordination, semi-closed eyelids, or diarrhea.”
    *   “Recorded observations in experiment T123456-2 regarding hair standing on end, unsteady movement, eyes not fully open, or watery stools.”
    *   “What were the clinical observations noted in trial T123456-2, particularly regarding the presence of hair bristling, impaired balance, partially shut eyes, or soft bowel movements.”

*   Hybrid Retriever: information retrieval from the vector database ([Amazon OpenSearch Service](https://aws.amazon.com/opensearch-service/)) utilizes a Hybrid Search approach that combines metadata filtering, semantic vector similarity search (kNN), and keyword-based retrieval. This process is executed as follows:

    *   Metadata Filtering: the metadata filter generated in the previous step (e.g., eq(study_id, T123456-2)) is applied directly to the vector database query. This pre-filters the search space based on the structured metadata attached to the chunks during the ingestion process from Amazon Athena, ensuring that only chunks associated with the specified study ID (or other relevant metadata) are considered. This significantly reduces the search space from millions of vectors to a more manageable range of tens to hundreds, improving efficiency and relevance.
    *   Parallel Hybrid Search Execution: for each of the n=5 expanded queries, a single hybrid search query is executed in parallel against the filtered Amazon OpenSearch Service vector database. This query combines both semantic vector similarity search (kNN) and keyword-based search, leveraging OpenSearch's capabilities for efficient multi-vector and text search.
    *   Weighted Result Scoring: within each individual hybrid search executed in parallel, a weighted approach is applied to the results. A weight of 0.7 is given to the semantic search results and 0.3 to the keyword search results to balance contextual understanding and precise term matching. This weighting was determined through experimentation to optimize retrieval effectiveness for our data.
    *   Result Aggregation and Initial Ranking: the results (sets of relevant chunks with their weighted scores) from all 5 parallel hybrid search executions are aggregated. Unique chunks from all search results are pulled together, and their highest weighted score across the parallel searches is used to determine an initial ranking. This step initially retrieves a larger set of potential context chunks (k=~20) based on these aggregated and weighted scores.

*   Reranking: the initial set of retrieved chunks (k=~20) is then refined using a [Rerank](http://martinfowler.com/articles/gen-ai-patterns/#reranker) step. A cross-encoder model (bge-reranker-large) evaluates the relevance of each retrieved chunk against the original question, selecting the top k=7 most relevant chunks to be used as context for the LLM. This reranking step is crucial for ensuring that the most pertinent information, even if not the highest in initial semantic similarity or keyword match, is prioritized for the final response generation.
*   Final LLM Prompt Generation: the refined context (k=7 chunks) is then combined with the original question to form the final LLM prompt. This prompt is carefully constructed to guide the LLM in generating a focused and accurate response based on the provided context, minimizing the risk of hallucination.
*   Response Generation with Citation: a state-of-the-art reasoning model then processes the final prompt and the provided context to generate response with citation. The LLM synthesizes the information from the context to formulate a coherent and accurate answer. Crucially, the response automatically includes citations linking back to the specific chunks in the original document(s) that support the generated answer.
*   Monitoring: the entire Query-Time RAG process, from initial query to final response generation, is continuously monitored using Langfuse for observability, performance and quality analysis.

#### Text-to-SQL for Structured Data

While RAG excels at unstructured data, queries requiring precise filtering, aggregation, or comparison of structured data points are better suited for Text-to-SQL. Examples include “Give me 50 example studies done on RAT” or retrieving specific numerical assay results including dosage groups. As shown in the _Researcher Agent_ can intelligently decide to hand over such queries to the Text-to-SQL tool.

![Image 3](http://martinfowler.com/articles/reliable-llm-bayer/text-to-sql.png)

Figure 3: Text-to-SQL tool

The process for converting a natural language question into an executable SQL query and retrieving results involves several key steps:

*   Query Analysis and Intent Recognition: the user's natural language query is analyzed to understand the user's intent and identify the specific data points and filters being requested from the structured metadata.
*   Schema Understanding and Relevant Schema Selection: to accurately generate a SQL query, the LLM requires an understanding of the relevant database schema. For large and complex schemas, only the necessary schema components relevant to the user's query are dynamically injected into the LLM's context. This reduces the complexity for the model and improves the accuracy of the generated SQL.
*   Dynamic Few-Shot Prompting for SQL Generation: converting complex natural language queries into precise SQL dialect (in our case, Athena) can be challenging for LLMs. To address this, we employ dynamic few-shot prompting. A collection of carefully hand-picked examples, representing various complex query patterns and their corresponding correct SQL translations in the Athena dialect, is stored in a separate collection within our vector database. Based on the user's query, relevant examples are retrieved from this “semantic layer” using vector similarity search and included in the prompt to the LLM. This provides the LLM with in-context learning examples, guiding it to generate accurate SQL queries in the correct dialect. Continuous addition of new examples based on encountered challenges further improves the system's performance over time.
*   SQL Query Generation and Validation: a model with strong code generation capabilities, conditioned on the relevant schema information and dynamic few-shot examples, generates the corresponding SQL query. To ensure the LLM can accurately process the results and identify the correct rows for subsequent synthesis, certain essential columns, such as study ID and study title, are always included in the generated SELECT query. The generated query is then validated to ensure it adheres to allowed operations (e.g., only SELECT queries are permitted; DELETE, INSERT, or UPDATE queries are explicitly blocked for data integrity and security). Notably, an earlier iteration of this process included an LLM review step for generated SQL queries; however, this step was later removed as it was found that the reviewing LLM sometimes incorrectly flagged valid queries as erroneous, hindering efficiency without a commensurate gain in accuracy.
*   Query Execution and Result Limiting: the validated SQL query is executed against the structured metadata database in Amazon Athena. To prevent data flooding and manage response size, the system enforces a limit, fetching not more than 50 records at a time.
*   Error Handling and Iteration: if the SQL query execution is successful, the retrieved results (up to the specified limit) are returned and integrated into the overall response generation process. If the query fails due to syntax errors, schema issues, or other execution errors, the error message from the database, along with the generated query and the original context, is passed back to the same model. The LLM analyzes the error and the context to generate a corrected SQL query. This iterative process of generating and executing SQL queries is attempted up to 3 times before the tool gives up and reports a failure, potentially indicating an unresolvable query or a limitation in the model's ability to handle the specific request.

### The Reflection Agent: Data Validation and Sufficiency

While the _Think & Plan_ step provides process reflection, the _Reflection Agent_ performs a complementary but distinct type of reflection: _data reflection_. This crucial component evaluates whether the data retrieved from various tools is sufficient and relevant to answer the user's question—a fundamentally different concern from whether the workflow itself is progressing correctly.

In multi-step agentic workflows, these two types of reflection serve different but equally important purposes. Process reflection (Think & Plan) ensures the agent is taking the right steps and making appropriate progress toward the goal. Data reflection (Reflection Agent) ensures that the information gathered through those steps is adequate to fulfill the user's request. Both are essential: an agent might execute a perfectly valid workflow (good process) but still retrieve insufficient data to answer the question, or conversely, might have access to sufficient data but fail to progress effectively through the workflow.

As illustrated in the research workflow diagram ([Figure 2](http://martinfowler.com/articles/reliable-llm-bayer.html#new-research-workflow.png)), after initial information retrieval and 'think & plan' loops, the _Reflection Agent_ is invoked when Think & Plan step thinks that the process has progressed well enough and is ready to evaluate the data. 'Reflection Agent' evaluates the sufficiency and relevance of the collected data by comparing the retrieved context against the user's original query and identifying potential gaps or missing information. If the gathered information is deemed insufficient to provide a complete response, the _Reflection Agent_ generates specific follow-up questions designed to acquire the necessary missing information. These follow-up questions are then handed back to the _Think & Plan_ step, which initiates further retrieval steps to obtain more comprehensive results. This iterative process of data validation and subsequent information retrieval, driven by the _Reflection Agent_'s generated questions, demonstrates the system's ability to refine its search strategy based on the initial results. If the information is sufficient, the workflow proceeds to the next step.

### The Writer Agent: Answer Synthesis and Formatting

Once the Researcher Agent has collected the relevant evidence from RAG and Text-to-SQL, the _Writer Agent_ is responsible for turning that raw material into the final answer shown to the user. Its job is not to “discover” new information, but to synthesize the retrieved context, respect user instructions, and enforce PRINCE's quality constraints during generation.

The Writer Agent operates with a few non-negotiable rules. It must ground every claim in the supplied context and attach accurate citations back to the underlying chunks and study IDs, since verifiability is critical in a regulated environment. It is also responsible for honoring user-level formatting requirements (for example, tables, bullet points, or specific section structures) and for aligning with domain-specific answer standards used by the preclinical scientists.

For more complex responses—such as multi-section summaries or partially filled regulatory templates—the architecture supports extending the Writer Agent with a short internal review loop. In this pattern, the Writer would first draft an answer, then a reviewing step would check for missing sections, inconsistent tables, or gaps relative to the original question, and may send targeted instructions back to the Writer to revise specific parts. This design enables a lightweight form of reflection focused on _answer completeness and presentation_, complementing the Reflection Agent's focus on _data sufficiency_ earlier in the workflow. Importantly, all outputs from these regulatory drafting workflows are intended for expert review; final submissions are authored and approved by qualified personnel.

This gives PRINCE three complementary reflection loops. Process reflection checks whether the workflow is on the right path and helps catch bad trajectory, wrong tool choice, or poor sequencing. Data reflection checks whether the gathered evidence is sufficient and helps catch thin evidence, missing context, or gaps in coverage. Draft reflection checks whether the generated output is complete and helps catch missing sections, incomplete tables, or synthesis gaps.

Together, these agents form a practical context engineering pattern. The system does not simply keep adding more information to the prompt. It routes the right context to the right capability at the right time: planning context for Think & Plan, retrieval context for the Researcher, evidence context for the Reflection Agent, and synthesis context for the Writer. This plays out in concrete decisions throughout the system: the Text-to-SQL step injects only the schema components relevant to the current query rather than the full database schema; the Reflection Agent receives the original question alongside collected evidence to assess gaps, not the full workflow history; and the Writer Agent receives curated chunks with citation constraints, not raw retrieval output. Moving from a monolithic agent to this structured workflow meant each agent could be evaluated, debugged, and improved in isolation.

## Building Trust in a Production LLM System

Building and maintaining user trust is paramount for the successful adoption of any AI system, particularly in a critical environment like preclinical drug discovery where decisions have significant implications. For a production LLM application, trust is not just about accuracy; it's also about reliability, transparency, and the ability for users to verify the information provided. Several mechanisms are integrated into PRINCE to achieve this:

### Transparency and Explainability

Ensuring transparency and explainability is a critical aspect of PRINCE's design, fostering user trust and enabling verification of the generated responses. The system incorporates several mechanisms to achieve this:

*   Intermediate Steps and Transparency: given the iterative nature of the workflow and the potential time required to generate a final answer, maintaining transparency is crucial. The intermediate steps executed by the system during query processing, information retrieval, and reflection, including the queries formulated and the tools utilized, are displayed to the user. This provides visibility into the system's reasoning process and allows users to follow the steps taken to arrive at the final answer. Additionally, when relevant context (chunks) is identified, links to these source materials are presented on the screen, allowing users to see precisely which information was shortlisted and used to formulate the final response.
*   Factuality Verification through Citation: the system facilitates user verification of factuality through a robust citation mechanism. The generated answer is consistently accompanied by citations referencing the original source documents and structured metadata. These citations are directly linked to the context displayed to the user, enabling them to easily verify the accuracy of the claims made in the response and trace the information back to its origin. Users can hover over any sentence in the generated response to see the corresponding citation, which provides a link to the PRINCE and to the source document, including the page number and the exact quote from the report used to support that part of the answer. This granular level of citation significantly enhances the credibility and trustworthiness of the system's output and simplifies the human review process.

### Evaluation

Rigorous evaluation is fundamental to building and maintaining a reliable LLM application. PRINCE's performance and reliability are assessed through a combination of two types of evaluations: Dataset Evaluations and Live Traffic Evaluations.

*   Dataset Evaluations: conducted whenever significant changes are made to the core workflow, prompts, or underlying models, these evaluations utilize curated datasets with pre-defined reference answers, meticulously prepared by subject matter experts and stored in Langfuse. A custom evaluation script processes each question and compares the generated response against the reference answer, yielding quantitative metrics such as _Faithfulness_ (degree to which the answer is supported by context), _Answer Relevancy_ (how well the answer addresses the query), _Context Relevancy_ (relevance of retrieved chunks), _Answer Accuracy_ (comparison to ground truth), and _Semantic Similarity with Reference_ (semantic similarity to reference answer). Given the agentic nature of the system, applying appropriate evaluation metrics at different workflow stages, analogous to a testing pyramid, is crucial in addition to evaluating overall end-to-end performance.
*   Live Traffic Evaluations: performed daily as a batch job on real user queries from the live environment (without pre-defined reference answers), these evaluations provide valuable insights into real-world performance. Metrics such as Faithfulness and Answer Relevancy can still be assessed. Live traffic evaluations are essential for monitoring system behavior, identifying potential issues like hallucinations in production, and understanding performance on diverse live queries.

### Monitoring

Continuous monitoring of the system's performance and outputs is essential for proactive identification and resolution of issues in a production environment. Using platforms like Langfuse, we continuously monitor PRINCE to identify potential biases, errors, or areas for improvement, ensuring the reliability and safety of the system's responses.

## Engineering for Resilience: Error Handling and Recovery

Given the complexity of the multi-step workflow inherent in PRINCE, robust error handling and recovery mechanisms are critical to ensure the system's reliability and provide a seamless user experience. The system is engineered to recover gracefully from failures at various stages without requiring a complete restart of the entire workflow.

Key aspects of our error handling and recovery approach include:

*   State Persistence: the state of the entire workflow graph is persistently stored, enabling the system to resume execution directly from the failed node. This is achieved by storing the _Agent State_, representing the progress of the agents through the workflow, in Postgres. Other aspects of the application state, such as logs, intermediate steps, and citations, are stored in DynamoDB. This separation and persistence of state are crucial for achieving robustness in a stateful agentic system.
*   Built-in Retries: the system is configured with built-in retries at various steps in the workflow. If a particular step encounters a transient failure, the system will automatically attempt to re-execute it a predefined number of times before signaling a more permanent error.
*   User-Initiated Retries: in addition to automated retries, users have the option to manually retry a failed query through the interface. When a user initiates a retry, the system leverages the persisted state to continue the workflow directly from the point of failure, intelligently skipping the steps that were successfully completed in the previous attempt. This significantly improves user experience and saves computational resources.
*   Framework-Level Support: the error recovery mechanisms are significantly supported by the underlying framework, LangGraph, which offers solid built-in capabilities for managing workflow state and handling errors within the graph structure. This provides a robust foundation for building resilient agentic workflows.
*   LLM Fallbacks: to enhance reliability and mitigate issues related to model availability or performance, the system incorporates custom LLM fallback handling. If a call to a primary LLM provider or a specific model fails after a few retries, the system automatically falls back to an alternative LLM from a different provider. This mechanism is crucial for maintaining system availability and responsiveness, especially as platform downtimes for external services are outside of our direct control.

This comprehensive approach to error handling and recovery minimizes the impact of transient failures, reduces the need for users to restart complex queries from scratch, and contributes to cost and latency savings by avoiding redundant execution of successful steps and LLM calls, all of which are essential for a production-ready system.

These mechanisms are harness engineering in practice. The LangGraph workflow acts as the control layer around the agents: it defines which component can act, which tools it can use, where the workflow can pause, how failures are retried, how state is persisted, and when the system should move from research to reflection to writing. This harness makes the system less opaque and more reliable than an unconstrained autonomous agent. It gives the application clear control points for recovery, inspection, evaluation, and human intervention.

## Enhancing Data Quality: Named Entity Recognition and Annotation

The accuracy and completeness of the structured metadata in Amazon Athena are critical for the performance of the Text-to-SQL component and overall data discoverability within PRINCE. Due to historical data migrations and varied annotation practices across different laboratories and systems over Bayer's extensive operational history, the metadata can sometimes be incomplete, missing, or incorrect.

To address this challenge and continuously enhance the quality of the structured metadata, we have developed a utility system that employs Named Entity Recognition (NER) to extract and create accurate annotations directly from the study PDFs. This system is designed to read the textual content of the preclinical reports and identify key entities and associated information that should be represented in the structured metadata.

The process involves:

*   Processing study PDFs to extract text and identify relevant entities (e.g., study IDs, compound names, species, routes of administration, dosage information, clinical findings, etc.).
*   Generating structured annotations based on the identified entities and their relationships within the text.

We are actively working on integrating this utility system into our data pipelines to automatically correct and enrich the data within the Amazon Athena database. The system's performance in generating accurate annotations has been evaluated against curated datasets, demonstrating promising results. To manage the integration of these annotations into the production database, we are developing an evaluation system that provides a confidence score for each extracted field. Fields with a high confidence score will be automatically used to update the corresponding entries in Amazon Athena. Fields with lower confidence scores will be quarantined and flagged for human review and intervention, ensuring data accuracy while leveraging automation. This approach aims to continuously improve the quality of the structured metadata, making it a more reliable source of information for PRINCE and other downstream applications.

## The Journey Continues: Iterative Development

PRINCE has been available to end-users since early 2024, with the agentic integration introduced later that year. This has been crucial for gathering real-world feedback and driving iterative development. A key principle guiding our development has been the understanding that building a production-ready LLM application is an iterative process; we don't wait for features to be absolutely perfect before seeking user feedback. Instead, we prioritize delivering value early and continuously refining the system based on real-world usage.

In the initial stages, our focus was squarely on achieving the desired accuracy and performance for core functionalities, even if it meant incurring higher costs. We recognized that optimizing for cost prematurely could compromise the system's effectiveness and hinder user adoption. Only after achieving the desired level of accuracy and performance did we begin to focus on cost optimization, ensuring that efficiency gains did not negatively impact the user experience or the quality of the results.

The development of PRINCE follows a continuous, iterative process. User feedback, ongoing monitoring data, and insights from expert scientists are continuously fed back into the development cycle, leading to refinements in the architecture, retrieval techniques, agent behaviors, and user interface to enhance performance, usability, and ultimately, scientific impact.

## Conclusion

Building a production-ready LLM application in a complex enterprise environment like preclinical drug discovery is a journey marked by significant technical and engineering challenges. The PRINCE case study demonstrates that by combining robust data infrastructure, sophisticated information retrieval techniques like RAG and Text-to-SQL, and an intelligent multi-agent orchestration system, it is possible to unlock valuable insights from vast, previously inaccessible data repositories.

Our experience highlights the critical importance of focusing on engineering for reliability, including robust error handling, state persistence, and LLM fallbacks. Furthermore, building user trust is paramount, achieved through transparency in the workflow, clear explainability via granular citations, and continuous evaluation and monitoring of the system's performance.

PRINCE has already shown promising results in enhancing data accessibility and research efficiency at Bayer, transforming how scientists interact with preclinical information. This is not the end of the journey, but rather a significant step towards creating truly intelligent research assistants.

The broader lesson from PRINCE is that production-ready agentic AI is not only about better models or better prompts. Reliability comes from engineering both the context the model sees and the harness within which the model acts. Context engineering helped ensure that each model had the right information, and only the right information, at the right stage of the workflow. Harness engineering helped ensure that the workflow remained bounded, observable, recoverable, and suitable for a regulated research environment.

As model capabilities improve, some parts of today's harness may become thinner or move into native model capabilities. But in enterprise research systems, especially where trust, traceability, and reviewability matter, explicit control over context, workflow state, recovery, reflection, and verification remains essential.

We hope this overview provides valuable insights into the practical considerations and technical depth required to build and productionise LLM applications in a regulated and data-rich domain.

* * *

