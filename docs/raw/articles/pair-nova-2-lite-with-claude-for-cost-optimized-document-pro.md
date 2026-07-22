sha256: c8851ea611bd9d2a9d198657d99d50af19600b6dbe436f61713a013c5ec51c94
---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/pair-nova-2-lite-with-claude-for-cost-optimized-document-processing/
ingested: 2026-06-30
feed_name: AWS China ML
source_published: 2026-06-29T17:52:33Z
---

# Pair Nova 2 Lite with Claude for cost-optimized document processing

A scanned yearbook page contains 176 printed names, 4 portrait photographs, and zero machine-readable structure linking them. To digitize this page, you need reliable photo detection with bounding boxes and accurate name extraction. You also need a way to determine which name belongs to which face based on page layout.

In this post, we show how pairing Amazon Nova 2 Lite with Anthropic’s Claude Sonnet 4.6 delivers an efficient solution for digitizing scanned documents at scale. We built a two-model pipeline on Amazon Bedrock for digitizing scanned yearbook pages. Amazon Nova 2 Lite handles native multimodal extraction in a single call: detecting photos, extracting visible names with coordinates, and returning page-level metadata. Claude Sonnet 4.6 then performs spatial reasoning to match names to faces based on page layout.

We ran this pipeline against 336 scanned yearbook pages and produced 3,122 name-to-face associations, with 93 percent scoring at or above 0.95 confidence. This two-model approach costs about two-thirds less per page than a single-model alternative that sends the entire task to one vision-language model. See the Cost considerations section for the detailed breakdown.

## Solution overview

The pipeline has two stages. Each stage uses a different model, chosen for the specific task it performs.

**Figure 1.** Two-model pipeline architecture. The scanned page image flows through two sequential stages. In stage 1, Amazon Nova 2 Lite performs native multimodal extraction in a single API call. It detects and classifies photos with bounding boxes, reads visible names on the page and returns their approximate positions, and emits page-level metadata. In stage 2, Claude Sonnet 4.6 performs spatial reasoning to match names to faces using the combined Nova output.

**Amazon Nova 2 Lite** runs first. Because it handles interleaved text and images natively, a single Converse call returns three things:

  * The detected photos with bounding boxes and classifications.
  * The names visible on the page with approximate positions.
  * Page-level metadata like titles and categories.



We set reasoning to **LOW** for this task by including a reasoning configuration in the Converse API call. See the reasoning block in the Step 1 code that follows. Testing across all 336 pages showed no meaningful accuracy difference between **LOW** , **MEDIUM** , and **HIGH** reasoning levels for this structured extraction, and **LOW** is the cheapest option. Nova exposes this setting through the `reasoning_config` field. Claude, in Step 2, uses a separate `thinking` field, so the two models control reasoning under different names.

Asking _Nova 2 Lite_ only for names, not every OCR token on the page, is what keeps the first stage cheap. The downstream spatial reasoning step doesn’t need the full text of class rosters or event descriptions. It needs names that appear near photos. Constraining Nova output to names keeps the output-token cost at approximately 1,000 tokens per page instead of the approximated 4,500 tokens a full OCR pass would produce.

Claude Sonnet 4.6 enters only at stage 2 for the spatial reasoning step. Given Nova names-with-positions and photo bounding boxes, Claude determines which names correspond to which faces. This step requires handling page layout variability, because yearbook layouts vary from page to page. Captions might appear above or below photos, and some pages mix portrait grids with group shots. Claude adaptive thinking handles this variability without additional prompt engineering per layout type.

In this solution, Nova 2 Lite handles the high-volume extraction work natively, in one call. Claude is called once per page for the spatial reasoning step.

### Nova 2 Lite fixed per-image pricing: Predictable cost at scale

A recent change to how Amazon Nova 2 Lite bills image inputs makes per-page cost predictable at scale, which matters when you are processing hundreds of thousands of pages.

**Fixed per-image pricing:** Amazon Nova 2 Lite bills image and document page inputs at _a fixed per-image rate_ , regardless of resolution or file size.

This change is significant for document processing pipelines. Previously, image token costs varied based on resolution, making it difficult to project per-page costs without running a proof-of-concept on representative samples. With fixed billing, every image Nova 2 Lite processes is billed at the same per-image rate, regardless of resolution.

