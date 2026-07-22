---
source: newsletter
source_url: https://developer.okta.com/blog/2026/05/12/low-code-api-integration
title: "How to Build Low-Code API Integrations for Enterprise Apps Using Okta"
sha256: f29aa643d670ef3487375dd7f1b5c20b0122b4cd367558bf79c402fb12946723
domain: developer.okta.com
review_value: 7
review_confidence: 8
review_recommendation: strong
review_stars: 5
ingested: 2026-05-13
---
URL Source: https://developer.okta.com/blog/2026/05/12/low-code-api-integration
Published Time: 2026-05-12
Markdown Content:
API Integration Actions are now available in Okta Integration Network (OIN) for Integrator Free Trial Orgs to build Provisioning, Entitlements, and Universal Logout applications.
## [What are API Integration Actions?](https://developer.okta.com/blog/2026/05/12/low-code-api-integration#what-are-api-integration-actions)
API Integration Actions are a feature that uses Workflows, Okta’s low-code builder, to enable independent software vendors (ISVs) to build Okta Integrations (Provisioning, Entitlements, Universal Logout) that are seamlessly invoked by Okta services — for example, retrieving and updating entitlements or triggering risk-based logout flows.
You can just skip the complexity of building and maintaining a System for Cross-domain Identity Management (SCIM) server. API Integration Actions allow you to use your existing APIs as-is by mapping them directly to Okta action contracts. By using our low-code builder, you no longer need in-depth knowledge of protocols, making it faster and easier to build, test, and deliver enterprise-grade Secure Identity Integrations. This leads to a fast time-to-value for customers leveraging ISV data for connector-heavy Okta Identity Governance (OIG) use cases.
## [Benefits of low-code API integration for ISVs](https://developer.okta.com/blog/2026/05/12/low-code-api-integration#benefits-of-low-code-api-integration-for-isvs)
For the ISV application developer:
*   Built on Workflows: use the low-code builder instead of writing and maintaining complex code
*   Translates your API calls into formats consumable by Okta: bring your APIs as they are, without having to make any changes
*   No need for in-depth knowledge of protocols: Workflows makes mapping your API to Okta’s format simple
*   No need to invest in costly infrastructure: don’t worry about managing a SCIM server
*   It’s not just secure — it’s fast and easy!
If you don’t already have an account, sign up for an [Okta Integrator Free Plan](https://developer.okta.com/signup/) first. Once created, log in and follow these steps.
### [Step 1: Create your OIN integration](https://developer.okta.com/blog/2026/05/12/low-code-api-integration#step-1-create-your-oin-integration)
*   Click **Applications**>**Your OIN Integrations**
*   Click **Build new OIN integration**
*   Choose the single sign-on (SSO) type
*   If you are building an integration that uses Universal Logout, choose that option. If you are building an integration using provisioning and entitlements, choose those options
*   Select **View integration details**
![Image 1: Add integration capabilities screen showing Session Lifecycle Management and Identity Lifecycle Management options](https://developer.okta.com/assets-jekyll/blog/low-code-api-integration/add-integration-capabilities-de356175390fd0bb655700f24f6d620de643de30b5ee19a123b0c72035d4d184.jpg)
*   Add the integration details
*   If you are a customer creating an integration for your orgs during the EA period, put “Customer-created integration - not for the public catalog” in the description field. Then provide a list of your org tenant IDs and subdomains. After submission, you will need to email your account manager to ensure this integration is deployed to your orgs.
![Image 2: OIN catalog properties form showing display name, description, and logo upload fields](https://developer.okta.com/assets-jekyll/blog/low-code-api-integration/catalog-props-1-42da508ba461b07218328e6a95a110860eaaf2c537fb85c1cf021a5f0b70d552.jpg)
![Image 3: OIN catalog properties form continued showing support contact information and use case options](https://developer.okta.com/assets-jekyll/blog/low-code-api-integration/catalog-prop-2-cefa62a0ba05fbcd6a882897a2c8b43d90a81c560aa7fffb1e7d0cd1e993b5f7.jpg)
### [Step 2: Configure authentication and API Integration Actions](https://developer.okta.com/blog/2026/05/12/low-code-api-integration#step-2-configure-authentication-and-api-integration-actions)
*   Tenant settings refer to subdomains or additional information needed for the SSO components
*   Authentication settings include all of the allowed integration types. Choose the one used by the API and provide the information
*   Click **Save and start building**
![Image 4: Tenant settings and authentication settings screens showing label, name fields, and OAuth 2 configuration with authorize and token endpoints](https://developer.okta.com/assets-jekyll/blog/low-code-api-integration/tenant-auth-3f0d2a1419a2b4ef969758b56f75c918d1bd420be3c811b49eb4ae92c98c017f.jpg)
*   This will send you to **Integration Builder** within the Okta Workflows product, where you build out the flows that connect to the API
*   Validate that the information is correct — it should match what was provided in OIN Wizard
![Image 5: Integration Builder project screen showing General, Authentication, Test connection, and API Spec tabs](https://developer.okta.com/assets-jekyll/blog/low-code-api-integration/wf-project-7ac612cdc7ceaa860dfb568367bfb216e1de464b396c32d4c952e7ac849c0c67.jpg)
*   Click on the **Authentication** tab and add the authentication information. Make sure it matches what is in the OIN Wizard
*   Fill out the **Authentication Mapping** section to map the OIN Wizard auth parameters to the Workflows auth parameters
![Image 6: Authentication mapping screen showing connection parameters mapped to OIN app integration variables](https://developer.okta.com/assets-jekyll/blog/low-code-api-integration/auth-mapping-4abb7154894f018550d250e7db054f05ba6f4838ae2878de761dc4a31fc8866d.jpg)
*   Click on **New Component** and choose **Add Action**
*   Choose the API Integration Action component from the list, and click **save**
![Image 7: Add new action dialog showing API integration action component options, including Provisioning action contracts](https://developer.okta.com/assets-jekyll/blog/low-code-api-integration/choose-action-d397cabbed4ab58e70c8c4602d677211c989957b6fc984d83cb1d3a467281676.jpg)
### [Step 3: Build your low-code workflow flows](https://developer.okta.com/blog/2026/05/12/low-code-api-integration#step-3-build-your-low-code-workflow-flows)
*   Click on **New Flow**
*   Create the workflow and repeat as necessary
*   Once your flows are created, you can create test flows in the test folder to validate that the API calls are being made correctly
![Image 8: Provisioning action contracts screen showing App Event flows for List users, Get group by id, List groups, and more](https://developer.okta.com/assets-jekyll/blog/low-code-api-integration/flow-list-982e6ea3cea32eefc6d8acc0d4aadc097b6127311476704d4155c4a835bdff6d.jpg)
*   After testing, click on **Validate and Submit**
*   Click on **Validate flows** and fix any errors that may exist
![Image 9: Validate and submit flows screen showing flow validation status and Continue submission in OIN button](https://developer.okta.com/assets-jekyll/blog/low-code-api-integration/validate-flows-9577e21a89b466cc9a6d70bdd13f924af10ec0f170ed58a3f3a1249a4d99819e.jpg)
*   Click on **Continue submission in OIN**
*   Back in the OIN Wizard, choose the correct flows for each of the API Integration Actions that have been created
*   Click on **Get started with testing**
![Image 10: Provisioning API Integration Actions screen showing User query, User Schema Discovery, and User Operations flow mapping](https://developer.okta.com/assets-jekyll/blog/low-code-api-integration/configure-integration-d4c0e694213b005d4d8798ff96ed30ed6a886b738af0419dd39cac988c4f86e7.jpg)
## [How to test your API integration before publishing to the OIN](https://developer.okta.com/blog/2026/05/12/low-code-api-integration#how-to-test-your-api-integration-before-publishing-to-the-oin)
Before submitting your integration for review and publication, you must test it in your Okta org. Your integration will only be available on your Okta org. Okta admins will see the same authorization experience.
*   Provide the testing information needed for Okta to review the submission
*   Once finished, click on **Test your integration**
![Image 11: Test your integration screen showing test account fields, account URL, username, password, and testing instructions](https://developer.okta.com/assets-jekyll/blog/low-code-api-integration/test-instance-da421c1d820fd16dfe7261b7c836a97665d5e5d37ef1dafd05a219d2794c2bc3.jpg)
### [Create a test instance](https://developer.okta.com/blog/2026/05/12/low-code-api-integration#create-a-test-instance)
*   Fill out the information, including the test account and any SSO testing features on the **Test your integration** section of the OIN Wizard
*   Click **Test your integration**
*   Follow the instructions in the **Test integration** section to generate a test instance and complete all of the testing
*   Validate your flows by clicking the button — take action on any failures that occur
![Image 12: Test integration screen showing app instances for testing with SAML SSO instance detected and Provisioning and Entitlement instances pending](https://developer.okta.com/assets-jekyll/blog/low-code-api-integration/test-integration-2273cb1e49820cf0c061b6806c10e1f95bd7d7de80b3f0d1eefacd01f79ed15a.jpg)
### [Update a test instance](https://developer.okta.com/blog/2026/05/12/low-code-api-integration#update-a-test-instance)
When you make an update to your submission in the OIN Manager (for example, modifying the scopes or name of the integration), the update will not automatically be reflected in your test instance for security reasons.
To update a test instance, repeat the procedure above for creating a test instance.
Once finished, click the last checkbox to enable submitting your integration for review. This process is similar to the existing OIN Catalog process.
## [Get started with low-code API integration using Okta](https://developer.okta.com/blog/2026/05/12/low-code-api-integration#get-started-with-low-code-api-integration-using-okta)
If you’re ready to build an integration between your APIs and Okta’s, start by exploring how to build and publish an application using API Integration Actions to the OIN by reading our product documentation [Build and publish API Integration Actions](https://developer.okta.com/docs/guides/build-api-actions/main/).
Remember to follow us on [Twitter](https://twitter.com/oktadev) and subscribe to our [YouTube channel](https://www.youtube.com/c/OktaDev/) for more exciting content. We also want to hear from you about the topics you’d like to see and any questions you may have. Leave us a comment below!