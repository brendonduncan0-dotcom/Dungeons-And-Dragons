// quartz/components/scripts/initiative-tracker.inline.ts
//
// Runs after every page load / SPA navigation (Quartz refires "nav").
// Wires up:
//   - every ".initiative-launch-btn" produced by the InitiativeTracker
//     transformer plugin, so clicking one opens the sidebar loaded with
//     that block's creature groups (expanding counts, including dice
//     notation, into individual combatants at launch time)
//   - the sidebar's own controls: roll, sort, next turn, add, HP edit,
//     editable initiative, remove

interface CreatureGroup {
  name: string
  hp?: number
  ac?: number
  modifier?: number
  count?: number | string
}

interface Condition {
  name: string
  // Rounds remaining, or null for an indefinite condition (e.g. Prone)
  // removed manually. Decrements by 1 each time it becomes this
  // combatant's own turn (not once globally per round), and is dropped
  // once it hits 0. Still a simplification of 5e's actual rule ("until
  // the start/end of a specific creature's turn" has edge cases around
  // which trigger applies), but now scoped to the right creature
  // rather than ticking everyone down at once.
  duration: number | null
}

interface Combatant {
  id: number
  name: string
  // The creature name as written in its source (the encounter block
  // entry, the statblock button, or what was typed into the add-combatant
  // form) -- captured before any "Name 1"/"Name 2" de-duplication suffix
  // is applied to `name`. Used to find this combatant's statblock on the
  // page without being thrown off by a suffix that isn't part of the
  // actual creature name.
  sourceName: string
  hp?: number
  maxHp?: number
  ac?: number
  initiative: number | null
  mod: number | null
  conditions: Condition[]
}

// Standard 5e conditions, offered as quick picks. Not exhaustive of
// every table's homebrew status -- the picker always has a "Custom…"
// option for anything not listed here.
const SRD_CONDITIONS = [
  "Blinded",
  "Charmed",
  "Deafened",
  "Exhaustion 1",
  "Exhaustion 2",
  "Exhaustion 3",
  "Exhaustion 4",
  "Exhaustion 5",
  "Exhaustion 6",
  "Frightened",
  "Grappled",
  "Incapacitated",
  "Invisible",
  "Paralyzed",
  "Petrified",
  "Poisoned",
  "Prone",
  "Restrained",
  "Stunned",
  "Unconscious",
]

let combatants: Combatant[] = []
let nextId = 1
let round = 1
let currentIndex = 0

// Persists the active encounter across a real page reload or reopened
// tab. Deliberately sessionStorage rather than localStorage: it
// survives a refresh mid-combat but clears itself once the tab closes,
// so a finished session doesn't linger in the browser indefinitely.
// (To make it survive closing the browser entirely, swap every
// `sessionStorage` below for `localStorage` -- that's the only change
// needed.)
const STORAGE_KEY = "quartz-initiative-tracker:active"

function persistState() {
  const sidebar = document.getElementById("initiative-tracker-sidebar")
  const titleEl = sidebar?.querySelector<HTMLElement>(".initiative-tracker-title")
  const state = {
    title: titleEl?.textContent ?? "",
    round,
    currentIndex,
    nextId,
    combatants,
    isOpen: sidebar?.classList.contains("is-open") ?? false,
  }
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage can be unavailable (private browsing, quota, disabled
    // cookies, etc.). Persistence is a nice-to-have, so fail silently
    // rather than breaking the tracker itself.
  }
}

function clearPersistedState() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

function showReopenTab() {
  document.getElementById("initiative-tracker-reopen")?.classList.add("is-visible")
}

function hideReopenTab() {
  document.getElementById("initiative-tracker-reopen")?.classList.remove("is-visible")
}

