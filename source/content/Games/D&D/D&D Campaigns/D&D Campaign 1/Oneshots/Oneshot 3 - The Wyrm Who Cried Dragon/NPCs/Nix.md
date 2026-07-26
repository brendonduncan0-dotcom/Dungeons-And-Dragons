---
title: Nix
tags: [dnd, npc]
oneshot: "[[Oneshot 3 - The Wyrm Who Cried Dragon]]"
act: 2
---

**Role:** Villain / potential ally (ambiguous)
**First appears:** Act 2
**Location:** [[Vhalzareth's Hoard Chamber]]

## Personality
- Theatrical and a little too pleased with himself — he's been getting away with this for two months and it's gone to his head
- Genuinely terrified underneath the bravado of being caught, exposed, or found by his mother
- Surprisingly soft-hearted for a con artist: he's never actually hurt anyone and privately feels guilty every time a tribute cart arrives

## Appearance
A red dragon wyrmling barely the size of a large dog, scales still dull and soot-coloured rather than a mature dragon's polished crimson, wearing a plain tarnished ring on one talon that doesn't fit right.

## Motivation
Nix ran away from his mother's lair after a sibling rivalry went badly (see Secret) and stumbled onto the Ring of Minor Illusions in an abandoned wizard's cache in the hills. Alone, small, and hungry, he discovered that projecting the illusion of an ancient dragon got him fed without anyone ever getting close enough to realize how small he actually is. He wants three things, in this order: to not be found by his mother, to keep eating without hunting for himself (he's not very good at it yet), and — quietly, underneath the other two — to matter to someone the way a real ancient dragon would, instead of being the runt who got chased out of the lair.

## Secret
Nix isn't a rogue villain so much as a scared kid. He left home after his older, larger sibling humiliated him in front of their mother during a hunting lesson, and he's too proud and too frightened to just go back. He genuinely does not know that his mother, Ignathra, has been searching the region for him rather than being relieved to see him gone — he assumes she doesn't care. If the party can get this across to him (or he overhears it during Ignathra's arrival in Act 3), it's the single fastest way to defuse the entire climax.

## Stat Block

```statblock
name: Nix
size: Medium
type: dragon
alignment: chaotic neutral
ac: 17
hp: 75
hit_dice: 10d8 + 30
speed: 30 ft., climb 30 ft., fly 60 ft.
stats: [19, 10, 17, 12, 11, 15]
source: ai-homebrew
cr: 4
damage_immunities: fire
senses: blindsight 10 ft., darkvision 60 ft., passive Perception 13
languages: Common, Draconic
saves:
  - dex: 2
  - con: 5
  - wis: 2
traits:
  - name: Ring of Minor Illusions
    desc: "Nix wears a Ring of Minor Illusions, which he uses to project the sound and visual afterimage of an ancient red dragon around himself — a booming voice, a looming silhouette, extra size and menace layered over his real body. The illusion does not grant any additional AC, HP, or resistances; it is purely sensory. A creature that takes damage from Nix or is on the receiving end of his breath weapon may make a DC 13 Investigation check to notice the illusion doesn't match the force behind it. The illusion collapses entirely once Nix drops to half HP or chooses to abandon it."
actions:
  - name: Bite
    desc: "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 15 (2d10 + 4) piercing damage."
  - name: Claw
    desc: "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) slashing damage."
  - name: Fire Breath (Recharge 5-6)
    desc: "Nix exhales fire in a 15-foot cone. Each creature in that area makes a DC 13 Dexterity saving throw, taking 24 (7d6) fire damage on a failed save, or half as much on a successful one. This is a wyrmling's breath weapon — dramatically weaker than the ancient dragon's breath Nix's illusion and reputation imply, though it doesn't feel that way to whoever is standing in it."
```
