---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/monitor-amazon-sagemaker-pipelines-cross-account-with-custom-amazon-cloudwatch-dashboards
ingested: 2026-07-23
feed_name: AWS China ML
sha256: 8329207de04cdb2e2fd15dbc2227ffcd8ab8c3ba7da04512a71c8b1f12d03d6d
---

# Monitor Amazon SageMaker Pipelines cross-account with custom Amazon CloudWatch dashboards

Using [Amazon SageMaker](<https://aws.amazon.com/sagemaker>) [Pipelines](<https://docs.aws.amazon.com/sagemaker/latest/dg/pipelines.html>), organizations can automate their machine learning (ML) workloads and distribute them over many AWS accounts and AWS Regions as part of their [Machine Learning Operations](<https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-projects-why.html>) (MLOps) strategy.

However, monitoring SageMaker Pipelines can become complex when they are distributed across many AWS environments. Developers and operations engineers must manually switch between multiple accounts and Regions to inspect SageMaker Pipeline executions, resulting in operational overhead.

[Amazon SageMaker Studio](<https://aws.amazon.com/sagemaker-ai/studio/>) provides monitoring for SageMaker Pipelines within a single account and Region. Organizations can use services like [Amazon CloudWatch](<https://aws.amazon.com/cloudwatch>), [AWS Lambda](<https://aws.amazon.com/lambda/>), [Amazon DynamoDB](<https://aws.amazon.com/dynamodb/>), and [Amazon EventBridge](<https://aws.amazon.com/eventbridge>) to build dashboards that track SageMaker Pipelines executions across multiple AWS environments, tailored to their observability requirements.

In this post, we present a solution designed to centralize the monitoring of SageMaker Pipelines across AWS accounts and Regions using Amazon CloudWatch [custom dashboards](<https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/create_dashboard.html>). The accompanying [GitHub repository](<https://github.com/aws-samples/sample-monitor-sagemaker-pipelines-cross-region-account>) provides a customizable [AWS Cloud Development Kit (AWS CDK)](<https://aws.amazon.com/cdk/>) example of the required infrastructure.

The solution is designed to provide detailed, near-real time visibility from a single interface into SageMaker Pipelines executions running in many Regions and many accounts to help streamline daily operations. In the next section, we examine in detail the architecture of the solution.

## Solution overview

The solution implements an interactive CloudWatch dashboard designed to provide unified visibility into SageMaker Pipelines running across multiple AWS accounts and Regions.

We choose a serverless, event-driven architecture that responds to SageMaker Pipeline events in real time, avoiding the overhead of always-on monitoring systems or polling mechanisms. Using managed or serverless services and native service integrations can also help reduce upfront costs and maintenance effort.

The implementation follows a hub-and-spoke model, which reduces complexity by centralizing the monitoring in the primary account and Region, while lightweight components in each secondary account or Region track SageMaker Pipelines data and forward it to the monitoring hub. The diagram illustrates this architecture.

The solution described in the diagram provides modular components that comprise two main [AWS CloudFormation](<https://aws.amazon.com/cloudformation/>) stacks: the Dashboard stack and the Forwarder stack.

The Dashboard stack contains the CloudWatch dashboard, Amazon DynamoDB storage tables, and AWS Lambda functions required for data processing and visualization. It's deployed only in the primary account and Region that acts as the monitoring hub.

The Forwarder stack is deployed in the monitored accounts that are the source of the SageMaker Pipeline data. These lightweight stacks use Amazon EventBridge to send enriched data to the monitoring hub.

Combined, the two stacks collect, process, and display aggregated information to users through the following workflow:

  1. When a step of a SageMaker Pipeline changes status, [Amazon SageMaker AI](<https://aws.amazon.com/sagemaker-ai>) generates source events. These events include metadata such as the time of the event, the Amazon Resource Name (ARN) of the pipeline and of the pipeline execution, the status of the step, and others.
  2. Amazon EventBridge rules capture such events in real time and send them to AWS Lambda functions for processing.
  3. Lambda functions process the event data, enrich it with additional metadata like status or display name of the SageMaker Pipeline execution, and send it to the local EventBridge bus.
  4. Custom EventBridge rules capture the enriched data and forward it to the monitoring hub account.
  5. [AWS Identity and Access Management (IAM)](<https://aws.amazon.com/iam/>) roles and resource policies secure the transmission of cross-account events.
  6. Another EventBridge rule in the monitoring account triggers a Lambda function that ingests the data about each SageMaker Pipeline execution and stores it in DynamoDB tables. The data stored includes, for instance, Region, account ID, creation, start and stop times, display name, and status of each SageMaker Pipeline execution and its individual steps.
  7. Lambda functions power the backend of the dashboard, reading DynamoDB tables and returning formatted HTML.
  8. An Amazon CloudWatch dashboard with [custom widgets](<https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/add_custom_widget_dashboard.html>) acts as a user-facing front end without leaving the [AWS Management Console](<https://aws.amazon.com/console>). It shows the SageMaker Pipeline executions with the respective account IDs, Regions, creation times, and current status. Users can use [Interactive elements](<https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/add_custom_widget_dashboard_interactivity.html>) to filter data by pipeline name and access detailed information about the steps of a single execution. This information includes step name, type, start and end times, and status.
  9. CloudWatch triggers an [alarm](<https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html>) in case of anomalous activity from dashboard users. [Amazon Simple Notification Service (Amazon SNS)](<https://aws.amazon.com/sns>) then sends an alert to the subscribers of an [SNS topic](<https://docs.aws.amazon.com/sns/latest/dg/welcome.html>), which is encrypted using a customer managed [AWS Key Management Service (AWS KMS)](<https://aws.amazon.com/kms/>) [key](<https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html>). The alarms trigger when the widget calls to the respective Lambda functions exceed the thresholds defined in the Dashboard stack.



This solution aims to provide a single-pane dashboard for cross-account and cross-Region observability of SageMaker Pipelines using a serverless, event-driven hub-and-spoke architecture.

The data originates from SageMaker AI events and API calls, which are transformed to provide a comprehensive view of pipeline execution status. This data is stored in centralized DynamoDB tables and then displayed on a custom CloudWatch dashboard. You can extend the dashboard by using Lambda functions to read and process additional information before storing it in the DynamoDB tables.

In the following section, we show how to deploy the solution.

## Prerequisites

You must have the following prerequisites:

  1. One AWS account with two Regions [bootstrapped for the AWS CDK](<https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping-env.html>). One Region will host the monitoring dashboard. The other Region will generate cross-Region SageMaker Pipelines events that will be displayed in the dashboard.
  2. A second AWS account with at least one bootstrapped Region to generate cross-account events that will be displayed in the dashboard.
  3. AWS credentials as shell environment variables with sufficient permissions to deploy the solution.
  4. Python (version 3.14 or later).
  5. The [AWS CDK](<https://docs.aws.amazon.com/cdk/v2/guide/getting-started.html>) installed (version 2.1100.1 or later).
  6. The [AWS Command Line Interface](<https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html>) (AWS CLI) installed (version 2.32.12 or later).
  7. Docker, required for Lambda function packaging.
  8. At least one SageMaker Pipeline in each account and Region combination. If you don't have existing SageMaker Pipelines, you can [create them using SageMaker AI Projects](<https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-projects-create.html>) from the [SageMaker Studio](<https://docs.aws.amazon.com/sagemaker/latest/dg/studio-updated.html>) in an [Amazon SageMaker AI domain](<https://docs.aws.amazon.com/sagemaker/latest/dg/gs-studio-onboard.html>).



## Deploy the solution

After you've satisfied the prerequisites, complete the following steps to deploy the solution.

  1. Clone the [GitHub repository](<https://github.com/aws-samples/sample-monitor-sagemaker-pipelines-cross-region-account>).
  2. Follow the detailed deployment instructions in the README file to deploy the stacks using the AWS CDK and the AWS CLI.
  3. Navigate to the [AWS CloudFormation console](<https://console.aws.amazon.com/cloudformation>) in each account and Region. Choose either the `DashboardStack` or the `ForwarderStack` stack for more information about the deployments and the created resources.



With the solution deployed, you can now test its functionality. In the following section, we explain how to verify its capabilities.

## Test the solution

After deploying the solution, complete the following steps to test the functionalities of the dashboard. You can both [create](<https://docs.aws.amazon.com/sagemaker/latest/dg/define-pipeline.html>) SageMaker Pipelines and [launch](<https://docs.aws.amazon.com/sagemaker/latest/dg/run-pipeline.html>) executions from SageMaker Studio.

  1. On the [Amazon CloudWatch console](<https://console.aws.amazon.com/cloudwatch/home>), choose **Dashboards** in the navigation pane.
  2. Choose the dashboard **PipelineMonitoringDashboard**.
  3. When prompted, allow the Lambda function to execute. Make sure that it contains `customWidget` in its name, as per [best practices](<https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/add_custom_widget_dashboard.html>). The dashboard should update to look like the following image.
  4. If there are no recent SageMaker Pipeline executions, launch new executions in the monitored accounts and Regions starting, for simplicity, with the same account and Region of the monitoring dashboard.
  5. Return to the dashboard and reload the results using the refresh button on the top right corner of the widget. You should see new SageMaker Pipeline execution status updates. Make sure to choose a time range containing SageMaker Pipeline executions using the bar at the top of the dashboard.



  6. Choose the **Steps details** button. Allow the custom widget Lambda function to execute as described in the previous step. The popup will show detailed information about individual SageMaker Pipeline steps as illustrated in the following image.



  7. Use the date range at the top of the dashboard to filter for SageMaker Pipeline executions on custom date ranges. You should see runs only for executions within the chosen time range.
  8. Use the **Pipeline name** , filter on the top left corner of the widget. Enter the name of one SageMaker Pipeline, then refresh the widget. You should see runs only for SageMaker Pipelines matching the searched name.



## Best practices and considerations

When implementing such a monitoring solution, consider the following recommendations to enhance reliability, security, and operational efficiency or to customize it to the needs of your organization.

  * **Flexibility and customization** : You can further enrich the custom dashboard by including new data in the Lambda functions that populate the DynamoDB tables and by adding visualization logic. You can also add more filters, metrics, interactive popups or [built-in CloudWatch widgets](<https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/create-and-work-with-widgets.html>) to consolidate and extend monitoring of your ML workloads. Furthermore, you can extend the solution to monitor [AWS Step Functions](<https://aws.amazon.com/step-functions>) state machine executions, jobs on [AWS Batch](<https://aws.amazon.com/batch/>) or [AWS Glue](<https://aws.amazon.com/glue>), or [Amazon EMR](<https://aws.amazon.com/emr/>) clusters that support your ML workloads. In such a situation, consider [creating a dedicated EventBridge event bus](<https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-create-event-bus.html>) to isolate monitoring traffic from other events.
  * **Metrics and alarms** : Monitor your SageMaker Pipeline through multiple layers: use EventBridge rules for service events, CloudWatch [log anomaly detection](<https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/LogsAnomalyDetection.html>) for ML jobs execution logs, and [CloudWatch metrics](<https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/working_with_metrics.html>) for resource utilization. Configure additional alarms on logs and metrics, or direct event notifications, to send Amazon SNS alerts to your team.
  * **Dashboard accessibility and customization** : Consider different methods to [share CloudWatch dashboards](<https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch-dashboard-sharing.html>) for faster accessibility and without passing through the AWS Management Console. Additionally, consider using [Amazon managed Grafana](<https://aws.amazon.com/grafana/>) as an alternative for data visualization.
  * **Private networking** : For organizations with strict security requirements, consider deploying the solution within an [Amazon virtual private cloud (VPC)](<https://aws.amazon.com/vpc>) for increased isolation. You can connect VPCs across Regions and accounts using [VPC peering](<https://docs.aws.amazon.com/vpc/latest/userguide/vpc-peering.html>) connections or [AWS Transit Gateway](<https://aws.amazon.com/transit-gateway>).
  * **Integrate with continuous integration and delivery (CI/CD)** : For greater reliability, deploy the solution with (CI/CD) pipelines across the environments running your ML workflows. For example, [AWS Organizations](<https://aws.amazon.com/organizations/>) and the [AWS Deployment Framework (ADF)](<https://github.com/awslabs/aws-deployment-framework>) help you deploy consistently and repeatably across your environments.



## Clean up

To clean up your resources, for each of the accounts and Regions combinations to which you have deployed, go to the [CloudFormation service console](<https://console.aws.amazon.com/cloudformation>), and delete the instances of `DashboardStack` or `ForwarderStack`.

Alternatively, you can repeat the same AWS CDK commands you executed before with the same AWS credentials and CLI arguments, respectively, but substituting `cdk deploy` with `cdk destroy`.

Also remember to [delete the SageMaker projects](<https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-projects-delete.html>), [resources](<https://docs.aws.amazon.com/sagemaker/latest/dg/sm-console-domain-resources-shut-down.html>), and [instances of SageMaker AI domain](<https://docs.aws.amazon.com/sagemaker/latest/dg/gs-studio-delete-domain.html>) in each account and Region if you created them only to test the solution.

## Conclusion

We demonstrated how to set up a solution that helps monitor SageMaker Pipelines across AWS accounts and Regions using an interactive CloudWatch dashboard to improve operational efficiency. It is designed to deliver real-time updates, integrates directly with the AWS Management Console, and uses a fully serverless and event-driven architecture for greater scalability.

To further adapt this solution to meet the standards of your organization, discover how to accelerate your journey on the cloud with the support of [AWS Professional Services](<https://aws.amazon.com/professional-services/>).

Refer to the following resources to learn more on MLOps best practices:

  * [Implement a secure MLOps platform based on Terraform and GitHub](<https://aws.amazon.com/blogs/machine-learning/implement-a-secure-mlops-platform-based-on-terraform-and-github/>)
  * [AIOps modules](<https://github.com/awslabs/aiops-modules>)
  * [Governing the ML lifecycle at scale, Part 1: A framework for architecting ML workloads using Amazon SageMaker](<https://aws.amazon.com/blogs/machine-learning/governing-the-ml-lifecycle-at-scale-part-1-a-framework-for-architecting-ml-workloads-using-amazon-sagemaker/>)
  * [Build an end-to-end MLOps pipeline using Amazon SageMaker Pipelines, GitHub, and GitHub Actions](<https://aws.amazon.com/blogs/machine-learning/build-an-end-to-end-mlops-pipeline-using-amazon-sagemaker-pipelines-github-and-github-actions/>)
  * [Build a centralized monitoring and reporting solution for Amazon SageMaker using Amazon CloudWatch](<https://aws.amazon.com/blogs/machine-learning/build-a-centralized-monitoring-and-reporting-solution-for-amazon-sagemaker-using-amazon-cloudwatch/>)



Take also a look at more [examples of custom widgets in CloudWatch dashboards](<https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/add_custom_widget_samples.html>) to further strengthen the observability of your environments.

* * *

## About the author

### Giorgio Pessot

Giorgio is a Machine Learning Engineer at AWS Professional Services. With a background in computational physics, he specializes in architecting enterprise-grade AI systems at the confluence of mathematical theory, DevOps, and cloud technologies. When he's not whipping up cloud solutions, you'll find him Giorgio engineering culinary creations in his kitchen.