For a full page extraction including prompt and output, the per-page cost breaks down as follows:

**Component** | **Tokens/Page** | **Rate** | **Cost/Page**  
---|---|---|---  
Image tokens (fixed) | 230 | $0.30/M input | $0.000069  
Prompt tokens (estimated) | 500 | $0.30/M input | $0.000150  
Output tokens (estimated) | 1,000 | $2.50/M output | $0.0025  
**Total** | **~$0.0027**  
  
At published Nova 2 Lite input-token rates, image input is a small fraction of total per-page cost. For current rates, see the [Amazon Bedrock pricing page](<https://aws.amazon.com/bedrock/pricing/>).

For yearbook-scale workloads (hundreds of thousands of pages annually), this fixed pricing makes cost forecasting straightforward because image input cost scales linearly with page count and is independent of page resolution. No resolution normalization is required.

## Adaptive thinking for spatial reasoning

Claude on Amazon Bedrock supports adaptive thinking, a feature where the model decides how much internal reasoning to apply based on the input complexity. You enable it by setting `type` to `adaptive` in the `thinking` configuration of the Converse API:
    
    
    response = bedrock_runtime.converse(
        modelId='us.anthropic.claude-sonnet-4-6',
        messages=[{
            'role': 'user',
            'content': [
                {'image': {'format': 'jpeg', 'source': {'bytes': image_bytes}}},
                {'text': spatial_reasoning_prompt}
            ]
        }],
        additionalModelRequestFields={
            'thinking': {
                'type': 'adaptive'
            }
        }
    )

With adaptive thinking enabled, Claude adjusts its reasoning depth based on what it receives. A straightforward portrait grid with eight names neatly arranged above eight faces gets a direct response with minimal reasoning. A page where three group photos share a caption block and names appear in a sidebar triggers step-by-step spatial analysis.

In our 336-page run, Claude used extended reasoning on every page, with reasoning traces ranging from 544 to 1,658 characters. Even the simpler pages benefited from some spatial analysis because yearbook layouts are rarely perfectly uniform. The reasoning traces show Claude working through column alignment and vertical offsets between name positions and face positions, and checking caption proximity when group photos appear on the page.

For this type of structured spatial task, adaptive thinking gives you the right amount of reasoning per page without manual tuning. You don’t need to set a fixed token budget or write layout-specific prompts. The model reads the inputs and decides.

**Cost note on adaptive thinking:** When adaptive thinking is enabled, keep three cost factors in mind.

  * Reasoning tokens are billed as output tokens at the standard output rate ($15.00/M output tokens for Claude Sonnet 4.6 through cross-Region inference).
  * Reasoning traces are returned in the API response under a separate `thinking` content block, but aren’t shown to end users.
  * Monitor `inputTokens` and `outputTokens` in the response metadata to track actual cost per page, because reasoning can significantly increase output token counts on complex pages.



## Implementation walkthrough

The full source code, sample images, and Jupyter notebook are available in the [AWS Samples repository on GitHub](<https://github.com/aws-samples/amazon-nova-samples/tree/main/multimodal-understanding/repeatable-patterns/35-hybrid-vision-spatial-reasoning>).

### Prerequisites

Before running the pipeline, make sure that you have the following in place:

  * An AWS account with access to Amazon Bedrock in an AWS Region where Amazon Nova 2 Lite and Claude Sonnet 4.6 are available.
  * Model access enabled in the Amazon Bedrock console for both `us.amazon.nova-2-lite-v1:0` and `us.anthropic.claude-sonnet-4-6`.
  * An AWS Identity and Access Management (IAM) principal with permission to call `bedrock:InvokeModel` and `bedrock:Converse` on the preceding two models.
  * Python 3.10 or later with the `boto3` SDK installed. The sample notebook also uses `rapidfuzz` for fuzzy name matching and Pillow for visualization overlays.
  * Scanned page images (JPEG or PNG). For image input through the Converse API, image bytes are passed inline in the request.



### Step 1: Detect photos and extract names with Amazon Nova 2 Lite

Send the scanned page to Amazon Nova 2 Lite with a prompt that requests both detected photos (with bounding boxes and classifications) and visible names (with approximate positions on the page). Nova native multimodal understanding returns both in a single Converse call.

Nova returns bounding boxes on a 0–1000 coordinate scale for both photos and names. Pass both directly into Step 2. Claude reads the same coordinate space when given in the prompt, so no conversion is needed.
    
    
    def extract_photos_and_names(image_bytes):
        """Detect photos and extract visible names with Amazon Nova 2 Lite."""
        # Using the Converse API consistently for all Bedrock calls
    
        response = bedrock_runtime.converse(
            modelId='us.amazon.nova-2-lite-v1:0',
            # Note: cross-region inference profile (us.amazon.nova-2-lite-v1:0)
            messages=[{
                'role': 'user',
                'content': [
                    {
                        'image': {
                            'format': 'jpeg',
                            'source': {'bytes': image_bytes}
                        }
                    },
                    {'text': PHOTO_AND_NAME_EXTRACTION_PROMPT}
                ]
            }],
            inferenceConfig={
                'maxTokens': 8000,
                'temperature': 0
            },
            additionalModelRequestFields={
                'reasoning_config': {
                    'type': 'enabled',
                    'level': 'LOW'
                }
            }
        )
    
        raw = response['output']['message']['content'][0]['text']
        return json.loads(raw)

The prompt instructs Nova to return a JSON object with both the photos and the names visible on the page.
    
    
    {
      "page_title": "Junior Class Officers",
      "photos": [
        {
          "bbox": [245, 180, 410, 520],
          "type": "portrait",
          "category": "class_officers",
          "summary": "Individual portrait photo"
        }
      ],
      "names": [
        {
          "text": "Cecilia Phillips",
          "bbox": [260, 540, 395, 570]
        },
        {
          "text": "John Kolander",
          "bbox": [420, 540, 555, 570]
        }
      ]
    }

Each photo gets a bounding box, a type (portrait, group, or candid), a category tag, and a short description. Each name gets its visible text and its bounding box on the page. The `page_title` and `category` fields also serve a second use case: metadata extraction. With one API call, Nova 2 Lite gives you photo detection, names-with-positions for the matching pipeline, and structured metadata. You can use this metadata for search indexing, filtering by event type, or building a table of contents across hundreds of pages.

### Step 2: Match names to faces with Claude

Now pass Nova names-with-positions and photo bounding boxes to Claude for spatial reasoning. Both use the same 0–1000 coordinate space, so no normalization is needed:
    
    
    spatial_prompt = f"""Given these names with page coordinates:
    {json.dumps(ocr_tokens)}
    
    And these detected photos with bounding boxes:
    {json.dumps(photo_detections)}
    
    Match each person's name to their photo based on spatial position.
    Return JSON: {{"associations": [{{"name": str, "face_idx": int,
    "confidence": float, "reasoning": str}}]}}"""
    
    response = bedrock_runtime.converse(
        modelId='us.anthropic.claude-sonnet-4-6',
        messages=[{
            'role': 'user',
            'content': [
                {'image': {'format': 'jpeg', 'source': {'bytes': image_bytes}}},
                {'text': spatial_prompt}
            ]
        }],
        additionalModelRequestFields={
            'thinking': {'type': 'adaptive'}
        }
    )

On page 50 of our test set, Nova returned 176 name entries and 4 photo bounding boxes. Most of those names are roster and body text elsewhere on the page. Only the names adjacent to the 4 photos are matchable, so Claude produced 5 associations:
    
    
    {
      "associations": [
        {"name": "Cecilia Phillips", "face_idx": 0, "confidence": 0.95,
         "reasoning": "Row 0, position 1 of 3 - matches caption above photo"},
        {"name": "John Kolander", "face_idx": 1, "confidence": 0.95,
         "reasoning": "Row 0, position 2 of 3 - matches caption above photo"},
        {"name": "Julie Ostrander", "face_idx": 2, "confidence": 0.95,
         "reasoning": "Row 0, position 3 of 3 - matches caption above photo"}
      ]
    }

Each association includes a reasoning string that explains the spatial logic. This is useful for debugging pages where associations fail.

### Step 3: Validate and assemble results

The final step applies confidence thresholds and fuzzy name matching (using rapidfuzz) to filter out low-quality associations. The pipeline writes two outputs per page: a JSON file with the association data and a visualization image showing lines drawn between matched names and faces.

## Results

We processed 336 scanned yearbook pages through this pipeline. The pipeline produced 3,122 name-to-face associations total, with 93.3 percent of those associations scoring confidence at or above 0.95. Only 0.3 percent fell below the 0.90 confidence threshold.

**Figure 2.** Confidence score distribution across the 3,122 name-to-face associations produced from 336 scanned yearbook pages. The distribution is heavily skewed toward high confidence: 2,912 associations (93.3 percent) scored at or above 0.95, 202 (6.5 percent) scored between 0.90 and 0.94, and only 8 (0.3 percent) fell below 0.90. Claude Sonnet 4.6 produced confidence scores during the spatial reasoning step. They reflect the model’s certainty that a given name token maps to a specific face bounding box.  


  * **Portrait grid pages** (282 of 336 pages) averaged 10.9 associations per page. These pages have a regular layout where names appear directly above or below corresponding photos, and the pipeline handled them reliably.
  * **Text-only pages** (class rosters, event descriptions, index pages) had no photos to detect and were correctly skipped.
  * **Mixed-layout pages** with portraits and group shots on the same page produced partial associations. The pipeline matched names to portrait photos but left group shots unmatched when captions were ambiguous.



The pipeline outputs a JSON report and a visualization for each page. The visualization draws colored lines from each name token to its matched face, which makes it easy to spot errors during manual review.

### Cost considerations

The two-model split means that you pay Nova 2 Lite rates for the combined extraction call (photos, names-with-positions, metadata) and Claude rates for one reasoning call per page. Under Nova 2 Lite’s fixed per-image pricing, the first stage cost is predictable and independent of input resolution. Claude reasoning step dominates per-page cost.

**Per-page cost breakdown**

**Stage** | **Service** | **Cost Driver** | **Approximate Cost/Page**  
---|---|---|---  
Photo + name extraction | Amazon Nova 2 Lite | Fixed 230 image tokens + ~500 prompt + ~1,000 output | ~$0.0027  
Spatial reasoning | Claude Sonnet 4.6 | Image + Nova JSON + adaptive reasoning tokens | ~$0.030  
Pipeline total | **~$0.033**  
  
The following table compares the pipeline against a single-model approach where each page is sent to Claude to do all three tasks (OCR, photo detection, and spatial matching) in one call.

**Dimension** | **Two-model pipeline** | **Single-model Claude**  
---|---|---  
Input tokens | Image (Nova: 230 fixed) + Nova JSON → Claude | Image @ ~1,500 tokens + prompt @ ~1,300 = ~2,800 tokens @ $3/M = ~$0.008  
Output tokens | Nova: ~1,000 names-JSON; Claude reasoning: ~1,700 @ $15/M = ~$0.026 | ~6,000 tokens @ $15/M = ~$0.09  
Cost per page | ~$0.033 | ~$0.10  
Cost per 100K pages | ~$3,300 | ~$9,800  
OCR quality | Nova native multimodal (no separate OCR service) | General vision-language model  
Tunability | Swap or tune each stage independently | Monolithic prompt; all-or-nothing changes  
  
At 100,000 pages, that’s a ~$6,500 difference. Beyond cost, the split pipeline also gives you the ability to swap or tune each stage independently without touching the others. For example, you can upgrade only the reasoning model when a better Claude tier ships.

Exact per-page cost depends on three factors:

  * Your Amazon Bedrock pricing tier.
  * The number of names Nova emits (scales with page density).
  * The number of reasoning tokens Claude uses (scales with layout complexity).



For a rough estimate, add one Nova 2 Lite Converse call with a single image input and a names-and-photos prompt. Then add one Claude Converse call where the input includes the image plus Nova JSON output. Check Amazon Bedrock pricing for current rates.

**Actual cost for our 336-page test run**

Based on our pipeline run (336 pages, average 10.9 associations per page):

**Component** | **Estimated Cost**  
---|---  
Nova 2 Lite photo + name extraction (336 pages × $0.0027) | ~$0.91  
Claude spatial reasoning (336 pages × $0.030) | ~$10.08  
**Total** | **~$10.99 for 336 pages (~$0.033/page)**  
  
**Additional cost optimization levers**

For high-volume or non-real-time workloads:

  * **Amazon Bedrock batch inference** : 50 percent discount on Nova 2 Lite and Claude calls for workloads that can be processed overnight. Submit a JSONL file of requests to Amazon Simple Storage Service (Amazon S3), let Amazon Bedrock process asynchronously, and read results the next morning. At batch pricing, the Nova 2 Lite combined stage drops from ~$0.0027 to ~$0.0014 per page.
  * **Prompt caching** : If you use the same photo detection prompt across thousands of pages (as this pipeline does), prompt caching can reduce cached prompt token costs by up to 90 percent.
  * **Reasoning budget control** : For Claude, you can set a `budgetTokens` cap on `thinking` to limit reasoning token costs on simpler pages while still allowing deeper reasoning when needed.



### Latency

Each page goes through two sequential API calls, so total latency per page is the sum of both. In our test run, the Claude spatial reasoning step took the longest at roughly 20–30 seconds per page because of the image input and adaptive reasoning. Nova 2 Lite completed in a few seconds. For batch processing, you can parallelize across pages because each page is independent.

**Stage** | **Typical Latency**  
---|---  
Nova 2 Lite (photos + names extraction) | 2–5 seconds  
Claude spatial reasoning (adaptive thinking) | 20–30 seconds  
Total per page | ~22–35 seconds  
  
## Clean up

This pipeline uses serverless AWS services with no persistent infrastructure to manage:

  * **Amazon Bedrock** : Pay-per-call for Nova 2 Lite and Claude, with no provisioned endpoints to delete.
  * **Amazon S3** : If you uploaded yearbook images to Amazon S3 for processing, delete the bucket or objects when finished. Amazon S3 deletion is permanent and irreversible. Confirm you have backups or no longer need the data before deleting.
  * **IAM roles** : Delete any roles created specifically for this pipeline (Amazon Bedrock invoke permissions for Nova 2 Lite and Claude Sonnet 4.6).



## Conclusion

In this post, we showed how splitting document processing across two models on Amazon Bedrock produced 3,122 name-to-face associations across 336 yearbook pages, with 93 percent at high confidence. Amazon Nova 2 Lite handled photo detection and name extraction in a single native-multimodal call. Claude Sonnet 4.6 handled spatial reasoning with adaptive thinking to match names to the right faces.

This pattern applies beyond yearbooks. Any document with photos and associated text (historical archives, personnel directories, real estate listings, product catalogs) needs the same capabilities: detecting visual elements, extracting the relevant text, and connecting the two through spatial reasoning. The solution we describe in this post combines photo detection, text extraction, and spatial reasoning to deliver both cost efficiency and high accuracy.

The full notebook and sample outputs are available in the [AWS Samples repository on GitHub](<https://github.com/aws-samples/amazon-nova-samples/tree/main/multimodal-understanding/repeatable-patterns/35-hybrid-vision-spatial-reasoning>).

To learn more about the services used in this post, see the following resources:

  * [Amazon Nova on Amazon Bedrock](<https://docs.aws.amazon.com/nova/latest/userguide/>)
  * [Adaptive thinking with Claude on Amazon Bedrock](<https://docs.aws.amazon.com/bedrock/latest/userguide/claude-messages-adaptive-thinking.html>)



* * *

## About the authors

### Sanghwa Na

Sanghwa is a Generative AI Specialist Solutions Architect at Amazon Web Services based in San Francisco. He works with customers to design and implement generative AI solutions on AWS, from foundation model selection to production deployment. Before joining AWS, he built his career in software engineering and cloud architecture. Outside of work, he enjoys spending time with his cat Byeol-nyang (Star cat).

### Julia Hu

Julia is a Specialist Solutions Architect at Amazon Web Services focused on generative AI and multimodal solutions on Amazon Bedrock. She helps AWS customers design and build intelligent document processing, agentic, and multimodal AI solutions, with a focus on cost-optimized architecture and model selection at scale.
