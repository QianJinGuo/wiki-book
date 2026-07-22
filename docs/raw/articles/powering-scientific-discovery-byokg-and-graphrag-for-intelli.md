---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/powering-scientific-discovery-byokg-and-graphrag-for-intelligent-pharmaceutical-research
ingested: 2026-07-09
feed_name: AWS China ML
source_published: 2026-07-08
sha256: "861428ff83b36b34718d0f75443deec9e27d797641c5d03c7134333727fa3890"
---

# Powering scientific discovery: BYOKG and GraphRAG for intelligent pharmaceutical research

In pharmaceutical research, scientists face a fundamental challenge: accessing and connecting the vast amount of scientific knowledge scattered across disparate systems. From published literature and internal lab notes to genomics databases, critical insights remain trapped in silos, making it difficult for researchers to form comprehensive connections and generate promising hypotheses. This fragmentation slows down the drug discovery process. It also risks valuable institutional knowledge being lost as researchers transition, ultimately affecting the industry’s ability to research and develop efficiently. The need for a solution that can intelligently bridge these knowledge gaps while maintaining scientific integrity has become increasingly important.

## The challenge: Scattered data across fragmented systems

At leading pharmaceutical companies, researchers face a critical challenge in early-stage drug discovery, where traditional methods yield only a 5 percent success rate and initial screening takes over six months. Scientists struggle to connect insights buried across fragmented systems such as PubMed, internal lab notes, and genomics databases, all while racing against competitors and time constraints. The scattered nature of data leads to redundant work and missed opportunities. It also makes it difficult to trace the evidence trail needed for regulatory approval. When researchers depart, they often take valuable tacit knowledge with them, further compromising the institutional memory needed for breakthrough discoveries.

Challenges in early-stage drug discovery:

  1. Poor success rate and time efficiency – Only 5 percent hit rate with over 6 months of screening time per attempt.
  2. Fragmented knowledge systems – Critical insights scattered across PubMed, lab notes, and databases, leading to missed connections.
  3. Loss of institutional memory – Valuable knowledge disappears when researchers leave, breaking continuity in research efforts.