// Restores a saved session on a fresh page load, if one exists. Returns
// true if it restored something (so the caller can skip its own
// initial render).
function restorePersistedState(): boolean {
  let raw: string | null
  try {
    raw = sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return false
  }
  if (!raw) return false

  try {
    const state = JSON.parse(raw)
    if (!Array.isArray(state.combatants)) return false

    combatants = (state.combatants as any[]).map((c) => ({
      ...c,
      sourceName: typeof c.sourceName === "string" ? c.sourceName : c.name,
      conditions: Array.isArray(c.conditions) ? c.conditions : [],
    }))
    round = typeof state.round === "number" ? state.round : 1
    currentIndex = typeof state.currentIndex === "number" ? state.currentIndex : 0
    nextId = typeof state.nextId === "number" ? state.nextId : combatants.length + 1

    const sidebar = document.getElementById("initiative-tracker-sidebar")
    if (!sidebar) return false

    const titleEl = sidebar.querySelector<HTMLElement>(".initiative-tracker-title")
    if (titleEl) titleEl.textContent = state.title ?? ""
    const roundEl = sidebar.querySelector<HTMLElement>(".initiative-tracker-round")
    if (roundEl) roundEl.textContent = String(round)

    renderRows()

    if (state.isOpen) {
      sidebar.classList.add("is-open")
      sidebar.setAttribute("aria-hidden", "false")
      hideReopenTab()
    } else if (combatants.length > 0) {
      // Was hidden, not ended -- keep it out of the way but offer the
      // reopen tab so the encounter isn't lost, just tucked aside.
      sidebar.classList.remove("is-open")
      sidebar.setAttribute("aria-hidden", "true")
      showReopenTab()
    }

    return true
  } catch (err) {
    console.error("Failed to restore saved initiative tracker state", err)
    return false
  }
}

function roll(mod: number): number {
  return Math.floor(Math.random() * 20) + 1 + mod
}

// Resolves a creature group's `count` (a plain integer, or dice
// notation like "2d4") to an actual number, rolling fresh each time an
// encounter is launched -- matching the "re-roll count" behavior of the
// original plugin.
function resolveCount(count: number | string | undefined): number {
  if (count === undefined) return 1
  if (typeof count === "number") return count
  const match = count.match(/^(\d+)d(\d+)$/i)
  if (!match) {
    const parsed = Number(count)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
  }
  const numDice = Number(match[1])
  const sides = Number(match[2])
  let total = 0
  for (let i = 0; i < numDice; i++) total += Math.floor(Math.random() * sides) + 1
  return Math.max(1, total)
}

// Renames the newly-added combatant to avoid colliding with an
// already-present name, following the same "Name 1", "Name 2" numbering
// the encounter block already uses for a repeated count. If an
// unnumbered combatant with this exact name already exists, it gets
// bumped to "Name 1" so the new arrival can become "Name 2".
function nextUniqueName(baseName: string): string {
  const escaped = baseName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const numberedPattern = new RegExp(`^${escaped} (\\d+)$`)

  let maxNumber = 0
  let plainMatch: Combatant | undefined
  combatants.forEach((c) => {
    if (c.name === baseName) {
      plainMatch = c
    } else {
      const m = c.name.match(numberedPattern)
      if (m) maxNumber = Math.max(maxNumber, Number(m[1]))
    }
  })

  if (!plainMatch && maxNumber === 0) return baseName

  if (plainMatch) {
    plainMatch.name = `${baseName} 1`
    maxNumber = Math.max(maxNumber, 1)
  }

  return `${baseName} ${maxNumber + 1}`
}

function expandGroups(groups: CreatureGroup[]): Combatant[] {
  const expanded: Combatant[] = []
  groups.forEach((g) => {
    const count = resolveCount(g.count)
    const mod = typeof g.modifier === "number" ? g.modifier : 0
    for (let i = 0; i < count; i++) {
      expanded.push({
        id: nextId++,
        name: count > 1 ? `${g.name} ${i + 1}` : g.name,
        sourceName: g.name,
        hp: g.hp,
        maxHp: g.hp,
        ac: g.ac,
        initiative: roll(mod),
        mod: typeof g.modifier === "number" ? g.modifier : null,
        conditions: [],
      })
    }
  })
  return expanded
}

