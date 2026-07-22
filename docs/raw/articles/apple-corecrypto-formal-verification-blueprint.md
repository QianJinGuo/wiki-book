---
title: "A blueprint for formal verification of Apple corecrypto - Apple Security Research"
source_url: "https://security.apple.com/blog/formal-verification-corecrypto/"
source: "Apple Security Research"
author: "Apple SEAR + Hardware Technologies Formal Verification"
publish_date: "2026-06-08"
ingested: "2026-06-08"
sha256: "13f530b0a7e96400762906cb2f06d7b14848ef9117c3c5c95692754bdd42e681"
type: article
tags: [security, cryptography, formal-verification, post-quantum, apple, ml-kem, ml-dsa, side-channel]
review_value: 8
review_confidence: 8
review_recommendation: strong
review_stars: 4
---


Published Time: Fri, 22 May 2026 17:55:34 GMT

Markdown Content:
Written by Apple Security Engineering and Architecture (SEAR) and Hardware Technologies Formal Verification

The introduction of [quantum-secure cryptography in iMessage](https://security.apple.com/blog/imessage-pq3/) marked the start of a significant security transition to protect Apple users from threats posed by future quantum computers. Deploying this new generation of algorithms at scale across all Apple platforms requires high assurance, so we developed rigorous new formal verification methods to prove the mathematical correctness of our implementation. With this week’s release of corecrypto, we’re publishing our implementations of quantum-secure ML-KEM and ML-DSA algorithms — along with the mathematical proofs we built to assure they are faithful to the FIPS 203 and FIPS 204 specifications — for independent evaluation by experts. And to further advance the state of the art for assuring critical software, we're also publishing the formal verification libraries and tools that we created to achieve the strongest known correctness results for any widely-deployed production implementation of the relevant algorithms.

* * *

![Image 1: Formal-Verification-Process.jpg](https://security.apple.com/assets/image/generated/medium_Formal-Verification-Process.jpg) In 2024, we added post-quantum encryption to corecrypto, the foundational cryptographic library in Apple operating systems. To address the well-documented threat from future quantum computers, we’ve been working to first develop and deploy strong, quantum-secure cryptography in areas where it’s likely to have the greatest benefit: applications involving encrypted communications and other sensitive information, including [iMessage, VPN, and TLS networking](https://support.apple.com/guide/security/quantum-secure-cryptography-apple-devices-secc7c82e533/1/web). In addition, quantum-secure APIs included with our [Apple CryptoKit](https://developer.apple.com/documentation/cryptokit/enhancing-your-app-s-privacy-and-security-with-quantum-secure-workflows) release last fall enable developers to adopt quantum-secure encryption and authentication in their own apps.
corecrypto is used continuously in our products, providing encryption and decryption, hashing, random number generation, and digital signatures on over 2.5 billion active devices. A critical bug in corecrypto has the potential to compromise the security and reliability of every app and feature that depends on it, so we are conservative when adding new code to the library and make exceptional efforts to be comprehensive in our testing.

We include new cryptographic algorithms in corecrypto only after a thorough assessment against the following criteria:

1.   **Improves security**. The algorithm must solve new problems or improve on the security of existing algorithms.
2.   **Secure design**. The algorithm must have strong theoretical security, and must have withstood rigorous, sustained cryptanalysis from the global research community. And practically, it must be feasible to implement the algorithm in a secure way for our intended use.
3.   **High performance**. Execution must be highly efficient — both in terms of latency and power — as implemented across every Apple device.
4.   **Compact parameters**. Key sizes, signatures, and ciphertexts must minimize their impact on network latency and fit within device memory constraints.

When an algorithm meets our high bar for inclusion in corecrypto, we develop an implementation that must then be:

1.   **Secure**. The code must meet exacting security criteria and must not leak information. This requires both correctness and hardening, such as to prevent leaking timing signals that an adversary could use to extract application secrets.
2.   **Optimized**. The implementation should take maximum advantage of the instructions and architecture of the silicon on which it runs.
3.   **Correct**. The code, including all relevant optimizations, must faithfully implement the algorithm as defined in the standard which was analyzed by the cryptographic community. It must produce the correct output.

When we evaluated quantum-secure algorithms to include in corecrypto, we quickly converged on two that met our criteria — the same two that would later be selected and standardized by NIST as ML-KEM and ML-DSA (FIPS 203 and FIPS 204, respectively). While NIST also standardized other signature schemes, ML-KEM and ML-DSA best matched our requirements. Significant work by the cryptographic community had produced reference implementations for ML-KEM and ML-DSA that, in our own evaluation, showed a strong foundation of security and performance.

Because corecrypto is used across Apple products — including specialized chips with different microarchitectures — we start by writing our algorithm implementations in portable C code. To ensure the implementations run correctly and securely wherever corecrypto is deployed, our guidelines are strict: we write this code to avoid leaking secret values through execution timing, prevent the compiler from inadvertently weakening those protections, and take advantage of hardware features like Data Independent Timing (DIT) and Pointer Authentication (PAC) on Apple processors, which respectively guard against a range of micro-architectural side channels and harden against memory corruption exploits. In addition, we evaluate the need to randomize internal computations based on use-specific threat models.

After reviewing the reference implementations accompanying the ML-KEM and ML-DSA design, we identified significant opportunities for further improvement. We applied mathematical optimizations that increase performance without changing the underlying algorithms, and we carefully rewrote the most performance- and security-sensitive subroutines to take full advantage of our industry-leading processors. Drawing on our deep expertise with Apple silicon, these hand-optimized paths also give us precise control over processor behavior to help prevent the kind of timing side channels that could expose secrets to an attacker.

It’s a significant undertaking to introduce novel implementations of these complex algorithms that incorporate our substantial improvements. Making matters more challenging, the mathematics underlying ML-KEM and ML-DSA is itself relatively recent, so there is much less collective experience in the industry implementing these algorithms securely in shipping products. At every step, we were deeply motivated to avoid issues that the industry previously experienced with early deployments of elliptic curve cryptography, which were hindered by subtle and exploitable bugs.

Our top priority was to ensure that the new algorithm implementations, with our hand-tuned optimizations for performance and security hardening, are functionally correct and secure. To meet this goal, we set an exceptional qualification threshold that includes deep conventional testing, simulation, and independent review, and combines it with rigorous formal verification.

### Our formal verification requirements

Formal verification uses mathematical proofs to demonstrate that a system or object satisfies specific properties that we define. At Apple, we've performed extensive formal verification in silicon development for over 15 years, and in 2019 we began using formal verification to prove classical cryptography, including the hardware Public Key Accelerator (PKA) — the part of Apple silicon that performs elliptic curve public key operations.

For corecrypto, we use mathematical proofs to show that our algorithm implementations are correct to a significantly greater degree of assurance than conventional software testing allows. Put simply: if we can prove that the mathematical formula of our implementation is equivalent to that of its specification, then we know that our implementation will produce the correct output. In theory, this gives us strong assurance that our implementation will work correctly every time. Such a high degree of assurance generally cannot be obtained through conventional testing.

The practical considerations are more complicated. Regardless of how it’s applied, formal verification requires a tremendous investment of time and deep expertise. The implementation and its specification must be represented with carefully chosen mathematical formulas. To draw correct conclusions, the formulas must correctly model the relevant behaviors of both the implementation and the specification, and be structured so as to enable the proof to be written in simple steps. The formulas must also be complete enough to cover all the inputs we require. Since the resulting formulas can be extremely large, it takes specialized engineering skill — including a profound understanding of the underlying mathematics — to write the mathematical proofs, and to master the tools used to verify those proofs step by step. It often takes many iterations to successfully construct a proof strategy for verification.

By analyzing how we might best combine formal verification for ML-KEM and ML-DSA with our existing engineering processes, we developed the key requirements for formal verification of corecrypto.

In practice, our selected algorithms have several functions: key generation, encapsulation, and decapsulation in ML-KEM, and key generation, signature generation, and signature verification for ML-DSA. Each of these functions is implemented by a sequence of specialized subroutines that is traditionally prone to subtle arithmetic bugs, especially for large operands such as polynomials and big numbers. These subroutines usually involve carries or borrows during computation, which the implementation needs to handle correctly but which are too numerous and too deep in the sequence of subroutines to be thoroughly checked with conventional tests.

Formal verification can help demonstrate that each of these subroutines produces the correct output on specified inputs. But verifying each subroutine individually is not sufficient, because optimized subroutines may represent objects in slightly different ways, and bugs can be missed if the output of a subroutine is not shown to be fully compatible with the next one in the sequence, such as when the output value of an intermediate subroutine falls outside of the range of inputs supported by the next subroutine.

These details helped shape our key requirements for formal verification of Apple corecrypto:

*   Our formal verification must be **capable of verifying our entire algorithm implementation**, including our advanced mathematical formulas. It must be able to demonstrate that each subroutine individually produces the correct output, and that the full sequence of subroutines together computes the correct final result.
*   To account for the wide range of products that use corecrypto, our verification must **support algorithm implementations that are written in portable C and in ARM64 assembly**, the instruction language used by Apple silicon.
*   Because we continuously evolve our software to improve our implementation and support new applications, our verification must support **rapid evolution** and minimize the effort required to keep our correctness proof valid, including maintaining compatibility with our existing developer tools.

### A custom approach for corecrypto

To find the right approach, we evaluated a number of verification tools and existing verified implementations. Most did not meet our requirements. Some tools lacked support for ARM64, others verified only parts of a mixed-language implementation — one language at a time — without evaluating the correctness of subroutines or sequences of subroutines that we use, or they’d require us to build and maintain extensive new developer tools everywhere corecrypto is used.

To meet our unique requirements — including support for multiple languages, rapid code evolution, and existing developer tools — we ultimately designed a custom approach to formal verification. We combined tools that we already use with new ones that let us support our complete requirements and pursue top-to-bottom proofs that span from our final implementation all the way back to the FIPS specifications for ML-KEM and ML-DSA.

The high-level formal verification process is depicted in the image at the top of this page. By translating the specifications — ML-KEM and ML-DSA, as standardized by NIST — and our implementations into formal mathematics, we can demonstrate functional correctness by composing incremental proofs about our optimized C and ARM64 implementations.

* * *

_In this post, we primarily refer to the following open-source tools used in formal verification:_

*   _**Isabelle**: A formal language and powerful proof assistant that can verify complex mathematical proofs. We already use Isabelle to verify the hardware PKA._
*   _**Software Analysis Workbench (SAW)**: A tool developed by Galois to formally verify properties of software programs against specifications written in a domain-specific language called Cryptol._
*   _**Cryptol**: A formal language that works with SAW, also developed by Galois._
*   _**cryptol-to-isabelle**: A new tool that Galois created from our specification to translate our Cryptol algorithm models to formulas in Isabelle in order to compare them to the Isabelle specifications for our algorithms._

* * *

First, we manually translate our portable C implementation of each algorithm into the Cryptol language. Then, we use Cryptol’s companion tool SAW to verify that our Cryptol model matches our implementation. We chose Cryptol because SAW is excellent for reasoning about C, but it lacks support for the advanced mathematics in the FIPS specifications, so we need to find common ground for the next steps.

To prove that our Cryptol model is equivalent to the specification, we need an environment that’s expressive and powerful enough to let us prove equivalence between these very different representations. Because Isabelle already meets this bar, we use a dedicated translator — specified by Apple and built by Galois — to generate a model of the implementation in Isabelle, directly from the Cryptol. This also helps eliminate the risk of human error when bridging the two languages. And we meticulously and manually translate the FIPS specification into Isabelle as well.

With the model and specifications now both translated into Isabelle, we can write proofs to show their equivalence for the entire algorithm, including its subroutines. Yet given the large number of distinct and complex subroutines involved, the work involved is considerable, requiring more than 50,000 proof steps. To better scale this approach, we spent a substantial part of our effort building a new suite of Isabelle libraries — reusable theories, mainly lemmas that can be applied to the proofs across subroutines to make them more succinct and faster to write. Once the entire proof can run through Isabelle and be shown to verify successfully, we have proven the equivalence of our C implementation and the algorithm specification.

The last step of our approach is to verify the hand-optimized subroutines that are written in ARM64 assembly. CPU instruction sequences are conceptually far removed from their mathematical specifications, which makes direct equivalence proofs considerably more complex. However, the challenge is much more manageable when comparing assembly instructions against a corresponding C implementation. That's precisely the strategy we employ: with both implementation models translated into Isabelle, we prove each ARM64 subroutine equivalent to the C subroutine that it replaces. And since every C subroutine in the C implementation is already proven and verified to be correct, this gives us strong assurance of correctness for the optimized ARM64 assembly implementation as well, without the time and complexity required to verify each against the formal specification from top to bottom.

* * *

_This simple example illustrates the difference between an implementation written in C and its corresponding specification written in Isabelle. This subroutine, written in C, adds two polynomials by adding their coefficients in a loop, with each coefficient represented over 16-bit integers in the range._

void ccmlkem_poly_add(int16_t coeffs[CCMLKEM_N], const int16_t a[CCMLKEM_N], const int16_t b[CCMLKEM_N])

{

for (unsigned i = 0; i < CCMLKEM_N; i++) {

coeffs[i] = a[i] + b[i];

}

}

_The corresponding specification written in Isabelle is more abstract — for example, it does not specify the number of coefficients, nor the exact size of words. And it uses a built-in map2 operation to process all coefficients at once, rather than a loop._

definition poly_add :: "'a word list ⇒ 'a word list ⇒ 'a :: len word list" where

"poly_add xs ys = map2 (+) xs ys"

* * *

### Our results

Our formal verification detected issues that would not have been caught with conventional testing, letting us address the errors before they ever reached our products. For example, we identified a missing step in an early ML-DSA implementation, which in rare cases could cause inputs to exceed the expected range and produce incorrect output. We also discovered an error in a third-party proof, which we were able to independently repair for the specific parameter values used in our implementation. In the worst case scenario, the missing step issue could have silently corrupted cryptographic computations without any warning from existing test suites. Integrating formal verification into our development cycle provided strong assurance that our implementation is correct and that every subroutine works well together.

Formal verification is an evolving field, and the approach selected for a particular project will naturally have distinct trade-offs and limitations regarding the properties it covers, and the assumptions held by the proofs. For example, our approach assumes that the compiler, which plays a role in generating the CPU instructions from our verified C code, behaves correctly. Additionally, we knew that a limitation in SAW would mean that it would not verify all possible message sizes for ML-DSA, but we are still able to gain correctness assurances for this part of the code through conventional testing, and we verified the core permutation subroutine which processes the message one block at a time.

Even with such limitations, we believe the types of subtle issues that we found and fixed can be uncovered only with formal methods. And while we focused our formal verification work on functional correctness, we also used extensive conventional testing, including simulation tools to cover other aspects of our implementation, such as protection against information leakage. Based on our work to date, we believe that the strongest assurance possible comes from combining formal verification with conventional methods and critically evaluating the end-to-end results.

With the latest release of corecrypto source code on May 22, 2026, we’re sharing meaningful advances in applied formal verification with the global cryptographic community, including the details of our approach and the tools we used. They are released openly to encourage wider adoption, support critical review of our work, and help advance the state of the art for assuring critical software.

*   Our [Formal verification for Apple corecrypto paper](https://github.com/apple/corecrypto/blob/2026-05/corecrypto_verify/technical_overview/formal-verification-for-apple-corecrypto.md) elaborates on the technical details of our approach for readers who would like to deeply understand how formal verification works in practice, including its limitations. We also provide information useful for evaluating our results and understanding or building on our shared tools and theories.
*   The [Cryptol-to-Isabelle translator](https://github.com/GaloisInc/saw-script/releases/tag/v1.5.1), which Galois built to our specification, enables Cryptol models to be translated to Isabelle and can be used to reproduce our analysis or used independently.
*   [Isabelle theories](https://github.com/apple/corecrypto/tree/2026-05/corecrypto_verify/isabelle/Apple_Isabelle_Libraries) in the [corecrypto source archive](https://github.com/apple/corecrypto) — including our ARM64 model, refinement framework, SProp separation algebra library, background lemmas, and FIPS formalizations — define powerful tools for reasoning about programs and establish a wide range of definitions and lemmas that are necessary to reproduce and evaluate our results. Some of these theories are published under corecrypto’s restricted evaluation license, while others are published under more permissive licenses to allow public use.

Our new customized approach to formal verification of corecrypto allows us to obtain the highest assurance of functional correctness that is available today for any widely deployed production implementation of ML-KEM and ML-DSA — and it does so in a way that fully supports hand-optimized code. The ease of use of Isabelle, SAW, and Cryptol tools, and the ability to replace subroutines individually, mean that we can rapidly evolve and optimize our verified implementations, with strong assurance that they will consistently produce the correct output.

