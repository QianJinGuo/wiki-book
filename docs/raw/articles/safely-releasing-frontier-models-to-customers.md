---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/safely-releasing-frontier-models-to-customers
ingested: 2026-07-05
feed_name: AWS China ML
source_published: 2026-07-01
sha256: 2889944d36f509d3bff24393909b6c1acf3050e6b1c89bde9c00ab0bc0140699
---

# Safely Releasing Frontier Models to Customers

It’s our goal for AWS to be the most secure place to run any workload, and in support of that we’ve been deeply investing in security across our services since AWS’s inception more than two decades ago. Our AI services like Amazon Bedrock are built on this foundation and with the same focus. Bedrock provides customers with world-class performance, security and privacy as well as the broadest selection of models available anywhere. Last year we launched Bedrock Mantle with [industry-leading privacy](<https://aws.amazon.com/blogs/machine-learning/exploring-the-zero-operator-access-design-of-mantle/>) and protection for model weights. We regularly hear from customers that they want access to the latest models as quickly as possible after they’re released and Bedrock delivers this for them along with the enterprise features that customers expect from AWS. We are excited that Anthropic’s Claude Fable 5 models are available again to our customers on Bedrock, and that they feature even stronger guardrails to prevent misuse.

When releasing models, we consider not only our responsibilities to our customers, but to the Internet and society as a whole. The most recent generation of frontier models, such as Anthropic’s Claude Mythos have powerful new capabilities, particularly in the area of cybersecurity. We’ve been able to experience this first hand as part of Project Glasswing and we’re eager to get Mythos-class models into the hands of defenders. As defenders, we have the opportunity to use these models to make the systems on which we all depend materially more secure. But as we do, we must also ensure that we don’t also give our adversaries meaningfully advanced visibility and capabilities, without giving companies, governments, and academic institutions the opportunity to protect their assets first. Striking this balance is a key challenge for broad model release, which is why we’ve been working closely with Anthropic and other industry partners in Project Glasswing to refine the guardrails for this new class of models. We all agree that preventing adversaries from gaining access to the ability to do deep vulnerability research is the most important objective for these guardrails.

This is also an exciting time for AI, with new capabilities being delivered almost daily. We believe that making the capabilities of these advanced models available to all customers in a secure, privacy preserving environment is critical to ensuring that they can get the many benefits without creating security risks. It’s important that new guardrails continue to be developed as we learn more about how well the current ones are working and as new models get released. We’re going to keep iterating with our partners, delivering more value, and being responsive to changes in the industry.

It’s equally important to make sure any issues with these models after they are released get addressed appropriately. Anthropic has published a blog, [Redeploying Fable 5](<https://www.anthropic.com/news/redeploying-fable-5>), that explains how they’re thinking about the capabilities of this new class of models, and their commitments and SLAs for responding to issues that are reported to them. We appreciate Anthropic’s transparency and collaboration in articulating this first structure for issue severity and response for cyber-capable models, and we look forward to the ongoing conversation across our industry as we learn and refine it.

Our AI Red Team has worked with Anthropic to further improve Fable’s protections, and we believe its latest guardrails result in a very capable model that further minimizes the risk of misuse by adversaries. It delivers on the promise of much stronger reasoning capabilities in most domains, without giving adversaries significant new security capabilities. When the guardrails are triggered, it automatically falls back to Opus 4.8, itself a world-class model that is already publicly accessible.

We appreciate Anthropic’s partnership and commitment to defenders, and look forward to working with them and the rest of the industry to continue to make frontier models available safely and securely.

* * *

## About the author

### Amy Herzog

Amy Herzog is Vice President and Chief Information Security Officer (CISO) at Amazon Web Services (AWS) where she leads a global organization of cloud security professionals in a company in which security is the top priority. Prior to joining AWS, Amy served as CISO for Amazon’s Devices and Services, Media and Entertainment, and Advertising businesses, overseeing the security of consumer technology offerings such as Alexa+ and Ring, and playing a key role in the secure development of Project Kuiper, Amazon’s initiative to provide fast, reliable broadband to customers and communities around the world through low earth orbit satellites.
