import './App.css'

/*
 * Assets de marque inlinés en base64 (suffixe ?inline) : la donnée image est embarquée
 * dans le bundle (data URI), donc aucune résolution d'URL à l'exécution. C'est le seul
 * mécanisme fiable dans le player Power Apps — les URLs relatives (import.meta.url ou
 * BASE_URL/public) ne s'y résolvent pas une fois l'app pushée.
 */
import mwcpLogo from './assets/mwcp-logo.png?inline'
import parisBg from './assets/paris-bg.jpg?inline'

/** Tracks MWCP — couleur (token) + libellé. Jamais la couleur seule (a11y). */
const TRACKS = [
  { label: 'IA / Copilot', color: 'var(--track-ia)' },
  { label: 'Modern Work', color: 'var(--track-modernwork)' },
  { label: 'Cybersécurité', color: 'var(--track-security)' },
  { label: 'Power Platform', color: 'var(--track-power)' },
]

function App() {
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

        <main className="app-main">
          <div className="placeholder-card">
            <h2>Squelette de l'application</h2>
            <p>
              L'agenda (vues grille et liste, sélection du jour, recherche et détail
              de session) sera branché sur Dataverse dans les prochaines itérations.
            </p>
            <div className="track-legend">
              {TRACKS.map((t) => (
                <span className="track-chip" key={t.label}>
                  <span className="track-chip__dot" style={{ background: t.color }} />
                  {t.label}
                </span>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
