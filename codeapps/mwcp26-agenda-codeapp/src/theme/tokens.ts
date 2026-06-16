/*
 * Accès typé aux design tokens définis dans tokens.css.
 * Chaque valeur est une référence `var(--…)` — on ne duplique jamais les littéraux ici,
 * tokens.css reste la seule source des valeurs concrètes.
 *
 *   import { token } from "./theme/tokens";
 *   <div style={{ color: token.textHeading, padding: token.space4 }} />
 */

const v = (name: string) => `var(${name})`;

export const token = {
  // Couleurs de marque
  brandBlue: v("--brand-blue"),
  brandGreen: v("--brand-green"),
  brandYellow: v("--brand-yellow"),
  brandRed: v("--brand-red"),
  accentEvent: v("--accent-event"),

  // Texte
  textHeading: v("--text-heading"),
  textBody: v("--text-body"),
  textSecondary: v("--text-secondary"),
  textMuted: v("--text-muted"),
  textOnBrand: v("--text-on-brand"),
  textLink: v("--text-link"),

  // Surfaces
  surfacePage: v("--surface-page"),
  surfaceCard: v("--surface-card"),
  surfaceSunken: v("--surface-sunken"),
  surfaceInverse: v("--surface-inverse"),

  // Action
  actionPrimary: v("--action-primary"),
  actionPrimaryHover: v("--action-primary-hover"),
  actionPrimaryActive: v("--action-primary-active"),

  // Bordures
  borderSubtle: v("--border-subtle"),
  borderDefault: v("--border-default"),
  borderStrong: v("--border-strong"),

  // Tracks
  trackIa: v("--track-ia"),
  trackModernWork: v("--track-modernwork"),
  trackSecurity: v("--track-security"),
  trackPower: v("--track-power"),

  // Typographie
  fontDisplay: v("--font-display"),
  fontUi: v("--font-ui"),
  fontMono: v("--font-mono"),

  // Espacement
  space1: v("--space-1"),
  space2: v("--space-2"),
  space3: v("--space-3"),
  space4: v("--space-4"),
  space5: v("--space-5"),
  space6: v("--space-6"),
  space8: v("--space-8"),
  space10: v("--space-10"),
  space12: v("--space-12"),
  space16: v("--space-16"),

  // Rayons
  radiusMd: v("--radius-md"),
  radiusLg: v("--radius-lg"),
  radiusXl: v("--radius-xl"),
  radiusPill: v("--radius-pill"),

  // Effets
  glassBg: v("--glass-bg"),
  glassShadow: v("--glass-shadow"),
  shadowBrand: v("--shadow-brand"),
  gradientHero: v("--gradient-hero"),
} as const;

export type Token = keyof typeof token;
