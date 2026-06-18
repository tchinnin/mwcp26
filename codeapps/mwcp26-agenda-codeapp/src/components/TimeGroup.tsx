import type { TimeGroup as TimeGroupType } from '../data/agenda'
import { SessionCard } from './SessionCard'
import { ServiceItem } from './ServiceItem'

export function TimeGroup({ group }: { group: TimeGroupType }) {
  return (
    <section className="tgroup">
      <div className="thead">
        <span className="ttime">{group.label ?? group.start}</span>
        <span className="tline" />
        {group.end && <span className="tend">→ {group.end}</span>}
      </div>
      <div className="tcards">
        {group.items.map((s) =>
          s.isServiceSession ? (
            <ServiceItem key={s.id} session={s} />
          ) : (
            <SessionCard key={s.id} session={s} />
          ),
        )}
      </div>
    </section>
  )
}
