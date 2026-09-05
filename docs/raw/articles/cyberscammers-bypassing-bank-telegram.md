---
title: "Cyberscammers are bypassing banks’ security with illicit tools sold on Telegram"
source_url: https://www.technologyreview.com/2026/04/15/1135898/cyberscammers-bypassing-bank-telegram
author: Unknown
publish_time: 2026-06-02
created: 2026-06-02
updated: 2026-06-02
ingested: 2026-06-02
sha256: 22e2a8cca65e31ba42aa33f7b4e02f4a845ec65c77ff6a566e3645f2e9815d4f
tags: [newsletter, security]
---


Published Time: 2026-04-15T07:26:12-04:00

Markdown Content:
From inside a money-laundering center in Cambodia, an employee opens a popular Vietnamese banking app on his phone. The app asks him to upload a photo associated with the account, so he clicks on a picture of a 30-something Asian man.

Next, the app requests to open the camera for a video “liveness” check. The scammer holds up a static image of a woman bearing no resemblance to the man who owns the account. After a 90-second wait—as the app tells him to readjust the face inside the frame—he’s in.

The exploit he’s demonstrating, in a video shared with me by a cyberscam researcher named Hieu Minh Ngo, is possible thanks to one of a growing range of illicit hacking services, readily available for purchase on Telegram, that are designed to break “Know Your Customer” (KYC) facial scans.

These banking and crypto safeguards are supposed to confirm that an account belongs to a real person, and that the user’s face matches the identity documents that were provided to open the account**.**But scammers are bypassing them in order to open mule accounts and launder money. Rather than using a live phone camera feed for a liveness check, the hacks typically deploy a tool known as a virtual camera. Users can replace the video stream with other videos or photos—depicting a real or deepfake person or even an object.

As financial institutions enact enhanced security measures aimed at stopping cyberscammers, these workarounds are the latest round in the cat-and-mouse game between criminal operators and the financial services industry**.**

Over the course of a two-month investigation earlier this year, _MIT Technology Review_ identified 22 Chinese-, Vietnamese-, and English-language public Telegram channels and groups advertising bypass kits and stolen biometric data. The software kits use a variety of methods to compromise phone operating systems and banking applications, claiming to enable users to get around the compliance checks imposed by financial institutions ranging from major crypto exchanges such as Binance to name-brand banks like Spain’s BBVA.

“Specializing in bank services—handling dirty money,” reads the since-deleted Telegram bio of the program used by the Cambodian launderer, complete with a thumbs-up emoji. “Secure. Professional. High quality.” Some of the channels and groups had thousands of subscribers or members, and many posted bullet points listing their services (“All kinds of KYC verification services”; “It’s all smooth and seamless”) alongside videos purporting to show successful hacks.

Telegram says that after reviewing the accounts, it removed them for violating its terms of service. But such online marketplaces proliferate easily, and multiple channels and groups advertising similar tools remain active.

### **Banks and butchers**

