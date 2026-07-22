---
title: "blog.bytebytego.com"
source: newsletter
url: https://blog.bytebytego.com/p/how-openai-delivers-low-latency-voice
ingest_date: 2026-07-03
vxc: 56
stars: 4
sha256: 42bf466404e5d87582a16f126031a9c8f3e5ed5905fe418f25ee01aedebacd29
---
sha256: d4a6651f15162e0278fdb64eabb0d836081e43085d749d1747f1772576b0f0a4

Title: How OpenAI Delivers Low-Latency Voice AI for 900M Users

URL Source: https://blog.bytebytego.com/p/how-openai-delivers-low-latency-voice

Published Time: 2026-07-01T15:31:13+00:00

Markdown Content:
[![Image 1](https://substackcdn.com/image/fetch/$s_!MtNY!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F36c7f7db-c74c-44c5-bb22-ad829d91c86b_1600x840.png)](https://go.bytebytego.com/Matic_070126)

Matic is the first visually intelligent robot vacuum that sees your home like you do, so it can clean how you want it to.

Matic’s hero features:

*   Runs entirely on cameras to deftly navigate obstacles

*   Recognizes floor types to auto-switch between vacuuming and mopping

*   Big wheels and a height-adjustable cleaning head handle thick rugs

*   Quieter than conversations at 55 dB

*   Handles pet hair without clogging or tangling

*   A single bag collects dry and wet waste—diaper-salts gel dirty water, antimicrobial powder prevents mold

*   A fresh HEPA filter in every bag for cleaner air, no washing or replacing

Experience autonomous cleaning with Matic with a 180-day money-back guarantee.

[Get your Matic](https://go.bytebytego.com/Matic_070126)

OpenAI runs voice AI for 900 million users a week, and they use WebRTC for it because the alternative would mean reinventing how the internet handles live audio.

The catch is that WebRTC was designed for servers with stable IPs and ports, and Kubernetes treats those addresses as disposable. The conventional answer at this scale is an SFU, which suits multiparty workloads like group video calls, but OpenAI’s traffic is overwhelmingly one user talking to one model.

To deal with this, their architecture splits the stack into two pieces:

*   A stateless relay handles protocol-aware packet routing at the geographic edge.

*   A stateful transceiver owns all the heavy WebRTC state.

The trick that ties them together is using the ICE ufrag, a field the protocol already exchanges during setup, as a routing key that the relay can read off the first packet of a new session. Everything else, from Global Relay to the userspace Go implementation to the Redis cache and the careful socket-level optimizations, builds on top of that core idea.

In this article, we will look at the entire journey in detail and challenges the OpenAI engineering team faced.

_Disclaimer: This post is based on publicly shared_ details _from the Open AI Engineering Team. Please comment if you notice any inaccuracies._

Voice AI either feels like a conversation or it feels like a walkie-talkie. The line between those experiences is measured in milliseconds.

When the network pauses between hearing a user and responding, the illusion breaks. Pauses turn awkward, interruptions get clipped, and users are compelled to cut off the AI mid-sentence, which is also kind of rude. In other words, voice AI only feels natural if the conversation moves at the speed of speech.

The harder constraint underneath is the continuous-stream property. Audio has to arrive at the model as a steady flow, rather than as a single upload after the user finishes talking. That stream is what lets the model start transcribing, reasoning, and calling tools while the user is still speaking. The experience collapses into push-to-talk once it breaks.

For OpenAI specifically, those constraints translate into three concrete requirements:

*   The system has to reach 900 million weekly active users wherever they are.

*   Connection setup has to be completed quickly enough that users can start speaking as soon as a session begins.

*   Round-trip time for audio has to stay low and stable so turn-taking feels crisp.

WebRTC is the protocol the industry built for this kind of work. It is a bundle of smaller protocols (ICE for figuring out how two endpoints reach each other across firewalls, DTLS for encrypting the channel, SRTP for the audio packets, and RTCP for quality feedback). Justin Uberti, one of WebRTC’s original architects, and Sean DuBois, who maintains the Pion library OpenAI builds on, both work at OpenAI today. That kind of protocol depth shows up in the architecture they shipped.

The first version of OpenAI’s WebRTC infrastructure was a single Go service built on Pion. It handled both jobs in one place:

*   On the signaling side, the service negotiated SDP (the format clients and servers use to describe a session), selected codecs, generated ICE credentials, and set up sessions.

*   On the media side, the service terminated WebRTC connections from clients and maintained upstream connections to the backend services that run the AI models, including inference, transcription, speech generation, tool use, and orchestration.

[![Image 2](https://substackcdn.com/image/fetch/$s_!cbRK!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F970e2ede-f20b-498c-962c-1d69fbdfcb4a_1742x906.png)](https://substackcdn.com/image/fetch/$s_!cbRK!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F970e2ede-f20b-498c-962c-1d69fbdfcb4a_1742x906.png)

That combined service still powers ChatGPT voice, the Realtime API’s WebRTC endpoint, and several research projects, and it has handled that work well. The question OpenAI ran into was how to deploy it on Kubernetes, the container orchestration system that runs most modern cloud infrastructure.

Kubernetes assumes compute is cheap and movable. Pods come up, get scheduled wherever capacity exists, run for a while, then get rescheduled or replaced. Standard WebRTC deployment patterns assume the opposite. That mismatch shows up in two specific places.

The first is port exhaustion.

The conventional way to deploy WebRTC uses one UDP port per session. At OpenAI’s scale, that means tens of thousands of public UDP ports per service. Cloud load balancers were built for a handful of well-known ports, so each additional range adds operational complexity for load balancer config, health checks, firewall policy, and rollout safety. The exposed surface area also makes security audits harder. Kubernetes autoscaling clashes with the requirement to reserve large and stable port ranges, which makes elasticity brittle.

The second is state stickiness.

Running one UDP port per server and demultiplexing sessions behind it solves the port problem. ICE and DTLS, however, are stateful protocols. The process that started a session has to keep receiving its packets to validate connectivity checks, complete the DTLS handshake, decrypt SRTP, and process later session changes like ICE restarts. If a packet for an existing session lands on a different process, setup fails, or media breaks.

Both pressures point to the same answer. The deployment architecture has to change while the client experience stays identical.

The architecture OpenAI shipped splits packet routing from protocol termination.

A stateless relay sits at the front, presenting a small public footprint to the internet. A stateful transceiver sits behind it, owning all the heavy WebRTC state. Signaling still goes directly to the transceiver. Media enters through the relay first.

The relay’s scope is deliberately narrow. It reads enough of each packet to choose a destination, then forwards the rest as an opaque payload. Audio stays encrypted on the way through, ICE state machines stay with the transceiver, and codec negotiation happens elsewhere. From a client’s perspective, the WebRTC session looks normal in every way.

The transceiver owns the parts of WebRTC that have to remember things. ICE connectivity checks, the DTLS handshake, SRTP encryption keys, and the session lifecycle all live there. The transceiver is the endpoint that completes the handshakes and encrypts or decrypts the actual media.

See the diagram below:

[![Image 3](https://substackcdn.com/image/fetch/$s_!FWPc!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe0321c23-ae81-4191-971c-7b79b2da73eb_1552x964.png)](https://substackcdn.com/image/fetch/$s_!FWPc!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe0321c23-ae81-4191-971c-7b79b2da73eb_1552x964.png)

There was an obvious alternative that the team evaluated and chose against.

An SFU, or Selective Forwarding Unit, is the standard media server architecture for WebRTC at scale. It terminates one WebRTC connection per participant and selectively forwards streams between them. The AI joins as another participant.

This works well for inherently multiparty products like group calls, classrooms, and collaborative meetings. OpenAI’s workload looks different. Most sessions are 1:1, with one user talking to one model. For that kind of traffic, the SFU model adds overhead and forces backend services to behave like WebRTC peers themselves. The transceiver model lets the backend stay an ordinary service.

See the diagram below that shows the SFU approach:

[![Image 4](https://substackcdn.com/image/fetch/$s_!h1MA!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff4131e5c-f1b8-4e13-8bf8-68bb961d023e_1552x964.png)](https://substackcdn.com/image/fetch/$s_!h1MA!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff4131e5c-f1b8-4e13-8bf8-68bb961d023e_1552x964.png)

TURN was also considered and set aside.

TURN is the standard protocol-terminating relay used for NAT traversal. The trouble is that TURN allocations add setup round-trips before media can flow, and migrating or recovering them across servers is hard. For a latency-sensitive workload, those extra round-trip matters.

The split solves the port and state problems in principle. The remaining problem is making the relay route the first packet correctly.

The first packet of any new session is the difficult one.

Subsequent packets are easy because the relay has a mapping that says that packets from this source IP and port go to this transceiver. The first packet is what creates that mapping, so the relay has to figure out where to send it from the packet itself.

See the diagram below:

[![Image 5](https://substackcdn.com/image/fetch/$s_!-0BM!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F14bb750c-4f36-4b95-ae5c-36b49c77e330_1842x988.png)](https://substackcdn.com/image/fetch/$s_!-0BM!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F14bb750c-4f36-4b95-ae5c-36b49c77e330_1842x988.png)

Two naive options were present:

*   A database lookup on the hot path adds latency and a hard dependency on another service staying healthy.

*   Routing to a random transceiver and forwarding internally works, but doubles the hop count.

OpenAI chose a third option.

The answer lives inside a field that WebRTC already exchanges. Every WebRTC session carries an ICE username fragment, called the ufrag, which is produced during session setup and echoed in STUN binding requests. STUN binding requests are the packets ICE uses to verify that two endpoints can actually reach each other, and they are usually the first thing a client sends on the media path.

The trick is that OpenAI generates the server-side ufrag during signaling. They can put whatever they want in it, so they encode routing metadata into it. The relay parses just enough of the first STUN binding request to read the ufrag, decode the routing hint, and forward the packet to the transceiver that owns the session. Every packet after the first one flows through the established session mapping, which skips the ufrag parsing step entirely.

See the diagram below that shows the connection establishment sequence in detail:

[![Image 6](https://substackcdn.com/image/fetch/$s_!F2qy!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F54f8e247-d061-4465-bdaa-f7bece30f1b0_1752x1900.png)](https://substackcdn.com/image/fetch/$s_!F2qy!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F54f8e247-d061-4465-bdaa-f7bece30f1b0_1752x1900.png)

Each transceiver in the fleet listens on a shared UDP socket, which is one operating system endpoint bound to an internal IP and port. All sessions for that transceiver multiplex behind it.

During signaling, the transceiver returns a shared relay VIP and UDP port in the SDP answer. A VIP is a virtual IP address that fronts the entire relay fleet, so the client sees one stable destination like 203.0.113.10:3478, even though many relay instances sit behind that address. From the client’s side, there is one place to send packets, and it stays the same for the life of the session.

The relay’s state is purposefully tiny. It holds an in-memory map of source address to transceiver destination, plus some counters for monitoring and timers for session cleanup. If a relay instance restarts and loses the mapping, the next STUN packet rebuilds it from the ufrag. To make recovery faster, a Redis cache holds the source-to-destination mapping once a route is established. A restarted relay can look up the mapping from Redis immediately.

The principle here generalizes well. When we need data on the hot path, look at what the protocol is already exchanging. A field on the payload is essentially free to parse. A new lookup costs latency, a dependency, and one more thing that can break.

Once the public UDP surface was reduced to a small fixed set of addresses, the same relay pattern became deployable globally.

Global Relay is OpenAI’s fleet of geographically distributed relay ingress points. All of them run the identical packet-forwarding behavior described above. The only thing that changes is where on the map they sit.

[![Image 7](https://substackcdn.com/image/fetch/$s_!rOyx!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F420967ca-3b7d-4221-891a-02dc6e1d992a_2116x988.png)](https://substackcdn.com/image/fetch/$s_!rOyx!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F420967ca-3b7d-4221-891a-02dc6e1d992a_2116x988.png)

Geographic distribution shortens the first client-to-OpenAI hop. A packet entering the network at a relay close to the user, in both geography and network topology, has a much easier time than a packet that has to traverse the public internet to reach a distant region first. The practical effect is lower latency, more stable timing, and a cleaner loss profile before traffic reaches the OpenAI backbone.

OpenAI uses Cloudflare for geographic and proximity steering on the signaling side. The initial HTTP or WebSocket request that sets up a session is routed to a nearby transceiver cluster. The request context then determines which Global Relay ingress point gets advertised back to the client in the SDP answer. The ufrag carries enough information for Global Relay to route media to the right cluster, and for the cluster’s relay to route to the right transceiver.

The result is that both the signaling and the media paths enter the OpenAI network at points close to the user, while the session itself stays anchored to one specific transceiver for its full lifetime. The setup round-trip and the first ICE connectivity check both shorten, which directly reduces how long a user waits before they can start speaking.

The relay is a Go service running in userspace, which is to say a regular process that reads from a regular UDP socket.

The Linux kernel receives UDP packets from the network interface, delivers them to a socket bound to the relay’s IP and port, and the Go process reads from that socket, updates a small amount of flow state, and forwards each packet to the right transceiver.

OpenAI evaluated kernel-bypass frameworks (which let a userspace process poll the network card’s queues directly) and chose to stay away. Bypass raises packet throughput at the cost of operational complexity. The team’s workload fit inside what a careful Go implementation could handle.

Three implementation choices carry most of the performance load.

*   SO_REUSEPORT is a Linux socket option that lets multiple workers on the same machine bind the same UDP port. The kernel then distributes incoming packets across those workers, which removes the bottleneck of a single read loop.

*   runtime.LockOSThread pins each UDP-reading goroutine (a lightweight thread in Go) to a specific OS thread. Combined with SO_REUSEPORT, this tends to keep packets from the same flow on the same CPU core, which helps cache locality and reduces context switching.

*   Pre-allocated buffers and minimal copying during packet parsing keep allocation overhead low and avoid putting pressure on Go’s garbage collector.

The takeaway is that ordinary optimizations were enough. The relay handles OpenAI’s global real-time media traffic on a relatively small footprint.

Every architecture comes with tradeoffs, and this one carries several worth understanding.

*   The whole design is built around 1:1 sessions. If OpenAI ever wants to add multiparty features (group voice calls, multiple participants in a single AI session, human handoff during a call), large parts of this architecture would probably need rework. Both the transceiver model and the choice to skip SFU rely on the assumption that most sessions have exactly two endpoints.

*   OpenAI also took on a custom infrastructure burden. A standard SFU comes with documentation, a community, and battle-tested patterns. The relay, the transceiver, and the coordination between them are all internal code. Every engineer who works on this stack has to learn it from the inside out.

*   The “stateless” relay turns out to be stateless mostly in spirit. It holds an in-memory flow table and uses a Redis cache to recover that table across restarts. The architecture works because the protocol can rebuild the table from the ufrag, but the soft state is still a state.

*   Lastly, the ufrag trick depends on controlling both ends of signaling. OpenAI generates the server-side ufrag, so they can embed routing metadata in it freely. A team that uses an off-the-shelf signaling stack might find this technique harder to adapt directly.

The architecture OpenAI built for voice AI is a careful response to a specific pressure. WebRTC was designed for stable servers. Modern cloud infrastructure runs on the opposite assumption. OpenAI’s team had the protocol depth to determine whether a WebRTC session needs to live in one process at all.

Their answer separates the work into two pieces. A stateless relay forwards packets near the user. A stateful transceiver, anchored in one place, owns ICE, DTLS, SRTP, and the session lifecycle. The two pieces communicate through information that’s already in the WebRTC handshake, which keeps the routing decision on the packet path itself.

The implementation choices stayed deliberately simple. Userspace Go, SO_REUSEPORT, thread pinning, and careful memory management did the work that kernel bypass solves. The result handles 900 million weekly users on a relatively small relay footprint.

**References:**

*   [How OpenAI delivers low-latency voice AI at scale](https://openai.com/index/delivering-low-latency-voice-ai-at-scale/)

