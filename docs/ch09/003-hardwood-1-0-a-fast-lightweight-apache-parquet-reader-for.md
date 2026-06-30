# Hardwood 1.0: A Fast, Lightweight Apache Parquet Reader for the JVM

## Ch09.003 Hardwood 1.0: A Fast, Lightweight Apache Parquet Reader for the JVM

> 📊 Level ⭐ | 3.9KB | `entities/hardwood-1-0-a-fast-lightweight-apache-parquet-reader-for-th.md`

# Hardwood 1.0: A Fast, Lightweight Apache Parquet Reader for the JVM

> Source: [Hardwood 1.0: A Fast, Lightweight Apache Parquet Reader for the JVM](https://www.morling.dev/blog/hardwood-1-0-fast-lightweight-apache-parquet-reader-for-the-jvm) | Score: v*c=72

## Overview

Published Time: 2026-06-25T07:30:00+02:00

Markdown Content:
Hardwood is a new Parquet library for the JVM, written from scratch to do one thing well: read (and soon, write) Apache Parquet files fast, with no mandatory dependencies. It is performance-focused and multi-threaded at its core, fanning page decoding out across all your CPU cores by default.

Today, **Hardwood reaches 1.0**. After five preview releases since the start of the year ([Alpha1](https://www.morling.dev/blog/hardwood-new-parser-for-apache-parquet/), [Beta1](https://www.morling.dev/blog/hardwood-reaches-beta-s3-predicate-push-down-cli/), [Beta2](https://www.morling.dev/blog/variant-support-interactive-parquet-file-tui-hardwood-1-0-0-beta2-is-out/), [CR1](https://www.morling.dev/blog/improved-column-reader-api-geospatial-support-hardwood-1-0-0-cr1-available/), [CR2](https://hardwood.dev/1.0.0.Final/release-notes/#100cr2-2026-06-7)), we now consider Hardwood ready for production, and its public API will evolve with a strong focus on backwards compatibility going forward. Hardwood targets Java 21 or newer, is open-source (Apache License 2.0), and is available from [Maven Central](https://central.sonatype.com/artifact/dev.hardwood/hardwood-core).

## Why Hardwood[](http://www.morling.dev/blog/hardwood-1-0-fast-lightweight-apache-parquet-reader-for-the-jvm#_why_hardwood)

Working with the [Apache Parquet](https://parquet.apache.org/) columnar file format on the JVM has traditionally come with a fairly heavyweight stack: a large number of dependencies on the classpath and a single-threaded reader at the core. Hardwood explores a different set of tradeoffs. The full rationale is in the [original project announcement](https://www.morling.dev/blog/hardwood-new-parser-for-apache-parquet/); in a nutshell, the goals are:

*   **Implement a Parquet library without any mandatory dependencies:**1 Parquet files which are either uncompressed or gzip-compressed don’t require any 3rd party libraries at all; for parsing files compressed with Snappy/Zstd/LZ4/Brotli you only need to provide the (typically single-JAR) codec of your choosing

*   **Utilize modern multi-core CPUs as much as possible:** unlike [parquet-java](https://github.com/apache/parquet-java), which is single-threaded at its core, Hardwood fans out the decoding of the individual pages of a Parquet file to multiple threads, resulting in significantly reduced wall clock parsing times

*   **Be compatible:** every file which can be parsed by parquet-java should also be parseable with Hardwood; if that’s not the case for a given file, we consider this a bug which needs fixing

## What’s in Hardwood 1.0[](http://www.morling.dev/blog/hardwood-1-0-fast-lightweight-apache-parquet-reader-for-the-jvm#_whats_in_hardwood_1_0)

The 1.0 release implements all the key capabilities you’d expect from a Parquet reader: coverage of all the physical and logical Parquet column types, including VARIANT and a first cut of handling geo-spatial columns, 

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/hardwood-1-0-a-fast-lightweight-apache-parquet-reader-for-th.md)

---

