---
title: Hunk - Review-first Terminal Diff Viewer
source_url: https://github.com/modem-dev/hunk
ingested: 2026-06-24
sha256: newsletter-fetch
tags: [tools, diff, terminal, agentic, code-review]
---

# Hunk - Review-first Terminal Diff Viewer

Hunk is a review-first terminal diff viewer for agent-authored changesets, built on [OpenTUI](https://github.com/anomalyco/opentui) and [Pierre diffs](https://www.npmjs.com/package/@pierre/diffs).

[![Image 1: CI status](https://camo.githubusercontent.com/f7677bfbcab4f4c71c3675842e5864ff1016bd2f477c0677b316063ab1dc85ff/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f616374696f6e732f776f726b666c6f772f7374617475732f6d6f64656d2d6465762f68756e6b2f63692e796d6c3f6272616e63683d6d61696e267374796c653d666f722d7468652d6261646765266c6162656c3d4349)](https://github.com/modem-dev/hunk/actions/workflows/ci.yml?branch=main)[![Image 2: Latest release](https://camo.githubusercontent.com/297568a47157895c517cd6b9f89b60de1d09aea57bfa14bfdf064772c3dab41f/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f762f72656c656173652f6d6f64656d2d6465762f68756e6b3f7374796c653d666f722d7468652d6261646765)](https://github.com/modem-dev/hunk/releases)[![Image 3: MIT License](https://camo.githubusercontent.com/608c8dfda488178950ce502d7697514db3a6a712579327ed90b9b594260f6355/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f4c6963656e73652d4d49542d626c75652e7376673f7374796c653d666f722d7468652d6261646765)](https://github.com/modem-dev/hunk/blob/main/LICENSE)

*   multi-file review stream with sidebar navigation
*   inline AI and agent annotations beside the code
*   split, stack, and responsive auto layouts
*   watch mode for auto-reloading file and Git-backed reviews
*   keyboard, mouse, pager, and Git difftool support

## Install

[](http://github.com/modem-dev/hunk#install)

npm i -g hunkdiff

Or with Homebrew:

brew install modem-dev/tap/hunk

Requirements:

*   Node.js 18+
*   macOS, Linux, or Windows
*   Git recommended for most workflows

> Nix users can use the `default` package exported in `flake.nix` instead. See [nix/README.md](https://github.com/modem-dev/hunk/blob/main/nix/README.md) for details.

## Quick start

[](http://github.com/modem-dev/hunk#quick-start)

hunk           # show help
hunk --version # print the installed version

### Working with Git

[](http://github.com/modem-dev/hunk#working-with-git)
Hunk mirrors Git's diff-style commands, but opens the changeset in a review UI instead of plain text.

hunk diff                      # review current repo changes, including untracked files
hunk diff --watch              # auto-reload as the working tree changes
hunk show                      # review the latest commit
hunk show HEAD~1               # review an earlier commit

### Working with Jujutsu and Sapling

[](http://github.com/modem-dev/hunk#working-with-jujutsu-and-sapling)
Hunk auto-detects Jujutsu and Sapling checkouts, so `hunk diff [revset]` and `hunk show [revset]` use native revsets inside jj or Sapling workspaces. To override VCS detection, set `vcs = "git"` or `vcs = "jj"` or `vcs = "sl"` in [config](http://github.com/modem-dev/hunk#config).

### Working with raw files and patches

[](http://github.com/modem-dev/hunk#working-with-raw-files-and-patches)

hunk diff before.ts after.ts                # compare two files directly
hunk diff before.ts after.ts --watch        # auto-reload when either file changes
git diff --no-color | hunk patch -          # review a patch from stdin

### Working with agents

[](http://github.com/modem-dev/hunk#working-with-agents)
1.   Open Hunk in another terminal with `hunk diff` or `hunk show`.
2.   Tell your agent to add the skill file returned by `hunk skill path`.
3.   Ask your agent to use the skill against the live Hunk session.

A good generic prompt is:

```
Load the Hunk skill and use it for this review. Run `hunk skill path` to get the skill path.
```

For the full live-session and `--agent-context` workflow guide, see [docs/agent-workflows.md](https://github.com/modem-dev/hunk/blob/main/docs/agent-workflows.md).

## Feature comparison

[](http://github.com/modem-dev/hunk#feature-comparison)
| Capability | [hunk](https://github.com/modem-dev/hunk) | [lumen](https://github.com/jnsahaj/lumen) | [difftastic](https://github.com/Wilfred/difftastic) | [delta](https://github.com/dandavison/delta) | [diff-so-fancy](https://github.com/so-fancy/diff-so-fancy) | [diff](https://www.gnu.org/software/diffutils/) |
| --- | --- | --- | --- | --- | --- | --- |
| Review-first interactive UI | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Multi-file review stream + sidebar | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Inline agent / AI annotations | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Responsive auto split/stack layout | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Mouse support inside the viewer | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Runtime view toggles | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Syntax highlighting | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Structural diffing | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Pager-compatible mode | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |

Hunk is optimized for reviewing a full changeset interactively.

## Advanced

[](http://github.com/modem-dev/hunk#advanced)
### Config

[](http://github.com/modem-dev/hunk#config)
You can persist preferences to a config file:

*   `~/.config/hunk/config.toml`
*   `.hunk/config.toml`

Example:

theme = "github-dark-default" # any built-in theme id, auto, or custom
mode = "auto"        # auto, split, stack
vcs = "git"          # git, jj, sl
watch = false
exclude_untracked = false
line_numbers = true
wrap_lines = false
agent_notes = false
transparent_background = false

`theme = "auto"` and `--theme auto` query the terminal background at startup, choose `github-light-default` for light backgrounds and `github-dark-default` for dark backgrounds, and fall back to `github-dark-default` if the terminal does not answer. Older theme ids such as `graphite` and `paper` remain accepted as compatibility aliases. `exclude_untracked` affects Git/Sapling working-tree `hunk diff` sessions only. `transparent_background` can also be written as `transparentBackground`.

Custom themes can inherit from any built-in theme and override only the colors you care about:

theme = "custom"

[custom_theme]
base = "catppuccin-mocha"
label = "My Theme"
accent = "#7fd1ff"
panel = "#10161d"
noteBorder = "#c49bff"

[custom_theme.syntax]
keyword = "#8ed4ff"
string = "#c7b4ff"
comment = "#6e85a7"
operator = "#7fd1ff"
variable = "#eef4ff"

All custom theme colors must use `#rrggbb` hex values. Press `t` in the app, or choose `View -> Themes…`, to open the theme selector.

### Git integration

[](http://github.com/modem-dev/hunk#git-integration)
Set Hunk as your Git pager so `git diff` and `git show` open in Hunk automatically:

Note

Untracked files are auto-included only for Hunk's own `hunk diff` working-tree loader. If you open `git diff` through `hunk pager`, Git still decides the patch contents, so untracked files will not appear there.

git config --global core.pager "hunk pager"

Or in your Git config:

[core]
    pager = hunk pager

If you want to keep Git's default pager and add opt-in aliases instead:

git config --global alias.hdiff "-c core.pager=\"hunk pager\" diff"
git config --global alias.hshow "-c core.pager=\"hunk pager\" show"

### Jujutsu pager integration

[](http://github.com/modem-dev/hunk#jujutsu-pager-integration)
To use Hunk as jj's pager, run `jj config edit --user` and update:

[ui]
pager = ["hunk", "pager"]
diff-formatter = ":git"

### Sapling pager integration

[](http://github.com/modem-dev/hunk#sapling-pager-integration)
To use Hunk as Sapling's pager, run `sl config -u` and update:

[pager]
pager = hunk pager

### OpenTUI component

[](http://github.com/modem-dev/hunk#opentui-component)
Hunk also publishes `HunkDiffView` and lower-level primitives from `hunkdiff/opentui` for embedding the same diff renderer in your own OpenTUI app.

See [docs/opentui-component.md](https://github.com/modem-dev/hunk/blob/main/docs/opentui-component.md) for install, API, and runnable examples.

## Examples

[](http://github.com/modem-dev/hunk#examples)
Ready-to-run demo diffs live in [`examples/`](https://github.com/modem-dev/hunk/blob/main/examples/README.md).

Each example includes the exact command to run from the repository root.

## Contributing

[](http://github.com/modem-dev/hunk#contributing)
💬 _Chat with users/contributors on the [Modem Discord server](https://discord.gg/WZFjaP6Gt8)_

For source setup, tests, packaging checks, and repo architecture, see [CONTRIBUTING.md](https://github.com/modem-dev/hunk/blob/main/CONTRIBUTING.md).

## Sponsor

[](http://github.com/modem-dev/hunk#sponsor)
Sponsored by [Modem](https://modem.dev/?utm_source=github&utm_medium=oss&utm_campaign=oss_hunk&utm_content=readme_footer).

[![Image 4: Modem](https://camo.githubusercontent.com/5b5deb6caabfa7a609505bbadf9b1de5260ab2e3024ea3ea774e317703b8bd1c/68747470733a2f2f6d6f64656d2e6465762f696d616765732f6c6f676f2f7376672f6d6f64656d2d636f6d62696e65642d626c61636b2e737667)](https://modem.dev/?utm_source=github&utm_medium=oss&utm_campaign=oss_hunk&utm_content=readme_footer)
## License

[](http://github.com/modem-dev/hunk#license)
[MIT](https://github.com/modem-dev/hunk/blob/main/LICENSE)