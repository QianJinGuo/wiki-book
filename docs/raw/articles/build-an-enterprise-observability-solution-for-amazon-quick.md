---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/build-an-enterprise-observability-solution-for-amazon-quick/
ingested: 2026-05-27
feed_name: AWS China ML
source_published: 2026-05-26T16:09:06Z
review_value: 7
review_confidence: 7
sha256: 59730e6046df6ecf7b401058cdc86860a851741eaa2cde4722246c7e5fe6bdca
---

# Build an enterprise observability solution for Amazon Quick

 

When hundreds to thousands of users are onboarded to an enterprise AI platform, business leaders and platform owners need visibility into who is using the platform, whether users are satisfied with the answers they receive, and which capabilities are driving the most engagement. Without a centralized observability solution, this data is scattered across multiple AWS services and difficult to analyze at scale.

[Amazon Quick](https://aws.amazon.com/quick/) is a generative AI-powered platform that brings together [Spaces](https://aws.amazon.com/quick/spaces/), [Chat agents](https://aws.amazon.com/quick/chat-agents/), [Flows](https://aws.amazon.com/quick/flows/), [Automate](https://aws.amazon.com/quick/automate/), [Research](https://aws.amazon.com/quick/research/), and [Amazon Quick Sight](https://aws.amazon.com/quick/quicksight/) business intelligence capabilities in one place. As organizations scale their Amazon Quick deployments, they need a reliable way to track adoption, measure satisfaction, monitor costs, and audit governance from a single pane of glass.

In this post, we show you how to deploy a solution that consolidates the Amazon Quick operational data from [Amazon CloudWatch](https://aws.amazon.com/cloudwatch/) [vended logs](https://docs.aws.amazon.com/quick/latest/userguide/monitoring-quicksuite-chat-feedback-cloudwatch.html) and [AWS CloudTrail](https://aws.amazon.com/cloudtrail/) [events](https://docs.aws.amazon.com/quick/latest/userguide/incident-response-logging-and-monitoring-qs.html) into a secured data lake in [Amazon Simple Storage Service (Amazon S3)](https://aws.amazon.com/s3/) that can be queried using [Amazon Athena](https://aws.amazon.com/athena/), a [Quick Sight dashboard](https://docs.aws.amazon.com/quick/latest/userguide/using-dashboards.html), and a [Quick custom chat agent](https://aws.amazon.com/quick/chat-agents/).

## Solution overview

Amazon Quick publishes usage and interaction data through the vended logs to deliver chat conversations, user feedback, agent/research hours usage, and index storage usage in Amazon Quick. Amazon Quick is integrated with AWS CloudTrail, which provides a record of actions taken by a user, a role, or an AWS service in Amazon Quick.

![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/18/ML-20929-image-1.png)

Figure 1: Amazon Quick enterprise observability solution architecture

The workflow consists of the following steps:

1.  Business users interact with Amazon Quick.
2.  Amazon Quick publishes the interaction logs to Amazon CloudWatch vended logs. You can protect these logs with [data protection policies](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/mask-sensitive-log-data.html) to mask sensitive data, such as credentials (private keys, AWS secret access keys), financial information, personally identifiable information, protected health information, and device identifiers.
3.  CloudWatch [subscription filters](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/SubscriptionFilters.html) forward the log events to [Amazon Data Firehose](https://aws.amazon.com/firehose/) delivery streams. The Firehose delivery streams transform the data using an [AWS Lambda](https://aws.amazon.com/lambda/) function and write it to a data lake in Amazon S3.
4.  An [Amazon EventBridge](https://aws.amazon.com/eventbridge/) rule routes Amazon Quick API calls from AWS CloudTrail and sends them to a dedicated Firehose delivery stream. The Firehose delivery stream transforms the data using an AWS Lambda function and writes it to the data lake.
5.  [AWS Glue Data Catalog](https://docs.aws.amazon.com/glue/latest/dg/catalog-and-crawler.html) maintains data lake metadata for Amazon Athena external [tables](https://docs.aws.amazon.com/athena/latest/ug/creating-tables.html) and analytical [views](https://docs.aws.amazon.com/athena/latest/ug/views.html).
6.  Administrators can use Amazon Athena to query the data. [AWS Lake Formation](https://aws.amazon.com/lake-formation/) provides fine-grained data lake permissions at the table and column level.
7.  Business leaders and stakeholders can see the data in a Quick Sight dashboard for interactive exploration of adoption, satisfaction, cost, and governance data. They can also use a Quick custom chat agent with natural language questions to receive instant visual answers.

The solution encrypts the data at rest using a customer managed [AWS Key Management System (AWS KMS)](https://aws.amazon.com/kms/) key with automatic key rotation. The solution encrypts the Amazon CloudWatch Log Groups, Amazon Data Firehose delivery streams, AWS Lambda function environment variables, and Amazon S3 data lake. This provides a unified encryption strategy across the entire pipeline.

## Prerequisites

To deploy this solution, you need:

*   An [AWS account](https://docs.aws.amazon.com/accounts/latest/reference/getting-started.html#getting-started-step1) with [Amazon Quick subscription](https://docs.aws.amazon.com/quick/latest/userguide/signing-up.html)
*   Python 3.9+
*   [Node.js](https://nodejs.org/en/download) 20+
*   [AWS Cloud Development Kit (AWS CDK)](https://docs.aws.amazon.com/cdk/v2/guide/getting-started.html)
*   [AWS Command Line Interface (AWS CLI) V2](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html)
*   An [AWS CLI profile](https://docs.aws.amazon.com/cli/v1/userguide/cli-configure-files.html) with [IAM permissions](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html) to deploy the solution, including creating AWS Identity and Access Management (IAM) roles, AWS KMS key, Amazon CloudWatch Log Groups, an Amazon S3 bucket, AWS Lambda functions, Amazon Data Firehose delivery streams, Amazon EventBridge rules, and [AWS CloudFormation](https://aws.amazon.com/cloudformation/) stacks. If you choose AWS Lake Formation for data catalog access control, the deploying identity must be a Lake Formation administrator.

## Deploy the solution

The deployment is organized into steps, each building on the previous one. You can stop after any step and have a working solution at that level. Settings like the AWS CLI profile, resource prefix, database name, and workgroup name are saved locally after each step, so subsequent steps auto-populate them.

### Clone the repository

Clone the [GitHub repository](https://github.com/aws-samples/sample-quick-observability-platform) and navigate to the project directory:

```
git clone https://github.com/aws-samples/sample-quick-observability-platform

cd sample-quick-observability-platform
```

### Set up vended logs

Deploy the Amazon CloudWatch Logs infrastructure:

The script auto-detects your Quick subscription region, creates the AWS KMS key, and configures vended logs delivery for chat, feedback, agent hours, and index usage data.

The deployment prompts for CloudWatch log groups to create _(/aws/vendedlogs/quick/chat, /aws/vendedlogs/quick/feedback, /aws/vendedlogs/quick/agent-hours, /aws/vendedlogs/quick/index-usage_). It also prompts for a prefix (_quickobserve_) for other AWS resources to be created.

Chat message content (user\_message and system\_text\_message) might contain sensitive or regulated data from connected enterprise sources such as databases, Amazon S3 buckets, or third-party integrations. Before enabling message content logging, review your organization’s data privacy, compliance, and data retention policies. The chat message content is omitted by default so that no user conversation data reaches CloudWatch Logs. The deployment prompts you if you want to log the chat message content.

Verify the CloudWatch vended log groups in the AWS console:

![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/18/ML-20929-image-2.png)

### Deploy data pipeline

Use the following command to deploy the pipeline:

```
python3 deploy.py --pipeline
```

This deploys Amazon S3 data lake, Amazon CloudWatch Logs subscription filters, Amazon Data Firehose delivery streams, AWS Lambda functions and an Amazon EventBridge rule.

You can see the logs data in Amazon S3 data lake (_quickobserve-pipeline-datalake-<account-id>__)._

![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/18/ML-20929-image-3.png)

### Set up data catalog

Use the following command to run the data catalog setup:

```
python3 deploy.py --datacatalog
```

The script prompts for a database name (_quickobserve\_db_) and verifies that it doesn’t already exist in the AWS Glue Data Catalog, preventing accidental changes to tables belonging to other workloads. It then prompts you to choose how data lake access is managed:

*   Lake Formation (default) – Registers the data lake location and grants fine-grained permissions to the Amazon Quick service role at the table and column level. When message content logging is enabled, column-level exclusion prevents message content from flowing into the Quick Sight dashboard and topic.
*   IAM policies – Skips AWS Lake Formation setup and relies on IAM policies for access control. Use this if your account does not use Lake Formation.

The script creates an AWS Glue Data Catalog database, Athena tables and views for CloudWatch vended logs and CloudTrail events.You can see the data catalog in AWS Glue:

![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/18/ML-20929-image-4.png)

Verify data is flowing by running the following queries in Amazon Athena query editor:

```
SELECT * FROM "quickobserve_db"."agent_hours_logs" ;

SELECT * FROM "quickobserve_db"."chat_logs" ;

SELECT * FROM "quickobserve_db"."cloudtrail_events" ;

SELECT * FROM "quickobserve_db"."feedback_logs" ;

SELECT * FROM "quickobserve_db"."index_usage_logs" ;

SELECT * FROM "quickobserve_db"."cloudtrail_events" ;
```

### Deploy Quick Sight dashboard

Deploy the Quick Sight dashboard:

```
python3 deploy.py --dashboard
```

This deploys Quick Sight resources: a custom [theme](https://docs.aws.amazon.com/quick/latest/userguide/themes-in-quicksight.html), a [data source](https://docs.aws.amazon.com/quick/latest/userguide/supported-data-sources.html), [datasets](https://docs.aws.amazon.com/quick/latest/userguide/working-with-datasets.html) with daily refresh schedules, an [analysis](https://docs.aws.amazon.com/quick/latest/userguide/working-with-an-analysis.html), and a [dashboard](https://docs.aws.amazon.com/quick/latest/userguide/creating-a-dashboard.html) for viewing Amazon Quick observability metrics.

You can see the observability metrics in Quick Sight dashboard:

1.  Log in to the Amazon Quick [console](https://quicksight.aws.amazon.com/).
2.  From the left navigation menu, select **Dashboards**, and then select **Quick Observability Dashboard**.

_![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/18/ML-20929-image-5.png)_

Each sheet in the dashboard includes date range parameter controls and a detail table at the bottom. Selecting any chart, pie slice, or KPI filters the detail table to show the matching records.

### Create Quick Sight topic

Use the following command to create the Quick Sight topic:

```
python3 scripts/create_topic.py
```

The script verifies that each dataset contains data from a successful ingestion, then creates a Quick Sight topic with custom instructions that route questions to the correct dataset. You can see the Quick Sight Topic in Amazon Quick console.

1.  Log in to the Amazon Quick console.
2.  From the left navigation menu, select **Topics**, and then select **Quick Observability Topic**.

![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/18/ML-20929-image-6.png)

### Create Quick custom chat agent

This step is performed through the Amazon Quick [console](https://quicksight.aws.amazon.com/).

1.  From the left navigation menu, select **Spaces**, and then select **Create space**.
2.  On the space creation page that opens, enter a **name** and **description** for your space.
3.  Select **Add knowledge** to begin adding content to your space.
4.  From the menu, choose **Topics**.
5.  In **Add topic**, select **Quick Observability Topic**.

![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/18/ML-20929-image-7.png)

Create a Quick custom chat agent:

6.  From the left navigation menu, select **Chat agents**, and then select **Create chat agent**.
7.  On the agent creation page that opens, enter a **name** and **description** for your agent.
8.  Under **Instructions**, paste [prompt](https://github.com/aws-samples/sample-quick-observability-platform/blob/main/docs/Quick%20custom%20chat%20agent.txt) from the GitHub repository.
9.  Under **Knowledge sources**, choose **Link Spaces** and select **Quick Observability Space**.
10.  Select **Launch chat agent** to publish the agent to the chat agent library and use it in chat.

![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/18/ML-20929-image-8.png)

Business leaders can ask questions like “Which Amazon Quick features are being used the most in the last 30 days?”

## ![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/18/ML-20929-image-9.png)

They will receive instant visual answers with metrics, charts, and actionable recommendations.

![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/18/ML-20929-image-10.png)

![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/18/ML-20929-image-11.png)

![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/18/ML-20929-image-12.png)

## ![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/18/ML-20929-image-13.png)

## Clean up

To clean up your resources deployed, run the cleanup script:

`python3 cleanup.py`

## Conclusion

In this post, we showed how to deploy an observability solution that consolidates Amazon Quick operational data into a secured data lake. The solution makes chat interaction metrics, user feedback, agent hours usage, index storage usage, and governance events accessible through Amazon Athena, an Amazon Quick Sight dashboard, and an Amazon Quick custom chat agent.You can extend the solution in several ways: add custom Athena views for your organization’s specific metrics, create additional sheets in the dashboard, build new chat agents tailored to different teams, or integrate the data lake with other analytics tools.

To get started, you can clone the [GitHub repository](https://github.com/aws-samples/sample-quick-observability-platform) and deploy the solution.

* * *

## About the authors
