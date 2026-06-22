/*
 * Feature 105 — Panneau de détail de session.
 * Mobile (< 1024 px) : drawer bottom-sheet via vaul (drag natif, seuil 30 %, snap-back).
 * Desktop (≥ 1024 px) : <dialog> natif (showModal — piège de focus + Esc intégrés).
 */

import { useEffect, useRef, useState } from 'react'
import { Drawer } from 'vaul'
import type { Session } from '../types/agenda'
import './SessionDetail.css'

/* ──────────────────── Utilitaires ──────────────────── */

function useIsDesktop() {
  const [desktop, setDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = (e: MediaQueryListEvent) => setDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return desktop
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max).trimEnd() + '…'
}

/* ──────────────────── Icône horloge ──────────────────── */

function ClockIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

/* ──────────────────── Corps partagé ──────────────────── */

interface PanelBodyProps {
  session: Session
  onClose: () => void
  showHandle?: boolean
  showFooter?: boolean
}

function PanelBody({ session, onClose, showHandle, showFooter }: PanelBodyProps) {
  return (
    <>
      {showHandle && (
        <div className="sd-handle-wrap" aria-hidden="true">
          <div className="sd-handle" />
        </div>
      )}
      <div className="sd-scroll">
        <div className="sd-meta-row">
          {session.roomName && (
            <span
              className="sd-room-pill"
              style={{ '--rc': session.roomColor } as React.CSSProperties}
            >
              <span className="sd-room-dot" aria-hidden="true" />
              {session.roomName}
              {session.roomCap > 0 && (
                <span className="sd-room-cap"> · {session.roomCap}p</span>
              )}
            </span>
          )}
          {session.startTime && (
            <span className="sd-time">
              <ClockIcon />
              {session.startTime}–{session.endTime}
              {session.duration && ` · ${session.duration}`}
            </span>
          )}
        </div>

        <h2 className="sd-title">{session.title}</h2>

        {session.description && (
          <p className="sd-desc">{session.description}</p>
        )}

        {session.speakers.length > 0 && (
          <section className="sd-speakers" aria-label="Intervenants">
            <div className="sd-speakers-label">Intervenants</div>
            {session.speakers.map((sp, i) => (
              <div key={i} className="sd-speaker-row">
                <div
                  className="sd-avatar-wrap"
                  style={{ '--rc': session.roomColor } as React.CSSProperties}
                  aria-hidden="true"
                >
                  <div className="sd-avatar">{initials(sp.name)}</div>
                </div>
                <div className="sd-speaker-info">
                  <div className="sd-speaker-name">{sp.name}</div>
                  {sp.tagLine && (
                    <div className="sd-speaker-tagline">{sp.tagLine}</div>
                  )}
                  {sp.bio && (
                    <div className="sd-speaker-bio">{truncate(sp.bio, 200)}</div>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
      {showFooter !== false && (
        <div className="sd-footer">
          <button className="sd-close-btn" onClick={onClose} type="button">
            Fermer
          </button>
        </div>
      )}
    </>
  )
}

/* ──────────────────── Desktop : <dialog> natif ──────────────────── */

function DesktopDialog({ session, onClose }: { session: Session; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const originRef = useRef<Element | null>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    originRef.current = document.activeElement
    dialog.showModal()
    return () => {
      dialog.close()
      if (originRef.current instanceof HTMLElement) originRef.current.focus()
    }
  }, [])

  function handleBackdrop(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === ref.current) onClose()
  }

  function handleCancel(e: React.SyntheticEvent) {
    e.preventDefault()
    onClose()
  }

  return (
    <dialog
      ref={ref}
      className="sd-dialog"
      onClick={handleBackdrop}
      onCancel={handleCancel}
      aria-label={session.title}
    >
      <PanelBody session={session} onClose={onClose} />
    </dialog>
  )
}

/* ──────────────────── Mobile : vaul drawer ──────────────────── */

function MobileDrawer({ session, onClose }: { session: Session; onClose: () => void }) {
  return (
    <Drawer.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      dismissible
    >
      <Drawer.Portal>
        <Drawer.Overlay className="sd-overlay" />
        <Drawer.Content className="sd-sheet" aria-label={session.title}>
          <PanelBody session={session} onClose={onClose} showHandle showFooter={false} />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

/* ──────────────────── Export ──────────────────── */

interface SessionDetailPanelProps {
  session: Session | null
  onClose: () => void
}

export default function SessionDetailPanel({ session, onClose }: SessionDetailPanelProps) {
  const isDesktop = useIsDesktop()
  if (!session) return null
  if (isDesktop) return <DesktopDialog session={session} onClose={onClose} />
  return <MobileDrawer session={session} onClose={onClose} />
}
