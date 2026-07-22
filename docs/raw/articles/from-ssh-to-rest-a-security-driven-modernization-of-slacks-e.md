---

title: "From SSH to REST: A Security-Driven Modernization of Slack’s EMR Data Pipelines"
type: raw
tags: [newsletter]
source: newsletter
source_url: https://slack.engineering/from-ssh-to-rest-a-security-driven-modernization-of-slacks-emr-data-pipeli
sha256: 2302fc06c34d
created: 2026-05-19
updated: 2026-05-19
review_value: 7
review_confidence: 9

---
Markdown Content:
#### Excerpt
By 2024, Slack’s data platform had accumulated 700+ SSH-based operators orchestrating critical data pipelines. We’re talking daily search indexing that processed terabytes of data, analytics jobs powering business intelligence, the whole shebang. Every single one of these jobs required direct SSH access to production AWS Elastic MapReduce (EMR) clusters. We had a massive security surface, and we couldn’t move forward on any infrastructure modernization. Not ideal.
We needed to eliminate SSH entirely. The solution? Migrate all 700+ jobs to a REST-based architecture. This is the story of how we killed SSH entirely, across 8 data regions, with zero downtime.
## How We Got Here
Slack’s data platform was built around 2017 with a straightforward pattern. [Airflow](https://airflow.apache.org/), our data pipeline orchestrator, needed to run jobs on EMR clusters, and SSH was the most direct path. Connect to the EMR master node, execute a command, done. Simple.
```
# The old way - simple, but problematic
task = SSHOperator(
    task_id='run_spark_job',
    ssh_conn_id='emr_master',
    command='spark-submit /path/to/job.py',
)
```
This pattern proliferated across the platform. Teams built custom SSH-based operators for different use cases (because hey, if SSH works for Spark, why not everything else). By the time we took stock, we had 700+ jobs in production running everything from MapReduce jobs to AWS CLI commands to custom Python scripts.
It worked. But it came with some potential problems.
## The Real Cost of SSH
### Potential security risks included:
1.   Direct SSH access to compute clusters increases the potential attack surface
2.   Key distribution and rotation across orchestration workers adds operational overhead
3.   Achieving fine-grained audit granularity typically requires correlating logs across multiple systems
4.   Permission management can grow complex, often requiring dedicated security groups and custom configurations
### Operations were painful:
1.   Jobs ran directly on EMR master nodes instead of being distributed, causing resource contention
2.   When Kubernetes pods restarted, SSH connections broke and jobs failed
3.   Long-running jobs became “zombies” that kept executing after their connections terminated
4.   No reliable way to determine if a job succeeded or failed when connections dropped (not ideal when you’re processing terabytes)
### We were blocked:
1.   Couldn’t start the path for Spark on Kubernetes nor EMR on AWS Elastic Kubernetes Service (EKS) (required eliminating SSH dependencies first)
2.   Couldn’t complete our Whitecastle initiative because we needed to move the last main-account EMR clusters to child accounts
    *   Whitecastle is Slack’s initiative to migrate AWS infrastructure to child accounts for improved security and network isolation. [Building the Next Evolution of Cloud Networks at Slack: A Retrospective](https://slack.engineering/building-the-next-evolution-of-cloud-networks-at-slack-a-retrospective/)
3.   Couldn’t implement proper job monitoring and observability
### An example problem:
The Search Infrastructure team’s pipeline builds Solr search indexes from terabytes of data daily. This pipeline powers Slack’s search functionality. Any disruption affects search quality for millions of users. And it was relying on SSH-based job submission with all the reliability problems mentioned above. Not great.
## Understanding the Foundation: REST-Based Job Submission
Before diving into the solution, let’s establish what REST-based job submission actually means (and why it matters).
### The Problem with SSH
When you SSH into a machine and run a command, you’re creating a direct, stateful connection. If that connection drops (say your Kubernetes pod restarts), the command might keep running, might fail, or might leave orphaned processes hanging around. You’ve got no reliable way to reconnect and check status. It’s like hanging up mid-phone call and hoping the other person finishes the conversation.
### The REST Alternative
Modern compute engines (YARN, Trino, Snowflake) expose HTTP APIs for job submission. Instead of maintaining a connection, you:
1.   **POST** a job request → receive a job ID
2.   **GET** job status using the ID → check if it’s running, completed, or failed
3.   **DELETE** the job → cleanly cancel, if needed
The job lifecycle is managed server-side. Your client can crash and restart, and the job keeps running while you can still query its status. Much better.
### The YARN Piece
For Hadoop workloads (MapReduce, Spark, Hive), YARN is the resource manager with a REST API for job submission. But here’s the catch: YARN’s API is designed for Hadoop jobs. What about the 300+ CLI-based jobs running arbitrary shell commands like _aws s3 sync_ or _hadoop distcp_?
That’s where YARN Distributed Shell comes in. This was the key breakthrough that made this whole migration possible.
## The Breakthrough: YARN Distributed Shell
Migrating Spark and Hive jobs was more straightforward. Spark has the Livy REST API and Hive has HiveServer2. But MapReduce jobs and the 300+ CLI-based jobs running arbitrary shell commands? Those were the hard parts. They didn’t have ready-made REST APIs.
We brainstormed multiple approaches. Our requirements were clear:
*   **Simple REST-based solution**: fits naturally into our architecture
*   **Existing authentication and authorization mechanisms**: no custom security layer to build and maintain
*   **Open-source protocols**: leverage standard YARN APIs, not proprietary solutions
*   **Minimal complexity**: no building and maintaining custom job execution infrastructure
Some ideas we considered:
1.   Building a custom wrapper service to execute commands remotely
2.   Using remote execution frameworks like Ansible or Salt
3.   Creating a new job type in YARN from scratch
All of these felt too complex, required custom security implementations, or introduced new dependencies we’d have to maintain. Not great options.
Then we discovered YARN’s Distributed Shell. It’s a little-known feature (_org.apache.hadoop.yarn.applications.distributedshell.ApplicationMaste r_) that allows any shell script to run in a proper YARN container with resource allocation and lifecycle management. And here’s the kicker: it was already part of YARN, used the same REST APIs, and required no custom security layer. It was perfect.
Here’s how it works:
### 1. Upload your command to S3
For example, we could upload the following script (_command.sh_) to _s3://bucket/_
```
# command.sh
aws s3 sync /tmp/data/ s3://bucket/output/
```
### 2. Submit to YARN with Distributed Shell configuration
```
{
  "application-type": "MAPREDUCE",
  "am-container-spec": {
    "commands": {
      "command": "{{JAVA_HOME}}/bin/java org.apache.hadoop.yarn.applications.distributedshell.ApplicationMaster ..."
    },
    "environment": {
      "DISTRIBUTEDSHELLSCRIPTLOCATION": "s3://bucket/command.sh",
      "DISTRIBUTEDSHELLSCRIPTLEN": "548",
      "DISTRIBUTEDSHELLSCRIPTTIMESTAMP": "1768529627000"
    }
  }
}
```
### 3. YARN allocates a container, downloads the script, and executes it:
Yarn manages:
1.   Proper resource limits (memory, vCores)
2.   Container isolation
3.   Retry and fault tolerance
4.   Clean cancellation
5.   Proper logging through YARN UI
This architectural decision unlocked the migration of all SSH-based jobs. Not just Hadoop workloads, but any shell command. Whether it was aws s3 sync, hadoop distcp, or custom Python scripts, they could all run in proper YARN containers. Game changer.
![Image 1: YARN Distributed Shell job submission flow](https://slack.engineering/wp-content/uploads/sites/7/2026/04/Figure2_v2_wp_safe.png?w=640)
_Figure 1: YARN Distributed Shell job submission flow showing how arbitrary shell commands are executed in YARN containers through Quarry._
### The Solution: Quarry
Now that we understand the advantages of REST-based job submission and how we can migrate each existing job type, we’re just missing one thing: an orchestrator.
Enter Quarry, Slack’s REST-based job submission gateway. Quarry was originally built to provide a unified interface for submitting jobs across multiple compute engines (EMR/YARN, Trino, Snowflake). It already solved authentication, reliability, and observability challenges. For SSH deprecation, it turned out to be exactly what we needed.
### What Quarry Does
Quarry sits between various services and compute engines (Airflow being the biggest user), handling:
1.   **Authentication**: Service-to-service tokens instead of SSH keys
2.   **Job submission**: REST APIs to YARN, Trino, and Snowflake
3.   **State tracking**: Server-side monitoring of job status
4.   **Lifecycle management**: Clean cancellation and cleanup through REST APIs
5.   **Observability**: Structured logs, metrics, and tracing for all job submissions
### The Architecture Shift
**Before:**
`Airflow → SSH Connection → EMR Master Node → Execute Command`
**After:**
`Airflow → Quarry REST API → YARN ResourceManager → EMR Container`
Instead of establishing SSH connections, Airflow operators make HTTP requests to Quarry. Quarry submits jobs to YARN and polls for status. If an Airflow pod restarts, the job keeps running, and Quarry maintains the connection.
![Image 2: Architecture comparison showing the shift from SSH-based direct execution to REST-based job](https://slack.engineering/wp-content/uploads/sites/7/2026/04/Figure1_updated_v2_wp_safe.png?w=640)
_Figure 2: Architecture comparison showing the shift from SSH-based direct execution to REST-based job submission through Quarry and YARN._
### The Quarry Advantage
With YARN Distributed Shell support, Quarry became our universal job submission gateway. Whether you’re running a Spark job, a Hive query, or a simple shell script, it all goes through the same REST API.
No SSH credentials. No direct cluster access. Just REST API calls with proper authentication and server-side job tracking.
## The Migration Journey
We knew from the start this wasn’t going to be a quick fix. We had 700+ production jobs across 8 independent data regions, each with unique network configurations and data sovereignty requirements. Critical workloads, like search indexing, couldn’t tolerate any downtime. So yeah, we needed a plan.
### The Approach: Incremental and Phased
**Phase 1 – Proof of Concept**: Started with pilot jobs to validate the Quarry-based approach. Built the first Quarry operators and tested in dev environments.
**Phase 2 – Security Review**: Engaged security teams to plan credential elimination and ensure the REST-based approach met security requirements.
**Phase 3 – OKR-Driven Execution**: Made it a Key Result with executive visibility. This created accountability and kept it prioritized. We hit the 80% migration milestone during this phase.
**Phase 4 – Bulk Migration**: Heavy cross-team coordination to migrate remaining workloads across all regions. Multiple teams (Search Infrastructure, Data Engineering & Analytics, ML Services) worked in parallel.
**Phase 5 – Final Cleanup**: Completed overlooked DAGs and deprecated all legacy SSH-based operators. Achieved 100% completion.
### Migration by the Numbers
*   700+ jobs migrated across 7 operator types
*   8 independent data regions with coordinated rollouts
*   5 teams transitioned to new operators
*   Zero downtime for business-critical service s
*   Completed in 3 quarters, from initial pilot to 100% SSH elimination
## The Challenges We Hit
No migration this size goes smoothly. Here are the biggest obstacles we ran into (and how we dealt with them).
### Challenge 1: Virtual Memory Check Failures
During migration of a data export DAG, we hit unexpected failures. Jobs that’d been running fine via SSH were now failing with vmem (virtual memory) check errors. What gives?
**The root cause**: SSH commands ran directly on the master node, bypassing YARN’s resource enforcement entirely. Quarry submits jobs properly to YARN, which actually enforces resource limits. The vmem check was rejecting containers that exceeded virtual memory limits (which SSH had been quietly ignoring).
**The fix**: Following AWS best practices, we disabled vmem checks across all clusters:
`"yarn.nodemanager.vmem-check-enabled": "false"`
AWS explicitly recommends this because virtual memory accounting in Linux can be unreliable, and physical memory limits are sufficient. (Also, it’s worth noting that vmem checks have been a source of spurious failures for years in the Hadoop ecosystem.)
**Lesson learned:** When migrating from SSH to proper YARN submission, expect to encounter resource limit issues that were previously invisible. SSH hides a lot of problems. Test thoroughly in dev environments before production rollout.
### Challenge 2: Network Segregation and EKM Connectivity
During migration of dev search infrastructure jobs from one dev cluster to a staging analytics cluster, a task failed with an EKM (Enterprise Key Management) connectivity timeout. Great.
```
Error: com.amazon.ws.emr.hadoop.fs.shaded.com.amazonaws.SdkClientException:
Unable to execute HTTP request: Connect to sts.amazonaws.com:443 failed: connect timed out
```
**The root cause**: the original cluster had network routing configured to reach the necessary key management endpoints. The staging analytics cluster, operating in a stricter network segment, did not have equivalent connectivity and correctly so. The failure surfaced a hidden dependency on network topology that wasn’t captured in the job’s configuration.
**The fix**: We moved search infrastructure tasks to a dev ETL cluster with proper routing to dev services. For tasks requiring production Hive catalogs, we kept them in staging. We also scaled up the dev ETL cluster to handle the additional workload.
**Lesson learned**: Network topology matters. Like, really matters. Understand network segregation and account boundaries before deciding which cluster runs which jobs. Dev jobs need dev network access, prod jobs need prod network access. The migration revealed hidden dependencies that SSH had been quietly papering over.
### Challenge 3: Multi-Region Complexity
Slack operates EMR clusters across 8 independent data regions to support data sovereignty requirements. This meant the SSH deprecation wasn’t a single migration. It was effectively 8 parallel migrations, each with its own special set of challenges. Fun times.
### The Complexity
*   **Configuration management**: Each region required separate Quarry configurations, cluster endpoints, and network routing rules
*   **Testing overhead**: Every code change needed validation across all 8 regions before production rollout (multiply your testing time by 8)
*   **Staggered deployments**: Couldn’t deploy to all regions simultaneously. Had to roll out region by region.
*   **Region-specific issues**: Network configurations, data sovereignty rules, and cluster versions varied by region
### Our Approach
*   Validated changes in a single pilot region (typically US-based for faster iteration)
*   Documented region-specific configuration requirements
*   Built region-aware Quarry operators that could handle regional differences
*   Rolled out to remaining regions incrementally, learning from each deployment
*   Maintained separate tracking for each region’s migration progress
**Lesson learned:** Multi-region infrastructure significantly multiplies migration complexity. The effort isn’t just N times harder. It’s N times harder with unique failure modes for each region. Budget extra time for cross-region coordination and region-specific debugging. (Seriously, budget more time than you think.)
## The Results
We achieved 100% SSH elimination. Every production job now runs through Quarry with REST-based submission. Here’s what we gained.
### Security Wins
**Eliminated SSH access** to all production EMR clusters across 8 independent data regions, which massively reduced our attack surface. We replaced SSH key distribution with service-to-service token authentication, and gained proper audit trails through REST API logging. Every job submission now has structured logs through Quarry. No more “who ran that command?” mysteries.
This also enabled completion of our Whitecastle initiative by allowing us to migrate the last AWS main account EMR cluster to a child account. Bonus: we simplified compliance by removing special security group configurations and the complex permission management that SSH access required.
### Operational Improvements
**Master node resource contention**: eliminated. All non-Hadoop jobs now run in distributed YARN containers with proper resource allocation instead of competing for resources on the master node.
**Job reliability**: dramatically improved. Jobs survive client Kubernetes pod restarts because Quarry maintains server-side job tracking. No more zombie processes. Jobs terminate properly when cancelled through REST APIs. We gained proper lifecycle management with clean cancellation and cleanup.
**Observability**: transformed. Structured job status, logs, and metrics are now available through Quarry’s API. We can track jobs across their entire lifecycle, see YARN container logs, and actually debug issues with proper tooling instead of SSH-ing into boxes and hoping for the best.
### Future Enablement
The REST-based architecture unblocked critical initiatives:
*   Spark on Kubernetes migration now possible (no SSH dependencies to migrate)
*   Modern infrastructure patterns enabled (REST-based architecture aligns with cloud-native practices)
*   Easier team onboarding (simpler, more maintainable Quarry operators vs. complex SSH configurations)
*   Platform evolution (decoupled Airflow from EMR infrastructure details)
*   Standardized job submission (consolidated all job submission through Quarry, making future changes easier)
With two years of production experience since completion, the architectural decisions have proven sound. The REST-based approach delivered on its promises: better security, operational stability, and infrastructure flexibility. No regrets.
## What We Learned
### What Worked Well
1.   **Incremental migration approach**: Dev → GovDev/CommDev → Prod rollout minimized risk at every step. We migrated jobs by operator type rather than trying to convert everything simultaneously. This allowed us to learn from each migration and refine our approach for the next batch.
2.   **Strong team collaboration**: Multiple teams working together seamlessly across search, analytics, data engineering, ML, and marketing domains. Prompt code reviews kept momentum high. Regular communication in shared channels kept everyone informed.
3.   **Analytics-driven progress****tracking**: We created an Analytics dashboard to track migration progress across all regions. Querying the Airflow database to identify remaining SSH-based tasks made it easy to see which teams/DAGs still needed migration. This data-driven approach kept the project moving.
### What We’d Do Differently
1.   **Earlier network topology mapping**: We discovered network segregation issues (like the EKM connectivity problem) pretty late in the migration. Understanding Whitecastle account boundaries and network routing upfront would’ve saved us some pain. Next time: document network topology and dependencies before starting cluster migrations. Don’t assume SSH’s simplicity means everything will “Just Work” when you swap it out.
2.   **Earlier resource limit testing**: The vmem check issue caught us by surprise late in the project. We should’ve tested YARN resource limits against an SSH baseline way earlier in the process. Recommendation: Include resource limit testing in the initial pilot migration phase. SSH bypasses a lot of stuff, and you want to know what that stuff is before it bites you in production.
3.   **Better communication about operator restrictions**: When we restricted SSHOperator to prevent new usage during the final migration phase, some teams weren’t aware. Better advance notice to all Airflow users would’ve prevented confusion and friction. Internal communication is hard, but it matters.
### Best Practices for Large-Scale Migrations
1.   **Build monitoring before you migrate**: Set up tracking dashboards early so you always know what’s left to migrate. Airflow database queries made it easy to identify remaining work. Progress visibility kept the project moving.
2.   **Test in multiple environments**: Dev, CommDev, and GovDev testing caught environment-specific issues before production. Network segregation issues only appeared when testing across account boundaries. Don’t skip environment-specific testing. Hidden dependencies will absolutely bite you.
3.   **Progressive operator deprecation**: We deprecated operators one at a time (CrunchExecOperator, then S3SyncOperator, etc.). Each deprecation was its own mini-project with testing and validation. While it was slower than migrating everything at once, it greatly mitigated the risk of the migration.
## Acknowledgments
We wanted to give a shout out to all the people that have contributed to this journey:
*   Gage Gaskin
*   Deepak Agarwal
*   And to all the teams that successfully transitioned their pipelines to the new architecture!
Interested in taking on interesting projects, making people’s work lives easier, or just building some pretty cool forms? We’re hiring! ![Image 3: 💼](https://s.w.org/images/core/emoji/17.0.2/svg/1f4bc.svg)
[Apply now](https://slack.com/careers/dept/software-engineering)