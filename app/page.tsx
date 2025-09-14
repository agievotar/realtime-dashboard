'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef, useState } from 'react'

const TrafficChart = dynamic(() => import('../components/TrafficChart'), { ssr: false })

type Point = { t: number; v: number }

export default function Page() {
  const [dark, setDark] = useState(true)
  const [live, setLive] = useState(true)
  const [accent, setAccent] = useState<'indigo' | 'emerald' | 'amber' | 'rose'>('indigo')
  const [query, setQuery] = useState('')

  // Load persisted prefs
  useEffect(() => {
    const theme = localStorage.getItem('theme')
    const acc = localStorage.getItem('accent')
    const liveSaved = localStorage.getItem('live')
    if (theme === 'light') setDark(false)
    if (theme === 'dark') setDark(true)
    if (acc === 'indigo' || acc === 'emerald' || acc === 'amber' || acc === 'rose') setAccent(acc)
    if (liveSaved) setLive(liveSaved === 'true')
  }, [])

  // Persist on change
  useEffect(() => localStorage.setItem('theme', dark ? 'dark' : 'light'), [dark])
  useEffect(() => localStorage.setItem('accent', accent), [accent])
  useEffect(() => localStorage.setItem('live', String(live)), [live])

  // Keyboard shortcuts
  const searchRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 't') setDark(v => !v)
      if (e.key.toLowerCase() === 'l') setLive(v => !v)
      if (e.key === '/') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const accents = {
    indigo: { from: 'from-indigo-500', to: 'to-violet-600', ring: 'ring-indigo-500/20', text: 'text-indigo-500 dark:text-indigo-400' },
    emerald: { from: 'from-emerald-500', to: 'to-teal-600', ring: 'ring-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400' },
    amber: { from: 'from-amber-500', to: 'to-orange-600', ring: 'ring-amber-500/20', text: 'text-amber-600 dark:text-amber-400' },
    rose: { from: 'from-rose-500', to: 'to-pink-600', ring: 'ring-rose-500/20', text: 'text-rose-600 dark:text-rose-400' },
  } as const

  // Seed series
  const now = Date.now()
  const makeSeed = (): Point[] => Array.from({ length: 30 }, (_, i) => ({
    t: now - (29 - i) * 2000,
    v: 40 + Math.sin(i / 4) * 8 + Math.random() * 4,
  }))
  const [series, setSeries] = useState<Point[]>(makeSeed())

  // Live updater
  useEffect(() => {
    if (!live) return
    const id = setInterval(() => {
      setSeries(prev => {
        const last = prev[prev.length - 1]
        const next: Point = {
          t: (last?.t ?? Date.now()) + 2000,
          v: Math.max(0, (last?.v ?? 50) + (Math.random() - 0.5) * 6),
        }
        return [...prev.slice(-29), next]
      })
    }, 2000)
    return () => clearInterval(id)
  }, [live])

  const containerCls = useMemo(() => `${dark ? 'dark' : ''}`, [dark])

  const activity = [
    'User signed in',
    'New deployment completed',
    'Report generated',
    'Team member invited',
    'Dark theme toggled',
    'Live data streaming',
  ].filter(x => x.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className={containerCls}>
      <div className="min-h-screen bg-zinc-50 text-zinc-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
        <header className="sticky top-0 z-10 border-b border-zinc-200/60 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800/60 dark:bg-zinc-900/50">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className={`h-8 w-8 rounded-xl bg-gradient-to-br ${accents[accent].from} ${accents[accent].to} shadow`} />
              <div className="flex flex-col">
                <span className="text-sm uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Demo</span>
                <h1 className="text-xl font-semibold leading-none">Realtime Dashboard</h1>
              </div>
            </div>

            <div className="hidden min-w-0 flex-1 items-center sm:flex">
              <div className="relative mx-3 w-full">
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search activity… (/ to focus)"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/60 px-4 py-2 text-sm outline-none ring-0 placeholder:text-zinc-400 focus:bg-white focus:shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 dark:focus:bg-zinc-900"
                />
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-zinc-300 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">/</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLive(v => !v)}
                className="group inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium shadow-sm transition hover:shadow dark:border-zinc-800 dark:bg-zinc-900"
                title="Toggle live data (L)"
              >
                <span className={`h-2 w-2 rounded-full ${live ? 'animate-pulse bg-emerald-500' : 'bg-zinc-400'}`} />
                Live
                <span className="ml-1 hidden text-xs text-zinc-500 sm:inline">(L)</span>
              </button>

              <button
                onClick={() => setDark(v => !v)}
                className="group inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium shadow-sm transition hover:shadow dark:border-zinc-800 dark:bg-zinc-900"
                aria-label="Toggle theme"
                title="Toggle light/dark (T)"
              >
                <span className="grid h-5 w-5 place-items-center rounded-md border border-zinc-200 bg-zinc-50 shadow-inner transition group-hover:scale-105 dark:border-zinc-800 dark:bg-zinc-800">
                  {dark ? '🌙' : '☀️'}
                </span>
                <span className="hidden sm:inline">{dark ? 'Dark' : 'Light'}</span>
              </button>

              <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${accents[accent].from} ${accents[accent].to} shadow-inner ring-2 ring-white dark:ring-zinc-900`} />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6">
          <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Add Widget', emoji: '➕' },
              { label: 'Import Data', emoji: '📥' },
              { label: 'Run Report', emoji: '📊' },
              { label: 'Share', emoji: '🔗' },
            ].map(a => (
              <button key={a.label} className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-left text-sm shadow-sm transition hover:shadow-md active:scale-[.99] dark:border-zinc-800 dark:bg-zinc-900">
                <span className="font-medium">{a.label}</span>
                <span className="text-lg">{a.emoji}</span>
              </button>
            ))}
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Revenue', value: '$24,190', change: '+8.1%' },
              { title: 'Active Users', value: '12,403', change: '+2.4%' },
              { title: 'Errors', value: '0.12%', change: '-0.05%' },
              { title: 'Latency', value: '232 ms', change: '-12 ms' },
            ].map(kpi => (
              <div key={kpi.title} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">{kpi.title}</span>
                  <span className={`text-xs text-indigo-500 dark:text-indigo-400`}>{kpi.change}</span>
                </div>
                <div className="mt-2 text-2xl font-semibold tracking-tight">{kpi.value}</div>
                <div className={`mt-3 h-10 w-full rounded-lg bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-850 ring-1 ring-indigo-500/20`} />
              </div>
            ))}
          </section>

          <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Traffic (live)</h2>
                <div className="text-xs text-zinc-500">{live ? 'streaming' : 'paused'}</div>
              </div>
              <div className="h-64">
                <TrafficChart series={series.map(p => ({ time: new Date(p.t).toLocaleTimeString(), value: Number(p.v.toFixed(2)) }))} />
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-3 text-lg font-semibold">Theme</h2>
              <div className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm dark:border-zinc-700">
                <p>
                  Mode: <span className="font-semibold">{dark ? 'Dark' : 'Light'}</span>
                  <span className="ml-2 text-xs text-zinc-500">(press T)</span>
                </p>
                <p className="mt-3">Accent:</p>
                <div className="mt-2 flex gap-2">
                  {(['indigo', 'emerald', 'amber', 'rose'] as const).map(c => (
                    <button
                      key={c}
                      onClick={() => setAccent(c)}
                      className={`h-8 w-8 rounded-full bg-gradient-to-br ${accents[c].from} ${accents[c].to} ring-2 transition ${accent === c ? accents[c].ring + ' scale-110' : 'ring-transparent'}`}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              <h2 className="mb-3 mt-6 text-lg font-semibold">Activity</h2>
              <ul className="space-y-2 text-sm">
                {activity.map((item, i) => (
                  <li key={i} className="flex items-center justify-between rounded-xl border border-zinc-200/70 bg-zinc-50/70 px-3 py-2 dark:border-zinc-800/70 dark:bg-zinc-800/50">
                    <span>{item}</span>
                    <span className="text-xs text-zinc-500">just now</span>
                  </li>
                ))}
                {activity.length === 0 && (
                  <li className="rounded-xl border border-zinc-200/70 bg-zinc-50/70 px-3 py-2 text-zinc-500 dark:border-zinc-800/70 dark:bg-zinc-800/50">No results</li>
                )}
              </ul>
            </div>
          </section>
        </main>

        <footer className="mx-auto max-w-6xl px-4 pb-8 pt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Built in one file • Tailwind • Recharts • Instant preview (T = theme, L = live, / = search)
        </footer>
      </div>
    </div>
  )
}
