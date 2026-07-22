---
source_url: "https://aws.amazon.com/blogs/machine-learning/ai-powered-bi-with-snowflake-and-amazon-quick/"
ingested: 2026-06-26
sha256: 255fa975515bfd82
---

# AI-powered BI with Snowflake and Amazon Quick

One dashboard shows 42,000 active movie view counts while another shows 38,500. Your chat agent references a third number entirely. Data teams spend hours reconciling numbers instead of answering strategic questions, and trust in analytics erodes.

This is a pattern that we see across many organizations. Teams spend more effort reconciling numbers than actually using them, quietly slowing down decision-making and chipping away at confidence in the data.

The root cause is usually a _last-mile gap_ : business logic lives inside each individual application rather than at the data layer where every application can share it.

[Amazon Quick Sight](<https://aws.amazon.com/quick/quicksight/>) datasets on top of Snowflake [semantic views](<https://docs.snowflake.com/en/user-guide/views-semantic/overview>) close that gap. A _semantic view_ is a Snowflake schema object that attaches business definitions (table, relationships, metrics, and dimensions) directly to your data. Any downstream application that queries the semantic view inherits the same definitions, so both AI and BI systems interpret information uniformly. This leads to trustworthy answers and significantly reduces the risk of AI hallucinations.

You can use semantic views in Cortex Analyst and query these views in a `SELECT` statement. You can also share semantic views in private listings. As native Snowflake schema objects, semantic views have object-level access controls. You can grant or restrict usage and query rights just as with tables and views, supporting authorized, governed usage across SQL, BI, and AI endpoints. You can read more about how to write [Semantic SQL](<https://docs.snowflake.com/en/user-guide/views-semantic/sql>) in the Snowflake documentation.

In this post, you will learn how to build an end-to-end integration between Snowflake semantic views and Amazon Quick. The sample data is user review data for a media company. You start by loading movie review data from [Amazon Simple Storage Service](<https://aws.amazon.com/s3/>) (Amazon S3) into Snowflake, define a semantic view in SQL to add business meaning, explore it with natural-language queries through Cortex Analyst, and then generate an Amazon Quick dataset and dashboard. The dataset can be created manually or with a provided automation script. By the end, your BI team or AI team can ask natural-language questions against a governed data layer and trust that every response reflects the same business logic.

## Solution architecture

Figure 1: End-to-end architecture—data flows from Amazon S3 into Snowflake, where a semantic view governs business definitions, enabling both Cortex Analyst natural-language queries and Amazon Quick Sight dashboards.

This integration uses Snowflake’s native capabilities to ingest structured movie review data directly from Amazon S3 into a database schema. You then define a Snowflake semantic view with table relationships, dimensions, and metrics to enhance AI-powered analytics, all with SQL. The semantic model shifts from individual AI or BI layers to the core data platform, so all tools use the same semantic concepts.

## Solution walkthrough

This walkthrough uses a movie review dataset to demonstrate the integration. The dataset consists of three tables (`MOVIES`, `USERS`, and `RATINGS`) that you load from Amazon S3 into Snowflake. On top of those tables, you define a semantic view that maps raw columns to business-friendly metrics and dimensions.

Figure 2: A Snowflake semantic view adds business context (metrics, dimensions, and relationships) to raw tables, creating a shared definition layer for AI and BI tools.

This integration empowers the BI team to use natural language for creating interactive charts and dashboards, building calculated fields, developing data stories, and conducting what-if scenarios—and significantly reduces the risk of AI hallucinations. The BI team can also incorporate this Snowflake-sourced dashboard into the Amazon Quick Movies [Quick Space](<https://aws.amazon.com/quick/spaces/>) to enable retrieval augmented generation (RAG).

## Prerequisites

Before you begin, make sure that you have the following in place:

  * **Snowflake Enterprise account on AWS.** If you don’t have one, sign up for a [Snowflake trial account](<https://signup.snowflake.com/>) and select **Enterprise** on AWS.
  * **`ACCOUNTADMIN` role access in Snowflake.** This role is required for creating semantic views and granting object-level privileges.
  * **AWS account.** If you don’t have one, create an [AWS account](<https://aws.amazon.com/>).
  * **AWS Region alignment.** Sign up for both accounts in **AWS US West (Oregon)** or **US East (N. Virginia)**. Amazon Quick Sight is available in US East (N. Virginia), US West (Oregon), Asia Pacific (Sydney), and Europe (Ireland). Refer to the [Amazon Quick documentation](<https://docs.aws.amazon.com/quicksight/>) for the latest Regional availability.
  * **Basic familiarity with SQL and Python.** You run SQL statements in Snowsight (Snowflake’s web interface) and run a Python-based script in AWS CloudShell.
  * **Familiarity with data analysis concepts** such as tables, dimensions, and metrics.



**Time commitment:** Allow 60–90 minutes to complete this tutorial end to end.

**Estimated cost:** This tutorial uses minimal resources. Expect less than $10 in combined AWS and Snowflake costs.

## Step 1: Set up your Snowflake environment and load data

You use [Snowsight](<https://docs.snowflake.com/en/user-guide/ui-snowsight>), Snowflake’s web interface, to import and run a provided notebook. The notebook creates the necessary compute warehouse, database, and schema, then loads the movie review data, so you don’t need to run the setup SQL manually.

### Import the notebook

To get started, import the pre-built tutorial notebook into your Snowflake environment so you can follow along interactively.

  1. Download the notebook `SF_Quick_Quickstart.ipynb` from the assets folder in the [GitHub repository](<https://github.com/aws-samples/sample-aws-sa-genai/blob/main/4_Semantics/quick_start/SF%20Quick%20Start%20Tutorial.ipynb>).
  2. In Snowsight, choose the **plus (+)** , **Notebook** , **Import** , then select the downloaded notebook file.
  3. Accept the default settings and select **Run on Warehouse**. The notebook defaults to `SYSTEM$STREAMLIT_NOTEBOOK_WH` (a system-provided compute resource), but you can choose a different warehouse from the dropdown. The notebook creates a new warehouse called `WORKSHOPWH` for this tutorial.



Figure 3: Image showing how to import the notebook in Snowsight using the plus (+) menu.

Figure 4: Image showing the select **Run on Warehouse** option and the compute warehouse at notebook creation seclection.

After notebook creation, you can choose a different warehouse from the notebook settings. For more information, see [notebook settings](<https://docs.snowflake.com/en/release-notes/bcr-bundles/2025_01/bcr-1887>).

### Run the notebook to load data

Snowflake Notebooks come pre-installed with common Python libraries—`numpy`, `pandas`, `matplotlib`, and more. To add other packages, choose the **Packages** dropdown in the top right of the notebook.

Run all cells in sequence. The notebook provisions the `WORKSHOPWH` warehouse and loads the movie review data into the `MOVIES` database. After each cell completes, you see confirmation output below the cell.

**Verify the setup:** After running all cells, confirm that you see three tables: `MOVIES`, `USERS`, and `RATINGS` in the `MOVIES.PUBLIC` schema.

**Troubleshooting:** If a cell fails to execute, verify that you’re using the `ACCOUNTADMIN` role. You can set this at the top of your notebook or worksheet with:
    
    
    USE ROLE ACCOUNTADMIN;

Figure 5: Run all notebook cells to load data into the `MOVIES` database.

## Step 2: Define the semantic view and export the semantic view DDL

After all cells run successfully, locate the `Get_SV_DDL` cell. This cell executes the following SQL to retrieve the semantic view’s DDL:
    
    
    SELECT TO_VARCHAR(GET_DDL(
        'SEMANTIC_VIEW',
        'MOVIES.PUBLIC.MOVIE_ANALYTICS_SV'
    ));

**Important** After running the `Get_SV_DDL` cell, choose **Download as CSV** and save the file as `SF_DDL.csv`. You need this file in Step 4 to generate your Amazon Quick Sight dataset automatically. If you skip this step, the dataset generator can’t parse your schema.

Figure 7: Choose Download as CSV to save `SF_DDL.csv`—required for the Quick Sight dataset generator.

## Step 3: Explore your data with Cortex Analyst

With the semantic view created, you can immediately start querying your data in plain English—no SQL required. This step verifies that the semantic layer works correctly before you connect Amazon Quick Sight.

### View the semantic view in Snowsight

  1. In Snowsight, select **AI & ML** from the navigation pane.
  2. Select the `SEMANTIC_QUICK_START_ROLE` that you created earlier to confirm you have the right permissions.
  3. Navigate to the **Movies** database, then **Public** schema and select the `MOVIES_ANALYST_SV` semantic view to inspect its structure.



Figure 8: The `MOVIES_ANALYST_SV` semantic view visible in the Snowsight AI & ML section.

### Add verified queries

Verified queries are example questions with confirmed correct answers. They give [Cortex Analyst](<https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst>) a reference when responding to similarly phrased questions, improving accuracy and reducing query latency. Add at least one verified query before testing natural-language questions.

Example: verify “What is the average rating for all movies in 2023?” by confirming that Cortex Analyst generates the correct SQL. When a user later asks a similarly worded question, Cortex Analyst matches it against your verified queries first.

Figure 9: Add verified queries in Snowsight to improve Cortex Analyst accuracy.

### Test natural-language queries

Try the following sample questions to confirm the semantic view responds correctly:

  * Show me the total rating values by movie title.
  * List the top 10 most popular movies of all time.



Figure 10: Cortex Analyst translates natural-language questions into SQL using your semantic view definitions.

To use SQL to query a semantic view directly, refer to the [semantic view query examples](<https://docs.snowflake.com/en/user-guide/views-semantic/example>) in the Snowflake documentation.

## Step 4: Create an Amazon Quick Sight dataset

Now that your data is semantically defined in Snowflake, connect it to Amazon Quick Sight for interactive dashboards. The provided Quick Sight Dataset Generator script automates the entire pipeline from Snowflake DDL to a ready-to-query Quick Sight dataset.

### Option 1: Run the Python package locally

Download the full solution from the [GitHub repository](<https://github.com/aws-samples/sample-aws-sa-genai/tree/main/4_Semantics/full-solution>). Follow the guidance in the README.md to connect to Snowflake, fetch the semantic view definition, convert the definition into Quick dataset schema, and create the Quick dataset. The Python scripts are interactive with self-guidance.

### Option 2: Run the bash scripts in AWS CloudShell

As an alternative to running Python scripts locally, you can run the provided bash and Python scripts directly in AWS CloudShell to store credentials securely, and interactively create a fully configured Quick Sight dataset with SPICE ingestion—all from the command line.

#### Upload the solution package

Download `Solution_Package.zip` from the [GitHub repository](<https://github.com/aws-samples/sample-aws-sa-genai/blob/main/4_Semantics/powershell-solution/Solution_Package.zip>). Then open the AWS Management Console and launch [**AWS CloudShell**](<https://aws.amazon.com/cloudshell/>). Upload `Solution_Package.zip` using the **Actions → Upload file** option in CloudShell.

Figure 11: Upload `Solution_Package.zip` to AWS CloudShell from the Actions menu.

#### Run the dataset generator workflow

Follow these steps in sequence.

  1. Unzip and enter the directory: 
         
         unzip Solution_Package.zip
         cd Solution_Package

  2. Upload the `SF_DDL.csv` file you downloaded from the Snowflake notebook (the output of `GET_DDL` on the semantic view).
  3. **Create an AWS secret.** Store your Snowflake credentials (account identifier, username, and password) as an AWS Secrets Manager secret. The script references this secret when creating the Quick Sight data source. 
         
         python create_secret.py

  4. Run the interactive workflow.After the secret is created, run the single interactive script: 
         
         python run_workflow.py

The interactive workflow script guides you through selecting or creating a Snowflake data source, configuring a new or existing dataset, parsing your `SF_DDL.csv` to generate a Quick Sight schema, creating or updating the dataset with SPICE ingestion, and monitoring ingestion progress until completion. Optionally, you can verify the ingestion status in the Quick Sight console and share the dataset with other Quick Sight users.




## Step 5: Build your dashboard in Amazon Quick Sight

After ingestion completes, open the Amazon Quick Sight console and navigate to **Datasets**. Select `movie-analytics-dataset` to confirm the data loaded correctly, then choose **Create analysis** to start building.

**Explore with natural-language questions**

Ask the same natural-language questions you tested in Cortex Analyst. Quick Sight generates corresponding visuals automatically. Try these sample questions to get started:

  * “Show me the highest-rated movies” – generates a bar chart ranking movies by average rating.
  * “What are the top 10 most-reviewed movies?” – displays a ranked list by review count.
  * “How do ratings distribute across genres?” – produces a breakdown by genre.
  * “Show me the trend of ratings over time” – creates a line chart of rating activity.
  * “Which users have submitted the most reviews?” – highlights the most active reviewers.



Experiment with follow-up questions to drill deeper. For example, after seeing top-rated movies, try “Filter to only comedy genre” or “Show me ratings for the last 6 months.”

**Create calculated fields using the semantic layer**

Because the semantic view already defines your core metrics and dimensions, you can extend your analysis in Quick Sight with calculated fields that build on those governed definitions. For example:

  1. In your analysis, choose **Add** , then choose **Add calculated field**.
  2. Create a field such as `rating_category` using a formula like: 
         
         ifelse({user_rating} >= 4, 'High', {user_rating} >= 2.5, 'Medium', 'Low')

  3. Use this new field to segment your visuals, for instance, a pie chart showing the proportion of High, Medium, and Low ratings.



This approach keeps your foundational metrics consistent (inherited from the semantic view) while giving analysts the flexibility to add derived fields for specific use cases.

**Verify numbers match between Cortex Analyst and Quick Sight**

To build confidence that the semantic layer is working as intended, compare results across both tools:

  1. In **Cortex Analyst** , ask: “What is the average rating for the top 5 most-reviewed movies?”
  2. In **Quick Sight** , ask the same question or build a table visual with the same filters.
  3. Confirm that the values match: both tools should return identical results because they query the same semantic view.



If you notice discrepancies, check the following:

  * Verify that no additional filters or row-level security rules are applied in one tool but not the other.
  * Confirm that both tools are using the same aggregation logic (for example, average compared to median).



This cross-validation step reinforces the core value proposition: a single semantic layer provides consistent answers regardless of which tool is asking the question.

Figure 12: Amazon Quick Sight bar chart generated from a natural-language query against the Snowflake semantic view dataset.

Figure 13: Additional Amazon Quick Sight visualization showing the most popular movies, driven by the same governed data layer.

## Cleanup

After the demo, complete the following cleanup steps:

  1. Snowflake cleanup:Drop the `MOVIES` database with the [DROP DATABASE](<https://docs.snowflake.com/en/sql-reference/sql/drop-database>) command. This is the fastest “bulk” action available. Then, drop the warehouse. 
         
         DROP DATABASE IF EXISTS <database_name>;
         
         -- Best practice: Suspend first to let queries finish, then drop
         ALTER WAREHOUSE IF EXISTS <warehouse> SUSPEND;
         DROP WAREHOUSE IF EXISTS <warehouse>;

  2. AWS cleanup: 
     * Remove secrets: in AWS Secrets Manager, manage access and remove the selected secrets.
     * Delete data sources: navigate to Datasets in Quick Sight and delete any datasets or data sources.
     * Delete analyses and dashboards: manually delete dashboards, analyses, and datasets in the AWS Management Console.



## Conclusion

In this post, we showed how to build an end-to-end integration between Snowflake semantic views and Amazon Quick. You loaded movie review data into Snowflake, defined a semantic view to establish consistent business definitions, verified the definitions with Cortex Analyst natural-language queries, and connected the data to Amazon Quick Sight for interactive dashboards.

## Next steps

Now that you have a working foundation, consider these ways to extend it:

  * **Extend the semantic view.** Add more metrics, dimensions, or verified queries to cover additional business questions. Richer definitions improve Cortex Analyst accuracy for similarly phrased questions.
  * **Apply this pattern to your own data.** Replace the movie review dataset with your organization’s data in Amazon S3. The same notebook and generator workflow applies to any tabular dataset.
  * **Share semantic views across teams.** Snowflake semantic views are native schema objects with object-level access controls. You can grant or restrict usage just as you would for tables and views, supporting authorized, governed usage across SQL, BI, and AI endpoints.
  * **Explore Amazon Quick Sight advanced features.** Build calculated fields, create data stories, and run what-if analyses to go deeper on the insights your semantic layer enables.
  * **Share semantic views in private listings.** Distribute governed datasets to other Snowflake accounts by publishing semantic views through Snowflake Data Sharing private listings.
  * **Learn more about open semantic standards.** Snowflake unites industry leaders to unlock AI’s potential with the [Open Semantic Interchange (OSI)](<https://www.snowflake.com/en/blog/osi-initiative-expands-partners/>) initiative—a collaboration dedicated to creating a vendor-agnostic standard for semantic data.



Try this integration with your own data and share your experience in the comments. If you have questions or feedback, the AWS and Snowflake communities are here to help.

* * *

## About the authors

### Ying Wang

Ying is a senior worldwide specialist solutions architect in the Generative AI organization at AWS. She brings 17 years of experience in data analytics and data science, with a strong background as a data architect and software development engineering manager.

### Mary Law

Mary is an APJ Partner Tech Lead at Snowflake, the AI Data Cloud. Her background includes leading the APJ Analytics Acceleration Lab at AWS and Data & AI specialist roles at Microsoft. This journey through different cloud ecosystems gives Mary unique insights into solving complex data challenges. She is passionate about helping partners develop solutions that deliver real business value.
