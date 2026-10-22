# Life.Church Claude Code Starter

A guided setup for Life.Church team members who are new to Claude Code. It interviews you, learns how you write, connects the tools you already use, and builds shortcuts for the things you do every week: new family follow-up, volunteer appreciation, onboarding, and scheduling.

It takes about 30 minutes. You can stop and pick it back up anytime.

## Install (2 minutes)

You need Claude Code installed and signed in first. If you don't have it yet, ask your supervisor or IT, or follow the install steps at code.claude.com/docs.

**Mac or Linux.** Open Terminal, go to the folder that holds this one, and run:

```
mkdir -p ~/.claude/skills
cp -R lc-setup ~/.claude/skills/
```

**Windows (PowerShell).**

```
New-Item -ItemType Directory -Force "$HOME\.claude\skills"
Copy-Item -Recurse lc-setup "$HOME\.claude\skills\"
```

Then start Claude Code by typing `claude`, and type:

```
/lc-setup
```

If it says it doesn't know that command, quit Claude Code, open it again, and try once more.

**Still stuck?** Start Claude Code and paste this, with the real path to the folder:

> Read the file at [path to this folder]/lc-setup/SKILL.md and follow it to set me up.

## Before you start

It goes faster if you have these handy:

- A handful of real messages you've written (a text to a new family, a thank-you to a volunteer, a "can you cover Sunday?" ask). Names and numbers can come out later.
- The names of the apps you use for to-dos, tracking new families, tracking volunteers, scheduling, texting, and email.
- Your logins for those apps. Sign-in happens in your browser. You never type passwords into Claude.
- Five minutes to check with your supervisor or IT if you aren't sure what's OK to connect. Some of these tools hold information about families and volunteers.

## What you'll end up with

- A profile of your role and how you like to work
- A voice guide, so drafts sound like you
- Your tools connected, where possible, and a clear fallback where not
- Shortcuts like `/lc-morning`, `/lc-new-family`, `/lc-appreciate`, `/lc-onboard`, `/lc-schedule`, `/lc-weekend-prep`, `/lc-debrief`, and `/lc-write`
- A one-page cheat sheet (`/lc-help`)

## How it behaves

- **Drafts only.** It never sends a text, email, or post without your OK on that exact message.
- **Careful with kids and families.** It won't save medical, custody, background check, or other sensitive details in local files.
- **Child safety first.** If something sounds like a safety concern, it stops and points you to Life.Church's process and your supervisor.
- **Only Life.Church work.** Personal stuff isn't included unless you ask.
- **No secrets stored.** It never asks you to paste passwords or keys, and never saves them.

Your setup is saved on your own computer in `~/.claude/lifechurch/` (your home folder, then `.claude`, then `lifechurch`). To remove it, delete that folder and the `lc-` folders in `~/.claude/skills/`.

## Making changes later

- `/lc-tune` changes your voice, routines, schedules, or tool details
- `/lc-help` shows your shortcuts
- `/lc-setup` redoes any part of the interview
