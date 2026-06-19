/*
 * Feature 103 — Sélection du jour (segmented control).
 *
 * Un onglet par jour de conférence (dérivés des dates des sessions, cf. data/agenda.ts).
 * Onglet actif = carte blanche + ombre. Si la conférence tient sur un seul jour, le
 * sélecteur est masqué (rien rendu) — ce jour est affiché d'office.
 * Le jour par défaut et la persistance sont gérés par l'état React dans App.tsx.
 */

import type { Day } from '../types/agenda'
import './DayTabs.css'

export interface DayTabsProps {
  days: Day[]
  selected: number
  onSelect: (index: number) => void
}

/** Sous-libellé d'un onglet : "Mar. 23 juin" (jour abrégé + date sans l'année). */
function subLabel(day: Day): string {
  const wd = day.weekday ? day.weekday.slice(0, 3) + '.' : ''
  const date = day.datelabel.replace(' 2026', '')
  return `${wd} ${date}`.trim()
}

export default function DayTabs({ days, selected, onSelect }: DayTabsProps) {
  // Conférence sur un seul jour → sélecteur masqué (edge case 103).
  if (days.length < 2) return null

  return (
    <div className="daytabs" role="tablist" aria-label="Jour de l'agenda">
      {days.map((d, i) => {
        const active = i === selected
        return (
          <button
            key={d.index}
            type="button"
            role="tab"
            aria-selected={active}
            className={'daytab' + (active ? ' is-active' : '')}
            onClick={() => onSelect(i)}
          >
            <span className="dt-main">{d.short}</span>
            <span className="dt-sub">{subLabel(d)}</span>
          </button>
        )
      })}
    </div>
  )
}
