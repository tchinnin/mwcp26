import { ExternalLink, Calendar, MapPin } from 'lucide-react'
import mwcpLogo from '../assets/mwcp-logo.png?inline'

export function Hero() {
  return (
    <header className="hero">
      <div className="hero-top">
        <img src={mwcpLogo} alt="MWCP" className="hero-logo" />
        <div className="hero-titles">
          <div className="hero-kicker">MWCP 2026 · 10ᵉ ÉDITION</div>
          <div className="hero-sub2">IA · Modern Work · Cybersécurité</div>
        </div>
        <a
          className="hero-ext"
          href="https://www.modernworkplaceconference.fr"
          target="_blank"
          rel="noreferrer"
          aria-label="Site officiel"
        >
          <ExternalLink size={16} />
        </a>
      </div>
      <h1 className="hero-title">Agenda</h1>
      <div className="hero-pills">
        <span className="hpill hpill-date">
          <Calendar size={14} />
          23–24 Juin
        </span>
        <span className="hpill">
          <MapPin size={14} />
          Microsoft France
        </span>
      </div>
    </header>
  )
}
