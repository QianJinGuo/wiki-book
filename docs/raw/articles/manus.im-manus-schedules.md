---
title: Introducing Scheduled Tasks 2.0
type: entity
tags: [article]
created: 2026-05-20
updated: 2026-05-20
source: newsletter
source_url: https://manus.im/blog/manus-schedules
sha256: e83aa6377155d049e105aae92e04e9ef51a777a351098749919209d7bed7e7de
---
# Introducing Scheduled Tasks 2.0
Markdown Content:
Scheduled Tasks 2.0 upgrades recurring work across tasks, Projects, and web apps, so automation can run with the right context instead of simply repeating on a clock.
## Scheduled Tasks Works Better With the Right Context
When people hear “scheduled task,” the idea feels easy to understand: take a task and run it again at a set time. Run it every day. Run it every week. Run it at 9 AM. The first version of Scheduled Tasks solved that problem. Daily digests, weekly reports, recurring scans, and routine summaries could run through Manus without being started manually each time.
But once scheduled work moves into different product contexts, the concept becomes more nuanced.
Sometimes, you want Manus to update data for a web app every day. Sometimes, you want a fixed automation to run on a daily cadence. Sometimes, you do not want a new task at all. You want Manus to return to the same conversation, send the next message there, and use the context that already exists.
At that point, scheduled work is no longer only about when something runs. It is also about where it runs, what context it carries forward, and which artifact it should keep updating.
Scheduled Tasks 2.0 is a broader upgrade for that reality. It brings scheduling into more places and more contexts: scheduled work can continue inside the same task, web apps built with Manus can have scheduled actions, and new views make upcoming and past runs easier to follow.
![Image 1: Scheduled Tasks 2.0 launch cover showing task automation and web app automation in Manus](https://files.manuscdn.com/assets/dashboard/materials/2026/05/18/b6ac2fd8fcb7a55a799c8c3b865f4319b61b9bb34721e078f3c0fe411dc03c16.webp)
## Continue Inside the Same Task
Many recurring workflows are not independent events. A daily standup, recurring follow-up, status check, research thread, or dashboard update may depend on the instructions, files, decisions, and past results already built inside a task.
In the old version, each run could become a new standalone task. That made the work run on time, but it did not always connect naturally back to the original work. Users still had to find results across separate tasks, rebuild context, or restate the artifact they wanted Manus to maintain.
Now, scheduled work can stay inside the same task context. Manus can continue from the task’s existing instructions, files, conversation, and results, instead of starting from zero each time.
For work organized in Projects, scheduled tasks can also reuse the shared setup already defined there, including files, skills, connectors, instructions, and output standards. The schedule follows the place where the work lives, not just the time on the calendar.
## Add Scheduled Actions to Web Apps
Another important context is the web app itself. Web apps built with Manus can now include scheduled actions of their own. This is useful when an app needs to refresh data, run a script, update a dashboard, send a reminder, or generate a recurring summary.
The important change is that scheduling becomes part of the app’s behavior. Users do not need to open the page just to keep routine work moving. If an app needs to update data every morning or generate a report every week, Manus can add that schedule to the app itself.
![Image 2: Background scheduled task interface in a web app built with Manus](https://files.manuscdn.com/assets/dashboard/materials/2026/05/18/6e0537bc8de8ba6443495f40efe1c040e825e5984c1b6407a2dcbdda144a5bdb.webp)
## Make Every Run Easier to Follow
As scheduled tasks move into more contexts, visibility becomes more important. Users need to know not only whether something will run on time, but also what is coming next, what already ran, and where to inspect the result of each run.
Scheduled Tasks 2.0 adds clearer ways to review schedules, upcoming runs, and run history. The side panel shows scheduled work and the runs connected to it. Schedule and calendar views make timing easier to understand. A run card or label can take users back to the related task, so they can inspect the result of a specific execution.
![Image 3: Calendar view for recurring work in Manus](https://files.manuscdn.com/assets/dashboard/materials/2026/05/18/cc182bd9d0200df64737cdbd5dbd2079e1891cf75c3e22cc07b78898122ca505.webp)
## Choose How Each Schedule Runs
When a scheduled task is more than a time setting, the edit screen needs to give users more control. Scheduled Tasks 2.0 lets users adjust the prompt, timing, and advanced settings from one place, so a recurring task is easier to tune after it has been created.
The key controls are straightforward. Run options let users choose whether each run continues in the same task or starts as a separate task. Skip confirmations lets trusted workflows proceed without asking for approval before sending, publishing, or posting. Connectors let a scheduled task use connected apps as relevant data sources.
Advanced settings also make the execution environment clearer. Users can choose the agent for the task, attach the schedule to a Project to use its configuration, and use cloud computer resources when the workflow needs them.
![Image 4: Edit scheduled task screen showing skip confirmations, run options, connectors, project, and cloud computer settings](https://files.manuscdn.com/assets/dashboard/materials/2026/05/18/080a280f7da8bc6cfd7b9855b0eac45bbc6a49f1b90a66beb9582449e5042c52.webp)
## What This Upgrade Makes Possible
•Run scheduled work in the same task context: Keep recurring work connected to the task, instructions, files, and history it depends on.
•Choose the right run option: Continue each run in the same task when context matters, or use a separate task when each run should stand on its own.
•Reuse Project setup: Let scheduled tasks use the shared context already defined in a Project, including files, connectors, skills, and output standards.
•Use connected apps as data sources: Add connectors so recurring work can use relevant information from the tools already connected to Manus.
•Skip routine confirmations when appropriate: For trusted workflows, allow Manus to send, publish, or post without asking for approval every time.
•Add schedules to web apps: Give apps built with Manus recurring actions such as data refreshes, script runs, dashboard updates, reminders, and summaries.
•Review schedules from new views: Use the side panel, schedule view, and calendar view to see what is coming next and what already ran.
•Open the result behind a run: Jump from a run card or label into the related task to inspect the output.
## Tell Manus What You Want Scheduled
There is no setup flow to memorize. Go to the place where the recurring work belongs, then tell Manus what you want scheduled.
1.Open the task, Project, or web app where the recurring work belongs.
2.Tell Manus what to do and how often to do it.
3.If the work should keep updating the same artifact, name that artifact clearly, such as the same dashboard, report, or summary.
4.If needed, adjust the schedule settings. You can choose the run option, turn on skip confirmations for trusted workflows, add connectors, select a Project, or choose the execution environment.
5.Use the side panel, schedule view, or calendar view to review upcoming runs and past results.
Example prompts:
•“Every weekday at 9 AM, summarize the open action items in this task and remind me what needs follow-up today.”
•“Every Monday, update the customer feedback summary in this Project using the files and format already here.”
•“In this web app, refresh the dashboard data every morning and generate a short daily summary.”
## Available Now
Scheduled Tasks is now available to all users. In any task, Project, or web app built with Manus where recurring work belongs, you can tell Manus what you want scheduled and it will keep running in the right place.[](https://manus.im/docs/website-builder/getting-started)
### Download desktop & mobile app
Access Manus anytime, anywhere.
![Image 5: Download Manus desktop and mobile app](https://files.manuscdn.com/webapp/_next/static/media/app-download.c3761974.webp)