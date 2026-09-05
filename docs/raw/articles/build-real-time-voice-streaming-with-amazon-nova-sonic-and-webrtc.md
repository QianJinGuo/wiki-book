---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/build-real-time-voice-streaming-applications-with-amazon-nova-sonic-and-webrtc/
feed_name: AWS China ML
title: "Build real-time voice streaming applications with Amazon Nova Sonic and WebRTC"
sha256: ac8379e9f763f4957fdf3e91926c310c9eece57b8c5000ec94ca315b9b151b2b
created: 2026-05-14
updated: 2026-05-14
review_value: 7
review_confidence: 8
review_recommendation: neutral
ingested: 2026-05-16
review_stars: 3
tags: [aws, machine-learning, llm]
---
# Build real-time voice streaming applications with Amazon Nova Sonic and WebRTC
Build real-time voice streaming applications with Amazon Nova Sonic and WebRTC | Artificial Intelligence Skip to Main Content Artificial Intelligence Build real-time voice streaming applications with Amazon Nova Sonic and WebRTC Building end-to-end live streaming applications with real-time voice interaction presents several challenges: network bandwidth constraints can cause high latency and quality degradation in time-critical applications.
Language barriers limit effective human-machine interaction in multilingual voice communication.
Scalability and resilience require a difficult balance between performance and infrastructure costs.
Cross-browser and mobile compatibility demands significant development effort, especially for startups.
This post introduces a solution based on Amazon Nova 2 Sonic (Nova Sonic) and Amazon Kinesis Video Streams WebRTC (WebRTC) that addresses these challenges.
WebRTC is responsible for dynamically adjusting the bitrate in unstable networks, which helps to maintain audio quality while reducing dropped connections.
Nova Sonic provides effective human language dialogues, so users can interact more naturally in their chosen language.
Both services are fully managed by AWS, so they scale automatically with high resilience.
AWS also provides open-source samples that you can use as a starting point for your own application.
In this post, we’ll walk through the solution architecture, implementation patterns, and two real-world scenario examples.
Nova Sonic and WebRTC Traditional voice agent pipelines typically involve separate modules for speech recognition, language processing, and speech synthesis.
Nova Sonic offers a unified speech-to-speech architecture that enables real-time voice conversations between users and AI agents with low latency.
With unified speech understanding and generation, Nova Sonic delivers natural, human-like conversational AI.
The Nova Sonic model provides different speaking styles and tool interfaces for external agents.
You can use it to build a more responsive and intuitive voice interface with higher contextual awareness.
A typical streaming pipeline comprises three main components: media source, media server, and media consumer.
The previous diagram shows these components and their respective protocols, such as RTMP, RTSP, HLS, MPEG-DASH, and WebRTC.
Web Real-Time Communication (WebRTC) is a public protocol that modernizes live streaming by providing real-time peer-to-peer direct connections without additional plugins or software installations.
This approach eliminates the need for intermediate servers and significantly reduces latency.
Among all media streaming protocols, WebRTC delivers the lowest latency, as shown in the following image.
WebRTC also includes built-in features like adaptive bitrate (ABR) streaming, forward error correction (FEC) , and jitter buffer management.
These features can automatically adjust the bandwidth consumption, and resolve packet loss or jitter issues in weak connectivity.
You can maintain fluent conversations even in poor network conditions.
WebRTC’s open-source nature and broad browser compatibility (Chrome, Firefox, Safari, Edge, Android, iOS, etc.) will accelerate solution adoption and encourage continuous improvement.
It is also well suited for real-time processing of media streams with AI functions.
Solution architecture You might want to deploy live streaming solutions with multilingual voice interaction for the following scenarios: Connected vehicles that assist drivers with real-time translation capabilities.
Smart factories that support cross-cultural operator communication through voice-activated quality control systems.
Robotics applications that provide multilingual customer service interactions.
Smart home devices that offer instant voice control in different languages, so that you can obtain global technical support through real-time audio translation and visual guidance.
The following diagram illustrates how to deploy Nova Sonic solution together with Kinesis Video Streams as a managed WebRTC service.