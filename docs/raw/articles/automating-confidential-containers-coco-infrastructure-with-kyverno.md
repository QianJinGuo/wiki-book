---
title: Automating Confidential Containers (CoCo) infrastructure with Kyverno
type: raw
source: newsletter
source_url: https://www.cncf.io/blog/2026/05/19/automating-confidential-containers-coco-infrastructure-with-kyverno/
tags: [cncf, kubernetes]
ingested: 2026-05-20
sha256: dcab0eefba13fe3c
---
Title: Automating Confidential Containers (CoCo) infrastructure with Kyverno
URL Source: https://www.cncf.io/blog/2026/05/19/automating-confidential-containers-coco-infrastructure-with-kyverno/
Published Time: 2026-05-19T11:00:00+00:00
Markdown Content:
Posted on May 19, 2026 by Shuting Zhao, Project Maintainer (Nirmata)
CNCF projects highlighted in this post
[![Image 1: Confidential Containers logo](https://landscape.cncf.io/logos/3b94e1452f9b3887866a31042c2f972a5f6f2c884a6336a3d787a35abcbb0c04.svg)](https://www.cncf.io/projects/confidential-containers "Go to Confidential Containers")[![Image 2: Kyverno logo](https://landscape.cncf.io/logos/cd16e4a1d4b1b2b785530124b090d2fe64cbe2ce0f4d80e1bb968c45bb35af0b.svg)](https://www.cncf.io/projects/kyverno "Go to Kyverno")
Confidential Containers (CoCo) adds a critical security layer for containerized workloads, especially in environments where parts of the platform are not inherently trusted. However, deploying CoCo-enabled workloads often requires application teams to manage infrastructure-heavy details that are easy to get wrong. By leveraging Kyverno as a Policy as Code engine, platform teams can automate much of that CoCo-specific wiring, improving developer experience while preserving the core zero-trust security model..
### Understanding Confidential Containers (CoCo)
Confidential Containers (CoCo) is an open-source initiative dedicated to securing container workloads in untrusted environments.
The fundamental tenet of the CoCo trust model is that the Kubernetes control plane is explicitly untrusted. Consequently, any pod specifications provided by the Kubernetes control plane are considered untrusted and must be verified by the runtime environment before it is used. This verification process is typically handled through remote attestation.
### What a CoCo-Enabled workload typically needs
A pod intended to run within a CoCo environment requires the following in its specification:
*   **`runtimeClass` (typically required):** Specifies the required confidential runtime environment.
*   **`initdata` (typically required):** This component provides the bootstrap configuration for the confidential environment. It includes essential details such as remote attestation server details, container image policy, and kata-agent policy. This information is crucial for establishing trust and is verified via remote attestation. Ref: [https://confidentialcontainers.org/docs/features/initdata/](https://confidentialcontainers.org/docs/features/initdata/)
*   **`sealed secrets` (Optional):** Any secrets that are required by the application. Sealed secrets are reference to actual secrets which will be made available to the application post successful remote attestation. Ref: [https://confidentialcontainers.org/docs/features/sealed-secrets/](https://confidentialcontainers.org/docs/features/sealed-secrets/)
*   **`attestation initcar` (Optional):** An optional initial container used to assist with the attestation process.
*   **`mTLS sidecar` (Optional):** An optional sidecar container for secure communication.
### Practical deployment challenges
The technical requirements of CoCo introduce several practical problems for end users:
1.   **Infrastructure concerns are pushed onto application teams:** developers are often required to manage complex infrastructure aspects related to CoCo, which adds friction to the deployment process.
2.   **Pod admission and startup failures:** malformed or incomplete initdata, incorrect annotations, or missing policy fields can break workload creation or execution.
### The Solution: Automating CoCo infrastructure with Kyverno
To solve these problems, a platform needs two capabilities: automatic injection of required CoCo-related configuration and early validation of CoCo-related inputs. The proposed solution is to use Kyverno as a Policy as Code engine.
Kyverno, a Kubernetes native policy engine, can mutate and validate resources at admission time using policies so CoCo infrastructure elements are applied consistently and invalid configurations are rejected early.
### The trust paradox: Kyverno in an untrusted control plane
Kyverno itself runs within the Kubernetes control plane, which the CoCo trust model designates as untrusted. This raises a critical question: how can we trust what Kyverno provides?
The key point is that **Kyverno is used for operational automation, not for establishing trust**. Kyverno is used solely to make deployment easier. The application owner maintains the ultimate responsibility for verifying everything via remote attestation, including:
*   Verification of container images by using signed container images at a min – [https://confidentialcontainers.org/docs/features/signed-images/](https://confidentialcontainers.org/docs/features/signed-images/)
*   Verification of the pod specification via Kata agent policy – ​​[https://github.com/kata-containers/kata-containers/blob/main/docs/how-to/how-to-use-the-kata-agent-policy.md](https://github.com/kata-containers/kata-containers/blob/main/docs/how-to/how-to-use-the-kata-agent-policy.md)
So Kyverno improves deployment ergonomics, while CoCo attestation and runtime policy remain the security decision points.
![Image 3: A colour flow chart of the Kyverno and Confidential Containers (CoCo) integration](https://www.cncf.io/wp-content/uploads/2026/04/image-17.png)
_Fig: High level overview of Kyverno and Confidential Containers Integration_
## Kyverno inaction: An example deployment flow
Implementing this solution involves a clear separation of duties among different teams:
*   **Platform and Infrastructure Team:** Responsible for managing the underlying Kubernetes infrastructure. This team also adds the initdata configuration to the cluster, often allocating specific namespaces for app teams and mapping developers to those namespaces.
*   **Application Security Team:** Responsible for managing credentials and other security aspects of the applications. This team provides the initdata configuration, which includes the remote attestation server details, container image policy, and links to secrets. They also own the actual remote attestation server and the credential/keys management server for the application.
*   **Application Development Team:** Responsible for deploying and managing the application manifest.
For a practical walkthrough, watch the CoCo community demo recording [here](https://zoom.us/rec/play/zC2KFSObF0bLP8YSc_WbaFqWHo56XEBqHIyuDOIOjgEiJXYmOqCdA5FNh6-MBfI0_NZ_kKpVdBhCT1v3.TMUPFCaRSz7VcG15?eagerLoadZvaPages=sidemenu.billing.plan_management&accessLevel=meeting&canPlayFromShare=true&from=share_recording_detail&continueMode=true&oldStyle=true&componentName=rec-play&originRequestUrl=https%3A%2F%2Fzoom.us%2Frec%2Fshare%2Fn6TQ7sdKejxpowMEDQcTuB9MyCQeHp-eQ-XwPUDNtqrSHan3rn7g2PLQtLGZS5Q5.BmKO9ygVqXNn-a0U), the demo segment starts at 18:00. All example CoCo policies are available in the [Kyverno policy library](https://main.kyverno.io/policies/), and can be filtered using the Confidential Computing tag.
### Deployment and attestation process
1.   **Configuration:** The App Security team provides the necessary `initdata` configuration.
2.   **Policy Enforcement:** The App Dev team deploys their application manifest. Based on policies defined by the Platform team using Kyverno, the application is targeted for specific namespaces, and all relevant mutations (such as adding the `initdata`and `runtimeClass`) are automatically added to the pod manifest.
3.   **Runtime Attestation:** Before the pod runs, the pod runtime environment triggers remote attestation to retrieve the image signature keys. The remote attestation process verifies the `initdata`. This ensures any modification to the `initdata` by the Kubernetes control plane is detected by the App Security team.
4.   **Conditional Secret Delivery:** Any required credential or key is delivered only _after_ successful attestation. This ensures that sensitive data, such as container image signature verification keys or application secrets, is protected and only available to a verified confidential environment.
By automating the infrastructure aspects of CoCo using Kyverno, organizations can provide a simpler, more robust path for developers to deploy confidential workloads without compromising the zero-trust security model.
### Conclusion
Confidential Containers strengthens workload security by assuming the control plane is untrusted, but that same model can make day-to-day deployment harder for application teams. Kyverno helps close this operational gap by automatically injecting required CoCo configuration and validating critical inputs before pods are admitted, reducing fragile manual steps and preventing common misconfigurations early.
For platform teams, this creates a practical path to scale confidential workloads: standardize CoCo requirements once, enforce them everywhere, and let application teams focus on shipping code instead of stitching infrastructure details into every manifest. The result is a more reliable onboarding experience, fewer deployment failures, and a stronger zero-trust posture without sacrificing delivery velocity.