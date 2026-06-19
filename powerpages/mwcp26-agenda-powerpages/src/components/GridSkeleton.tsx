/*
 * Feature 101 — US-101-02 : squelette de chargement de la vue grille (desktop-only).
 *
 * Reproduit la STRUCTURE de la grille salles × heures (AgendaGrid) en placeholders
 * animés (shimmer), affiché pendant le chargement des données à la place du message
 * texte. Les salles réelles n'étant pas encore connues, le gabarit est FIXE : SK_ROOMS
 * colonnes × SK_ROWS lignes (cf. spec). Réutilise les coquilles `.tt-*` et les
 * constantes de gabarit (gridLayout.ts) pour rester strictement aligné sur la vraie grille.
 */

import type { CSSProperties } from 'react'
import { HEADER_ROW, HOUR_COL, PXPER5, roomColumns } from './gridLayout'
import './AgendaGrid.css'
import './GridSkeleton.css'

const SK_ROOMS = 5 // = nb de salles réel du modèle (palette ROOM_PALETTE)
const SK_ROWS = 54 // ≈ une demi-journée : remplit le viewport desktop sans excès
const ROWS_PER_MARK = 12 // un label d'heure toutes les 12 lignes (≈ 1h)

/* Blocs session factices : motif statique déterministe (pas de Math.random — interdit
   côté script et inutile au rendu). [colonne salle 1..SK_ROOMS, ligne début, durée en lignes]. */
const SK_CARDS: Array<[col: number, row: number, span: number]> = [
  [1, 2, 8], [2, 2, 5], [3, 2, 11], [4, 2, 6], [5, 2, 8],
  [1, 11, 6], [2, 8, 9], [4, 9, 10], [5, 11, 5],
  [1, 18, 10], [3, 14, 8], [2, 18, 7], [5, 17, 9], [4, 20, 7],
  [1, 29, 7], [3, 23, 9], [2, 26, 8], [5, 27, 6], [4, 28, 10],
  [1, 37, 9], [3, 33, 7], [2, 35, 10], [4, 39, 6], [5, 34, 8],
  [1, 47, 5], [3, 41, 8], [2, 46, 6], [5, 43, 9],
]

export default function GridSkeleton() {
  const gridStyle: CSSProperties = {
    gridTemplateColumns: `${HOUR_COL} ${roomColumns(SK_ROOMS)}`,
    gridTemplateRows: `${HEADER_ROW} repeat(${SK_ROWS}, ${PXPER5}px)`,
  }

  const rooms = Array.from({ length: SK_ROOMS }, (_, i) => i)
  const markRows: number[] = []
  for (let r = 2; r <= SK_ROWS; r += ROWS_PER_MARK) markRows.push(r)

  return (
    <div
      className="ttgrid ttgrid--skeleton"
      style={gridStyle}
      role="status"
      aria-busy="true"
      aria-label="Chargement de l'agenda"
    >
      {/* coin */}
      <div className="tt-corner" style={{ gridColumn: 1, gridRow: 1 }} aria-hidden="true" />

      {/* en-têtes de salle (placeholders) */}
      {rooms.map((i) => (
        <div key={'h' + i} className="tt-roomhead" style={{ gridColumn: i + 2, gridRow: 1 }} aria-hidden="true">
          <span className="sk-dot sk-shimmer" />
          <span className="sk-bar sk-bar--name sk-shimmer" />
        </div>
      ))}

      {/* labels d'heures (placeholders) + lignes de grille */}
      {markRows.map((r) => [
        <div key={'t' + r} className="tt-time" style={{ gridColumn: 1, gridRow: r }} aria-hidden="true">
          <span className="sk-bar sk-bar--time sk-shimmer" />
        </div>,
        <div key={'l' + r} className="tt-line" style={{ gridColumn: '1 / -1', gridRow: `${r} / span 1` }} aria-hidden="true" />,
      ])}

      {/* blocs session factices */}
      {SK_CARDS.map(([col, row, span], i) => (
        <div
          key={'c' + i}
          className="sk-card sk-shimmer"
          style={{ gridColumn: col + 1, gridRow: `${row} / span ${span}` }}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}
