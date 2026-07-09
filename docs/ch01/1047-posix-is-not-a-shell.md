# POSIX Is Not A Shell

## Ch01.1047 POSIX Is Not A Shell

> 📊 Level ⭐⭐ | 3.6KB | `entities/posix-is-not-a-shell.md`

# POSIX Is Not A Shell

> Source: [POSIX Is Not A Shell](https://alganet.github.io/blog/2026-06-28-12-POSIX-Is-Not-A-Shell.html) | Score: v*c=72

## Overview

Published Time: Sun, 28 Jun 2026 20:39:31 GMT

Markdown Content:
## [alganet](https://alganet.github.io/)

[English](https://alganet.github.io/blog/2026-06-28-12-POSIX-Is-Not-A-Shell.html)[Português](https://alganet.github.io/blog/2026-06-28-12-POSIX-Nao-E-Um-Shell.pt.html)
_Alexandre Gomes Gaigalas_ – _June 28, 2026_

When someone says "write it in POSIX shell for portability," they mean well.

POSIX is a specification. Not a program. The thing that actually runs your script is bash, dash, ash, ksh, yash, or one of a dozen others. They each implement POSIX with their own gaps, extensions, and historical accidents.

Here is a small experiment. One line, no flags, no functions, nothing exotic:

```
#!/bin/sh
echo "C:\new"
```

On bash, ksh, and a handful of others, you get back exactly what you typed:

`C:\new`
On dash (which _is_`/bin/sh` on Debian, Ubuntu, and Alpine) the same line prints:

```
C:
ew
```

dash's `echo` interprets `\n` as a newline. bash's does not. Run it across [shell-versions](https://github.com/alganet/shell-versions) and the shells split almost evenly: about half treat the backslash literally, the other half expand it.

`docker run --rm alganet/shell-versions:all -c 'echo "C:\new"'`
POSIX does not break the tie. The standard explicitly leaves [`echo`'s treatment of backslash escapes **implementation-defined**](https://pubs.opengroup.org/onlinepubs/9699919799/utilities/echo.html#tag_20_37_05), and [encourages you to use `printf` instead](https://pubs.opengroup.org/onlinepubs/9699919799/utilities/echo.html#tag_20_37_16). So "POSIX `echo`" is not a behavior you can write a script against. It is a documented disagreement.

This is not a contrived edge case. `echo` is the first command anyone learns. It is what "POSIX compliant" means in practice: compliant with the parts the spec actually pins down, on the versions that happened to ship.

### The Problem With Dialects

Natural languages have dialects. Brazilian Portuguese and European Portuguese are both Portuguese. A native speaker of one can understand the other with effort, but they are not the same. You cannot write Portuguese and expect it to work identically everywhere.

Shell scripting has the same problem. Bash is not _the_ shell. It is _a_ shell with a specific set of behaviors, many of which are not in POSIX and some of which contradict implementations that are technically more compliant (like dash).

The community pretends otherwise. We say "sh script" and mean "bash with `-e -u -o pipefail`." We say "POSIX compliant" and mean "it worked in CI." We say "portable" and mean "it ran on the two machines I tried."

### What Validation Actually Looks Like

I have been building [shell-docs](https://github.com/alganet/shell-docs), a cross-shell reference that validates each documented feature across 14 shells. The process is mechanical: write an example, run it on every shell, record the output, check for divergence.

Most features work the same. Some do not.

`$#` - the cou

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/posix-is-not-a-shell.md)

---

