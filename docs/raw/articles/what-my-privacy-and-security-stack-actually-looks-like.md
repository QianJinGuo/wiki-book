---
title: "What My Privacy and Security Stack Actually Looks Like"
source_url: https://blog.yaelwrites.com/what-my-privacy-and-security-stack-actually-looks-like/
author: Unknown
publish_time: 2026-06-02
ingested: 2026-06-02
sha256: bb8020b2459ffdcf
tags: [newsletter]
review_value: 7
review_confidence: 8
review_stars: 4
---

# What My Privacy and Security Stack Actually Looks Like

Published Time: 2026-05-27T14:31:01.000Z

Markdown Content:
A colleague recently asked what tools and practices I use for my own privacy and security. Not recommendations; they get plenty of those from me already, complete with caveats and breakdowns of the benefits and drawbacks of all the different options. They wanted to know what I actually do. So I wrote it up, and figured it was worth putting here too.

This isn't a guide. Your situation is different from mine. But sometimes it's useful to see what someone else's setup looks like in practice.

## Vibes First

Probably the most important thing I do is pay attention to how I feel in a given situation. If I feel pressured to meet up with someone when I'm exhausted, share information I'm uncomfortable sharing, use an app with sketchy permissions, or do anything where the ask feels off, I don't do it.

This is hard to quantify, but it's probably the most important thing in this list.

When an email or message seems urgent, that urgency is itself the red flag. I'll verify through a separate channel before doing anything. (We all fail at this from time to time, and there are systemic issues at play, but it's still important to do our best here.)

## Places to Go and People to See

Before meeting someone new, I try to make sure they don't have a documented history of being dangerous. It's something I got in the habit of when doing a lot of one-on-one interviews. Sometimes I'll do a quick online search, or I may ask around. We can't always know what we're walking into (or choose what to not walk into), but we can give it our best shot.

Regardless of what I find, I'll meet in public, bring people if the situation warrants it, and make sure someone knows where I'll be and when they should expect to hear from me. If I'm at an event and someone suggests going off-site and I decide it's fine to go, I'll grab my nearest friend or send a [**Signal**](https://signal.org/?ref=blog.yaelwrites.com) message to the ad hoc conference group chat with my location, asking people to swing by. It seems like an unnecessary precaution but it's one that has come in useful the few times I've needed it.

A few habits I've built around photos and venues: I rarely post while I'm still at an event. I'll make exceptions if I've already announced I'll be there, the venue is extremely crowded, I'm with a large group, or I'm sharing with a limited audience.

I also avoid venues with always-on streaming cameras. Yes, even if it's that really cool hacker space.

## My Address

If I'm not yet comfortable having someone (and everyone within earshot) at my home, I'm vague when I'm asked where I live, even if hedging about my cross streets comes across as awkward. In general, I also try to be careful about what information I volunteer and to whom (again, including anyone in earshot). Often these are risks I'm fine taking because I love talking to people about things that matter. Other times, it's not worth the risk.

I use a PO Box instead of my home address whenever possible, including with clients. Of the 996 invoices I've sent, exactly one went to someone I later wished didn't know where I lived. One is enough.

