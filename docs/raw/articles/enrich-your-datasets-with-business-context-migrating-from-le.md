---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/enrich-your-datasets-with-business-context-migrating-from-legacy-topics-to-semantic-datasets-in-amazon-quick
ingested: 2026-07-08
feed_name: AWS China ML
source_published: 2026-07-07
sha256: "2ebd9da9b4636b0773e7f38d18594b031d850db0a472abe75fde5302148bb037"
---

# Enrich your datasets with business context: Migrating from legacy Topics to semantic datasets in Amazon Quick

If you’ve been managing [Amazon Quick](<https://aws.amazon.com/quick/>) legacy Topics alongside your datasets, you know the challenge: two assets that must stay perfectly synchronized, each with its own permissions, lineage, and versioning. Column synonyms drift. Calculated fields diverge. A rename in the dataset breaks the Legacy Topic silently. You can now use Amazon Quick to embed that business context directly into the dataset itself through **Dataset Enrichment** in the new data prep experience. Column descriptions, synonyms, calculated fields, custom instructions, and business rules all live alongside the data. Dataset Enrichment bakes business context directly into the dataset. Everything (permissions, semantics, AI context) travels with the data and is automatically inherited by anything built on top of it. One asset, one source of truth, one place to govern.

In this post, we walk through what Dataset Enrichment is, how it differs from legacy Topics, and provide three migration scenarios with step-by-step guidance so you can move your business context into the dataset layer with confidence.

**Topic** is now the [multi-dataset](<https://aws.amazon.com/blogs/machine-learning/build-a-unified-semantic-layer-across-datasets-with-multi-dataset-topics-in-amazon-quick/>) semantic and reasoning layer, the construct where multiple datasets are composed, relationships are defined, business metrics are authored, and business terminology is mapped. Rather than introducing a net-new construct, we are re-purposing Topic to fulfill this role more completely. Moving dataset-intrinsic semantics down to where they belong, and elevating Topic to own the cross-dataset relationships, metrics, and business terminology that it was always meant to carry. This isn’t a cosmetic change. It establishes a clean, forward-looking architecture that supports both deterministic BI workflows and flexible AI-driven analytics from a shared semantic foundation. It also sets up the framework for catalog integration.

### What is Topics (legacy)

Legacy Topics provided the initial approach to adding business context to datasets in Amazon Quick Sight. It stored column synonyms, calculated fields, named entities, filters, and custom instructions in a separate object that sat on top of the dataset, linked but independently managed. Going forward, we classify existing Topics as legacy. The new version of Topics is being elevated to a _multi-dataset semantic layer_**.** A single-entry point for cross-dataset Q&A that lets business users and AI workflows query across multiple enriched datasets in one conversation. Dataset Enrichment is the foundation that makes this possible: each dataset must carry its own semantic context before Topics can unify them at a higher level.

### Key differences: Topics (legacy) vs. Dataset Enrichment (new data prep)

 

| **Legacy Topics** | **Dataset Enrichment**  
---|---|---  
**Where metadata lives** | Separate legacy Topic object, linked to a dataset | Inside the dataset metadata itself  
**Column synonyms** | Defined in Column Synonyms on the legacy Topic | Defined in Additional Notes on the column  
**Business rules & filters** | Named Filters with structured conditions | Text-based rules in Custom Instructions  
**Calculated fields** | Legacy Topic-level calculations (named expressions) | Calculated column (row-level transformation)  
**Named entities** | Structured entity objects with synonyms | Text entries in Custom Instructions (dataset OUTPUT tab)  
**Custom instructions** | Custom Instructions String on legacy Topic | Text entries in Custom Instructions (dataset OUTPUT tab)  
**Governance** | Two assets to permission and audit | One asset to permission and audit  
**Semantic types** | Properties of field | Properties of column  
**Aggregation levels** | Properties of field | Handles by the agent at runtime based on the ask  
  
### What stays the same during migration

Not everything changes. These aspects of your Quick Sight environment remain unchanged during migration:

  * **Rules datasets** don’t require migration. Rule-based logic continues to work as before.
  * **SPICE storage and Direct Query mode** are unaffected. Your data access patterns remain the same regardless of whether you use Topics or Dataset Enrichment.
  * **Dashboards and analyses** aren’t rebuilt. They use the enriched dataset.
  * **The user-facing Q &A interaction model** doesn’t change. Users still ask questions in natural language through Amazon Quick chat. The difference is invisible to them.



### Why move business context into the dataset?

When business metadata lives in a separate legacy Topic object, you manage two assets that must stay synchronized. Permissions, lineage, and discoverability all split across boundaries. Dataset Enrichment collapses this:

  * **Single source of truth.** Business context travels with the data. There’s no separate asset to drift out of sync.
  * **Automatic inheritance.** Any dashboard, analysis, legacy Topic, or AI-powered chat feature built on the enriched dataset inherits the semantic context without additional configuration.
  * **Simpler governance.** One asset to manage permissions, audit, and version control.
  * **AI-readiness.** The dataset becomes self-describing for natural language querying. Amazon Quick’s chat experience can resolve ambiguous business language directly from dataset metadata without requiring a separate Topic.



### What’s changed in the dataset definition as part of Dataset Enrichment

The new data prep experience introduces `semantic_model_configuration` on datasets. It has two layers:

**Column-level metadata (inside`TableMap`):**

**Property** | **Purpose** | **Example**  
---|---|---  
`Description` | What the field represents | “Unique ID for each sales transaction”  
`AdditionalNotes` | Synonyms and alternative names users might say | “order id, sale id, receipt number”  
  
**Dataset-level metadata (inside`SemanticMetadata`):**

**Property** | **Purpose** | **Example**  
---|---|---  
`Description` | Overall summary of what the dataset contains | “Sales fact table covering transactions, revenue, and margins”  
`CustomInstructions` | Business logic, formulas, named entities, and rules | “Revenue = quantity * unit_price * (1 – discount_applied)”  
  
**Mapping from Legacy Topic fields to Dataset Enrichment:**

**Legacy Topic field** | **Dataset SemanticModel target**  
---|---  
`ColumnDescription` | `ColumnProperties.Description.Text`  
`ColumnSynonyms[]` | `ColumnProperties.AdditionalNotes.Text` (comma-joined)  
`CalculatedFields.Expression` | `DataPrepConfiguration` → `CreateColumnsStep`  
`NamedEntities.EntityName` \+ `EntityDescription` \+ `Definition` | `CustomInstructions.InlineCustomInstruction.InstructionText` (as “Entity Name: definition (fields: …) (synonyms: …)”)  
`Filters` | `CustomInstructions.InlineCustomInstruction.InstructionText` (as “Business Rule – Name: Output Column Name IN [values]”)  
`CustomInstructionsString` | `CustomInstructions.InlineCustomInstruction.InstructionText`  
  
### Solution overview

The migration is a four-step process. You identify your target dataset, locate the source legacy Topic, and run a Python script that extracts the legacy Topic’s metadata and writes it into the dataset’s `SemanticModelConfiguration` through the Quick Sight API. The script handles column descriptions, synonyms, calculated fields, named entities, filters, and custom instructions in a single pass. No manual UI work required.

### Prerequisites

Before you begin, verify that you have the following in place:

  * **AWS Command Line Interface (AWS CLI) v2 (version 2.34.50 or later)** installed and configured with valid credentials. Run `aws sts get-caller-identity` to confirm your session is active. See the [AWS CLI installation guide](<https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html>) for setup instructions. Verify with `aws --version`.
  * **Python 3.6 or later** is required to run the mapping script in Step 3. Verify with `python3 --version`.
  * **Amazon Quick Enterprise edition with Q enabled.** The migration relies on Quick Sight APIs that are only available in Enterprise accounts with the Q add-on active.
  * **A target dataset using the new data prep experience.** The dataset must use `DataPrepConfiguration` (not `LogicalTableMap`) and have column IDs on all `InputColumns`. See [Creating a dataset in new data prep](<https://docs.aws.amazon.com/quicksight/latest/user/creating-data-sets.html>) for more details.
  * **An existing legacy Topic (source)** with columns, descriptions, synonyms, and optionally calculated fields, entities, and filters that you want to migrate.
  * **AWS Identity and Access Management (IAM) permissions** for the caller identity: `quicksight:DescribeDataSet`, `quicksight:UpdateDataSet`, and `quicksight:DescribeTopic`. See [Quick Sight IAM actions](<https://docs.aws.amazon.com/quicksight/latest/user/iam-actions.html>) for the full policy reference.



### Migration scenarios

The right approach depends on your current setup. We cover three scenarios, from simplest to most involved.

### Scenario 1: Legacy datasets with no legacy Topics

Your dataset was built using the classic Quick Sight experience and has no semantic layer of any kind. Users see raw column names (`TXN_DT`, `CUST_ID`, `AMT_USD`) in dashboards, filters, and tooltips. When someone types a natural language question in Amazon Quick chat, the system has zero context to work with: no descriptions, no synonyms, no business rules. A question like “what’s our revenue this quarter?” returns nothing because nothing maps the word “revenue” to any column in the schema.

Legacy datasets ( using `LogicalTableMap` rather than `DataPrepConfiguration`) don’t support Dataset Enrichment. There’s no in-place upgrade path currently. You can’t add `SemanticModelConfiguration` to a legacy dataset, and there’s no migration API that converts one to the other. You can choose to query the dataset directly with raw column names using Dataset Q&A feature.

### Scenario 2: Legacy Topics with legacy datasets

A Topic sits on top of a legacy dataset, providing the semantic layer your users depend on, column synonyms, calculated fields, named entities, named filters, and custom instructions. Users query through the Topic and get results. But underneath, the dataset itself has no enrichment. It still uses `LogicalTableMap` and exposes raw column names with no descriptions or business context of its own.

Like Scenario 1, the underlying legacy dataset doesn’t support `SemanticModelConfiguration`. There’s no way to push your legacy Topic metadata into the dataset directly. The path forward is creating a new dataset using the new data prep experience, migrating your legacy Topic’s metadata into it as Dataset Enrichment, validating the results, and cutting over. Alternatively you can use the Dataset Q&A feature with the legacy dataset.

### Scenario 3: Legacy Topics with new data prep datasets

**Current state:** You already use the new data prep experience for your dataset. It has `DataPrepConfiguration` with `SourceTableMap`, `TransformStepMap`, and `DestinationTableMap`. But a legacy Topic is still layered on top providing the semantic context your users rely on: column synonyms, calculated fields, named entities, filters, and custom instructions. The dataset structure supports enrichment natively. It hasn’t been applied yet. This is the only scenario where a direct, in-place migration is possible. Your dataset already speaks the right API language, so you don’t need to recreate it.

Because the dataset uses `DataPrepConfiguration`, you can pass `SemanticModelConfiguration` directly to the `update-data-set` API. This means you can also:

  * **Migrate column descriptions and synonyms** from your legacy Topic into `ColumnProperties.Description` and `ColumnProperties.AdditionalNotes` on the dataset. Every column that had a `ColumnDescription` or `ColumnSynonyms` array in the legacy Topic gets an equivalent entry in the dataset’s semantic layer.
  * **Migrate calculated fields** from legacy Topic-level expressions into `CreateColumnsStep` entries in `DataPrepConfiguration`. These become first-class computed columns in the dataset, visible in dashboards and available for natural language queries without a legacy Topic.
  * **Migrate named entities, filters, and custom instructions** into `CustomInstructions.InlineCustomInstruction.InstructionText`. Entity definitions, business rules, and formula documentation are preserved as structured text that the chat system reads at query time.
  * **Keep the legacy Topic active during migration.** Both the legacy Topic and the dataset enrichment can coexist temporarily. You validate the enriched dataset’s Q&A behavior against the legacy Topic’s and only remove the legacy Topic after you’re ready.
  * **Run the legacy Topic migration with a script.** Because both `describe-topic` and `update-data-set` are API calls, the transformation can be automated end-to-end. Extract legacy Topic metadata, transform it, apply it to the dataset, and verify. No manual UI work required.



The following step automates the enrichment of an Amazon Quick Sight dataset with semantic metadata extracted from a Quick Sight legacy Topic. It transfers business context, column descriptions, synonyms, calculated fields, named entities, filters, and custom instructions from a legacy Topic directly into the dataset’s `SemanticModelConfiguration`.

## Step overview

You need four pieces of information before running the script. Get the dataset ID and Topic ID (Legacy) from the Quick console URLs (shown in Steps 1 and 2), and confirm your AWS account ID and AWS Region.

**Step** | **Action** | **Input**  
---|---|---  
1 | Get target dataset ID | Dataset ID  
2 | Get Topic ID | Topic ID  
3 | AWS Region  
4 | Run Enrich Dataset python script | Both IDs and Region  
  
#### Required parameters

  * ACCOUNT_ID = <<0358134xxxxx>>
  * REGION = <>
  * DATASET_ID = <<30c1e26a-e02a-4f2a-ac48-xxa1xxxxx916>>
  * TOPIC_ID = <>



## Step 1: Get target dataset ID

Open the Quick Sight console. In the left navigation panel, select **Data** , then switch to the **Datasets** tab. Select the dataset that you want to enrich. The dataset ID is the UUID at the end of your browser’s URL.

Example:

## Step 2: Get the source legacy Topic ID

Open the Quick Sight console. In the left navigation panel, select **Data** , then switch to the **Topics** tab. Select the source legacy Topic that you want to migrate from. The Topic ID is the string at the end of your browser’s URL.

Example:

## Step 3: Python code to enrich a dataset with information from a legacy Topic

The following script connects to the Quick Sight APIs, retrieves your existing legacy Topic metadata and target dataset schema, then intelligently maps every piece of business context to its new home in the dataset’s `SemanticModelConfiguration`. Column descriptions and synonyms become `ColumnProperties`, calculated fields are injected as `CreateColumnsStep` entries in your data prep pipeline, and named entities, filters, and custom instructions are consolidated into a structured `CustomInstructions` text block. After the mapping is complete, it applies the enriched payload directly to your dataset through a SigV4-signed API call. Your dataset becomes fully self-describing in a single execution, with no manual UI work and no risk of transcription errors.

Save the following script as `enrich_dataset.py`.
    
    
    """
    enrich_dataset_local.py --- Enrich a Quick Sight dataset with Legacy Topic metadata.
    Usage: python enrich_dataset_local.py <topic_id> <dataset_id> <aws_account_id> <aws_region>
    NOTE: Uses raw SigV4 API call to bypass botocore validation (requires botocore >= 1.43.11).
    """
    import json
    import sys
    import boto3
    import botocore.session
    from botocore.auth import SigV4Auth
    from botocore.awsrequest import AWSRequest
    import urllib3
    http = urllib3.PoolManager()
    
    def raw_update_data_set(aws_account_id, dataset_id, payload, region):
        """Call UpdateDataSet via raw SigV4 request, bypassing botocore validation."""
        session = botocore.session.get_session()
        credentials = session.get_credentials().get_frozen_credentials()
        url = f"https://quicksight.{region}.amazonaws.com/accounts/{aws_account_id}/data-sets/{dataset_id}"
        body = json.dumps(payload)
        headers = {"Content-Type": "application/json"}
        request = AWSRequest(method="PUT", url=url, data=body, headers=headers)
        SigV4Auth(credentials, "quicksight", region).add_auth(request)
        response = http.request("PUT", request.url, headers=dict(request.headers), body=request.body)
        response_body = json.loads(response.data.decode("utf-8"))
        if response.status >= 400:
            raise Exception(f"UpdateDataSet failed ({response.status}): {json.dumps(response_body, indent=2)}")
        return response_body
    
    def enrich_dataset(topic_id, dataset_id, aws_account_id, aws_region):
        qs = boto3.client("quicksight", region_name=aws_region)
        print(f"\n{'='*60}")
        print(f"  Dataset Enrichment")
        print(f"{'='*60}")
        print(f"  Topic ID:   {topic_id}")
        print(f"  Dataset ID: {dataset_id}")
        print(f"  Account:    {aws_account_id}")
        print(f"  Region:     {aws_region}")
        print(f"{'='*60}\n")
        # --- Fetch inputs from Quick Sight APIs ---
        print("[1/5] Fetching dataset schema...")
        ds_response = qs.describe_data_set(AwsAccountId=aws_account_id, DataSetId=dataset_id)
        ds = ds_response["DataSet"]
        print(f"      Dataset: {ds['Name']}")
        print(f"      ARN: {ds['Arn']}")
        print("[2/5] Fetching topic metadata...")
        topic_response = qs.describe_topic(AwsAccountId=aws_account_id, TopicId=topic_id)
        topic_raw = topic_response
        print(f"      Topic: {topic_raw['Topic'].get('Name', topic_id)}")
        print(f"      Datasets in topic: {len(topic_raw['Topic']['DataSets'])}")
        # --- Match topic dataset by ARN ---
        target_arn = ds["Arn"]
        topic_datasets = topic_raw["Topic"]["DataSets"]
        topic = None
        for td in topic_datasets:
            if td.get("DatasetArn") == target_arn:
                topic = td
                break
        if topic is None:
            print(f"      WARNING: No topic dataset matched ARN {target_arn}. Falling back to index 0.")
            topic = topic_datasets[0]
        else:
            print(f"      Matched topic dataset by ARN ✓")
        custom_instructions_str = topic_raw.get("CustomInstructions", {}).get("CustomInstructionsString", "")
        # --- Extract dataset structure ---
        physical_table_map = ds["PhysicalTableMap"]
        import_mode = ds.get("ImportMode", "SPICE")
        uses_new_experience = "DataPrepConfiguration" in ds
        print(f"      Experience: {'NEW (DataPrepConfiguration)' if uses_new_experience else 'OLD (LogicalTableMap)'}")
        if uses_new_experience:
            data_prep = ds["DataPrepConfiguration"]
        else:
            logical_table_map = ds["LogicalTableMap"]
        ptable_key = list(physical_table_map.keys())[0]
        # Auto-detect source type
        source_entry = physical_table_map[ptable_key]
        if "RelationalTable" in source_entry:
            input_columns = source_entry["RelationalTable"]["InputColumns"]
            source_type = "RelationalTable"
        elif "S3Source" in source_entry:
            input_columns = source_entry["S3Source"]["InputColumns"]
            source_type = "S3Source"
        elif "CustomSql" in source_entry:
            input_columns = source_entry["CustomSql"]["Columns"]
            source_type = "CustomSql"
        else:
            raise ValueError(f"Unknown physical table type: {list(source_entry.keys())}")
        print(f"      Source type: {source_type}")
        print(f"      Input columns: {len(input_columns)}")
        col_id_map = {col["Name"]: col.get("Id", col["Name"]) for col in input_columns}
        # --- 1. Map column descriptions and synonyms ---
        print("\n[3/5] Building enrichment...")
        column_metadata = []
        for tc in topic["Columns"]:
            col_id = col_id_map.get(tc["ColumnName"])
            if not col_id:
                continue
            column_metadata.append({
                "ColumnNames": [tc["ColumnName"]],
                "ColumnProperties": [{
                    "Description": {"Text": tc.get("ColumnDescription", "")},
                    "AdditionalNotes": {"Text": ("The synonym for the column is " + ", ".join(tc.get("ColumnSynonyms", []))) if tc.get("ColumnSynonyms") else ""}
                }]
            })
        # --- 2. Add calculated fields ---
        if uses_new_experience:
            dest_key = list(data_prep["DestinationTableMap"].keys())[0]
            last_step = data_prep["DestinationTableMap"][dest_key]["Source"]["TransformOperationId"]
            for step_id, step in data_prep["TransformStepMap"].items():
                if "CastColumnTypesStep" in step:
                    for op in step["CastColumnTypesStep"].get("CastColumnTypeOperations", []):
                        op.pop("SubType", None)
            for i, calc in enumerate(topic.get("CalculatedFields", [])):
                col_name = calc["CalculatedFieldName"].upper().replace(" ", "_")
                col_id = f"col-{col_name.lower().replace('_', '-')}"
                step_id = f"topic-calc-step-{i}"
                data_prep["TransformStepMap"][step_id] = {
                    "CreateColumnsStep": {
                        "Alias": f"Add {calc['CalculatedFieldName']}",
                        "Columns": [{"ColumnName": col_name, "ColumnId": col_id, "Expression": calc["Expression"]}],
                        "Source": {"TransformOperationId": last_step}
                    }
                }
                last_step = step_id
                column_metadata.append({
                    "ColumnNames": [col_name],
                    "ColumnProperties": [{
                        "Description": {"Text": calc.get("CalculatedFieldDescription", "")},
                        "AdditionalNotes": {"Text": ("The synonym for the column is " + ", ".join(calc.get("CalculatedFieldSynonyms", []))) if calc.get("CalculatedFieldSynonyms") else ""}
                    }]
                })
            data_prep["DestinationTableMap"][dest_key]["Source"]["TransformOperationId"] = last_step
        else:
            lt_key = list(logical_table_map.keys())[0]
            lt = logical_table_map[lt_key]
            if "DataTransforms" in lt:
                for transform in lt["DataTransforms"]:
                    if "CastColumnTypeOperation" in transform:
                        transform["CastColumnTypeOperation"].pop("SubType", None)
            for i, calc in enumerate(topic.get("CalculatedFields", [])):
                col_name = calc["CalculatedFieldName"].upper().replace(" ", "_")
                col_id = f"col-{col_name.lower().replace('_', '-')}"
                create_op = {"CreateColumnsOperation": {"Columns": [{"ColumnName": col_name, "ColumnId": col_id, "Expression": calc["Expression"]}]}}
                insert_idx = len(lt.get("DataTransforms", []))
                for idx, t in enumerate(lt.get("DataTransforms", [])):
                    if "ProjectOperation" in t:
                        insert_idx = idx
                        break
                lt.setdefault("DataTransforms", []).insert(insert_idx, create_op)
                for t in lt.get("DataTransforms", []):
                    if "ProjectOperation" in t:
                        t["ProjectOperation"]["ProjectedColumns"].append(col_name)
                        break
                column_metadata.append({
                    "ColumnNames": [col_name],
                    "ColumnProperties": [{
                        "Description": {"Text": calc.get("CalculatedFieldDescription", "")},
                        "AdditionalNotes": {"Text": ("The synonym for the column is " + ", ".join(calc.get("CalculatedFieldSynonyms", []))) if calc.get("CalculatedFieldSynonyms") else ""}
                    }]
                })
        # --- 3. Build CustomInstructions text ---
        lines = []
        if custom_instructions_str:
            lines.append(custom_instructions_str)
        for entity in topic.get("NamedEntities", []):
            synonyms = ", ".join(entity.get("EntitySynonyms", []))
            fields = ", ".join(d.get("FieldName", "") for d in entity.get("Definition", []))
            entry = f"Entity {entity['EntityName']}: {entity.get('EntityDescription', '')}"
            if fields:
                entry += f" (fields: {fields})"
            if synonyms:
                entry += f" (synonyms: {synonyms})"
            lines.append(entry)
        for f in topic.get("Filters", []):
            fname = f.get("FilterName", "Unnamed")
            field = f.get("OperandFieldName", "")
            ftype = f.get("FilterType", "")
            if ftype == "CATEGORY_FILTER":
                cf = f.get("CategoryFilter", {})
                func = cf.get("CategoryFilterFunction", "")
                values = cf.get("Constant", {}).get("CollectiveConstant", {}).get("ValueList", [])
                inverse = cf.get("Inverse", False)
                op = "NOT IN" if inverse else "IN"
                lines.append(f"Business Rule - {fname}: Filter where {field} {func} {op} [{', '.join(values)}].")
            elif ftype == "NUMERIC_RANGE_FILTER":
                nrf = f.get("NumericRangeFilter", {})
                agg = nrf.get("Aggregation", "")
                inclusive = nrf.get("Inclusive", False)
                minimum = nrf.get("Constant", {}).get("RangeConstant", {}).get("Minimum", "")
                maximum = nrf.get("Constant", {}).get("RangeConstant", {}).get("Maximum", "")
                if minimum:
                    op2 = ">=" if inclusive else ">"
                    lines.append(f"Business Rule - {fname}: Filter where {agg}({field}) {op2} {minimum}.")
                elif maximum:
                    op2 = "<=" if inclusive else "<"
                    lines.append(f"Business Rule - {fname}: Filter where {agg}({field}) {op2} {maximum}.")
        instruction_text = "\n".join(lines)
        # --- 4. Assemble SemanticModelConfiguration ---
        topic_desc = topic_raw["Topic"].get("Description", "")
        if uses_new_experience:
            dest_key = list(data_prep["DestinationTableMap"].keys())[0]
        else:
            dest_key = lt_key
        semantic_model_config = {
            "TableMap": {
                "semantic-table": {
                    "Alias": "Semantic Table",
                    "DestinationTableId": dest_key,
                    "SemanticMetadata": {"ColumnMetadata": column_metadata}
                }
            },
        }
        if topic_desc or instruction_text:
            semantic_entry = {}
            if topic_desc:
                semantic_entry["Description"] = {"Text": topic_desc}
            if instruction_text:
                semantic_entry["CustomInstructions"] = [{"InlineCustomInstruction": {"InstructionText": instruction_text}}]
            semantic_model_config["SemanticMetadata"] = [semantic_entry]
        # --- Print enrichment summary ---
        print(f"      Columns enriched: {len(column_metadata)}")
        print(f"      Calculated fields added: {len(topic.get('CalculatedFields', []))}")
        print(f"      Named entities: {len(topic.get('NamedEntities', []))}")
        print(f"      Filters as rules: {len(topic.get('Filters', []))}")
        print(f"      Custom instructions: {len(instruction_text)} chars")
        # --- 5. Build and apply update payload ---
        update_payload = {
            "Name": ds["Name"],
            "PhysicalTableMap": physical_table_map,
            "ImportMode": import_mode,
            "SemanticModelConfiguration": semantic_model_config
        }
        if uses_new_experience:
            update_payload["DataPrepConfiguration"] = data_prep
        else:
            update_payload["LogicalTableMap"] = logical_table_map
        print("\n[4/5] Applying update via SigV4 API call...")
        update_response = raw_update_data_set(aws_account_id, dataset_id, update_payload, aws_region)
        print(f"\n[5/5] SUCCESS!")
        print(f"      Dataset '{ds['Name']}' enriched with Topic metadata.")
        print(f"      Status: {update_response.get('Status', 'OK')}")
        print(f"      Ingestion: {update_response.get('IngestionId', 'N/A')}")
    
    if __name__ == "__main__":
        if len(sys.argv) < 5:
            print(__doc__)
            sys.exit(1)
        topic_id = sys.argv[1]
        dataset_id = sys.argv[2]
        aws_account_id = sys.argv[3]
        aws_region = sys.argv[4]
        try:
            enrich_dataset(topic_id, dataset_id, aws_account_id, aws_region)
        except Exception as e:
            print(f"\n ERROR: {e}")
            sys.exit(1)

### 3.2 Run the script

Execute the script, passing your four parameters (Topic ID, Dataset ID, Account ID, and Region):
    
    
    python enrich_dataset.py <topic_id> <dataset_id> <aws_account_id> <aws_region>

### 3.3 Expected output

After the script completes, confirm that the enrichment was applied correctly by inspecting the dataset through the Quick Sight API or in the Quick Sight console:

### 3.4 Verify the output file
    
    
    # Check the three sections exist:
    python -c "import json; d=json.load(open('enriched-payload.json')); print(list(d.keys()))"
    # Expected: ['physical_table_map', 'data_prep_configuration', 'semantic_model_configuration']

  * `physical_table_map`: unchanged from the source dataset.
  * `data_prep_configuration`: with an added `CreateColumnsStep` for calculated fields.
  * `semantic_model_configuration`: with column descriptions, synonyms, and custom instructions (formulas, entities, and business rules).



### Validation best practices

Across all scenarios, we recommend the following validation approach:

  * **Build a validation question set.** Before migration, document 10–20 natural language questions that work correctly against your current legacy Topic. These become your regression test suite.
  * **Run side-by-side comparisons.** Ask the same questions against the legacy Topic (before removal) and against the enriched dataset. Results should match.
  * **Test edge cases.** Try ambiguous questions, synonym variations, and multi-step queries. The enriched dataset should handle these as effectively as (or better than) the legacy Topic did.
  * **Validate with actual users.** Have 2–3 business users test the enriched dataset chat experience before you retire the legacy Topic. Their natural phrasing may reveal gaps in your synonym or entity coverage.
  * **Document behavioral differences.** Some behaviors will differ between legacy Topic-based querying and dataset enrichment querying: 
    * Legacy Topic filters are pre-defined and selectable; business rules in custom instructions require the user to reference them by name or intent.
    * Legacy Topic calculated fields support aggregation-level expressions; dataset calculated fields operate row-by-row (aggregations happen at query time).
    * Named entities in legacy Topics have structured metadata; in dataset enrichment they’re text-based instructions.



### Key considerations

  * The `update-data-set` API requires a full replacement of all configuration on every call. Incremental updates to individual columns aren’t supported.
  * Named entities and filters don’t have dedicated API fields in `SemanticModelConfiguration`. They must be expressed as text within `CustomInstructions`.
  * Not all legacy Topic calculation expressions translate directly to dataset-level expressions. Aggregation-based calculations may need restructuring.
  * Currently, you can’t upgrade legacy datasets in-place. You must create a new dataset with the new data prep experience to enrich it.



### Clean up

To avoid incurring ongoing charges, delete the AWS resources (IAM roles, Quick Sight data sources, policies) that you created as part of experimentation. For instructions, see the [Amazon Quick documentation](<https://docs.aws.amazon.com/quick/latest/userguide/what-is.html>).

### Conclusion

Dataset Enrichment in Amazon Quick moves business intelligence metadata from a separate legacy Topic layer into the dataset itself. One asset carries its own business meaning: column descriptions, synonyms, calculation logic, entity definitions, and business rules, all governed in one place.

To get started, identify your highest-value dataset, apply enrichment using the patterns in this post, and test it in Amazon Quick chat. For the full `SemanticModelConfiguration` API reference, see the Amazon Quick documentation. For questions and community discussion, visit the [Amazon Quick Community.](<https://community.amazonquicksight.com/>).

* * *

## About the authors

### Ramon Lopez

Ramon is a Principal Solutions Architect for Amazon Quick. With many years of experience building BI solutions and a background in accounting, he loves working with customers, creating solutions, and making world-class services. When not working, he prefers to be outdoors in the ocean or up on a mountain.

### Ashok Dasineni

Ashok is a Solutions Architect for Amazon Quick Suite. Before joining AWS, Ashok worked with clients and organizations in the banking and financial domain, focusing on fraud research and prevention. He designed and implemented innovative solutions to improve business process, reduce cost, and increase revenue, helping companies around the world achieve their highest potential through data.

### Neeraj Kumar

Neeraj is a Senior Worldwide Solutions Architect at AWS, architecting enterprise-scale solutions that transform how organizations use data. With over two decades in data and analytics across automotive, manufacturing, and telecom sectors, he guides global customers to gain deeper insights using Amazon Quick and AI-powered analytics, helping them modernize their Unified AI/BI landscape and accelerate their data-driven initiatives.

### Salim Khan

Salim is a Senior Worldwide Generative AI Solutions Architect for Amazon Quick at AWS. He has over 16 years of experience implementing enterprise business intelligence solutions. At AWS, Salim works with customers globally to design and implement AI-powered BI and generative AI capabilities on Amazon Quick. Prior to AWS, he worked as a BI consultant across industry verticals including Automotive, Healthcare, Entertainment, Consumer, Publishing, and Financial Services, delivering business intelligence, data warehousing, data integration, and master data management solutions.

### Vignessh Baskaran

Vignessh is a Sr. Technical Product Manager in Amazon Quick, where he owns AI-powered data products for connectivity, catalog & semantics, and data preparation. He has over a decade of experience in developing large-scale data and analytics solutions. Outside of work, he enjoys watching Cricket, playing Racquetball and exploring different cuisines in Seattle.
