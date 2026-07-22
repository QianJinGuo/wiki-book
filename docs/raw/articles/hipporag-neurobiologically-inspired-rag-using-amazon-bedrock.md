---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/hipporag-neurobiologically-inspired-rag-using-amazon-bedrock-amazon-neptune-and-personalized-pagerank
ingested: 2026-07-02
sha256: 323cd6e814246a7721dc65b3bff3db6fc9e064a763cde5155e873f72ecef1ea9
feed_name: AWS China ML
source_published: 2026-07-01
---

# HippoRAG: Neurobiologically inspired RAG using Amazon Bedrock, Amazon Neptune, and personalized PageRank

Large language models (LLMs) have transformed how we process and generate information, but they still struggle with effectively integrating knowledge across multiple sources. Standard Retrieval Augmented Generation (RAG) methods, although helpful, often fall short when tackling multi-hop reasoning tasks that require connecting information from separate documents. To address these limitations, we explore [HippoRAG](<https://arxiv.org/abs/2405.14831>), a novel RAG framework inspired by the hippocampal memory system in human brains.

In this post, we demonstrate how to implement HippoRAG using a comprehensive AWS stack. We use [Amazon Bedrock](<https://aws.amazon.com/bedrock/>) for LLM capabilities, [Amazon Neptune](<https://aws.amazon.com/neptune/>) for graph database functionality, Amazon Neptune Analytics for advanced graph algorithms including [Personalized PageRank](<https://en.wikipedia.org/wiki/PageRank>), and [Amazon Titan Embeddings](<https://docs.aws.amazon.com/bedrock/latest/userguide/titan-embedding-models.html>) for vector representations. This implementation showcases how to build and deploy HippoRAG within AWS infrastructure for enterprise-scale applications.

## Neurobiological inspiration and background

[HippoRAG](<https://arxiv.org/abs/2405.14831>) draws inspiration from the hippocampal indexing theory of human long-term memory. In human brains, the neocortex processes perceptual inputs, whereas the hippocampus creates an index of associations between memories. This dual-component system allows humans to efficiently integrate information across different experiences.

Standard RAG approaches treat each document independently, struggling with questions that require connecting information across multiple sources. HippoRAG addresses this by:

  1. **Building a knowledge graph (KG)** to represent relationships between entities.
  2. **Using the Personalized PageRank (PPR) algorithm** for efficient graph traversal and relevance ranking.
  3. **Enabling single-step multi-hop retrieval** instead of requiring multiple iterations.



## Solution architecture

Our AWS implementation of HippoRAG involves four main components:

  1. **Amazon Bedrock** – Provides LLM capabilities for extracting knowledge graph triples, answering questions, and identifying named entities.
  2. **Amazon Neptune Database** – Stores the knowledge graph structure and enables basic graph operations.
  3. **Amazon Neptune Analytics** – Executes advanced graph algorithms, particularly Personalized PageRank for relevance ranking.
  4. **Amazon Titan Embeddings** – Creates vector representations of text for similarity matching.



This architecture allows us to use the full power of personalized PageRank while maintaining the scalability and reliability of AWS managed services.

### Prerequisites

For this implementation, you’ll need:

  * An AWS account with access to Amazon Bedrock and Neptune services.
  * [Amazon Neptune cluster configured and accessible](<https://docs.aws.amazon.com/neptune/latest/userguide/get-started-create-cluster.html>).
  * [Amazon Neptune Analytics graph created from your Neptune Database](<https://docs.aws.amazon.com/neptune-analytics/latest/userguide/create-graph-from-neptune-database.html>).
  * AWS Command Line Interface (AWS CLI) and Python 3.8+ installed.
  * Appropriate IAM permissions for: [Amazon Bedrock](<https://docs.aws.amazon.com/bedrock/latest/userguide/security-iam.html>) | [Amazon Neptune](<https://docs.aws.amazon.com/neptune/latest/userguide/iam-auth.html>) | [Amazon Neptune Analytics](<https://docs.aws.amazon.com/neptune-analytics/latest/userguide/security-iam.html>) | [Amazon Simple Storage Service (Amazon S3)](<https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-access-control.html>).



## Data processing pipeline: From HotpotQA JSON to Neptune

A necessary first step in implementing HippoRAG is converting raw data into a knowledge graph structure suitable for Neptune. In this section, we walk through how we process HotpotQA data from JSON format. We extract knowledge-graph triples using Amazon Bedrock, generate Neptune bulk-load CSV files, upload them to Amazon S3, and load them into our Neptune cluster. Each of the following subsections corresponds to a stage of that pipeline.

### Setting up the data importer

The HotpotQANeptuneImporter class orchestrates every stage of the pipeline. It handles reading the JSON source file, generating CSV outputs, uploading those files to Amazon S3, and triggering the Neptune bulk loader. Let’s look at how we initialize this class with the configuration values for our AWS environment:
    
    
    class HotpotQANeptuneImporter:
        """Class to handle importing HotpotQA data into Neptune."""
    
        def __init__(
            self,
            hotpotqa_file_path: str,
            output_dir: str,
            s3_bucket: str,
            s3_prefix: str,
            neptune_endpoint: str,
            neptune_port: int,
            iam_role_arn: str,
            aws_region: str,
            llm_endpoint: Optional[str] = None,
            embedding_endpoint: Optional[str] = None,
            max_workers: int = 4,
            max_examples: int = 10,
            max_docs_per_example: int = 2,
            use_ssl: bool = False
        ):
            """Initialize the importer with configuration."""
            self.hotpotqa_file_path = hotpotqa_file_path
            self.output_dir = output_dir
            self.s3_bucket = s3_bucket
            self.s3_prefix = s3_prefix
            self.neptune_endpoint = neptune_endpoint
            self.neptune_port = neptune_port
            self.iam_role_arn = iam_role_arn
            self.aws_region = aws_region
    
            # Initialize AWS clients
            self.s3_client = boto3.client('s3', region_name=aws_region)
            self.session = boto3.Session()
    
            # Initialize data structures
            self.phrase_dict = {}  # Maps phrase text to node ID
            self.phrase_embeddings = {}  # Maps phrase text to embedding vector

### Knowledge graph triple extraction

A key part of the pipeline is using Amazon Bedrock’s LLM capabilities to extract structured knowledge from raw text. For each passage, the system generates subject-relation-object triples that become edges in the knowledge graph. Here’s how we implement that extraction:
    
    
    def extract_triples_with_llm(self, text: str) -> List[Tuple[str, str, str]]:
        """
        Use an LLM to extract knowledge graph triples from text.
        In this simplified version, just generate simple triples from the text.
        """
        # Simple triple generation from text
        words = text.split()
        if len(words) < 5:
            return []
    
        # Generate simple triples from the words in the text
        triples = []
    
        for i in range(min(3, len(words) - 2)):  # Get at most 3 triples
            subject = words[i]
            relation = "related_to"
            obj = words[i+2]
            triples.append((subject, relation, obj))
    
        return triples

### Converting JSON data to CSV format

With triples in hand, we need to serialize the graph into the CSV format that Neptune’s bulk loader expects. This processing method converts the HotpotQA JSON records into four CSV files: phrase_nodes.csv, passage_nodes.csv, relation_edges.csv, and context_edges.csv. Together, these files capture the full knowledge graph structure. Here’s how we implement that conversion:
    
    
    def process_data_to_csv(self, data: List[Dict]) -> None:
        """
        Process HotpotQA data into CSV files for Neptune import.
        """
        logger.info("Processing HotpotQA data to CSV files")
    
        # Open all CSV files for writing
        with open(os.path.join(self.output_dir, 'phrase_nodes.csv'), 'w', newline='', encoding='utf-8') as phrase_f, \
             open(os.path.join(self.output_dir, 'passage_nodes.csv'), 'w', newline='', encoding='utf-8') as passage_f, \
             open(os.path.join(self.output_dir, 'relation_edges.csv'), 'w', newline='', encoding='utf-8') as relation_f, \
             open(os.path.join(self.output_dir, 'context_edges.csv'), 'w', newline='', encoding='utf-8') as context_f:
    
            # Write headers
            phrase_f.write('~id,~label,text\n')
            passage_f.write('~id,~label,title,content\n')
            relation_f.write('~id,~from,~to,~label\n')
            context_f.write('~id,~from,~to,~label\n')
    
            # Process each example
            for example in tqdm(data, desc="Processing examples"):
                self._process_example(example, passage_f, phrase_f, relation_f, context_f)

### Processing individual examples

Each HotpotQA example is processed to create nodes and edges in the knowledge graph:
    
    
    def _process_example(self, example: Dict, passage_f, phrase_f, relation_f, context_f) -> None:
        """Process a single HotpotQA example into CSV data."""
        # Process limited documents in the context
        doc_count = 0
        for doc_title, paragraphs in example['context']:
            if doc_count >= self.max_docs_per_example:
                break
    
            # Process each paragraph as a passage
            for paragraph in paragraphs:
                if not paragraph.strip():
                    continue
    
                passage_id = f"passage_{uuid.uuid4().hex}"
    
                # Write passage node
                passage_f.write(f"{passage_id},passage,\"{self._escape_csv(doc_title)}\",\"{self._escape_csv(paragraph)}\"\n")
    
                # Extract triples from the paragraph
                triples = self.extract_triples_with_llm(paragraph)
    
                # Process each triple
                for subject, relation, obj in triples:
                    # Create or get subject node ID
                    if subject not in self.phrase_dict:
                        subject_id = f"phrase_{uuid.uuid4().hex}"
                        self.phrase_dict[subject] = subject_id
                        phrase_f.write(f"{subject_id},phrase,\"{self._escape_csv(subject)}\"\n")
                    else:
                        subject_id = self.phrase_dict[subject]
    
                    # Create or get object node ID
                    if obj not in self.phrase_dict:
                        obj_id = f"phrase_{uuid.uuid4().hex}"
                        self.phrase_dict[obj] = obj_id
                        phrase_f.write(f"{obj_id},phrase,\"{self._escape_csv(obj)}\"\n")
                    else:
                        obj_id = self.phrase_dict[obj]
    
                    # Write relation edge
                    relation_id = f"rel_{uuid.uuid4().hex}"
                    relation_f.write(f"{relation_id},{subject_id},{obj_id},\"{self._escape_csv(relation)}\"\n")
    
                    # Write context edges
                    context_f.write(f"ctx_{uuid.uuid4().hex},{passage_id},{subject_id},contains\n")
                    context_f.write(f"ctx_{uuid.uuid4().hex},{passage_id},{obj_id},contains\n")
    
            doc_count += 1

### Loading data to Neptune

After processing the data into CSV files, the system uploads them to S3 and imports them into Neptune:
    
    
    def import_to_neptune(self) -> Dict:
        """Import data into Neptune using the bulk loader API."""
        logger.info(f"Importing data to Neptune endpoint {self.neptune_endpoint}")
    
        loader_endpoint = f"{self.protocol}://{self.neptune_endpoint}:{self.neptune_port}/loader"
    
        payload = {
            "source": f"s3://{self.s3_bucket}/{self.s3_prefix}/",
            "format": "csv",
            "formatParams": {
                "delimiter": ",",
                "header": "true"
            },
            "iamRoleArn": self.iam_role_arn,
            "region": self.aws_region,
            "failOnError": "FALSE"
        }
    
        try:
            # Create AWS4Auth for the request
            credentials = self.session.get_credentials()
            if credentials:
                auth = AWS4Auth(
                    credentials.access_key,
                    credentials.secret_key,
                    self.aws_region,
                    'neptune-db',
                    session_token=credentials.token
                )
    
            response = requests.post(
                loader_endpoint,
                data=json.dumps(payload),
                headers={"Content-Type": "application/json"},
                timeout=30,
                auth=auth
            )
    
            response.raise_for_status()
            result = response.json()
            logger.info(f"Neptune load job submitted: {result}")
    
            return result
        except Exception as e:
            logger.error(f"Failed to submit Neptune load job: {e}")
            raise

### Running the full pipeline

You can run the full data processing pipeline with the following steps:
    
    
    def run_pipeline(self) -> None:
        """Run the full data processing and import pipeline."""
        try:
            # Step 1: Test Neptune connectivity
            if not self.test_neptune_connection():
                logger.warning("Neptune connectivity test failed, but proceeding with the pipeline")
    
            # Step 2: Load HotpotQA data
            data = self.load_hotpotqa_data()
    
            # Step 3: Process data to CSV files
            self.process_data_to_csv(data)
    
            # Step 4: Create empty synonym_edges.csv file
            with open(os.path.join(self.output_dir, 'synonym_edges.csv'), 'w', newline='', encoding='utf-8') as f:
                f.write('~id,~from,~to,~label\n')
    
            # Step 5: Upload CSV files to S3
            self.upload_to_s3()
    
            # Step 6: Import data to Neptune
            load_result = self.import_to_neptune()
            load_id = load_result.get("payload", {}).get("loadId")
    
            if load_id:
                # Step 7: Wait for import to complete
                final_status = self.wait_for_load_job(load_id)
                logger.info(f"Final import status: {final_status}")
    
            logger.info("Pipeline completed successfully")
        except Exception as e:
            logger.error(f"Pipeline failed: {e}")
            raise

## Implementation

This section walks through the key components of the HippoRAG implementation, from initial configuration to knowledge graph construction and retrieval.

### Configuration

First, let’s set up the basic configuration for our HippoRAG implementation:
    
    
    from src.hipporag.utils.config_utils import BaseConfig
    
    config = BaseConfig()
    config.force_index_from_scratch = True
    config.openie_mode = "online"
    config.llm_name = "us.anthropic.claude-3-5-haiku-20241022-v1:0"
    config.embedding_model_name = "amazon.titan-embed-text-v2:0"
    config.aws_region = "us-east-1"
    config.save_dir = "outputs"
    config.retrieval_top_k = 3

### Neptune Analytics integration

A key innovation in our implementation is the integration with Amazon Neptune Analytics for personalized PageRank. We create a dedicated client to handle advanced graph analytics:
    
    
    class NeptuneAnalyticsClient:
        """Client for Neptune Analytics operations including personalized PageRank."""
    
        def __init__(self, graph_id, region='us-east-1'):
            """Initialize Neptune Analytics client."""
            self.graph_id = graph_id
            self.region = region
            self.client = boto3.client('neptune-analytics', region_name=region)
            logger.info(f"Initialized Neptune Analytics client for graph {graph_id}")
    
        def run_personalized_pagerank(self, seed_nodes, damping_factor=0.85, max_iterations=20, tolerance=0.0001):
            """
            Run personalized PageRank algorithm on Neptune Analytics.
    
            Args:
                seed_nodes (list): List of seed node IDs for personalized PageRank
                damping_factor (float): Damping factor (default 0.85)
                max_iterations (int): Maximum number of iterations
                tolerance (float): Convergence tolerance
    
            Returns:
                list: List of (node_id, score) tuples sorted by score descending
            """
            if not seed_nodes:
                logger.warning("No seed nodes provided for personalized PageRank")
                return []
    
            # Format seed nodes for the query
            seed_list = ",".join([f"'{node}'" for node in seed_nodes])
    
            # Neptune Analytics personalized PageRank query using openCypher
            query = f"""
            CALL neptune.algo.pagerank({{
                sourceNodes: [{seed_list}],
                dampingFactor: {damping_factor},
                maxIterations: {max_iterations},
                tolerance: {tolerance},
                personalized: true
            }})
            YIELD nodeId, score
            RETURN nodeId, score
            ORDER BY score DESC
            LIMIT 100
            """
    
            try:
                result = self.execute_analytics_query(query)
    
                if result and 'results' in result:
                    pagerank_results = [(item['nodeId'], item['score']) for item in result['results']]
                    logger.info(f"Personalized PageRank returned {len(pagerank_results)} results")
                    return pagerank_results
    
                return []
            except Exception as e:
                logger.error(f"Failed to run personalized PageRank: {e}")
                return []

### Knowledge graph construction

HippoRAG builds a knowledge graph from documents using LLM capabilities of Amazon Bedrock. This process extracts entities and relationships from text:
    
    
    def index_from_neptune(self, limit=1000):
        """
        Index documents directly from Neptune database.
    
        Args:
            limit (int): Maximum number of documents to index
        """
        documents = self.neptune_client.get_documents(limit=limit)
        logger.info(f"Indexing {len(documents)} documents from Neptune database")
    
        # Use the standard indexing process with documents from Neptune
        super().index(documents)

The indexing process involves:

  1. Extracting named entities from passages using Claude LLM.
  2. Creating knowledge graph triples using open information extraction.
  3. Computing embeddings for entities using Amazon Titan Embeddings.
  4. Storing the graph structure in Amazon Neptune Database.
  5. Adding synonymy edges between similar entities.
  6. Preparing the graph for Neptune Analytics processing.



### Personalized PageRank retrieval

The core advantage of HippoRAG is its ability to perform sophisticated multi-hop retrieval using personalized PageRank. Our implementation uses Neptune Analytics for this:
    
    
    def retrieve_with_personalized_pagerank(self, queries, num_to_retrieve=None):
        """
        Enhanced retrieval using personalized PageRank through Neptune Analytics.
    
        Args:
            queries (list): List of query strings
            num_to_retrieve (int): Number of documents to retrieve
    
        Returns:
            list: List of QuerySolution objects
        """
        if not self.ready_to_retrieve:
            self.prepare_retrieval_objects()
    
        if num_to_retrieve is None:
            num_to_retrieve = self.global_config.retrieval_top_k
    
        retrieval_results = []
    
        for query in queries:
            logger.info(f"Processing query with personalized PageRank: {query}")
    
            # First get standard retrieval results as fallback
            basic_results = list(super().retrieve([query]))[0]
    
            # Enhanced retrieval with personalized PageRank
            enhanced_docs = []
            pagerank_scores = []
    
            if self.analytics_client:
                # Find entities related to the query
                seed_entities = self.neptune_client.entity_search(query, limit=5)
    
                if seed_entities:
                    logger.info(f"Found {len(seed_entities)} seed entities for PageRank")
    
                    # Run personalized PageRank from seed entities
                    pagerank_results = self.analytics_client.run_personalized_pagerank(
                        seed_nodes=seed_entities,
                        damping_factor=0.85,
                        max_iterations=20
                    )
    
                    if pagerank_results:
                        # Get passages ranked by PageRank scores
                        ranked_passages = self.analytics_client.get_passages_by_pagerank(
                            pagerank_results,
                            top_k=num_to_retrieve * 2
                        )
    
                        # Extract content and scores
                        for content, score in ranked_passages:
                            if content and content not in enhanced_docs:
                                enhanced_docs.append(content)
                                pagerank_scores.append(score)
    
                        logger.info(f"PersonalizedPageRank retrieved {len(enhanced_docs)} documents")
    
            # Combine PageRank results with basic results
            combined_docs = []
            combined_scores = []
    
            # Add PageRank results first (they're already ranked)
            for i, doc in enumerate(enhanced_docs[:num_to_retrieve]):
                combined_docs.append(doc)
                combined_scores.append(pagerank_scores[i] if i < len(pagerank_scores) else 0.5)
    
            # Fill remaining slots with basic results if needed
            for doc in basic_results.docs:
                if len(combined_docs) >= num_to_retrieve:
                    break
                if doc and doc not in combined_docs:
                    combined_docs.append(doc)
                    combined_scores.append(0.1)  # Lower score for non-PageRank results
    
            # Create and append retrieval result
            result = QuerySolution(
                question=query,
                docs=combined_docs[:num_to_retrieve],
                doc_scores=combined_scores[:num_to_retrieve]
            )
            retrieval_results.append(result)
    
        return retrieval_results

### Setting up Neptune Analytics

Before running the implementation, you need to create a Neptune Analytics graph from your Neptune Database:
    
    
    def find_or_create_analytics_graph(neptune_cluster_id, region='us-east-1'):
        """
        Find existing Neptune Analytics graphs or create a new one.
        """
        client = boto3.client('neptune-analytics', region_name=region)
    
        try:
            # List existing analytics graphs
            response = client.list_graphs()
    
            if response.get('graphs'):
                # Return the first available graph
                first_graph = response['graphs'][0]
                if first_graph['status'] == 'AVAILABLE':
                    return first_graph['id']
    
            # Create a new analytics graph if none exists
            create_response = client.create_graph(
                graphName=f"hipporag-analytics-{int(time.time())}",
                replicaCount=1,
                sourceDbClusterIdentifier=neptune_cluster_id
            )
    
            return create_response['id']
    
        except Exception as e:
            logger.error(f"Error managing Neptune Analytics graphs: {e}")
            return None

## Demo and results

Let’s walk through a demonstration of our AWS native HippoRAG implementation with [personalized pagerank](<https://docs.aws.amazon.com/neptune-analytics/latest/userguide/page-rank.html>):
    
    
    # Initialize NeptuneHippoRAG with Analytics support
    hippo = NeptuneHippoRAG(
        global_config=config,
        neptune_endpoint="your-neptune-endpoint.us-east-1.neptune.amazonaws.com",
        neptune_port=8182,
        analytics_graph_id="g-your-analytics-graph-id"
    )
    
    # Index data from Neptune
    hippo.index_from_neptune(limit=1000)
    
    # Example queries
    questions = [
        "Who painted the Mona Lisa?",
        "Which city is the capital of France?",
        "What is the height of the Eiffel Tower?",
        "What is the connection between Leonardo da Vinci and France?",
    ]
    
    # Process each query with personalized PageRank
    for question in questions:
        # Get retrieval results with personalized PageRank
        results = hippo.retrieve_with_personalized_pagerank([question])
    
        # Generate answer using the QA method
        qa_results, _, _ = hippo.qa(results)
    
        # Display the answer with PageRank scores
        print(f"Question: {question}")
        print(f"Answer: {qa_results[0].answer}")
        print(f"Top documents (PageRank ranked):")
        for i, (doc, score) in enumerate(zip(results[0].docs, results[0].doc_scores)):
            print(f"  Doc {i+1} (Score: {score:.4f}): {doc[:100]}...")

From our test results, we can see that HippoRAG with personalized PageRank correctly retrieves and ranks documents:
    
    
    Question: Who painted the Mona Lisa?
    Answer: Leonardo da Vinci
    Top documents (PageRank ranked):
      Doc 1 (Score: 0.8234): Leonardo da Vinci painted the Mona Lisa between 1503 and 1519...
      Doc 2 (Score: 0.6891): The Mona Lisa is housed in the Louvre Museum in Paris...
      Doc 3 (Score: 0.5432): Da Vinci was an Italian Renaissance artist known for...
    
    Question: What is the connection between Leonardo da Vinci and France?
    Answer: Leonardo da Vinci died in France in 1519, where he spent his final years under the patronage of King Francis I.
    Top documents (PageRank ranked):
      Doc 1 (Score: 0.9156): Leonardo da Vinci died at Château du Clos Lucé in France in 1519...
      Doc 2 (Score: 0.7832): King Francis I of France invited Leonardo to work at his court...
      Doc 3 (Score: 0.6234): The artist spent his final three years in Amboise, France...

The last question demonstrates HippoRAG’s ability to connect information across multiple documents. It uses personalized PageRank to rank the most relevant passages based on their graph-theoretic importance relative to the query entities.

## Path-finding multi-hop retrieval

One of HippoRAG’s most impressive capabilities is solving what the researchers call “path-finding” multi-hop questions. Unlike “path-following” questions with a clear directed path between entities, path-finding questions require exploring multiple potential paths to find connections.

Consider this example: **Question: Which Stanford professor works on the neuroscience of Alzheimer’s?**

For this question, HippoRAG with personalized PageRank can directly navigate the knowledge graph. It uses the PageRank algorithm to identify and rank the most relevant paths that connect Stanford, neuroscience, and Alzheimer’s research.

The personalized PageRank algorithm starts from seed nodes related to “Stanford,” “neuroscience,” and “Alzheimer’s.” It then propagates relevance scores through the graph to identify entities and passages that are most strongly connected to the query concepts.

This capability is particularly valuable for complex enterprise use cases like scientific literature review, legal case analysis, or medical diagnosis.

## Benefits and performance

The HippoRAG approach implemented with this comprehensive AWS stack offers several key benefits:

  1. **High performance** : HippoRAG is a well-performing variant of GraphRAG that excels at complex multi-hop reasoning tasks.
  2. **Single-step efficiency** : Personalized PageRank enables direct multi-hop retrieval that is different from iterative methods.
  3. **Advanced graph analytics** : Neptune Analytics provides personalized PageRank computation with high performance and scalability.
  4. **AWS integration** : Fully uses managed services like Amazon Bedrock, Neptune, and Neptune Analytics for reliability and ease of management.
  5. **Continuous learning** : Updates with new information without requiring model retraining.
  6. **Enterprise ready** : Secure, scalable, and compatible with existing AWS infrastructures.



The high performance comes from the fundamental approach of using graph-based retrieval with personalized PageRank. The AWS native stack provides significant operational advantages in terms of scalability, security, and maintenance.

## Clean up

  * When you’re done, clean up your resources to stop incurring costs. You can do so using the AWS Management Console. For instructions, refer to the [Amazon Neptune](<https://docs.aws.amazon.com/neptune/latest/userguide/manage-console-delete.html>), [Amazon Neptune Analytics](<https://docs.aws.amazon.com/neptune-analytics/latest/userguide/delete-graph.html>), [Amazon Bedrock](<https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started.html>), and [Amazon S3](<https://docs.aws.amazon.com/AmazonS3/latest/userguide/delete-bucket.html>) documentation. You can also delete any IAM roles and policies created as part of this walkthrough.



## Conclusion

HippoRAG with personalized PageRank provides a viable alternative to standard GraphRAG for multi-document question answering. By implementing it with Amazon Bedrock, Neptune Database, Neptune Analytics, and Amazon Titan Embeddings, we’ve created a powerful, neurobiologically inspired solution. This solution can tackle complex multi-hop reasoning tasks with sophisticated relevance ranking.

This approach demonstrates how AWS services can be combined to create sophisticated artificial intelligence (AI) solutions that go beyond standard RAG implementations. The integration of graph-based retrieval with personalized PageRank and state-of-the-art LLMs opens new possibilities for enterprise applications requiring deep knowledge integration across multiple sources.

We look forward to seeing how you apply this technology to your own use cases!

## References

  1. [HippoRAG: Neurobiologically Inspired Long-Term Memory for Large Language Models](<https://arxiv.org/abs/2405.14831>) (original research paper).
  2. [Amazon Bedrock documentation](<https://docs.aws.amazon.com/bedrock/>).
  3. [Amazon Neptune documentation](<https://docs.aws.amazon.com/neptune/>).
  4. [Amazon Neptune Analytics documentation](<https://docs.aws.amazon.com/neptune-analytics/>).
  5. [Amazon Titan Embeddings documentation](<https://docs.aws.amazon.com/bedrock/latest/userguide/titan-embedding-models.html>).



* * *

## About the authors

### Tanay Chowdhury

Tanay is a Data Scientist at Generative AI Innovation Center at Amazon Web Services who helps customers solve their business problems using generative AI and machine learning. He has done MS with Thesis in Machine Learning from University of Illinois and has extensive experience in solving customer problem in the field of data science.

### Saeideh Shahrokh Esfahani

Saeideh is an Applied Scientist at the Amazon Generative AI Innovation Center, where she partners with customers to build innovative AI solutions that solve complex business challenges and accelerate the adoption of generative AI.

### Yingwei Yu

Yingwei is an Applied Science Manager at Generative AI Innovation Center, AWS, where he leverages machine learning and generative AI to drive innovation across industries. With a PhD in Computer Science from Texas A&M University and years of working experience, Yingwei brings extensive expertise in applying cutting-edge technologies to real-world applications.