I also actively scrub my home address from the internet [**using the guide I maintain**](https://github.com/yaelwrites/big-ass-data-broker-opt-out-list?ref=blog.yaelwrites.com), supplemented by a paid service. I've used [**EasyOptOuts**](https://easyoptouts.com/?ref=blog.yaelwrites.com) for years because it's effective and affordable.

When something surfaces in search results, I'll use Google's suppression tools to request its removal, which sometimes works. Not always.

## Privacy, Please

I've lost count of the number of people I've overheard having loud, detailed conversations about very private things, or seen reviewing sensitive documents in airports and coffee shops.

I use **a magnetic privacy screen** when I need to look at financial documents in public, and I don't take important calls in public. When I'm in semi-public (like a phone booth at a coworking space), I use headphones for sensitive calls.

These feel like obvious precautions, and yet.

I delete unused accounts. Even when I keep accounts I don't use, I try to delete old information that doesn't need to be up for everyone forever. (I still have social media accounts I don't feel great about, but we all have to start somewhere.)

I used [**Cyd**](https://cyd.social/?ref=blog.yaelwrites.com)to delete my old tweets and got off Twitter/X completely, though I still keep my account there to prevent imposters/hijackers. (Disclosure: I'm a member of the [Lockdown Systems](https://lockdown.systems/?ref=blog.yaelwrites.com) collective; we work on Cyd and other tools.)

## Device Hygiene

My hard drive is encrypted. I run backups regularly. I keep my software updated as soon as updates are available. When feasible, I avoid biometrics (again, due to my specific threat model).

I review app permissions on my phone and laptop periodically and revoke anything that doesn't have a clear reason to be there, including location access for apps that don't need it to function. I turn off ad tracking and turn on auto-updates.

I use locked folders or hidden albums for sensitive images, and I use[**iVerify**](https://iverify.io/?ref=blog.yaelwrites.com) for device security checks. (Disclosure: I did a project for them once! But I loved the app and recommended it even before that.)

## Passwords & Authentication

I think passkeys are revolutionary, but I'm old school and still prefer physical security keys. I have three [**YubiKeys**](https://www.yubico.com/products/?ref=blog.yaelwrites.com). You need at least one backup. This is not optional.

I use a password manager. Actually, I use two: [**1Password**](https://1password.com/?ref=blog.yaelwrites.com) and [**Bitwarden**](https://bitwarden.com/?ref=blog.yaelwrites.com). Clients occasionally share vaults.

When passkeys or security keys aren't an option for MFA, I use an authenticator app. Right now that's [Authy](https://www.authy.com/?ref=blog.yaelwrites.com), though I'll be honest: I haven't done a rigorous evaluation of alternatives in a long time.

If an authenticator app isn't an option, I'll choose email MFA over SMS.

## Browsing

I use a VPN occasionally, when I don't want my IP address logged by a specific site but don't particularly mind if my ISP has it. I use [**Mullvad**](https://mullvad.net/en?ref=blog.yaelwrites.com).

I run [**Privacy Badger**](https://privacybadger.org/?ref=blog.yaelwrites.com) to block trackers and [**uBlock Origin**](https://ublockorigin.com/?ref=blog.yaelwrites.com) to block ads on whichever browser doesn't already have blocking built in. I rotate between several browsers, which I realize is its own kind of choice. (Lately I've been super into DuckDuckGo, but I don't think I could ever give up Chrome, Firefox, or even Tor entirely. And Safari is underrated...) I avoid AI-based browsers, and in general giving AI access to too much information.

## Source Protection

There are things I simply don't write down.

I also use Google's [**Advanced Protection Program**](https://landing.google.com/intl/en_in/advancedprotection/?ref=blog.yaelwrites.com) and have my Apple devices on [**Lockdown Mode**](https://support.apple.com/en-us/105120?ref=blog.yaelwrites.com).

Deciding whether to store data on an encrypted drive or in the cloud depends on the story and situation, but it's often best to keep things local.

For high-risk projects, I recommend dedicated devices (yes, including Chromebooks), and I also recommend not traveling with them.

## Payments

I pay with a credit card whenever possible, which offers better fraud protection and keeps some distance between vendors and my actual bank account.

I avoid cash, Zelle, or Venmo with people I don't know. I don't use cryptocurrency.

I also keep my credit frozen.

None of this is particularly exciting, but it's all been worth doing.

## Communications

I use Signal with disappearing messages for most communication.

On video calls, I pay close attention to which transcription tools are running and avoid discussing sensitive topics if they are.

I use Google Fi for SIM-swap protection, partly because it's tied to my Google account, which is covered by Advanced Protection.

When I need to sign up for something without using my real email address, I use iCloud's Hide My Email to generate an alias.

I use [**HaveIBeenPwned**](https://haveibeenpwned.com/?ref=blog.yaelwrites.com) to monitor for account compromises. For anything flagged, I either delete the account or update the credentials.

I try to stay current on new security risks through a mix of Slack, Discord, and Signal groups, plus social media (mostly LinkedIn, Mastodon, and Bluesky). A lot of this goes beyond what's needed for my own physical and digital security, as I really like to get to the root of things.

I regularly read sites like The Verge, 404 Media, and Wired, and Zack's[**This Week in Security**](https://this.weekinsecurity.com/?ref=blog.yaelwrites.com) newsletter. I listen to podcasts whenever I can; favorites in this space include [**The Three Buddy Problem**](https://securityconversations.fireside.fm/?ref=blog.yaelwrites.com) and [**Security, Cryptography, Whatever**](https://securitycryptographywhatever.com/?ref=blog.yaelwrites.com).

Lately I've been reading through [**Tate's Online Safety Substack**](https://onlinesafety.substack.com/?ref=blog.yaelwrites.com) and finding a lot of great tips I hadn't thought of in my 12 years of covering privacy and cybersecurity. (For those of us who try to avoid Substack, there are great [summaries on LinkedIn](https://www.linkedin.com/in/tatejarrow/?ref=blog.yaelwrites.com) as well.)

Last but not least, I pay attention to what nonprofits are posting, too--especially [**EFF**](https://www.eff.org/?ref=blog.yaelwrites.com), [**EPIC**](https://epic.org/?ref=blog.yaelwrites.com), [**IWMF**](https://www.iwmf.org/?ref=blog.yaelwrites.com), and [**PEN America**](https://pen.org/?ref=blog.yaelwrites.com).

## Bottom Line

None of this is comprehensive, and I update it as my situation and the threat landscape change. The goal is reducing unnecessary exposure without making my life unworkable. So far that balance feels about right.

What does your stack look like? I'm always curious what other people are actually doing, as opposed to what they think they should be doing.
