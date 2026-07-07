import { QuartzTransformerPlugin } from "../types"
import { Root } from "mdast"
import { visit } from "unist-util-visit"
import { load } from "js-yaml"

// Pulls the leading integer out of values that may carry parenthetical
// detail, e.g. "45 (6d8+18)" -> 45, "15 (natural armor)" -> 15.
function parseLeadingNumber(val: unknown): number | undefined {
  if (typeof val === "number") return Number.isFinite(val) ? val : undefined
  if (typeof val !== "string") return undefined
  const match = val.match(/-?\d+/)
  if (!match) return undefined
  const n = Number(match[0])
  return Number.isFinite(n) ? n : undefined
}

function escapeAttr(json: string): string {
  return json.replace(/'/g, "&#39;").replace(/</g, "&lt;")
}

export const StatblockTransformer: QuartzTransformerPlugin = () => {
  return {
    name: "StatblockTransformer",
    markdownPlugins() {
      return [
        () => {
          return (tree: Root, _file) => {
            visit(tree, "code", (node: any) => {
              if (node.lang === "statblock") {
                try {
                  // Parse YAML content
                  const data = load(node.value) as any

                  // Build HTML string
                  let html = '<div class="statblock">\n'

                  // Name
                  if (data.name) {
                    const dexMod =
                      data.stats && Array.isArray(data.stats) && data.stats.length === 6
                        ? Math.floor((data.stats[1] - 10) / 2)
                        : undefined

                    const trackerPayload: Record<string, unknown> = { name: data.name }
                    const hpNum = parseLeadingNumber(data.hp)
                    const acNum = parseLeadingNumber(data.ac)
                    if (hpNum !== undefined) trackerPayload.hp = hpNum
                    if (acNum !== undefined) trackerPayload.ac = acNum
                    if (dexMod !== undefined) trackerPayload.modifier = dexMod

                    const payload = escapeAttr(JSON.stringify(trackerPayload))

                    // The button lives inside the <h1>, right after the name
                    // text, rather than as a sibling in a wrapping flex row.
                    // Quartz's rehype-autolink-headings plugin (behavior:
                    // "append") adds its own invisible-until-hover anchor
                    // icon as the *last* child of every heading -- putting
                    // our button before that point means the anchor icon
                    // ends up after our button instead of between it and
                    // the name text.
                    html += `  <h1 class="statblock-name">${data.name}<button class="statblock-tracker-btn" type="button" data-combat='${payload}' title="Add to initiative tracker" aria-label="Add ${data.name} to initiative tracker"><span aria-hidden="true">&#9876;</span></button></h1>\n`
                  }

                  // Size, type, alignment
                  if (data.size || data.type) {
                    html += `  <p class="statblock-meta"><em>`
                    if (data.size) html += `${data.size} `
                    if (data.type) html += `${data.type}`
                    if (data.subtype) html += ` (${data.subtype})`
                    if (data.alignment) html += `, ${data.alignment}`
                    html += `</em></p>\n`
                  }

                  html += `  <hr class="statblock-separator">\n`

                  // AC, HP, Speed
                  if (data.ac) {
                    html += `  <p><strong>Armor Class</strong> ${data.ac}</p>\n`
                  }
                  if (data.hp) {
                    html += `  <p><strong>Hit Points</strong> ${data.hp}`
                    if (data.hit_dice) html += ` (${data.hit_dice})`
                    html += `</p>\n`
                  }
                  if (data.speed) {
                    html += `  <p><strong>Speed</strong> ${data.speed}</p>\n`
                  }

                  html += `  <hr class="statblock-separator">\n`

                  // Ability Scores
                  if (data.stats && Array.isArray(data.stats) && data.stats.length === 6) {
                    const abilities = ["STR", "DEX", "CON", "INT", "WIS", "CHA"]
                    const modifiers = data.stats.map((score: number) => {
                      const mod = Math.floor((score - 10) / 2)
                      return mod >= 0 ? `+${mod}` : `${mod}`
                    })

                    html += `  <table class="statblock-abilities">\n`
                    html += `    <tbody>\n`
                    
                    // First row: ability names
                    html += `      <tr>\n`
                    abilities.forEach(ability => {
                      html += `        <th><strong>${ability}</strong></th>\n`
                    })
                    html += `      </tr>\n`
                    
                    // Second row: scores with modifiers
                    html += `      <tr>\n`
                    data.stats.forEach((score: number, i: number) => {
                      html += `        <td>${score} (${modifiers[i]})</td>\n`
                    })
                    html += `      </tr>\n`
                    
                    html += `    </tbody>\n`
                    html += `  </table>\n`
                  }

                  html += `  <hr class="statblock-separator">\n`

                  /*
                  //V1
                  // Saves, skills, resistances, immunities, senses, languages, CR
                  if (data.saves && Array.isArray(data.saves) && data.saves.length > 0) {
                    const saveNames = ["Str", "Dex", "Con", "Int", "Wis", "Cha"]
                    const nonZeroSaves = data.saves
                      .map((val: number, i: number) => val !== 0 ? `${saveNames[i]} +${val}` : null)
                      .filter(Boolean)
                    if (nonZeroSaves.length > 0) {
                      html += `  <p><strong>Saving Throws</strong> ${nonZeroSaves.join(", ")}</p>\n`
                    }
                  }
                  */


                  /* 
                  //V2
                  // Saves, skills, resistances, immunities, senses, languages, CR
                  if (data.saves && Array.isArray(data.saves) && data.saves.length > 0) {
                    const saveNames = ["Str", "Dex", "Con", "Int", "Wis", "Cha"]
                    const validSaves = data.saves
                      .map((val: any, i: number) => {
                        // Only include saves that have a valid number and aren't 0, null, undefined, or empty string
                        if (val !== null && val !== undefined && val !== '' && val !== 0) {
                          const bonus = typeof val === 'number' && val >= 0 ? `+${val}` : `${val}`
                          return `${saveNames[i]} ${bonus}`
                        }
                        return null
                      })
                      .filter(Boolean) // Remove all null/undefined entries
                    
                    if (validSaves.length > 0) {
                      html += `  <p><strong>Saving Throws</strong> ${validSaves.join(", ")}</p>\n`
                    }
                  }
                  */
                 

                  //V3
                  // Saves - supports both positional array and named object array formats
                  if (data.saves && Array.isArray(data.saves) && data.saves.length > 0) {
                    const saveNames = ["Str", "Dex", "Con", "Int", "Wis", "Cha"]
                    const validSaves: string[] = []
                    
                    // Check if it's named format (array of objects) or positional format (array of values)
                    const isNamedFormat = data.saves.some((item: any) => typeof item === 'object' && item !== null)
                    
                    if (isNamedFormat) {
                      // Named format: [{str: 9}, {con: 8}, {wis: 7}, {cha: 8}]
                      data.saves.forEach((saveObj: any) => {
                        if (typeof saveObj === 'object' && saveObj !== null) {
                          for (const [ability, bonus] of Object.entries(saveObj)) {
                            if (bonus !== null && bonus !== undefined && bonus !== '' && bonus !== 0) {
                              // Capitalize first letter of ability name
                              const capitalizedAbility = ability.charAt(0).toUpperCase() + ability.slice(1).toLowerCase()
                              const bonusStr = typeof bonus === 'number' && bonus >= 0 ? `+${bonus}` : `${bonus}`
                              validSaves.push(`${capitalizedAbility} ${bonusStr}`)
                            }
                          }
                        }
                      })
                    } else {
                      // Positional format: [0, 5, 0, 3, 0, 0] or [null, 5, null, 3, null, null]
                      data.saves.forEach((val: any, i: number) => {
                        if (val !== null && val !== undefined && val !== '' && val !== 0) {
                          const bonusStr = typeof val === 'number' && val >= 0 ? `+${val}` : `${val}`
                          validSaves.push(`${saveNames[i]} ${bonusStr}`)
                        }
                      })
                    }
                    
                    if (validSaves.length > 0) {
                      html += `  <p><strong>Saving Throws</strong> ${validSaves.join(", ")}</p>\n`
                    }
                  }

                  



                  if (data.skillsaves) {
                    const skills: string[] = []
                    
                    // Handle both object format and array format
                    if (Array.isArray(data.skillsaves)) {
                      // Array format: [{perception: 1}, {stealth: 4}]
                      data.skillsaves.forEach((skillObj: any) => {
                        for (const [skill, bonus] of Object.entries(skillObj)) {
                          const capitalizedSkill = skill.charAt(0).toUpperCase() + skill.slice(1)
                          const bonusStr = typeof bonus === 'number' && bonus >= 0 ? `+${bonus}` : `${bonus}`
                          skills.push(`${capitalizedSkill} ${bonusStr}`)
                        }
                      })
                    } else if (typeof data.skillsaves === 'object') {
                      // Object format: {perception: 1, stealth: 4}
                      for (const [skill, bonus] of Object.entries(data.skillsaves)) {
                        const capitalizedSkill = skill.charAt(0).toUpperCase() + skill.slice(1)
                        const bonusStr = typeof bonus === 'number' && bonus >= 0 ? `+${bonus}` : `${bonus}`
                        skills.push(`${capitalizedSkill} ${bonusStr}`)
                      }
                    }
                    
                    if (skills.length > 0) {
                      html += `  <p><strong>Skills</strong> ${skills.join(", ")}</p>\n`
                    }
                  }

                  if (data.damage_resistances) {
                    html += `  <p><strong>Damage Resistances</strong> ${data.damage_resistances}</p>\n`
                  }

                  if (data.damage_immunities) {
                    html += `  <p><strong>Damage Immunities</strong> ${data.damage_immunities}</p>\n`
                  }

                  if (data.condition_immunities) {
                    html += `  <p><strong>Condition Immunities</strong> ${data.condition_immunities}</p>\n`
                  }

                  if (data.senses) {
                    html += `  <p><strong>Senses</strong> ${data.senses}</p>\n`
                  }

                  if (data.languages) {
                    html += `  <p><strong>Languages</strong> ${data.languages}</p>\n`
                  }

                  if (data.cr) {
                    html += `  <p><strong>Challenge</strong> ${data.cr}</p>\n`
                  }

                  // Traits
                  if (data.traits && Array.isArray(data.traits)) {
                    html += `  <hr class="statblock-separator">\n`
                    data.traits.forEach((trait: any) => {
                      html += `  <p class="statblock-property">`
                      if (trait.name) {
                        html += `<strong><em>${trait.name}.</em></strong> `
                      }
                      if (trait.desc) {
                        html += `${trait.desc}`
                      }
                      html += `</p>\n`
                    })
                  }

                  // Actions
                  if (data.actions && Array.isArray(data.actions)) {
                    html += `  <h3 class="statblock-section-title">Actions</h3>\n`
                    data.actions.forEach((action: any) => {
                      html += `  <p class="statblock-property">`
                      if (action.name) {
                        html += `<strong><em>${action.name}.</em></strong> `
                      }
                      if (action.desc) {
                        html += `${action.desc}`
                      }
                      html += `</p>\n`
                    })
                  }

                  // Legendary Actions
                  if (data.legendary_actions && Array.isArray(data.legendary_actions)) {
                    html += `  <h3 class="statblock-section-title">Legendary Actions</h3>\n`
                    if (data.legendary_desc) {
                      html += `  <p>${data.legendary_desc}</p>\n`
                    }
                    data.legendary_actions.forEach((action: any) => {
                      html += `  <p class="statblock-property">`
                      if (action.name) {
                        html += `<strong><em>${action.name}.</em></strong> `
                      }
                      if (action.desc) {
                        html += `${action.desc}`
                      }
                      html += `</p>\n`
                    })
                  }

                  // Reactions
                  if (data.reactions && Array.isArray(data.reactions)) {
                    html += `  <h3 class="statblock-section-title">Reactions</h3>\n`
                    data.reactions.forEach((reaction: any) => {
                      html += `  <p class="statblock-property">`
                      if (reaction.name) {
                        html += `<strong><em>${reaction.name}.</em></strong> `
                      }
                      if (reaction.desc) {
                        html += `${reaction.desc}`
                      }
                      html += `</p>\n`
                    })
                  }

                  html += `</div>`

                  // Replace the code node with an HTML node
                  node.type = "html"
                  node.value = html
                  delete node.lang
                } catch (error) {
                  console.error("Error parsing statblock:", error)
                }
              }
            })
          }
        },
      ]
    },
  }
}