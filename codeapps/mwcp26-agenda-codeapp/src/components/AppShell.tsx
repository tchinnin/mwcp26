import type { ReactNode } from 'react'
// Fond Paris inliné en base64 (?inline) — robuste après push (cf. ref-codeapp-assets-public).
import parisBg from '../assets/paris-bg.jpg?inline'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="bg" style={{ backgroundImage: `url(${parisBg})` }} />
      <div className="app-col">{children}</div>
    </>
  )
}