// Looks for this combatant's statblock on the page currently being
// viewed only -- no cross-page index. Matches on `sourceName` (the
// original creature name, before any "Name 1"/"Name 2" de-duplication
// suffix) against every rendered `.statblock-name` on the page.
function locateStatblock(c: Combatant, btn?: HTMLButtonElement) {
  const target = Array.from(document.querySelectorAll<HTMLElement>(".statblock-name")).find(
    (el) => el.textContent?.trim().toLowerCase() === c.sourceName.trim().toLowerCase(),
  )

  if (!target) {
    btn?.classList.add("is-not-found")
    window.setTimeout(() => btn?.classList.remove("is-not-found"), 600)
    return
  }

  // On phones the sidebar covers the full screen (see the 600px
  // breakpoint below), so it has to get out of the way for the
  // statblock underneath to actually be visible. The reopen tab
  // (shown automatically by hideSidebar while combatants remain)
  // brings the tracker back.
  if (window.matchMedia("(max-width: 600px)").matches) {
    hideSidebar()
  }

  const card = target.closest<HTMLElement>(".statblock") ?? target
  card.scrollIntoView({ behavior: "smooth", block: "center" })
  card.classList.add("is-located-highlight")
  window.setTimeout(() => card.classList.remove("is-located-highlight"), 1500)
}

function ensureConditionDatalist() {
  if (document.getElementById("initiative-condition-datalist")) return
  const datalist = document.createElement("datalist")
  datalist.id = "initiative-condition-datalist"
  SRD_CONDITIONS.forEach((conditionName) => {
    const opt = document.createElement("option")
    opt.value = conditionName
    datalist.appendChild(opt)
  })
  document.body.appendChild(datalist)
}

function buildConditionsArea(c: Combatant): HTMLElement {
  const wrap = document.createElement("div")
  wrap.className = "initiative-conditions"

  c.conditions.forEach((cond, idx) => {
    const chip = document.createElement("span")
    chip.className = "initiative-condition-chip"
    chip.textContent = cond.duration !== null ? `${cond.name} (${cond.duration})` : cond.name

    const removeBtn = document.createElement("button")
    removeBtn.type = "button"
    removeBtn.textContent = "\u00d7"
    removeBtn.setAttribute("aria-label", `Remove ${cond.name} from ${c.name}`)
    removeBtn.addEventListener("click", () => {
      c.conditions.splice(idx, 1)
      renderRows()
    })

    chip.appendChild(removeBtn)
    wrap.appendChild(chip)
  })

  const addToggle = document.createElement("button")
  addToggle.type = "button"
  addToggle.className = "initiative-condition-add-toggle"
  addToggle.textContent = "+ condition"

  const picker = document.createElement("div")
  picker.className = "initiative-condition-picker"

  const nameInput = document.createElement("input")
  nameInput.type = "text"
  nameInput.className = "initiative-condition-name"
  nameInput.placeholder = "Condition"
  nameInput.setAttribute("list", "initiative-condition-datalist")
  nameInput.setAttribute("aria-label", `Condition to add to ${c.name}`)

  const durationInput = document.createElement("input")
  durationInput.type = "number"
  durationInput.min = "1"
  durationInput.placeholder = "Rounds"
  durationInput.className = "initiative-condition-duration"
  durationInput.setAttribute("aria-label", "Duration in rounds (optional)")

  const confirmBtn = document.createElement("button")
  confirmBtn.type = "button"
  confirmBtn.className = "initiative-condition-confirm"
  confirmBtn.textContent = "Add"

  const addCondition = () => {
    const name = nameInput.value.trim()
    if (!name) {
      nameInput.focus()
      return
    }
    const durationRaw = durationInput.value
    const duration = durationRaw ? Number(durationRaw) : null
    c.conditions.push({
      name,
      duration: duration !== null && Number.isFinite(duration) && duration > 0 ? duration : null,
    })
    renderRows()
  }

  confirmBtn.addEventListener("click", addCondition)
  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addCondition()
    }
  })

  picker.append(nameInput, durationInput, confirmBtn)

  addToggle.addEventListener("click", () => {
    picker.classList.toggle("is-open")
  })

  wrap.append(addToggle, picker)
  return wrap
}

