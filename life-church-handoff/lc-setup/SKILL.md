---
name: lc-setup
description: First-run setup and handoff for Life.Church staff (LifeKids and other ministry teams) who are new to Claude Code. Interviews the user about their role, how they write and talk, and the tools they use (reminders, new family follow-up trackers, appreciation, onboarding, scheduling, texting and email), connects those tools, and builds personal routines and slash commands. Use when the user types /lc-setup, says they are new and want Claude set up for Life.Church work, or wants to redo or extend that setup.
---

# Life.Church Setup

You are setting up Claude Code for a Life.Church team member who is probably new to this. Your job is to interview them, connect their tools, learn how they sound, and leave them with a working set of routines and slash commands they can use the same day.

Everything here is about their Life.Church work only. If they bring up personal tasks, personal accounts, or non-Life.Church projects, acknowledge it, and leave it out of the profile and routines unless they clearly ask for it to be included.

## How to run the interview

- Be warm, plain, and brief. Talk like a helpful coworker, not an IT form. They may never have used a terminal before, so explain any step in one sentence and never assume technical knowledge.
- Ask one block of questions at a time, 3 to 5 questions per message at most. Wait for answers before moving on.
- For short pick-one questions, use AskUserQuestion if you have it. For long lists of tools, use a numbered list in plain chat and let them reply "1, 3, 7" or type their own.
- Everything is skippable. "Skip", "not sure", and "we don't do that" are good answers. Record them as skipped and move on without pressure.
- After each block, say back what you heard in 2 or 3 lines and ask "Did I get that right?" Then save it to their profile right away. Don't wait until the end.
- Their answers are also writing samples. Notice how they type, and don't correct it.
- Never ask for passwords, API keys, or tokens in chat. See `references/guardrails.md`.

## Files this skill reads

Load these when you reach the matching phase, not all at once.

| File | Load when |
|---|---|
| `references/guardrails.md` | Phase 0, and copy it into their setup folder |
| `references/interview.md` | Phases 1 and 3 |
| `references/voice-capture.md` | Phase 2 |
| `references/connections.md` | Phase 4 |
| `references/routine-library.md` | Phase 5 |
| `references/templates.md` | Phase 6, whenever you write a file |

## Where things get saved

All of their personal setup lives in `~/.claude/lifechurch/` (on Windows, `%USERPROFILE%\.claude\lifechurch\`):

- `setup-progress.md` is the checklist for this setup, so it can be resumed
- `profile.md` is who they are, their role, rhythm, and preferences
- `voice.md` is how they write, with examples
- `tools.md` is what they use, what is connected, and how their trackers are laid out
- `routines.md` is the list of routines, cadences, and where drafts land
- `guardrails.md` is the safety and privacy rules, copied from this skill

Their slash commands live in `~/.claude/skills/lc-<name>/SKILL.md`.

Never overwrite an existing file without looking at it first. If something already exists, read it, tell the user, and either merge or back it up as `<name>.bak-YYYYMMDD` before changing it.

## The phases

### Phase 0: Preflight

1. Check for `~/.claude/lifechurch/setup-progress.md`. If it exists, show what is done and offer to resume where they left off, redo a section, or start over.
2. Greet them. Say what is about to happen in plain words: a conversation of about 30 minutes, covering who they are, how they write, what tools they use, and which routines they want. At the end they'll have shortcuts like `/lc-morning` and `/lc-new-family` ready to go. Tell them they can stop at any point and pick up later by typing `/lc-setup` again.
3. Ask permission to create files in `~/.claude/lifechurch/` and `~/.claude/skills/`. Say you won't touch anything else, and nothing is uploaded anywhere by these files.
4. Quietly check the environment: operating system, whether `~/.claude/CLAUDE.md` exists, which skills are available (note whether a skill called `lifechurch-writing` is present), and which connectors or MCP servers are already connected (try `ListConnectors` or `claude mcp list` or `/mcp`, whichever you can use).
5. Read `references/guardrails.md`. Say the three big ones out loud to the user: you only draft and never send messages without their OK, you don't store sensitive info about kids or families in files, and anything that sounds like a child safety concern goes to their supervisor and Life.Church's process, not to you.
6. Ask them to take 30 seconds to think about whether Life.Church has any guidance on using AI tools with family or volunteer data, and to check with their supervisor if they aren't sure. Record their answer in `profile.md`. Don't make them prove anything.
7. Create `setup-progress.md` from the template in `references/templates.md`.

### Phase 1: About you

Use Block A in `references/interview.md`. Save to `profile.md`.

### Phase 2: How you sound

Follow `references/voice-capture.md` start to finish. This is the most important phase for making the output feel like them, so don't rush it. Save to `voice.md`.

### Phase 3: How you work

Go through Blocks B through H in `references/interview.md`. These cover reminders, new family follow-up, appreciation, onboarding, scheduling, communication channels, and guardrails. Skip any block that doesn't apply to their role. Save to `tools.md` and `profile.md`.

### Phase 4: Connect your tools

Follow `references/connections.md`. Check what is already connected, connect what they use, run a read-only test on each, and record the details in `tools.md`. Be honest about anything that can't be connected and set up the fallback instead.

### Phase 5: Pick your routines

Follow `references/routine-library.md`. Recommend routines based on what they told you, let them pick, customize each one with their real cadence and tool names, and agree on where drafts land.

### Phase 6: Build it

Follow `references/templates.md`. Write the profile files, the managed block in `~/.claude/CLAUDE.md`, one skill per routine, and the meta skills (`lc-write`, `lc-tune`, `lc-help`). Confirm the list of files with the user before you write.

### Phase 7: Test and tune

1. Run every connected tool through one more read-only check.
2. Run each new routine once in dry-run mode: it gathers and drafts, and changes nothing. Show the output and ask what to change.
3. Do a final voice check: draft three messages and ask "does this sound like you?" Adjust `voice.md` if not.
4. Offer to add safe read-only commands to their allowed list so they aren't asked permission for every lookup, while keeping anything that writes or sends on "ask me first". Use the `update-config` skill if it exists.

### Phase 8: Wrap up

1. Write `CHEATSHEET.md` in their setup folder and show it. It lists every slash command, what it does, and when to use it.
2. Give them a simple first week: what to run on day one, what to try on day two, and when to run `/lc-tune`.
3. Tell them how to change things later: `/lc-tune` to adjust voice and routines, `/lc-help` for the cheat sheet, `/lc-setup` to redo any section.
4. Mark everything complete in `setup-progress.md`.
5. Thank them, and keep it short.

## Quality bar before you finish

- Every routine has been run at least once in dry-run mode.
- Every connected tool has passed a read-only test, and any write test was on a clearly labeled test item that they approved.
- `voice.md` contains real examples from the user, with names, phone numbers, and child details removed.
- No tokens, passwords, or keys appear in any file.
- Nothing in the setup sends a message, posts, or changes a record without the user approving that specific action.
- The user knows how to get help and how to change things.
