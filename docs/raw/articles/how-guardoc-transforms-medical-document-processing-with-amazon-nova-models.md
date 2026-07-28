---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/how-guardoc-transforms-medical-document-processing-with-amazon-nova-models
ingested: 2026-07-28
feed_name: AWS China ML
source_published: 2026-07-27
sha256: 8723da59faf1d7f4a48413e1ad786016eae5e590d189c58c2bb5c23166a61da5
---

# How Guardoc transforms medical document processing with Amazon Nova models

Every day, nurses and care teams make critical decisions based on clinical documentation that is often fragmented, inconsistent, and prone to errors. Incomplete or inaccurate records increase cognitive load, introduce clinical risk, and create compliance challenges in an already demanding environment. Medical documentation must serve both patient outcomes and regulatory standards, yet too often it falls short on both fronts.

[Guardoc Health](<https://www.guardoc.health/>)’s mission is to unlock the full value of medical data by facilitating accurate, complete, and compliance-aligned clinical documentation, empowering nurses and care teams to deliver safer and higher-quality care. In this post, we explore how Guardoc Health uses the [Amazon Nova](<https://www.aboutamazon.com/news/aws/amazon-nova-artificial-intelligence-bedrock-aws>) family of models, available through [Amazon Bedrock](<https://aws.amazon.com/bedrock/>), to transform clinical documentation in long-term care.

With Amazon Nova models, Guardoc Health helps skilled nursing facilities and assisted living centers extract, classify, and act on complex documents faster and more accurately than manual review. This approach helps healthcare organizations reduce the hundreds of millions of dollars spent annually on manual document processing across the United States. Guardoc reports a 46 percent reduction in documentation errors, 70 percent fewer audit fines, and over $400K in annual return on investment (ROI) for a single facility.

## Medical documents don’t follow rules

Medical records arrive in every format imaginable. In a single day, a healthcare organization might process:

  * Multi-page PDFs with handwritten physician annotations alongside printed text.
  * Prior authorization forms where checkbox states determine coverage decisions. A prior authorization form is a document the doctor or pharmacist fills out so a health-insurance plan can approve certain medical services, procedures, or medications.
  * Medication lists embedded in tables, free text, or scanned images.
  * Patient intake forms combining typed fields, handwriting, and rubber stamps.



According to research published in BMJ Quality and Safety [1](<https://qualitysafety.bmj.com/content/23/9/727>), diagnostic errors affect approximately 12 million U.S. adults each year in outpatient care, with information-handling failures identified as a contributing factor. Guardoc Health was built to address this variable. For Guardoc Health, the challenge is scale combined with precision. On peak days, they process more than 1 million documents. At that volume, even a 1 percent error rate in condition detection generates thousands of incorrect records daily, each one a potential patient safety risk or compliance liability.

Achieving this required solving three of the hardest challenges in clinical document processing: detecting special medical conditions from patient records with high recall, reliably interpreting PDF checkboxes across dozens of form types, and accurately extracting information from documents that mix formats within a single page.

## The solution: Amazon Nova models on Amazon Bedrock

Guardoc Health built its pipeline on the Amazon Nova family of models and Amazon Bedrock, combining several AWS services to handle each stage of document processing. The following sections describe how each part works.

### Medical condition classification with RAG

Guardoc Health uses Retrieval Augmented Generation (RAG) to identify medical conditions from patient records. RAG is a technique in which a model first retrieves relevant information from an external source, then uses that context to generate a more accurate response. In this pipeline, Guardoc retrieves evidence directly from a patient’s own documentation and reasons across it to produce a final classification.

_Figure 1 — The Guardoc retrieval-augmented generation pipeline_

As shown in the preceding diagram, the pipeline runs in the following order:

  1. Incoming patient documents pass through [Amazon Textract](<https://aws.amazon.com/textract/>), which extracts text and structural metadata from each page. This is the first stage of the pipeline for a comprehensive extraction at a low per-page cost. Amazon Textract is an AWS machine learning (ML) service that automatically extracts text, handwriting, forms, tables, and layout information from scanned documents and PDFs. It goes beyond basic optical character recognition (OCR) by identifying structure, so the output is usable in downstream apps and document workflows.
  2. The extracted content is chunked along boundaries appropriate to the document type, so chunks correspond to meaningful clinical units rather than arbitrary byte ranges. Chunks are smaller segments of the document aligned to meaningful clinical boundaries such as a medication list, a diagnosis section, or a physician note, rather than split arbitrarily by character count or byte size. This makes sure that when the pipeline searches for relevant information, it retrieves complete, coherent clinical units rather than fragments that lack the context needed for accurate classification.
  3. Each chunk is embedded using [Amazon Titan Text Embeddings V2](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-amazon-titan-text-embeddings-v2.html>) and stored in [Amazon DynamoDB](<https://aws.amazon.com/dynamodb/>), partitioned by patient so retrieval doesn’t cross patient boundaries.
  4. Before retrieval begins, a custom pre-filter narrows the candidate set by evaluating document type, recency, and patient-context signals. This step removes irrelevant documents early in the pipeline, reducing the volume of content that needs to be searched and lowering the overall cost of retrieval.
  5. Within the pre-filtered set, an in-memory k-nearest neighbor (k-NN) search retrieves the chunks most relevant to the condition classification query. k-NN is a technique that identifies the most similar items by measuring the distance between vector representations, returning the closest matches to the query. Because retrieval is scoped per patient, the system scales horizontally with patient volume without relying on a shared vector index. This stage returns page references only, keeping data transfer lightweight before the more intensive multimodal step that follows.
  6. The pages identified in the previous step pass through [Amazon Nova 2 Lite](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-amazon-nova-2-lite.html>), a lightweight, cost-efficient model that performs a text-based review to remove obvious non-matches before the pipeline advances to the more computationally intensive multimodal step. Amazon Nova 2 Lite is a low-cost, multimodal foundation model (FM) in the Amazon Nova family, designed for fast, affordable processing of text, images, and video inputs.
  7. The pages that survive all prior stages reach Amazon Nova Pro along with the raw PDF bytes. The Nova model reasons over layout, handwriting, signatures, stamps, and other visual context to produce the final classification, and every output resolves back to the specific source page it came from.



The pipeline follows a deliberate cost-tiering principle. Each stage uses the least expensive component capable of the work. Amazon Titan Text Embeddings and Amazon Nova 2 Lite handle high-volume, lightweight tasks such as embedding, indexing, and coarse filtering, while Amazon Nova Pro is reserved for the final stage where multimodal reasoning over raw PDF bytes is required.

Every classification produced by the pipeline traces back to a specific source page in the original document. In a clinical setting, where decisions carry direct patient safety implications, Guardoc Health treats this level of traceability as non-negotiable.

Guardoc operates multiple document processing pipelines, each purpose-built to address a specific clinical challenge across extraction, classification, and search, as described in the following sections.

### PDF processing with Amazon Nova family of models

Most medical documents exist natively as PDFs, whether scanned, photographed, or born-digital, and processing them accurately requires a model that reads pages visually rather than as plain text. During evaluation, Amazon Nova Pro demonstrated a meaningful improvement in multimodal PDF handling, including layout interpretation, form structure, checkbox states, signatures, handwritten annotations, and the spatial relationships between fields on a page.

This improvement is what makes Amazon Nova Pro viable as the core multimodal component in the Guardoc pipeline. Condition classification, handwriting interpretation, and medication extraction all depend on reading pages as they actually exist, with annotations, corrections, and layout cues intact. The capability is consistent across document types including checkboxes, handwriting, multi-column medication lists, stamped attestations, and struck-through edits, all read as visual documents rather than text streams, and that is what makes the rest of the multimodal stack possible.

### Handwriting recognition

Real-world medical documents include handwriting. Physician notes, patient signatures, annotation fields, and amendments to printed forms all arrive in freehand. Amazon Nova family of models handles these accurately, including cursive text, clinical shorthand, and mixed print-and-handwritten pages.

For Guardoc Health, this capability is most critical in two document types. The first is physician attestation fields on prior authorization forms, where a handwritten note can override a printed checkbox. The second is patient-reported symptom sections, where handwriting often carries information not captured elsewhere in the record. Missing this text was a significant source of information loss in earlier pipeline versions for Guardoc Health.

### Hybrid OCR pipeline for medication extraction

Medication data is among the most consequential content in a patient record. Drug names, dosages, routes, and frequencies feed directly into clinical decision-making, and getting any of them wrong has patient-safety implications. Medication reconciliation, prior authorization, and coverage decisions all depend on extracting this information accurately from documents that rarely present it cleanly.

The challenge is variety. Medications show up in structured tables, in unstructured prose within physician notes, in handwritten additions to printed lists, and in scanned pages that have been faxed or photographed through multiple hands. A single patient chart can contain all of these formats on different pages.

Guardoc Health runs a hybrid pipeline that pairs Amazon Textract with Amazon Nova family of models:

  * Amazon Textract performs OCR, producing structured output with bounding boxes, table structures, and form field recognition. For clean tables and printed medication lists, Amazon Textract is fast, cost-efficient, and accurate.
  * Amazon Nova Pro receives both the original PDF and the Amazon Textract output, which includes machine-readable text alongside the visual layout of the source page.
  * Amazon Nova models complement Amazon Textract by resolving complex extraction scenarios including medications split across wrapped table columns, handwritten additions to printed lists, non-standard table formats, and inline mentions buried in physician notes.



In the pipeline, each component handles what it does best. Amazon Textract processes high-volume, structured extraction while the Amazon Nova family of models applies multimodal reasoning to handle the more complex cases. The result is medication data that downstream clinical workflows can act on directly, without the need for manual reconciliation.

## Business impact

Documentation errors carry both clinical and financial consequences. Missed or inaccurate documentation can result in denied claims, audit fines, lost reimbursement under the Patient-Driven Payment Model (PDPM), a Medicare payment system for skilled nursing facilities where reimbursement is tied directly to the accuracy of clinical documentation, and increased litigation exposure.

The results from Guardoc deployments reflect this impact. In a quarterly deployment across two facilities covering 200 patients, Guardoc drove 847 documentation corrections, addressed 86 PDPM-impact issues, and was associated with a 74 percent reduction in hospital transfers per 100 admissions. This last figure is particularly significant, as hospital transfers represent one of the most costly and destabilizing events in long-term care, both for patients and for facility operations.

In a broader case study spanning seven facilities and 1,618 residents served, Guardoc identified 10,612 issues and improved visibility into facility-level risk patterns. This scale of issue detection matters because documentation problems in long-term care rarely surface until they trigger a denied claim or regulatory audit, making proactive identification a meaningful operational advantage. A separate quarterly analysis reported an average 46 percent reduction in documentation errors, with outcomes including over $400K in annual ROI for a single facility, a 70 percent reduction in audit fines, and a 65 percent reduction in litigation exposure, demonstrating that improvements in documentation accuracy translate directly into measurable financial and compliance outcomes for facilities.

Clinical documentation in long-term care is a high-stakes problem that has historically resisted automation. Documents are messy, formats vary widely, and the consequences of errors extend from patient safety to regulatory compliance to financial performance. Guardoc demonstrates that a well-architected pipeline, built on the right combination of AWS services, can address this problem at scale. By combining Amazon Textract, Amazon Titan Text Embeddings V2, Amazon DynamoDB, and the Amazon Nova family of models available through Amazon Bedrock, Guardoc delivers accurate, traceable, and cost-efficient document processing across some of the most complex document types in healthcare.

> _“With the Nova family, we’re making it easier for healthcare organizations to detect high-risk cases earlier and act before issues become costly. By automating workflows that once required manual oversight, the Nova family helps teams reduce compliance gaps, prevent errors, and focus more of their time on improving patient outcomes.”_

— Assaf Amiaz, Director of Product, Guardoc Health

The results across facilities and patient populations show that better documentation is not just an operational improvement. It’s a meaningful step toward safer, higher-quality care.

## What’s next for Guardoc Health with Amazon Nova family of models

Guardoc’s roadmap expands beyond compliance into the broader clinical workflow. Planned modules include AI NoteAssist, MDSAssist, CarePlanAssist, AdmissionAssist, and Pharmacy Reconciliation, designed to help teams document accurately, reduce manual workload, and move efficiently through the full clinical workflow inside the electronic health record (EHR) system.

The expanded context windows in the Amazon Nova 2 family of models make multi-document reasoning more tractable, enabling the pipeline to reason across larger volumes of clinical content in a single pass. Continued improvements in multimodal capabilities are steadily reducing the edge cases, such as degraded scans, mixed-format pages, and non-standard layouts, that currently require human review. The direction of the underlying system aligns closely with the demands of the problem Guardoc Health is solving.

## Conclusion

Medical document processing is one of the highest-stakes applications of AI in enterprise. Document diversity is extreme, the margin for error is narrow, and the consequences of failure are real, measured in delayed care, compliance risk, and unnecessary cost.

For healthcare organizations evaluating AI for clinical document processing, the practical guidance is straightforward: benchmark on your actual document types, measure recall and precision separately, and set confidence thresholds that reflect the real cost of each error type. The Amazon Nova family of models and Amazon Bedrock provide the infrastructure and the flexibility to build pipelines that hold up in production, not just in demos. The work lies in calibrating that infrastructure to the specific demands of your workflows, your document types, and the patients whose records depend on getting it right.

**About Guardoc**

Guardoc Health is an AI-powered clinical OS company helping long-term care teams across skilled nursing facilities (SNFs) and assisted living facilities (ALFs) improve documentation and reduce risk. Website: [www.guardoc.health](<https://www.guardoc.health>) | Contact: [info@guardoc.health](<mailto:info@guardoc.health>)

**About Amazon Nova**

Amazon Nova is a family of foundation models from Amazon, available through Amazon Bedrock. Nova models support text, image, and document inputs, with capabilities optimized for enterprise workloads including document processing, information extraction, and multimodal reasoning. Nova Pro delivers leading performance on complex document tasks, including PDF processing, handwriting recognition, and structured data extraction. Get started with [Amazon Bedrock](<http://aws.amazon.com/bedrock>).

* * *

## About the authors

### Wrick Talukdar

Wrick is a Tech Lead and Senior Generative AI Specialist at Amazon Web Services, driving innovation through multimodal AI, generative models, computer vision, and natural language processing. He is also an award winning author of the bestselling book “Building Agentic AI Systems”. He is a keynote speaker and often presents his innovations and solutions at leading global forums, including AWS re:Invent, ICCE, Global Consumer Technology conference, and major industry events such as CERAWeek and ADIPEC. In his free time, he enjoys writing and birding photography.

### Erez Weinstein

Erez is a Solutions Architect at AWS on the Israel Startup team, where he works with startups building agentic AI and cybersecurity products. He specializes in agent architectures, evaluation, and security in agentic systems on AWS. He has contributed an AgentCore implementation to AWS Labs and is regularly hosted at community events and webinars, speaking on security in the agentic era. Erez brings years of industry experience in software and SRE engineering, including teams leadership.

### Nir Shtein

Nir is VP R&D at Guardoc Health, where he leads the company’s engineering organization and technology execution. He focuses on building scalable AI and cloud systems for healthcare operations, bringing LLM-powered workflows into production, and helping teams deliver reliable products quickly. Nir is also a public speaker and author of _Microservices with Go_.

### Anatol Zakrividoroga

Anatol is Tech Lead and Staff Engineer at Guardoc Health, where he leads engineering across the company and architects the AI systems and infrastructure that power the platform. He works at the intersection of applied AI and large-scale systems — designing LLM-powered pipelines for production, building on DynamoDB and modern cloud primitives, and contributing actively to open source. Anatol is also a public speaker who enjoys sharing hard-won lessons on AI, databases, and modern architectures.