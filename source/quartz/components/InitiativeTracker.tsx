// quartz/components/InitiativeTracker.tsx
//
// Global sidebar shell for the initiative tracker. Include this once,
// e.g. in the `afterBody` slot of quartz.layout.ts, so it's present on
// every page. It renders an empty, hidden panel; the inline script does
// all the real work of finding launch buttons and populating it.

import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import script from "./scripts/initiative-tracker.inline"
import style from "../styles/initiative-tracker.scss"

const InitiativeTracker: QuartzComponent = (_props: QuartzComponentProps) => {
  return (
    <>
      <button
        type="button"
        id="initiative-tracker-reopen"
        class="initiative-tracker-reopen-tab"
        aria-label="Reopen initiative tracker"
      >
        <span aria-hidden="true">&#9876;</span>
      </button>

      <div id="initiative-tracker-sidebar" class="initiative-tracker-sidebar" aria-hidden="true">
        <div class="initiative-tracker-header">
          <span class="initiative-tracker-title"></span>
          <div class="initiative-tracker-header-actions">
            <span class="initiative-tracker-round-label">Round <span class="initiative-tracker-round">1</span></span>
            <button
              type="button"
              class="initiative-tracker-hide"
              aria-label="Hide initiative tracker (keeps the encounter running)"
            >
              &times;
            </button>
          </div>
        </div>

        <div class="initiative-tracker-toolbar">
          <button type="button" class="initiative-tracker-roll-all">Roll missing</button>
          <button type="button" class="initiative-tracker-sort">Sort</button>
          <button type="button" class="initiative-tracker-next-turn">Next turn &rarr;</button>
        </div>

        <div class="initiative-tracker-rows"></div>

        <form class="initiative-tracker-add-form">
          <div class="initiative-tracker-add-title">Add combatant</div>
          <div class="initiative-tracker-add-fields">
            <input type="text" name="name" placeholder="Name" />
            <input type="number" name="hp" placeholder="HP" />
            <input type="number" name="ac" placeholder="AC" />
            <input type="number" name="modifier" placeholder="Initiative modifier" />
            <button type="submit" aria-label="Add combatant">+</button>
          </div>
          <div class="initiative-tracker-add-error" role="alert"></div>
        </form>

        <button type="button" class="initiative-tracker-end">End encounter</button>
      </div>
    </>
  )
}

InitiativeTracker.css = style
InitiativeTracker.afterDOMLoaded = script

export default (() => InitiativeTracker) satisfies QuartzComponentConstructor
