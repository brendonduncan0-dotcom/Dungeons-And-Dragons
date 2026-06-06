---
title: Rooftop Reckoning
tags: [dnd, encounter]
one-shot: "[[One-Shot 1 - One Giant Leap for Ratkin]]"
type: combat
---

# Rooftop Reckoning

**Act:** 3
**Location:** [[Rooftop of the Coppergate Mill]]
**Encounter type:** Combat / Social

> [!info] Read Aloud
> The mill roof is flat and wide, with a clear line of sight east across the rooftops to the open sky. At the centre stands a ballista assembled from rope and timber — elegant in a brutal, functional way. Around it, three rats work in hurried, purposeful silence.
>
> Then the shadow crosses the moon. The eclipse begins.
>
> The still rat at the front straightens. Adjusts a tiny sash. Turns to look at you with bright, sharp eyes.
>
> "Ah," says the rat, in perfectly clear Common. "The guild sent professionals. I respect that. But I'm afraid you're too late to stop history."

## Setup

The eclipse has begun. Three Moonrat Sappers are loading and aiming the ballista. [[Grand Squeaker Nibblefang XLII]] is fully lucid and immediately opens diplomatic relations — he wants to explain, justify, and if possible, recruit the party to witness history.

**The ballista fires in 3 rounds** from the party's arrival (the Sappers started early). On Round 3, it fires unless stopped.

**The Eclipse:** Lasts approximately 10 minutes of in-game time. When it ends, the Grand Squeaker loses all intelligence and language mid-sentence.

## Enemies

| Creature | CR | Count | Notes |
|---|---|---|---|
| Moonrat Sapper | 1/4 | 3 | Focused on the ballista — only attack if directly threatened |
| Grand Squeaker Nibblefang XLII | 1 | 1 | Will not attack unless the party is actively violent; prefers to negotiate |

---

```statblock
name: Grand Squeaker Nibblefang XLII
size: Small
type: beast
alignment: unaligned
ac: 13
hp: 22
hit_dice: 5d6 + 5
speed: 30 ft., burrow 15 ft., climb 30 ft.
stats: [8, 16, 12, 18, 14, 16]
skillsaves:
  - Arcana: 6
  - Persuasion: 5
  - Stealth: 5
senses: darkvision 60 ft., passive Perception 12
languages: Common, Undercommon
cr: 1
traits:
  - name: Eclipse Intelligence
    desc: While a lunar eclipse is active, the Grand Squeaker's Intelligence is 18 and it speaks Common and Undercommon. When the eclipse ends, its Intelligence returns to 2, it loses all languages, and all traits marked (Eclipse Only) cease to function.
  - name: Keen Smell
    desc: The Grand Squeaker has advantage on Wisdom (Perception) checks that rely on smell.
  - name: Tactical Genius (Eclipse Only)
    desc: Moonrat allies within 30 feet of the Grand Squeaker have a +1 bonus to attack rolls.
actions:
  - name: Bite
    desc: "Melee Attack Roll: +5, reach 5 ft. Hit: 6 (1d6 + 3) piercing damage."
  - name: Rally the Warren (Eclipse Only, Recharge 5–6)
    desc: The Grand Squeaker lets out a commanding squeak. Up to 3 Moonrats within 60 feet can use their reaction to move up to their speed.
bonus_actions:
  - name: Direct the Engineers (Eclipse Only)
    desc: One Moonrat Sapper within 30 feet of the Grand Squeaker takes one action of the Grand Squeaker's choice (typically Thrown Debris).
```

---

## Stopping the Ballista

**Method 1 — Sabotage:** A character adjacent to the ballista can attempt a DC 13 Dexterity (Sleight of Hand) or Intelligence (Tinker's Tools) check to damage the firing mechanism as an action. On a success, the ballista is disabled. On a failure, a Sapper notices and abandons loading to defend it.

**Method 2 — Destroy it:** Ballista AC 12, HP 18. Sappers actively defend it once it is attacked.

**Method 3 — Negotiate a delay:** Convince [[Grand Squeaker Nibblefang XLII]] to hear the party's full case before firing. Persuasion DC 14 — on a success, Nibblefang grants one additional round of discussion per point above the DC. This does not stop the eclipse timer.

**Method 4 — Disprove the Cheese Moon:** Persuasion DC 20 (or DC 15 with extraordinary physical evidence, such as a fragment of actual moon rock). Almost certainly not available to the party, but worth noting for creative solutions.

**Method 5 — Stall until eclipse ends:** If the party keeps Nibblefang talking long enough, the eclipse ends mid-sentence and the Sappers stop working. The vibe, not hard mechanics, determines when this happens.

## Nibblefang's Arguments

Nibblefang has prepared for every objection. He is wrong, but not easy to beat:

- *"The moon is made of rock."* → "A rock that reflects light with such perfect, luminous warmth? Absurd. That is the glow of aged gouda."
- *"A ballista bolt can't reach the moon."* → "Forty-two generations of engineers disagree. The trajectory is flawless."
- *"The bolt will just fall back down and hit someone."* → (He hasn't considered this. DC 11 Insight reveals a flicker of doubt — push it. This is the crack in his certainty.)

**Key skill checks:**
- Persuasion DC 14 — delay firing by 1 round per point of success margin
- Persuasion DC 20 / DC 15 with evidence — convince Nibblefang the moon isn't cheese
- Insight DC 11 — identify which argument is landing
- Insight DC 14 — sense the grief beneath his conviction; he knows this may be the Order's last chance
- Dexterity (Sleight of Hand) DC 13 — sabotage the firing mechanism

## Possible Outcomes

- **Ballista disabled before firing:** Full victory. See [[One-Shot 1 - One Giant Leap for Ratkin]] Possible Endings.
- **Ballista fires but falls short:** Partial victory (party damaged it enough). The bolt splashes into the river. Thane is grumpy. See Possible Endings.
- **Ballista fires and strikes the moon:** The bolt bounces off. The moon is rock. Nibblefang weeps. See Possible Endings.
- **Eclipse ends mid-encounter:** Grand Squeaker Nibblefang XLII blinks, looks around blankly, and wanders toward the drainpipe. The Sappers stop working. Ordinary rats, ordinary night.

> [!warning] Scaling
> **Easier:** Reduce Sappers to 2; Grand Squeaker does not use Tactical Genius unless directly attacked. **Harder:** Add a 4th Sapper; the ballista fires in 2 rounds instead of 3.

> [!tip] DM Note
> This encounter works best as a hybrid — let the party split their effort, one person talking to Nibblefang while others deal with the ballista. Don't force a binary "fight or talk" choice. The funniest and most memorable runs have both happening simultaneously.
>
> End the eclipse when the moment is most satisfying, not on a round count. Mid-sentence is ideal. "And so, at last, the Great Wheel of Gouda descends to — " *blink* *sniff* *wanders away.*
