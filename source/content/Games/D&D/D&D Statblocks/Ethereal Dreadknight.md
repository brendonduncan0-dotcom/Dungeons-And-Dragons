---
name: Ethereal Dreadknight
statblock: inline
---


```statblock
name: Ethereal Dreadknight
size: Medium
type: undead
alignment: lawful evil
ac: 18
hp: 136
hit_dice: 16d8 + 64
speed: 30 ft., fly 30 ft. (hover)
stats: [20, 14, 18, 12, 16, 18]
source: ai-homebrew
saves:
  - str: 9
  - con: 8
  - wis: 7
  - cha: 8
skillsaves:
  - perception: 7
  - intimidation: 8
  - athletics: 9
damage_resistances: acid, fire, lightning, thunder; bludgeoning, piercing, and slashing from nonmagical attacks
damage_immunities: necrotic, poison
condition_immunities: charmed, exhaustion, frightened, paralyzed, poisoned
senses: darkvision 120 ft., passive Perception 17
languages: Common, Abyssal, Infernal, the languages it knew in life
cr: 9
traits:
  - name: Ethereal Jaunt
    desc: As a bonus action, the dreadknight can magically shift from the Material Plane to the Ethereal Plane, or vice versa. While on the Ethereal Plane, the dreadknight can see and hear into the Material Plane to a range of 60 feet, but everything looks gray and ephemeral.
  - name: Incorporeal Movement
    desc: The dreadknight can move through other creatures and objects as if they were difficult terrain. It takes 5 (1d10) force damage if it ends its turn inside an object.
  - name: Undead Fortitude
    desc: If damage reduces the dreadknight to 0 hit points, it must make a Constitution saving throw with a DC of 5 + the damage taken, unless the damage is radiant or from a critical hit. On a success, the dreadknight drops to 1 hit point instead.
  - name: Spectral Armor
    desc: The dreadknight's AC includes its Charisma modifier while it is not wearing armor or wielding a shield.
  - name: Death's Aura
    desc: At the start of each of the dreadknight's turns, each creature within 10 feet of it takes 7 (2d6) necrotic damage. A creature that touches the dreadknight or hits it with a melee attack while within 5 feet of it takes 7 (2d6) necrotic damage.
actions:
  - name: Multiattack
    desc: The dreadknight makes two attacks with its Phantom Greatsword or uses Phase Strike twice.
  - name: Phantom Greatsword
    desc: "Melee Weapon Attack: +9 to hit, reach 5 ft., one target. Hit: 12 (2d6 + 5) slashing damage plus 10 (3d6) necrotic damage. If the target is a creature, it must succeed on a DC 16 Wisdom saving throw or be frightened until the end of its next turn."
  - name: Phase Strike
    desc: "Ranged Spell Attack: +8 to hit, range 120 ft., one target. Hit: 18 (4d6 + 4) force damage. The dreadknight can make this attack from the Ethereal Plane against targets on the Material Plane."
  - name: Soul Drain (Recharge 5-6)
    desc: "The dreadknight targets one creature it can see within 30 feet of it. The target must succeed on a DC 16 Constitution saving throw or take 36 (8d8) necrotic damage and have its hit point maximum reduced by an amount equal to the damage taken. The dreadknight regains hit points equal to half the damage dealt. This reduction lasts until the target finishes a long rest. The target dies if this effect reduces its hit point maximum to 0."
bonus_actions:
  - name: Ethereal Jaunt
    desc: See traits.
  - name: Dreadful Presence
    desc: Each creature of the dreadknight's choice within 30 feet of it and aware of it must succeed on a DC 16 Wisdom saving throw or become frightened for 1 minute. A frightened creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success.
reactions:
  - name: Phase Dodge
    desc: When a creature the dreadknight can see targets it with an attack, the dreadknight can shift partially into the Ethereal Plane, imposing disadvantage on the attack roll. If the attack misses, the dreadknight can immediately move up to half its speed without provoking opportunity attacks.
legendary_actions:
  - name: Detect
    desc: The dreadknight makes a Wisdom (Perception) check.
  - name: Phase Strike
    desc: The dreadknight uses Phase Strike.
  - name: Ethereal Step (Costs 2 Actions)
    desc: The dreadknight uses Ethereal Jaunt and moves up to its speed.
  - name: Soul Rend (Costs 3 Actions)
    desc: "The dreadknight makes one Phantom Greatsword attack against each creature within 10 feet of it."
```

# Ethereal Dreadknight

## Lore

Ethereal Dreadknights are the cursed remnants of once-noble warriors who bargained with dark powers to escape death. Their pact granted them immortality, but at a terrible cost—they exist partially in the Ethereal Plane, forever trapped between life and death, solid and spectral.

These terrifying undead warriors serve dark masters or pursue their own inscrutable vendettas, phasing in and out of reality to strike at their enemies. Their touch drains the very life force from the living, and their presence radiates an aura of death that withers all nearby.

## Tactics

An Ethereal Dreadknight is a cunning combatant that uses its planar mobility to devastating effect:

- **Opening Move**: Uses Dreadful Presence and Death's Aura to soften up groups of enemies
- **Hit and Run**: Shifts to the Ethereal Plane with Ethereal Jaunt, repositions, then returns to make devastating melee attacks
- **Ranged Harassment**: Uses Phase Strike from the Ethereal Plane where it's safe from most attacks
- **Finishing Blow**: Uses Soul Drain on wounded enemies to heal itself and eliminate threats
- **Legendary Actions**: Maintains pressure with Phase Strikes and repositioning, saving Soul Rend for clustered enemies

## Encounter Ideas

- **The Phantom Castle**: The dreadknight haunts an abandoned fortress, phasing through walls to ambush intruders
- **Vengeful Spirit**: Hired by a necromancer to eliminate those who wronged it in life
- **Bridge Guardian**: Guards a planar rift between the Material and Ethereal Planes
- **The Hunt**: Pursues the party relentlessly, appearing when they least expect it