---

title: "Runtime Instrumentation of Qt6 Apps with Frida - Part 1: Getting Visibility"
source: newsletter
source_url: https://blog.samanl33t.com/writings/0x0003-frida-on-qt6-part-1/
fetcher: jina
sha256: 229b910bf33f6e9c
created: 2026-05-18
updated: 2026-05-18

---
# Runtime Instrumentation of Qt6 Apps with Frida - Part 1: Getting Visibility
Published Time: Sun, 17 May 2026 11:51:12 GMT
Markdown Content:
Tooling · frida · 2026-05-14
![Image 1](https://blog.samanl33t.com/img/posts/0x0003/hero.jpg)
Contents
1.   [1. See every `QString` that gets read](https://blog.samanl33t.com/writings/0x0003-frida-on-qt6-part-1/#1-see-every-qstring-that-gets-read)
2.   [2. Tap signals and slots](https://blog.samanl33t.com/writings/0x0003-frida-on-qt6-part-1/#2-tap-signals-and-slots)
3.   [3. Walk the metaobject](https://blog.samanl33t.com/writings/0x0003-frida-on-qt6-part-1/#3-walk-the-metaobject)
4.   [4. Call any `Q_INVOKABLE` from outside](https://blog.samanl33t.com/writings/0x0003-frida-on-qt6-part-1/#4-call-any-q_invokable-from-outside)
5.   [Part 2 will cover](https://blog.samanl33t.com/writings/0x0003-frida-on-qt6-part-1/#part-2-will-cover)
6.   [References](https://blog.samanl33t.com/writings/0x0003-frida-on-qt6-part-1/#references)
We will use [HackPass](https://blog.samanl33t.com/writings/0x0002-introducing-hackpass/) for practicing instrumentation by running each frida script against it.
The scripts target Qt6 / Windows. macOS readers - please adapt the symbol names etc. yourself for Mac.
At least three things make Qt6 different from other thick clients. `QString` isn’t a C string, method dispatch hides behind `QMetaObject::activate`, and Qt-exported symbols are mangled while the thick client binary is usually stripped.
## 1. See every `QString` that gets read
**Problem.**`QString` stores text as UTF-16 in a heap buffer with a separate size field, refcounted and copy-on-write through `QArrayDataPointer`. `strcmp` / `strncpy`-style hooks see nothing useful because the app never touches a C string.
**Solution.** Hook `constData()`, `data()`, and `utf16()` - the three buffer accessors. They fire on every read of a QString’s UTF-16 buffer. Filter by ASCII-printability and length range. Prints whatever the app actually reads at runtime.
**Why these and not `toUtf8` / `toLatin1` directly?** The exported conversion methods like `QString::toUtf8` etc. do not execute from app code, instead the static helper like `?toUtf8_helper@QString@@...` is called. To hook a conversion you hook the helper, not the public method.
**Find the symbols.** Mangled names vary slightly between Qt6 builds. `qt-discover.js` scans the three accessor patterns at load:
javascript
```
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
``````
// qt-discover.js
const qt = Process.getModuleByName('Qt6Core.dll');
function scan(pattern) {
  const hits = qt.enumerateExports().filter(e => e.name.includes(pattern));
  console.log('=== ' + pattern + ' (' + hits.length + ' hits) ===');
  hits.forEach(e => console.log('  ' + e.name));
  return hits;
}
['?constData@QString@', '?data@QString@', '?utf16@QString@'].forEach(scan);
globalThis.discover = scan;
console.log('\n[+] discover(pattern) also available for ad-hoc scans');
```
Run it:
bash
```
1
````frida -l qt-discover.js HackPass.exe`
Output on a Qt 6.11 / Windows build:
text
```
=== ?constData@QString@ (1 hits) ===
  ?constData@QString@@QEBAPEBVQChar@@XZ
=== ?data@QString@ (2 hits) ===
  ?data@QString@@QEAAPEAVQChar@@XZ
  ?data@QString@@QEBAPEBVQChar@@XZ
=== ?utf16@QString@ (1 hits) ===
  ?utf16@QString@@QEBAPEBGXZ
```
Three symbols `qt-qstring-trace.js` hooks: `?constData@QString@@QEBAPEBVQChar@@XZ`, `?data@QString@@QEAAPEAVQChar@@XZ` (the non-const overload), and `?utf16@QString@@QEBAPEBGXZ`. If your build’s enumerator shows different names, swap them into the script.
**Run.**
bash
```
1
````frida -l qt-qstring-trace.js HackPass.exe`
**Script.**
javascript
```
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
39
40
41
42
``````
// qt-qstring-trace.js
const MIN_LEN = 6, MAX_LEN = 64, DEDUP = 16;
const SKIP = [':/', '/qt-', 'qrc:', 'file:', 'image:'];
const qt = Process.getModuleByName('Qt6Core.dll');
const hooks = [
  ['constData', '?constData@QString@@QEBAPEBVQChar@@XZ'],
  ['data',     '?data@QString@@QEAAPEAVQChar@@XZ'],
  ['utf16',    '?utf16@QString@@QEBAPEBGXZ'],
];
const recent = [];
function ok(s) {
  if (!s || s.length < MIN_LEN || s.length > MAX_LEN) return false;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 0x20 || c > 0x7E) return false;
  }
  for (const p of SKIP) if (s.startsWith(p)) return false;
  if (recent.includes(s)) return false;
  recent.push(s);
  if (recent.length > DEDUP) recent.shift();
  return true;
}
hooks.forEach(([label, sym]) => {
  const fn = qt.findExportByName(sym);
  if (!fn) return console.log('[!] not found: ' + sym);
  console.log('[+] hooking ' + label + ' @ ' + fn);
  Interceptor.attach(fn, {
    onEnter(args) {
      const qstr = args[0];
      const dataPtr = qstr.add(8).readPointer();
      const size = qstr.add(16).readPointer().toInt32();
      if (size < MIN_LEN || size > MAX_LEN || dataPtr.isNull()) return;
      let s;
      try { s = dataPtr.readUtf16String(size); } catch (_) { return; }
      if (ok(s)) console.log('[' + label + ' len=' + size + '] ' + s);
    }
  });
});
```
**For HackPass.** Type the master password one character at a time in the UI and the Frida console will show this:
text
```
[constData len=6] hackpa
[constData len=7] hackpas
[constData len=8] hackpass
```
The password QString grows by one character per keystroke and `constData` fires every time QML, a property binding, or the meta-object reads the new value. The same trace also captures HackPass’s registry path (`Software\HackPass\app`), the backend’s loopback host (`127.0.0.1`), the dynamic vault path, every UI string (`Master password`, `Unlock your vault`, `Intentionally vulnerable - do not store real passwords`). None of this can usually be seen with `strings HackPass.exe` as these are all runtime values.
![Image 2: Frida console: QString::constData trace during HackPass login](https://blog.samanl33t.com/img/posts/0x0003/qt-qstring-output.png)
## 2. Tap signals and slots
**Problem.** Clicks and UI events become method calls through `QMetaObject::activate`. There’s no per-signal symbol to breakpoint - Qt’s build tools generate the dispatch code, and slots resolve at runtime through the metaobject.
**Solution.** Hook `activate`. Read the sender pointer, the sender’s `className()` via the metaobject, and the local signal index (resolved to a name via `QMetaMethod`). That gives a live call-graph of every signal emission in the process.
This helps you find what signal fires on each user action. For example - “click unlock” → `clicked()` on `QQuickButton`. Each line also includes the address of the QObject that emitted the signal; pass that address into the metaobject walker (next section) to enumerate every method the object exposes. Every signal that fires is a candidate to intercept later, whether the next thing you care about is vault decrypt, a network request, or a license check.
**Run.**
bash
```
1
````frida -l qt-signal-tap.js HackPass.exe`
**Script.**
javascript
```
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
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
``````
// qt-signal-tap.js
const SKIP_CLASSES = new Set([
  'QAbstractEventDispatcher', 'QGuiApplication', 'QQuickApplication',
  'QQuickItem', 'QInputMethod', 'QWindow',
  'QQuickWindow', 'QQuickApplicationWindow',
  'QAnimationDriver', 'QAbstractAnimation', 'QThread', 'QPointingDevice',
  'QQuickShaderEffect', 'QQuickShaderEffectSource',
  'QQuickItemLayer', 'QQuickAnchors', 'QQuickIconLabel', 'QQuickText',
  'QQmlTimer', 'QQmlConnections',
  'QQuickRectangle', 'QQuickMaterialPlaceholderText', 'QQuickMaterialTextContainer',
]);
const SKIP_PREFIXES = ['QSG'];
const qt = Process.getModuleByName('Qt6Core.dll');
const candidates = qt.enumerateExports().filter(e =>
  e.name.startsWith('?activate@QMetaObject@') &&
  /PEB[UV]1/.test(e.name) &&
  e.name.includes('PEAPEAX')
);
if (candidates.length === 0) throw new Error('QMetaObject::activate not found');
const target = candidates[0];
const fn = (sym, ret, args) => {
  const a = qt.findExportByName(sym);
  if (!a) throw new Error('symbol not found: ' + sym);
  return new NativeFunction(a, ret, args);
};
const className    = fn('?className@QMetaObject@@QEBAPEBDXZ',            'pointer', ['pointer']);
const methodOffset = fn('?methodOffset@QMetaObject@@QEBAHXZ',            'int',     ['pointer']);
const methodAt     = fn('?method@QMetaObject@@QEBA?AVQMetaMethod@@H@Z',  'void',    ['pointer', 'pointer', 'int']);
const methodName   = fn('?name@QMetaMethod@@QEBA?AVQByteArray@@XZ',      'void',    ['pointer', 'pointer']);
const mSlot = Memory.alloc(16), baSlot = Memory.alloc(24);
function isNoise(cls) {
  if (SKIP_CLASSES.has(cls)) return true;
  for (const p of SKIP_PREFIXES) if (cls.startsWith(p)) return true;
  return false;
}
function resolveSignalName(metaObj, localIdx) {
  try {
    methodAt(mSlot, metaObj, methodOffset(metaObj) + localIdx);
    methodName(baSlot, mSlot);
    const p = baSlot.add(8).readPointer();
    if (p.isNull()) return null;
    const s = p.readCString();
    if (!s || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(s)) return null;
    return s;
  } catch (_) { return null; }
}
console.log('[+] hooking ' + target.name + ' @ ' + target.address);
Interceptor.attach(target.address, {
  onEnter(args) {
    const cls = className(args[1]).readCString();
    if (isNoise(cls)) return;
    const localIdx = args[2].toInt32();
    const name = resolveSignalName(args[1], localIdx);
    if (name) console.log('[signal] ' + args[0] + ' ' + cls + '::' + name);
    else      console.log('[signal] ' + args[0] + ' ' + cls + ' #' + localIdx);
  }
});
```
**For HackPass.** Click around. Every emission prints sender pointer + sender class + local signal index. The unlock-button click shows `clicked()` firing on the Material-styled `QQuickButton`. Pressing any Material button fires `pressed` / `released` / `clicked` on a `QQuickAbstractButton`. Grab any sender pointer from the output - the metaobject walker (next) takes one to enumerate the class’s full API.
![Image 3: Frida console: signal-tap during unlock + settings toggle](https://blog.samanl33t.com/img/posts/0x0003/qt-signal-output.png)
**Problem.** Method names live in the metaobject, not in the symbol table. On a stripped binary the symbol table tells you nothing.
**Solution.** Given a `QObject*`, walk its metaobject and print every method, signal, slot, and property with full signatures.
Some QObjects aren’t directly accessible from QML - you can only find them through the signals they emit. Use signal-tap (section 2) to capture their addresses first, then hand each one to the walker.
Load both scripts into the same Frida session so the pointers captured by signal-tap stay valid in the REPL:
**Run.**
bash
```
1
````frida -l qt-signal-tap.js -l qt-metaobject-walker.js HackPass.exe`
Drive the UI - log in, click around, change settings. Watch the signal stream and find the app-defined classes. Two HackPass classes can be seen:
text
```
[signal] 0x591a8ff790 VaultManager #0
[signal] 0x591a8ff5a8 PolicyClient #0
```
![Image 4: Frida console: signal-tap surfacing VaultManager and PolicyClient addresses](https://blog.samanl33t.com/img/posts/0x0003/qt-vaultmanager-address.png)
Now, in the same frida session pass each address to `walk()`:
text
```
[Local::HackPass.exe]-> walk(ptr('0x591a8ff790'))     // VaultManager
[Local::HackPass.exe]-> walk(ptr('0x591a8ff5a8'))     // PolicyClient
```
(Use your own addresses from the trace.)
The walker reaches the derived class’s `QMetaObject` through the object’s vtable, then parses the metaobject’s `data` / `stringdata` arrays directly. The output lists every method, signal, slot, and `Q_INVOKABLE`, with the local index per class - which is what the next script needs to invoke them.
**Script.**
javascript
```
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
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
``````
// qt-metaobject-walker.js
const qt = Process.getModuleByName('Qt6Core.dll');
const className = new NativeFunction(
  qt.findExportByName('?className@QMetaObject@@QEBAPEBDXZ'),
  'pointer', ['pointer']);
function virtualMetaObject(qobj) {
  const vtable = qobj.readPointer();
  const fn = vtable.readPointer(); // slot 0
  return new NativeFunction(fn, 'pointer', ['pointer'])(qobj);
}
function stringAt(stringdata, idx) {
  const off = stringdata.add(idx * 8).readU32();
  return stringdata.add(off).readCString();
}
function superOf(mo) {
  const direct = mo.readPointer();
  if (!direct.isNull()) return direct;
  const getter = mo.add(8).readPointer();
  return getter.isNull() ? null : new NativeFunction(getter, 'pointer', [])();
}
function ownCount(mo) { return mo.add(24).readPointer().add(16).readU32(); }
function ownMethodName(mo, localIdx) {
  const stringdata = mo.add(16).readPointer();
  const data = mo.add(24).readPointer();
  const methodOff = data.add(20).readU32();
  const nameIdx = data.add((methodOff + localIdx * 6) * 4).readU32();
  return stringAt(stringdata, nameIdx);
}
function methodOffsetOf(mo) {
  const s = superOf(mo);
  return s ? methodOffsetOf(s) + ownCount(s) : 0;
}
function nameByAbsIdx(mo, absIdx) {
  const off = methodOffsetOf(mo);
  if (absIdx < off) {
    const s = superOf(mo);
    return s ? nameByAbsIdx(s, absIdx) : null;
  }
  try { return ownMethodName(mo, absIdx - off); } catch (_) { return null; }
}
globalThis.walk = function (qobj) {
  const mo = virtualMetaObject(qobj);
  const off = methodOffsetOf(mo);
  const total = off + ownCount(mo);
  console.log('[' + className(mo).readCString() + '] ' + total + ' methods (own start at abs ' + off + '):');
  for (let i = 0; i < total; i++) {
    const name = nameByAbsIdx(mo, i) || '<unresolved>';
    const local = i - off;
    const tag = local >= 0 ? ' (local ' + local + ')' : ' (inherited)';
    console.log('  [' + i + ']' + tag + ' ' + name);
  }
};
console.log('[+] walk(qobj) ready');
```
**For HackPass.**`walk(VaultManager)` dumps inherited QObject methods first (the `destroyed` / `objectNameChanged` / `deleteLater` block), then VaultManager’s own - signals like `stateChanged` / `unlockFailed` / `tamperedShutdown`, then the full `Q_INVOKABLE` attack surface (`stateValue`, `vaultPath`, `selectFile`, `unlock`, `reUnlockAfterAutoLock`, `save`, `lock`, `autoLock`, `close`, `createNew`).
`walk(PolicyClient)` shows what the app exposes to the policy backend - `fetch`, the methods it calls when server flags arrive, state-change signals. Each line shows a “local” index - the local index is what the next script needs to actually call a method.
![Image 5: Frida console: metaobject walk of VaultManager and PolicyClient](https://blog.samanl33t.com/img/posts/0x0003/qt-walk-object-valutmgr-policymgr.png)
## 4. Call any `Q_INVOKABLE` from outside
**Problem.** Interacting with the bridge means clicking through the UI to trigger each method. This is not easily scriptable, especially for fuzzing.
**Solution.** Given a `QObject*` and a method name, build the argument list and call via `QMetaObject::invokeMethod`. Basically bypassing all QML based UI interaction.
Load `qt-invokable-call.js` alongside signal-tap and the walker from previous steps, so you can interact with the `VaultManager` pointer from the same Frida session:
**Run.**
bash
```
1
````frida -l qt-signal-tap.js -l qt-metaobject-walker.js -l qt-invokable-call.js HackPass.exe`
Grab the `VaultManager` address from signal-tap, walk it to confirm `lock` is local index 10, then call it:
text
`[Local::HackPass.exe]-> callNoArg(ptr('0x591a8ff790'), 10)   // lock`
If the vault is unlocked, calling the above will lock it immediately - same effect as the Lock Vault button, just without interacting with the UI.
**Script.**
javascript
```
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
39
40
``````
// qt-invokable-call.js
function virtualMetaObject(qobj) {
  const vtable = qobj.readPointer();
  const metaObjFnPtr = vtable.readPointer(); // slot 0 on MSVC for Q_OBJECT
  return new NativeFunction(metaObjFnPtr, 'pointer', ['pointer'])(qobj);
}
function findStaticMetacall(mo) {
  for (let off = 16; off <= 48; off += 8) {
    try {
      const p = mo.add(off).readPointer();
      const r = Process.findRangeByAddress(p);
      if (r && r.protection.includes('x')) return p;
    } catch (_) {}
  }
  throw new Error('static_metacall not found in QMetaObject');
}
globalThis.invoke = function (qobj, localIdx, argv) {
  const mo = virtualMetaObject(qobj);
  const sm = findStaticMetacall(mo);
  new NativeFunction(sm, 'void', ['pointer', 'int', 'int', 'pointer'])(qobj, 0, localIdx, argv);
};
globalThis.callNoArg = function (qobj, localIdx) {
  const argv = Memory.alloc(8);
  argv.writePointer(NULL);
  invoke(qobj, localIdx, argv);
};
globalThis.callBool = function (qobj, localIdx, value) {
  const argv = Memory.alloc(16);
  const data = Memory.alloc(1);
  data.writeU8(value ? 1 : 0);
  argv.writePointer(NULL);
  argv.add(8).writePointer(data);
  invoke(qobj, localIdx, argv);
};
console.log('[+] invoke / callNoArg / callBool ready');
```
**For HackPass.** Passing the `VaultManager` pointer and `lock`’s local index to `callNoArg` locks the vault.
![Image 6: Frida REPL: callNoArg locking the vault via VaultManager::lock](https://blog.samanl33t.com/img/posts/0x0003/qt-vaultmgr-lock-call.png)
## Part 2 will cover
*   Premium-gate bypass through the bridge
*   Single-hook defeat of all five anti-debug points
*   Vault decryption boundary
*   SSL pinning bypass
*   Full client-side bypass chain end-to-end
## References
**Qt6**
*   [`QString`](https://doc.qt.io/qt-6/qstring.html) - implicit sharing and UTF-16 storage that the buffer-accessor hooks rely on
*   [`QObject`](https://doc.qt.io/qt-6/qobject.html) - base class for everything covered above
*   [`Q_OBJECT`](https://doc.qt.io/qt-6/qobject.html#Q_OBJECT) - macro that injects `metaObject` / `qt_metacast` / `qt_metacall` (the slot-0 layout)
*   [`Q_INVOKABLE`](https://doc.qt.io/qt-6/qobject.html#Q_INVOKABLE) - tagging C++ methods for runtime invocation, what section 4 calls into
*   [`QMetaObject`](https://doc.qt.io/qt-6/qmetaobject.html) - className, methodCount, methodOffset, method enumeration
*   [`QMetaObject::invokeMethod`](https://doc.qt.io/qt-6/qmetaobject.html#invokeMethod) - the public face of the path the invokable-call script hits via `qt_static_metacall`
*   [`QMetaMethod`](https://doc.qt.io/qt-6/qmetamethod.html) - per-method metadata (name, signature, parameter types)
*   [Signals & Slots](https://doc.qt.io/qt-6/signalsandslots.html) - the dispatch model that signal-tap hooks
*   [moc - The Meta-Object Compiler](https://doc.qt.io/qt-6/moc.html) - the code generator behind every Q_OBJECT class