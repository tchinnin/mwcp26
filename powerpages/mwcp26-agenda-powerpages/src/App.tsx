import { useEffect, useState } from 'react'
import './App.css'
import AgendaGrid from './components/AgendaGrid'
import AgendaList from './components/AgendaList'
import DayTabs from './components/DayTabs'
import GridSkeleton from './components/GridSkeleton'
import ListSkeleton from './components/ListSkeleton'
import SessionDetailPanel from './components/SessionDetailPanel'
import { defaultDayIndex, getAgenda, positionableSessions } from './data/agenda'
import type { AgendaData, Session } from './types/agenda'

/*
 * Assets importés comme URLs Vite standard (hash dans le bundle dist/).
 * Le portail Power Pages sert les assets depuis le dist/ déployé — les URLs
 * relatives fonctionnent, contrairement au player Power Apps (Code App).
 */
import mwcpLogo from './assets/mwcp-logo.png'
import parisBg from './assets/paris-bg.jpg'

type View = 'grid' | 'list'

function App() {
  const [agenda, setAgenda] = useState<AgendaData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [day, setDay] = useState(0)
  const [view, setView] = useState<View>('grid')
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

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
          <p>Impossible de charger les sessions.</p>
        </div>
      </main>
    )
  } else if (!agenda) {
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
        <div className="app-controls">
          <DayTabs days={agenda.days} selected={day} onSelect={setDay} />

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
          <div className="agenda-grid-wrap">
            {view === 'grid' ? (
              <AgendaGrid sessions={gridSessions} rooms={agenda.rooms} onSessionClick={setSelectedSession} />
            ) : (
              <AgendaList sessions={allSessions} onSessionClick={setSelectedSession} />
            )}
          </div>

          <div className="agenda-mobile-wrap">
            <AgendaList sessions={allSessions} onSessionClick={setSelectedSession} />
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

        <SessionDetailPanel
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      </div>
    </div>
  )
}

export default App
