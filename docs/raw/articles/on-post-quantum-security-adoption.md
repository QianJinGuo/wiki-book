---
title: "On Post-Quantum Security Adoption"
source_url: "https://brandonrozek.com/blog/post-quantum-security-adoption/"
ingested: 2026-06-18
sha256: ""
type: article
tags: [security, cryptography, post-quantum, ai]
created: 2026-06-18
---

# On Post-Quantum Security Adoption


Published Time: 2026-06-15

Markdown Content:
From Alex’s [blog post](https://alexwlchan.net/2026/post-quantum-blog/), I’ve learned that there are enough recent breakthroughs in quantum computing that I should take post-quantum cryptography seriously. [Google](https://blog.google/innovation-and-ai/technology/safety-security/cryptography-migration-timeline/) and [Cloudflare](https://blog.cloudflare.com/post-quantum-roadmap/) both set a target of 2029 for having their systems secure against quantum computers. Similarly, the [UK government](https://www.ncsc.gov.uk/guidance/pqc-migration-timelines) is targeting 2035.

The issue is that cryptography is built upon math problems that are difficult to solve. Quantum computers make solving some of these problems such as integer factorization and discrete logs easier. If someone has a quantum computer that can sufficiently solve those two problems, then they can likely decrypt many ciphertexts that were produced using [asymmetric cryptography](https://en.wikipedia.org/wiki/Public-key_cryptography) techniques (think public/private key-pairs). Wikipedia has a great article discussing [post-quantum cryptography](https://en.wikipedia.org/wiki/Post-quantum_cryptography) if you want to read more.

Given all that, if the cost isn’t too high then it’s not a bad idea to look at our current systems and see what we can make quantum-resistant today. Otherwise, we risk being vulnerable to [harvest now, decrypt later](https://en.wikipedia.org/wiki/Harvest_now,_decrypt_later) attacks. This is where an adversary stores encrypted packets until they have a computer powerful enough to break the encryption. You might wonder if encrypted packets from 5 years ago matter. Though if you’re like me, chances are you had to transmit personally identifiable information over the internet for jobs, housing, etc. In the US, it is [really difficult](https://www.ssa.gov/faqs/en/questions/KA-02220.html) to change your social security number.

We’ll explore three different protocols I rely on and how we can make them post-quantum resistant.

## SSH

OpenSSH implemented and made default post-quantum key agreement [back in April 2022](https://www.openssh.org/pq.html). At the time of writing, the `mlkem768x25519-sha256` scheme is used. That’s a mouthful but it essentially describes what the scheme is:

*   `mlkem`: [Module lattices](https://en.wikipedia.org/wiki/Lattice-based_cryptography)[key encapsulation mechanism](https://en.wikipedia.org/wiki/Key_encapsulation_mechanism) (also known as key-exchange)
*   `768`: Not sure what this means, sorry.
*   `x25519`: [Elliptic curve](https://en.wikipedia.org/wiki/Curve25519) used in the classical Diffie-Hellman key-exchange.
*   `sha256`: The hash function used to [combine the keys](https://datatracker.ietf.org/doc/draft-ietf-sshm-mlkem-hybrid-kex/) generated from ML-KEM and x25519 (see Section 2.4 of previous link).

As you might notice, this is a hybrid quantum/classical algorithm. This is a hedge. If quantum computers arrive which break the classical algorithm, then we’re safe. Similarly if we find out that the post-quantum algorithms are insecure, then we still have the well-developed classical ones. We can only hope that they’re both not found to be insecure.

If you are using a client released after October 2025, then you’ll receive a warning if you’re connecting to a server that doesn’t support post-quantum encryption.

```
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
```

## TLS

[Transport Layer Security](https://en.wikipedia.org/wiki/Transport_Layer_Security) is a cryptographic protocol that underlies HTTPS and many other applications. You’re likely using it to connect to this website! Similar to OpenSSH, they introduced the hybrid scheme `X25519MLKEM768` for post-quantum security. The main difference that I can spot (as a non-cryptographer) is that this scheme does not hash the combined key. If you’re interested, you can read more at this [IETF draft](https://datatracker.ietf.org/doc/draft-ietf-tls-ecdhe-mlkem/).

In terms of major browsers, Firefox has supported this since [October 2024](https://www.firefox.com/en-US/firefox/132.0/releasenotes/) and Chrome since [November 2024](https://developer.chrome.com/release-notes/131). To use this scheme, however, both sides need to handle it. At the time of writing, [Cloudflare](https://radar.cloudflare.com/post-quantum) estimates that 70.1% of Internet traffic is post-quantum encrypted. You can even use that link to check whether your own website supports post-quantum key exchange.

If you find that your website is not post-quantum secure, then check out the [TLSRef TLS Configurator](https://configurator.tlsref.org/). This provides the configuration options needed to support modern cryptographic protocols for a variety of popular web servers.

## WireGuard

WireGuard is a popular VPN technology that is known for being efficient and simple. By default, it is [not post-quantum secure](https://www.wireguard.com/known-limitations/). However, we can use the `PresharedKey` field to mix a symmetric key whose underlying mathematical problems are not as impacted as asymmetric cryptography.

The simplest solution here then is to run

```
wg genpsk
```

and then _securely_ add the key into the `PresharedKey` field.

```
[Interface]
Address = ...
...
PrivateKey = ...

[Peer]
PublicKey = ...
...
PresharedKey = ...
```

Both sides of the connection need to use the same `PresharedKey` in order for the connection to work.

I’ll reiterate that we need to figure out a way to transfer the key _securely_ for this to work. WireGuard doesn’t have a built-in way to share these keys. If you want to go with this simpler static preshared key route, then I suggest that you use a post-quantum secure channel (like a modern SSH setup) to distribute the keys.

The downside of setting the preshared key on both sides once and then moving on is that the tunnel is then not post-quantum forward secret. This means that if an adversary with access to a sufficiently powerful quantum computer additionally gets access to the preshared key, they can then decrypt all future ciphertexts.

If we want to protect against this, then we’ll need to run a post-quantum key exchange protocol on top of WireGuard. At the time of writing, [Rosenpass](https://github.com/rosenpass/rosenpass) seems to be the simplest way to set this up. They automatically update the preshared key securely within WireGuard every two minutes.

While that is one solution, the space here seems fragmented. Another approach [updates the protocol itself](https://ieeexplore.ieee.org/abstract/document/9519445) and many VPN providers [handle it their own way as well](https://prod-assets-cms.mtech.xvservice.net/files/xv/Post-Quantum-WireGuard_-A-Practical-Implementation-Guide.pdf).

## Conclusion

Even though we’re not at [Y2Q or Q-day](https://en.wikipedia.org/wiki/Harvest_now,_decrypt_later), we can still take steps to make sure that we’re transmitting information over the Internet in a quantum-resistant way. In the meantime, I’ll dream about the day when I can run a quantum computer in my pocket.
