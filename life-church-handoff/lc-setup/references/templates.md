# Templates

Layouts for every file `/lc-setup` writes. Fill them from the interview. Keep them short and scannable. Replace everything in [brackets]. Leave out sections the user skipped, and mark them "skipped".

---

## setup-progress.md

```markdown
# Life.Church Setup Progress
Started: [date]  Last updated: [date]

- [ ] Phase 0: Preflight and permission
- [ ] Phase 1: About you
- [ ] Phase 2: Voice (samples gathered, profile written, calibrated)
- [ ] Phase 3: How you work (Blocks B to H)
- [ ] Phase 4: Tools connected and tested
- [ ] Phase 5: Routines chosen
- [ ] Phase 6: Files and skills built
- [ ] Phase 7: Dry runs and final tune
- [ ] Phase 8: Cheat sheet and wrap-up

Notes / where we stopped: [text]
```

---

## profile.md

```markdown
# Profile

**Name / goes by:** 
**Role, campus or team:** 
**Oversees:** [ages, rooms, programs]   **Team size:** [staff] staff, about [n] volunteers
**Supervisor / key people:** [names and roles only]
**Time zone and work hours:** 
**Weekly rhythm:** service or event days [..], admin day [..]
**Biggest time sinks / wish list:** 
**How hands-on Claude should be:** [draft only | prepare and ask first | handle routine updates and tell me]
**How I like information:** [bullets | short paragraphs | scan then details]
**Never use:** [words, phrases, topics]
**Needs a second set of eyes:** [what] -> [who]
**Always loop in:** [rules]
**Quiet hours:** 
**AI-use guidance check with supervisor or IT:** [done / not sure / notes]
**Concerns:** 
```

---

## voice.md

```markdown
# My Voice

## In a nutshell
[3 or 4 sentences, in a tone the user would recognize.]

## Patterns
- Length and rhythm: 
- Openers and sign-offs: 
- Punctuation, emoji, exclamation points: 
- How I ask for things: 
- How I say thanks: 
- How I handle a hard message: 

## Signature phrases and favorite words
- 

## Do
- 
## Don't
- 

## By channel
- Text: 
- Email: 
- Handwritten card: 
- Team chat: 

## By audience
- Parents and families: 
- Volunteers: 
- Staff: 
- Leadership: 

## Official versus personal
- Official, house style applies: [mass emails, social, signage, push, web, other]
- Personal voice: [texts, DMs, thank-you notes, one-on-one email]
- LifeKids tone with parents (playful, safety-minded, partnering): [how it fits me]

## Examples (sanitized: no last names, phone numbers, emails, addresses, or child details)
### [Type: first text to a new family]
> 

## Learning log
- [date]: [what changed and why]
- Standing habit: after a big edit to a draft, ask once, "Want me to remember that for next time?"
```

---

## tools.md

```markdown
# Tools

## Reminders and tasks
- App: [..]  Connection: [connector / fallback]
- Where: [project or list name]
- How I organize: [labels, priorities, naming style with 2 examples]
- Claude may: [read | draft | write with approval | write routine updates]
- Tested: [date, result]

## New family follow-up
- Where families first appear: 
- Tracker: [tool] [board or sheet name and link]
- Stages (exact names): 
- Cadence: [Day 1: text, Day 3: ..., Day 10: ...]
- Channels per step: 
- Owners and hand-offs: 
- Usual stall points: 
- Column map: [column -> meaning]
- Claude may: 
- Tested: 

## Appreciation
- Tracker: 
- Cadence: [how often per volunteer]
- Milestones: 
- Annual event or season: 
- Delivery styles: [text, card, shout-out, gift]
- Claude may: 
- Tested: 

## Onboarding
- Tracker: 
- Stages in order with owners: 
- Typical timing and stall points: 
- Message templates (sanitized): 
- Required Life.Church checklists or policies (links the user gave): 
- Claude may: [status only, never background check details]
- Tested: 

## Scheduling
- Tool: [Planning Center Services / sheet / other]
- Planning horizon and who builds: 
- Teams, rooms, roles: 
- Rhythm: [schedule out when, reminders when, subs process]
- Rules the user follows, in their words (Claude flags possible gaps, user decides compliance): 
- Claude may: 
- Tested: 

## Communication channels
| Audience | Channel | Mode (connected / draft and paste / draft and copy) |
|---|---|---|
| Parents and families | | |
| Volunteers | | |
| Staff | | |
| Leadership | | |

- Email: [Gmail / Outlook]  Signature: [paste]
- Calendar: 
- Team chat: [channels Claude may read]
- Key files and links: 

## Review spot for drafts
[Todoist project / Google Doc / sheet tab / chat]
```

---

## routines.md

```markdown
# Routines

| Command | What it does | Cadence | Runs how | Tools | Drafts land |
|---|---|---|---|---|---|
| /lc-morning | | | on demand | | |

Scheduled or unattended routines prepare drafts only. They never send.
```

---

## CLAUDE.md managed block

Add to `~/.claude/CLAUDE.md`. Create the file if it doesn't exist. If it exists, back it up first, keep everything outside the markers untouched, and replace only what's between the markers on re-runs.

```markdown
<!-- BEGIN LIFECHURCH SETUP (managed by /lc-setup, edit with /lc-tune) -->
## Life.Church work

When I'm working on Life.Church tasks (LifeKids, volunteers, families, scheduling, communications), use my setup:

- Who I am and how I like to work: @~/.claude/lifechurch/profile.md
- How I write: @~/.claude/lifechurch/voice.md
- My tools and trackers: @~/.claude/lifechurch/tools.md
- Rules to always follow: @~/.claude/lifechurch/guardrails.md

Drafts only. Never send, post, or change a record without my OK on that specific action.
Shortcuts: /lc-help lists them.
<!-- END LIFECHURCH SETUP -->
```

