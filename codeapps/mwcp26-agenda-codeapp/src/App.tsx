import { useEffect, useMemo, useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { AppShell } from './components/AppShell'
import { Hero } from './components/Hero'
import { Controls } from './components/Controls'
import { AgendaList } from './components/AgendaList'
import { buildDays, defaultDayIndex } from './data/agenda'

function App() {
  const days = useMemo(() => buildDays(), [])
  // Jour par défaut : aujourd'hui si pendant la conférence, sinon Jour 1 (règle 103).
  const [dayValue, setDayValue] = useState(() => String(defaultDayIndex(days)))
  const [query, setQuery] = useState('') // recherche (104), préservée au changement de jour
  const [loading, setLoading] = useState(true) // squelette au montage initial (US-102-02)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  return (
    <AppShell>
      <Hero />
      <Tabs.Root value={dayValue} onValueChange={setDayValue}>
        <Controls days={days} query={query} onQueryChange={setQuery} />
        <div className="bodyscroll">
          {days.map((d) => (
            <Tabs.Content key={d.index} value={String(d.index)}>
              <AgendaList
                day={d}
                query={query}
                loading={loading}
                onClearSearch={() => setQuery('')}
              />
            </Tabs.Content>
          ))}
        </div>
      </Tabs.Root>
    </AppShell>
  )
}

export default App