function buildEditPanel(c: Combatant): HTMLElement {
  const panel = document.createElement("div")
  panel.className = "initiative-edit-panel"

  const nameInput = document.createElement("input")
  nameInput.type = "text"
  nameInput.className = "initiative-edit-name"
  nameInput.placeholder = "Name"
  nameInput.value = c.name
  nameInput.setAttribute("aria-label", "Name")

  const acInput = document.createElement("input")
  acInput.type = "number"
  acInput.className = "initiative-edit-ac"
  acInput.placeholder = "AC"
  acInput.value = c.ac !== undefined ? String(c.ac) : ""
  acInput.setAttribute("aria-label", "Armor class")

  const maxHpInput = document.createElement("input")
  maxHpInput.type = "number"
  maxHpInput.className = "initiative-edit-maxhp"
  maxHpInput.placeholder = "Max HP"
  maxHpInput.value = c.maxHp !== undefined ? String(c.maxHp) : ""
  maxHpInput.setAttribute("aria-label", "Max HP")

  const modInput = document.createElement("input")
  modInput.type = "number"
  modInput.className = "initiative-edit-mod"
  modInput.placeholder = "Initiative modifier"
  modInput.value = c.mod !== null ? String(c.mod) : ""
  modInput.setAttribute("aria-label", "Initiative modifier")

  const errorEl = document.createElement("div")
  errorEl.className = "initiative-edit-error"
  errorEl.setAttribute("role", "alert")

  const saveBtn = document.createElement("button")
  saveBtn.type = "button"
  saveBtn.className = "initiative-edit-save"
  saveBtn.textContent = "Save"
  saveBtn.addEventListener("click", () => {
    const newName = nameInput.value.trim()
    if (!newName) {
      errorEl.textContent = "Name can't be empty."
      nameInput.focus()
      return
    }

    const acRaw = acInput.value.trim()
    const maxHpRaw = maxHpInput.value.trim()
    const modRaw = modInput.value.trim()

    c.name = newName
    c.ac = acRaw ? Number(acRaw) : undefined

    const newMaxHp = maxHpRaw ? Number(maxHpRaw) : undefined
    if (newMaxHp === undefined) {
      // Clearing Max HP stops HP tracking for this combatant entirely
      // -- the HP controls only ever show when both hp and maxHp exist.
      c.maxHp = undefined
      c.hp = undefined
    } else if (c.hp === undefined) {
      // Wasn't tracked before -- start at full health.
      c.maxHp = newMaxHp
      c.hp = newMaxHp
    } else {
      // Was already tracked -- keep current HP, just re-clamp it to
      // the new ceiling (so lowering Max HP below current HP doesn't
      // leave an impossible value sitting there).
      c.maxHp = newMaxHp
      c.hp = Math.min(c.hp, newMaxHp)
    }

    c.mod = modRaw ? Number(modRaw) : null

    renderRows()
  })

  const cancelBtn = document.createElement("button")
  cancelBtn.type = "button"
  cancelBtn.className = "initiative-edit-cancel"
  cancelBtn.textContent = "Cancel"
  cancelBtn.addEventListener("click", () => {
    panel.classList.remove("is-open")
  })

  panel.append(nameInput, acInput, maxHpInput, modInput, saveBtn, cancelBtn, errorEl)
  return panel
}

