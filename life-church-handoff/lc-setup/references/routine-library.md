# Routine Library

Routines are shortcuts, each one a skill the user runs by typing a slash command, like `/lc-morning`. This file describes the menu. Recommend a handful based on what the user told you in the interview, not the whole list.

## How to offer them

1. Based on the interview, pick the 4 to 6 routines that fit best and explain each in one line.
2. Let them add, drop, or rename.
3. For each one they pick, confirm: cadence (when they'd run it), the tools it uses, what it produces, and where drafts land.
4. Save the final list in `routines.md`.

## Three ways a routine can run

Explain these simply, then agree on one per routine:

1. **On demand.** The user types the slash command whenever they want. This always works and is the default.
2. **While Claude is open.** `/loop` can repeat a routine on an interval during a session. Good for short check-ins.
3. **On a schedule.** Routines or scheduled tasks that run on their own at a set time. The options differ by version and plan, so look up what's available now (the `claude-code-guide` agent, the Claude Code docs, or `/help`), tell the user what's possible for them, and set it up only if it exists and they want it. Scheduled routines must never send anything. They prepare drafts and leave them in the review spot.

If scheduling isn't available or the user is unsure, start with on demand. Move to a schedule later with `/lc-tune`.

## Where drafts land

Agree on one review spot: a Todoist project called "Claude Drafts", a Google Doc, a sheet tab, or simply the chat. Every routine writes drafts there and nowhere else.

## The standard every routine follows

Every routine skill must:

1. Read `~/.claude/lifechurch/profile.md`, `voice.md`, `tools.md`, and `guardrails.md` first.
2. Gather information read-only.
3. Show findings in the format the user likes, in a short scan with details on request.
4. Draft messages in the user's voice, with the channel and recipient labeled, and deliver them to the review spot.
5. Propose any updates to trackers or tasks, and wait for approval unless the user chose "handle routine updates on my own" for that tool.
6. Never send anything.
7. Say plainly what it couldn't reach or skipped.
8. Stay inside the user's quiet hours if it runs on a schedule.

On first use, run in dry-run mode: gather and draft only, change nothing.

## The menu

### `/lc-morning` Morning brief
- **For:** a quick start to the day.
- **Pulls from:** task app, calendar, new family tracker, appreciation tracker, onboarding tracker, email (if connected, subject lines only).
- **Produces:** today's top priorities, today's calendar, who needs a follow-up touch, any onboarding stuck for too long, and anyone due for a thank-you. Keep to one screen.
- **Default cadence:** weekday mornings, on demand.

### `/lc-new-family` New family follow-up
- **For:** making sure no new family slips through.
- **Pulls from:** the new family tracker and the user's cadence from Block C.
- **Produces:** a list of who is due for which touch today (using their exact stages and timing), a draft message for each in the user's voice, labeled with channel, and proposed tracker updates. For families with a first-visit note, use only what the user saved, never guess details about the family.
- **Also offers:** a weekly summary of how many came, how many were contacted, and who is stalled.
- **Default cadence:** Monday morning, plus on demand.

### `/lc-appreciate` Volunteer appreciation
- **For:** making sure every volunteer feels seen.
- **Pulls from:** the appreciation tracker, scheduling data (who has served and how often), milestones.
- **Produces:** the people who haven't heard from the user in longer than their cadence, upcoming birthdays and milestones (only if the user keeps those), a draft note for each in the user's thank-you voice, and a suggested way to deliver it (text, card, shout-out). Variety matters, so avoid repeating phrases the user sent the same person recently.
- **Default cadence:** weekly, on demand.

### `/lc-onboard` Onboarding pipeline
- **For:** moving new volunteers through each step.
- **Pulls from:** the onboarding tracker and the stages from Block E.
- **Produces:** each person grouped by stage, who is stalled and for how long, and a draft of the next message for each. Track status only. Never store background check details or results.
- **Default cadence:** twice a week, on demand.

### `/lc-schedule` Scheduling assistant
- **For:** keeping every room covered.
- **Pulls from:** the scheduling tool and the rules the user gave in Block F.
- **Produces:** gaps by date and room, anyone who declined or hasn't confirmed, drafted "can you cover?" asks (with a suggested short list of who to ask, using the user's own notes), and reminder and confirmation drafts. Flag possible rule gaps using only the rules the user stated, and say clearly that the user decides what is compliant.
- **Default cadence:** midweek, on demand.

### `/lc-weekend-prep` Weekend prep
- **For:** a Thursday or Friday checklist so Sunday runs smoothly.
- **Pulls from:** schedule, tasks, calendar, any supplies or curriculum notes the user keeps.
- **Produces:** coverage status, open tasks that must happen before the weekend, messages that should go out (reminders, special announcements), and anything unconfirmed.
- **Default cadence:** Thursday morning.

### `/lc-debrief` Weekend debrief
- **For:** capturing what happened while it's fresh.
- **Asks:** a few quick questions (what went well, what didn't, who needs a follow-up, who deserves a shout-out, anything to fix).
- **Produces:** a short log, new tasks for follow-ups, and appreciation items added to the tracker. If anything sounds like a safety or care concern, stop and follow `guardrails.md`.
- **Default cadence:** Monday morning, on demand.

### `/lc-weekly-review` Weekly review
- **For:** closing the loop on the week and planning the next one.
- **Pulls from:** completed and overdue tasks, trackers, calendar.
- **Produces:** what got done, what slipped, what's coming, and three priorities for next week.
- **Default cadence:** Friday afternoon.

### `/lc-inbox` Inbox triage (only if email is connected)
- **For:** getting through email faster.
- **Produces:** a sorted list of what needs a reply, what can wait, and what can be ignored, with drafted replies in the user's voice for the top few. Drafts go in the review spot, never sent.
- **Default cadence:** on demand.

### Always included

- `/lc-write` writes anything in the user's voice. They describe the message, the audience, and the channel. Claude drafts, then offers to adjust.
- `/lc-tune` updates voice, routines, cadences, or tool details, and can add a new routine.
- `/lc-help` shows the cheat sheet.

## Custom routines

If they want something not on the list, such as a weekly parent email, a sign-up reminder sequence, or a Christmas Eve volunteer plan, build it as a new `lc-<name>` skill following the same standard. Ask the same questions: what it pulls from, what it produces, cadence, and where drafts land.
