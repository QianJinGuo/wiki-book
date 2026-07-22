---
source_url: "https://netflixtechblog.com/how-netflix-simplified-batch-compute-with-kueue-87860682629c?source=rss----2615bd06b42e---4"
ingested: 2026-06-26
sha256: 7e7e58c25a6c5568
---

# How Netflix Simplified Batch Compute with Kueue

By [Alvin Bao](<https://www.linkedin.com/in/alvinbao/>), [Alex Petrov](<https://www.linkedin.com/in/alex-petrov-vt/>), [Jennifer Lai](<https://www.linkedin.com/in/jennifernlai/>), [Aidan Sherr](<https://www.linkedin.com/in/aidan-sherr/>), and [Samartha Chandrashekar](<https://www.linkedin.com/in/samartha/>)

As a part of the journey to transition Netflix’s compute infrastructure to be more Kubernetes-native, we have leaned into incorporating components from the Kubernetes ecosystem into our container platform [Titus](<https://medium.com/netflix-techblog/titus-the-netflix-container-management-platform-is-now-open-source-f868c9fb5436>). One example of this is our use of [Kueue](<https://kueue.sigs.k8s.io/>), a cloud-native job queueing system for batch workloads, which has largely replaced the custom queuing and scheduling logic in our homegrown managed batch solution Compute Managed Batch (CMB). In this post, we’ll give an overview of what motivated the migration, how we migrated millions of batch jobs to use Kueue, and what Kueue allows us to offer as a Compute platform.

### Brief Overview of CMB and Titus

CMB is a managed batch solution that allows users and applications to execute and manage workloads that run to completion. Using a tenant hierarchy, workloads are managed and queued with ordered execution through priorities, and capacity is managed on a per-tenant basis. Workloads that are submitted to CMB are then run on Titus. The features of Titus relevant to CMB are workload federation across multiple cells (Kubernetes clusters) and federated capacity reservations. This means CMB can talk to a single Titus endpoint to get/submit workloads and update capacity reservations without having to worry about the underlying cell/cluster topology.

#### CMB Tenant Hierarchy

Tenants provide a grouping mechanism for jobs submitted on behalf of certain organizations, platforms, or applications. Users can create and organize tenants however best suits their organization or use case. For example, an organization may use a single tenant across several applications or a complex hierarchical structure that matches its team and application ownership structure.

Tenants are associated with a capacity configuration. The capacity configuration defines the amount of compute capacity available to the tenant and provides certain guarantees around isolation from other tenants. The capacity configuration contains weight (used for fair sharing) and resource dimensions.

There are two types of tenants in CMB:

  1. **Internal Tenants** — meant to facilitate the creation of a tree of tenants. Internal tenants’ children can be both internal and leaf tenants. Internal tenants themselves do not accept work and thus do not have associated queues.
  2. **Leaf Tenants** — can accept work and have queues associated with them. Leaf tenants cannot have any children.



With regards to capacity configuration, tenants can use 2 types of capacity:

**Reserved Capacity**

For internal tenants, if a user specifies reserved capacity, it is fair-shared across the subtree and usable by the leaf tenants under that internal tenant.

For leaf tenants, if a user specifies reserved capacity, it partitions capacity within the hierarchy so that other tenants cannot reserve the same resources. Those reserved resources are not shared with any other tenant, ensuring throughput for a given leaf tenant.

**Shared Capacity**

The Compute team maintains a global pool of shared capacity that any tenant can burst into, in addition to its reserved capacity. Reservations are not required to use CMB, so a tenant can run out of shared capacity entirely. The pool is fair-shared across tenants, but in CMB, this applied only at admission: CMB had no preemption, so once a job was admitted, it ran to completion regardless of shifts in fair-share demand.

Kueue changes the semantics for **both** types of capacity, which the fair sharing and preemption section covers.

Here is an example of what a tenant hierarchy looks like:

#### CMB User/Application Workload Submission Flow

#### CMB User/Application Tenant Management Flow

### Why Kueue?

CMB was created in 2018, before or alongside many of the open-source batch compute offerings available today. Over the years, as the Kubernetes ecosystem has evolved, many of the features that CMB offered or strived to offer have been included in these open source projects e.g., fair sharing, hierarchical tenants, capacity management, priority queuing. In addition, it became increasingly cumbersome to develop new features such as preemption when CMB was so far removed from the underlying Kubernetes cluster.

The team took a look at what it would take to modernize our batch abstraction and settled on Kueue for the following reasons:

  1. Unlike other options such as YuniKorn or Volcano, Kueue does not replace pod scheduling by the kube-scheduler, allowing integration with existing Titus scheduling profiles. Replacing Titus scheduler profiles can fragment job placement, potentially harming efficiency.
  2. Adoption momentum and pace of innovation.
  3. Kueue supports multi-tenant quota management over heterogeneous hardware.
  4. Kueue can operate on primitives such as _v1.Pod_ and _batch/v1.Job_ , and also supports higher-level abstractions such as RayJob / RayCluster for future extensibility.
  5. Kueue has native features that the team would have liked to implement in CMB, such as preemption, all-or-nothing scheduling, topology aware scheduling.



### Migrating to Kueue

This initiative of migrating CMB workloads to Kueue became known as Netflix Batch. The key tenets of our migration were the following:

  1. Migration should require zero lift for CMB end users and be completely transparent to them
  2. No regressions in container launch rate and overall max throughput
  3. Replace CMB queuing and scheduling with Kueue



#### Netflix Batch User/Application Workload Submission Flow

The key difference between the old and new flows is that we defer queuing and scheduling to Kueue, which is enabled in each Kueue-enabled Titus cell. Titus federation routes the job to Kueue cells using our custom Kueue router.

#### Netflix Batch User/Application Tenant Management Flow

For us as operators, the migration was as simple as clicking a button on a tenant in our UI (as shown in the example above). This also allows us to easily rollback changes if there were issues.

Under the hood, this enrollment converts internal tenants to [Cohorts](<https://kueue.sigs.k8s.io/docs/concepts/cohort/>) and leaf tenants to a [ClusterQueue ](<https://kueue.sigs.k8s.io/docs/concepts/cluster_queue/>)\+ [LocalQueue](<https://kueue.sigs.k8s.io/docs/concepts/local_queue/>). The capacity configuration on a given tenant is converted into resource flavors and nominal quotas. The architecture for this looks as follows:

#### Lessons Learned

  1. [Maintaining API parity](<https://kyle.cascade.family/posts/how-to-actually-migrate-complex-systems-in-infrastructure/>) with the existing system (vs exposing a new API surface) and migrating the underlying components as a first step derisked the project by unstacking bets while also ensuring we didn’t disrupt the customer experience.
  2. Don’t wait until the end to migrate the most complex use case. We decided early on to migrate our largest and most complex customer first. This allowed us to build confidence that we could later migrate other customers to Netflix Batch without issues, and resulted in the production migration lasting only 4 weeks.
  3. We had to run Kueue with much higher QPS, Burst, and groupKindConcurrency than the default configuration to meet our throughput needs. This was derisked early on by running load tests in a development environment that mimics Titus.



### Current State of Kueue at Netflix

Kueue is fully rolled out in production, with it managing millions of batch workloads. In the future, we’re looking at options to enroll more of Titus batch workloads into this more managed experience. We have also productionized more fair sharing and preemptions to address better utilization of reserved capacity. In addition, our learnings are being leveraged by other internal teams, including those building Kubernetes-native training infrastructure, to inform their job scheduling and queuing configurations.

#### Fair Sharing and Preemption

With Kueue, [Preemption-based Fair Sharing](<https://kueue.sigs.k8s.io/docs/concepts/fair_sharing/#preemption-based-fair-sharing>) allows Netflix Batch to maintain reservation semantics while lending resources to other tenants when those reservations are not in use. In addition, preemption allows Netflix Batch to preempt lower-priority workloads for higher-priority workloads. For our customers, this means that tenants can use more idle capacity from reservations, submit more jobs without the risk of starvation, and have quicker turnaround times for business-critical workloads.

An example preemption configuration on a ClusterQueue that we would be using is as follows:
    
    
    apiVersion: kueue.x-k8s.io/v1beta2  
    kind: ClusterQueue  
    metadata:  
      name: "team-a-cq"  
    spec:  
      preemption:  
        reclaimWithinCohort: Any  
        withinClusterQueue: LowerPriority

With these features deployed, Compute has seen a significant increase in average resource utilization.

### Acknowledgement

This work would not have been possible without the great work of the entire Compute team at Netflix.

* * *

[How Netflix Simplified Batch Compute with Kueue](<https://netflixtechblog.com/how-netflix-simplified-batch-compute-with-kueue-87860682629c>) was originally published in [Netflix TechBlog](<https://netflixtechblog.com>) on Medium, where people are continuing the conversation by highlighting and responding to this story.
