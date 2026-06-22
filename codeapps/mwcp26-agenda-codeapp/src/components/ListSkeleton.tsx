/*
 * Feature 102 — US-102-02 : squelette de chargement de la vue liste (mobile uniquement).
 * Affiché lors du chargement initial de l'app sur mobile (avant que les données
 * Dataverse ne soient disponibles). Reproduit la structure d'une journée type :
 * 3 groupes horaires, 2 ou 3 cartes par groupe. Entièrement déterministe (pas de
 * Math.random). Les dimensions shimmer reproduisent la mise en page d'AgendaList.
 */

import './ListSkeleton.css'

/* Gabarit fixe : [nbCartes] par groupe. */
const GROUPS: number[] = [3, 2, 3]

export default function ListSkeleton() {
  return (
    <div
      className="lsk-list"
      role="status"
      aria-busy="true"
      aria-label="Chargement de l'agenda"
    >
      {GROUPS.map((count, gi) => (
        <div key={gi} className="lsk-group" aria-hidden="true">
          <div className="lsk-group-head">
            <div className="lsk-time sk-shimmer" />
            <div className="lsk-divider" />
          </div>

          {Array.from({ length: count }, (_, ci) => (
            <div key={ci} className="lsk-card">
              <div className="lsk-card-body">
                <div className={`lsk-bar lsk-bar--title sk-shimmer lsk-w-${(gi + ci) % 3}`} />
                <div className="lsk-bar lsk-bar--speakers sk-shimmer" />
                <div className="lsk-bar lsk-bar--meta sk-shimmer" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
