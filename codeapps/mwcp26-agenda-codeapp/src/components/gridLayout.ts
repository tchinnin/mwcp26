/*
 * Constantes de gabarit de la grille salles × heures (feature 101).
 * Source partagée entre la grille réelle (AgendaGrid) et son squelette de chargement
 * (GridSkeleton) pour que les deux aient strictement la même métrique — pas de drift.
 */

/** Hauteur d'une ligne de 5 minutes, en px (port maquette). */
export const PXPER5 = 13

/** Largeur de la colonne d'heures (colonne 1). */
export const HOUR_COL = '58px'

/** Hauteur de la rangée d'en-têtes de salle (rangée 1). */
export const HEADER_ROW = '42px'

/** Template des colonnes de salle (colonnes 2..n+1). */
export function roomColumns(n: number): string {
  return `repeat(${n}, minmax(150px, 1fr))`
}
