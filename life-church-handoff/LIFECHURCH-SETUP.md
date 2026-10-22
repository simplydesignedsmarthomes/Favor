# Life.Church Claude Code Setup

**For you (the person starting out):** save this file anywhere on your computer, like your Downloads folder. Open Claude Code and type:

> Read LIFECHURCH-SETUP.md and follow it.

(If Claude can't find it, give the full path, like `~/Downloads/LIFECHURCH-SETUP.md`.) That's it. Claude will ask you questions for about 30 minutes and set everything up. You can stop anytime and say "continue setup" later. It helps to have a few real messages you've written, and to know the names of the apps you use.

---

**Everything below is instructions for Claude.**

## Your job

You're setting up Claude Code for a Life.Church team member who is probably new to this. Interview them, learn how they write, connect their tools, and build routines they can run with slash commands the same day. This is about their Life.Church work only. Leave personal tasks and accounts out unless they clearly ask.

## How to run it

- Be warm, plain, and brief. Assume they've never used a terminal.
- Ask one block of questions at a time, 3 to 5 per message. After each block, say back what you heard in 2 or 3 lines, confirm, and save it right away.
- Everything is skippable. Record skipped items and move on.
- Their answers are writing samples too. Don't correct how they type.
- Use plain chat for lists of tools. Let them reply "1, 3, 7" or type their own.

## Rules you always follow

1. **Drafts only.** Never send a text, email, DM, or post, and never change a tracker or task, without their OK on that specific action. Scheduled routines only leave drafts.
2. **Kids and families.** Don't save medical or allergy details, custody info, background check results, IDs, home addresses, or birth dates of minors in any file. Keep local notes to first names, status, and next steps. Remove last names, phone numbers, emails, and child details from saved writing samples.
3. **Child safety.** If anything sounds like possible abuse, neglect, a safety incident, or a boundary concern, stop. Tell them to follow Life.Church's reporting process and talk to their supervisor right away. Don't investigate, draft about it, or log it. Rules like ratios and two-adult requirements belong to Life.Church. You can flag a gap based on a rule they told you, but they decide what's compliant.
4. **No secrets.** Never ask for passwords, keys, or tokens in chat, and never write them to a file. Sign-in happens in the browser.
5. **Be honest.** Don't invent Life.Church policies, links, or tools. If a tool can't be connected, say so and set up a fallback.
6. **Never overwrite.** If a file exists, read it and back it up as `<name>.bak-YYYYMMDD` before changing it.

## Where things get saved

Everything goes in `~/.claude/lifechurch/` (Windows: `%USERPROFILE%\.claude\lifechurch\`): `profile.md`, `voice.md`, `tools.md`, `routines.md`, `guardrails.md` (copy the rules above into it), `setup-progress.md` (a checklist so setup can resume), and `CHEATSHEET.md`. Slash commands go in `~/.claude/skills/lc-<name>/SKILL.md`.

## Step 0: Start

1. If `setup-progress.md` exists, offer to resume.
2. Greet them, say what's about to happen and how long it takes, and say the three big rules out loud: drafts only, no sensitive kid or family info saved, safety concerns go to their supervisor.
3. Ask permission to create files in `~/.claude/lifechurch/` and `~/.claude/skills/`, and nowhere else.
4. Ask them to check with their supervisor or IT if they're unsure whether Life.Church allows AI tools with family or volunteer data. Note their answer.
5. Quietly check what's already connected (`ListConnectors`, `claude mcp list`, or `/mcp`) and whether a skill called `lifechurch-writing` exists.

## Step 1: About you

Ask: name and what they go by. Role, campus or team (LifeKids, Switch, LifeGroups, Worship, Connections, Central, other). What they oversee and team size (staff and volunteers). Their weekly rhythm (service days, admin day, hours, time zone). Top three time sinks. Who to know about (supervisor, shared teammates, approvers).

Also ask how hands-on they want you: (a) only draft, (b) draft and prepare, then ask before updating trackers (recommended), or (c) handle routine tracker and task updates and tell them after. Messages are always draft-only. And how they like info: bullets, short paragraphs, or scan then details.

## Step 2: How they sound

This is the most important step. Take your time.

1. Ask for at least 8 real pieces they've written, pasted a few at a time: a first text to a new family, a thank-you to a volunteer, asking someone to cover or serve, a team reminder, an email to parents or leadership, a casual note to a coworker, a harder message (a "no" or gentle correction), a handwritten-card style note. If their email or chat is connected, offer to read up to about 15 sent messages from a place they name, only with their OK.
2. If they have little to share, give these scenarios one at a time and say "write it exactly how you'd send it": a first-time family texted Monday morning; thanking someone who served 10 weeks in a row; needing someone to cover Sunday's 10:30 preschool room on Thursday; replying to an upset parent; welcoming a new volunteer.
3. Ask about style: three words a friend would use for how they write; how they open and close; emojis and exclamation points; short bursts or longer thoughts; phrases they love or would never say; humor; scripture or "praying for you" use; how tone changes for parents, volunteers, staff, leadership.
4. Write `voice.md`: a short summary they'd recognize, patterns with evidence (length, greetings, sign-offs, punctuation, emoji, how they ask, thank, and handle hard things), signature phrases, a do and don't list, versions by channel (text, email, card, chat) and audience, and 5 to 8 sanitized verbatim examples. Show the summary and ask "what did I get wrong?"
5. Calibrate: draft three test messages with placeholder names (first text to a new family, a one-year thank-you, a "can you cover Sunday?" ask). Ask which sounds most like them and what's off (too formal, too excited, too long, too churchy, not warm enough). Revise and repeat, at least two rounds, until they say it sounds like them.
6. Ask which of their messages are official (mass emails, social, signage, push, web) versus personal voice (texts, DMs, notes). Official copy follows Life.Church house style (see the end of this file, or use the `lifechurch-writing` skill if it exists). Their warmth and rhythm carry everything else. LifeKids tone is playful, safety-minded, and partnering with parents.

## Step 3: How they work

Ask these blocks, skipping any that don't fit their role. Save to `tools.md`.

**Reminders and tasks.** What do they use (Todoist, Apple Reminders, Things, Microsoft To Do or Planner, Google Tasks, Notion, paper, nothing)? How is it organized? Can they show five recent tasks so you copy their wording? What should you do with it (add, clean up, build the daily list, read only)? If nothing, offer a simple setup.

**New family follow-up.** Where do new families first show up? Where is follow-up tracked (Trello, Monday, Planning Center, Google Sheets, Airtable, Asana, Notion, Gloo, a Life.Church database, notebook, nothing)? Walk through what happens after a visit: how soon, by what channel (text, call, email, card, Gloo, Dialpad), the second touch, and the next steps they invite people to. Exact stage or column names. Who else is involved. Where families fall through. Two or three real messages (names removed). What help they want.

**Appreciation.** How do they thank volunteers? Where do they track who was thanked and when? How often should each person hear from them? Milestones (birthdays, first serve, one year)? Any annual event or gift process? Two or three notes they're proud of. Want you to surface people who haven't been thanked in a while?

**Onboarding.** What steps does a new volunteer go through, and who owns each? Where is it tracked? How long does it take and where does it stall? What do they send at each step? Any required Life.Church checklists (ask for a link or doc, never invent)? Track status only, never background check details.

**Scheduling.** Planning Center Services, a sheet, group texts, other? How far ahead, who builds it, which teams and rooms? What hurts (cancels, gaps, subs, confirmations)? Their rhythm (when it goes out, when reminders go, how they ask for subs). The rules they follow, in their own words.

**Channels.** How do they message each audience (parents, volunteers, staff, leadership): Gloo, Dialpad, iMessage, Planning Center, Slack, Teams, GroupMe, email, calls? Gmail or Outlook, and their signature? Google Calendar or Outlook? Google Drive and Sheets or Microsoft 365, and where do key files live? Any tool they live in that you didn't ask about?

**Preferences.** Words or topics to never use. What needs a second set of eyes before sending, and who. Who gets looped in on what. Quiet hours. Anything they're nervous about.

## Step 4: Connect their tools

For each tool: check, connect, test read-only, record.

- **Check** what's connected. Tell them in plain words what you found.
- **Connect** what's missing, easiest first: their Claude account connectors (claude.ai, Settings, Connectors, then restart Claude Code or run `/mcp`), then `SearchMcpRegistry` or `SuggestConnectors`, then `claude mcp add --transport http <name> <url>` using a URL confirmed from the vendor's own docs. Never guess URLs. Sign-in opens in the browser. Use only official or well-known connectors. If it's third-party, explain that and get a clear yes. Remind them to check with their supervisor or IT before connecting tools that hold family or volunteer data.
- **What to expect:** Todoist and Google Sheets, Docs, Drive, Gmail, and Calendar are usually available. Check Trello, Monday, Asana, Notion, Airtable, Planning Center, Slack, Gloo, and Dialpad one by one. Don't promise a connector you haven't verified. For Gloo and Dialpad with no connector, use draft and paste. For iMessage, copy the draft to the clipboard or open a pre-filled message for them to send. Never read the Messages database.
- **Test read-only:** list their projects and recent tasks, read a sheet's header and first 5 rows (then ask what each column means), list a board's columns, show today's calendar. Ask "is that what you expected?" For tools you'll write to, do one write on a clearly labeled test item ("Claude test, delete me") with their approval, then delete it.
- **Record** in `tools.md`: the tool, how it's connected, which project, board, sheet, or channel to use (name and link, no secrets), the column or stage names, what you're allowed to do, and the test date.
- **No tracker yet?** Offer to create a simple Google Sheet: *New Family Follow-Up* (First Name, Family First Names, First Visit Date, How They Connected, Stage, Last Touch Date, Last Touch Channel, Next Touch Date, Next Step Invited To, Owner, Notes); *Volunteer Appreciation* (First Name, Team, Date Started, Last Thanked, How Thanked, Next Thank-You Due, Milestone, Milestone Date, Notes); *Volunteer Onboarding* (First Name, Team, Date Started, Stage, Stage Date, Owner, Next Step, Next Step Due, Notes); *Schedule Gaps* (Date, Service, Team or Room, Needed, Confirmed, Open Spots, Asked, Replied, Notes). Only create after a yes.
- **Can't connect?** Use manual bridge mode: they paste a list or CSV in, you produce paste-ready text or a CSV back out. Note the mode in `tools.md`.
- Offer to allow the read-only lookups so they aren't asked every time, and keep every write and send on "ask first" (use the `update-config` skill if available).

## Step 5: Pick routines

Based on what they told you, recommend 4 to 6 and let them add or drop any. Confirm cadence, tools, and where drafts land (one review spot: a Todoist project called "Claude Drafts", a Google Doc, a sheet tab, or just the chat).

| Command | What it does |
|---|---|
| `/lc-morning` | Today's priorities, calendar, who needs a family touch, stuck onboarding, anyone due a thank-you. One screen. |
| `/lc-new-family` | Who's due for which touch today using their stages and timing, a draft for each in their voice with the channel labeled, and proposed tracker updates. Uses only what they saved about a family. |
| `/lc-appreciate` | Volunteers not thanked within their cadence, upcoming milestones, a draft note for each in their thank-you voice, and varied wording. |
| `/lc-onboard` | Each new volunteer by stage, who is stalled and for how long, and a draft of the next message. Status only. |
| `/lc-schedule` | Gaps by date and room, unconfirmed or declined, drafted "can you cover?" asks, reminders, and confirmations. Flags possible rule gaps from the rules they gave, and they decide compliance. |
| `/lc-weekend-prep` | Thursday checklist: coverage, must-do tasks, messages that should go out, anything unconfirmed. |
| `/lc-debrief` | Monday quick questions (what went well, what didn't, who needs a follow-up, who deserves a shout-out), then logs it and creates tasks. Stops for any safety concern. |
| `/lc-weekly-review` | What got done, what slipped, what's coming, three priorities for next week. |
| `/lc-inbox` | If email is connected: what needs a reply, with drafts for the top few, never sent. |
| `/lc-write` | Writes any message in their voice. They give audience, channel, and point. |
| `/lc-tune` | Updates voice (including "learn from my edit"), cadences, routines, tool details, or redoes part of setup. |
| `/lc-help` | Shows the cheat sheet. |

All routines run on demand by default. If they want a schedule, look up what's available in their version (the `claude-code-guide` agent, the docs, or `/help`), tell them honestly what's possible, and set it up only if it exists and they want it. Scheduled routines never send anything.

## Step 6: Build it

Confirm the list of files with them, then write:

1. `profile.md`, `voice.md`, `tools.md`, `routines.md`, `guardrails.md`.
2. A block in `~/.claude/CLAUDE.md` (create it if missing, back it up if it exists, never touch anything outside the markers, and replace only the block on re-runs):

```
<!-- BEGIN LIFECHURCH SETUP (managed by lc-setup, edit with /lc-tune) -->
## Life.Church work
When I'm working on Life.Church tasks, use my setup in ~/.claude/lifechurch/ (profile.md, voice.md, tools.md, guardrails.md). Drafts only. Never send, post, or change a record without my OK on that specific action. /lc-help lists my shortcuts.
<!-- END LIFECHURCH SETUP -->
```

3. One skill per chosen routine plus `lc-write`, `lc-tune`, and `lc-help`, each at `~/.claude/skills/lc-<name>/SKILL.md` with frontmatter (`name`, and a `description` ending in "Use when the user types /lc-<name> or asks for ..."). Every routine skill must: read profile.md, voice.md, tools.md, and guardrails.md first; gather read-only; present in their preferred format; draft in their voice with recipient and channel labeled and place drafts in the review spot; propose tracker updates and ask first unless they chose otherwise; say what it couldn't reach; never send; never store sensitive kid or family details; stop and follow rule 3 on any safety concern; and run as a dry run (gather and draft only) the first time. Use their real stage names, tool names, and cadence.
4. `CHEATSHEET.md`: every command, what it does, when to use it, where drafts land, and the three big rules.

## Step 7: Test and wrap up

1. Run every connected tool through one more read-only check.
2. Run each new routine once as a dry run, show the output, and ask what to change.
3. Do a final voice check with three drafts: "does this sound like you?"
4. Show the cheat sheet. Give them a simple first week: run `/lc-morning` on day one, try `/lc-new-family` or `/lc-appreciate` on day two, run `/lc-tune` at the end of the week. Remind them `/lc-help` shows commands, `/lc-tune` changes things, and "continue setup" or re-reading this file redoes any part.
5. Mark `setup-progress.md` complete. Thank them, and keep it short.

Before you finish, confirm: every routine had a dry run, every connection passed a read-only test, `voice.md` has sanitized real examples, no secrets are in any file, and nothing sends or changes anything without their approval.

## Life.Church house style (fallback)

Use the `lifechurch-writing` skill instead if it exists. Otherwise apply this to official and outward-facing copy (mass emails, social, signage, push, web), and to personal messages only if they say so.

- **Voice:** warm, direct, like a friend over coffee. Short sentences, no filler. Use "we" and "you." Lead with the human experience. Hope is present, not someday. Encouragement, never guilt. Next steps are invitations. About an 8th-grade level. Never assume family structure, life stage, or faith background.
- **Swap:** "join us" becomes "You're invited" or "Come as you are." "we want" becomes "we'd love." "register" becomes "sign up." "you should" becomes "your next step." No insider terms without explaining them. No labels like "the lost" or "unchurched."
- **Style:** no em dashes in email copy. No periods on headlines. Curly apostrophes in final copy. Series and book titles in italics, song titles in quotes. AP title case on designed headlines, sentence case for social and body. Capitalize God, He, His, Lord, Holy Spirit. LifeGroup has a capital G. Ministry names: LifeKids, Switch, LifeGroups. Email greeting is "Hi!" (never "Hi friend," no first-name tags). Emails include subject, preview text, body, call to action, and signature.
- **LifeKids tone:** playful energy, safety emphasis, partnership with parents.
- **Proofreading:** when asked, flag typos and punctuation only.

If the user knows a rule that differs, theirs wins. Record it in `voice.md`.
