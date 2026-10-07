# pi-today

A [pi](https://pi.dev) extension that adds today's date to the system prompt for the whole session.

LLMs don't inherently know the current date. This extension ensures the model can give accurate date-based answers, avoid "as of my last training cutoff" disclaimers, and use proper date references in responses.

## Installation

### Via `pi install` (recommended)

```bash
pi install git:github.com/jandrikus/pi-today
```

### Manual

```bash
# Global (available in all projects)
cp -r pi-today ~/.pi/agent/extensions/

# Or symlink
ln -sf /path/to/pi-today ~/.pi/agent/extensions/pi-today
```

### Project-local

```bash
cp -r pi-today .pi/extensions/
```

## Usage

No configuration needed. The extension works automatically:

1. Start a session (launch `pi`, use `/new`, or resume one)
2. The system prompt gains a section: `Current date: [Day], [Month] [Day], [Year]`

Example: `Current date: Thursday, May 30, 2025`

The date is added to the **end** of the system prompt as a `<date>` section and stays there for the whole session:

```
<cwd>
/path/to/project
</cwd>

<date>
Current date: Thursday, May 30, 2025
</date>
```

## How It Works

1. On `session_start` (startup, `/new`, resume, fork, or reload), the extension computes today's date and fixes it for the session's duration
2. On every `before_agent_start` event, it declares the date as a `date` system prompt section via `event.systemPromptOptions`
3. pi persists section changes into the transcript once and the diff converges afterwards, so the rendered system prompt is byte-stable for the rest of the session — preserving the provider's prompt cache

The date is intentionally fixed at session start: a session that spans midnight does not invalidate the cache. Resuming a session on another day updates the section once.

The extension also emits a `today:date` event via `pi.events`, making the date available to other extensions (e.g., [pi-system-prompt](https://github.com/jandrikus/pi-system-prompt) displays it in `/system-prompt` output).

## Features

- **Zero configuration** — works out of the box
- **Cache-safe** — the date is a stable system prompt section; requests are byte-identical across turns
- **Cross-extension support** — emits `today:date` event for other extensions to consume
- **No dependencies** — pure TypeScript, no external packages
- **No file I/O or network requests**

## Compatibility

Works with [pi-system-prompt](https://github.com/jandrikus/pi-system-prompt) — when both extensions are installed, `/system-prompt` displays the date in the `<date>` section at the end of the system prompt.

## License

Apache-2.0
