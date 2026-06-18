import * as Tabs from '@radix-ui/react-tabs'
import type { Day } from '../data/agenda'

/** Sélecteur de jour (spec 103) — Radix Tabs.List : navigation clavier + ARIA natifs. */
export function DayTabs({ days }: { days: Day[] }) {
  return (
    <Tabs.List className="daytabs" aria-label="Sélection du jour">
      {days.map((d) => (
        <Tabs.Trigger key={d.index} value={String(d.index)} className="daytab">
          <span className="dt-main">{d.tabMain}</span>
          <span className="dt-sub">{d.tabSub}</span>
        </Tabs.Trigger>
      ))}
    </Tabs.List>
  )
}
