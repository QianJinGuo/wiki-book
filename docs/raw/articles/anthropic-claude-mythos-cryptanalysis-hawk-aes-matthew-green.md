---
title: "Some thoughts about Anthropic's new cryptanalysis results"
source_url: https://blog.cryptographyengineering.com/2026/07/29/some-notes-about-anthropics-new-results/
ingested: 2026-07-31
type: raw-article
tags: [anthropic, ai, cryptanalysis, cryptography, claude, hawk, aes]
confidence: 0.70
provenance_state: extracted
sha256: d1ac3bce2ca2ba9793b8c8cfb1f99de8316d8b6e126e3405fd77e5953eed466d
---

> **Matthew Green's analysis of Anthropic's cryptanalysis results produced by Claude Mythos.** Green is a cryptographer and professor at Johns Hopkins University. Published July 29, 2026.

# Some thoughts about Anthropic's new cryptanalysis results — Matthew Green

Anthropic published two new cryptanalysis results, both outputs of Claude Mythos, their (still) unreleased advanced model. The first attacks a signature scheme called HAWK, while the second is an improved attack against reduced-round AES.

## HAWK Attack

The first result is a new key recovery algorithm against the non-standard signature scheme HAWK, a proposed post-quantum-safe signature scheme based on the module Lattice Isomorphism Problem (module-LIP).

Key facts about this result:
- HAWK is not a deployed or standards-adopted algorithm, it's a proposed algorithm. It is related to Falcon (being standardized) but the attack does not transfer.
- HAWK was somewhat far along in being evaluated for a future standard.
- The attack is still exponential time, but roughly halves the number of "bits" of security, could be fixed by doubling key sizes (making the scheme less efficient, undermining its motivation).
- The attack produced real code that runs in a few hours against a weakened "challenge instance". It demonstrates the cryptanalytic weakness well enough.
- **Most concerning**: the attack does not invent fundamentally new mathematics. It simply extends existing tools more thoroughly. As Green quotes Claude: "what makes this genuinely interesting — and, frankly, a little embarrassing for the field — is that none of the ingredients are exotic."

## AES Attack

The second result is a new attack on reduced-round AES (7-round variant of the full cipher which runs 10-14 rounds depending on key size).

Key facts:
- Attacks against 7-round AES are not new; this is a modest constant-factor improvement on 2013 work.
- Requires 2^89 cipher operations and 2^105 chosen plaintexts — neither remotely practical.
- The "speedup" is an on-paper analysis, not a runnable attack.
- Still interesting from a techniques point of view, but a small increment.

## How Anthropic Got These Results

Green notes the Anthropic process was "kind of hilarious" — they did not have a large team of domain experts. They appear to have just told Claude to find results and "strapped its nose to the grindstone until it found some." The AIs are now capable of understanding existing cryptanalysis results, synthesizing them into real new attacks, and extending them without detailed human intervention.

## Verification Bottleneck

The real problem, Green argues, is verification. Models are good at producing results that *look* real but are misleading. Human attention is more necessary than ever.

For "full attacks" like HAWK (runnable code), verification is easy. For speedup attacks like the AES result, checking validity requires formal verification or expert review.

## Implications

- **For users**: Symmetric ciphers are messy and robust. Public-key crypto has more surface for AI to find attacks.
- **For scientists**: A powerful collaborator who can talk through problems. Questions about credit and review remain.
- **For the world**: Models are very intelligent and capable, getting better at a fast clip. But they are not super-intelligent yet — "like swimming in a pond where the ground drops off sharply."

^[https://blog.cryptographyengineering.com/2026/07/29/some-notes-about-anthropics-new-results/]
