---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/built-technologies-builds-an-ai-powered-document-intelligence-solution-on-aws-to-power-agents-across-real-estate-finance
ingested: 2026-07-23
feed_name: AWS China ML
source_published: 2026-07-15
sha256: 3e9412670aa3e4641ffca2fc3f43d8e80a3499aede155a8bec9a045367d3d8bd
---

# Built Technologies builds an AI-powered document intelligence solution on AWS to power agents across real estate finance

Document processing in real estate is complex and highly manual, impacting critical business decisions at scale, making it ripe for automation. [Built Technologies](<http://getbuilt.com/>), a real estate finance software provider, processes over $500B in real estate projects. The company deployed an AI-powered document processing engine on Amazon Bedrock and the [AWS Intelligent Document Processing](<https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws>) (IDP) Accelerator. That engine now serves as the foundation for agentic products across the real estate lifecycle. In this post, we share the need for AI-powered document intelligence in real estate and an architectural deep dive to build it.

Real estate finance runs on documents: draw packages, loan agreements, invoices, insurance certificates, inspection reports, and dozens more. Each contains information that lenders and stakeholders need to review, validate, and act on. These documents are often long, inconsistent, domain-specific, and difficult to process with traditional automation.

For Built, document intelligence is not a back-office utility. It’s a horizontal AI capability that sits at the foundation of a new generation of agentic products launching across the real estate finance lifecycle. Whether an agent is reviewing a construction draw, analyzing a loan agreement, validating insurance coverage, summarizing an offering memorandum, or identifying exceptions in a portfolio, it needs the same core capability: the ability to understand documents with context, accuracy, and traceability.

To build that foundation, Built partnered with the AWS Generative AI Innovation Center (GenAIIC), AWS Partner AND Digital, and AWS account teams to create a scalable, AI-powered document processing engine.

The result is a reusable document intelligence solution that can classify, split, extract, evaluate, and reason over complex real estate finance documents. It reduces workflows that previously took days to minutes, supports hundreds of document types, and gives technical teams and industry experts a shared environment for building and improving document processors.

## Why real estate finance needs AI-powered document intelligence

Real estate finance is document-heavy, fragmented, and highly contextual. A single transaction or asset can involve hundreds or thousands of pages of documentation produced by different parties, in different formats, at different stages of the asset lifecycle.

Some documents are standardized, such as [ACORD 25 certificates](<https://www.dfs.ny.gov/system/files/documents/2025/12/acord-25-2025-12-liability.pdf>) or government forms. Others are highly variable, such as offering memorandums, loan agreements, appraisals, Excel-based financial models, and plans and specifications. Many contain nested tables, scanned pages, embedded images, inconsistent labels, legal language, handwritten annotations, and borrower- or lender-specific terminology.

Built’s existing document-processing capabilities helped the company move from manual work to automated extraction across many document types. The team had established 26 processors for extraction, splitting, and classification using optical character recognition (OCR) and traditional machine learning (ML). That approach worked for narrower use cases where the fields were explicit, and layouts were predictable.

But as Built Technologies expanded its AI roadmap across the real estate lifecycle, the team needed something more flexible and more intelligent. They needed a solution that could support more than 250 document types, handle millions of documents, and power agents that could reason over documents rather than simply extract text from them.

Built faced several challenges:

  * **Document volume and variety** : Built processes more than 250 document types across construction lending, real estate finance, asset management, compliance, and portfolio workflows among others. Individual documents can exceed 500 pages.
  * **Complex, inconsistent document structures** : Many documents contain nested tables, embedded imagery, scanned pages, custom layouts, and non-standard terminology.
  * **Context-dependent extraction** : Important information is often implied, distributed across multiple sections, or expressed in domain-specific language rather than presented as a clearly labeled field.
  * **High confidence requirements** : Built required over 95 percent confidence in classification and extraction workflows to support production use in financial and compliance-sensitive processes.
  * **Scale and extensibility** : Built needed a solution that could support not only one product workflow, but many agentic AI products launching throughout the year.



The goal was to make document understanding a reusable AI capability across Built’s product ecosystem.

## From OCR-based extraction to agentic document understanding

Traditional OCR and machine learning-based document extraction generally works by identifying text and matching it to expected fields, labels, layouts, or prior templates. This can be effective for structured documents, but it’s limited when the task requires judgment, context, or domain reasoning. For example, finding a loan amount, invoice number, or policy expiration date may be a relatively direct extraction task. The field is usually explicit, labeled, and located near predictable text. However, finding covenants in a loan agreement is different.

Covenants are often not presented in a straightforward table labeled “Covenants.” They might appear across multiple sections of a long agreement. They may be embedded in legal language, defined through references to other sections, or expressed as borrower obligations, restrictions, reporting requirements, financial thresholds, default triggers, or remedies. A keyword search for “covenant” might miss the substance. A traditional extraction model may find the word but fail to understand the obligation.

An agentic document workflow can approach the problem differently. Instead of only extracting fields from text, the system can interpret the document in context. It can identify relevant sections, reason over definitions and obligations, distinguish between requirements and exceptions, extract structured outputs, and provide supporting evidence for review.

For a loan agreement, an agentic workflow could:

  1. Identify the document type and relevant agreement structure.
  2. Locate sections related to borrower obligations, financial reporting, restrictions, defaults, and remedies.
  3. Infer which clauses represent covenants, even when they are not explicitly labeled.
  4. Extract the covenant name, requirement, threshold, frequency, effective period, responsible party, and consequence of breach.
  5. Provide references back to the source document for human review.
  6. Route ambiguous or low-confidence results to a subject matter expert.
  7. Capture corrections and feed them back into schema, prompt, and evaluation workflows.



This is the shift Built needed: from document extraction to document understanding. That same pattern applies across real estate finance. Agents need to understand whether insurance coverage satisfies requirements, whether a draw package contains the required documentation, whether an appraisal supports underwriting assumptions, whether an offering memorandum contains key risk indicators, or whether a portfolio document includes exceptions that require attention. In each case, the document is not only a source of text. It is a source of business context.

## A horizontal solution for the Built Technologies agentic AI roadmap

Built designed the new document intelligence solution as a horizontal capability rather than a single-purpose solution. The first production use case focused on commercial construction loan draw packages, where borrowers submit collections of documents to request fund disbursements during construction projects. Draw packages are a strong proving ground because they are large, variable, time-sensitive, and operationally important.

However, the solution was intentionally designed to support real estate finance at large. The same classification, splitting, extraction, evaluation, and human-review capabilities can be reused across multiple agents and workflows, including:

  * **Draw review agents** that classify package contents, identify missing documents, extract invoice and lien waiver data, and flag exceptions.
  * **Loan agreement agents** that identify covenants, reporting obligations, financial thresholds, borrower restrictions, and default provisions.
  * **Insurance agents** that validate certificates of insurance, policy declarations, coverage limits, endorsements, exclusions, and expiration dates.
  * **Underwriting agents** that summarize offering memorandums, appraisals, rent rolls, budgets, and financial models.
  * **Asset management agents** that monitor ongoing reporting packages, identify changes, and surface portfolio-level risks.
  * **Compliance agents** that inspect required forms, permits, inspection reports, and regulatory documentation.



Each of these agents depends on the same foundational ability: turning unstructured, inconsistent, high-volume documents into structured, validated, explainable intelligence.

By making document processing a shared solution capability, Built can accelerate its AI roadmap without rebuilding extraction pipelines for every product. New agents can reuse the same infrastructure for ingestion, classification, schema management, extraction, evaluation, and review.

## Architecture deep dive: Intelligent Document Processing Accelerator and Amazon Bedrock

Built partnered with AWS GenAIIC and AND Digital to build the solution using the AWS Intelligent Document Processing (IDP) Accelerator as the foundation. The solution uses Amazon Bedrock for generative AI-powered classification, splitting, schema generation, extraction, assessment, and document reasoning.

The solution uses a multi-stage pipeline orchestrated by AWS Step Functions. Each document moves through a defined sequence of stages: OCR, classification and splitting, extraction, assessment, and optional rule validation. Each stage is powered by a discrete AWS Lambda function. This section walks through that pipeline using a representative example: a 150-page commercial construction draw package that arrives as a single PDF containing invoices, lien waivers, insurance certificates, and a cover letter in no particular order.

At a high level, the pipeline works as follows. A document uploaded to an Amazon Simple Storage Service (Amazon S3) input bucket emits an Amazon EventBridge event. A Queue Sender Lambda function records the event in an Amazon DynamoDB tracking table and places a message on an Amazon Simple Queue Service (Amazon SQS) queue. A Queue Processor Lambda function manages concurrency through a DynamoDB atomic counter and, when capacity is available, starts an AWS Step Functions execution for the document. The state machine then runs the processing stages in order: OCR, then classification and splitting, then extraction, then assessment, and finally a process-results step.

Extraction runs inside a Step Functions Map state, which is the mechanism that lets the solution process classified sections in parallel. When the 150-page draw package is split into its constituent documents, each section receives its own extraction invocation that runs concurrently with the others. Total processing time is bounded by the longest individual section rather than the sum of all sections. This is one of the reasons workflows that previously took days now finish in minutes. Results are written to an S3 output bucket, and AWS AppSync delivers real-time status updates to the user interface through GraphQL subscriptions.

## Document ingestion and review experience

AND Digital built a custom React-based UI authenticated through Amazon Cognito. The UI gives users a central place to upload documents, manage processors, define schemas, review extraction results, compare versions, and inspect confidence scores.

The custom UI was important because Built needed the solution to support both technical users and business subject matter experts. Document intelligence can’t be managed only by engineering teams. The people who understand the documents best are often lending experts, operations teams, compliance specialists, product managers, and customer-facing teams.

When a user uploads a draw package, the document is stored in Amazon S3 through pre-signed URLs, and the Amazon EventBridge upload event sets the pipeline in motion. The concurrency layer (the DynamoDB atomic counter paired with the SQS queue) keeps the rate of Step Functions executions within Amazon Bedrock and Amazon Textract service limits. This is what allows the same path to handle both a single ad hoc upload and a 50,000-document batch run without changes.

## OCR and structural extraction

When documents enter the pipeline, AWS Lambda triggers Amazon Textract to extract text, tables, forms, signatures, and structural hierarchy. Textract provides the document structure that the downstream generative AI workflows rely on for classification and extraction. For large documents, the system processes pages individually, which allows parallelization but requires careful concurrency and throttle management at scale.

The OCR stage normalizes its output into a consistent structure that later stages consume, recording the location of the raw text, parsed text, and page image for every page in Amazon S3:
    
    
    {
      "metadata": {
        "input_bucket": "<BUCKET>",
        "object_key": "<KEY>",
        "num_pages": "<NUMBER>"
      },
      "pages": {
        "1": {
          "rawTextUri": "<S3_URI>",
          "parsedTextUri": "<S3_URI>",
          "imageUri": "<S3_URI>"
        }
      }
    }

The solution can also use Amazon Bedrock as an alternative OCR backend for documents where a vision-capable model reads the page more reliably than traditional OCR, such as low-quality scans or dense handwritten annotations. The OCR backend is a configuration choice rather than a code change, so teams can select Textract or Bedrock per processor.

## Intelligent classification and splitting

After OCR processing, the classification workflow uses Amazon Bedrock to determine document types and identify boundaries within combined PDFs. This is especially important in real estate finance, where a single package may contain many documents in unpredictable order. Instead of requiring a separate document splitter with rigid page limitations, the solution identifies the constituent documents inside large packages and preserves their relationship to the broader transaction.

Classification is driven by a configurable prompt that lists the available document types and a set of examples. A prompt cache delimiter separates the static instructions from the document text so the static portion can be reused across requests:
    
    
    classification:
      task_prompt: |
        Classify this document into the following categories:
        {CLASS_NAMES_AND_DESCRIPTIONS}
        <few_shot_examples>
        {FEW_SHOT_EXAMPLES}
        </few_shot_examples>
        <<CACHEPOINT>>
        <document_content>
        {DOCUMENT_TEXT}
        </document_content>

The `<<CACHEPOINT>>` marker is what makes this efficient at Built’s scale. Everything before the cache delimiter such as the class definitions and examples is identical for every document a processor handles, so Amazon Bedrock caches it and reuses it across requests. Only the document text after the marker changes from one invocation to the next. For a draw-package processor that defines a dozen or more document classes with examples, this avoids reprocessing the same instructions on every page of every package.

The document splitting stage produces a structured result that maps page ranges to document types. For the example draw package, the output groups the pages into labeled sections:
    
    
    {
      "sections": [
        { "id": "group-001", "class": "CoverLetter", "pages": [1] },
        { "id": "group-002", "class": "Invoice", "pages": [2, 3, 4, 5, 6] },
        { "id": "group-003", "class": "LienWaiver", "pages": [7, 8] },
        { "id": "group-004", "class": "InsuranceCertificate", "pages": [9, 10] }
      ]
    }

Each section group becomes an independent task in the Step Functions Map state, and extraction runs against the schema specific to that document type.

## Dynamic schema generation and extraction

A key capability of the solution is dynamic schema generation. Users can upload examples of a new document type, and Amazon Bedrock generates a proposed extraction schema: the fields, structures, and outputs that should be captured from that document. Subject matter experts can then refine the schema, test it against examples, compare outputs across model versions, and create new processor versions.

Internally, each document type is defined by a JSON Schema, and the description written for each field becomes part of the extraction prompt. This is where much of the solution’s accuracy comes from: a field description that includes where the value typically appears and what it is called guides the model far more effectively than a field name alone. A lien waiver schema, for example, captures the waiver type, contractor, project, applicable period, amount, and any exceptions:
    
    
    classes:
      - $id: LienWaiver
        x-aws-idp-document-type: LienWaiver
        type: object
        description: >
          A lien waiver in which a contractor or supplier waives the right
          to file a mechanic's lien against the property for payment received.
        properties:
          WaiverType:
            type: string
            description: >
              The type of waiver: Conditional, Unconditional, Partial, or
              Final. Look for these terms in the heading at the top.
          ContractorName:
            type: string
            description: >
              The contractor or subcontractor signing the waiver. Usually in
              the 'From' or 'Claimant' field, or above the signature line.
          ProjectName:
            type: string
            description: >
              The project name or address. Look for 'Project', 'Job Name',
              or 'Property' labels.
          ThroughDate:
            type: string
            description: >
              The date through which the waiver applies. May be labeled
              'Through Date', 'Period Ending', or 'For Work Through'.
          AmountWaived:
            type: string
            description: >
              The dollar amount being waived, typically near the waiver
              statement.
          ExceptionItems:
            type: array
            description: Any exceptions or exclusions listed in the waiver.
            items:
              type: object
              properties:
                Description: { type: string }
                Amount: { type: string }

The `x-aws-idp-document-type` annotation links the schema to the classification output. When classification labels pages 7 and 8 as a LienWaiver, the extraction stage loads this schema and builds a prompt from the field descriptions and the OCR text for those pages. Where additional grounding helps, teams can attach few-shot examples to a class (a sample document paired with its expected attributes) to demonstrate the output they want for an unusual layout.

This schema-driven approach is also what makes supporting more than 250 document types practical. Rather than hand-authoring every schema, teams use the Accelerator’s discovery capability to generate a first draft from sample documents: upload one or more examples, and Amazon Bedrock proposes a schema with field names, types, and descriptions for an expert to refine. For bulk onboarding, the solution can cluster a large collection of sample documents by similarity and propose a schema for each cluster.

Because the schema, prompts, and model are all parameters in the configuration, Built can apply a flexible model strategy. For straightforward documents such as standard invoices or insurance certificates, teams may select smaller, faster models such as Amazon Nova Lite. For documents that require deeper reasoning or more complex layout interpretation, such as loan agreements or offering memorandums, they may select larger models such as Anthropic Claude available through Amazon Bedrock. The solution uses the right model for the right document and workflow instead of forcing every use case through a single extraction approach.

## Confidence scoring, human review, and feedback loops

Each extraction result includes confidence scoring at the field level. Built requires over 95 percent confidence in key production workflows, and results below the required threshold are routed to human reviewers.

Confidence scores come from a dedicated assessment stage rather than from the extraction call itself. After extraction, a separate Amazon Bedrock invocation compares the extracted values against the source document and the OCR text and produces, for each field, a confidence score between 0 and 1, a short explanation, and the location of the supporting evidence on the page. For the lien waiver in the example package, the assessment might return:
    
    
    {
      "WaiverType": {
        "confidence": 0.95,
        "confidence_reason": "Heading reads 'CONDITIONAL WAIVER AND RELEASE ON PROGRESS PAYMENT'",
        "geometry": [{ "boundingBox": { "top": 0.05, "left": 0.2, "width": 0.6, "height": 0.04 }, "page": 7 }]
      },
      "AmountWaived": {
        "confidence": 0.72,
        "confidence_reason": "Several dollar amounts on the page; value near the waiver statement chosen, but a handwritten notation is partially illegible",
        "geometry": [{ "boundingBox": { "top": 0.45, "left": 0.3, "width": 0.2, "height": 0.03 }, "page": 7 }]
      }
    }

In this example, the waiver type clears the threshold but the waived amount doesn’t, so the document is sent to review. Reviewers work in a split-pane interface: the original page image in the left pane, with bounding-box overlays drawn from the assessment geometry highlighting where each value was found, and the extracted fields in the right pane, color-coded so that values below the confidence threshold stand out. Reviewers correct classifications, update extracted values, and mark sections complete. Role-based access keeps this orderly at scale. Reviewers handle the documents in their queue, while administrators manage configurations and users.

Importantly, those corrections do n’t stop at the individual document. They feed back into the solution’s evaluation baseline datasets, so the same reviewer effort that fixes one package also improves the schemas, prompts, and examples used for the next one. This human-in-the-loop process lets Built scale automation while preserving expert oversight where it matters most.

## Reasoning over documents

Extraction answers the question of what a document contains. Many real estate finance workflows also need to answer whether a document satisfies a requirement. This is the difference between pulling a coverage limit off an insurance certificate and determining whether that coverage meets the terms of the loan agreement. The solution supports this through a rule-validation workflow that evaluates documents against business rules in two steps.

First, a fact-extraction step sends the relevant document sections to Amazon Bedrock and gathers the facts that bear on a given policy area, along with references back to where each fact was found. Second, an orchestration step reasons over that curated evidence and returns a determination (compliant, non-compliant, or insufficient evidence) with citations to the supporting sections. The rules themselves are expressed as plain questions grouped into policy classes, which keeps them in language that subject matter experts can own:
    
    
    policy_classes:
      - policy_type: "loan_covenants"
        questions:
          - "Does the document specify a debt service coverage ratio requirement?"
          - "Is there a minimum net worth maintenance clause?"
          - "Are there restrictions on additional indebtedness?"
      - policy_type: "insurance_requirements"
        questions:
          - "Does the coverage meet the minimum limits in the loan agreement?"
          - "Is the lender listed as an additional insured or loss payee?"

Separating fact-finding from judgment is what makes this reliable on long, dense documents. The fact-extraction step concentrates the model’s attention on locating relevant clauses across a hundred-page agreement. The orchestration step can then weigh the evidence without being distracted by the rest of the document. This is the same agentic pattern described earlier identifying relevant sections, reasoning over obligations, and providing evidence for review.

## Why collaborative schemas and evaluations are critical

For agentic document processing to work in production, teams need more than prompts. They need shared definitions of what should be extracted, what a correct answer looks like, how accuracy is measured, and how changes are tested before deployment.

This is especially important in real estate finance because many extraction tasks are domain-specific. A generic model may understand the words in a loan agreement, appraisal, or insurance certificate, but Built’s teams need outputs that align with the business meaning of those documents.

The solution gives technical and non-technical teams a shared workspace for:

  * **Schema design** : Defining the fields, nested structures, and outputs that agents need.
  * **Extraction testing** : Running documents through processors and comparing outputs.
  * **Evaluation workflows** : Measuring accuracy against labeled examples and expected answers.
  * **Version management** : Tracking changes to schemas, prompts, and model configurations.
  * **Human feedback** : Capturing reviewer corrections and using them to improve future performance.



This collaboration is what makes the system scalable. Industry experts can shape the document understanding layer without requiring every change to become an engineering project. Engineering teams can operationalize those definitions through versioned schemas, evaluations, model orchestration, and deployment workflows.

The result is a document intelligence solution that improves over time and can support a broad portfolio of AI agents.

## Results and impact

Built’s AI-powered document intelligence solution creates a foundation for faster, more accurate, and scalable real estate finance workflows.

Key outcomes include:

  * **From days to minutes** : Classification and extraction workflows that previously took 3–9 days can now be completed in minutes per package.
  * **Support for complex documents** : The solution can process multi-hundred-page packages, nested tables, embedded images, scanned content, and non-standard layouts that are difficult for OCR-based systems.
  * **Scale across document types** : The architecture is designed to support more than 250 document types across real estate finance workflows. Production workload is being scaled to 20 million documents per month, 300,000 documents per week, over 50,000 batch processing runs.
  * **Horizontal reuse across agents** : The same document intelligence capabilities can power multiple agentic AI products across construction lending, insurance, underwriting, asset management, compliance, and portfolio intelligence.
  * **Production-scale throughput** : The team validated the pipeline through large batch processing runs and production-scale testing, including resolving Amazon Textract throttling limits when processing large documents at high concurrency.
  * **Evaluation-driven quality** : Built’s integration with evaluation workflows allows teams to test schema changes, compare model behavior, and maintain confidence thresholds before deploying changes into production.
  * **Human-in-the-loop trust** : Low-confidence or ambiguous outputs are routed to reviewers, preserving expert oversight while reducing manual effort.



## Conclusion

The collaboration between Built Technologies, AWS GenAIIC, and AND Digital demonstrates how generative AI can transform document-intensive workflows across real estate finance.

By using the AWS Intelligent Document Processing Accelerator and Amazon Bedrock, Built developed a reusable document intelligence solution that demonstrates how real estate finance companies can modernize document processing workflows. For Built, this capability is foundational to its AI strategy. Document intelligence is the horizontal layer that allows agents to understand real estate finance workflows, surface exceptions, accelerate decisions, and turn unstructured documents into trusted business actions.

To learn more about using Amazon Bedrock for document processing, see [Document processing with generative AI on AWS](<https://aws.amazon.com/ai/generative-ai/use-cases/document-processing/>).

To learn more about the GenAIIC program, see the [AWS Generative AI Innovation Center](<https://aws.amazon.com/ai/generative-ai/innovation-center/>).

To explore AND Digital’s AWS partnership capabilities, see [AND Digital’s AWS alliance](<https://www.and.digital/alliances/aws>).

Built is an AI-powered financial operations platform for the real estate and construction industries. By connecting capital providers, owners & developers, and builders, Built automates workflows, accelerates the flow of money and information, and unlocks insights for smarter decisions. More than 300 of the top financial institutions and thousands of owners and builders trust Built to manage hundreds of billions in real estate and construction activity, so you spend less time on process and more time on progress. Learn more at [getbuilt.com](<http://getbuilt.com>).

* * *

## About the authors

### Dipanshu Jain

Dipanshu is a Sr. AI Strategist at the AWS Generative AI Innovation Center, where he works with executives and builders driving customer engagements at the intersection of AI strategy and implementation. He works across healthcare, insurance, and enterprise SaaS, partnering with customers and AWS Partners to take solutions from prototype to production.

### Vincil Bishop, PhD

Vincil is a Senior Deep Learning Architect at AWS GenAIIC, where he provides technical leadership on intelligent document processing, foundation model implementation, and production generative AI architectures.

### Thomas Schlegel

Thomas is VP of Engineering at Built Technologies, where he leads engineering initiatives focused on AI, automation, and product innovation across real estate finance.

### Kiley Poole

[Kiley](<mailto:kiley.poole@getbuilt.com>) is a Senior Engineering Manager at Built Technologies where he manages engineering initiatives focused on AI, automation, and product innovation across real estate finance.

### Steve Van De Steene

Steve is Director of Product Management at AND Digital, where he helps organizations adopt AI-enabled products and solutions.

### Nick Federovitch

Nick is the Enterprise Account Manager for Built Technologies at AWS providing thought leadership and aligning programs and technical resources to support Built’s AI usage.

### Kyle Mabry

Kyle is the designated Sr. Solutions Architect for Built Technologies, leading the ECRT Industry TFC and delivering technical sessions to enable Built on AWS AI.
