import { useEffect, useState } from 'react'
import './App.css'
import AgendaGrid from './components/AgendaGrid'
import AgendaList from './components/AgendaList'
import DayTabs from './components/DayTabs'
import GridSkeleton from './components/GridSkeleton'
import ListSkeleton from './components/ListSkeleton'
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

type View = 'grid' | 'list'

function App() {
  // Agenda chargé depuis Dataverse (data/agenda.ts). null = en cours de chargement.
  const [agenda, setAgenda] = useState<AgendaData | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Feature 103 — jour sélectionné, persistant pendant la session de navigation.
  const [day, setDay] = useState(0)
  // Feature 102 — bascule grille / liste (desktop uniquement ; mobile = toujours liste).
  const [view, setView] = useState<View>('grid')

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
    // Chargement initial : skeleton grille sur desktop, skeleton liste sur mobile.
    // US-102-02 : ListSkeleton remplace le message texte sur mobile (première expérience
    // qui charge les données). GridSkeleton reste inchangé côté desktop (US-101-02).
    body = (
      <>
        <div className="app-controls">
          <div className="sk-daytabs sk-shimmer" aria-hidden="true" />
        </div>
        <main className="app-main">
          <div className="agenda-grid-wrap">
            <GridSkeleton />
          </div>
          <div className="agenda-mobile-wrap">
            <ListSkeleton />
          </div>
        </main>
      </>
    )
  } else {
    const gridSessions = positionableSessions(agenda.days[day] ?? agenda.days[0])
    const allSessions = (agenda.days[day] ?? agenda.days[0]).sessions

    body = (
      <>
        {/* Barre de contrôles : sélecteur de jour (103) + toggle de vue (102, desktop). */}
        <div className="app-controls">
          <DayTabs days={agenda.days} selected={day} onSelect={setDay} />

          {/* Toggle Grille / Liste — visible uniquement en desktop (CSS gate).
              Ordre : Grille en premier (vue par défaut), Liste en second. */}
          <div className="view-toggle" role="group" aria-label="Vue de l'agenda">
            <button
              className={`vt-btn${view === 'grid' ? ' is-active' : ''}`}
              onClick={() => setView('grid')}
              aria-pressed={view === 'grid'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
              Grille
            </button>
            <button
              className={`vt-btn${view === 'list' ? ' is-active' : ''}`}
              onClick={() => setView('list')}
              aria-pressed={view === 'list'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              Liste
            </button>
          </div>
        </div>

        <main className="app-main">
          {/* Grille (101) — desktop-only, sauf si bascule sur "Liste". */}
          <div className="agenda-grid-wrap">
            {view === 'grid' ? (
              <AgendaGrid sessions={gridSessions} rooms={agenda.rooms} />
            ) : (
              <AgendaList sessions={allSessions} />
            )}
          </div>

          {/* Liste (102) — mobile-only (CSS gate ≥1024px → display:none). */}
          <div className="agenda-mobile-wrap">
            <AgendaList sessions={allSessions} />
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
