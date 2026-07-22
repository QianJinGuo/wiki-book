---
source_url: "https://www.infoq.com/presentations/write-ahead-intent-log/""
ingested: 2026-06-26
sha256: 3d8d721c1ef7730f
---

# Write-Ahead Intent Log: a Foundation for Efficient CDC at Scale


Published Time: 2026-06-18T13:13:00+0000

Markdown Content:
[InfoQ Homepage](https://www.infoq.com/ "InfoQ Homepage")[Presentations](https://www.infoq.com/presentations "Presentations")Write-Ahead Intent Log: a Foundation for Efficient CDC at Scale

View Presentation

Speed:

Download

51:26

![Image 1](https://imgopt.infoq.com/fit-in/1288x0/filters:quality(80)/presentations/write-ahead-intent-log/en/slides/Doi-1781788191276.jpg)

## Summary

Vinay Chella and Akshat Goel discuss the challenges of running traditional CDC across heterogeneous databases during peak order traffic. They explain how Debezium hit limits under high load and share how they built Write-Ahead Intent Log (WAIL) - a custom architecture that utilizes a dumb producer proxy and a smart consumer pattern to cleanly separate the intent from the state payload.

## Bio

Vinay Chella is an Engineering Leader at DoorDash, where he leads the Storage and Streaming Infrastructure organization that powers mission-critical systems across the marketplace. Akshat Goel is a Staff Software Engineer at DoorDash, where he builds the Storage Access Platform, a unified abstraction layer powering all online data stores.

## About the conference

Software is changing the world. QCon San Francisco empowers software development by facilitating the spread of knowledge and innovation in the developer community. A practitioner-driven conference, QCon is designed for technical team leads, architects, engineering directors, and project managers who influence innovation in their teams.

### INFOQ EVENTS

*   ![Image 2](https://imgopt.infoq.com/fit-in/3000x4000/filters:quality(85)/filters:no_upscale()/sponsorship/eventsnotice/7dd71c7c-4b0e-4760-b97d-232ac1816637/resources/1NeuBirdWebinarJune25-Transcripts-1777458459989.png)June 25th, 2026, 1 PM EDT
#### [Architecting for Autonomous Reliability: Embedding AI into Your Observability Stack](https://www.infoq.com/url/t/1799cc66-1076-4f38-ba1e-fe340c13a7b2/?label=NeuBirdAI-Transcripts)

[Presented by: Justin Griffin - Head of Product at NeuBird AI](https://www.infoq.com/url/t/1799cc66-1076-4f38-ba1e-fe340c13a7b2/?label=NeuBirdAI-Transcripts)

*   ![Image 3](https://imgopt.infoq.com/fit-in/3000x4000/filters:quality(85)/filters:no_upscale()/sponsorship/eventsnotice/0b46c1f1-7263-457d-82d9-12be6fa07fbd/resources/1DatadogWebinarJuly9-Transcripts-1779204853394.png)July 9th, 2026, 12 PM EDT
#### [Rethinking Logs in the Age of AI Analysis](https://www.infoq.com/url/t/71ed3a08-6275-4ce8-adb0-1ceaa4e4161a/?label=Datadog-Transcripts)

[Presented by: Nicolas Jung - Product Manager, Logs at Datadog](https://www.infoq.com/url/t/71ed3a08-6275-4ce8-adb0-1ceaa4e4161a/?label=Datadog-Transcripts)

*   ![Image 4](https://imgopt.infoq.com/fit-in/3000x4000/filters:quality(85)/filters:no_upscale()/sponsorship/eventsnotice/40ad0355-4140-4596-93d1-1bedb9755716/resources/1HarnessWebinarJuly16-transcripts-1780678508667.png)July 16th, 2026, 1 PM EDT
#### [Engineering for the Agentic Era: How to Spec, Build, Test, and Operate AI-Powered Systems](https://www.infoq.com/url/t/029f7071-971e-4504-a297-85f98c876f84/?label=Harness-Transcripts)

[Presented by: Juveria Kanodia - Senior Director of Engineering at Harness](https://www.infoq.com/url/t/029f7071-971e-4504-a297-85f98c876f84/?label=Harness-Transcripts)

## Transcript

**Vinay Chella:** We spend our days at DoorDash making sure when someone places an order, we prepare the food, take it up in a car, deliver it. No, we don't do that. We ensure when someone places an order, the sequence of events that has to happen across varied systems go through smoothly. That includes a part where we panic slightly. We panic slightly when database hiccups happen exactly during the peak hours, when there's a rush hour and a lot of orders coming in. Today, we are going to talk about something that sounds deeply technical, but yet, that's actually the center of what we do at DoorDash. All the way from ensuring you get your delivery ETA on your screens, to a ping on the merchant tablet preparing your food.

That topic is change data capture, and how we eventually got tired of traditional way of leaning on these traditional CDCs and started building our own approach, which we call Write-Ahead Intent Log. Before we dive into the details, I really want to start with a small story, show why this problem actually matters.

I'm Vinay Chella. I lead storage and streaming infrastructure at DoorDash. I help build distributed databases and also distributed teams.

**Akshat Goel:** I'm Akshat. I'm a Staff Software Engineer at DoorDash. I help Vinay in building the distributed data applications.

**Vinay Chella:** Together we spend a lot of time building distributed database abstractions so that our business teams can focus on solving the business problems rather than dealing with all the databases and streaming shenanigans.

## The Order Flow at DoorDash

Imagine it's peak dinner time, orders are pouring in, restaurants are slammed with orders, and drivers are zipping through the streets, and customers are both hungry and impatient to get their orders delivered. On the screen you see a real perfect world, ideal world, where one tap on the screen, on the app, flows through the system beautifully. The order lands in the order database, and restaurants get notified, and your driver gets dispatched, and the app updates instantly. In the real world, these steps are tightly connected and highly choreographed. Even if one signal fails, there is a possibility of the sequence of steps falling out of sync, and teams often try to glue things together with things like dual writes. You write to the database, and also send an event to the streaming system. It sounds simple, but it's pretty brittle.

One could succeed, and the other could fail, and suddenly your systems have different truths. The real problem here is not the UI, or not the chef in a restaurant. It's making sure that the intent of you need to get your grocery delivered, or your food delivered, flows through all of our complex systems in a way that it needs to, and all of our logistics system gets notified. Really want to pause and provide some analogy here. I'm sure all of you have tried to fold a fitted sheet at your home. It's pretty hard. You try hard, you try for a lot of time, and you end up shuffling it in a closet, and say that's what's expected. Trying to choreograph these systems, trying to dual write these systems is exactly like folding a fitted sheet.

Let's see what happens when one intent fails in this complex system. The order is in the order database, but the restaurant never got notified, and the delivery was never dispatched. The customer is stuck at their order screen, staring at that processing spinner while getting hungrier by the minute. One missing update could end up turning into refunds, escalations, and unhappy customers. Oftentimes, you lean on to solutions like, you poll the database, but that isn't a real solution either. It adds load on your database, it lags, and you still end up reacting pretty late in the game. That's exactly why systems like CDC are in place, and CDC matters. CDC gives us a real time stream of changes, so every downstream system can stay aligned and do the work that they need to. CDC, change data capture is not a magic, it's not a silver bullet.

It has a lot of tricky edges. You have connectors that could break. You have sinks that could go down. You have different databases speaking different dialects. This world is real, and we need to ensure that data is also real. What it means for DoorDash is that every order update has to be real-time and move reliably throughout our chain of microservices. The rest of the talk today will focus on how we moved from this brittle architecture to more durable, more visible, recoverable, and much less painful system, and we are calling that intent log. Again, if you remember from these two slides, one thing that you can walk away with is that it's not about the state, it's about the intent, like what is that you're trying to do. Ensuring that intent flows through sequence of your system is the key, and everything else is plumbing.

## Content

On a high level, we'll cover why CDC matters to us, our business, and what are the typical challenges in the CDC, and talk about what is the foundation that we are building on, and also some of the operational learnings that we are taking as we are rolling it out across our system.

## Setting the Stage (CDC at DoorDash)

CDC powers a majority of the things at DoorDash. CDC shows up directly in our business problems. A huge part of our customer and merchant experience depends on having the real-time data, real-time state. When an order is placed, or updated, or canceled, or delivered, dozens of systems need to be notified, and react pretty much instantly. For business analytics, teams rely on fresh data to understand the marketplace health, to understand the delivery time, to understand the quality. If the data is stale, then we are not moving the business needle in the right way, and not having the impact that we would like to. For user experience, think about, a restaurant is running out of an item, and they updated item availability.

A grocery store running out of a certain product, and updated it, but on the user side, if you don't see that update, you end up placing the order, and it leads to item unavailability. Your delivery is getting delayed, and your customer is seeing something that is not on the store, and that's basically business chaos. CDC isn't nice to have for us, and CDC is basically foundational for what we do. Our marketplace works reliably when data flows through these systems much more instantly, in a much more reliable way. Engineering problems behind the CDC is also quite challenging, and quite complex. You might have systems like searching and caching, those could be customized in-house solutions, which are different from your source-of-truth database.

The data in CDC basically keeps your source-of-truth database with your derived datastores, like search and caching systems, in sync, that enables us to serve our business functionality on our application. Then I also call something called outbox pattern, where oftentimes your developers might end up building this outbox pattern, where you have transactional table, and also outbox table, which basically informs your downstream consumers about all the changes that are happening. CDC would make it much more easy, if there is one. Also, multi-data or materialized views, or keeping the heterogeneous datastores in sync would be another technical need as well. As you have heterogeneous stores, things like indexing for searching and caching system to serve really fast data. Your transactional data or source-of-truth database, could all be different systems. The best way to keep them in sync is through systems like CDC.

This is how the traditional CDC would look like. You have an application writing to a database, and database, through some connectors, ends up in your systems like Kafka event streaming systems, and then your applications consume from that. It's a pretty proven pattern, but the moment something goes wrong, like schema change breaking your connector, or the downstream sync slowing down, the whole pipeline gets tangled. Traditional CDC ends up coupling us tightly to the database internals and how these systems work. That becomes pretty hard to operate when you are trying to scale your systems.

## Challenges with CDC

Now that we have seen how traditional CDC works in theory, let's talk about what are the real-world problems that show up when you try to run this kind of system at scale. The first one that comes to my mind is abstraction challenge. Every database speaks a different CDC dialect, and I'm sure you are in an environment where you have various databases that you are running. Postgres has logical replication, Cassandra-like sys
