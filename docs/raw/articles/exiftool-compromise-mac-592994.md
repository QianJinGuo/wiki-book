---
title: How an image could compromise your Mac: understanding an ExifTool vulnerability (CVE-2026-3102)
type: article
tags: []
source: newsletter
source_url: https://securelist.com/exiftool-compromise-mac/119866/
sha256: 764cd8ac43cf
ingested: 2026-05-21
---


Published Time: 2026-05-20T09:02:31+00:00

Markdown Content:
# How a single image takes control of a Mac | Securelist

![Image 12: logo](blob:http://localhost/4eb6460ab93a7ae1978320dda45af1eb)

[](https://www.cookiebot.com/en/what-is-behind-powered-by-cookiebot/?utm_source=banner_cb&utm_medium=referral&utm_content=v2)

*   [Consent](https://securelist.com/exiftool-compromise-mac/119866/#)
*   [Details](https://securelist.com/exiftool-compromise-mac/119866/#)
*   [[#IABV2SETTINGS#]](https://securelist.com/exiftool-compromise-mac/119866/#)
*   [About](https://securelist.com/exiftool-compromise-mac/119866/#)

This website uses cookies

We use cookies to personalise content and ads, to provide social media features and to analyse our traffic. We also share information about your use of our site with our social media, advertising and analytics partners who may combine it with other information that you’ve provided to them or that they’ve collected from your use of their services. 

[#GPC_BANNER_ICON#]

[#GPC_TOAST_TEXT#]

Consent Selection

**Necessary** 

- [x] 

**Preferences** 

- [x] 

**Statistics** 

- [x] 

**Marketing** 

- [x] 

[Show details](https://securelist.com/exiftool-compromise-mac/119866/#)

Details

*   
Necessary 14- [x]    Necessary cookies help make a website usable by enabling basic functions like page navigation and access to secure areas of the website. The website cannot function properly without these cookies. 

    *   [Cookiebot 3](https://securelist.com/exiftool-compromise-mac/119866/#)[Learn more about this provider![Image 13: opens in a new window](blob:http://localhost/7c37f61654102a88a9be209f9569ef78)](https://www.cookiebot.com/goto/privacy-policy/ "Learn more about this provider Cookiebot's privacy policy - opens in a new window")**CookieConsent[x3]**Stores the user's cookie consent state for the current domain**Maximum Storage Duration**: 1 year**Type**: HTTP Cookie   
    *   [Google 6](https://securelist.com/exiftool-compromise-mac/119866/#)[Learn more about this provider![Image 14: opens in a new window](blob:http://localhost/7c37f61654102a88a9be209f9569ef78)](https://business.safety.google/privacy/ "Learn more about this provider Google's privacy policy - opens in a new window")Some of the data collected by this provider is for the purposes of personalization and measuring advertising effectiveness.

**test_cookie**Used to check if the user's browser supports cookies.**Maximum Storage Duration**: 1 day**Type**: HTTP Cookie  **_GRECAPTCHA**This cookie is used to distinguish between humans and bots. This is beneficial for the website, in order to make valid reports on the use of their website.**Maximum Storage Duration**: 180 days**Type**: HTTP Cookie  **rc::a**This cookie is used to distinguish between humans and bots. This is beneficial for the website, in order to make valid reports on the use of their website.**Maximum Storage Duration**: Persistent**Type**: HTML Local Storage  **rc::b**This cookie is used to distinguish between humans and bots. **Maximum Storage Duration**: Session**Type**: HTML Local Storage  **rc::c**This cookie is used to distinguish between humans and bots. **Maximum Storage Duration**: Session**Type**: HTML Local Storage  **rc::f**This cookie is used to distinguish between humans and bots. **Maximum Storage Duration**: Persistent**Type**: HTML Local Storage   
    *   [LinkedIn 1](https://securelist.com/exiftool-compromise-mac/119866/#)[Learn more about this provider![Image 15: opens in a new window](blob:http://localhost/7c37f61654102a88a9be209f9569ef78)](https://www.linkedin.com/legal/privacy-policy "Learn more about this provider LinkedIn's privacy policy - opens in a new window")**sentry-offline#queue**Detects and logs potential errors on third-party provided functions on the website.**Maximum Storage Duration**: Persistent**Type**: IndexedDB   
    *   [Yandex 2](https://securelist.com/exiftool-compromise-mac/119866/#)[Learn more about this provider![Image 16: opens in a new window](blob:http://localhost/7c37f61654102a88a9be209f9569ef78)](https://yandex.com/legal/confidential/?lang=en "Learn more about this provider Yandex's privacy policy - opens in a new window")**sync_cookie_csrf[x2]**Used in connection with the synchronisation between the website and third-party Data Management Platform. The cookie serves to monitor this process for security reasons. **Maximum Storage Duration**: 1 day**Type**: HTTP Cookie   
    *   [kasperskyform.eu 2](https://securelist.com/exiftool-compromise-mac/119866/#)**b24-analytics-counter-1342-view**Pending**Maximum Storage Duration**: Session**Type**: HTML Local Storage  **b24-analytics-counter-1372-view**Pending**Maximum Storage Duration**: Session**Type**: HTML Local Storage   

*   
Preferences 0- [x]    Preference cookies enable a website to remember information that changes the way the website behaves or looks, like your preferred language or the region that you are in. 

    *   We do not use cookies of this type.

*   
Statistics 16- [x]    Statistic cookies help website owners to understand how visitors interact with websites by collecting and reporting information anonymously. 

    *   [Google 12](https://securelist.com/exiftool-compromise-mac/119866/#)[Learn more about this provider![Image 17: opens in a new window](blob:http://localhost/7c37f61654102a88a9be209f9569ef78)](https://business.safety.google/privacy/ "Learn more about this provider Google's privacy policy - opens in a new window")Some of the data collected by this provider is for the purposes of personalization and measuring advertising effectiveness.

**_ga[x6]**Registers a unique ID that is used to generate statistical data on how the visitor uses the website.**Maximum Storage Duration**: 2 years**Type**: HTTP Cookie  **_gid[x2]**Registers a unique ID that is used to generate statistical data on how the visitor uses the website.**Maximum Storage Duration**: 1 day**Type**: HTTP Cookie  **_ga_#[x4]**Used to send data to Google Analytics about the visitor's device and behavior. Tracks the visitor across devices and marketing channels.**Maximum Storage Duration**: 2 years**Type**: HTTP Cookie   
    *   [LinkedIn 1](https://securelist.com/exiftool-compromise-mac/119866/#)[Learn more about this provider![Image 18: opens in a new window](blob:http://localhost/7c37f61654102a88a9be209f9569ef78)](https://www.linkedin.com/legal/privacy-policy "Learn more about this provider LinkedIn's privacy policy - opens in a new window")**browser_id**Used to recognise the visitor's browser upon reentry on the website.**Maximum Storage Duration**: 5 years**Type**: HTTP Cookie   
    *   [Yandex 2](https://securelist.com/exiftool-compromise-mac/119866/#)[Learn more about this provider![Image 19: opens in a new window](blob:http://localhost/7c37f61654102a88a9be209f9569ef78)](https://yandex.com/legal/confidential/?lang=en "Learn more about this provider Yandex's privacy policy - opens in a new window")**_ym_retryReqs**Registers statistical data on users' behaviour on the website. Used for internal analytics by the website operator. **Maximum Storage Duration**: Persistent**Type**: HTML Local Storage  **_ym3:0_reqNum**Registers statistical data on users' behaviour on the website. Used for internal analytics by the website operator. **Maximum Storage Duration**: Persistent**Type**: HTML Local Storage   
    *   [kasperskyform.eu 1](https://securelist.com/exiftool-compromise-mac/119866/#)**b24-analytics-counter-1126-view**Pending**Maximum Storage Duration**: Session**Type**: HTML Local Storage   

*   
Marketing 66- [x]    Marketing cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user and thereby more valuable for publishers and third party advertisers. 

    *   [Meta Platforms, Inc.7](https://securelist.com/exiftool-compromise-mac/119866/#)[Learn more about this provider![Image 20: opens in a new window](blob:http://localhost/7c37f61654102a88a9be209f9569ef78)](https://www.facebook.com/policy.php/ "Learn more about this provider  Meta Platforms, Inc.'s privacy policy - opens in a new window")**_fbp[x4]**Used by Facebook to deliver a series of advertisement products such as real time bidding from third party advertisers.**Maximum Storage Duration**: 3 months**Type**: HTTP Cookie  **fbssls_#**Collects data on the visitor’s use of the comment system on the website, and what blogs/articles the visitor has read. This can be used for marketing purposes. **Maximum Storage Duration**: Session**Type**: HTML Local Storage  **lastExternalReferrer**Detects how the user reached the website by registering their last URL-address.**Maximum Storage Duration**: Persistent**Type**: HTML Local Storage  **lastExternalReferrerTime**Detects how the user reached the website by registering their last URL-address.**Maximum Storage Duration**: Persistent**Type**: HTML Local Storage   
    *   [Bitrix24 2](https://securelist.com/exiftool-compromise-mac/119866/#)[Learn more about this provider![Image 21: opens in a new window](blob:http://localhost/7c37f61654102a88a9be209f9569ef78)](https://www.bitrix24.eu/privacy/ "Learn more about this provider Bitrix24's privacy policy - opens in a new window")**b24_crm_guest_pages**Sets a unique ID for the specific user. This allows the website to target the user with relevant offers through its chat functionality. **Maximum Storage Duration**: Persistent**Type**: HTML Local Storage  **b24_crm_guest_utm**Sets a unique ID for the specific user. This allows the website to target the user with relevant offers through its chat functionality. **Maximum Storage Duration**: Persistent**Type**: HTML Local Storage   
    *   [BrightTalk 1](https://securelist.com/exiftool-compromise-mac/119866/#)[Learn more about this provider![Image 22: opens in a new window](blob:http://localhost/7c37f61654102a88a9be209f9569ef78)](https://business.brighttalk.com/company/privacy-policy/ "Learn more about this provider BrightTalk's privacy policy - opens in a new window")**ga_clientId**Used to send data to Google Analytics about the visitor's device and behavior. Tracks the visitor across devices and marketing channels.**Maximum Storage Duration**: Persistent**Type**: HTML Local Storage   
    *   [Google 9](https://securelist.com/exiftool-compromise-mac/119866/#)[Learn more about this provider![Image 23: opens in a new window](blob:http://localhost/7c37f61654102a88a9be209f9569ef78)](https://business.safety.google/privacy/ "Learn more about this provider Google's privacy policy - opens in a new window")Some of the data collected by this provider is for the purposes of personalization and measuring advertising effectiveness.

**_gcl_au[x4]**Used to measure the efficiency of the website’s advertisement efforts, by collecting data on the conversion rate of the website’s ads across multiple websites.**Maximum Storage Duration**: 3 months**Type**: HTTP Cookie  **IDE**Used by Google DoubleClick to register and report the website user's actions after viewing or clicking one of the advertiser's ads with the purpose of measuring the efficacy of an ad and to present targeted ads to the user.**Maximum Storage Duration**: 400 days**Type**: HTTP Cookie  **gmp\conversion#**Pending**Maximum Storage Duration**: Session**Type**: Pixel Tracker  **pagead/1p-conversion/#/**Tracks the conversion rate between the user and the advertisement banners on the website - This serves to optimise the relevance of the advertisements on the website. **Maximum Storage Duration**: Session**Type**: Pixel Tracker  **AwinChannelCookie**Pending**Maximum Storage Duration**: Session**Type**: HTTP Cookie  **_gcl_ls**Tracks the conversion rate between the user and the advertisement banners on the website - This serves to optimise the relevance of the advertisements on the website. **Maximum Storage Duration**: Persistent**Type**: HTML Local Storage   
    *   [Twitter Inc.2](https://securelist.com/exiftool-compromise-mac/119866/#)[Learn more about this provider![Image 24: opens in a new window](blob:http://localhost/7c37f61654102a88a9be209f9569ef78)](https://twitter.com/en/privacy "Learn more about this provider Twitter Inc.'s privacy policy - opens in a new window")**__cf_bm**This cookie is used to distinguish between humans and bots. This is beneficial for the website, in order to make valid reports on the use of their website.**Maximum Storage Duration**: 1 day**Type**: HTTP Cookie  **i/jot/embeds**Sets a unique ID for the visitor, that allows third party advertisers to target the visitor with relevant advertisement. This pairing service is provided by third party advertisement hubs, which facilitates real-time bidding for advertisers.**Maximum Storage Duration**: Session**Type**: Pixel Tracker   
    *   [Yandex 25](https://securelist.com/exiftool-compromise-mac/119866/#)[Learn more about this provider![Image 25: opens in a new window](blob:http://localhost/7c37f61654102a88a9be209f9569ef78)](https://yandex.com/legal/privacy/ "Learn more about this provider Yandex's privacy policy - opens in a new window")**metrika_enabled[x4]**Used to track visitors on multiple websites, in order to present relevant advertisement based on the visitor's preferences. **Maximum Storage Duration**: Session**Type**: HTTP Cookie  **_ym#_lsid**Pending**Maximum Storage Duration**: Persistent**Type**: HTML Local Storage  **_ym_synced**Tracks the user’s interaction with the website’s search-bar-function. This data can be used to present the user with relevant products or services. **Maximum Storage Duration**: Persistent**Type**: HTML Local Storage  **_ym_uid**Collects data on the user’s navigation and behavior on the website. This is used to compile statistical reports and heatmaps for the website owner.**Maximum Storage Duration**: Persistent**Type**: HTML Local Storage  **_ym_wv2rf:#:0**Pending**Maximum Storage Duration**: Persistent**Type**: HTML Local Storage  **sync_cookie_image_decide**Used for data-synchronization with advertisement networks.**Maximum Storage Duration**: Session**Type**: Pixel Tracker  **watch/#[x2]**Pending**Maximum Storage Duration**: Session**Type**: Pixel Tracker  **_ym_d[x3]**Contains the date of the visitor's first visit to the website. **Maximum Storage Duration**: 1 year**Type**: HTTP Cookie  **_ym_isad[x3]**This cookie is used to determine if the visitor has any adblocker software in their browser – this information can be used to make website content inaccessible to visitors if the website is financed with third-party advertisement.**Maximum Storage Duration**: 1 day**Type**: HTTP Cookie  **_ym_uid[x3]**This cookie is used to collect non-personal information on the visitor's website behavior and non-personal visitor statistics.**Maximum Storage Duration**: 1 year**Type**: HTTP Cookie  **_ym_visorc[x3]**Saves information of actions that have been carried out by the user during the current visit to the website, including searches with keywords included.**Maximum Storage Duration**: 1 day**Type**: HTTP Cookie  **metrika/advert.gif[x2]**Pending**Maximum Storage Duration**: Session**Type**: Pixel Tracker   
    *   [YouTube 13](https://securelist.com/exiftool-compromise-mac/119866/#)[Learn more about this provider![Image 26: opens in a new window](blob:http://localhost/7c37f61654102a88a9be209f9569ef78)](https://business.safety.google/privacy/ "Learn more about this provider YouTube's privacy policy - opens in a new window")**__Secure-BUCKET**Pending**Maximum Storage Duration**: 180 days**Type**: HTTP Cookie  **__Secure-ROLLOUT_TOKEN**Used to track user’s interaction with embedded content.**Maximum Storage Duration**: 180 days**Type**: HTTP Cookie  **__Secure-YEC**Stores the user's video player preferences using embedded YouTube video**Maximum Storage Duration**: Session**Type**: HTTP Cookie  **__Secure-YNID**Pending**Maximum Storage Duration**: 180 days**Type**: HTTP Cookie  **LAST_RESULT_ENTRY_KEY**Used to track user’s interaction with embedded content.**Maximum Storage Duration**: Session**Type**: HTTP Cookie  **LogsDatabaseV2:V#||LogsRequestsStore**Used to track user’s interaction with embedded content.**Maximum Storage Duration**: Persistent**Type**: IndexedDB  **ServiceWorkerLogsDatabase#SWHealthLog**Necessary for the implementation and functionality of YouTube video-content on the website. **Maximum Storage Duration**: Persistent**Type**: IndexedDB  **TESTCOOKIESENABLED**Used to track user’s interaction with embedded content.**Maximum Storage Duration**: 1 day**Type**: HTTP Cookie  **VISITOR_INFO1_LIVE**Tries to estimate the users' bandwidth on pages with integrated YouTube videos.**Maximum Storage Duration**: 180 days**Type**: HTTP Cookie  **YSC**Registers a unique ID to keep statistics of what videos from YouTube the user has seen.**Maximum Storage Duration**: Session**Type**: HTTP Cookie  **yt-icons-last-purged**Necessary for the implementation and functionality of YouTube video-content on the website. **Maximum Storage Duration**: Persistent**Type**: HTML Local Storage  **ytidb::LAST_RESULT_ENTRY_KEY**Stores the user's video player preferences using embedded YouTube video**Maximum Storage Duration**: Persistent**Type**: HTML Local Storage  **YtIdbMeta#databases**Used to track user’s interaction with embedded content.**Maximum Storage Duration**: Persistent**Type**: IndexedDB   
    *   [kasperskyform.eu 3](https://securelist.com/exiftool-compromise-mac/119866/#)**BITRIX_SM_kernel**Collects information on user preferences and/or interaction with web-campaign content - This is used on CRM-campaign-platform used by website owners for promoting events or products.**Maximum Storage Duration**: 1 day**Type**: HTTP Cookie  **BITRIX_SM_kernel_0**Collects information on user preferences and/or interaction with web-campaign content - This is used on CRM-campaign-platform used by website owners for promoting events or products.**Maximum Storage Duration**: 1 day**Type**: HTTP Cookie  **qmb**Pending**Maximum Storage Duration**: Session**Type**: HTTP Cookie   
    *   [yandex.com yandex.ru 4](https://securelist.com/exiftool-compromise-mac/119866/#)**_yasc[x2]**Collects data on the user across websites - This data is used to make advertisement more relevant.**Maximum Storage Duration**: 10 years**Type**: HTTP Cookie  **bh[x2]**Collects data on user behaviour and interaction in order to optimize the website and make advertisement on the website more relevant. **Maximum Storage Duration**: 400 days**Type**: HTTP Cookie   

*   Unclassified 7 Unclassified cookies are cookies that we are in the process of classifying, together with the providers of individual cookies.  

    *   [LinkedIn 1](https://securelist.com/exiftool-compromise-mac/119866/#)[Learn more about this provider![Image 27: opens in a new window](blob:http://localhost/7c37f61654102a88a9be209f9569ef78)](https://www.linkedin.com/legal/privacy-policy "Learn more about this provider LinkedIn's privacy policy - opens in a new window")**_fs_cd_cp_pRdRgnTnF68pCV2F**Pending**Maximum Storage Duration**: Session**Type**: HTTP Cookie   
    *   [Linkedin 1](https://securelist.com/exiftool-compromise-mac/119866/#)[Learn more about this provider![Image 28: opens in a new window](blob:http://localhost/7c37f61654102a88a9be209f9569ef78)](https://www.linkedin.com/legal/privacy-policy "Learn more about this provider Linkedin's privacy policy - opens in a new window")**osano_consentmanager_tattles**Pending**Maximum Storage Duration**: Persistent**Type**: HTML Local Storage   
    *   [Yandex 1](https://securelist.com/exiftool-compromise-mac/119866/#)[Learn more about this provider![Image 29: opens in a new window](blob:http://localhost/7c37f61654102a88a9be209f9569ef78)](https://yandex.com/legal/confidential/?lang=en "Learn more about this provider Yandex's privacy policy - opens in a new window")**__ym_tab_guid**Pending**Maximum Storage Duration**: Session**Type**: HTML Local Storage   
    *   [kasperskyform.eu 2](https://securelist.com/exiftool-compromise-mac/119866/#)**b24-analytics-counter-1808-view**Pending**Maximum Storage Duration**: Session**Type**: HTML Local Storage  **b24-analytics-counter-22-view**Pending**Maximum Storage Duration**: Session**Type**: HTML Local Storage   
    *   [securelist.com securelist.lat 2](https://securelist.com/exiftool-compromise-mac/119866/#)**kl_utm_source[x2]**Pending**Maximum Storage Duration**: 1 day**Type**: HTTP Cookie   

[Cross-domain consent 3](https://securelist.com/exiftool-compromise-mac/119866/#)

Your consent applies to the following domains:

List of domains your consent applies to:[securelist.com.br](https://securelist.com.br/)[securelist.lat](https://securelist.lat/)[securelist.com](https://securelist.com/)

Cookie declaration last updated on 4/25/26 by [Cookiebot](https://www.cookiebot.com/)

[#IABV2_TITLE#]

[#IABV2_BODY_INTRO#]

[#IABV2_BODY_LEGITIMATE_INTEREST_INTRO#]

[#IABV2_BODY_PREFERENCE_INTRO#]

[#IABV2_LABEL_PURPOSES#]

[#IABV2_BODY_PURPOSES_INTRO#]

[#IABV2_BODY_PURPOSES#]

[#IABV2_LABEL_FEATURES#]

[#IABV2_BODY_FEATURES_INTRO#]

[#IABV2_BODY_FEATURES#]

[#IABV2_LABEL_PARTNERS#]

[#IABV2_BODY_PARTNERS_INTRO#]

[#IABV2_BODY_PARTNERS#]

About

Cookies are small text files that can be used by websites to make a user's experience more efficient.

The law states that we can store cookies on your device if they are strictly necessary for the operation of this site. For all other types of cookies we need your permission.

This site uses different types of cookies. Some cookies are placed by third party services that appear on our pages.

You can at any time change or withdraw your consent from the Cookie Declaration on our website.

Learn more about who we are, how you can contact us and how we process personal data in our[Privacy Policy](https://www.kaspersky.com/web-privacy-policy).

Please state your consent ID and date when you contact us regarding your consent.

- [x] 

**Do not sell or share my personal information** 

Allow all cookies Customize Allow selection Use necessary cookies only

Solutions for:

*   [Home Products](https://www.kaspersky.com/home-security?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_prodmen_sm-team_______d5c53f9a5bd411f7)
*   [Small Business 1-50 employees](https://www.kaspersky.com/small-business-security?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_prodmen_sm-team_______d5c53f9a5bd411f7 "font-icons icon-small-business")
*   [Medium Business 51-999 employees](https://www.kaspersky.com/small-to-medium-business-security?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_prodmen_sm-team_______d5c53f9a5bd411f7)
*   [Enterprise 1000+ employees](https://www.kaspersky.com/enterprise-security?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_prodmen_sm-team_______d5c53f9a5bd411f7)

[](https://securelist.com/exiftool-compromise-mac/119866/)[](https://securelist.com/exiftool-compromise-mac/119866/)

[](https://securelist.com/)by Kaspersky

*   [CompanyAccount](https://companyaccount.kaspersky.com/account/login?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
*   [Get In Touch](https://www.kaspersky.com/enterprise-security/contact?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
*   [Dark mode off](https://securelist.com/exiftool-compromise-mac/119866/#)
*   [English](https://securelist.com/exiftool-compromise-mac/119866/#)
    *   [Russian](https://securelist.ru/exiftool-compromise-mac/115659/)
    *   [Spanish](https://securelist.lat/)
    *   [Brazil](https://securelist.com.br/)

*   [Solutions](https://www.kaspersky.com/enterprise-security?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
    *           *   [![Image 30](https://securelist.com/wp-content/themes/securelist2020/assets/images/enterprise-menu-icons/iot-embed-security.png)](https://www.kaspersky.com/enterprise-security/embedded-security-internet-of-things?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Internet of Things & Embedded Security](https://www.kaspersky.com/enterprise-security/embedded-security-internet-of-things?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Learn More](https://www.kaspersky.com/enterprise-security/embedded-security-internet-of-things?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f) 
        *   [![Image 31](https://securelist.com/wp-content/themes/securelist2020/assets/images/enterprise-menu-icons/transportation-cybersecurity.png)](https://www.kaspersky.com/enterprise-security/industrial-solution?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Industrial Cybersecurity](https://www.kaspersky.com/enterprise-security/industrial-solution?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Learn More](https://www.kaspersky.com/enterprise-security/industrial-solution?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f) 
        *   [![Image 32](https://securelist.com/wp-content/themes/securelist2020/assets/images/enterprise-menu-icons/fraud-prevention.png)](https://www.kaspersky.com/enterprise-security/fraud-prevention?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Fraud Prevention](https://www.kaspersky.com/enterprise-security/fraud-prevention?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Learn More](https://www.kaspersky.com/enterprise-security/fraud-prevention?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f) 
        *   [KasperskyOS-based solutions](https://www.kaspersky.com/enterprise-security/kasperskyos?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Learn More](https://www.kaspersky.com/enterprise-security/kasperskyos?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f) 

    *           *   ###### Other solutions

        *   [Kaspersky for Security Operations Center](https://www.kaspersky.com/enterprise-security/security-operations-center-soc?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
        *   [Kaspersky IoT Infrastructure Security](https://www.kaspersky.com/enterprise-security/kaspersky-iot-infrastructure-security?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
        *   [Kaspersky Secure Remote Workspace](https://www.kaspersky.com/enterprise-security/kaspersky-secure-remote-workspace?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)

*   [Industries](https://www.kaspersky.com/enterprise-security/industries?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
    *           *   [![Image 33](https://securelist.com/wp-content/themes/securelist2020/assets/images/enterprise-menu-icons/national-cybersecurity.png)](https://www.kaspersky.com/enterprise-security/national-cybersecurity?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[National Cybersecurity](https://www.kaspersky.com/enterprise-security/national-cybersecurity?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Learn More](https://www.kaspersky.com/enterprise-security/national-cybersecurity?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f) 
        *   [![Image 34](https://securelist.com/wp-content/themes/securelist2020/assets/images/enterprise-menu-icons/industrial-cybersecurity.png)](https://www.kaspersky.com/enterprise-security/industrial?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Industrial Cybersecurity](https://www.kaspersky.com/enterprise-security/industrial?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Learn More](https://www.kaspersky.com/enterprise-security/industrial?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f) 
        *   [![Image 35](https://securelist.com/wp-content/themes/securelist2020/assets/images/enterprise-menu-icons/financial-cybersecurity.png)](https://www.kaspersky.com/enterprise-security/finance?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Finance Services Cybersecurity](https://www.kaspersky.com/enterprise-security/finance?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Learn More](https://www.kaspersky.com/enterprise-security/finance?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f) 
        *   [![Image 36](https://securelist.com/wp-content/themes/securelist2020/assets/images/enterprise-menu-icons/healthcare-cybersecurity.png)](https://www.kaspersky.com/enterprise-security/healthcare?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Healthcare Cybersecurity](https://www.kaspersky.com/enterprise-security/healthcare?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Learn More](https://www.kaspersky.com/enterprise-security/healthcare?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f) 
        *   [![Image 37](https://securelist.com/wp-content/themes/securelist2020/assets/images/enterprise-menu-icons/transportation-cybersecurity.png)](https://www.kaspersky.com/enterprise-security/transportation-cybersecurity-it-infrastructure?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Transportation Cybersecurity](https://www.kaspersky.com/enterprise-security/transportation-cybersecurity-it-infrastructure?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Learn More](https://www.kaspersky.com/enterprise-security/transportation-cybersecurity-it-infrastructure?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f) 
        *   [![Image 38](https://securelist.com/wp-content/themes/securelist2020/assets/images/enterprise-menu-icons/retail-cybersecurity.png)](https://www.kaspersky.com/enterprise-security/retail-cybersecurity?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Retail Cybersecurity](https://www.kaspersky.com/enterprise-security/retail-cybersecurity?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Learn More](https://www.kaspersky.com/enterprise-security/retail-cybersecurity?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f) 

    *           *   ###### Other Industries

        *   [Telecom Cybersecurity](https://www.kaspersky.com/enterprise-security/telecom?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
        *   [View all](https://www.kaspersky.com/enterprise-security/industries?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)

*   [Products](https://www.kaspersky.com/enterprise-security/products?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
    *           *   [![Image 39](https://media.kasperskydaily.com/wp-content/uploads/sites/92/2024/04/10052437/k_Next_RGB_black_icon.png)Kaspersky Next NEW!](https://www.kaspersky.com/next?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Learn More](https://www.kaspersky.com/next?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f) 
        *   [Kaspersky XDR](https://www.kaspersky.com/enterprise-security/xdr?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Learn More](https://www.kaspersky.com/enterprise-security/xdr?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f) 
        *   [![Image 40](https://securelist.com/wp-content/themes/securelist2020/assets/images/enterprise-menu-icons/endpoint-security_products.png)](https://www.kaspersky.com/enterprise-security/endpoint?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Kaspersky Endpoint Security for Business](https://www.kaspersky.com/enterprise-security/endpoint?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Learn More](https://www.kaspersky.com/enterprise-security/endpoint?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f) 
        *   [![Image 41](https://securelist.com/wp-content/themes/securelist2020/assets/images/enterprise-menu-icons/endpoint-detection-and-response.png)](https://www.kaspersky.com/enterprise-security/endpoint-detection-response-edr?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Kaspersky EDR Expert](https://www.kaspersky.com/enterprise-security/endpoint-detection-response-edr?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Learn More](https://www.kaspersky.com/enterprise-security/endpoint-detection-response-edr?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f) 
        *   [![Image 42](https://securelist.com/wp-content/themes/securelist2020/assets/images/enterprise-menu-icons/hybrid-cloud-security_products.png)](https://www.kaspersky.com/enterprise-security/edr-security-software-solution?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Kaspersky EDR Optimum](https://www.kaspersky.com/enterprise-security/edr-security-software-solution?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Learn More](https://www.kaspersky.com/enterprise-security/edr-security-software-solution?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f) 
        *   [![Image 43](https://securelist.com/wp-content/themes/securelist2020/assets/images/enterprise-menu-icons/anti-targeted-attack-platform.png)](https://www.kaspersky.com/enterprise-security/anti-targeted-attack-platform?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Kaspersky Anti Targeted Attack Platform](https://www.kaspersky.com/enterprise-security/anti-targeted-attack-platform?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Learn More](https://www.kaspersky.com/enterprise-security/anti-targeted-attack-platform?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f) 
        *   [Kaspersky Hybrid Cloud Security](https://www.kaspersky.com/enterprise-security/cloud-security?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Learn More](https://www.kaspersky.com/enterprise-security/cloud-security?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f) 
        *   [Kaspersky SD-WAN](https://www.kaspersky.com/enterprise-security/sd-wan?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Learn More](https://www.kaspersky.com/enterprise-security/sd-wan?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f) 
        *   [![Image 44](https://securelist.com/wp-content/themes/securelist2020/assets/images/enterprise-menu-icons/private-security-network.png)](https://www.kaspersky.com/enterprise-security/industrial-cybersecurity?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Kaspersky Industrial CyberSecurity](https://www.kaspersky.com/enterprise-security/industrial-cybersecurity?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Learn More](https://www.kaspersky.com/enterprise-security/industrial-cybersecurity?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f) 
        *   [![Image 45](https://securelist.com/wp-content/themes/securelist2020/assets/images/enterprise-menu-icons/embedded-systems-security.png)](https://www.kaspersky.com/enterprise-security/container-security?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Kaspersky Container Security](https://www.kaspersky.com/enterprise-security/container-security?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Learn More](https://www.kaspersky.com/enterprise-security/container-security?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f) 

    *           *   ###### Other Products

        *   [Kaspersky Security for Internet Gateway](https://www.kaspersky.com/enterprise-security/products/internet-gateway?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
        *   [Kaspersky Embedded Systems Security](https://www.kaspersky.com/enterprise-security/embedded-systems?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
        *   [Kaspersky IoT Infrastructure Security](https://www.kaspersky.com/enterprise-security/kaspersky-iot-infrastructure-security?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
        *   [Kaspersky Secure Remote Workspace](https://www.kaspersky.com/enterprise-security/kaspersky-secure-remote-workspace?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
        *   [Kaspersky Security for Mail Server](https://www.kaspersky.com/enterprise-security/mail-server-security?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
        *   [View All](https://www.kaspersky.com/enterprise-security/products?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)

*   [Services](https://www.kaspersky.com/enterprise-security/services?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
    *           *   [![Image 46](https://securelist.com/wp-content/themes/securelist2020/assets/images/enterprise-menu-icons/cybersecurity-services.png)](https://www.kaspersky.com/enterprise-security/cybersecurity-services?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Kaspersky Cybersecurity Services](https://www.kaspersky.com/enterprise-security/cybersecurity-services?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Learn More](https://www.kaspersky.com/enterprise-security/cybersecurity-services?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f) 
        *   [Kaspersky Security Awareness](https://www.kaspersky.com/enterprise-security/security-awareness?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Learn More](https://www.kaspersky.com/enterprise-security/security-awareness?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f) 
        *   [![Image 47](https://securelist.com/wp-content/themes/securelist2020/assets/images/enterprise-menu-icons/premium-support.png)](https://www.kaspersky.com/enterprise-security/premium-support?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Kaspersky Premium Support](https://www.kaspersky.com/enterprise-security/premium-support?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Learn More](https://www.kaspersky.com/enterprise-security/premium-support?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f) 
        *   [![Image 48](https://securelist.com/wp-content/themes/securelist2020/assets/images/enterprise-menu-icons/threat-intelligence.png)](https://www.kaspersky.com/enterprise-security/threat-intelligence?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Kaspersky Threat Intelligence](https://www.kaspersky.com/enterprise-security/threat-intelligence?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Learn More](https://www.kaspersky.com/enterprise-security/threat-intelligence?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f) 
        *   [![Image 49](https://securelist.com/wp-content/themes/securelist2020/assets/images/enterprise-menu-icons/incident-response.png)](https://www.kaspersky.com/enterprise-security/managed-detection-and-response?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Kaspersky Managed Detection and Response](https://www.kaspersky.com/enterprise-security/managed-detection-and-response?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Learn More](https://www.kaspersky.com/enterprise-security/managed-detection-and-response?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f) 
        *   [![Image 50](https://securelist.com/wp-content/themes/securelist2020/assets/images/enterprise-menu-icons/threat-hunting.png)](https://www.kaspersky.com/enterprise-security/compromise-assessment?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Kaspersky Compromise Assessment](https://www.kaspersky.com/enterprise-security/compromise-assessment?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Learn More](https://www.kaspersky.com/enterprise-security/compromise-assessment?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f) 
        *   [![Image 51](https://securelist.com/wp-content/themes/securelist2020/assets/images/enterprise-menu-icons/threat-hunting.png)](https://www.kaspersky.com/enterprise-security/soc-consulting?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Kaspersky SOC Consulting](https://www.kaspersky.com/enterprise-security/soc-consulting?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)[Learn More](https://www.kaspersky.com/enterprise-security/soc-consulting?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f) 

    *           *   ###### Other Services

        *   [Kaspersky Professional Services](https://www.kaspersky.com/enterprise-security/professional-services?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
        *   [Kaspersky Incident Response](https://www.kaspersky.com/enterprise-security/incident-response?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
        *   [Kaspersky Cybersecurity Training](https://www.kaspersky.com/enterprise-security/cyber-security-training?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
        *   [View All](https://www.kaspersky.com/enterprise-security/services?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)

*   [Resource Center](https://www.kaspersky.com/enterprise-security/resources?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
    *   [Case Studies](https://www.kaspersky.com/enterprise-security/resources/case-studies?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
    *   [White Papers](https://www.kaspersky.com/enterprise-security/resources/white-papers?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
    *   [Datasheets](https://www.kaspersky.com/enterprise-security/resources/data-sheets?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
    *   [Technologies](https://www.kaspersky.com/enterprise-security/wiki-section/home?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
    *   [MITRE ATT&CK](https://www.kaspersky.com/MITRE?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)

*   [About Us](https://www.kaspersky.com/about?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
    *   [Transparency](https://www.kaspersky.com/about/transparency?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
    *   [Corporate News](https://www.kaspersky.com/about/press-releases?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
    *   [Press Center](https://press.kaspersky.com/?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
    *   [Careers](https://www.kaspersky.com/about/careers?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
    *   [Sponsorship](https://www.kaspersky.com/about/sponsorships/?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
    *   [Policy Blog](https://www.kaspersky.com/about/policy-blog?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
    *   [Contacts](https://www.kaspersky.com/about/contact?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)

*   [GDPR](https://www.kaspersky.com/gdpr?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)

*   [Dark mode off](https://securelist.com/exiftool-compromise-mac/119866/#)
*   Securelist menu
*   [English](https://securelist.com/exiftool-compromise-mac/119866/#)
    *   [Russian](https://securelist.ru/exiftool-compromise-mac/115659/)
    *   [Spanish](https://securelist.lat/)
    *   [Brazil](https://securelist.com.br/)

*   [Existing Customers](https://securelist.com/exiftool-compromise-mac/119866/#)
    *   [Personal](https://securelist.com/exiftool-compromise-mac/119866/#)
        *   [My Kaspersky](https://my.kaspersky.com/?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)
        *   [Renew your product](https://www.kaspersky.com/renewal-center/home?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)
        *   [Update your product](https://www.kaspersky.com/downloads?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)
        *   [Customer support](https://support.kaspersky.com/?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)

    *   [Business](https://securelist.com/exiftool-compromise-mac/119866/#)
        *   [KSOS portal](https://ksos.kaspersky.com/?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)
        *   [Kaspersky Business Hub](https://cloud.kaspersky.com/?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)
        *   [Technical Support](https://support.kaspersky.com/?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)
        *   [Knowledge Base](https://www.kaspersky.com/small-to-medium-business-security/resources?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)
        *   [Renew License](https://www.kaspersky.com/renewal-center/vsb?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)

*   [Home](https://securelist.com/exiftool-compromise-mac/119866/#)
    *   [Products](https://www.kaspersky.com/home-security?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)
    *   [Trials&Update](https://www.kaspersky.com/downloads?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)
    *   [Resource Center](https://www.kaspersky.com/resource-center?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)

*   [Business](https://securelist.com/exiftool-compromise-mac/119866/#)
    *   [Kaspersky Next](https://www.kaspersky.com/next?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)
    *   [Small Business (1-50 employees)](https://www.kaspersky.com/small-business-security?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)
    *   [Medium Business (51-999 employees)](https://www.kaspersky.com/small-to-medium-business-security?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)
    *   [Enterprise (1000+ employees)](https://www.kaspersky.com/enterprise-security?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)

*   Securelist
*   [Threats](https://securelist.com/threat-categories/)
    *   [Financial threats](https://securelist.com/threat-category/financial-threats/)
    *   [Mobile threats](https://securelist.com/threat-category/mobile-threats/)
    *   [Web threats](https://securelist.com/threat-category/web-threats/)
    *   [Secure environment (IoT)](https://securelist.com/threat-category/secure-environment/)
    *   [Vulnerabilities and exploits](https://securelist.com/threat-category/vulnerabilities-and-exploits/)
    *   [Spam and Phishing](https://securelist.com/threat-category/spam-and-phishing/)
    *   [Industrial threats](https://securelist.com/threat-category/industrial-threats/)

*   [Categories](https://securelist.com/categories/)
    *   [APT reports](https://securelist.com/category/apt-reports/)
    *   [Incidents](https://securelist.com/category/incidents/)
    *   [Research](https://securelist.com/category/research/)
    *   [Malware reports](https://securelist.com/category/malware-reports/)
    *   [Spam and phishing reports](https://securelist.com/category/spam-and-phishing-reports/)
    *   [Publications](https://securelist.com/category/publications/)
    *   [Kaspersky Security Bulletin](https://securelist.com/category/kaspersky-security-bulletin/)

*   [Archive](https://securelist.com/all/)
*   [All Tags](https://securelist.com/tags/)
*   [APT Logbook](https://apt.securelist.com/?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)
*   [Webinars](https://securelist.com/webinars/)
*   [Statistics](https://statistics.securelist.com/?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)
*   [Encyclopedia](https://encyclopedia.kaspersky.com/?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)
*   [Threats descriptions](https://threats.kaspersky.com/?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)
*   [KSB 2021](https://securelist.com/ksb-2021/)

*   [About Us](https://securelist.com/exiftool-compromise-mac/119866/#)
    *   [Company](https://www.kaspersky.com/about/company?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)
    *   [Transparency](https://www.kaspersky.com/transparency?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)
    *   [Corporate News](https://www.kaspersky.com/about/press-releases?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)
    *   [Press Center](https://press.kaspersky.com/?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)
    *   [Careers](https://www.kaspersky.com/about/careers?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)
    *   [Sponsorships](https://www.kaspersky.com/about/sponsorships/?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)
    *   [Policy Blog](https://www.kaspersky.com/about/policy-blog?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)
    *   [Contacts](https://www.kaspersky.com/about/contact?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)

*   [Partners](https://securelist.com/exiftool-compromise-mac/119866/#)
    *   [Find a Partner](https://www.kasperskypartners.com/?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)
    *   [Partner Program](https://www.kaspersky.com/partners?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_mobmen_sm-team_______03880766cb97f3a8)

[Content menu Close](https://securelist.com/exiftool-compromise-mac/119866/#)

[Subscribe](https://securelist.com/exiftool-compromise-mac/119866/#modal-newsletter)

[](https://securelist.com/)by Kaspersky

[Dark mode off](https://securelist.com/exiftool-compromise-mac/119866/#)

[Threats](https://securelist.com/threat-categories/)

Threats

*   [APT (Targeted attacks)](https://securelist.com/threat-category/apt-targeted-attacks/)
*   [Secure environment (IoT)](https://securelist.com/threat-category/secure-environment/)
*   [Mobile threats](https://securelist.com/threat-category/mobile-threats/)
*   [Financial threats](https://securelist.com/threat-category/financial-threats/)
*   [Spam and phishing](https://securelist.com/threat-category/spam-and-phishing/)
*   [Industrial threats](https://securelist.com/threat-category/industrial-threats/)
*   [Web threats](https://securelist.com/threat-category/web-threats/)
*   [Vulnerabilities and exploits](https://securelist.com/threat-category/vulnerabilities-and-exploits/)
*   [All threats](https://securelist.com/threat-categories/)

[Categories](https://securelist.com/categories/)

Categories

*   [APT reports](https://securelist.com/category/apt-reports/)
*   [Malware descriptions](https://securelist.com/category/malware-descriptions/)
*   [Security Bulletin](https://securelist.com/category/kaspersky-security-bulletin/)
*   [Malware reports](https://securelist.com/category/malware-reports/)
*   [Spam and phishing reports](https://securelist.com/category/spam-and-phishing-reports/)
*   [Security technologies](https://securelist.com/category/security-technologies/)
*   [Research](https://securelist.com/category/research/)
*   [Publications](https://securelist.com/category/publications/)
*   [All categories](https://securelist.com/categories/)

[Other sections](https://securelist.com/exiftool-compromise-mac/119866/)

*   [Archive](https://securelist.com/all/)
*   [All tags](https://securelist.com/tags/)
*   [Webinars](https://securelist.com/webinars/)
*   [APT Logbook](https://apt.securelist.com/?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
*   [Statistics](https://statistics.securelist.com/?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
*   [Encyclopedia](https://encyclopedia.kaspersky.com/?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
*   [Threats descriptions](https://threats.kaspersky.com/?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
*   [KSB 2025](https://lp.kaspersky.com/global/ksb2025/)
*   [Kaspersky ICS CERT](https://ics-cert.kaspersky.com/?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)

![Image 52: exiftools featured](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/19160550/exiftools-featured-800x450.jpg)
[GReAT research](https://securelist.com/category/great-research/)

# How an image could compromise your Mac: understanding an ExifTool vulnerability (CVE-2026-3102)

[GReAT research](https://securelist.com/category/great-research/)

20 May 2026

7 minute read

*   [![Image 53](https://securelist.com/wp-content/themes/securelist2020/assets/images/avatar-default/avatar_default_2.png)Lucas Tay](https://securelist.com/author/lucastay/)

![Image 54](https://securelist.com/wp-content/themes/securelist2020/assets/images/icon/icon-categories.svg)

![Image 55](https://securelist.com/wp-content/themes/securelist2020/assets/images/icon/icon-categories--invert.svg)

Table of Contents

*   [Introduction](https://securelist.com/exiftool-compromise-mac/119866/#introduction)
*   [Technical details](https://securelist.com/exiftool-compromise-mac/119866/#technical-details)

    *   [Disclaimer](https://securelist.com/exiftool-compromise-mac/119866/#disclaimer)
    *   [Tracing the vulnerable sink](https://securelist.com/exiftool-compromise-mac/119866/#tracing-the-vulnerable-sink)
    *   [Finding an unsanitized date value](https://securelist.com/exiftool-compromise-mac/119866/#finding-an-unsanitized-date-value)
    *   [Planning the payload delivery](https://securelist.com/exiftool-compromise-mac/119866/#planning-the-payload-delivery)
    *   [Bypassing the filter](https://securelist.com/exiftool-compromise-mac/119866/#bypassing-the-filter)
    *   [Triggering the exploit](https://securelist.com/exiftool-compromise-mac/119866/#triggering-the-exploit)

*   [Patch analysis](https://securelist.com/exiftool-compromise-mac/119866/#patch-analysis)
*   [How to protect against ExifTool vulnerability](https://securelist.com/exiftool-compromise-mac/119866/#how-to-protect-against-exiftool-vulnerability)
*   [Conclusions](https://securelist.com/exiftool-compromise-mac/119866/#conclusions)

![Image 56: exiftools featured](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/19160550/exiftools-featured-1200x600.jpg)

Authors

*   [![Image 57](https://securelist.com/wp-content/themes/securelist2020/assets/images/avatar-default/avatar_default_1.png)Lucas Tay](https://securelist.com/author/lucastay/)

## Introduction

[ExifTool](https://securelist.com/exiftool-compromise-mac/119866/) is a widely adopted utility for reading and writing metadata in image, PDF, audio, and video files. It is available both as a standalone command-line application and as a library that can be embedded in other software. In this article, we break down [CVE-2026-3102](https://nvd.nist.gov/vuln/detail/CVE-2026-3102), an ExifTool vulnerability discovered by Kaspersky’s Global Research and Analysis Team (GReAT) in February 2026 and patched by the developers within the same month. Affecting macOS systems with ExifTool version 13.49 and earlier, this flaw could let an attacker run arbitrary commands by hiding instructions inside an image file’s metadata.

This investigation originated from revisiting an n-day vulnerability I first examined years ago: [CVE-2021-22204](https://nvd.nist.gov/vuln/detail/cve-2021-22204). That flaw exploited weak regex-based sanitization before feeding user input into an eval sink. By auditing adjacent input validation routines across ExifTool codebase for similar oversights, I discovered [CVE-2026-3102](https://nvd.nist.gov/vuln/detail/CVE-2026-3102). Successful exploitation of CVE-2026-3102 enables an attacker to execute arbitrary shell commands with the privileges of the user invoking ExifTool, potentially leading to full system compromise.

## Technical details

### Disclaimer

Exploiting CVE-2026-3102 requires the `-n` (also known as `-printConv`) flag and outputs machine-readable data without additional processing.

### Tracing the vulnerable sink

Taint analysis (aka tainted data analysis) allows for the detection of “dirty” data that reaches dangerous locations without validation. In this context, a “sink” is a point or function in a program where data or a parameter marked as “tainted” or originating from an untrusted source (e.g., user input) can affect the program’s behavior. In ExifTool, these functions are `eval` and `system`, both of which are capable of executing system commands. While CVE-2021-22204 exploited an eval function as a sink, this vulnerability (CVE-2026-3102) targets the system function. Knowing the vulnerable sink, we needed to trace how user-controlled data reaches it. Below, we break down the details.

[![Image 58](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/19160759/exiftools1.png)](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/19160759/exiftools1.png)

### Finding an unsanitized date value

The screenshot above shows where the system() sink resides within the `SetMacOSTags` function. Tracing backward from `system()`, we identified the $cmd variable as the source of the executed command. This variable is assembled from three inputs: `$file` (properly sanitized), `$setTags` (processed iteratively), and `$val` (user-controlled and, crucially, left unsanitized in the vulnerable branch).

In ExifTool, a tag is a named metadata field. When parsing an image, the utility extracts date and time values from standard EXIF records or macOS filesystem attributes. To handle file creation dates on macOS, ExifTool relies on the Spotlight system attribute `MDItemFSCreationDate`. Within the program code, this attribute maps to the internal alias $FileCreateDate. These two identifiers govern how the file creation date is stored and applied.

This creates a critical link to the vulnerability: when parsing an image, ExifTool iterates through the discovered tags. The current tag’s name is assigned to the $tag variable, while its text content (e.g., a date string) is assigned to $val. The vulnerable code path is triggered only when $tag matches `MDItemFSCreationDate` or `$FileCreateDate`. At this point, the tag’s content flows into $val and is passed to the SetMacOSTags function. As shown in the screenshot below, the filename parameter is properly escaped, but the date value (`$val`) is not. Because the date is extracted directly from file metadata, an attacker can inject quotes into this field. This breaks the command structure and allows the payload to execute via the `system()` sink.

The following screenshots show some of the tags that can be modified. With the vulnerable parameter identified, the next challenge was delivery: how to place our payload into `FileCreateDate` without triggering early validation? We found the answer in the official documentation.

[![Image 59](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/19160925/exiftools3.png)](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/19160925/exiftools3.png)

[![Image 60](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/19160956/exiftools4.png)](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/19160956/exiftools4.png)

### Planning the payload delivery

Let’s refer to the [documentation](https://exiftool.org/exiftool_pod.html) to understand how ExifTool handles tag operations and identify a legitimate feature that can be repurposed for exploitation. Specifically, we need to find a way to deliver our payload into the vulnerable FileCreateDate parameter. When looking for macOS-related tags as well as FileCreateDate, we can find the following information:

*   To write or delete metadata, tag values are assigned using –_TAG_=[_VALUE_], and/or the`-geotag`,`-csv=` or`-json=`
*   To copy or move metadata, the`-tagsFromFile` feature is used.

(You can find the useful info on tag operations above and how it relates under the hood in ExifTool in the [dedicated section of the documentation](https://exiftool.org/exiftool_pod.html#Tag-operations) and on the [ExifTool description page](https://exiftool.org/under.html).)

To trigger the vulnerability, we need to copy a string (date format: `MM/DD/YYYY`) using the `-tagsFromFile` feature, as this operation invokes the SetMacOSTags function where the unsanitized `$val` parameter reaches the `system()` sink.

Why copy instead of writing directly? Because the vulnerable code path (`SetMacOSTags`) is only triggered when metadata is copied into `FileCreateDate` — not when it is written directly. By using `-tagsFromFile`, we can prepare a “source” tag (e.g., `DateTimeOriginal`) that accepts arbitrary values and copy that value into `FileCreateDate`, thereby invoking the vulnerable function with our controlled input.

Furthermore, we want to introduce single quotes (since they are not being escaped in `$val`). For starters, we can look for date-time tag and copy via `-tagsFromFile` by searching the EXIF tag table. Direct assignment to `FileCreateDate` is heavily validated, so we looked for a source tag that accepts raw values and can be copied into the target field. The following snippet shows the beginning of said table.

[![Image 61](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/19161242/exiftools7.png)](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/19161242/exiftools7.png)

When doing the analysis, I made use of DateTimeOriginal though I believe you can also use CreateDate which is `0x9004` (see the following screenshot). Initial attempts to inject malformed dates failed: ExifTool’s built-in filter rejected the input. To bypass this, we examined how the tool handles raw metadata.

[![Image 62](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/19161347/exiftools8.png)](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/19161347/exiftools8.png)

### Bypassing the filter

To confirm that the PrintConvInv filter rejects invalid dates when written directly, I ran the following command, where `evil_benign.jpg` is a normal JPG with an invalid date time format. We are greeted with the error message: `Invalid date/time`. This requires the time as well. The next screenshot confirms that direct exploitation fails: ExifTool’s date validation detects the malformed input and rejects the change, activating the internal `PrintConvInv` filter.

[![Image 63](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/19161421/exiftools10.png)](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/19161421/exiftools10.png)

That said, it is possible to ignore the formatting and use the `-n` flag which accepts raw values instead of human-readable value. The `-n` flag skips the `PrintConvInv` conversion step, which is exactly where input sanitization occurs. This confirmed we could park unsanitized data in a source tag. The final step was to trigger the vulnerable code path by copying that data into `FileCreateDate`. This means we should now be able to modify the DateTimeOriginal tag with the invalid date time format with an `-n` flag. Examining the EXIF metadata tag, we can confirm that we can store a raw value without a proper human readable format that ExifTool accepts:

### Triggering the exploit

[![Image 64](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/19161735/exiftools12.png)](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/19161735/exiftools12.png)

To inject commands, we have to revisit the single quote injection into this datetime related tag.

The following screenshot shows that we have successfully set the datetime metadata with the single quote. With the payload safely stored in a source tag, the next step was to copy it into `FileCreateDate`, triggering the vulnerable `system() call`.

[![Image 65](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/19161539/exiftools14.png)](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/19161539/exiftools14.png)

[![Image 66](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/19161808/exiftools15.png)](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/19161808/exiftools15.png)

The next step now is to copy the datetime tag to a file which invokes `SetMacOSTags`. According to the documentation, this is how we can copy the data from the SRC tag to the FileCreateDate tag as seen in the SetMacOSTags with the `-tagsFromFile` feature.

1 exiftool[ _OPTIONS_ ]-tagsFromFile _SRCFILE _[-[ _DSTTAG_ <] _SRCTAG_ ...] _FILE_ ...

Therefore, we can craft our final command:

1

2 cp evil_benign.jpg pwn.jpg;

../../exiftool-n-tagsFromFile evil_benign.jpg"-FileCreateDate<DateTimeOriginal"pwn.jpg

Here, we confirm that the payload has been executed! Note that when copying tags in MacOS (Darwin), the `/usr/bin/setfile` command is used. To view the full $cmd value before the injection, I have added the debugging statement to displaying the actual command that is executed within the system function.

[![Image 67](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/19161901/exiftools16.png)](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/19161901/exiftools16.png)

Upon injection, we can see that our command gets executed via command substitution. The single quotes that we added helped to make the entire command syntactically valid. The following shows a more detailed labelling and their roles in making this command line injection successful:

[![Image 68](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/19161926/exiftools18.png)](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/19161926/exiftools18.png)

Such an image can appear completely benign and easily find its way into a newsroom or any organization that processes photos on macOS using ExifTool. Once processed, an attacker could silently deploy a Trojan for covert data exfiltration, drop additional malware, or use the compromised machine as a foothold to expand the attack within the victim’s network.

## Patch analysis

After verifying successful exploitation, we examined how the maintainer addressed the flaw in version 13.50. In the vulnerable version of ExifTool, commands were sanitized before being concatenated together. This means that it is possible to concatenate single quotes which led to the exploitation. However, by abstracting the system call into a dedicated wrapper and requiring a list of arguments instead of concatenated string, the fix removes the need for any manual escaping altogether.

1. Replacing string form to argument list form:

1

2

3

4

5

6#### BEFORE

$cmd="/usr/bin/setfile -d '${val}' '${f}'";

system$cmd;

#### AFTER

system('/usr/bin/setfile','-d',$val,$file);

2. Create new `System()` wrapper. In version 13.49, the output is piped to `/dev/null` . To maintain that logic, the wrapper would temporarily redirect `STDOUT`/`STDERR` to `/dev/null` and restore them after the call.

1

2

3

4

5

6

7

8

9

10

11

12

13

14# Call system command, redirecting all I/O to /dev/null

# Inputs: system arguments

# Returns: system return code

sub System

{

open(my$oldout,">&STDOUT");

open(my$olderr,">&STDERR");

open(STDOUT,'>','/dev/null');

open(STDERR,'>','/dev/null');

my$result=system(@_);

open(STDOUT,">&",$oldout);

open(STDERR,">&",$olderr);

return$result;

}

## How to protect against ExifTool vulnerability

It’s critical to ensure that all photo processing workflows are using the updated version. You should verify that all asset management platforms, photo organization apps, and any bulk image processing scripts running on Macs are calling ExifTool version 13.50 or later, and don’t contain an embedded older copy of the ExifTool library.

ExifTool, like any software, may contain additional vulnerabilities of this class. To harden defenses, I recommend using [Kaspersky Open Source Software Threats Data Feed](https://www.kaspersky.com/open-source-feed?icid=gl_sl_open-source-feed-lnk_sm-team_9f2df07be7fe6194) for continuous monitoring of open-source components in your software supply chain, and [Kaspersky for macOS](https://www.kaspersky.com/mac-antivirus?icid=gl_sl_mac-antivirus-lnk_sm-team_3544891285e6d3b1) as comprehensive endpoint protection. Additionally, isolate processing of untrusted files on dedicated machines or virtual environments with strictly limited network and storage access. If you work with freelancers, contractors, or allow BYOD, enforce a policy that only devices with an active macOS security solution can access your corporate network.

## Conclusions

CVE-2026-3102 highlights the risks of inconsistent input sanitization in tools that bridge high-level metadata parsing with platform-specific utilities. While exploitation requires explicit flag usage (`-n`) and is restricted to macOS, the vulnerability underscores the danger of manual escaping routines in evolving codebases. The transition to list-form system execution provides a robust, architecture-level fix that eliminates shell interpretation risks entirely. This case reinforces a core security principle: replacing fragile string concatenation with secure, list-based API calls remains the most reliable mitigation against command injection.

*   [Vulnerabilities and exploits](https://securelist.com/tag/vulnerabilities-and-exploits/)
*   [Zero-day vulnerabilities](https://securelist.com/tag/zero-day-vulnerabilities/)
*   [Apple MacOS](https://securelist.com/tag/apple-macos/)
*   [ExifTool](https://securelist.com/tag/exiftool/)

How an image could compromise your Mac: understanding an ExifTool vulnerability (CVE-2026-3102)

Your email address will not be published.Required fields are marked *

Name *

Email *

Captcha validation failed. Please confirm you are not a robot and try again.

[Cancel](https://securelist.com/exiftool-compromise-mac/119866/#respond)

Δ

This site uses Akismet to reduce spam. [Learn how your comment data is processed.](https://akismet.com/privacy/)

![Image 69](https://securelist.com/wp-content/themes/securelist2020/assets/images/icon/icon-categories.svg)

![Image 70](https://securelist.com/wp-content/themes/securelist2020/assets/images/icon/icon-categories--invert.svg)

Table of Contents

*   [Introduction](https://securelist.com/exiftool-compromise-mac/119866/#introduction)
*   [Technical details](https://securelist.com/exiftool-compromise-mac/119866/#technical-details)

    *   [Disclaimer](https://securelist.com/exiftool-compromise-mac/119866/#disclaimer)
    *   [Tracing the vulnerable sink](https://securelist.com/exiftool-compromise-mac/119866/#tracing-the-vulnerable-sink)
    *   [Finding an unsanitized date value](https://securelist.com/exiftool-compromise-mac/119866/#finding-an-unsanitized-date-value)
    *   [Planning the payload delivery](https://securelist.com/exiftool-compromise-mac/119866/#planning-the-payload-delivery)
    *   [Bypassing the filter](https://securelist.com/exiftool-compromise-mac/119866/#bypassing-the-filter)
    *   [Triggering the exploit](https://securelist.com/exiftool-compromise-mac/119866/#triggering-the-exploit)

*   [Patch analysis](https://securelist.com/exiftool-compromise-mac/119866/#patch-analysis)
*   [How to protect against ExifTool vulnerability](https://securelist.com/exiftool-compromise-mac/119866/#how-to-protect-against-exiftool-vulnerability)
*   [Conclusions](https://securelist.com/exiftool-compromise-mac/119866/#conclusions)

In the same category

[![Image 71](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/14081540/SL-Kimsuki-featured-800x450.jpg)](https://securelist.com/kimsuky-appleseed-pebbledash-campaigns/119785/)

### [Kimsuky targets organizations with PebbleDash-based tools](https://securelist.com/kimsuky-appleseed-pebbledash-campaigns/119785/)

[![Image 72](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/04/04194912/SL-OceanLotus-featured-800x450.jpg)](https://securelist.com/oceanlotus-suspected-pypi-zichatbot-campaign/119603/)

### [OceanLotus suspected of using PyPI to deliver ZiChatBot malware](https://securelist.com/oceanlotus-suspected-pypi-zichatbot-campaign/119603/)

[![Image 73](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/04/13084332/janelarat-featured-image-800x450.jpg)](https://securelist.com/janelarat-financial-threat-in-latin-america/119332/)

### [JanelaRAT: a financial threat targeting users in Latin America](https://securelist.com/janelarat-financial-threat-in-latin-america/119332/)

[![Image 74](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/03/25105135/coruna-featured-image-800x450.jpg)](https://securelist.com/coruna-framework-updated-operation-triangulation-exploit/119228/)

### [Coruna: the framework used in Operation Triangulation](https://securelist.com/coruna-framework-updated-operation-triangulation-exploit/119228/)

[![Image 75](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/03/16084357/gopix-featured-image-800x450.jpg)](https://securelist.com/gopix-banking-trojan/119173/)

### [Free real estate: GoPix, the banking Trojan living off your memory](https://securelist.com/gopix-banking-trojan/119173/)

*   [![Image 76](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2025/11/01102245/NEXT-Optimum_banner_310%D1%85420.png)](https://www.kaspersky.com/next-optimum?icid=gl_sl_knext_sm-team_e4d5a46b667f40e5) 

##### Latest Posts

[![Image 77](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/14081540/SL-Kimsuki-featured-800x450.jpg)](https://securelist.com/kimsuky-appleseed-pebbledash-campaigns/119785/)

[GReAT research](https://securelist.com/category/great-research/)

### [Kimsuky targets organizations with PebbleDash-based tools](https://securelist.com/kimsuky-appleseed-pebbledash-campaigns/119785/)

*   [Sojun Ryu](https://securelist.com/author/sojunryu/)

[![Image 78](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/08142445/SL-ransomware-report-2026-featured-800x450.jpg)](https://securelist.com/state-of-ransomware-in-2026/119761/)

[Publications](https://securelist.com/category/publications/)

### [State of ransomware in 2026](https://securelist.com/state-of-ransomware-in-2026/119761/)

*   [Fabio Assolini](https://securelist.com/author/fabioa/)
*   [Marc Rivero](https://securelist.com/author/marcrivero/)
*   [Maher Yamout](https://securelist.com/author/maheryamout/)
*   [Darya Gorodilova](https://securelist.com/author/daryagorodilova/)

[![Image 79](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/07125309/SL-RCE-in-xrdp-featured-800x450.jpg)](https://securelist.com/cve-2025-68670/119742/)

[Vulnerability reports](https://securelist.com/category/vulnerability-reports/)

### [CVE-2025-68670: discovering an RCE vulnerability in xrdp](https://securelist.com/cve-2025-68670/119742/)

*   [Denis Skvortsov](https://securelist.com/author/denisskvortsov/)
*   [Dmitry Shmoylov](https://securelist.com/author/dmitryshmoylov/)

[![Image 80](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/07075134/exploits-report-q1-2026-featured-image-800x450.jpg)](https://securelist.com/vulnerabilities-and-exploits-in-q1-2026/119733/)

[Vulnerability reports](https://securelist.com/category/vulnerability-reports/)

### [Exploits and vulnerabilities in Q1 2026](https://securelist.com/vulnerabilities-and-exploits-in-q1-2026/119733/)

*   [Alexander Kolesnikov](https://securelist.com/author/alexanderalkolesnikov/)

##### Latest Webinars

[![Image 81](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/18154502/zeroday-webinar_featured.jpg)](https://securelist.com/webinars/how-do-we-catch-0-days/)

[Trainings and workshops](https://securelist.com/webinar-category/trainings-and-workshops/)

 05 May 2026, 5:00pm 47 min

### [How do we catch 0-days?](https://securelist.com/webinars/how-do-we-catch-0-days/)

*   [Boris Larin](https://securelist.com/author/borislarin/)

[![Image 82](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/05/18151755/webinar_SOC-evolution_featured-800x450.jpg)](https://securelist.com/webinars/soc-evolution-from-firefighting-to-strategic-risk-management/)

[Trainings and workshops](https://securelist.com/webinar-category/trainings-and-workshops/)

 30 Apr 2026, 2:00pm 61 min

### [SOC evolution: From firefighting to strategic risk management](https://securelist.com/webinars/soc-evolution-from-firefighting-to-strategic-risk-management/)

*   [Roman Nazarov](https://securelist.com/author/romannazarov/)
*   [Alexander Mazikin](https://securelist.com/author/alexandermazikin/)
*   [Alexander Marmalidi](https://securelist.com/author/alexandermarmalidi/)

[![Image 83](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/04/22135853/webinar_1024x576-1-800x450.jpg)](https://securelist.com/webinars/the-power-of-enrichment-boosting-your-product-with-threat-intelligence/)

[Technologies and services](https://securelist.com/webinar-category/technologies-and-services/)

 16 Apr 2026, 1:00pm 119 min

### [The power of enrichment: Boosting your product with threat intelligence](https://securelist.com/webinars/the-power-of-enrichment-boosting-your-product-with-threat-intelligence/)

*   [Dmitry Taygind](https://securelist.com/author/dmitrytaygind/)
*   [Oleg Shaburov](https://securelist.com/author/olegshaburov/)

[![Image 84](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2026/04/22133437/webinar_1024x576-800x450.jpg)](https://securelist.com/webinars/2026-cyber-world-inside-the-attackers-playbook/)

[Cyberthreat talks](https://securelist.com/webinar-category/cyberthreat-talks/)

 24 Mar 2026, 4:00pm 68 min

### [2026 cyber world: Inside the attacker’s playbook](https://securelist.com/webinars/2026-cyber-world-inside-the-attackers-playbook/)

*   [Sergey Soldatov](https://securelist.com/author/sergeysoldatov/)
*   [Konstantin Sapronov](https://securelist.com/author/konstantinsapronov/)

##### Reports

### [Kimsuky targets organizations with PebbleDash-based tools](https://securelist.com/kimsuky-appleseed-pebbledash-campaigns/119785/)

Kaspersky researchers analyze a range of new PebbleDash-based tools used in recent Kimsuky campaigns and reveal their connection to the AppleSeed malware cluster.

### [OceanLotus suspected of using PyPI to deliver ZiChatBot malware](https://securelist.com/oceanlotus-suspected-pypi-zichatbot-campaign/119603/)

Kaspersky researchers uncovered malicious wheel packages in PyPI that targeted both Windows and Linux and contained a dropper delivering malware dubbed ZiChatBot. We attribute this activity to OceanLotus APT.

### [Silver Fox uses the new ABCDoor backdoor to target organizations in Russia and India](https://securelist.com/silver-fox-tax-notification-campaign/119575/)

The Silver Fox group is targeting companies in Russia and India by impersonating tax authorities to distribute ValleyRAT and the new ABCDoor backdoor.

### [HoneyMyte updates CoolClient and deploys multiple stealers in recent campaigns](https://securelist.com/honeymyte-updates-coolclient-uses-browser-stealers-and-scripts/118664/)

Kaspersky researchers analyze updated CoolClient backdoor and new tools and scripts used in HoneyMyte (aka Mustang Panda or Bronze President) APT campaigns, including three variants of a browser data stealer.

[![Image 85](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2020/12/18100122/Kaspersky-NEXT-2026_370x500.jpg)](https://lp.kaspersky.com/global/next/?icid=gl_sl_NextHero2026_sm-team_cbff6db20a65e744)

[![Image 86](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2020/12/18100137/Kaspersky-NEXT-2026_1080x1080-740x740.png)](https://lp.kaspersky.com/global/next/?icid=gl_sl_NextHero2026_sm-team_cbff6db20a65e744)

##### Subscribe to our weekly e-mails

The hottest research right in your inbox

Email(Required) 

(Required)

- [x] I agree to provide my email address to “AO Kaspersky Lab” to receive information about new posts on the site. I understand that I can withdraw this consent at any time via e-mail by clicking the “unsubscribe” link that I find at the bottom of any e-mail sent to me for the purposes mentioned above. 

Subscribe

Δ

[![Image 87](https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2020/12/18100137/Kaspersky-NEXT-2026_1080x1080-740x740.png)](https://lp.kaspersky.com/global/next/?icid=gl_sl_NextHero2026_sm-team_cbff6db20a65e744)

[Threats](https://securelist.com/threat-categories/)

Threats

*   [APT (Targeted attacks)](https://securelist.com/threat-category/apt-targeted-attacks/)
*   [Secure environment (IoT)](https://securelist.com/threat-category/secure-environment/)
*   [Mobile threats](https://securelist.com/threat-category/mobile-threats/)
*   [Financial threats](https://securelist.com/threat-category/financial-threats/)
*   [Spam and phishing](https://securelist.com/threat-category/spam-and-phishing/)
*   [Industrial threats](https://securelist.com/threat-category/industrial-threats/)
*   [Web threats](https://securelist.com/threat-category/web-threats/)
*   [Vulnerabilities and exploits](https://securelist.com/threat-category/vulnerabilities-and-exploits/)
*   [All threats](https://securelist.com/threat-categories/)

[Categories](https://securelist.com/categories/)

Categories

*   [APT reports](https://securelist.com/category/apt-reports/)
*   [Malware descriptions](https://securelist.com/category/malware-descriptions/)
*   [Security Bulletin](https://securelist.com/category/kaspersky-security-bulletin/)
*   [Malware reports](https://securelist.com/category/malware-reports/)
*   [Spam and phishing reports](https://securelist.com/category/spam-and-phishing-reports/)
*   [Security technologies](https://securelist.com/category/security-technologies/)
*   [Research](https://securelist.com/category/research/)
*   [Publications](https://securelist.com/category/publications/)
*   [All categories](https://securelist.com/categories/)

[Other sections](https://securelist.com/exiftool-compromise-mac/119866/)

*   [Archive](https://securelist.com/all/)
*   [All tags](https://securelist.com/tags/)
*   [Webinars](https://securelist.com/webinars/)
*   [APT Logbook](https://apt.securelist.com/?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
*   [Statistics](https://statistics.securelist.com/?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
*   [Encyclopedia](https://encyclopedia.kaspersky.com/?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
*   [Threats descriptions](https://threats.kaspersky.com/?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)
*   [KSB 2025](https://lp.kaspersky.com/global/ksb2025/)
*   [Kaspersky ICS CERT](https://ics-cert.kaspersky.com/?icid=gl_seclistheader_acq_ona_smm__onl_b2b_securelist_main-menu_sm-team_______001391deb99c290f)

© 2026 AO Kaspersky Lab. All Rights Reserved.

 Registered trademarks and service marks are the property of their respective owners.

*   [Privacy Policy](https://www.kaspersky.com/web-privacy-policy?icid=gl_seclistfooter_acq_ona_smm__onl_b2b_securelist_footer_sm-team_______11d7a8212d94123d)
*   [Terms of use](https://securelist.com/terms-of-use/)
*   [License Agreement](https://www.kaspersky.com/end-user-license-agreement?icid=gl_seclistfooter_acq_ona_smm__onl_b2b_securelist_footer_sm-team_______11d7a8212d94123d)
*   [Cookies](javascript: void(0);)