function renderRows() {
  ensureConditionDatalist()
  const container = document.querySelector<HTMLElement>(".initiative-tracker-rows")
  if (!container) return
  container.innerHTML = ""

  combatants.forEach((c, i) => {
    const entry = document.createElement("div")
    entry.className = "initiative-entry" + (i === currentIndex ? " is-current" : "")

    const rowTop = document.createElement("div")
    rowTop.className = "initiative-row-top"

    const rowMeta = document.createElement("div")
    rowMeta.className = "initiative-row-meta"

    const initInput = document.createElement("input")
    initInput.type = "number"
    initInput.className = "initiative-row-init"
    initInput.value = c.initiative === null ? "" : String(c.initiative)
    initInput.placeholder = "--"
    initInput.addEventListener("input", () => {
      const v = initInput.value
      c.initiative = v === "" ? null : Number(v)
      persistState()
    })

    const name = document.createElement("div")
    name.className = "initiative-row-name"
    name.textContent = c.name

    const ac = document.createElement("div")
    ac.className = "initiative-row-ac"
    ac.textContent = c.ac !== undefined ? `AC ${c.ac}` : ""

    const mod = document.createElement("div")
    mod.className = "initiative-row-mod"
    mod.textContent = c.mod !== null ? `Initiative ${c.mod >= 0 ? "+" : ""}${c.mod}` : ""

    const hpWrap = document.createElement("div")
    hpWrap.className = "initiative-row-hp"
    if (c.hp !== undefined && c.maxHp !== undefined) {
      const clamp = (v: number) => Math.max(0, Math.min(c.maxHp ?? v, v))

      const minus = document.createElement("button")
      minus.type = "button"
      minus.textContent = "-"
      minus.addEventListener("click", () => {
        c.hp = clamp((c.hp ?? 0) - 1)
        renderRows()
      })

      const hpInput = document.createElement("input")
      hpInput.type = "text"
      hpInput.inputMode = "numeric"
      hpInput.className = "initiative-row-hp-input"
      hpInput.value = String(c.hp)
      hpInput.setAttribute(
        "aria-label",
        `${c.name} current HP. Type a number to set it, or +5 / -5 to apply a change`,
      )
      if (c.hp === 0) hpInput.classList.add("is-zero")
      // Commit on blur/Enter rather than every keystroke, so typing
      // "15" doesn't briefly clamp to "1" while the second digit lands.
      // A leading + or - is treated as a relative change ("-5" damages
      // for 5, "+5" heals for 5); anything else sets HP outright.
      const commit = () => {
        const raw = hpInput.value.trim()
        if (raw === "") {
          renderRows()
          return
        }
        const isRelative = raw.startsWith("+") || raw.startsWith("-")
        const parsed = Number(raw)
        if (!Number.isFinite(parsed)) {
          renderRows()
          return
        }
        c.hp = isRelative ? clamp((c.hp ?? 0) + parsed) : clamp(parsed)
        renderRows()
      }
      hpInput.addEventListener("blur", commit)
      hpInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          hpInput.blur()
        }
      })

      const maxLabel = document.createElement("span")
      maxLabel.className = "initiative-row-hp-max"
      maxLabel.textContent = `/${c.maxHp}`

      const plus = document.createElement("button")
      plus.type = "button"
      plus.textContent = "+"
      plus.addEventListener("click", () => {
        c.hp = clamp((c.hp ?? 0) + 1)
        renderRows()
      })

      hpWrap.append(minus, hpInput, maxLabel, plus)
    }

    const remove = document.createElement("button")
    remove.type = "button"
    remove.className = "initiative-row-remove"
    remove.setAttribute("aria-label", `Remove ${c.name}`)
    remove.textContent = "\u00d7"
    remove.addEventListener("click", () => {
      combatants = combatants.filter((x) => x.id !== c.id)
      if (currentIndex >= combatants.length) currentIndex = 0
      renderRows()
    })

    const editPanel = buildEditPanel(c)

    const editToggle = document.createElement("button")
    editToggle.type = "button"
    editToggle.className = "initiative-row-edit"
    editToggle.setAttribute("aria-label", `Edit ${c.name}`)
    editToggle.textContent = "\u270e"
    editToggle.addEventListener("click", () => {
      editPanel.classList.toggle("is-open")
    })

    const locate = document.createElement("button")
    locate.type = "button"
    locate.className = "initiative-row-locate"
    locate.setAttribute("aria-label", `Find ${c.sourceName}'s statblock on this page`)
    locate.title = "Find statblock on this page"
    locate.textContent = "Stats"
    locate.addEventListener("click", () => locateStatblock(c, locate))

    rowTop.append(initInput, name, locate, remove)
    rowMeta.append(ac, hpWrap, mod, editToggle)
    entry.appendChild(rowTop)
    entry.appendChild(rowMeta)
    entry.appendChild(editPanel)
    entry.appendChild(buildConditionsArea(c))
    container.appendChild(entry)
  })

  persistState()
}

