# Connecting Tools

Goal: every tool the user named is either connected and tested, or has a clear fallback. Be honest at every step. Never claim a connection exists that you haven't verified.

Follow this loop for each tool: **check, connect, test read-only, record**.

## Before you connect anything

Remind them once: "Some of these tools hold information about families and volunteers. Make sure you're OK to connect them, and if you're unsure, check with your supervisor or IT first." Then continue at their pace.

Also tell them how sign-in works: a browser window opens, they log in to that tool and approve access, and Claude never sees their password. If anything asks them to paste a password or key into chat, stop. See `guardrails.md`.

## 1. Check what's already connected

Try, in this order, whatever you have:

- The `ListConnectors` tool, or `ToolSearch` for the tool's name (for example "todoist" or "sheets")
- `claude mcp list` in a terminal, or `/mcp` inside Claude Code
- Connectors added in their Claude account (Settings, then Connectors) show up in Claude Code when they're signed in with the same account

Tell the user what you found in plain words: "Todoist and Google Sheets are already connected. Slack isn't yet."

## 2. Connect what's missing

Ways to add a tool, easiest first:

1. **Their Claude account connectors.** Have them open Claude in the browser, go to Settings, then Connectors, find the tool, and click Connect. Then restart Claude Code or run `/mcp` to refresh.
2. **Search the registry.** If `SearchMcpRegistry` or `SuggestConnectors` is available, use it to find the tool and show them the result.
3. **Add a remote server by command.** For a vendor's official remote MCP server: `claude mcp add --transport http <name> <url>`, then `/mcp` to sign in through the browser. Only use a URL you have confirmed from the vendor's own documentation. Look it up with web search or by asking the user to point you to it. Don't guess URLs.
4. **Plugins.** `ListPlugins` or `SearchPlugins` may show an official plugin for the tool.

Only use official or well-known connectors. If the only option is a community-built server, tell the user it's third-party, explain in a sentence what that means, and get a clear yes before installing it. Suggest they check with IT.

## 3. What to look for, by tool

Always verify current availability. Connectors change, so treat this list as what to check, not as a promise.

**Reminders and tasks**
- Todoist: usually available as a connector. Offer to read projects and labels, then add and update tasks.
- Apple Reminders, Things, Microsoft To Do, Google Tasks: check for a connector or plugin. If none, fall back to a simple manual bridge (see below), or offer to move their daily list into Todoist or a Google Sheet.

**Trackers for new family follow-up, onboarding, appreciation**
- Google Sheets: usually available. This is the easiest tracker to connect, and it works as a fallback for everything else.
- Trello, Monday, Asana, Notion, Airtable, Planning Center: check each one's current connector status. If there's no official connector, the options are (a) manual bridge with CSV export and import, (b) a vendor API with a personal token that the user saves as an environment variable themselves, kept out of every file and chat, and only if IT is OK with it.
- Life.Church internal databases or custom tools: ask the user what it is and whether there's an approved way to connect. Don't guess.

**Messaging**
- Gloo, Dialpad: check for a connector or API. If there's no connector, use draft-and-paste mode: Claude writes the message, the user copies it into the tool. If they want more, ask them to check with their admin whether an API is allowed. Don't promise automation that doesn't exist.
- iMessage: on a Mac, use draft-and-copy (copy to clipboard) or open a pre-filled message window for the user to press send. Do not read the Messages database or request Full Disk Access for this.
- Slack or Teams: check for a connector. Read only the channels the user picks. Drafts only.

**Email, calendar, files**
- Gmail or Outlook, Google Calendar or Outlook Calendar, Google Drive, Docs, and Sheets, or Microsoft 365: check for connectors. For email, start read-only and drafts only.

## 4. Test read-only

For each connected tool, do a small safe read and show the result to the user:

- Task app: list their projects, and the five most recent tasks.
- Spreadsheet: read the header row and the first five rows. Ask what each column means and save the mapping.
- Board (Trello, Monday, etc.): list the board, its columns or groups, and a few cards.
- Calendar: show today's and tomorrow's events.
- Email or chat: list a handful of subject lines or messages from a place they named.

Ask: "Is that what you expected to see?"

Then, for tools where Claude will write, do one write test on a clearly labeled item, such as a task called "Claude test, delete me". Show the user, get approval before you create it, then delete it.

## 5. Record it

Add each tool to `tools.md` with:

- Tool name and what it's used for
- How it's connected (connector name, plugin, or fallback mode)
- The specific project, board, sheet, or channel Claude should use (name and link or ID, no secrets)
- For trackers, the exact column or stage names and what they mean
- What Claude is allowed to do: read, draft, write (with approval), write (without approval for routine updates)
- Date tested and result

## 6. If there's no tracker yet

If someone doesn't track new families, volunteer appreciation, or onboarding anywhere, offer to create a simple Google Sheet for each with the starter columns in `templates.md`. Create them only after they say yes, with a connected Sheets tool. Put the sheet names and links in `tools.md`. If Sheets isn't connected, give them the column list to paste into a new sheet themselves.

## 7. Manual bridge mode

When a tool can't be connected, still make it useful:

- **Paste in:** the user pastes a list, an export, or a CSV, and Claude reads it and produces the output.
- **Paste out:** Claude produces ready-to-paste text, or a CSV they can import.
- Note the mode in `tools.md` so every routine knows to ask for the paste first.

## 8. Reduce permission prompts, safely

Once connections work, offer to allow the read-only calls so the user isn't asked every time, such as listing tasks, reading a sheet, or reading the calendar. Keep every write, send, create, update, or delete on "ask first". Use the `update-config` skill if it's available, or explain the `/permissions` command and let the user decide. Later, `/fewer-permission-prompts` can suggest more.
