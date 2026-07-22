---
source_url: "https://eaton-works.com/2026/06/24/jnj-webapp-hacks""
ingested: 2026-06-26
sha256: 7a979827e144cf17
---

# Exploiting vulnerabilities in Johnson & Johnson web apps


Published Time: 2026-06-24T16:11:49Z

Markdown Content:
![Image 1](https://eaton-works.com/assets/images/ew-logo-4circle-48.png?cb=64e21a35)
Eaton•Jun 24, 2026

Today I am revealing vulnerabilities I found in 2 very different Johnson & Johnson web apps. One is a vulnerability in a college campus recruiting system that exposed details of nearly 1,000 students, and the other is an admin takeover of an internal audit system used by 20 companies. Let’s dive in!

## **#1: Campus Recruiting**

You know those career fairs and recruiting events on college campuses? JnJ likes to go to these to scout new talent. They built a “Campus Recruiting” website to manage these events:

![Image 2](https://eaton-works.com/cdn-cgi/imagedelivery/VwwCqBIYNXeyNQwEQ8uyVQ/ba6c2346-1e1f-45fc-450a-72556beecc00/full)
Students are given an event key and they use it to submit their information:

![Image 3](https://eaton-works.com/cdn-cgi/imagedelivery/VwwCqBIYNXeyNQwEQ8uyVQ/f1c6032f-49c7-48db-4811-aa2e932b9f00/full)
Nothing particularly exciting… until you look at the underlying code of the website, where you can find some interesting private recruiter routes!

![Image 4](https://eaton-works.com/cdn-cgi/imagedelivery/VwwCqBIYNXeyNQwEQ8uyVQ/b8e88109-a7bb-4dcd-e3c1-47b0052b8e00/full)
When you go to “/recruiter”, you are sent to the Microsoft SSO login page, confirming this part of the site is restricted to JnJ employees:

![Image 5](https://eaton-works.com/cdn-cgi/imagedelivery/VwwCqBIYNXeyNQwEQ8uyVQ/662127e2-852c-4e81-a54e-2e25c60e2300/full)
The authentication setup is really simple. The [Microsoft Authentication Library (MSAL)](https://learn.microsoft.com/en-us/entra/identity-platform/msal-overview) is integrated into the frontend and it is in charge of making sure an employee is logged in:

![Image 6](https://eaton-works.com/cdn-cgi/imagedelivery/VwwCqBIYNXeyNQwEQ8uyVQ/67470316-baf0-453e-40e9-9003acc14300/full)
One client-side trick that often helps me expose insecure web apps is to hack MSAL into always thinking someone is logged in. If there are underlying APIs that do not use the token correctly, this helps discover such issues quickly. In this case, all I had to do was modify the MSAL code to always return details of 1 account that is “logged in”:

![Image 7](https://eaton-works.com/cdn-cgi/imagedelivery/VwwCqBIYNXeyNQwEQ8uyVQ/f08db078-2da9-4710-b9f7-73c5b69a4b00/full)
Once done, the private recruiter routes were accessible. You could manage the events, create new ones, and view all the students’ information. The recruiter dashboard also lets you see the ratings and notes they give to specific students they interview:

What went wrong: the MSAL token was not actually used anywhere. Instead, a hardcoded API key was used to authenticate to their AWS APIs:

![Image 8](https://eaton-works.com/cdn-cgi/imagedelivery/VwwCqBIYNXeyNQwEQ8uyVQ/6911354b-2399-4dfa-dd69-0fb4b4e99d00/full)![Image 9](https://eaton-works.com/cdn-cgi/imagedelivery/VwwCqBIYNXeyNQwEQ8uyVQ/97950f83-844c-47ca-4b55-4873eb4d0900/full)

_There were nearly 1,000 students impacted._

The Campus Recruiting site has since been updated to replace API key authentication with Bearer token (MSAL) authentication.

## **#2 Audit Tracking Management System**

![Image 10](https://eaton-works.com/cdn-cgi/imagedelivery/VwwCqBIYNXeyNQwEQ8uyVQ/15534807-0ea1-4f55-768d-51c304d0a100/full)
The Audit Tracking Management System (ATMS) is an internal web app to aid in managing audits across all of JnJ and their associated companies:

1.   LifeScan
2.   Ethicon, Inc
3.   Biosense Webster
4.   ITS
5.   Depuy
6.   Ethicon-Endo
7.   Janssen
8.   Vistakon
9.   Acclarent
10.   JDx
11.   Sterilmed
12.   CLS
13.   JJSV
14.   Cerenovus
15.   EQ
16.   Janssen UK & Ireland
17.   RAD
18.   Abiomed Inc.
19.   CQ MedTech
20.   V-Wave

This one required a bit more work to get into compared to Campus Recruiting. Immediately when visiting the site, you are redirected to the Microsoft SSO login page. Before this happens, the ReactJS app is downloaded and many interesting APIs could be found:

![Image 11](https://eaton-works.com/cdn-cgi/imagedelivery/VwwCqBIYNXeyNQwEQ8uyVQ/06faf1e8-e213-4026-1128-ba236c3abc00/full)
I decided to visit the “getAllUsers” API to see what would happen. It returned a list of 13.6k JnJ employees:

![Image 12](https://eaton-works.com/cdn-cgi/imagedelivery/VwwCqBIYNXeyNQwEQ8uyVQ/6d5ea956-6640-46d6-533c-ba4b1a633200/full)
That was huge because it indicated all the APIs were unauthenticated, and it was just a matter of hacking up the client-side code to get full access to everything.

This is what the authentication code looked like. Like Campus Recruiting, it uses MSAL to authenticate the user using Microsoft SSO, and then it sets some values to local storage. There is no sign of it using the Bearer token, which is good for us!

![Image 13](https://eaton-works.com/cdn-cgi/imagedelivery/VwwCqBIYNXeyNQwEQ8uyVQ/834344c3-1eb9-44f9-64d7-aae6cc9e3400/full)
For a user spoof to work correctly, I needed to find a username and WWID of a valid JnJ employee that uses this system. Preferably one with a lot of permissions. I came across the help page that gave me the details of the system administrator:

![Image 14](https://eaton-works.com/cdn-cgi/imagedelivery/VwwCqBIYNXeyNQwEQ8uyVQ/a672b861-e1e9-422c-ae0a-dc79b65d9d00/full)
Searching that name against users in the getAllUsers API revealed the information I needed, and a patch was devised:

![Image 15](https://eaton-works.com/cdn-cgi/imagedelivery/VwwCqBIYNXeyNQwEQ8uyVQ/7c0d14d6-7779-4614-ec00-54810cbdb700/full)
This stops the login redirect and sets hardcoded values into local storage as if a valid login had just taken place. This resulted in something new showing up:

![Image 16](https://eaton-works.com/cdn-cgi/imagedelivery/VwwCqBIYNXeyNQwEQ8uyVQ/b949504b-e469-4d4c-5064-b1161ddd0100/full)
Clicking OK was not the solution. Back into the code we go…

![Image 17](https://eaton-works.com/cdn-cgi/imagedelivery/VwwCqBIYNXeyNQwEQ8uyVQ/1171680d-1c0f-4b7d-dcdb-b1d4b81d8900/full)
That is the code that creates a session. It is just a GET request to an API that returns a session GUID, and sets a timestamp for the purpose of calculating its expiry. Visiting that API, it returned a valid session ID:

![Image 18](https://eaton-works.com/cdn-cgi/imagedelivery/VwwCqBIYNXeyNQwEQ8uyVQ/442395c0-785f-47e8-38d8-254d2a8d3a00/full)
I then plugged that in manually with a valid timestamp…

![Image 19](https://eaton-works.com/cdn-cgi/imagedelivery/VwwCqBIYNXeyNQwEQ8uyVQ/2faf7de6-b1ad-4815-ee37-54b87a200100/full)
Refreshed, and I was in!

![Image 20](https://eaton-works.com/cdn-cgi/imagedelivery/VwwCqBIYNXeyNQwEQ8uyVQ/cd857292-4314-41b0-6134-8ca10b486100/full)
You can use the drop-down to switch between companies:

![Image 21](https://eaton-works.com/cdn-cgi/imagedelivery/VwwCqBIYNXeyNQwEQ8uyVQ/ab70d4e1-0225-48e2-f05b-f232c565be00/full)
As admin, I had access to a special menu:

![Image 22](https://eaton-works.com/cdn-cgi/imagedelivery/VwwCqBIYNXeyNQwEQ8uyVQ/9325ff0b-9825-40a6-a718-bd2232185800/full)
And that is about the extent of what I explored. The system is packed full of presumably confidential information and transcripts. Even from all the way over in Russia. Due to various confidentiality warnings, I have opted to not show any internal meeting minutes or transcripts here.

Bonus: they used a rather dumb client-side encryption scheme to try and obscure some secret values. Ironically, it seems this auditing system never received an audit itself if code like this ends up being published:

## **Timeline**

The last time I reported a security vulnerability to JnJ was [back in 2024](https://eaton-works.com/2024/05/16/jnj-mobility-hack/). The experience I had back then was stellar – they took immediate action and were a true pleasure to work with. Fast forward to reporting these 2 vulnerabilities, the experience was less positive.

Both vulnerabilities were reported to them in October 2025. By the end of the month, the