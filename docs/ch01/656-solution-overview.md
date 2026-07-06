# Solution overview

## Ch01.656 Solution overview

> 📊 Level ⭐⭐ | 6.6KB | `entities/process-financial-documents-using-amazon-bedrock-data-automa.md`

# Solution overview

## 深度分析

---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/process-financial-documents-using-amazon-bedrock-data-automation/
ingested: 2026-05-28
feed_name: AWS China ML
source_published: 2026-05-27T21:28:53Z
---

# Process financial documents using Amazon Bedrock Data Automation

Financial institutions process thousands of documents daily, including tax forms, loan statements, and purchase orders. Each has a unique format, structure, and field names, making it challenging to create automation workflows using optical character recognition (OCR) software. [Amazon Bedrock Data Automation](<https://aws.amazon.com/bedrock/bda/>) (BDA) helps solve these challenges by automating the extraction, validation, and analysis of data from financial documents. BDA goes beyond simple OCR by using foundation models that can:

  * Understand document context
  * Recognize relationships between different sections
  * Extract structured, actionable data
  * Validate information across multiple sources

While foundation models like Anthropic Claude can [extract content](<https://docs.anthropic.com/en/docs/build-with-claude/pdf-support>) from PDFs, Amazon Bedrock Data Automation offers [custom extractions](<https://aws.amazon.com/blogs/machine-learning/scalable-intelligent-document-processing-using-amazon-bedrock-data-automation/>) with industry-leading accuracy at a lower cost, along with features such as visual grounding with confidence scores for explainability and built-in hallucination mitigation.

In this post, we explore how Amazon Bedrock Data Automation can accurately extract information from four common types of financial documents: bank statements, W-2 forms, 1099-B tax forms, and vendor contracts. We highlight the complexity in the documents, detail the custom extraction created in Amazon Bedrock Data Automation, and describe the outcomes of the extraction process.

## Solution overview

Amazon Bedrock Data Automation lets you configure output based on your processing needs using blueprints. A blueprint in Amazon Bedrock Data Automation is a configuration template that defines how data should be extracted from documents. It specifies:

  * The document type being processed
  * The data fields to be extracted
  * The validation rules for the extracted data
  * The structure and format of the output

Think of it as a map that tells Amazon Bedrock Data Automation exactly what information to look for and how to process it. When using a blueprint for extraction, you can use a catalog blueprint or a custom created blueprint. A custom blueprint allows organizations to create extraction patterns for their specific needs. In this post, we created custom blueprints and used the BDA console to generate and validate the output.

## How to develop blueprints for 4 types of financial documents

The following sections walk you through creating custom blueprints for bank statements, W-2 forms, 1099-B forms, and vendor contracts.

### Prerequisites

  * Active AWS account with appropriate IAM permissions ([sample policy from BDA workshop](<https://github.com/aws-samples/sample-document-processing-with-amazon-bedrock-data-automation>))
  * Model access must be granted (request access through AWS console)
  * Set up Amazon Bedrock Data Automation using the [Getting started with Amazon Bedrock](<https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started.html>) guide
  * Sample financial documents for testing

If you are not familiar with how custom blueprints are created, follow the instructions from the [Amazon Bedrock documentation](<https://docs.aws.amazon.com/bedrock/latest/userguide/bda-blueprints-console.html>). For our evaluation, we uploaded the documents on the BDA console, refined the AI-generated prompts, and downloaded the results. Typically, a single custom blueprint suffices for a specific document type when extracting consistent fields. However, if workflow requirements vary or document formats change significantly, multiple custom blueprints might need to be created to accommodate these differences. After a blueprint is created, you can use it as a part of the workflow for consistent downstream processing. For the same blueprint, if the input document has different data, then BDA might return slightly different output (for example, some bank statements might have total debits and credits). However, because BDA output is structured JSON, it is straightforward to create appropriate rules based on downstream processing workflows (for example, discard total if the workflow is to categorize individual debit and credit transactions for accounting).

The following screenshot illustrates the blueprint prompt for one of the document types.

The next section describes the four documents tried as a part of this project and extraction achieved using custom blueprints based on needs. Output is available in JSON, CSV, and raw data formats, highlighting the solution’s adaptability to diverse integration

## 相关实体
- [Automate Aml Alert Triage With Amazon Quick And Snowflake Co](ch11/202-amazon-quick.md)
- [How Aws Smgs Uses An Ai Powered Conversational Assistant To ](ch04/069-ai.md)
- [滴滴国际化客服质检智能化之路基于 Amazon Bedrock 的多语种多业务线质检实践](ch11/251-bedrock.md)
- [Comprehensive Observability For Amazon Sagemaker Ai Llm Infe](ch04/069-ai.md)
- [对抗 Agent 遗忘Kollab 基于Amazon Bedrock Agentcore 的团队Ai工作空间实践](ch04/069-ai.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/process-financial-documents-using-amazon-bedrock-data-automa.md)

## 相关主题

---

