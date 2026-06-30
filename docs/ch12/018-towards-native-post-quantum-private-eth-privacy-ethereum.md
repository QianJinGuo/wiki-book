# Towards Native Post-Quantum Private ETH - Privacy - Ethereum Research

## Ch12.018 Towards Native Post-Quantum Private ETH - Privacy - Ethereum Research

> 📊 Level ⭐⭐ | 16.3KB | `entities/towards-native-post-quantum-private-eth.md`

# Towards Native Post-Quantum Private ETH - Privacy - Ethereum Research

Published Time: 2026-06-24T15:53:26+00:00

Markdown Content:
_Thanks to [@winderica](https://ethresear.ch/u/winderica), [@mmjahanara](https://ethresear.ch/u/mmjahanara), [Kenny Paterson](https://scholar.google.com/citations?user=NkuWcH0AAAAJ&hl=en), [Varun Maram](https://varun-maram.github.io/) and [@keewoolee](https://ethresear.ch/u/keewoolee) for their valuable suggestions and feedbacks._

#### [](http://ethresear.ch/t/towards-native-post-quantum-private-eth/25291#p-60931-beyond-hndl-1)Beyond HNDL

The [L1 strawmap](https://strawmap.org/) laid out a path listing L1-native private post-quantum (pq) transfers as a north star. Today, production-deployed privacy solutions rely on elliptic curve-based primitives or on unsatisfactory hardware assumptions. Some argue that, as of now, protecting against harvest-now-decrypt-later (HNDL) attacks is enough for private transfer protocols. However, the deployment of a cryptographically relevant quantum computer means adversaries would be able to carry out undetectable attacks resulting in a catastrophic loss of funds. In that situation, any recovery mechanism (such as turnstiles) will likely require important social layer coordination, provided users’ trust in the protocol isn’t permanently damaged.

This post tries to succinctly lay out the kind of cryptographic work we would have to do to enshrine pq privacy in the L1. It is not straightforward: a look at Sapling’s ([~620k shielded ZEC](https://zkp.baby/), approx $250m in value at today’s price) choices regarding its primitives’ instantiation illustrates why protecting users from HNDL attacks or simply switching proof systems falls short of accurately describing what work is required to deliver pq shielded ETH.

Preparing for a pq turnstile while using classical cryptographic primitives would not be enough. A turnstile is an inherently reactive, non-retroactive and non-preventive technique that doesn’t fend off an attacker’s ability to destroy the coin’s value. Turnstiles also take time and won’t ever really be completed: it will only be many years later that users can be _probabilistically_ confident that counterfeiting didn’t take place. On top of this, turnstiles greatly impact users by deactivating their ability to transact. They are, all in all, an inherently social-layer defense mechanism, impeding a genuine walk-away from the protocol.

| Usage | Primitive | Security Requirement | Instantiation |
| --- | --- | --- | --- |
| Encrypting Note Plaintexts | Asymmetric Encryption | IND-CCA2 and IK-CCA2 | ![Image 1: :warning:](https://ethresear.ch/images/emoji/facebook_messenger/warning.png?v=14) DHAES |
| Spend Authorization | Re-Randomizable Signature | SURK-CMA | ![Image 2: :warning:](https://ethresear.ch/images/emoji/facebook_messenger/warning.png?v=14) RedDSA on Jubjub |
| Non-Inflation (and Non-Malleability) | Signature with Signing Key to Validating Key Monomorphism | Non-Adaptive SU-CMA, Key Monomorphic | ![Image 3: :warning:](https://ethresear.ch/images/emoji/facebook_messenger/warning.png?v=14) RedDSA on Jubjub |
| Committing to Notes | Commitment Scheme | Binding and Hiding | ![Image 4: :warning:](https://ethresear.ch/images/emoji/facebook_messenger/warning.png?v=14) Windowed Pedersen Commitments (hiding is ok) |
| Committing to Values | Linearly Homomorphic Commitment Scheme | Binding and Hiding | ![Image 5: :warning:](https://ethresear.ch/images/emoji/facebook_messenger/warning.png?v=14) Homomorphic Pedersen Commitments (hiding is ok) |
| Diversified Addresses | Diversify Hash | Unlinkability | ![Image 6: :warning:](https://ethresear.ch/images/emoji/facebook_messenger/warning.png?v=14) Group Hash Jubjub Curve |
| Proofs | SNARK | Statistical Zero-Knowledge (zk), Completeness, Knowledge Soundness | ![Image 7: :warning:](https://ethresear.ch/images/emoji/facebook_messenger/warning.png?v=14) Groth16 on BLS12-381 (zk is ok) |

_A non-exhaustive table of ZCash’s Sapling pq readiness. It applies to Orchard, which changed Sapling’s proof system (Halo2, Pasta Curves), key material derivation and nullifiers computation formulas, but is soon to be deprecated._

In this post, we will only consider the case of dealing with a quantum adversary. We will evaluate solutions to statelessness compatibility and the verification cost problem in a separate writeup.

#### [](http://ethresear.ch/t/towards-native-post-quantum-private-eth/25291#p-60931-proof-systems-2)Proof Systems

Hash-based proof systems are getting to a point where they are both fast and well-understood. Not leveraging lattice-based ones means that our shielded pool protocol will probably not provide users with the ability to prove their final balance output using snark-friendly lattice-based homomorphism, including the ability to do proof parallelization.

This is however fine. Proof parallelization was indeed conceived as a way to overcome join-split statements’ inadequacy for note consolidation or sending to multiple recipients. Today, progress in hash-based SNARKs ([WHIR](https://eprint.iacr.org/2024/1586.pdf), [STIR](https://eprint.iacr.org/2024/390.pdf)) offer the ability to prove bigger circuits and depart from a traditional two inputs/outputs setup rendering such proof parallelization strategies less relevant. Thus, a battle-tested join-split zkSNARK statement enforcing checks on notes’ Merkle paths and commitments, input/output values, nullifiers derivation and spend auth signature validity should get us to the core required functionalities, with an on-par UX compared to existing protocols.

The instantiation of this statement depends critically on the choice of hash function for nullifiers and note commitments. There are different SNARK-friendly hash candidates to use. Recent research on Poseidon indicates that we should be cautious and would need some more cryptanalysis research to integrate it (see [here](https://eprint.iacr.org/2025/1916) and [here](https://eprint.iacr.org/2026/1254)). Other options include using less arithmetization-friendly hashes, such as BLAKE3.

#### [](http://ethresear.ch/t/towards-native-post-quantum-private-eth/25291#p-60931-secret-distribution-3)Secret Distribution

_Encryption_

Transaction detection corresponds to receivers being able to detect public ciphertexts addressed to them. We should make sure that it is DoS-resistant, provides unlinkability, minimizes trust points and remains practical on resource-constrained devices. The main task will be to swap a key agreement (KA) for a key encapsulation mechanism (KEM) (the two differ with how randomness is contributed in the shared key material generation algorithm). Today, the NIST PQC process only standardized KEMs, leaving pq KA aside.

Kyber is our leading KEM candidate. However, until relatively recently, cryptography had to establish its _anonymity_ (aka ANO-CCA, an adversary cannot determine to which recipient an encapsulated key is destined) and that of the PKE scheme derived from it in a pq setting. Kyber initially had a more complex Fujisaki-Okamoto (FO) transform using nested hashing. However, NIST eventually decided to simplify it, easing researcher’s ability to establish its ANO-CCA security. Research eventually showed that one can obtain an ANO-CCA security proof even for [nested hashing](https://eprint.iacr.org/2022/1696.pdf). All in all, the current NIST standard ML-KEM does provide an anonymous and robust PKE, by composing with an appropriate DEM in the KEM-DEM paradigm.

Orthogonal but going hand in hand with anonymity, the scheme used for secret distribution also needs to satisfy _robustness_, making it possible for a party to decide it is the ciphertext’s intended recipient, i.e. providing assurance that trial decryption doesn’t err. This isn’t a natural property. For instance, [it was shown](https://eprint.iacr.org/2021/708.pdf) that for any plaintext m, it is possible to build a ciphertext c such that c decrypts to m under any Classic McEliece private key. However, the situation is less dire here, since ML-KEM [has been found to be robust](https://eprint.iacr.org/2021/708.pdf).

Note that this only settles the encryption side of HNDL attacks: a complete defense would require note commitments and nullifiers to be instantiated with quantum secure primitives.

_Hybrid Schemes_

Hybrid cryptographic schemes combining classical and post-quantum algorithms will most likely be required initially to take a conservative security stance to build the asymmetric encryption scheme used to distribute secrets (likely an “hybrid” public key encryption scheme, here in the sense of combining an asymmetric key exchange protocol and a symmetric encryption scheme). We will have flexibility along a few axes: pure pq vs. hybrid (e.g. combining ML-KEM with a traditional ECDH group), CFRG-defined vs. NIST-defined elliptic curves, different security levels (NIST category 3 vs. category 5). The symmetric encryption part should stay similar to what it is today, although we should evaluate whether we would like to use longer key lengths.

_Decryption_

There remains, however, the question of privacy-preserving protocols’ decryption trilemma: anonymity, low latency and small bandwidth usage. Switching to pq schemes makes this trilemma even more relevant.

A north star would remain deploying oblivious message retrieval (OMR) at scale. Such constructions are quantum secure, but clue (i.e. the required on-chain costs) and detection key sizes are already too high to make up a credible L1 candidate. Also, server costs remain the dominant bottleneck even for SOTA constructions, making it unclear how to leverage such techniques in the near term. There is the option to split detection from retrieval using Oblivious Message Detection (OMD, a restricted version of OMR for obliviously retrieving indices) coupled with PIR to fetch payloads. Splitting those two tasks would relieve servers from running OMR’s intensive compute requirement. Still, combining the two wouldn’t reduce the clue size today.

One potential avenue would be to leverage fuzzy message detection (FMD) algorithms. They provide a non-negligible improvement over naive scanning, with much lower compute requirements while keeping a small clue size. However, [pq versions](https://eprint.iacr.org/2023/1148) of FMD require clues with sizes an order of magnitude larger. Also, this overhead comes at the price of only modest probabilistic privacy guarantees, as FMD is also prone to a variety of statistical [attacks](https://eprint.iacr.org/2021/1180). Other recent approaches, such as tag-indexing in Aztec or channels in the Starknet privacy layer, sequentially index transactions between two parties using a shared secret, keeping all subsequent exchanges unlinkable. The limitation is that the initialization step requires revealing that Alice intends to interact with Bob.

Note that there is always the option to fall back on out-of-band channels for sending ciphertexts, which makes it possible to remove them from the transaction entirely.

So, in a pq context, there might not be anything better than using trial decryption today. Even in a classical context, most privacy-preserving protocols today use a flavour of trial decryption coupled with authentication tags. To decrease bandwidth costs, [ZCash](https://zips.z.cash/zip-0307) light clients download compactly formatted transactions to synchronize their state using trial-decryption. To provide anonymity, upon detecting intended transactions users are then recommended to [insert decoy requests](https://zips.z.cash/zip-0307) alongside the correct, queried ones. In the case of Ethereum, when coupled with PIR and network anonymity, this path might be the best pq solution for the trilemma today.

#### [](http://ethresear.ch/t/towards-native-post-quantum-private-eth/25291#p-60931-signatures-4)Signatures

In the case of a malleable zkSNARK, we might need to require an ephemeral keypair to sign the hash of the transaction, binding it to the zkSNARK statement. The nice thing is that non-adaptive strong-unforgeability under chosen message attack (SU-CMA) security is ok, since the signature is one-time. Also, the binding signature doesn’t require in-circuit verification, such that we can probably use a lattice-based scheme with a much smaller signature size compared to hash-based ones (or even a one-time hash-based signature if we really don’t want to use lattices).

For the spending authority scheme, the choice of the signature scheme is constrained by the hardware wallets that must produce these signatures in practice. Some actually proposed to opt for proof knowledge of a pre-image of some hash, sparing us from arithmetizing signatures and deciding which scheme to go with. It is, however, unclear whether tomorrow’s wallet infrastructure will support and standardize proving a recursive pq zkSNARK and whether the particular scheme will be compatible with what’s enshrined on the L1. This would also mean getting rid of all the wallet hardening work that has been done over the years, including the different attack vectors that generating signatures on hardware wallets implies.

On statefulness, note that most hardware wallets come with non-volatile memory and are able to support both stateful and stateless signatures. Stateful designs provide shorter signatures and potential optimizations. However, statefulness introduces a handful of problems when the signer isn’t signing at regular, predictable intervals. Users need to back up their keys, but using backups leads to state reuse and enables forgeries.

There are a number of stateless, hash-based signature schemes that could be amenable to being snarkified, including [research](https://eprint.iacr.org/2025/2203.pdf) being done for Bitcoin in this regard. One option would be to use SPHINCS+ with a parameter set that offers a small signature verification budget. One particularly interesting parameter set would be to reuse the one that’s being laid out for firmware signing, something that inspired the design of [SPHINCS-](https://ethresear.ch/t/sphincs-minus-efficient-stateless-post-quantum-signature-verification-on-the-evm/25165).

There could also be a trick to use many times the key pair of a one-time signature (OTS) scheme. Consider a perfectly hiding zkSNARK. Since the OTS is kept hidden inside the zkSNARK as part of the witness, forging a spend proof reduces to producing a valid OTS on a fresh transaction hash without knowledge of the secret key, which remains hard as long as no OTS is ever exposed outside the circuit. It however implies a different threat model requiring the spend auth signature to never be exposed to protect both privacy and loss of funds.

#### [](http://ethresear.ch/t/towards-native-post-quantum-private-eth/25291#p-60931-key-material-5)Key Material

It is possible to design key material using Pseudo Random Functions (PRFs) only. Chosen adequately, such PRFs are quantum secure. This was, for instance, the strategy of Sprout, an early version of the ZCash protocol. Lattice-based primitives might be helpful for re-designing diversified address functionality, although it remains unclear how such a design would work in practice and how compatible it would be with a hash-based proof system.

#### [](http://ethresear.ch/t/towards-native-post-quantum-private-eth/25291#p-60931-hardening-6)Hardening

Since ETH secures billions in value, we avoided discussing exotic primitives enabling things like private shared state. Our rationale for not considering more involved cryptography and functionalities is threefold: we would like to (1) design our protocol with a walkaway in mind, (2) facilitate any downstream formal verification effort and (3) re-use already understood and production deployed primitives securing billions in value today.

Another additional guard to consider would also consist in designing a progressive pool uncapping. Defined at the protocol level, that progressive uncapping would consist in gradually increasing deposit amounts to minimize catastrophic size losses in the early days of the enshrined pool’s life.

---

