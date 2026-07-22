# The Evolution of Cassandra Data Movement at Netflix

## Ch11.253 The Evolution of Cassandra Data Movement at Netflix

> 📊 Level ⭐⭐ | 3.9KB | `entities/the-evolution-of-cassandra-data-movement-at-netflix.md`

# The Evolution of Cassandra Data Movement at Netflix

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/the-evolution-of-cassandra-data-movement-at-netflix.md)

# The Evolution of Cassandra Data Movement at Netflix

By [Guil Pires](<https://www.linkedin.com/in/guilhermesmi/>), [Jennifer Prince](<https://www.linkedin.com/in/jenjprince/>), [Jose Camacho](<https://www.linkedin.com/in/josecamachof/>), [Ken Kurzweil](<https://www.linkedin.com/in/kenkurzweil/>), [Phanindra Chunduru](<https://www.linkedin.com/in/phanindra-chunduru/>)

### Background

In a previous post, we introduced [Data Bridge](<https://netflixtechblog.medium.com/data-bridge-how-netflix-simplifies-data-movement-36d10d91c313>), a unified management plane for batch Data Movement at Netflix. Historically, several bespoke Data Movement connectors were developed across different engineering organizations to fulfill their specific requirements. Over the last few years, the Data Movement team has started centralizing these offerings through an abstraction that provides a catalog of connectors, along with simple UI and APIs to initiate Data Movement jobs.

One such case is the Cassandra to Iceberg connector. Apache Cassandra powers mission critical applications at Netflix, including Member, Billing, Recommendations, Subscriptions and many more. These use cases heavily leverage Data Movement to Apache Iceberg for many analytics and operational tasks, and central to this movement was a connector for Cassandra to Iceberg built in-house named Casspactor. As many Cassandra based Data Abstractions emerged, such as [Key Value](<https://netflixtechblog.com/introducing-netflixs-key-value-data-abstraction-layer-1ea8a0a11b30>), [Time Series](<https://netflixtechblog.com/introducing-netflix-timeseries-data-abstraction-layer-31552f6326f8>) and [Graph](<https://netflixtechblog.medium.com/high-throughput-graph-abstraction-at-netflix-part-i-e88063e6f6d5>) — the need for larger and more complex Data Movement with transformations became more critical to the business.

Data movements are fundamentally fulfilled by leveraging the existing Cassandra backup infrastructure. Regularly scheduled backups are performed directly on the Apache Cassandra nodes, via a sidecar process managing the upload of all necessary SSTables and associated Metadata files directly into Amazon S3. When a Data Movement job is initiated, the job constructs the specific backup structure it needs by referencing the S3 based metadata, allowing it to precisely locate the SSTable files. The engine then downloads these files, performs the required mutation compaction and processing, and finally writes the fully transformed, compacted data directly into the target Apache Iceberg tables.

Image 1: Cassandra Cluster Backups to S3

### Casspactor: The Engine We Outgrew

Casspactor processed roughly 1,200 data movements per day, transferring approximately 3 PB of data from Apache Cassandra into Apache Iceberg tables. It served some of the most critical workloads at Netflix. For years, it worked. Then, two compounding challenges made it clear we needed a fundamentally different architecture.

### Fragile Met

---

