/*
 * Feature 105 — Détail de session.
 * Desktop (≥ 1024 px) : Dialog Radix centré, overlay, Esc/overlay close.
 * Mobile (< 1024 px)  : Vaul Drawer depuis le bas, drag + snap-back natifs.
 * Les deux partagent le même rendu de contenu (DetailBody + DetailFooter).
 */

import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Drawer } from 'vaul'
import './SessionDetail.css'
import type { Session } from '../types/agenda'

export interface SessionDetailProps {
  session: Session | null
  onClose: () => void
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    window.matchMedia('(min-width: 1024px)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function ClockIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

function DetailBody({ session }: { session: Session }) {
  const timeRange =
    session.startTime && session.endTime
      ? `${session.startTime}–${session.endTime}`
      : (session.startTime ?? '')
  const durationLabel =
    timeRange && session.duration ? `${timeRange} · ${session.duration}` : timeRange
  const rc = session.roomColor || 'var(--text-secondary)'

  return (
    <div className="sd-body">
      {/* Méta : salle + horaire */}
      <div className="sd-meta">
        {session.roomName && (
          <span
            className="sd-room-pill"
            style={{ '--rc': rc } as React.CSSProperties}
          >
            <span className="sd-room-dot" aria-hidden="true" />
            {session.roomName}
            {session.roomCap > 0 && (
              <span className="sd-room-cap"> · {session.roomCap}p</span>
            )}
          </span>
        )}
        {durationLabel && (
          <span className="sd-time">
            <ClockIcon />
            {durationLabel}
          </span>
        )}
      </div>

      {/* Titre */}
      <h2 className="sd-title">{session.title}</h2>

      {/* Description — masquée si vide */}
      {session.description && (
        <p className="sd-desc">{session.description}</p>
      )}

      {/* Intervenants */}
      {session.speakers.length > 0 && (
        <div className="sd-speakers">
          <div className="sd-speakers-label">Intervenants</div>
          {session.speakers.map((sp, i) => (
            <div key={i} className="sd-speaker">
              <div className="sd-avatar-ring" style={{ background: rc }}>
                <div className="sd-avatar">{initials(sp.name)}</div>
              </div>
              <div className="sd-speaker-info">
                <div className="sd-speaker-name">{sp.name}</div>
                {sp.tagLine && (
                  <div className="sd-speaker-role">{sp.tagLine}</div>
                )}
                {sp.bio && <div className="sd-speaker-bio">{sp.bio}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DetailFooter({ onClose }: { onClose: () => void }) {
  return (
    <div className="sd-footer">
      <button className="sd-close-btn" onClick={onClose}>
        Fermer
      </button>
    </div>
  )
}

export default function SessionDetail({ session, onClose }: SessionDetailProps) {
  const isDesktop = useIsDesktop()
  const open = !!session

  const handleOpenChange = (o: boolean) => {
    if (!o) onClose()
  }

  if (isDesktop) {
    return (
      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="sd-overlay" />
          <Dialog.Content
            className="sd-dialog"
            aria-label={session?.title ?? 'Détail de la session'}
          >
            {session && (
              <>
                <DetailBody session={session} />
                <DetailFooter onClose={onClose} />
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    )
  }

  return (
    <Drawer.Root open={open} onOpenChange={handleOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="sd-overlay" />
        <Drawer.Content
          className="sd-drawer"
          aria-label={session?.title ?? 'Détail de la session'}
        >
          {session && (
            <>
              <div className="sd-handle" aria-hidden="true" />
              <DetailBody session={session} />
            </>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