function sortByInitiative() {
  combatants.sort((a, b) => (b.initiative ?? -Infinity) - (a.initiative ?? -Infinity))
  currentIndex = 0
  renderRows()
  if (combatants[currentIndex]) locateStatblock(combatants[currentIndex])
}

function nextTurn() {
  if (combatants.length === 0) return
  currentIndex++
  if (currentIndex >= combatants.length) {
    currentIndex = 0
    round++
    const roundEl = document.querySelector<HTMLElement>(".initiative-tracker-round")
    if (roundEl) roundEl.textContent = String(round)
  }

  // Tick down (and expire) timed conditions only for whoever's turn is
  // starting now, rather than sweeping every combatant once per round.
  const current = combatants[currentIndex]
  if (current) {
    current.conditions = current.conditions.filter((cond) => {
      if (cond.duration === null) return true
      cond.duration -= 1
      return cond.duration > 0
    })
  }

  renderRows()
  if (combatants[currentIndex]) locateStatblock(combatants[currentIndex])
}

// Adds creature groups to whatever encounter is currently active,
// rather than replacing it (unlike openSidebar, which always starts
// fresh). Mirrors the Obsidian Fantasy Statblocks "add to initiative
// tracker" button: if the tracker is empty/closed, this starts one; if
// an encounter is already running, the creature just joins it.
function addCombatantsFromGroups(groups: CreatureGroup[]) {
  const newCombatants = expandGroups(groups)
  newCombatants.forEach((c) => {
    c.name = nextUniqueName(c.name)
    combatants.push(c)
  })

  const sidebar = document.getElementById("initiative-tracker-sidebar")
  if (!sidebar) return

  if (!sidebar.classList.contains("is-open")) {
    sidebar.classList.add("is-open")
    sidebar.setAttribute("aria-hidden", "false")
    hideReopenTab()

    const titleEl = sidebar.querySelector<HTMLElement>(".initiative-tracker-title")
    if (titleEl && !titleEl.textContent) titleEl.textContent = "Initiative tracker"
  }

  renderRows()
}

function openSidebar(title: string, data: { creatures: CreatureGroup[] }) {
  combatants = expandGroups(data.creatures ?? [])
  round = 1
  currentIndex = 0

  const sidebar = document.getElementById("initiative-tracker-sidebar")
  if (!sidebar) return
  sidebar.classList.add("is-open")
  sidebar.setAttribute("aria-hidden", "false")
  hideReopenTab()

  const titleEl = sidebar.querySelector<HTMLElement>(".initiative-tracker-title")
  if (titleEl) titleEl.textContent = title
  const roundEl = sidebar.querySelector<HTMLElement>(".initiative-tracker-round")
  if (roundEl) roundEl.textContent = "1"

  renderRows()
}

// Slides the sidebar out of the way without losing anything -- the
// encounter stays in memory and in sessionStorage. Use this to glance
// at the page underneath (especially useful on a phone, where the
// sidebar is full-screen) and pick up combat again via the reopen tab.
function hideSidebar() {
  const sidebar = document.getElementById("initiative-tracker-sidebar")
  if (!sidebar) return
  sidebar.classList.remove("is-open")
  sidebar.setAttribute("aria-hidden", "true")
  if (combatants.length > 0) showReopenTab()
  persistState()
}

function reopenSidebar() {
  const sidebar = document.getElementById("initiative-tracker-sidebar")
  if (!sidebar) return
  sidebar.classList.add("is-open")
  sidebar.setAttribute("aria-hidden", "false")
  hideReopenTab()
  persistState()
}

