// quartz/plugins/transformers/initiative.ts
//
// Turns a ```encounter code block into one or more embeddable tracker
// placeholders. The block syntax intentionally mirrors the Obsidian
// "Initiative Tracker" plugin's own `encounter` code block, so existing
// encounter notes can be reused without rewriting them:
//
//   ```encounter
//   name: Goblin Ambush
//   creatures:
//     - Aragorn, 45, 16, 4        # name, hp, ac, initiative modifier
//     - 2: Goblin Scout, 7, 13, 2 # count prefix -> adds two
//     - Bandit                   # bare name, no stats
//   ```
//
// Multiple encounters can share one block, separated by `---`, exactly
// like a multi-document YAML file.
//
// Drop this file in: quartz/plugins/transformers/initiative.ts

import { QuartzTransformerPlugin } from "../types"
import { visit } from "unist-util-visit"
import yaml from "js-yaml"

export interface CreatureGroup {
  name: string
  hp?: number
  ac?: number
  modifier?: number
  // Integer count, or dice notation like "2d4". Dice counts are rolled
  // client-side each time the encounter is launched, matching the
  // "re-roll count" behavior of the original plugin.
  count?: number | string
}

export interface EncounterBlock {
  name?: string
  creatures: CreatureGroup[]
}

function escapeAttr(json: string): string {
  return json.replace(/'/g, "&#39;").replace(/</g, "&lt;")
}

function numOrUndefined(raw: string | undefined): number | undefined {
  if (raw === undefined || raw === "") return undefined
  const n = Number(raw)
  return Number.isFinite(n) ? n : undefined
}

// "Goblin" | "Goblin, 7, 15, 2" | "Goblin, 7, 15, 2, 25"
// (name, hp, ac, modifier, xp -- xp is accepted but not used)
function parseSpecString(spec: string): CreatureGroup | null {
  const parts = spec.split(",").map((p) => p.trim())
  const name = parts[0]
  if (!name) return null
  return {
    name,
    hp: numOrUndefined(parts[1]),
    ac: numOrUndefined(parts[2]),
    modifier: numOrUndefined(parts[3]),
  }
}

// One entry of the `creatures` list. Supports:
//   - Goblin
//   - Goblin, 7, 15, 2
//   - 3: Goblin, 7, 15, 2            (count prefix, YAML parses this as
//                                     a single-key mapping { 3: "Goblin, ..." })
//   - 2d4: Goblin, 7, 15, 2          (dice-notation count)
//   - 3:                             (mapping form)
//       name: Goblin
//       hp: 7
//       ac: 15
//       modifier: 2
//
// NOT supported: the bestiary array-nickname form (e.g. `["Rat, Giant",
// Snuggletooth]`) and Fantasy Statblocks lookups -- this site has no
// bestiary to resolve those against, so entries in that shape are
// skipped rather than guessed at.
function parseCreatureEntry(entry: unknown): CreatureGroup | null {
  if (typeof entry === "string") {
    return parseSpecString(entry)
  }

  if (entry && typeof entry === "object" && !Array.isArray(entry)) {
    const keys = Object.keys(entry as Record<string, unknown>)
    if (keys.length !== 1) return null
    const countKey = keys[0]
    const value = (entry as Record<string, unknown>)[countKey]

    if (typeof value === "string") {
      const group = parseSpecString(value)
      if (group) group.count = countKey
      return group
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      const obj = value as Record<string, unknown>
      const name = (obj.name ?? obj.creature) as string | undefined
      if (!name) return null
      return {
        name,
        hp: typeof obj.hp === "number" ? obj.hp : undefined,
        ac: typeof obj.ac === "number" ? obj.ac : undefined,
        modifier: typeof obj.modifier === "number" ? obj.modifier : undefined,
        count: countKey,
      }
    }
  }

  return null
}

export const InitiativeTracker: QuartzTransformerPlugin = () => {
  return {
    name: "InitiativeTracker",
    markdownPlugins() {
      return [
        () => (tree: any) => {
          visit(tree, "code", (node: any) => {
            if (node.lang !== "encounter") return

            const docs: any[] = []
            let parseError: string | null = null

            try {
              yaml.loadAll(node.value, (doc: unknown) => {
                if (doc) docs.push(doc)
              })
              if (docs.length === 0) throw new Error("no encounter data found")
            } catch (err) {
              parseError = err instanceof Error ? err.message : String(err)
            }

            if (parseError) {
              node.type = "html"
              node.value = `<div class="initiative-embed initiative-embed-error">
  <strong>Encounter block error:</strong> ${parseError}
</div>`
              return
            }

            const html = docs
              .map((raw) => {
                const rawCreatures = Array.isArray(raw?.creatures) ? raw.creatures : []
                const creatures = rawCreatures
                  .map(parseCreatureEntry)
                  .filter((g: CreatureGroup | null): g is CreatureGroup => g !== null)

                const block: EncounterBlock = { name: raw?.name, creatures }
                const payload = escapeAttr(JSON.stringify(block))
                const label = block.name ? `: ${block.name}` : ""

                return `<div class="initiative-embed" data-combat='${payload}'>
  <button class="initiative-launch-btn" type="button">
    <span class="initiative-launch-icon" aria-hidden="true">&#9876;</span>
    Launch initiative tracker${label}
  </button>
</div>`
              })
              .join("\n")

            node.type = "html"
            node.value = html
          })
        },
      ]
    },
  }
}
