---
source: rss
source_url: https://www.databricks.com/blog/announcing-databricks-storage-ecosystem-governing-enterprise-data-estate-wherever-it-lives
feed_name: Databricks Blog
title: "Announcing the Databricks storage ecosystem: Governing the enterprise data estate, wherever it lives"
sha256: 15841374ed5d7633629111da27aa93525d2a5877bbcfe4415c54942486633b2e
created: 2026-06-15
updated: 2026-06-15
review_value: 7
review_confidence: 7
review_recommendation: worth-reading
ingested: 2026-06-15
review_stars: 3
tags: [databricks, data-governance, storage, opensharing, unity-catalog, hybrid-cloud, enterprise-data]
---

# Announcing the Databricks storage ecosystem: Governing the enterprise data estate, wherever it lives

Published Time: 2026-06-10T12:03:00+0000

[Source URL](https://www.databricks.com/blog/announcing-databricks-storage-ecosystem-governing-enterprise-data-estate-wherever-it-lives)

## The Data That Can't Move

For years, the enterprise data strategy was simple: move everything to the cloud. Migrate the data lakes and the warehouses to the cloud, and then governance follows. It was a clean story — until it wasn't.

Today, some of the world's most sophisticated enterprises are telling us clearly: **they cannot — and will not — move all of their data to the cloud.** Leading semiconductor manufacturers are training models on engineering-classified datasets that must never leave their premises. Global trading firms sit on massive volumes of historical tick data where the economics of cloud egress make migration impossible. Tier-1 banks have adopted "Hybrid Forever" strategies, modernizing on-premises storage while maintaining strict data sovereignty. Major pharmaceutical companies run millions of daily drug experiments against petabyte-scale on-premises data estates subject to stringent regulatory controls.

These aren't edge cases. They represent a structural shift in how enterprises think about data: from **"Migrate Everything"** to **"Govern Everything."**

The drivers are real and compounding:

* **Data sovereignty & regulation**: Financial services, healthcare, and government organizations operate under mandates — GDPR, HIPAA, NIS2, sector-specific data residency rules — that require data to remain within specific jurisdictions or air-gapped environments. Cloud migration is not optional; it is legally prohibited for certain datasets.
* **Data gravity & costs**: At petabyte and exabyte scale, the economics of cloud migration break down entirely. Egress fees, storage costs, and sheer data volume make the "move it once" model financially unsustainable. Some of the world's largest retailers are actively *repatriating* analytics workloads from cloud back to on-premises infrastructure for precisely this reason.
* **Latency & edge workloads**: Retail, manufacturing, and telco workloads require low-latency access to on-premises and edge data. Telecommunications providers ingest enormous volumes of network telemetry on-premises daily to power AI-driven network operations that cannot tolerate cloud round-trips.
* **AI on dark data**: Vast stores of backup data, unstructured archives, and secondary datasets — representing hundreds of exabytes across the enterprise — contain immense AI value that has never been unlocked because governance didn't reach it.

The signal is unmistakable. We have received requests from hundreds of customers explicitly requesting on-premises and hybrid storage connectivity to Unity Catalog. The Software-Defined Storage (SDS) market stands at hundreds of billions of dollars in 2026, and the enterprise partners who manage this estate — collectively holding more than 2 Zettabytes of data under management — are building with us.

## Introducing the Databricks Storage Ecosystem

Today, we are excited to announce the Databricks Software-Defined Storage (SDS) Ecosystem — a new partner category purpose-built to bring Databricks Intelligence Platform to enterprise data wherever it lives: on-premises, in private clouds, and at the edge environments. If you are an enterprise running petabytes of data on these platforms today, you no longer have to choose between your existing non-cloud storage infrastructure and Databricks AI.

> For too long, enterprises had to choose between the on-premises storage infrastructure they rely on and the cloud-native AI they want to build. Forcing customers to migrate massive amounts of data using complex pipelines just to unlock that intelligence is a broken model. By uniting these industry-leading partners, we are ending that compromise and delivering Databricks Intelligence directly to where the enterprise data lives. But this launch is just day one. We are building the foundation to ensure that soon, every piece of hybrid data–structured or unstructured–is instantly ready for generative AI without ever copying a byte. — Stephen Orban, SVP, Product Partnerships & Ecosystem, Databricks

At the heart of this ecosystem is OpenSharing, an open-source protocol for secure, governed data sharing. Our storage partners are implementing OpenSharing servers to expose their data estates directly to Databricks Serverless Compute. The path is simple: the storage partner stands up a OpenSharing endpoint, you connect it to Unity Catalog, and you instantly gain secure, governed access to your on-premise data in Databricks without data migration.

This integration provides a single, unified catalog across your entire hybrid environment. Customers can now use Databricks Serverless Compute, Genie, AgentBricks, and model training to query and reason over data that never leaves the premises. The result? Zero data movement, no duplication of data and zero compliance risk.

This is not a roadmap aspiration. Customers can try these integrations today. Partners building these integrations follow the Partner Well-Architected Framework — a technical blueprint covering architecture, security, and certification criteria.

> Customers want to break down data silos and unify all of their Data and AI estate - including large amounts of data that still sits on-premises. Thanks to on-premises storage partners leveraging the open source Open Sharing protocol, customers can now seamlessly unify, govern, and analyze all of their data estate in Databricks Unity Catalog - unlocking the full value of their data in the Databricks Data Intelligence Platform. — Jonathan Keller, VP, Product Management, Databricks

## Our Launch Partners

### MinIO — General Availability

MinIO AIStor is the bridge that seamlessly connects the Databricks Data Intelligence Platform with enterprise data that can't move to the cloud. By natively implementing the open Open Sharing protocol at the storage layer, AIStor eliminates complexity and enables Databricks customers to efficiently query live on-premises Apache Iceberg™️ and Delta tables under full Unity Catalog governance. It extends Serverless Compute, Genie, and Agent Bricks to on-premises data, bringing the full power of the Databricks Platform to an enterprise's most critical data.

### Everpure (formerly Pure Storage) — Private Preview

Everpure and Databricks enable organizations to use on-prem data directly in the cloud removing the need for data replication or duplication. This is delivered through an OpenSharing connector that bridges data in object storage with databricks core workspaces in a secure and gated manner.

### Qumulo — Private Preview in July 2026

Qumulo has integrated OpenSharing with its new NeuralSearch, allowing customers to securely share Qumulo-stored data with Databricks across core, cloud, and edge environments—without replication, extra costs, or complexity. Using NeuralSearch, users can discover relevant datasets, including unstructured content, via natural-language queries and seamlessly share those curated tables with Databricks via OpenSharing.

(Partner integrations continued: VAST Data, DDN, NetApp, HPE, Dell Technologies, Hitachi Vantara, IBM, WEKA among the launch cohort — see source for full list.)
