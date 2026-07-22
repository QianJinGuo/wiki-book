---
title: "incendium fuzzing ms rpc"
source: newsletter
source_url: https://www.incendium.rocks/posts/Fuzzing-MS-RPC-structures-and-monitoring/
source_feed: TLDR AI (newsletter)
ingested: 2026-05-08
review_value: 7
review_confidence: 7
review_verdict: strong
stars: 4
sha256: df577f53d7ee4a83
type: raw
created: 2026-05-10
updated: 2026-05-10
tags: []
---
[](/) [Remco van der Meer](/)
Ethical Hacker, Security researcher
  * [ __ HOME ](/)
  * [ __ CATEGORIES ](/categories/)
  * [ __ TAGS ](/tags/)
  * [ __ ARCHIVES ](/archives/)
  * [ __ CVE'S ](/CVE's/)
  * [ __ TALKS ](/talks/)
  * [ __ ABOUT ](/about/)
__ [ __](https://github.com/1ncendium) [ __](https://www.linkedin.com/in/remco-vandermeer/) [ __](/feed.xml) [ __](https://notes.incendium.rocks/)
[Home](/) Recursively fuzzing MS-RPC structures and monitoring using ETW __
Post
__ __ Cancel
# Recursively fuzzing MS-RPC structures and monitoring using ETW
Updates to the MS-RPC fuzzer includes fuzzing over complex structures and logging using ETW and we found a way to escalate to nt authority\system!
Posted  May 4, 2026 
[](/assets/img/posts/fuzzing-complex-structures/1.png)
By _[Remco van der Meer](https://www.linkedin.com/in/remco-vandermeer/) _
_16 min_ read
Recursively fuzzing MS-RPC structures and monitoring using ETW __
Contents __
Recursively fuzzing MS-RPC structures and monitoring using ETW
__
It’s been a while since I worked on some updates regarding the [MS-RPC-Fuzzer](https://github.com/warpnet/MS-RPC-Fuzzer). I had two idea’s that I wanted to implement and improve:
  1. Recursively Fuzzing complex structures
  2. Support for Union types (all fields named Arm_N)
  3. Logging without the need for ProcMon (Process Monitor) through ETW.
This blog post writes about the implementation for both features and some interesting results that came from these new updates! We discovered a procedure that would load an dll on disk as system by the user provided input. I assume you are already a bit familair with MS-RPC in this post, if not take a look at <https://www.incendium.rocks/posts/Automating-MS-RPC-Vulnerability-Research/> and <https://www.incendium.rocks/posts/Revisiting-MS-RPC-Vulnerability-Research-automation/>.
## Recursively fuzzing complex structures __
In MS-RPC, a structure is a composite data type that groups together multiple fields of potentially different types into a single unit (Integers, Strings, etc), used to pass complex data between a client and server across a remote procedure call. The existing fuzzer could already populate a flat structure, create an instance via reflection and fill each field with a fuzz value. The challenge with nested structures is that each field might itself be a structure that needs the same treatment, potentially multiple levels deep.
NtObjectManager’s generated RPC client types represent the two NDR layouts differently in .NET:
  * Embedded fields - exposed as plain value types (structs). `CLIENT_INFO` above would appear as a struct field directly on `NETWORK_REQUEST`.
  * Pointer fields - wrapped in the generic `NdrEmbeddedPointer<T>`. `pPayload` above would be a field of type `NdrEmbeddedPointer<PAYLOAD_DATA>`.
    classDiagram
        class NETWORK_REQUEST {
            +DWORD requestId
            +DWORD flags
            +CLIENT_INFO clientInfo
            +PAYLOAD_DATA* pPayload
        }
        class CLIENT_INFO {
            +DWORD clientId
            +wchar_t* ipAddress
        }
        class PAYLOAD_DATA {
            +DWORD dataLen
            +byte[] data
        }
        NETWORK_REQUEST *-- CLIENT_INFO : embedded (inline NDR)
        NETWORK_REQUEST o-- PAYLOAD_DATA : pointer (deferred NDR)
### New-FuzzedInstance __
The solution is built from three cooperating functions. First`New-FuzzedInstance`:
____
`
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
| 
     function New-FuzzedInstance {
        ...
        $typeName = $Type.FullName
        if ($Depth -gt 8 -or $Visited -contains $typeName) {
            try { return [System.Activator]::CreateInstance($Type) } catch { return $null }
        }
        $Visited = $Visited + $typeName
        $instance = [System.Activator]::CreateInstance($Type)
        $fields   = @($Type.GetFields([System.Reflection.BindingFlags]'Public,Instance'))
        for ($i = 0; $i -lt $fields.Count; $i++) {
            $value = Get-FuzzFieldValue -Type $fields[$i].FieldType ...
            $fields[$i].SetValue($instance, $value)
        }
        return $instance
    }
`For any complex type, New-FuzzedInstance creates a blank instance via `[System.Activator]::CreateInstance`, then iterates every public instance field and calls `Get-FuzzFieldValue` to produce a fuzz value for it. Two guard rails prevent infinite recursion: a `$Depth` counter (cap at 8) and a `$Visited` set of type names, if a type references itself or has already been visited in the current call chain, it falls back to the blank default instance.
### Get-FuzzFieldValue - the routing layer __
____`| 
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
| 
     function Get-FuzzFieldValue {
        ...
        # NdrEmbeddedPointer<T> - must use op_Implicit, not CreateInstance
        if ($Type.IsGenericType -and $Type.Name -like 'NdrEmbeddedPointer*') {
            return New-NdrEmbeddedPointerValue -ClosedPtrType $Type ...
        }
        # Nested complex type - recurse
        if ($Type.IsValueType -or ($Type.IsClass -and -not $Type.IsAbstract)) {
            return New-FuzzedInstance -Type $Type ... -Depth ($Depth + 1) -Visited $Visited
        }
    }
`This function routes each field type to the right handler. Primitives, strings, integers, enums, and byte arrays are handled with direct value generation. When a field is itself a value type or concrete class (i.e. an embedded structure), `Get-FuzzFieldValue` calls `New-FuzzedInstance` recursively, passing the incremented `$Depth` and the accumulated `$Visited` set. The `NdrEmbeddedPointer<T>` case is deliberately separated out, it needs special treatment.
### New-NdrEmbeddedPointerValue - handling pointer fields __
____`| 
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
| 
     function New-NdrEmbeddedPointerValue {
        ...
        $innerType  = $ClosedPtrType.GetGenericArguments()[0]
        $innerValue = Get-FuzzFieldValue -Type $innerType ... -Depth ($Depth + 1) -Visited $Visited
        $opImplicit = $ClosedPtrType.GetMethod('op_Implicit',
            [System.Reflection.BindingFlags]'Public,Static', $null,
            [System.Type[]]@($innerType), $null)
        if ($opImplicit) {
            return $opImplicit.Invoke($null, @(,$innerValue))
        }
    }
``NdrEmbeddedPointer<T>` has no parameterless constructor, so `[System.Activator]::CreateInstance` fails. The only supported way to instantiate it is through its implicit cast operator from `T`. This helper extracts the inner type `T` from the generic argument, fuzzes a value for it (which may itself be another nested structure, handled by the same recursive chain), and then invokes `op_Implicit` via reflection to wrap the fuzzed value in the pointer type.
### Putting it together __
For`NETWORK_REQUEST`, the call chain looks like this: ____`| 
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
| 
    New-FuzzedInstance(NETWORK_REQUEST)
    ├── Get-FuzzFieldValue(DWORD requestId)       → random Int32
    ├── Get-FuzzFieldValue(DWORD flags)           → random Int32
    ├── Get-FuzzFieldValue(CLIENT_INFO)           → New-FuzzedInstance(CLIENT_INFO)   [embedded]
    │   ├── Get-FuzzFieldValue(DWORD clientId)   → random Int32
    │   └── Get-FuzzFieldValue(wchar_t*)         → New-NdrEmbeddedPointerValue(NdrEmbeddedPointer<String>)
    │       └── Get-FuzzFieldValue(String)       → fuzz string
    └── Get-FuzzFieldValue(NdrEmbeddedPointer<PAYLOAD_DATA>) → New-NdrEmbeddedPointerValue  [pointer]
        └── Get-FuzzFieldValue(PAYLOAD_DATA)     → New-FuzzedInstance(PAYLOAD_DATA)
            ├── Get-FuzzFieldValue(DWORD dataLen) → random Int32
            └── Get-FuzzFieldValue(byte[])        → fuzz byte array
`The three functions form a mutually recursive loop: `New-FuzzedInstance` calls `Get-FuzzFieldValue` for each field, `Get-FuzzFieldValue` calls back into `New-FuzzedInstance` for embedded structs and calls `New-NdrEmbeddedPointerValue` for pointer fields, which in turn calls `Get-FuzzFieldValue` on the inner type. Every path through the loop increments `$Depth` and extends `$Visited`, so the recursion terminates regardless of how deeply structures are nested.
## Support for Union types __
In MS-RPC IDL, a union is a type that can hold one of several different data types at the same memory location, with a separate integer discriminant field telling the receiver which variant is actually present. For example: ____`| 
    1
    2
    3
    4
    5
| 
     typedef union _PAYLOAD_UNION switch(DWORD dataType) {
        case 0: DWORD  simpleValue;
        case 1: WCHAR* stringValue;
        case 2: BLOB   binaryData;
    } PAYLOAD_UNION;
`The current fuzzer didn’t yet support Union Types and raises errors like `Exception calling InvokeWithTimeout with 4 argument(s): No matching union selector when marshaling Union_63`.The union occupies the memory of its largest variant. The discriminant tells the NDR marshaler which arm to serialise/deserialise. NtObjectManager generates these as .NET structs where each variant becomes a field named Arm_0, Arm_1, Arm_2, each wrapped in `NdrEmbeddedPointer<T>`.
### Two Union Shapes in the Code __
`New-FuzzedInstance` handles two ways a union can appear:Case 1 - the type itself is entirely a union (all fields are Arm_N): ____`| 
    1
    2
    3
    4
    5
    6
    7
| 
     $armFields = @($fields | Where-Object { $_.Name -match '^Arm_\d+$' })
    if ($armFields.Count -gt 0 -and $armFields.Count -eq $fields.Count) {
        $chosenArm = $armFields[(Get-Random -Maximum $armFields.Count)]
        $ptrValue  = New-NdrEmbeddedPointerValue -ClosedPtrType $chosenArm.FieldType ...
        $chosenArm.SetValue($instance, $ptrValue)
        return $instance
    }
`When the entire type is a union, one arm is picked at random, fuzzed, and set. The other arms are left at their default (zero/null). This is correct, only one arm is ever valid at a time.Case 2 - a regular struct contains a Union_N field: ____`| 
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
| 
     if ($ft.Name -match '^Union_\d+$') {
        $unionArmFields = @($ft.GetFields($bindingFlags) | Where-Object { $_.Name -match '^Arm_(\d+)$' })
        $chosenArm = $unionArmFields[(Get-Random -Maximum $unionArmFields.Count)]
        $armIndex  = [int]($chosenArm.Name -replace 'Arm_', '')
        # Set ALL preceding integer-like fields to armIndex (the discriminant)
        for ($j = 0; $j -lt $i; $j++) {
            ...
            $selField.SetValue($instance, [int32]$armIndex)
        }
        # Build the union with the chosen arm populated
        $unionInstance = [System.Activator]::CreateInstance($ft)
        $ptrValue = New-NdrEmbeddedPointerValue -ClosedPtrType $chosenArm.FieldType ...
        $chosenArm.SetValue($unionInstance, $ptrValue)
        $field.SetValue($instance, $unionInstance)
    }
`Here the union is just one field inside a larger struct. The critical extra step is setting the discriminant: the NDR marshaler will refuse to serialise the union if the discriminant doesn’t match the populated arm, it throws `No matching union selector`. The IDL `[switch_is()]` attribute can point to any integer field in the parent struct, not necessarily the one immediately before the union. Rather than trying to resolve that attribute at runtime, the code takes the conservative approach of setting all preceding integer-like fields to the chosen arm index. For fuzzing purposes this is safe, worst case an irrelevant field gets an unusual value, which is desirable anyway.
### Why Cached Values Break Unions __
This is also why`Test-ContainsUnionField` exists and is called in `Format-SortedParameterType`: ____`| 
    1
    2
    3
    4
| 
     $hasUnion = Test-ContainsUnionField -Type $Type
    $match = if (-not $hasUnion) {
        # look up cached instance from a previous successful call
    }
`The sorted fuzzer caches complex type instances returned by successful RPC calls to reuse them as inputs to subsequent calls. If a cached instance contains a union, its discriminant and populated arm were set for the original call. Reusing that instance in a different context risks the discriminant no longer matching, causing the marshaler to fail before the fuzz value even reaches the server. Types containing unions are therefore always freshly generated with `New-FuzzedInstance` rather than pulled from the cache.This solution works for most Union Types, which is better than none.
## Replacing Process Monitor with ETW __
The fuzzer already had a concept of a canary, a recognisable prefix`incendiumrocks_` prepended to every string and byte array it generates. When the target RPC server touches the file system or registry using that string, the canary shows up in a Process Monitor trace, revealing which paths the server accesses and under what identity.The problem with Process Monitor is that it requires a separate GUI tool running alongside the fuzzer. With `SyscallMonitor.cs` and `SyscallMonitor.ps1`, this is now entirely self-contained in the terminal, provided you run as administrator.
### The ETW Session __
Windows exposes kernel file and registry activity through two ETW providers: ____`| 
    1
    2
    3
    4
    5
    6
    7
| 
    ┌───────────────────────────────────┬──────────────────────────────────────┐
    │             Provider              │                 GUID                 │
    ├───────────────────────────────────┼──────────────────────────────────────┤
    │ Microsoft-Windows-Kernel-File     │ EDD08927-9CC4-4E65-B970-C2560FB5C289 │
    ├───────────────────────────────────┼──────────────────────────────────────┤
    │ Microsoft-Windows-Kernel-Registry │ 70EB4F03-C1DE-4F73-A051-33D13D5413BD │
    └───────────────────────────────────┴──────────────────────────────────────┘
``SyscallMonitor.Start()` opens a real-time ETW trace session via `StartTraceW`, enables both providers with `EnableTraceEx2` at verbose level (all keywords), and spins up a background thread that calls `ProcessTrace`, which blocks and delivers events to a callback as they arrive.The entire ETW session lifecycle is managed through manual P/Invoke against `advapi32.dll` and `tdh.dll` rather than the managed `System.Diagnostics.Eventing` API, because the managed wrappers do not expose the `EVENT_TRACE_MODE_EVENT_RECORD` mode needed to receive raw `EVENT_RECORD` pointers in the callback.
### High-Privilege Alerts __
For each matched event the monitor resolves the identity of the process that triggered it by opening its process token, reading`TOKEN_USER`, converting the SID to a string, and resolving it to a `DOMAIN\User` account name via `LookupAccountSidW`. If the SID matches one of the three high-privilege service accounts `S-1-5-18 SYSTEM`, `S-1-5-19 LOCAL SERVICE`, `S-1-5-20 NETWORK SERVICE`, the event is additionally enqueued in a separate `_highPrivAlerts` queue.The fuzzer drains this queue after every RPC invocation via `Show-SyscallAlerts`: ____`| 
    1
    2
    3
    4
    5
    6
    7
| 
     function Show-SyscallAlerts {
        $alerts = $script:_SyscallMonitor.TakeAlerts()
        foreach ($a in $alerts) {
            Write-Host "[!] HIGH-PRIV SYSCALL: $($a.RpcProcedure) - $($a.Provider):$($a.Operation): $($a.Path) - $($a.UserName)" -ForegroundColor Red
        }
        Flush-SyscallEvents -OutPath $OutPath
    }
`A real-time alert fires the moment the canary reaches the file system or registry under a privileged identity, directly attributing it to the procedure and endpoint responsible.[](/assets/img/posts/fuzzing-complex-structures/2.png) _Real-time alerting moment canary reaches file system or registry_ All events are also incrementally flushed to `Syscalls.json` and, for high-privilege events only, `HighPrivSyscalls.json`, so results survive even if fuzzing is interrupted mid-run. ____`| 
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
    35
    36
    37
    38
| 
    [
      {
        "Timestamp": "2026-05-04 05:19:48.4723253",
        "ProcessId": 3988,
        "ProcessName": "spoolsv.exe",
        "ThreadId": 7476,
        "UserSid": "S-1-5-18",
        "UserName": "NT AUTHORITY\\SYSTEM",
        "Provider": "Registry",
        "Operation": "QueryValueKey",
        "EventId": 7,
        "Path": "incendiumrocks__TE&=#wO@3",
        "PathRewritten": false,
        "RpcServer": "spoolsv.exe",
        "RpcServerPath": "C:\\windows\\system32\\spoolsv.exe",
        "RpcInterface": "12345678-1234-abcd-ef00-0123456789ab",
        "RpcProcedure": "RpcInstallPrinterDriverPackageFromConnection",
        "Endpoint": "ncalrpc:[LRPC-340b3873feba621b77]"
      },
      {
        "Timestamp": "2026-05-04 05:19:48.4723409",
        "ProcessId": 3988,
        "ProcessName": "spoolsv.exe",
        "ThreadId": 7476,
        "UserSid": "S-1-5-18",
        "UserName": "NT AUTHORITY\\SYSTEM",
        "Provider": "Registry",
        "Operation": "QueryValueKey",
        "EventId": 7,
        "Path": "incendiumrocks__TE&=#wO@3",
        "PathRewritten": false,
        "RpcServer": "spoolsv.exe",
        "RpcServerPath": "C:\\windows\\system32\\spoolsv.exe",
        "RpcInterface": "12345678-1234-abcd-ef00-0123456789ab",
        "RpcProcedure": "RpcInstallPrinterDriverPackageFromConnection",
        "Endpoint": "ncalrpc:[LRPC-340b3873feba621b77]"
      }
    ]
`
### Crash alerts __
Service crashes are detected from a completely different signal: the RPC transport itself. When a fuzz call causes the service process behind the RPC server to terminate, the ALPC channel it was using becomes invalid. The next call returns`NTSTATUS 0xC0000701` (The ALPC message requested is no longer available). The error handler in the fuzzer checks for this specific status code.[](/assets/img/posts/fuzzing-complex-structures/3.png) _Real-time alerting moment the RPC server service crashes_
##  Replaying interesting calls __
As a bonus, I implemented a way to “replay” high privileged calls or crashes using the outputted`Crashes.json` or `HighPrivSyscalls.json`. `Invoke-RpcFuzzer` accepts a `-ReplayFile` parameter. When set, it calls Convert-ReplayFile and substitutes the generated data file and procedure whitelist.[](/assets/img/posts/fuzzing-complex-structures/4.png) _Replaying procudure call that caused the crash_ This comes in handy when you ran the fuzzer as admin to identify interesting calls but now want to replay them under an less-privleged context. Keep in mind that for ALPC endpoints, these are often user-bound endpoints, so modifying them to the other user’s their context is necessary.
## Hey nt authority\system, run my DLL!__
As mentioned in the description of this blog post, we found a way to let the system (NT AUTHORITY\SYSTEM) execute our DLL based on our provided input. The only pitfall; the procedure can only be executed by an administrator :P. While testing the newly implemented features of the fuzzer against the RPC-interfaces in`spoolsv.exe`, I came across the procedure `RpcAddPrintProvidor` which was desperately looking for a DLL to open. ____`| 
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
| 
    [!] HIGH-PRIV SYSCALL: RpcAddPrintProvidor - Registry:CreateKey: incendiumrocks__+V_|%0uP;E - NT AUTHORITY\SYSTEM
    [!] HIGH-PRIV SYSCALL: RpcAddPrintProvidor - File:Info : \Device\HarddiskVolume3\WINDOWS\System32\incendiumrocks__hPZWRSMvBl.DLL - NT AUTHORITY\SYSTEM
    [!] HIGH-PRIV SYSCALL: RpcAddPrintProvidor - File:Info : \Device\HarddiskVolume3\WINDOWS\SYSTEM32\incendiumrocks__hPZWRSMvBl.DLL - NT AUTHORITY\SYSTEM
    [!] HIGH-PRIV SYSCALL: RpcAddPrintProvidor - File:Info : \Device\HarddiskVolume3\WINDOWS\system\incendiumrocks__hPZWRSMvBl.DLL - NT AUTHORITY\SYSTEM
    [!] HIGH-PRIV SYSCALL: RpcAddPrintProvidor - File:Info : \Device\HarddiskVolume3\WINDOWS\incendiumrocks__hPZWRSMvBl.DLL - NT AUTHORITY\SYSTEM
    [!] HIGH-PRIV SYSCALL: RpcAddPrintProvidor - File:Info : \Device\HarddiskVolume3\WINDOWS\system32\incendiumrocks__hPZWRSMvBl.DLL - NT AUTHORITY\SYSTEM
    [!] HIGH-PRIV SYSCALL: RpcAddPrintProvidor - File:Info : \Device\HarddiskVolume3\WINDOWS\system32\incendiumrocks__hPZWRSMvBl.DLL - NT AUTHORITY\SYSTEM
    [!] HIGH-PRIV SYSCALL: RpcAddPrintProvidor - File:Info : \Device\HarddiskVolume3\WINDOWS\incendiumrocks__hPZWRSMvBl.DLL - NT AUTHORITY\SYSTEM
    [!] HIGH-PRIV SYSCALL: RpcAddPrintProvidor - File:Info : \Device\HarddiskVolume3\WINDOWS\System32\Wbem\incendiumrocks__hPZWRSMvBl.DLL - NT AUTHORITY\SYSTEM
    [!] HIGH-PRIV SYSCALL: RpcAddPrintProvidor - File:Info : \Device\HarddiskVolume3\WINDOWS\System32\WindowsPowerShell\v1.0\incendiumrocks__hPZWRSMvBl.DLL - NT AUTHORITY\SYSTEM
    [!] HIGH-PRIV SYSCALL: RpcAddPrintProvidor - File:Info : \Device\HarddiskVolume3\WINDOWS\System32\OpenSSH\incendiumrocks__hPZWRSMvBl.DLL - NT AUTHORITY\SYSTEM
    [!] HIGH-PRIV SYSCALL: RpcAddPrintProvidor - File:Info : \Device\HarddiskVolume3\Program Files (x86)\Windows Kits\10\Windows Performance Toolkit\incendiumrocks__hPZWRSMvBl.DLL - NT AUTHORITY\SYSTEM
    [!] HIGH-PRIV SYSCALL: RpcAddPrintProvidor - File:Info : \Device\HarddiskVolume3\Program Files\Git\cmd\incendiumrocks__hPZWRSMvBl.DLL - NT AUTHORITY\SYSTEM
    [!] HIGH-PRIV SYSCALL: RpcAddPrintProvidor - File:Info : \Device\HarddiskVolume3\Users\admin\.local\bin\incendiumrocks__hPZWRSMvBl.DLL - NT AUTHORITY\SYSTEM
    [!] HIGH-PRIV SYSCALL: RpcAddPrintProvidor - File:Info : \Device\HarddiskVolume3\Program Files\PowerShell\7\incendiumrocks__hPZWRSMvBl.DLL - NT AUTHORITY\SYSTEM
    [!] HIGH-PRIV SYSCALL: RpcAddPrintProvidor - File:Info : \Device\HarddiskVolume3\WINDOWS\system32\config\systemprofile\AppData\Local\Microsoft\WindowsApps\incendiumrocks__hPZWRSMvBl.DLL - NT AUTHORITY\SYSTEM
`The fuzzer generates random strings, but the procedure `RpcAddPrintProvidor` appended `.DLL` to each of them, which is a indicator that it is looking for a DLL to load. Googling for the procedure to find any documentation also didn’t find anything. And I literally mean anything:[](/assets/img/posts/fuzzing-complex-structures/5.png) _No results for Googling RpcAddPrintProvidor_ The definition of the procedure is as follows: ____`| 
    1
| 
     int RpcAddPrintProvidor(string p0, Struct_40 p1)
`The reason I didn’t find this procedure yet, was because of `Struct_40`. We weren’t able to fuzz over it yet! It implements a `String` somewhere that parses our input. The fuzzer accepts the argument `-StringInput` so we can point the string input to a file on disk (my malicious dll). The DLL will execute `whoami` in the context of the user who executes it and writes it to `C:\Windows\Tasks\hello.txt`.[](/assets/img/posts/fuzzing-complex-structures/6.png) _hello.txt created when pointing RpcAddPrintProvidor to it_ ____`| 
    1
    2
| 
    PS C:\Users\admin\Documents\MS-RPC-Fuzzer> cat "C:\Windows\Tasks\hello.txt"
    nt authority\system
`Yay! we successfully let `nt authority\system` load our DLL. Obviously the next step was to see whether a low user could call the `RpcAddPrintProvidor`. However, this is not the case. The regular user without administrator rights gets returned access denied. ____`| 
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
| 
    {
      "spoolsv.exe": {
        "12345678-1234-abcd-ef00-0123456789ab": [
          {
            "MethodName": "RpcAddPrintProvidor",
            "Endpoint": "\\RPC Control\\LRPC-0ea1ebef008050d902",
            "ProcedureName": "RpcAddPrintProvidor",
            "MethodDefinition": "Int32 RpcAddPrintProvidor(System.String, Struct_40)",
            "Service": "Spooler",
            "FuzzInput": "p0=C:\\Windows\\Tasks\\whoami\r\np1=Struct_40 (Complex)",
            "Output": "5",
            "WindowsMessage": "5: Access is denied."
          }
        ]
      }
    }
`The RPC-interface that implements `RpcAddPrintProvidor` also supports `ncacn_ip_tcp` as protocol sequence. This means that you could possibly let the system user load a DLL remotely, if you are admin. Microsoft doesn’t see admin -> system as security boundary, which I agree with. It may still be interesting for red teamers to dig deeper into this. And that is the complete goal of the Fuzzer, find interesting procedures!
## Conclusion __
This chapter covered three meaningful additions to the MS-RPC Fuzzer: recursive structure fuzzing that handles both embedded and pointer-based nested types, discriminated union support that keeps the NDR marshaler happy, and an ETW-based syscall monitor that replaces Process Monitor entirely, giving real-time, terminal-visible visibility into where fuzz input lands in the file system and registry, and under whose identity. The canary mechanism ties it all together. Every string and byte array the fuzzer generates carries a recognisable prefix. The ETW monitor watches for that prefix in kernel file and registry events, attributes each hit back to the exact procedure and endpoint that produced it, and immediately alerts when the hit occurs under a high-privilege service account. Crashes are detected through a separate signal, the ALPC transport collapsing when the service process behind it dies, and are recorded with enough context to replay them in isolation with `-ReplayFile`.The value of all this becomes concrete with an actual finding. While testing against the RPC interfaces exposed by spoolsv.exe, the fuzzer flagged `RpcAddPrintProvidor` via a high-privilege syscall alert: the procedure was reaching into the file system looking for a DLL to load, using a path derived from our fuzz input, under `NT AUTHORITY\SYSTEM`. Looking closer, the interface implementing `RpcAddPrintProvidor` also registers `ncacn_ip_tcp` as a supported protocol sequence, meaning the call can be made over the network, not just locally.The constraint is that the procedure requires administrator privileges to call. Microsoft’s position is that administrator to SYSTEM is not a security boundary, and that is a reasonable stance. Still, for a red teamer who already has admin on a box, or is looking for lateral movement paths on a network where they have admin credentials, a procedure that causes SYSTEM to load an arbitrary DLL over TCP is worth understanding.That is ultimately what the fuzzer is built to surface: procedures that do something interesting with the input you give them. Finding them is the first step. __[Research](/categories/research/), [Windows](/categories/windows/), [Exploit](/categories/exploit/) __[Research](/tags/research/) [Exploitation](/tags/exploitation/) [Red teaming](/tags/red-teaming/) [Windows](/tags/windows/) [Active Directory](/tags/active-directory/) [vulnerability](/tags/vulnerability/) [internals](/tags/internals/) This post is licensed under [ CC BY 4.0 ](https://creativecommons.org/licenses/by/4.0/) by the author. Share [ __](https://twitter.com/intent/tweet?text=Recursively%20fuzzing%20MS-RPC%20structures%20and%20monitoring%20using%20ETW%20-%20Remco%20van%20der%20Meer&url=https%3A%2F%2Fincendium.rocks%2Fposts%2FFuzzing-MS-RPC-structures-and-monitoring%2F "Twitter") [ __](https://www.facebook.com/sharer/sharer.php?title=Recursively%20fuzzing%20MS-RPC%20structures%20and%20monitoring%20using%20ETW%20-%20Remco%20van%20der%20Meer&u=https%3A%2F%2Fincendium.rocks%2Fposts%2FFuzzing-MS-RPC-structures-and-monitoring%2F "Facebook") [ __](https://t.me/share/url?url=https%3A%2F%2Fincendium.rocks%2Fposts%2FFuzzing-MS-RPC-structures-and-monitoring%2F&text=Recursively%20fuzzing%20MS-RPC%20structures%20and%20monitoring%20using%20ETW%20-%20Remco%20van%20der%20Meer "Telegram") __
## Recently Updated
  * [Recursively fuzzing MS-RPC structures and monitoring using ETW](/posts/Fuzzing-MS-RPC-structures-and-monitoring/)
  * [Automating MS-RPC vulnerability research](/posts/Automating-MS-RPC-Vulnerability-Research/)
  * [Deleting the BCD through COM as low privileged user (external)](/posts/CVE-2025-59253/)
  * [Remotely crashing the Spooler service](/posts/Remotely-crashing-spooler/)
  * [Automating COM/DCOM vulnerability research](/posts/Automating-COM-Vulnerability-Research/)
## Trending Tags
[Windows](/tags/windows/) [Active Directory](/tags/active-directory/) [Exploitation](/tags/exploitation/) [Red teaming](/tags/red-teaming/) [Research](/tags/research/) [internals](/tags/internals/) [vulnerability](/tags/vulnerability/) [research](/tags/research/) [exploits](/tags/exploits/) [windows](/tags/windows/)
## Contents
### Further Reading
[ Nov 19, 2025 Remotely crashing the Spooler serviceShowcasing a vulnerability in Windows that causes the Spooler service to crash remotely.](/posts/Remotely-crashing-spooler/) [ Jul 14, 2025 Revisiting automating MS-RPC vulnerability research and releasing the toolPartially solving the problem for procedures that need valid complex parameter types to fuzz, and open sourcing the tool](/posts/Revisiting-MS-RPC-Vulnerability-Research-automation/) [ May 21, 2025 Automating MS-RPC vulnerability researchDiving into the MS-RPC protocol and how to automate vulnerability research using a fuzzing approach.](/posts/Automating-MS-RPC-Vulnerability-Research/) [Remotely crashing the Spooler service](/posts/Remotely-crashing-spooler/)-© 2026 [Remco van der Meer](https://www.linkedin.com/in/remco-vandermeer). Some rights reserved.Using the [Chirpy](https://github.com/cotes2020/jekyll-theme-chirpy "v7.5.0") theme for [Jekyll](https://jekyllrb.com).
## Trending Tags
[Windows](/tags/windows/) [Active Directory](/tags/active-directory/) [Exploitation](/tags/exploitation/) [Red teaming](/tags/red-teaming/) [Research](/tags/research/) [internals](/tags/internals/) [vulnerability](/tags/vulnerability/) [research](/tags/research/) [exploits](/tags/exploits/) [windows](/tags/windows/) __ A new version of content is available. Update