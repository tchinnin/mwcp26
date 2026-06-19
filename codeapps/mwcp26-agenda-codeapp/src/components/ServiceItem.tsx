import { Coffee, UtensilsCrossed, Megaphone, Sparkles, Mic, CalendarClock } from 'lucide-react'
import type { Session, ServiceIconKey } from '../data/agenda'
import { serviceIconKey } from '../data/agenda'

const ICONS: Record<ServiceIconKey, typeof Coffee> = {
  coffee: Coffee,
  utensils: UtensilsCrossed,
  megaphone: Megaphone,
  sparkles: Sparkles,
  mic: Mic,
  calendar: CalendarClock,
}

/** Item de service (pause, repas, plénière) — style pointillé de la maquette. */
export function ServiceItem({ session }: { session: Session }) {
  const Icon = ICONS[serviceIconKey(session.title)]
  return (
    <div className="svc">
      <span className="svc-icon">
        <Icon size={15} aria-hidden />
      </span>
      <span className="svc-title">{session.title}</span>
      <span className="svc-dur">{session.duration}</span>
    </div>
  )
}
