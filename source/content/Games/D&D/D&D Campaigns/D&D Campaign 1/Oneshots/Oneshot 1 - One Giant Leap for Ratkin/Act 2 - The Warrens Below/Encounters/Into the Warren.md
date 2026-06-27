---
title: Into the Warren
tags: [dnd, encounter]
oneshot: "[[Oneshot 1 - One Giant Leap for Ratkin]]"
type: combat
---

# Into the Warren

**Act:** 2
**Location:** [[The Great Warren]]
**Encounter type:** Combat

> [!info] Read Aloud
> The tunnel opens into a vaulted chamber that has no right to be under a city street. The walls are packed earth braced with salvaged timber — your timber, from the look of it. Lanterns made of repurposed bottle-glass cast amber light across dozens of burrow entrances, stacked sleeping nests, and a geography that suggests this place has been growing for a very long time. Rats scatter at your entrance. Most of them. Not all.

## Setup

The party has entered the Great Warren's outer ring. Six Moonrats are on guard — conditioned by generations of training to defend the warren even without eclipse-level intelligence.

**Phase 1 — Outer Guard:** Four Moonrats challenge the party near the entrance. They fight as a pack, prioritising the same target. They will not pursue beyond the central corridor.

**Phase 2 — Archive Guard:** Two Moonrat Sappers guard the entrance to the Great Archive. They are smarter than average rats and use hit-and-run tactics — bite and duck into burrow holes, forcing the party to deal with uncertain positioning.

A brief lull between phases gives the party time to read archive wall carvings before engaging the sappers. Don't skip this moment — it lands better mid-adventure than after combat ends.

## Enemies

| Creature | CR | Count | Notes |
|---|---|---|---|
| Moonrat Guard | 1/8 | 4 | Attack the same target when possible; flee if 3+ allies are downed |
| Moonrat Sapper | 1/4 | 2 | Use burrow holes for cover; alternate between Bite and Thrown Debris |

---

```statblock
name: Moonrat
size: Small
type: beast
alignment: unaligned
ac: 12
hp: 7
hit_dice: 2d6
speed: 30 ft., burrow 10 ft.
stats: [7, 15, 11, 2, 10, 4]
skillsaves:
  - Stealth: 4
senses: darkvision 30 ft., passive Perception 10
cr: "1/8"
traits:
  - name: Keen Smell
    desc: The moonrat has advantage on Wisdom (Perception) checks that rely on smell.
  - name: Pack Tactics
    desc: The moonrat has advantage on attack rolls against a creature if at least one of the moonrat's allies is adjacent to the creature and the ally isn't incapacitated.
actions:
  - name: Bite
    desc: "Melee Attack Roll: +4, reach 5 ft. Hit: 4 (1d4 + 2) piercing damage."
```

---

```statblock
name: Moonrat Sapper
size: Small
type: beast
alignment: unaligned
ac: 13
hp: 13
hit_dice: 3d6 + 3
speed: 30 ft., burrow 15 ft., climb 20 ft.
stats: [8, 16, 12, 3, 10, 4]
skillsaves:
  - Stealth: 5
senses: darkvision 60 ft., passive Perception 10
cr: "1/4"
traits:
  - name: Keen Smell
    desc: The moonrat sapper has advantage on Wisdom (Perception) checks that rely on smell.
  - name: Burrowing Cover
    desc: The moonrat sapper can duck into a burrow hole as a bonus action, gaining half cover until it emerges on its next turn.
actions:
  - name: Bite
    desc: "Melee Attack Roll: +5, reach 5 ft. Hit: 6 (1d6 + 3) piercing damage."
  - name: Thrown Debris
    desc: "Ranged Attack Roll: +5, range 20/60 ft. Hit: 5 (1d4 + 3) bludgeoning damage."
```

---

**Terrain features:**
- **Burrow holes** throughout the walls — Small creatures can enter as a bonus action; Medium or larger creatures cannot enter
- **Salvaged timber supports** — provide half cover if stood behind
- **Bottle-glass lanterns** — fragile; shattering one (AC 10, 1 HP) plunges a 10-ft. radius into darkness
- **Narrow corridors** — ranged attack rolls made around corners are at disadvantage for Medium or larger creatures

## The Hidden Alcove (Bonus Objective)

A DC 14 Investigation or DC 12 Perception check in the Archive chamber reveals a sealed niche in the wall. Inside: the Moonrat Treasure Hoard, accumulated over generations.

**Contents:** 3 gp, 47 sp, a *Potion of Healing* (mostly spent — restores `dice: 2d4` HP instead of `dice: 2d4+2`), a collection of shiny buttons, a glass eye, and a small silver earring shaped like a crescent moon (12 gp, clearly the Order's most prized possession).

> [!warning] Scaling
> **Easier:** Reduce outer ring to 3 Moonrats; sappers act independently with no coordination. **Harder:** Add a third Sapper and have both sappers coordinate — one flanks while the other fires debris from cover.

> [!tip] DM Note
> Give the players time to read the archive walls between combat phases. The Great Archive carvings are absurd and oddly moving — generations of rats, each with only a few hours of intelligence in their entire lives, dedicating those hours to this one goal. A great mid-combat beat: a player pauses to read a wall carving mid-fight and finds "The Great Cheese Theory, as established by Grand Squeaker Nibblefang XVII." Let them read it aloud if they want to.
