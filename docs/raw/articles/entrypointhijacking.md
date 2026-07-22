---
source: newsletter
source_url: https://ipurple.team/2026/05/13/entrypoint-hijacking/
tags: [article]
title: EntryPoint Hijacking
sha256: 28ea10170d4435c75d3826ccf976887b8ae3fc151eafc5ac111dcebd900ceb0e
review_value: 7
review_confidence: 8
review_recommendation: worth-reading
review_stars: 3
ingested: 2026-05-15
---
Published Time: 2026-05-13T12:25:17+00:00
Markdown Content:
The technique of EntryPoint Hijacking introduces a stealthier approach to code injection, as it doesn’t rely on API calls that create a new thread within the process context, and it is independent of the attack chain. Arbitrary code is written to memory, but it executes only when the process legitimately creates a new thread. This enables threat actors to evade EDR defenses and extend their dwell time within the environment.
## Playbook
Windows processes dynamically load multiple modules (DLLs) into memory at runtime. Each module contains a **_DllMain()_**function that the operating system automatically invokes in response to process and thread creation or termination events. The Windows loader function (_**ntdll!Lrdp***_) maintains a record of each DLL loaded, with its properties to manage these invocations, including the **EntryPoint** address. Sophisticated threat actors can overwrite the _EntryPoint_ function of the targeted DLL to redirect the execution flow to attacker-controlled code whenever the loader function calls the _DllMain()_. However, hijacking the _EntryPoint_ introduces challenges for threat actors, such as process stability issues, race conditions and crashes.
[Kurosh Dabbagh Escalante](https://x.com/_Kudaes_) released the [EPI](https://github.com/Kudaes/EPI) (EntryPoint Injection) proof of concept in 2023 and introduced a documented method to abuse the _EntryPoint_ property of a DLL. EPI patches the _EntryPoint_ of a loaded DLL (_kernelbase.dll_) and uses the _QueueUserWorkItem_ from inside the redirected _EntryPoint_. The malicious code is executed on a thread-pool thread. [Hugo Valette](https://x.com/RWXstoned) approached the same technique during x33fcon 2025, and released two proof-of-concepts examples called [LdrShuffle](https://github.com/RWXstoned/LdrShuffle), demonstrating EntryPoint Hijacking within the same and remote processes. It should be noted that _LdrShuffle_ handles the execution differently, even though both proof of concepts hijack the same property.
Windows identifies the _DllMain()_ of DLLs via the _EntryPoint_ property. Purple team operators can identify the memory address of the _EntryPoint_ by executing the following commands. In the example below, the _kernelbase.dll_ was used.
![Image 1](https://ipurple.team/wp-content/uploads/2026/05/entrypoint-hijacking-identify-dll-entrypoint.png?w=1024)
_DLL EntryPoint_
The code of the _LdrShuffle_ has been analysed to understand the technique internals. The _**DontCallForThreads == 0**_ is a boolean configuration check that allows thread-related calls in the process. If the setting is set to 1, threading is blocked. It should be highlighted that more complex APIs such as the _InternetOpenW_ will cause the process to crash due to thread-syncing issues (deadlocks). Therefore, APIs receiving C2 callbacks must run in a separate thread. The i>5 is used to skip from hijacking the first five DLLs of the process for stability reasons.
The _EntryPoint_ is restored promptly to prevent process crashes.
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
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35`BOOL``RestoreLdr(IN``ULONG_PTR``dllBase) {`
`#ifdef _WIN64`
```PPEB pPeb = (PPEB)(__readgsqword(0x60));`
`#elif _WIN32`
```PPEB pPeb = (PPEB)(__readgsqword(0x30));`
`#endif`
```PDATA_T pDataT = NULL;`
```PEB_LDR_DATA* pPebLdr = (PEB_LDR_DATA*)pPeb->pLdr;`
```PLDR_DATA_TABLE_ENTRY2 pDte = (PLDR_DATA_TABLE_ENTRY2)((``ULONG_PTR``)pPebLdr->InMemoryOrderModuleList.Flink - 0x10);`
```while``(pDte) {`
```if``(pDte->BaseDllName.Length != NULL) {`
```if``(pDte->DllBase == (``PVOID``)dllBase) {`
```pDataT = (PDATA_T)pDte->OriginalBase;`
```pDte->EntryPoint = (PLDR_INIT_ROUTINE)pDataT->bakEntryPoint;`
```pDte->OriginalBase = pDataT->bakOriginalBase;`
```return``TRUE;`
```}`
```}`
```else``{`
```break``;`
```}`
```pDte = *(PLDR_DATA_TABLE_ENTRY2*)(pDte);`
```}`
```return``FALSE;`
`}`
Execution and arguments are passed via a Runner(), a helper application that is invoked to conduct API calls. The data structure resides in the heap, a dynamically managed region where a process allocates and frees memory at runtime. The Runner() accesses this memory region to determine what to execute.
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
13`typedef``struct``_DATA_T {`
```ULONG_PTR``runner;`
```ULONG_PTR``bakOriginalBase;`
```ULONG_PTR``bakEntryPoint;`
```HANDLE``event;`
```ULONG_PTR``ret;`
```DWORD``createThread;`
```ULONG_PTR``function;`
```DWORD``dwArgs;`
```ULONG_PTR``args[MAX_ARGS];`
`} DATA_T, * PDATA_T;`
The _LdrShuffle_ proof of concept can be executed from a console with no arguments to conduct the process injecting within the same process.
![Image 2](https://ipurple.team/wp-content/uploads/2026/05/entrypoint-hijacking-ldrshuffle-messagebox.png?w=930)
_LdrShuffle – EntryPoint Hijacking_
The second proof-of-concept released (part of the _LdrShuffle_ repository) enables operators to target a remote process within the system and inject shellcode.
![Image 3](https://ipurple.team/wp-content/uploads/2026/05/entrypoint-hijacking-ldrinject-shellcode.png?w=880)
_LdrInject – Shellcode_
![Image 4](https://ipurple.team/wp-content/uploads/2026/05/entrypoint-hijacking-ldrinject.png?w=889)
_LdrInject_
The diagram below visualizes the technique internals:
![Image 5](https://ipurple.team/wp-content/uploads/2026/05/entrypoint-hijacking-technique-internals.png?w=1024)
_EntryPoint Hijacking – Technique Internals_
Similarly, the EPI proof of concept allocates a memory space and writes a loader that decrypts, allocates, and runs the shellcode reliably. The PEB of the target address is then patched, and execution occurs using the process thread pool, to prevent new threads point to the shellcode for evasion. It should be noted that the loader restores the PEB to its previous state to enable the process to continue its normal execution.
`epi.exe -p 6832`![Image 6](https://ipurple.team/wp-content/uploads/2026/05/entrypoint-hijacking-entrypoint-injection.png?w=601)
_EntryPoint Injection – PoC_
Similarly, the _EntryPoint_ hijack is the _iPurple_ version that emulates the technique. The tool lists all running processes and prompts the user to enter the target PID for injection.
![Image 7](https://ipurple.team/wp-content/uploads/2026/05/entrypoint-hijacking-remote-process-injection.png?w=727)
_EntryPoint Hijack – Remote Process Injection_
The proof of concepts uses the _NtQueryInformationProcess_ API to retrieve the PEB address of the target process and patches the _EntryPoint_ of the _kernelbase.dll_.
![Image 8](https://ipurple.team/wp-content/uploads/2026/05/entrypoint-hijacking-entrypoint-hijack.png?w=585)
_EntryPoint Hijack_
![Image 9](https://ipurple.team/wp-content/uploads/2026/05/entrypoint-hijacking-messagebox.png?w=973)
_EntryPoint Hijacking – MessageBox_
The diagram below visualizes the stages of _EntryPoint_ Hijacking technique.
![Image 10](https://ipurple.team/wp-content/uploads/2026/05/entrypoint-hijacking.png?w=1024)
_EntryPoint Hijacking – Diagram_
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
14
15
16`[``[``Playbook.EntryPoint Hijacking``]``]`
`id =``"1.0.0"`
`name =``"1.0.0 - EntryPoint Hijacking"`
`description =``"Inject code to the EntryPoint property of a legitimate DLL module"`
`tooling.name =``"LdrInject, EPI"`
`tooling.references =``[`
`]`
`executionSteps =``[`
```"LdrInject.exe <PID> <shellcode>.bin"`
```"epi.exe -p <PID>"`
`]`
`executionRequirements =``[`
```"None"`
`]`
## Detection
Modification and restoration of the _EntryPoint_ is a core behaviour of the EntryPoint Hijacking technique. However, since the _EntryPoint_ is restored, a point-in-time memory scan by the EDR will only detect the technique if it occurs during the small hijack window. Effective detection requires combining integrity checks on PEB loader structures, detection of the runner stub in private memory, and telemetry on the write (_WriteProcessMemory_) primitive.
A reliable detection requires to compare the _OriginalBase_ with _DllBase_ so if **OriginalBase != DllBase** the entry point has been tampered.
The _LdrShuffleDetect_ (a detection-based tool) runs continuously on the target and every 10 seconds all the processes are scanned. The tool takes a snapshot of all processes running on the host by using the _CreateToolhelp32Snapshot_ API. The functions _Process32FirstW_ and _Process32NextW_ enumerate the list of processes.
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
13`HANDLE``hSnap = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);`
```if``(hSnap == INVALID_HANDLE_VALUE)``return``procs;`
```PROCESSENTRY32W pe = {``sizeof``(pe)};`
```if``(Process32FirstW(hSnap, &pe)) {`
```do``{`
```if``(pe.th32ProcessID == 0 || pe.th32ProcessID == 4)``continue``;`
```ProcEntry e;`
```e.pid = pe.th32ProcessID;`
```wcscpy_s(e.name, pe.szExeFile);`
```procs.push_back(e);`
```}``while``(Process32NextW(hSnap, &pe));`
```}`
A handle to the targeted process or processes is opened via the _OpenProcess_ API to query process/processes information and read the memory of these processes via _ReadProcessMemory_ API calls.
1
2
3
4
5
6`HANDLE``hTmp = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION,`
```FALSE, targetPid);`
```if``(hTmp) {`
```DWORD``sz = MAX_PATH;`
```QueryFullProcessImageNameW(hTmp, 0, e.name, &sz);`
```CloseHandle(hTmp);`
A series of _ReadProcessMemory_ calls is performed to read process memory starting from the PEB address, including the _`LDR\_DATA\_TABLE\_ENTRY`_ to obtain the _Entrypoint_ address, and monitors for any changes. The tool can be executed from the command line and raises an alert when one or more of the three conditions are met:
1.   The memory address of the _EntryPoint_ property is outside the range of the `DllBase`.
2.   The _EntryPoint_ memory type is changed from `MEM_IMAGE (0x1000000)` to `MEM_PRIVATE (0x20000)`for shellcodes running in private heap. 
3.   The `OriginalBase` is not valid.
The tool was executed against the two publicly available proof of concepts (LdrShuflle + EPI) and the private tool from iPurple `EntryPointHijacking`, and has successfully detected all _EntryPoint_ hijacking attempts.
![Image 11](https://ipurple.team/wp-content/uploads/2026/05/entrypoint-hijacking-ldrshuffledetect.png?w=924)
_LdrShuffleDetect_
![Image 12](https://ipurple.team/wp-content/uploads/2026/05/entrypoint-hijacking-entrypoint-injection-detection.png?w=955)
_EntryPoint Injection – Detection_
![Image 13](https://ipurple.team/wp-content/uploads/2026/05/entrypoint-hijacking-detection.png?w=958)
_EntryPoint Hijacking – Detection_
The table below summarizes the conditions that trigger an alert during _EntryPoint_ tampering.
| Condition | Activity | Confidence |
| --- | --- | --- |
| 1, 2, 3 | All three conditions fail | Critical |
| 1, 2 | EP outside memory range & Private Memory | Critical |
| 3 | OriginalBase is a heap pointer | High |
| 2 | EntryPoint is not in image memory | Medium |
| None | All checks pass | Clean |
Running _LdrShuffleDetect_ on a schedule against high-value processes (lsass, browsers, office, EDR) that beacon externally offers an effective detection method for _EntryPoint_ Hijacking.
Another indicator of EntryPoint Hijacking is to hunt for handles opened with _GrantedAccess_ containing 0x143A and correlate this behaviour with outbound traffic from these processes. The access mask 0x143A grants the caller process permissions to read (PROCESS_VM_READ), write (PROCESS_VM_WRITE), and manipulate (PROCESS_VM_OPERATION) the target image process. The _GrantedAccess_ field is contained under Sysmon Event ID 10.
![Image 14](https://ipurple.team/wp-content/uploads/2026/05/entrypoint-hijacking-sysmon.png?w=1024)
_Sysmon Event ID 10_
The code injection technique of _EntryPoint_ Hijacking is pushing the boundaries of in-memory detection capabilities. Endpoint Detection and Response technologies should no longer chase common APIs that are used in malware, but correlate multiple other behaviours to identify tampering of the _EntryPoint_ property. Organizations that want to elevate their detection capabilities should include _EntryPoint Hijacking_ in their purple team operations backlog, in order to investigate if their EDR deployment can detect this code injection technique effectively.
Alternatively, if the current implementation of the EDR technology lacks this capability, organizations should consider the replication of the detection proof-of-concept and deployment across multiple endpoints with log-forwarding to their SIEM for early threat detection. Detecting threats during initial access enables SOC teams to respond and isolate threats faster, reducing the blast radius of a breach.