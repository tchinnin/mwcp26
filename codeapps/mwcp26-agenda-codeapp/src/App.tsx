import { useEffect, useState } from 'react'
import './App.css'
import AgendaGrid from './components/AgendaGrid'
import DayTabs from './components/DayTabs'
import GridSkeleton from './components/GridSkeleton'
import { defaultDayIndex, getAgenda, positionableSessions } from './data/agenda'
import type { AgendaData } from './types/agenda'

/*
 * Assets de marque inlinés en base64 (suffixe ?inline) : la donnée image est embarquée
 * dans le bundle (data URI), donc aucune résolution d'URL à l'exécution. C'est le seul
 * mécanisme fiable dans le player Power Apps — les URLs relatives (import.meta.url ou
 * BASE_URL/public) ne s'y résolvent pas une fois l'app pushée.
 */
import mwcpLogo from './assets/mwcp-logo.png?inline'
import parisBg from './assets/paris-bg.jpg?inline'

function App() {
  // Agenda chargé depuis Dataverse (data/agenda.ts). null = en cours de chargement.
  const [agenda, setAgenda] = useState<AgendaData | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Feature 103 — jour sélectionné, persistant pendant la session de navigation.
  const [day, setDay] = useState(0)

  // Chargement hors render (cf. ppbp-codeapps-connectors). Le SDK Power Apps ne joint
  // Dataverse que dans le player (URL Local Play) — pas en vite nu.
  useEffect(() => {
    let alive = true
    getAgenda()
      .then((a) => {
        if (!alive) return
        setAgenda(a)
        setDay(defaultDayIndex(a.days))
      })
      .catch((e) => alive && setError(String(e)))
    return () => {
      alive = false
    }
  }, [])

  let body
  if (error) {
    body = (
      <main className="app-main">
        <div className="agenda-status agenda-status--error">
          <h2>Agenda indisponible</h2>
          <p>Impossible de charger les sessions depuis Dataverse.</p>
        </div>
      </main>
    )
  } else if (!agenda) {
    // Chargement : on rend la même charpente que l'état chargé. Le gating responsive
    // (cf. App.css) montre le skeleton grille en desktop et un message court sous 1024px,
    // la vue grille n'ayant de sens qu'en desktop (skeleton réservé à la grille, cf. 101).
    body = (
      <>
        <div className="app-controls">
          <div className="sk-daytabs sk-shimmer" aria-hidden="true" />
        </div>
        <main className="app-main">
          <div className="agenda-grid-wrap">
            <GridSkeleton />
          </div>
          <div className="agenda-mobile-note">
            <p>Chargement de l'agenda…</p>
          </div>
        </main>
      </>
    )
  } else {
    const gridSessions = positionableSessions(agenda.days[day] ?? agenda.days[0])
    body = (
      <>
        {/* Barre de contrôles : non sticky en mobile (défile avec le hero), dans la zone
            figée en desktop (cf. spec 100). Ne porte que le sélecteur de jour (103) ;
            recherche/bascule de vue viendront avec les features 104/102. */}
        <div className="app-controls">
          <DayTabs days={agenda.days} selected={day} onSelect={setDay} />
        </div>

        <main className="app-main">
          {/* Grille (101) — desktop-only ; affichée ≥1024px (gating CSS, cf. App.css). */}
          <div className="agenda-grid-wrap">
            <AgendaGrid sessions={gridSessions} rooms={agenda.rooms} />
          </div>
          {/* Sous 1024px : la vue grille n'a pas de sens ; la vue liste (102) viendra. */}
          <div className="agenda-mobile-note">
            <p>
              La vue grille est disponible sur écran large (≥ 1024 px).
              <br />
              La vue liste arrivera dans une prochaine itération.
            </p>
          </div>
        </main>
      </>
    )
  }

  return (
    <div className="app-shell">
      <img className="app-bg" src={parisBg} alt="" aria-hidden="true" />
      <div className="app-col">
        <header className="app-header">
          <img className="app-header__logo" src={mwcpLogo} alt="Logo MWCP 2026" />
          <div className="app-header__titles">
            <span className="app-header__kicker">Modern Workplace Conference</span>
            <h1 className="app-header__title">Agenda MWCP 2026</h1>
          </div>
          <div className="app-header__meta">
            <span className="badge-edition">10e Édition</span>
            <span className="pill-dates">23–24 juin 2026</span>
          </div>
        </header>

        {body}
      </div>
    </div>
  )
}

export default App
