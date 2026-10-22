# Voice Capture

The goal is simple: when Claude drafts something for this person, they read it and think "yep, that's me."

This is a conversation, not a form. Take your time. Save to `~/.claude/lifechurch/voice.md` using the layout in `templates.md`.

## Step 1: Explain why

Tell them: "I'm going to learn how you write so I'm not handing you stiff, generic messages. The best way is for me to see real stuff you've written. The more real, the better."

## Step 2: Gather samples

Ask for at least 8 real pieces, with a mix across these types. Tell them to paste them in, a few at a time:

1. A first text or email to a new family
2. A thank-you to a volunteer
3. Asking someone to serve or cover a spot
4. A reminder or logistics message to your team
5. An email to parents or to leadership
6. A casual message to a coworker
7. A message that was harder to write, like a gentle correction, a "no," or a tough conversation
8. A handwritten-card style note or a short encouragement

How they can share:

- Paste text straight into the chat, with names and numbers removed or left in for now. You'll sanitize before saving.
- Point you to a file or folder of saved messages.
- If their email, Slack, or messaging tool is already connected, offer to look at a handful of messages they've sent. Only read what they approve, ask them to name the folder or channel, and cap it at about 15 messages. Don't browse their inbox.

If they have little or nothing to share, use scenario prompts instead. Give them these one at a time and say "write it exactly how you'd really send it, typos and all":

- A family visited LifeKids for the first time on Sunday. Text them Monday morning.
- A volunteer has served 10 weeks in a row. Thank them.
- You need someone to cover Sunday's 10:30 preschool room and it's Thursday.
- A parent emailed upset that their kid's class was too crowded. Reply.
- A new volunteer finished training. Welcome them to the team.

## Step 3: Ask about their style directly

Ask these in a relaxed way, in groups of three or so:

- If a friend described how you write, what three words would they use?
- How do you usually open a message? How do you close one? Do you use "Hey," "Hi," a name, a nickname?
- Emojis: never, sometimes, constantly? Which ones? Exclamation points?
- Do you write in short bursts or longer thoughts? Do you use full sentences when you text?
- Is there a phrase, saying, or word you overuse and love? Anything you'd never say?
- Do you use humor? What kind?
- Do you use scripture, prayer, or "praying for you" in messages? When, and when not?
- Does your tone change with parents, volunteers, staff, and leadership? How?
- Any language other than English you use with your families?
- Who do you know that writes the way you wish you did?

## Step 4: Analyze and write the profile

Read all the samples and answers closely. Then write `voice.md` with:

- A short plain-English summary of their voice, three or four sentences, in a tone they'd recognize.
- Patterns you observed, with evidence. Cover typical length of messages and sentences, greetings and sign-offs, contractions, punctuation habits, emoji and exclamation use, how they ask for things, how they say thanks, how they handle a hard message, and how they sound with each audience.
- Signature phrases and favorite words.
- A do and don't list. Include anything they said they never want.
- Channel versions: text, email, handwritten card, team chat. Note how they differ.
- Audience versions: parents and families, volunteers, staff, leadership.
- Five to eight verbatim examples, labeled by type, sanitized per `guardrails.md` (no last names, phone numbers, emails, addresses, or anything about a child's situation).

Show them the summary and the do and don't list and ask: "What did I get wrong?" Fix what they point out.

## Step 5: Calibrate

Draft three test messages using placeholder names ([Parent], [Volunteer]):

1. A first text to a new family
2. A thank-you to a volunteer who has served for a year
3. A "can you cover this Sunday?" ask

Show them all three together. Ask: "Which of these sounds most like you, and what feels off?" Offer quick tags if they don't know what to say: too formal, too excited, too long, too short, too churchy, not enough warmth, perfect.

Revise `voice.md` based on their answers. Draft three more with a different scenario. Repeat until they say it sounds like them. Plan on at least two rounds.

For a sharper check, write two versions of the same message and ask them to pick the one they'd actually send. Use the pick to settle close calls.

## Step 6: Layer in Life.Church house style

Personal voice covers texts, DMs, thank-you notes, and one-on-one messages. House style covers official and outward-facing content such as mass emails, social, signage, push notifications, and web copy.

- If a skill named `lifechurch-writing` is available, use it as the source of truth for house style.
- If not, use the fallback rules in `templates.md` under "Life.Church house style".
- Ask the user which kinds of messages they send that count as official, and which count as personal voice. Record the answer in `voice.md`.
- When the two conflict, house style wins on its specific rules, and the user's warmth, rhythm, and word choice carry everything else.

For LifeKids teams, the ministry tone is playful energy, safety emphasis, and partnership with parents. Check whether that fits how this person talks to parents, and record how.

## Step 7: Keep learning

Tell the user about `/lc-tune`: whenever they change a draft, they can say "learn from that," and Claude will add what it noticed to `voice.md`. Also set this as a standing habit in `voice.md`: after the user edits a draft in a significant way, ask once, "Want me to remember that for next time?"
