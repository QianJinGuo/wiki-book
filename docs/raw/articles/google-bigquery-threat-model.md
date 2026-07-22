---
title: BigQuery Threat Model Report
type: raw
tags: [google, bigquery, threat-model, security]
source: newsletter
source_url: https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model
published: 2026-05-20
ingested: 2026-05-20
sha256: b7d347766e19b46e
---
Published Time: Mon, 18 May 2026 18:47:33 GMT
Markdown Content:
[Skip to main content](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#main-content)
*   [Technology areas](https://docs.cloud.google.com/docs)
    *   [Overview](https://docs.cloud.google.com/docs/security)
    *   [Guides](https://docs.cloud.google.com/docs/security/overview/whitepaper)
*   [Cross-product tools](https://docs.cloud.google.com/docs/cross-product-overviews)
*   [Console](https://console.cloud.google.com/)
*   General security guides
*   [Google security overview](https://docs.cloud.google.com/docs/security/overview/whitepaper)
*   [Privileged access in Google Cloud](https://docs.cloud.google.com/docs/security/privileged-access-management)
*   [Revoke access to Google Cloud](https://docs.cloud.google.com/docs/security/data-loss-prevention/revoking-user-access)
*   [Handle compromised credentials](https://docs.cloud.google.com/docs/security/compromised-credentials)
*   [Respond to abuse notifications](https://docs.cloud.google.com/docs/security/respond-to-abuse-misuse)
*   Security whitepapers
*   
Infrastructure security
    *   [Infrastructure security design overview](https://docs.cloud.google.com/docs/security/infrastructure/design)
    *   [BeyondProd](https://docs.cloud.google.com/docs/security/beyondprod)
    *   [Binary Authorization for Borg](https://docs.cloud.google.com/docs/security/binary-authorization-for-borg)
    *   [Boot integrity](https://docs.cloud.google.com/docs/security/boot-integrity)
    *   [Data center physical-to-logical space](https://docs.cloud.google.com/docs/security/physical-to-logical-space)
    *   [Remote attestation](https://docs.cloud.google.com/docs/security/remote-attestation)
    *   [Production service protections](https://docs.cloud.google.com/docs/security/production-services-protection)
    *   [Titanium hardware security architecture](https://docs.cloud.google.com/docs/security/titanium-hardware-security-architecture)
    *   [Titan hardware chip](https://docs.cloud.google.com/docs/security/titan-hardware-chip)
*   
Encryption at rest
    *   [Default encryption at rest](https://docs.cloud.google.com/docs/security/encryption/default-encryption)
    *   [Granularity of default encryption for Google Cloud services](https://docs.cloud.google.com/docs/security/encryption/gcp-encryption-granularity)
    *   [Cloud Key Management Service encryption](https://docs.cloud.google.com/docs/security/key-management-deep-dive)
    *   [Cloud HSM architecture](https://docs.cloud.google.com/docs/security/cloud-hsm-architecture)
    *   [Customer-supplied encryption keys](https://docs.cloud.google.com/docs/security/encryption/customer-supplied-encryption-keys)
*   Security guidelines
*   Threat modeling
*   Regulatory compliance
*   Security products
*   
Data security
    *   [Cloud External Key Manager](https://docs.cloud.google.com/kms/docs/ekm)
    *   [Cloud HSM](https://docs.cloud.google.com/kms/docs/hsm)
    *   [Cloud Key Management Service](https://docs.cloud.google.com/kms/docs)
    *   [Confidential Computing](https://docs.cloud.google.com/confidential-computing/docs)
    *   [Secret Manager](https://docs.cloud.google.com/secret-manager/docs)
    *   [Sensitive Data Protection](https://docs.cloud.google.com/sensitive-data-protection/docs)
    *   [See additional products on overview page](https://docs.cloud.google.com/docs/security#expandable-6)
## Big Query threat model report Stay organized with collections  Save and categorize content based on your preferences.
*   On this page
*   [Threat details](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-details)
    *   [Data destruction using schema tampering](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-1)
    *   [Privilege escalation using IAM allow policy tampering](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-2)
    *   [Confused-deputy abuse using BigQuery-triggered downstream services](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-3)
    *   [Data exfiltration using unrestricted network egress](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-4)
    *   [Data integrity drift using poisoned reference or lookup tables](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-5)
    *   [Data tampering using malicious load jobs](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-6)
    *   [Excessive IAM permissions leading to information disclosure](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-7)
    *   [Exfiltration using a transfer to attacker-controlled cloud project or account](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-8)
    *   [Information disclosure using misconfigured authorized views or row-level security logic](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-9)
    *   [Information disclosure using public or cross-project dataset exposure](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-10)
    *   [Insider misuse of authorized BigQuery access (legitimate queries used for malicious collection)](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-11)
    *   [Persistence using stealth BigQuery IAM bindings on datasets, authorized views, or scheduled queries](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-12)
    *   [Spoofing using compromised service account credentials or OAuth token used for BigQuery access](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-13)
    *   [Cost-based denial of service using expensive queries](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-14)
_Last updated: April 16, 2026_
This document identifies potential attack vectors and mitigation strategies for data confidentiality, integrity, and availability for BigQuery. The scope of this report is limited to your perspective, focusing on risks that you can manage within your BigQuery environment.
_These threat models are a probabilistic assessment based on currently known attack vectors, architectural assumptions, and the system's specified scope at the time of publication. These models are not exhaustive and are intended to serve as a baseline for Google Cloud customers' security and risk assessments and to guide risk reduction decisions._
The following threats were identified for this service:
*   [Data destruction using schema tampering](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-1)
*   [Privilege escalation using IAM allow policy tampering](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-2)
*   [Confused-deputy abuse using BigQuery-triggered downstream services](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-3)
*   [Data exfiltration using unrestricted network egress](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-4)
*   [Data integrity drift using poisoned reference or lookup tables](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-5)
*   [Data tampering using malicious load jobs](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-6)
*   [Excessive IAM permissions leading to information disclosure](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-7)
*   [Exfiltration using a transfer to attacker-controlled cloud project or account](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-8)
*   [Information disclosure using misconfigured authorized views or row-level security logic](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-9)
*   [Information disclosure using public or cross-project dataset exposure](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-10)
*   [Insider misuse of authorized BigQuery access (legitimate queries used for malicious collection)](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-11)
*   [Persistence using stealth BigQuery IAM bindings on datasets, authorized views, or scheduled queries](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-12)
*   [Spoofing using compromised service account credentials or OAuth token used for BigQuery access](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-13)
*   [Cost-based denial of service using expensive queries](https://docs.cloud.google.com/docs/security/threat-model/bigquery-threat-model#threat-14)
## Threat details
The following sections provide information about each threat, their manifestations, and their recommended mitigations.
### Data destruction using schema tampering
An attacker with permissions to modify a table's schema can cause potential data loss or render the table unusable for downstream applications. This form of tampering targets the metadata and structure of the data, which can be as destructive as modifying the data itself.
| STRIDE category | Tampering |
| --- |
| MITRE ATT&CK tactic | Impact |
| Manifestations | **Malicious schema update:** A principal with the `bigquery.tables.update` permission can call the `tables.patch` API method on a BigQuery table to alter its schema. Changing column data types can corrupt data or cause loss of information, potentially breaking queries from client applications or business intelligence tools, resulting in a loss of trust in downstream reporting. |
| Mitigations | Strictly limit the `bigquery.tables.update` permission, which is part of roles like `roles/bigquery.dataOwner`. Only grant this permission to a small number of administrators or automated CI/CD service accounts that are responsible for managed schema migrations. Enable BigQuery table backups or use table snapshots to recover from accidental or malicious schema changes. Monitor Cloud Audit Logs for `tables.patch` API calls and alert on any changes made outside of a planned maintenance window. |
### Privilege escalation using IAM allow policy tampering
An attacker who compromises a principal with permissions to modify BigQuery IAM allow policies can escalate their privileges to gain full control over data resources. This threat lets the attacker grant access to read, modify, or delete sensitive data, bypassing existing access controls.
| STRIDE category | Elevation of Privilege |
| --- |
| MITRE ATT&CK tactic | Privilege Escalation |
| Manifestations | * **Dataset policy modification:** A principal with the `bigquery.datasets.update` permission can call the `datasets.patch` API method on a BigQuery dataset to add their own identity to an owner role, granting them full control over all resources within that dataset. * **Service account impersonation:** An identity with the `iam.serviceAccounts.actAs` permission on a service account can attach the service account to other resources such as a Compute Engine instance to run code with the identity of the attached service account. Alternatively, an identity with the `iam.serviceAccounts.getAccessToken` permission can generate access tokens for that service account. If the target service account has elevated permissions on BigQuery resources, the attacker effectively inherits those privileges. |
| Mitigations | Strictly limit permissions that allow IAM allow policy modification (for example, `bigquery.datasets.update`, which is part of roles like `roles/bigquery.dataOwner`). Only assign these roles to a minimum number of trusted administrators. Similarly, tightly control the IAM roles with permission to act as or impersonate service accounts and scope these roles to specific principals that require it. Monitor Cloud Audit Logs for `SetIamPolicy` and `datasets.patch` API calls to detect unauthorized policy changes. |
### Confused-deputy abuse using Big Query-triggered downstream services
An attacker with limited BigQuery permissions creates a job or query that triggers a downstream service (for example, Cloud Function, Dataflow job, or Cloud Composer DAG), which runs with higher privileges. The downstream service, while thinking it's performing a legitimate action on behalf of BigQuery, is tricked into performing an action on a different resource or with different data than intended by the system designers.
| STRIDE category | Elevation of Privilege |
| --- |
| MITRE ATT&CK tactic | Privilege Escalation |
| Manifestations | * **Malicious function trigger:** A BigQuery change triggers a Cloud Function that has broad permissions, and the attacker manipulates the BigQuery data to control the function's actions. * **Dataflow pipeline exploitation:** A BigQuery query result is used as input to a Dataflow job, and the attacker writes the query results to cause the Dataflow job to ingest poisoned data. |
| Mitigations | Apply the principle of least privilege to service accounts used by downstream services triggered by BigQuery. Ensure that these services validate and sanitize any inputs or parameters received from BigQuery jobs. Use VPC Service Controls to restrict the network pathways and service interactions. Design downstream services to not inherently trust inputs from BigQuery without verification. |
### Data exfiltration using unrestricted network egress
If network-level security controls aren't in place, a compromised internal principal can access BigQuery and exfiltrate sensitive data to an arbitrary location on the internet. Even with strong IAM controls, the absence of a network perimeter lets an attacker who has obtained valid credentials bypass location-based defenses and transfer data outside the trusted environment.
| STRIDE category | Information Disclosure |
| --- |
| MITRE ATT&CK tactic | Exfiltration |
| Manifestations | * **API access from untrusted networks:** An attacker uses compromised credentials to connect to the public BigQuery API or BigQuery Storage Read API from an external machine, bypassing network controls configured for on-premises hosts or user devices. * **Export to an external Google Cloud service:** A compromised service account with `bigquery.jobs.create` and Cloud Storage permissions executes a query that exports results to a public Cloud Storage bucket outside the organization's control. |
| Mitigations | Implement network egress controls to mitigate data exfiltration to arbitrary external services. Implement a VPC Service Controls perimeter around the project that contains the BigQuery resources. This perimeter helps to restrict data exfiltration to Google Cloud services outside of the perimeter. Configure access levels for the perimeter to only allow API requests originating from trusted IP ranges or specific VPC networks, effectively preventing data from being accessed or moved outside the defined security boundary. |
### Data integrity drift using poisoned reference or lookup tables
An attacker with write access to reference or lookup tables (for example, dimension tables) subtly modifies their content. Queries joining with these poisoned tables produce incorrect, misleading results, compromising the integrity of analytics and business decisions downstream, potentially without any obvious errors.
| STRIDE category | Tampering |
| --- |
| MITRE ATT&CK tactic | Impact |
| Manifestations | * **Dimension table manipulation:** Changing key values or attributes in a product dimension table. * **Lookup corruption:** Altering mapping data in a lookup table. |
| Mitigations | Strictly limit write access (`bigquery.tables.updateData`) to reference or lookup tables to only trusted data ingestion processes. Implement data quality checks and validation pipelines. Use table snapshots or versioning to track changes and enable rollbacks. Monitor audit logs for changes to these critical tables. |
### Data tampering using malicious load jobs
An attacker with sufficient permissions can intentionally corrupt or overwrite critical data in a BigQuery table by executing a malicious load job. This threat compromises the integrity of the data, which can lead to incorrect business analytics, application failures, and loss of customer trust.
| STRIDE category | Tampering |
| --- |
| MITRE ATT&CK tactic | Impact |
| Manifestations | * **Table overwrite:** A principal with `bigquery.jobs.create` and `bigquery.tables.updateData` initiates a load job with the write disposition set to `WRITE_TRUNCATE`, erasing all existing data and replacing it with malicious data from an external source. * **Malicious data appending:** An attacker uses a load job with `WRITE_APPEND` to inject garbage or malicious data into an existing table, corrupting analytics without deleting original records. |
| Mitigations | Apply the principle of least privilege. Tightly control permissions like `bigquery.jobs.create` and `bigquery.tables.updateData` (found in roles like `roles/bigquery.dataEditor`). Grant these permissions only to trusted principals and scope them to specific datasets or tables. Monitor Cloud Audit Logs for load job completions, particularly those with a `WRITE_TRUNCATE` disposition, and create alerts for jobs that originate from unexpected users or load data from untrusted sources. |
### Excessive IAM permissions leading to information disclosure
Overly permissive IAM roles might allow excessive access to sensitive data stored in BigQuery tables. An attacker who compromises a principal with broad data access permissions can exfiltrate large volumes of data, leading to a significant data breach. This threat is realized when permissions such as `bigquery.tables.getData` or `bigquery.jobs.create` are granted at a wide scope (for example, at the project level) instead of being restricted to specific datasets or tables required for a business function.
| STRIDE category | Information Disclosure |
| --- |
| MITRE ATT&CK tactic | Exfiltration |
| Manifestations | * **Direct data read:** A principal with the `bigquery.tables.getData` permission can directly read data from tables using the `tabledata.list` API method or the high-throughput BigQuery Storage Read API. * **Query-based exfiltration:** A principal with the `bigquery.jobs.create` permission can execute a query job using `jobs.insert` or `jobs.query` to read data from any table that they have access to and then retrieve the results using `jobs.getQueryResults`. * **Public accessibility:** An IAM allow policy on a BigQuery dataset or BigQuery table can be configured to allow public access by granting roles to special principals like `allUsers` or `allAuthenticatedUsers`, exposing data to the internet. |
| Mitigations | Implement the principle of least privilege for all IAM allow policies. Grant permissions at the most granular level required (for example, specific BigQuery tables or datasets) rather than at the project level. Use least privilege IAM roles that contain only the necessary permissions (for example, `bigquery.tables.getData`, `bigquery.jobs.create`) for specific tasks. Regularly audit IAM allow policies for overly permissive roles like `roles/bigquery.dataViewer` or `roles/bigquery.user` applied at a high level in the resource hierarchy. |
### Exfiltration using a transfer to attacker-controlled cloud project or account
An attacker uses BigQuery's data movement capabilities (for example, export jobs to Cloud Storage, cross-project queries, BigQuery Data Transfer Service) to move sensitive data from the secured project to a Google Cloud project or other cloud account under their control.
| STRIDE category | Information Disclosure |
| --- |
| MITRE ATT&CK tactic | Exfiltration |
| Manifestations | * **Export to external bucket:** Using an export job to save table data to a Cloud Storage bucket in an attacker's project. * **Cross-project query destination:** Running a query and setting the destination table to a dataset in an attacker-controlled project. |
| Mitigations | Implement VPC Service Controls to create a perimeter around the project, preventing data egress to projects outside the perimeter. Tightly control permissions like `bigquery.tables.export` and `bigquery.jobs.create`. Use organization policy constraints to restrict project sharing and creation. Monitor Cloud Audit Logs for export jobs or queries with destinations outside the expected project boundaries. |
### Information disclosure using misconfigured authorized views or row-level security logic
Flaws in the SQL logic of authorized views or row-level security policies result in broader data access than intended. Users querying the view or table might inadvertently access rows or columns that they shouldn't be able to see, bypassing the intended segregation.
| STRIDE category | Information Disclosure |
| --- |
| MITRE ATT&CK tactic | Collection |
| Manifestations | * **Faulty view logic:** An authorized view's query omits necessary `WHERE` clauses that are present in row-level security policies on the base table. * **Row-level security bypass:** A complex row-level security policy contains a logical error that allows broader access than intended. |
| Mitigations | Implement a strict code review process for the SQL logic used in authorized views and row-level security policies. Test security logic thoroughly. Limit permissions (such as, `bigquery.tables.create`, `bigquery.tables.update`, or `bigquery.rowAccessPolicies.create`) to create or update views and row-level security policies. Regularly audit existing views and row-level security configurations. Follow best practices for row-level security. |
### Information disclosure using public or cross-project dataset exposure
Sensitive data is exposed because BigQuery datasets are inadvertently or maliciously made public (for example, using allUsers or allAuthenticatedUsers) or shared too broadly with other Google Cloud projects outside the intended trust boundary. An attacker can directly access or copy the data without authentication or by using any authenticated Google account.
| STRIDE category | Information Disclosure |
| --- |
| MITRE ATT&CK tactic | Exfiltration |
| Manifestations | * **Public dataset:** An IAM allow policy on a dataset grants viewer permissions to `allUsers`. * **Cross-project oversharing:** A dataset is shared with an external organization or a service account in an untrusted project. |
| Mitigations | Implement the principle of least privilege for dataset IAM allow policies. Use organization policies such as `constraints/iam.allowedPolicyMemberDomains` to restrict sharing to specific domains. Regularly audit dataset IAM allow policies using Security Command Center to detect public or overly broad permissions. Use VPC Service Controls to create perimeters around projects containing sensitive data to prevent unauthorized egress. |
### Insider misuse of authorized BigQuery access (legitimate queries used for malicious collection)
A malicious insider with legitimate access to BigQuery uses their authorized permissions to run queries and collect sensitive data for unauthorized purposes (for example, personal gain or espionage). While the access is authorized, the intent and use of the data are malicious.
| STRIDE category | Information Disclosure |
| --- |
| MITRE ATT&CK tactic | Collection |
| Manifestations | * **Data hoarding:** Regularly querying and downloading customer data beyond job requirements. * **Sensitive analysis:** Performing analyses to extract trade secrets or PII for exfiltration. |
| Mitigations | Enable and monitor Data Access audit logs to track data access patterns. Use tools like Sensitive Data Protection to scan query results for sensitive information. Implement User Behavior Analytics (UBA) to detect anomalous query patterns or data access volumes. Enforce clear data handling policies and provide security awareness training. Use row-level security and column-level security to limit data exposure even for authorized users. |
### Persistence using stealth BigQuery IAM bindings on datasets, authorized views, or scheduled queries
An attacker, having gained initial access, establishes long-term presence by creating hard-to-detect access mechanisms within BigQuery. This threat includes adding IAM bindings to datasets, creating authorized views that query sensitive data, or setting up scheduled queries that run under a privileged service account to exfiltrate data or maintain access.
| STRIDE category | Elevation of Privilege |
| --- |
| MITRE ATT&CK tactic | Persistence |
| Manifestations | * **Hidden dataset IAM:** Granting a personal account viewer rights on a specific, less-monitored dataset. * **Authorized view backdoor:** Creating a view authorized to access a restricted table, and granting access to the view. * **Malicious scheduled query:** Configuring a scheduled query to copy data to an external location periodically. |
| Mitigations | Regularly audit all IAM allow policies, including dataset-level permissions using tools like Security Command Center. Tightly control permissions for creating or updating datasets (`bigquery.datasets.update`), routines (`bigquery.routines.create/update`), and data transfers (`bigquery.transfers.update`). |
### Spoofing using compromised service account credentials or OAuth token used for BigQuery access
An attacker obtains service account credentials (for example, exported JSON keys) and uses them to authenticate to BigQuery as the compromised service account, inheriting all its permissions. This threat lets the attacker perform any actions the service account is authorized to do, such as reading data, running jobs, or modifying resources.
| STRIDE category | Spoofing |
| --- |
| MITRE ATT&CK tactic | Initial Access |
| Manifestations | * **Leaked service account key:** A JSON key file is exposed in code repositories, public storage, or instance metadata. * **Compromised application:** An application that uses a service account is compromised, allowing the attacker to extract and use its credentials. * **Stolen OAuth token:** An attacker intercepts or leaks an OAuth token from a client application or browser session. * **Over-scoped token:** An application requests and stores tokens with excessive scopes (for example, full BigQuery access when only read is needed). |
| Mitigations | Avoid exporting service account keys. Instead, use attached service accounts or Workload Identity Federation where possible. If keys are necessary, rotate keys regularly, and grant the service account only the minimum necessary permissions. Monitor Cloud Audit Logs and Security Command Center for anomalous service account activity or key exposure. Use the `constraints/iam.disableServiceAccountKeyCreation` organization policy constraint to disable service account key creation. Securely store and transmit OAuth tokens. Follow OAuth 2.0 best practices. Request only the necessary scopes. Use short-lived tokens and refresh tokens securely. Implement mechanisms to detect and revoke compromised tokens. Monitor for anomalous token usage patterns. Complete standard service account key protection measures. Configure session length for Google Cloud services to enforce short-lived tokens and mitigate the risk of a leaked token. |
### Cost-based denial of service using expensive queries
An authenticated principal executes queries designed to consume excessive BigQuery resources (such as slots and bytes scanned). This threat can lead to massive cost overruns in on-demand projects or slot starvation for other users in reservation-based projects, hindering business operations.
| STRIDE category | Denial of Service |
| --- |
| MITRE ATT&CK tactic | Impact |
| Manifestations | * **Unoptimized queries:** Running queries with cross joins on large tables without filters. * **Repetitive execution:** Scripting frequent execution of costly queries. |
| Mitigations | Use BigQuery custom quotas to set user-level and project-level limits on query usage (for example, bytes scanned per day). Use the `maximumBytesBilled` parameter in query jobs. Employ BigQuery reservations to isolate workloads and guarantee capacity. Configure billing alerts in Cloud Billing and monitor slot utilization in Cloud Monitoring to detect and react to anomalies. |
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2026-05-18 UTC.