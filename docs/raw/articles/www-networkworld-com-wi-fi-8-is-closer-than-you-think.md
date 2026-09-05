---
source: newsletter
source_url: https://www.networkworld.com/article/4170841/wi-fi-8-is-closer-than-you-think-heres-what-you-need-to-know.html
tags: [networkworld]
review_value: 8
review_confidence: 8
review_recommendation: strong
review_stars: 4
ingested: 2026-05-14
sha256: 7a328ecb9c44f19d24de80c9b1916f55e8d082a347d3546b99889d845d27354d
---
Title: Wi-Fi 8 is closer than you think. Here’s what you need to know
URL Source: http://www.networkworld.com/article/4170841/wi-fi-8-is-closer-than-you-think-heres-what-you-need-to-know.html
Published Time: 2026-05-13T14:29:28-05:00
Markdown Content:
Wi-Fi 8 is still a couple of years away from broad enterprise deployment, but the work underway in the [IEEE](https://www.ieee.org/) and silicon ecosystems will shape wireless LAN design for the next decade. For network engineers, Wi-Fi 8 is more than “Wi-Fi 7, but faster.” It’s a reliability-driven release that begins to turn access points into an edge AI compute platform.
## From speed to reliability
Wi-Fi was a major topic at [Extreme Connect](https://www.extremenetworks.com/extremeconnect), Extreme Networks’ flagship user event. David Coleman, arguably one of the most knowledgeable people in the Wi-Fi industry, led a session titled “Beyond Connectivity: The Next Era of Enterprise Wi-Fi” to educate attendees on what to expect as Wi-Fi moves to version 8.
In his session, Coleman positioned Wi-Fi 8 (based on 802.11bn, branded Ultra High Reliability) as a pivot away from pure-throughput marketing. The technical targets include a 25% increase in throughput (rate over range), a 25% reduction in latency spikes, and roughly 25% lower packet loss. In other words, it’s about fewer dropped Zoom calls, smoother video, and consistent experiences at the edge, not just headline PHY rates.
“This is all about reliability and a little bit about latency,” summed up Coleman, who is Extreme’s director of wireless networking at the office of the CTO.
This shift is important for the continued growth of Wi-Fi. The technology is widely available and easy to use, but its reliability makes it less than ideal for bandwidth-rich applications. Wi-Fi has lacked predictable behavior under load, during roaming, and at cell edges.
## Smarter spectrum efficiency
Wi‑Fi 8 introduces several mechanisms to extract more value from the existing spectrum rather than simply widening channels. Many of these will be mandatory on the AP side in the 5 GHz and 6 GHz bands.
Key attributes include:
*   Non-primary channel access: An AP on an 80 MHz channel can selectively ignore a busy primary 20 MHz channel if only that slice is occupied by a neighbor and instead transmit on cleaner secondary channels. This improves efficiency in dense deployments where primary channels are perpetually noisy due to management traffic.
*   Dynamic sub-band operation: When the AP detects many 20 MHz-only clients (typical of IoT devices), it can partition a larger channel into multiple 20 MHz sub-bands and serve several of them simultaneously.
*   Dynamic bandwidth operation (optional): If a neighboring AP isn’t using part of an adjacent channel, a Wi‑Fi 8 AP could temporarily “borrow” that spectrum, expanding the bandwidth from, say, 80 MHz to 120 MHz for a transmission. This is advanced, math‑intensive silicon, so Coleman is cautious: “I hope this feature works, but I have my doubts about the first generation.”
The net for engineers: Channel plans will matter even more, and RF design tools will need to understand these new behaviors to accurately model airtime and interference.
## Roaming and mobility improvements
Roaming remains a pain point for real-time applications, and Wi-Fi 8 addresses it from multiple angles.
The most transformative concept is seamless mobility domain (SMD) roaming. Instead of associating with a single AP, a client associates with a domain of APs, establishes security keys for all of them, and then roams among them without repeating the four-way handshake. To the client, roaming within that domain becomes effectively hitless — “almost like a completely seamless bus ride,” as Coleman described it.
To support this, Wi-Fi 8 makes a robust, secure network (RSN) override mandatory. This mechanism advertises baseline security information that legacy clients can understand, along with richer elements for WPA3-capable devices. This is critical for coexistence, particularly in brownfield environments where, as Coleman quipped, “we’re still going to have IV pumps from 2002 using TKIP (Temporal Key Integrity Protocol).”
There’s also a roaming-related feature that’s likely to be popular with client vendors: bounded ESS (Extended Service Set) scanning. APs can instruct clients to scan only specific channels, dramatically reducing battery-draining probe activity. This applies not only in enterprise settings but also at hotspots: A handset tethering as a Wi-Fi hotspot can tell associated clients not to roam, further conserving their battery life while connected.
## Reliability via new MCS rungs
The reliability feature Coleman expects to deliver the most immediate value is a new set of MCS (modulation and coding scheme) rates. Instead of chasing higher order constellations, Wi-Fi 8 introduces additional lower-order modulation and coding steps at carefully chosen SNR (signal-to-noise ratio) thresholds.
Today’s rate adaptation often involves large jumps down the data-rate ladder as a client moves away from an AP, which can cause abrupt performance drops and choppy application behavior. By adding new intermediate MCS levels, Wi‑Fi 8 smooths that curve, so data rates decline more gradually as SNR falls.
## Power-saving and green Wi‑Fi
On the client side, Wi-Fi 8 introduces dynamic power-save modes in which a client idles in a low-capability profile—1×1 radio, 20-MHz channel, low MCS—and then temporarily powers up to full capability when the AP sends a trigger indicating that buffered data is available. This continues the long line of power‑save refinements aimed at extending device battery life.
In parallel, vendors are developing proprietary AP-side energy-saving features that align with aggressive European requirements. Coleman described ideas such as using light sensors in APs to detect when lights are off, then dynamically dropping from 4×4 MIMO to 1×1 to reduce power draw, coupled with reporting kilowatt-hours saved, carbon reduction, and real dollar amounts. While not part of the standard, these features will be increasingly prominent in RFPs and may affect how you dimension PoE budgets and power domains.
## New security pressures
Wi‑Fi 8 continues the march toward stronger defaults. WPA3 will be mandatory, and management frame protection will be enhanced, along with new protections for control frames used in multi‑AP features. There is also adjacent work in 802.11bis to standardize MAC randomization for privacy.
Coleman also highlighted a looming challenge: post-quantum cryptography. Quantum-capable adversaries could capture today’s encrypted Wi-Fi traffic and store it, then decrypt it years later once algorithms such as those used in TLS key exchanges become breakable. Task groups such as 802.11bt and others are investigating how to future-proof Wi-Fi security exchanges, and these efforts will eventually filter into Wi-Fi 8-era products through new cipher suites and key-establishment methods.
## Wi‑Fi sensing and enhanced broadcast
Two newer application domains intersect with Wi‑Fi 8 capabilities and silicon:
*   Wi‑Fi sensing uses channel state information (CSI). APs can detect motion as radio waves bounce off people and objects, enabling fall detection, occupancy analytics, and smart‑building automation. Coleman expects that “starting with Wi‑Fi 8, we think this technology is going to start being embraced more in the enterprise,” potentially with both APs and clients contributing CSI to improve accuracy.
*   Enhanced broadcast services (802.11bc) will allow APs to send higher-rate broadcast data to associated and unassociated clients within range, even without captive portals or internet connectivity. Use cases include stadium stats and offers, retail promos, and, critically, public safety alerts in areas with weak cellular coverage. Japan’s government is already exploring this for emergency notifications.
## Edge AI in the access point
The most disruptive change may not be in the 802.11 standard text but in what silicon vendors are baking into Wi‑Fi 8 chipsets. Broadcom and others plan to integrate AI/ML neural processors directly into the AP’s baseband hardware.
Coleman described a two-phase evolution. First, vendors will use on-board AI to differentiate Wi-Fi performance, for example, by creating smarter OFDMA schedulers that could improve effective throughput by 20% or more. Second, APs will become an edge AI compute platform that customers can leverage for their own analytics and applications across a building or campus, potentially even running small language models per AP or distributing larger models across many APs.
“Forget about Wi‑Fi—now you have an edge AI compute platform,” he said. That repositions WLANs as a programmable fabric for AI workloads, not just a transport for them.
## How network engineers should prepare
Given this trajectory, here are concrete steps to take now so you’re ready when Wi‑Fi 8 arrives in the 2027–2028 enterprise window.
#### Double down on 6 GHz and standard power
*   Accelerate your 6 GHz strategy and experiment with standard-power indoor deployments where regulations allow, even though adoption is only about 5% today.
*   Coleman stressed that customers want one-for-one AP replacements, but low-power indoor (LPI) often requires ~20% more APs due to the shorter 6 GHz range; standard power plus AFC can enable closer to 1:1 mapping. Build operational competence now with AFC, GPS/coordinate workflows, and tools to automate AP geolocation.
#### Clean up security and segmentation
*   Move critical SSIDs to WPA3 and management frame protection ahead of Wi‑Fi 8, at least in 5/6 GHz, so you’re not facing a massive transition all at once when WPA3 becomes table stakes.
*   Where legacy devices force you to keep WPA2/TKIP, isolate them on dedicated SSIDs and VLANs.
#### Evolve your roaming design
*   Start thinking in terms of “mobility domains” instead of just coverage cells. Logical groupings of 3–5 APs in key areas (voice, clinical, industrial) are natural candidates for SMD roaming once it arrives.
*   Work with your WLAN vendor on roadmap visibility: Will SMD roaming be in their first-generation Wi-Fi 8 silicon, and how will controllers/cloud orchestrate those domains?
#### Plan PoE and power with AI in mind
*   Expect Wi-Fi 8 APs to draw more power due to integrated AI silicon, even if chipset vendors are optimistic today. Audit your switches and PoE budgets now, especially in older closets.
*   At the same time, evaluate vendors’ energy-efficient capabilities—dynamic MIMO chains, sensor-driven power-downs, and reporting on energy and carbon savings—so you can meet sustainability requirements without unexpected upgrades.
#### Build an edge‑AI story with facilities and apps teams
*   Engage OT, building management, and application teams to discuss what they could do with occupancy analytics, Wi‑Fi sensing, and localized AI inference at the AP layer.
*   Treat your future Wi‑Fi 8 refresh not just as an RF upgrade but as an edge‑compute rollout. Inventory potential use cases: fall detection in healthcare, smart HVAC and lighting, retail engagement, or security analytics that integrate Wi‑Fi sensing with cameras.
Wi‑Fi 8 won’t be a single, overnight cutover. It will be a rolling “ultra‑reliability” wave layered on top of the 6 GHz and WPA3 foundations you’re building now. As Coleman put it, the industry’s next paradigm shift isn’t just more spectrum—it’s transforming the AP from a connectivity box into a distributed edge AI platform. The engineering teams that start designing and budgeting for that reality today will be best positioned when the Wi‑Fi 8 logo finally appears in the datasheets.
![Image 1: Extreme Connect David Coleman](https://b2b-contenthub.com/wp-content/uploads/2026/05/IMG_3179.jpg?quality=50&strip=all)
David Coleman speaks at Extreme Connect 2026. Coleman is the director of wireless networking in the office of the CTO at Extreme Networks.
Zeus Kerravala
SUBSCRIBE TO OUR NEWSLETTER
### From our editors straight to your inbox
Get started by entering your email address below.