The rise in KYC bypasses has occurred alongside an expansion of a global industry in “pig-butchering” cyberscams. Crypto platforms and banks around the world are facing increasing scrutiny over the [flow](https://www.nytimes.com/2025/11/17/technology/crypto-exchanges-dirty-money.html) of illegally obtained money, including profits from such scams, through their platforms. This has prompted tightened banking regulations in countries such as [Vietnam](https://www.dfdl.com/insights/legal-and-tax-updates/vietnam-tightens-anti-money-laundering-framework/) and [Thailand](https://www.tilleke.com/insights/thailand-issues-mandatory-guidelines-enhancing-digital-fraud-controls/57/), where governments have increased customer verification and fraud monitoring requirements and are pushing for stronger anti-money-laundering safeguards in the crypto industry.

Chainalysis, a US blockchain analysis firm, [estimates](https://www.chainalysis.com/blog/crypto-scams-2026/) that around $17 billion was stolen in 2025 in crypto scams and fraud, up from $13 billion in 2024. The United Nations Office on Drugs and Crime, meanwhile, [warned](https://www.unodc.org/roseap/uploads/documents/Publications/2025/Inflection_Point_2025.pdf) in a recent report that the expansion of Asian scam syndicates in Africa and the Pacific has helped the industry “dramatically scale up profits.”

That combination of factors—more scrutiny, but also more revenue—has vaulted KYC bypasses to the center of the online marketplace for cyberscam and casino money launderers. Although estimates vary, cybersecurity researchers say these kinds of attacks are rising: The biometrics verification company iProov [estimated](https://www.iproov.com/reports/threat-intelligence-report-2025-remote-identity-attack/) that virtual-camera attacks were more than 25 times as common worldwide 2024 than in 2023, while Sumsub, a company providing KYC services, [reported](https://sumsub.com/fraud-report-2025/) that “sophisticated” or multi-step fraud attempts, including virtual-camera bypasses, almost tripled last year among its clients.

Three financial institutions that were named as targets on such Telegram channels—the world’s largest crypto exchange, Binance, as well as BBVA and UK-based Revolut—told me they’re aware of such bypasses and emphasize that they’re an industry-wide challenge. A spokesperson from Binance said it has “observed attempts of this nature to circumvent our controls,” adding that “we have successfully prevented such attacks and remain confident in our systems.” BBVA and Revolut also declined to comment on whether their safeguards had been breached.

It’s difficult to estimate success rates, because companies may not be aware of bypasses—or report them—until later. “What’s important is what we don’t see,” Artem Popov, Sumsub’s head of fraud prevention products, told me, referring to attacks that go undetected. “There’s always part of the story where it might be completely hidden from our eyes, and from the eyes of any company in the industry, using any type of KYC provider.”

### **How criminals navigate a compliance maze**

Advertisements for the exploits appear simple enough, but on the back end, building a successful bypass is complex and often involves multiple methods. Some channels offer to jailbreak a physical phone so that scammers can trigger the use of a virtual camera (VCam) instead of the built-in one whenever they’d like. Other hacks inject code known as a “hooking framework” into a financial institution’s app that triggers the VCam to open. Either way, VCams can be used to dupe KYC safeguards with images or videos that replace genuine, live video of the account’s owner**.**

Sergiy Yakymchuk, CEO of Talsec, a cybersecurity company that primarily serves financial institutions, reviewed details from the Telegram channels identified by _MIT Technology Review_ and says they are consistent with successful tactics used against his banking and crypto clients. His team received help requests from banks and exchanges for roughly 30 VCam-based hacks over the past year, up from fewer than 10 in 2023.

Increasingly, hackers compromise both the phone itself and the code of the financial institutions’ apps before feeding the virtual camera a mix of stolen biometrics and deepfakes, Yakymchuk says.

“Some time ago, it was enough to decompile the app of a bank and distribute this on Telegram, and that was everything you needed,” he says. “Now it’s not enough, because you have KYC—and more and more things are needed.”

For money launderers,KYC bypasses have “become essential for everything right now—because scam compounds need to move money,” says Ngo, the researcher who shared the demo video. A convicted former hacker who became a cybersecurity advisor for the Vietnamese government, Ngo now runs an anti-scam nonprofit and helps law enforcement investigate money laundering.

He describes how the process works in the case of pig-butchering scams: Funds originating with victims are received into bank accounts controlled or rented by a money-laundering network, known colloquially as “[water houses](https://globalchinapulse.net/moving-bricks-money-laundering-practices-in-the-online-scam-industry/).” Money launderers use KYC bypasses to access the accounts and quickly redistribute the profits before converting them into digital assets—typically in the form of the stablecoin Tether, a type of cryptocurrency that is pegged to the US dollar.

These transactions often happen in seconds, under tightly orchestrated management. “They know, very clearly, the flow of how the banks verify or authenticate accounts,” Ngo says.

### **A cat-and-mouse game**

The growth of cyberscam money laundering has led to heightened scrutiny of financial institutions. In 2023, Binance [pleaded guilty](https://www.justice.gov/archives/opa/pr/binance-and-ceo-plead-guilty-federal-charges-4b-resolution) in US federal courts to operating without anti-money-laundering safeguards. Donald Trump [pardoned](https://www.theguardian.com/technology/2025/oct/23/binance-trump-pardon-changpeng-zhao) former Binance CEO Chaopeng Zhao last October.

Recent [analysis](https://www.icij.org/investigations/coin-laundry/cryptocurrency-exchanges-binance-okx-money-laundering-crime/) from the International Consortium of Investigative Journalists found that after Zhao’s guilty plea, more than $400 million continued to move to Binance from Huione Group, a Cambodia-based firm that the US sanctioned after the Treasury Department [deemed](https://home.treasury.gov/news/press-releases/sb0278) it a “critical node” for money laundering in pig-butchering scams.

Binance says it has “state-of-the-art security systems” that prevented billions in fraud losses and that the company processed more than 71,000 law enforcement requests in 2025.

But John Griffin, a finance and blockchain expert at the University of Texas at Austin, does not think the exchanges are sufficiently secure. “Even though they have all this press about ‘Oh, yes, we’ve changed this and that’—well, the proof is in the pudding. The criminals are still using your exchange,” Griffin told me of the industry at large. “So there must be holes.” (Binance says it “objects to the dubious findings” of Griffin’s [work](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4742235) tracking the flow of criminal profits across exchanges like Binance, Huobi, OKX, and Tokenlon, calling it “misleading at best and, at worst, wildly inaccurate.”)

Binance also pointed out that some purported bypass services are themselves scams, casting doubt on whether successful bypasses are as widespread as the Telegram marketplace may suggest. Engaging with such services “exposes individuals to significant security risks,” a spokesperson said. “Even where access appears to be granted, accounts are often already restricted by internal detection and compliance controls, rendering them nonfunctional for trading or withdrawals.”

Regulators around the world are trying to catch up. In Thailand, where citizens’ bank accounts regularly serve as money mules for cyberscams based in neighboring Myanmar and Cambodia, new legislation has [enhanced](https://www.tilleke.com/insights/thailand-issues-mandatory-guidelines-enhancing-digital-fraud-controls/15/) KYC monitoring, limited daily transactions, and [strengthened](https://www.tilleke.com/insights/thailand-amends-emergency-decree-on-technology-crime/38/) oversight bodies’ ability to suspend accounts. The US money-laundering regulator, the Financial Crimes Enforcement Network, issued a [warning](https://www.fincen.gov/system/files/shared/FinCEN-Alert-DeepFakes-Alert508FINAL.pdf) against KYC deepfakes and the use of VCams in late 2024, encouraging platforms to track broader transaction patterns to identify money laundering.

For scammers, any new security or reporting requirements will make bypasses harder, but “it’s not going to stop them,” Ngo says. “It’s just a matter of time.”