---

## Routine skill skeleton

Write one per routine to `~/.claude/skills/lc-<name>/SKILL.md`. Fill in the specifics from `routine-library.md` and the user's answers, using their real stage names, tool names, cadence, and wording.

```markdown
---
name: lc-<name>
description: [One sentence on what it does, plus "Use when the user types /lc-<name> or asks for <plain-language triggers>."]
---

# [Routine title]

First, read these files in ~/.claude/lifechurch/: profile.md, voice.md, tools.md, guardrails.md. Follow guardrails.md at all times.

## Goal
[One or two sentences.]

## Steps
1. Gather, read-only: [exact tools, projects, sheets, or boards, with names from tools.md].
2. Work out: [what counts as due, stalled, or a gap, using the user's own cadence and stage names].
3. Present: [format from profile.md, short scan first, details on request].
4. Draft: [messages in the user's voice from voice.md, labeled with recipient and channel] and place them in [review spot].
5. Propose updates to [tracker or task app]. Ask before writing unless profile.md says routine updates are OK for this tool.
6. Report anything you couldn't reach or skipped.

## Never
- Send, post, or publish anything.
- Store sensitive details about kids or families.
- Guess about a family or volunteer beyond what the user saved.
- Decide compliance questions. Flag, and let the user decide.
- Handle a possible child safety concern. Stop and follow guardrails.md section 3.

## Dry-run
If this has never run before, or the user says "dry run", gather and draft only and change nothing.
```

---

## Meta skills to write

**lc-write** writes any message in the user's voice. Ask for the audience, the channel, and the point. Draft once, label the channel, offer one quick adjustment, and never send. Check whether official house style applies (see below).

**lc-tune** adjusts the setup. It can: add voice examples ("learn from this edit"), change cadences, rename or add a routine, update a tracker's stages or columns, change what Claude may do on a tool, or redo a section of the interview. It edits the files in `~/.claude/lifechurch/` and the matching skills, and re-writes the CLAUDE.md managed block if needed.

**lc-help** prints `~/.claude/lifechurch/CHEATSHEET.md`.

---

## CHEATSHEET.md

```markdown
# My Life.Church Claude Cheat Sheet

| Type this | What happens | When |
|---|---|---|
| /lc-morning | | |
| /lc-new-family | | |
| /lc-write | Drafts anything in my voice | anytime |
| /lc-tune | Fix voice, change routines | when something feels off |
| /lc-help | Shows this sheet | anytime |
| /lc-setup | Redo or extend setup | when things change |

**Rules I set:** drafts only, nothing sends without my OK, no sensitive kid or family details saved.
**Drafts land in:** [review spot]
**Safety:** if something sounds like a child safety concern, stop and follow Life.Church's process and talk to my supervisor.
```

---

## Starter tracker columns (for Google Sheets, only if the user has no tracker)

**New Family Follow-Up**
First Name | Family or Child First Names | First Visit Date | How They Connected | Stage | Last Touch Date | Last Touch Channel | Next Touch Date | Next Step Invited To | Owner | Notes (keep simple, no sensitive details)

**Volunteer Appreciation**
First Name | Team | Date Started | Last Thanked Date | How Thanked | Next Thank-You Due | Milestone | Milestone Date | Notes (no sensitive details)

**Volunteer Onboarding**
First Name | Team Interested In | Date Started | Stage | Stage Date | Owner | Next Step | Next Step Due | Notes (status only, never background check details)

**Schedule Gaps**
Date | Service | Team or Room | Needed | Confirmed | Open Spots | Asked | Replied | Notes

---

## Life.Church house style (fallback)

Use the `lifechurch-writing` skill instead if it's available. If it isn't, use these rules for official and outward-facing copy (mass emails, social, signage, push, web). Apply them to personal messages only if the user says to.

**Voice:** warm, direct, genuine, like talking to a friend over coffee. Short sentences. Cut filler. Use "we" and "you." Lead with the human experience. Hope is present, not someday. Start with encouragement, never guilt. Next steps are invitations. Write at about an 8th-grade level. Never assume family structure, life stage, or faith background.

| Don't write | Write instead |
|---|---|
| join us | You're invited, Come as you are, There's a place for you |
| we want | we'd love |
| register | sign up |
| you should | your next step, you're invited |
| Insider terms with no context (sanctification, tithe) | Plain language, or explain on first use |
| Labels like "the lost" or "unchurched" | Language that welcomes |
| Guilt framing | Opportunity and impact framing |

**Style:**
- No em dashes in email copy. Use commas, colons, or new sentences.
- No periods on headlines or display copy.
- Curly apostrophes in final copy.
- Series and book titles in italics, song titles in quotation marks.
- AP title case on designed headlines. Sentence case for social and body copy.
- Capitalize divine titles and pronouns (God, He, His, Lord, Holy Spirit).
- LifeGroup has a capital G. Ministry names: LifeKids, Switch, LifeGroups.
- Email greeting is "Hi!" Never "Hi friend," and no personalized first-name tags.
- Emails have a subject line, preview text, body, call to action, and signature.

**LifeKids tone:** playful energy, safety emphasis, partnership with parents.

**Proofreading mode:** when asked to proofread, flag typos and punctuation only. No rewrites.

If the user knows a rule that differs from these (for example from Communications), their version wins. Record it in `voice.md`.