// Actually ends the encounter: clears combatants, round, and the
// persisted session. This is the only action that discards tracked
// HP/initiative/turn progress, so it asks for confirmation first.
function endEncounter() {
  const confirmed = window.confirm(
    "End this encounter? This clears all tracked HP, initiative, and turn order.",
  )
  if (!confirmed) return

  combatants = []
  round = 1
  currentIndex = 0

  const sidebar = document.getElementById("initiative-tracker-sidebar")
  if (sidebar) {
    sidebar.classList.remove("is-open")
    sidebar.setAttribute("aria-hidden", "true")
  }
  hideReopenTab()
  clearPersistedState()
}

document.addEventListener("nav", () => {
  // Re-bind launch buttons for the newly-loaded page
  const launchButtons = document.querySelectorAll<HTMLButtonElement>(".initiative-launch-btn")
  launchButtons.forEach((btn) => {
    if (btn.dataset.bound === "true") return
    btn.dataset.bound = "true"
    btn.addEventListener("click", () => {
      const embed = btn.closest<HTMLElement>(".initiative-embed")
      const raw = embed?.dataset.combat
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        const title = parsed.name || "Initiative tracker"
        openSidebar(title, parsed)
      } catch (err) {
        console.error("Failed to parse encounter block", err)
      }
    })
  })

  // Re-bind statblock "add to initiative tracker" buttons for the
  // newly-loaded page
  const statblockButtons = document.querySelectorAll<HTMLButtonElement>(".statblock-tracker-btn")
  statblockButtons.forEach((btn) => {
    if (btn.dataset.bound === "true") return
    btn.dataset.bound = "true"
    btn.addEventListener("click", () => {
      const raw = btn.dataset.combat
      if (!raw) return
      try {
        const group = JSON.parse(raw) as CreatureGroup
        addCombatantsFromGroups([group])
      } catch (err) {
        console.error("Failed to parse statblock combat data", err)
      }
    })
  })

  // Sidebar controls only need to be bound once; the sidebar itself
  // persists across SPA navigations because it lives in afterBody.
  const sidebar = document.getElementById("initiative-tracker-sidebar")
  if (sidebar && sidebar.dataset.bound !== "true") {
    sidebar.dataset.bound = "true"

    sidebar.querySelector(".initiative-tracker-hide")?.addEventListener("click", hideSidebar)
    sidebar.querySelector(".initiative-tracker-sort")?.addEventListener("click", sortByInitiative)
    sidebar.querySelector(".initiative-tracker-next-turn")?.addEventListener("click", nextTurn)
    sidebar.querySelector(".initiative-tracker-end")?.addEventListener("click", endEncounter)
    document
      .getElementById("initiative-tracker-reopen")
      ?.addEventListener("click", reopenSidebar)

    const form = sidebar.querySelector<HTMLFormElement>(".initiative-tracker-add-form")
    const errorEl = sidebar.querySelector<HTMLElement>(".initiative-tracker-add-error")

    form?.addEventListener("submit", (e) => {
      e.preventDefault()
      const data = new FormData(form)
      const name = String(data.get("name") ?? "").trim()

      if (!name) {
        if (errorEl) errorEl.textContent = "Enter a name to add a combatant."
        form.querySelector<HTMLInputElement>('[name="name"]')?.focus()
        return
      }
      if (errorEl) errorEl.textContent = ""

      const hpRaw = data.get("hp")
      const acRaw = data.get("ac")
      const modRaw = data.get("modifier")
      const mod = modRaw ? Number(modRaw) : null

      combatants.push({
        id: nextId++,
        name: nextUniqueName(name),
        sourceName: name,
        hp: hpRaw ? Number(hpRaw) : undefined,
        maxHp: hpRaw ? Number(hpRaw) : undefined,
        ac: acRaw ? Number(acRaw) : undefined,
        initiative: roll(mod ?? 0),
        mod,
        conditions: [],
      })
      form.reset()
      renderRows()
    })

    // Only meaningful the first time this script executes on a fresh
    // page load -- subsequent internal Quartz navigations keep the same
    // in-memory state and hit the dataset.bound guard above instead.
    restorePersistedState()
  }
})