These challenges collectively create a significant bottleneck in the drug discovery pipeline, leading to inefficiencies, missed opportunities, and potential delays in developing life-saving treatments. Our solution addresses these bottlenecks by moving beyond traditional methods: graph-powered AI supports pharmaceutical research by creating an interconnected knowledge environment. Using [Amazon Neptune Analytics](<https://docs.aws.amazon.com/neptune-analytics/latest/userguide/what-is-neptune-analytics.html>), researchers can now ask complex questions in natural language and receive instant, evidence-backed insights drawn from a unified knowledge graph that connects everything from compound interactions to gene expressions and clinical studies. This approach doesn’t only provide answers. It reveals the complete reasoning behind each result by showing detailed citation paths and graph traversal steps. By exposing how the system navigates through interconnected research papers and data points, it makes scientific discovery more transparent and reproducible.

By combining graph and generative AI, research scientists don’t only retrieve information. They can amplify reasoning, preserve institutional memory, and surface insights that would otherwise stay buried. It also helps them generate better hypotheses, move faster, and trust the outputs, because every insight comes with context and proof. In a field where the cost of delay is measured in both dollars and lives, this shift is more than helpful. It changes how research gets done.

In this post, we explore how Graph-based Retrieval Augmented Generation (GraphRAG) is transforming scientific research by combining graph databases with generative AI. With this approach, you can accelerate discovery processes without compromising scientific integrity.

By integrating Amazon Neptune Analytics for high-performance graph processing with Amazon Bedrock, researchers can build sophisticated systems that not only understand complex scientific relationships but also provide intuitive natural language interfaces. The GraphRAG architecture helps enhance the quality of AI-generated responses by intelligently traversing knowledge graphs to identify relevant information paths. This makes sure that the responses are firmly anchored in verified scientific data.

What makes this solution powerful for scientific research is its ability to understand and connect intricate relationships between entities, from plants and compounds to proteins, genes, and their associated health effects. With this comprehensive understanding, researchers can uncover insights more efficiently and make data-driven decisions with greater confidence.

## Solution overview

The solution reimagines the research process through a Bring Your Own Knowledge Graph (BYOKG) approach enhanced with GraphRAG capabilities. A knowledge graph is a structured representation of information that shows relationships between different entities as a network of interconnected nodes and edges. Powered by Amazon Neptune, it integrates diverse scientific entities (plants, compounds, genes, proteins, and health effects) into a unified knowledge network that bridges data from public sources like PubMed and Gene Ontology with proprietary datasets. Automated ingestion pipelines and graph algorithms continuously enrich the graph, helping researchers uncover complex biological relationships and insights that were previously hidden across disconnected data silos.

Using Neptune Analytics and Amazon Bedrock, the solution combines graph algorithms with natural language querying to make scientific exploration both analytical and intuitive. Researchers can ask complex questions in plain English and receive evidence-based answers derived from graph traversal, complete with source citations and visual pathways. Interactive visualization tools further help enhance transparency and understanding, allowing users to explore relationships, trace hypotheses to conclusions, and validate results with clear, verifiable evidence. This accelerates discovery and strengthens scientific rigor across domains.

## Solution architecture

Our solution helps researchers quickly discover relevant medical journal articles across conditions and topics. The dataset includes the HCLS journal articles provided by the [PMC Open Access Subset](<https://pmc.ncbi.nlm.nih.gov/tools/openftlist/>) licensed with CC BY and CC0 licenses, journal metadata provided by the National Center for Biotechnology Information (NCBI) via the [Bio.Entrez](<https://biopython.org/docs/1.75/api/Bio.Entrez.html>) package, [Disease Ontology](<https://disease-ontology.org/>) hierarchies, and ICD10 codes that have been extracted using the [ICD-10-CM linking](<https://docs.aws.amazon.com/comprehend-medical/latest/dev/ontology-icd10.html>) API within Amazon Comprehend Medical. Although the final dataset is provided to you, the following architecture depicts the flow used to create the dataset.

The following diagram illustrates the loading of the data to Amazon Neptune Analytics using services like Amazon Bedrock and Amazon Comprehend to extract data from medical journals.

The following image represents the final graph, which contains these node types:

  * **disease** : Represents a disease within the [Disease Ontology](<https://github.com/DiseaseOntology/HumanDiseaseOntology/tree/main>). The Disease Ontology provides a mapping to help us understand which diseases are subclasses of other diseases.
  * **author** : Represents an author of a particular journal.
  * **journal** : Represents a journal.
  * **journalChunk** : Represents a chunk of a given journal. Chunks were determined using the default chunking strategy provided through Amazon Bedrock Knowledge Bases.
  * **icd10** : Represents an [ICD-10](<https://www.cms.gov/medicare/coding-billing/icd-10-codes>) code, which is a standardized classification of medical issues. Edges between `icd10` nodes and `journal` and `journalChunk` nodes were created using the Amazon Comprehend Medical [ICD-10-CM linking](<https://docs.aws.amazon.com/comprehend-medical/latest/dev/ontology-icd10.html>).



Because we’re using our own graph data model, we use the [BYOKG-RAG](<https://github.com/awslabs/graphrag-toolkit/tree/main/byokg-rag>) toolkit to implement natural language querying over the graph. The following diagram illustrates the components of BYOKG.

## Prerequisites

Before getting started, make sure you have the following prerequisites:

  * AWS Command Line Interface (AWS CLI) version 2.11.0 or later installed and configured ([installation guide](<https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html>))
  * Access to the following AWS services: 
    * Amazon Neptune Analytics
    * Amazon Bedrock (Claude 4.5 Sonnet model)
    * Amazon SageMaker
    * Amazon Simple Storage Service (Amazon S3)
    * Amazon Comprehend Medical
  * IAM role with the following permissions: 
    * NeptuneAnalyticsFullAccess
    * AWSServiceRoleForAmazonNeptuneAnalytics
    * AmazonS3ReadOnlyAccess
    * AmazonBedrockFullAccess
    * ComprehendMedicalFullAccess
  * Python 3.9 or later
  * graphrag_toolkit version 1.0.0 or later
  * Jupyter Notebook environment



## Solution cost overview

Cost approximation (per hour) for running this demo:

  * Neptune Analytics graph, 16 mNCU, no standby, public connectivity – $0.48/hour.
  * SageMaker Jupyter notebook, t3.medium with 5 GB of EBS volume – $0.05/hour for compute plus $0.70/hour for storage.
  * S3 storage, standard, 161 MB – 0.161 GB × $0.023 = $0.0037 per month.
  * Amazon Bedrock – The cost for Amazon Bedrock depends on model usage and token consumption. For the most up-to-date information, see the [pricing page](<https://aws.amazon.com/bedrock/pricing/>).



## Setting up Neptune Analytics

Let’s begin implementing your GraphRAG solution by setting up Neptune Analytics. The following steps will guide you through data import, graph creation, and notebook configuration to build your knowledge graph foundation:

  1. Create an S3 bucket: `aws s3 mb s3://amzn-s3-bucket-name`.
  2. Copy the dataset into your own buckets using the AWS CLI: 
         
         aws s3 sync s3://aws-neptune-customer-samples-us-east-1/sample-notebooks/vector-graph-hybrid-search/graph-data/ s3://amzn-s3-bucket-name/<YOUR PREFIX>

  3. Create a Neptune Analytics graph using the `CreateGraphUsingImportTask` API to import from the Amazon S3 location you copied to in the first step. For details on how to do this, see the [Neptune Analytics User Guide](<https://docs.aws.amazon.com/neptune-analytics/latest/userguide/bulk-import-create-from-s3.html#use-createGraphUsingImportTask-to-import>). Set the minimum and maximum provisioned memory to 16.
  4. While the graph is creating, create a Neptune Notebook associated with the graph. The notebook makes it straightforward to query and interact with the graph, as well as set up and run the GraphRAG Toolkit. For details on how to create a Neptune Notebook, see the [Neptune Analytics User Guide](<https://docs.aws.amazon.com/neptune-analytics/latest/userguide/create-notebook-console.html>).
  5. Download the [sample notebook](<https://gist.github.com/jagadishkmar/dc42495c52d89d128d5e88134d47023e>), and upload it to your Jupyter environment.



## Implementation steps: Building a modular GraphRAG system with the GraphRAG Toolkit and Amazon Bedrock

In this [notebook](<https://gist.github.com/jagadishkmar/dc42495c52d89d128d5e88134d47023e>), we demonstrate a modular approach to building a Retrieval Augmented Generation (RAG) system over a healthcare knowledge graph, using the [graphrag-toolkit](<https://github.com/awslabs/graphrag-toolkit>) Python package and the Amazon Bedrock Anthropic Claude 4.5 Sonnet model. This solution supports natural language querying and entity linking within a knowledge graph, combining advanced language model generation with structured graph data retrieval.

### Key components

  1. **Language model initialization**  
We begin by initializing the Amazon Bedrock-based language model generator that powers our natural language responses.


    
    
    from graphrag_toolkit.byokg_rag.llm import BedrockGenerator
    
    def init_llm_generator(model_name='us.anthropic.claude-3-5-sonnet-20240620-v1:0', region_name='us-west-2'):
        return BedrockGenerator(
            model_name=model_name,
            region_name=region_name
        )
    
    llm_generator = init_llm_generator()

  2. **Knowledge graph linker setup** The `KGLinker` is initialized by passing the graph store and the language model generator. It acts as the core interface to query the graph and generate answers.


    
    
    from graphrag_toolkit.byokg_rag.graph_connectors import KGLinker
    
    def init_kg_linker(graph_store, llm_generator):
        return KGLinker(graph_store=graph_store, llm_generator=llm_generator)
    
    kg_linker = init_kg_linker(graph_store, llm_generator)

  3. **Generating responses from queries**  
With the `kg_linker`, we can pose natural language questions and obtain generated responses augmented by the knowledge graph context.


    
    
    def generate_kg_response(kg_linker, question, schema, graph_context="Not provided. Use the above schema to understand the graph."):
        return kg_linker.generate_response(
            question=question,
            schema=schema,
            graph_context=graph_context
        )
    
    # Example usage
    response = generate_kg_response(kg_linker, question, schema)
    print(response)

  4. **Entity linking for enhanced retrieval**  
To improve information extraction and link natural language text to graph entities, we use a fuzzy string index combined with the `EntityLinker`.


    
    
    from graphrag_toolkit.byokg_rag.indexing import FuzzyStringIndex
    from graphrag_toolkit.byokg_rag.graph_retrievers import EntityLinker
    
    def init_and_link_entities(graph_store, artifacts):
        string_index = FuzzyStringIndex()
        string_index.add(graph_store.nodes())
        retriever = string_index.as_entity_matcher()
        entity_linker = EntityLinker(retriever=retriever)
    
        linked_entities = entity_linker.link(artifacts["entity-extraction"], return_dict=False)
        linked_answers = entity_linker.link(artifacts["draft-answer-generation"], return_dict=False)
    
        return entity_linker, linked_entities, linked_answers
    
    entity_linker, linked_entities, linked_answers = init_and_link_entities(graph_store, artifacts)

### Summary

This modular structure cleanly separates the following components:

  * Large language model (LLM) initialization (using Amazon Bedrock).
  * Knowledge graph interfacing (`KGLinker`).
  * NLP (natural language querying).
  * Entity linking on graph nodes.



The modular structure allows flexible experimentation and straightforward extension for different domains or datasets.

The integration of a fuzzy string matcher facilitates robust entity recognition, which is important in noisy or complex healthcare data contexts.

By combining the Amazon Bedrock advanced language models with structured graph querying and linking, this solution forms a powerful foundation for context-aware question answering and information retrieval over knowledge graphs.

## Solution benefits and performance metrics

The following key performance indicators from our implementation of the solution demonstrate how this GraphRAG solution can create measurable value and competitive advantage for pharmaceutical research organizations:

  * **Research timeline acceleration –** GraphRAG reduces research cycles from six months to three weeks, delivering an 87 percent efficiency boost. This supports rapid hypothesis testing and faster scientific breakthroughs.
  * **Success rate optimization –**  GraphRAG reduced research cycles in our implementation from six months to three weeks. The solution is powered by advanced graph algorithms. Cross-domain analysis facilitates more effective research directions and optimal resource deployment.
  * **Workflow efficiency gains –** Key metrics show measurable improvements in our tests: 70 percent reduction in review time, 85 percent faster data access, and 90 percent enhanced knowledge use. Teams can focus on strategic research priorities.
  * **Data-driven validation –**  Advanced tracking and visualization facilitate full research transparency. Clear data pathways strengthen regulatory compliance and improve scientific communication.
  * **Intelligent knowledge integration –**  The system efficiently scales and integrates new data sources with minimal resource impact. Enhanced collaboration preserves vital institutional knowledge.
  * **Industry leadership enablement –**  Accelerated innovation cycles maintain scientific rigor while speeding industry entry. This helps create sustainable competitive advantages and industry leadership positions.



## Clean up

To avoid incurring additional charges, clean up the resources created in this post.

  * Delete the Neptune Analytics graph by following these [steps](<https://docs.aws.amazon.com/neptune-analytics/latest/userguide/managing-deleting.html>) or by running the following CLI command.  
**Note:** Replace g-sample with the graph created.  
`aws neptune-graph delete-graph --graph-id g-sample`
  * Delete the graph notebook created in the AWS Management Console by selecting the instance, choosing the A**ctions** menu, and selecting the **Delete** option.



  * Delete the S3 bucket created by following these [steps](<https://docs.aws.amazon.com/AmazonS3/latest/userguide/delete-bucket.html>) or by running the CLI command.  
**Note:** Replace amzn-s3-bucket-name with the name of the bucket created.  
`aws s3 rb s3://amzn-s3-bucket-name --force`



## Conclusion

The integration of GraphRAG technology with Amazon Neptune Analytics and Amazon Bedrock represents a significant advancement in scientific research methodology. Researchers can now connect previously siloed data sources, interact with complex datasets using natural language queries, and visualize intricate relationships. This solution can deliver immediate, measurable impact for research organizations by reducing research cycle times by up to 87 percent and increasing discovery hit rates five-fold. It not only accelerates the pace of discovery but also helps enhance the quality and credibility of scientific findings. This solution supports rapid scientific advancements, potentially leading to outcomes that were unattainable within traditional research timeframes. Organizations that adopt [generative AI solutions](<https://aws.amazon.com/health/gen-ai/>) are not only improving their research processes. They are positioning themselves at the forefront of scientific innovation, ready to tackle the most complex challenges of our time with greater speed and accuracy.

* * *

## About the authors

### Jasmine Rasheed Syed

Jasmine is a Sr. Customer Solutions Manager at AWS, focused on accelerating time to value for customers on their cloud and AI journey by adopting best practices, mechanisms, and AI-powered solutions to transform their business at scale. He partners with customers to identify high-impact AI/ML use cases and helps them move from experimentation to production faster. Jasmine is a seasoned, results-oriented leader with 22+ years of experience in Insurance, Retail & CPG, and Media & Entertainment. He brings a unique ability to bridge the gap between cutting-edge AI capabilities and real-world business outcomes, enabling organizations to harness the full potential of generative AI, machine learning, and data-driven decision-making.

### Jagadish Maripi

Jagadish is a Solutions Architect at AWS with over 20 years of experience architecting enterprise applications and implementing DevOps practices. He is passionate about helping customers build secure, scalable architectures and accelerating delivery through automation and modern cloud-native patterns. He enjoys sharing knowledge and exploring emerging technologies with the broader community.

### Ramprasath S

Ramprasath is a Senior Applied AI Architect at AWS, specializing in enterprise-scale Generative AI and agentic workflows. He turns complex ML and cloud challenges into production-ready solutions, with deep expertise in Amazon Bedrock, SageMaker, and multi-agent orchestration. He is passionate about AI safety, model evaluation, and sharing best practices with the AWS community.

### Oscar Hernandez

Oscar is a Senior Account Executive at AWS, focused on driving AI workload adoption and cloud strategy for global enterprises. He works with executive leaders to identify high-impact AI opportunities and build long-term technology roadmaps that deliver sustained business value. With over 15 years of experience in cloud and enterprise technology, Oscar specializes in helping customers navigate rapid technological change and accelerate production AI deployments at scale.
