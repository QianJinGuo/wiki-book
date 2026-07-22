---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/improve-bot-accuracy-with-amazon-lex-assisted-nlu/
tags: [aws-china-blog, agentic-ai, context-engineering]
feed_name: AWS China ML
source_published: 2026-05-14T17:28:44Z
ingested: 2026-05-15
sha256: 414eb28f0ac8
---
# Improve bot accuracy with Amazon Lex Assisted NLU
Improving bot accuracy in Amazon Lex starts with handling how customers communicate naturally. Your customers express the same request in dozens of different ways, combine multiple pieces of information in one sentence, and often speak ambiguously. The [Assisted NLU](<https://docs.aws.amazon.com/lexv2/latest/dg/assisted-nlu.html>) (natural language understanding) feature in [Amazon Lex](<https://aws.amazon.com/lex/features/>) helps you improve bot accuracy by handling these natural language variations. Traditional natural language understanding systems struggle with this variability, which can lead customers to repeat themselves or abandon conversations.
**The challenge:** Rule-based NLU systems require developers to manually configure every possible utterance variation, a time-consuming task that still leaves coverage gaps. A hotel booking bot trained on “book a hotel” fails when your customers say, “I’d like to reserve accommodations for my trip.” Complex requests like “Book me a suite at your downtown Seattle location for December 15th through the 18th” often lose critical details (room type, location, dates). Ambiguous phrases like “I need help with my reservation” leave bots guessing whether customers want to book, view, modify, or cancel.
**The solution:** Amazon Lex Assisted NLU feature uses large language models (LLM) to understand natural language variations and improve bot accuracy. No manual configuration required. By combining traditional machine learning (ML) with LLMs, Assisted NLU handles how real customers communicate, creating natural conversational experiences that improve recognition accuracy.
Assisted NLU (including Primary mode, Fallback mode, and intent disambiguation) is included at no additional cost with standard Amazon Lex pricing.
In this post, you will learn how to implement Assisted NLU effectively. You will learn how to improve your bot design with effective intent and slot descriptions, validate your implementation using Test Workbench, and plan your transition from traditional NLU to Assisted NLU for both new and existing bots.
**Prerequisites** : This guide assumes that you’re familiar with Amazon Lex concepts including intents, slots, and utterances. If you’re new to Amazon Lex, start with the [Getting Started Guide](<https://docs.aws.amazon.com/lexv2/latest/dg/getting-started.html>).
## Introducing Assisted NLU
Amazon Lex Assisted NLU uses LLMs to enhance intent classification and slot resolution capabilities. It uses the names and descriptions of your intents and slots to understand user inputs. It handles typos, complex phrasing, and multi-slot extraction without requiring you to manually configure every variation. Amazon Lex Assisted NLU improves performance across natural language understanding tasks, achieving 92 percent intent classification accuracy and 84 percent slot resolution accuracy on average. With hundreds of active customers onboarded to Assisted NLU, customer feedback validates these improvements in real-world deployments. Customers have reported intent classification increases of 11–15 percent, 23.5 percent fewer fallback responses, and 30 percent better handling of noisy inputs. Early adopters have reported significant improvements in their conversational AI implementations, with several planning broader rollouts based on initial testing results.Assisted NLU operates in two modes:
  * **Primary mode** : Uses the LLM as the primary means of processing every user input
  * **Fallback mode** : Uses traditional NLU first, LLM invocation happens only when confidence is low or would route to FallbackIntent
You can enable Assisted NLU with a few selections in the Amazon Lex console. Navigate to your bot’s locale settings, toggle on Assisted NLU, select your preferred mode, and build your bot.
For detailed configuration instructions, API references, and step-by-step enablement guides, see [Enabling Assisted NLU](<https://docs.aws.amazon.com/lexv2/latest/dg/assisted-nlu.html>) in the Amazon Lex Developer Guide.
For programmatic configuration, refer to the [NluImprovementSpecification API reference](<https://docs.aws.amazon.com/lexv2/latest/APIReference/API_NluImprovementSpecification.html>).
## 1\. Best practices for Assisted NLU implementation
The following best practices will help you get the most out of Assisted NLU, covering mode selection, description writing, slot optimization, and intent disambiguation.
### 1.1 Operating modes: Primary vs. Fallback
Primary mode uses the LLM for every user input. Fallback mode uses traditional NLU first, LLM invocation happens only when confidence is low or would route to FallbackIntent.
**DO:**
  * Use Primary mode when building new bots or when you have limited (fewer than 20 sample utterances per intent) training data. 
    * Example: A healthcare bot handling appointment scheduling where patients say, `"I need to see someone about my knee"` or `"Book me with a cardiologist next week"` without needing extensive utterance engineering.
  * Use Fallback mode when you have existing bots that already perform well. 
    * Example: An established banking bot with 95% accuracy that occasionally fails on variations like `"What's my balance looking like?"` instead of `"Check balance"` where the LLM catches these edge cases.
  * Monitor the **_fulfilledByAssistedNlu_** metric in Amazon CloudWatch Logs to determine the right mode for your use case. If more than 30 percent of requests invoke the LLM in Fallback mode, consider switching to Primary for consistency.
**DON’T:**
  * Switch to Primary mode without A/B testing if you have a well-performing bot because you might introduce unnecessary latency without accuracy gains.
  * Assume one mode works for every use case because your specific data distribution and user language patterns determine the right mode.
### 1.2 Crafting effective intent descriptions
Intent descriptions are prompts to the LLM, not documentation for your team. They are the primary signal used for classification, and their quality directly determines accuracy, just as prompt quality determines LLM output quality. A consistent pattern delivers reliable results: `Intent to [action verb] [object/entity] [context/constraints]`
  * **“Intent to…”** anchors the description in purpose, aligning with how the LLM evaluates what the user is trying to accomplish.
  * **Action verbs** create clear separation. `Book`, `cancel`, `modify`, and `check` are unambiguous, allowing the LLM to confidently distinguish between intents.
  * **Objects and entities** specify the target. `"Book a hotel"` vs. `"book a car"` vs. `"book a flight"` each map to a distinct user goal.
  * **Context** resolves edge cases. Adding constraints like `"Intent to cancel a flight due to medical emergency"` vs. `"Intent to cancel a flight for schedule conflict"` context can help to determine waiver eligibility and refund policies.
**DO:**
  * Start descriptions with `"Intent to..."` followed by a clear action verb. 
    * Example: `"Intent to book a hotel room for overnight accommodation"`.
  * Derive descriptions from your existing sample utterances. They reflect how users speak and provide the strongest signal for the LLM. 
    * Example: Descriptions like `"book a room"` and `"reserve a suite"` become: `"Intent to book or reserve a hotel room or suite for an overnight stay"`.
  * Add domain context when you have similar intents that need disambiguation. 
    * Example: `"Intent to book a hotel room on StayBooker"` grounds the LLM’s understanding.
  * Mirror your users’ vocabulary from real conversation analytics. 
    * Example: If customers say `"reservation"`, use that term consistently.
  * Test descriptions against edge case utterances before deploying. 
    * Example: Verify `"I need a place to stay"` correctly routes to BookHotel .
**DON’T:**
  * Leave descriptions empty or use placeholder text. 
    * Bad example: `"TBD"` or `"Intent 1"` provides no signal to the LLM.
  * Combine multiple actions in a single intent. 
    * Bad example: `"Intent to book and manage hotel reservations"` consider splitting into separate intents.
  * Use overlapping language across different intents. 
    * Bad example: `"Check account balance"` and `"Check account transactions"` will confuse classification.
  * Include slot values or specific examples in the description. 
    * Bad example: `"Intent to book a hotel in Seattle for 2 nights"` over constrains matching.
### 1.3 Improving slot descriptions
Slot descriptions provide contextual signal to the LLM about what information to extract and how to interpret it. The stronger and more specific your description, the more effectively the LLM can prioritize relevant values. As Assisted NLU evolves, slot descriptions will carry increasing weight in extraction decisions. Writing precise descriptions today prepares your bot to benefit from future improvements automatically. Effective descriptions follow this pattern: `[What the slot captures] [contextual constraints] [valid value guidance]`
  * **What the slot captures** defines the specific piece of information that the slot extracts from the user’s input, such as a city name, date, or count.
  * **Contextual constraints** narrow scope. `"Check-in date for the hotel reservation, not the checkout or booking date"` helps the LLM extract the correct date from inputs like `"December 15th through the 18th"`.
  * **Valid value guidance** resolves ambiguity. `"Three-letter ISO currency code such as USD, EUR, or JPY"` lets the LLM resolve inputs like “euros” or “Japanese yen” to the standard code without maintaining a full currency catalog in the slot type.
**DO:**
  * Use slot descriptions to resolve values without a dedicated built-in slot type. 
    * Example: To capture airport codes, use AMAZON.AlphaNumeric with the description `"A valid IATA airport code (for example, SEA, JFK, LAX)"`. The LLM uses this context to extract codes from natural language, mapping `"I'm flying out of Seattle"` to SEA, without enumerating every value in a custom slot type.
  * If you have two AMAZON.Number slots (nights + guests), the description is important to help LLM differentiate between similar slot types. 
    * Example: `"Number of nights for the hotel stay"` vs `"Number of guests checking in"` — without these, the LLM could struggle to assign `"3"` to the right slot.
  * Clarify the slot’s role within the intent. 
    * Example: `"Date of check-in"` for a hotel booking intent removes ambiguity between check-in, checkout, and reservation dates.
  * Specify constraints that match your business rules. 
    * Example: `"Number of nights in the hotel stay"` clarifies this is a duration count, not a room count or guest count.
  * Use slot descriptions to define each value’s meaning for custom slots with expanded value resolution. 
    * Example: A RoomType custom slot with values Standard, Deluxe, and Suite and the description `"Type of hotel room. Standard is a basic room, Deluxe is a mid-tier room with extra amenities, Suite is the top-tier luxury room with the most space and best features and kitchen attached"` helps the LLM map natural language to the right category. If a customer says, “a room with a kitchen,” or “largest room” the LLM resolves these to Suite based on the semantic context provided in the description.
**DON’T:**
  * Leave slot descriptions empty, especially for custom slots. 
    * Bad example: `"Payment"` with no description gives the LLM no guidance on what currency formats to expect.
  * Assume that the slot type alone provides enough context. 
    * Bad example: AMAZON.Number could be nights, guests, rooms, or confirmation numbers without a description.
  * Use descriptions that conflict with the slot type. 
    * Bad example: Describing `"account number"` but using AMAZON.Number type might cause extraction issues with formatted account numbers.
  * Forget to update descriptions when business logic changes. 
    * Bad example: Expanding to international cities but keeping `"United States only"` in the description.
### 1.4 Intent disambiguation best practices
When multiple intents could match a user’s input, Assisted NLU presents disambiguation options to clarify the user’s goal. Well-designed disambiguation reduces friction and keeps conversations on track.
**DO:**
  * Use clear, distinct intent names and descriptions that don’t overlap. These are the primary inputs the LLM uses for disambiguation decisions. 
    * Example: `"BookHotelRoom"` with description `"Reserve a hotel room for future dates"` vs `"CancelHotelReservation"` with description `"Cancel an existing hotel booking"` – clearly separated purposes.
  * Provide user-friendly display names for technical intent names. Make sure display names align with and clearly represent the actual intent names. 
    * Example: Intent name `"ModifyReservationDates"` with display name `"Change my reservation dates"` makes the option immediately clear to users.
  * Configure the maximum number of intent options thoughtfully. Balance between providing enough choices and avoiding decision paralysis through testing. 
    * Example: Limit disambiguation to 3–4 options maximum; if `"book hotel"` could match 6 intents, your intent design is too fragmented.
  * Craft concise disambiguation messages that acknowledge the user’s input. Guide users naturally toward selecting the right intent option. 
    * Example: `"I can help you with hotel reservations. Did you want to:"` followed by clear options, rather than `"Please select an intent:"`.
  * Test thoroughly with ambiguous utterances. Validate that the disambiguation flow feels natural and consistently presents the correct intent options. 
    * Example: Test phrases like `"I need help with my reservation"` across booking, modification, and cancellation intents to make sure correct options appear.
**DON’T:**
  * Ignore disambiguation patterns. Monitor which intents frequently trigger disambiguation and refine them to reduce confusion. 
    * Bad example: If `"check my reservation"` constantly triggers disambiguation between `"ViewReservation"`, `"ModifyReservation"`, and `"VerifyReservation"`, consolidate or clarify these intents.
  * Use disambiguation as an umbrella solution. If most conversations hit disambiguation, your intent design needs fundamental improvement. 
    * Bad example: If the majority of user requests trigger disambiguation, this indicates overlapping intent definitions that need redesign—not better disambiguation messages.
  * Forget to handle disambiguation failures. Have a clear fallback strategy when users don’t select any option. 
    * Bad example: Showing the same disambiguation options repeatedly when users say `"neither"` or `"something else"` instead of escalating to human support.
  * Treat disambiguation as set-and-forget. Continuously analyze user selections to identify confusion points and improve intent separation over time. 
    * Bad example: Never reviewing which disambiguation options users select; if everyone picks option two when shown three choices, options one and three might be unnecessary.
After you’ve applied these best practices, validate your configuration through systematic testing.
## 2\. Testing your Assisted NLU implementation
With your intent and slot descriptions in place, the next step is validation. Use the Amazon Lex Test Workbench to measure how well your Assisted NLU configuration handles real-world utterance variations.
For Test Workbench setup and usage, see the [Test Workbench Documentation](<https://docs.aws.amazon.com/lexv2/latest/dg/test-workbench.html>) and [demo video](<https://www.youtube.com/watch?v=FNxm6wSD3i4>).
**Important** : When configuring your test set execution, make sure to select the bot and alias where Assisted NLU is enabled. The test will only exercise Assisted NLU if the selected alias points to a version with Fallback or Primary mode configured.
### 2.1 What to test
Focus on where Assisted NLU adds the most value: Edge casesTest inputs that deviate from standard phrasing to verify Assisted NLU handles real-world messiness:
  * Typos and grammatical errors: `"i wanna book an hotell"`
  * Colloquial expressions: `"hook me up with a room downtown"`
  * Ambiguous requests: `"I need transportation"`
  * Incomplete utterances: `"booking for next week"`
#### Slot variations
For built-in slots, test variations like date formats (“next Tuesday”, “the 15th”), location aliases (“NYC”, “New York City”), first name variations (“Bob” vs “Robert”), and email formats (“john dot doe at gmail dot com”).
For custom slots, test that user phrasing maps to defined values, especially in expand mode. For example, verify that “largest room” resolves to “Suite” for a RoomType slot.
Unlike open-ended generative AI applications where the LLM produces free-form text returned directly to users, Assisted NLU uses the LLM strictly as a classification and extraction engine constrained by your bot definition. The LLM can only select an intent and extract slot values defined in your bot definition. It can’t invent new intents, trigger actions outside your bot definition, or return raw LLM-generated text to end users. This bot-definition-bounded architecture significantly limits the prompt injection attack surface, but you should still validate that adversarial inputs route predictably to FallbackIntent.
### 2.2 Analyzing test results
After your test run completes, use pass rates to prioritize where to focus your improvement efforts. Intents with lower pass rates need the most attention:
  * **0–30 percent:** High priority. Rewrite the intent description and check for overlap with confused intents.
  * **30–70 percent** : Medium priority. Analyze failed utterances for patterns and refine descriptions.
  * **70–100 percent** : Low priority. Minor tuning or no action needed.Download detailed results and examine:
  * **Expected Intent vs. Actual Intent** : Identifies misclassifications
  * **Actual Output Slot values vs expected:** For extraction and resolution mismatches
  * **User Utterance** : The input that failed
  * **Error Message** : Explains the failure reason
  * **Conversation Result end-to-end:** Overall pass/fail for the full conversation flow, not just individual turns
### 2.3 Iterating on descriptions
When test results reveal misclassifications, use the following iterative process to refine your descriptions:
  1. Export your detailed results and filter to failed utterances
  2. Identify which intent they were misclassified to
  3. Compare descriptions of both intents
  4. Rewrite your failing intent’s description to emphasize differentiation
  5. Re-run the same test set to validate your improvement
### 2.4 Versioning for safe iteration
Use Amazon Lex versioning and aliases to test description changes safely without impacting production traffic:
  1. Refine descriptions in Draft version
  2. Test against TestBotAlias
  3. Create a numbered version when results are acceptable
  4. Point BETA alias to validate, then promote to PROD
  5. Rollback by repointing PROD to a previous version if needed
For details, see the [Versioning and Aliases Guide](<https://docs.aws.amazon.com/lexv2/latest/dg/versions-aliases.html>).
**Access Control:** Use AWS Identity and Access Management (IAM) policies to restrict who can modify bot definitions, intents, and slot descriptions. Limit lex:UpdateBotLocale, lex:UpdateIntent, and lex:UpdateSlot permissions to authorized developers. This prevents unauthorized changes to descriptions that could degrade NLU accuracy or introduce unintended behavior. For details, see [Identity and Access Management for Amazon Lex in the Amazon Lex Developer Guide](<https://docs.aws.amazon.com/lexv2/latest/dg/security-iam.html>).
### 2.5 Production monitoring
Enable conversation logs on your production alias to track Assisted NLU performance with real traffic. For setup, see [Configuring Conversation Logs](<https://docs.aws.amazon.com/lexv2/latest/dg/conversation-logs-configure.html>).
Key fields to monitor
  * **fulfilledByAssistedNlu** : Boolean flag showing when the LLM handled classification or slot resolution
  * **nluConfidence** : Confidence score for the selected intent
  * **missedUtterance** : Boolean indicating Fallback Intent was classified.
#### What to track
  * Assisted NLU invocation rate: High rates in Fallback mode might indicate sample utterances need expansion.
  * Intent recognition accuracy: Compare traditional NLU vs Assisted NLU enabled.
  * Slot resolution accuracy: Compare traditional NLU vs Assisted NLU enabled.
  * Missed utterance patterns: Group by theme to identify gaps in intent coverage or descriptions.
  * Disambiguation frequency: Monitor which intent pairs trigger clarification most often.
A/B testing modesTo compare Primary vs. Fallback mode, create separate bot versions for each mode, point different aliases to them, and compare metrics across aliases in CloudWatch.
## 3\. Recommended rollout strategy
With your descriptions improved and testing validated, you’re ready to plan your production rollout. If you’re building a new bot, start with Primary mode. Begin with 10–15 sample utterances per intent and invest your effort in writing high-quality intent and slot descriptions. If you have an existing bot that already performs well, start with Fallback mode so the LLM only intervenes when traditional NLU is uncertain. Run A/B tests to compare performance before considering a switch to Primary mode and preserve rollback capability by maintaining a previous bot version you can revert to.
### Deployment checklist
  * [ ] Baseline metrics documented
  * [ ] Tested in development with edge cases
  * [ ] Conversation logs enabled
  * [ ] CloudWatch Dashboard configured
  * [ ] Rollback procedure defined
## Conclusion
In this post, we showed you how to improve bot accuracy with Amazon Lex Assisted NLU. You learned how to craft effective intent and slot descriptions, validate your configuration with Test Workbench, and roll out Assisted NLU safely to production using Primary or Fallback mode.
Ready to get started? [Enable Assisted NLU](<https://docs.aws.amazon.com/lexv2/latest/dg/assisted-nlu.html>) on your bot today!
* * *
## About the authors
**Priti Aryamane** is a Senior Consultant at AWS Professional Services, specializing in contact center modernization and conversational AI. With over 15 years of experience in contact centers and telecommunications, she architects and delivers enterprise-scale AI solutions using Amazon Connect, Amazon Lex and Amazon Bedrock. Priti works closely with customers to modernize customer experience platforms, implement AI-driven self-service automation, and design scalable architectures that drive measurable business outcomes.
**Dipkumar Mehta** is a Principal Consultant for Natural Language AI at AWS. He architects and scales Agentic AI solutions for enterprise contact centers. He leads development of AI products that accelerate adoption of autonomous customer experiences. His work helps organizations move from conversational AI pilots to production-grade agentic deployments on AWS.
**Rakshit Parashar** is a Software Engineer on the Amazon Lex team, where he works on helping builders create more accurate and robust conversational bots. His interests center on making task-oriented dialogue systems more reliable and trustworthy, combining the reasoning power of LLMs with deterministic validation.
**Karthik Konaraddi** is a Software Development Engineer on the Amazon Lex team, focused on the intersection of speech recognition, language understanding, and generative AI. He works on delivering features that improve how bots resolve intent and respond to users. He’s driven by the idea that LLMs can fundamentally reshape how bots manage conversations, moving past static rules toward systems that truly understand context.
**Alampu Maakaru** is a Software Development Manager on the Amazon Connect (Lex) team. He leads the Automatic Speech Recognition (ASR) and bot developer experience engineering teams, building and delivering solutions that enhance conversational AI capabilities, improve customer experiences, and simplify adoption of Language AI services.
**Mahesh Sankaranarayanan** is a Software Development Manager on the Amazon Connect (Lex) team. He leads the Natural Language Understanding (NLU) engineering team, building and delivering LLM-augmented NLU solutions that advance conversational AI capabilities, improve intent recognition and language comprehension, and simplify adoption of Language AI services.