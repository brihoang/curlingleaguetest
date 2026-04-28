'use client'

import { useTransition } from 'react'
import { advanceSeasonState } from './season.actions'
import type { SeasonState } from '@/lib/supabase/types'

const STATE_LABELS: Record<SeasonState, string> = {
  registration_open: 'Registration Open',
  teams_finalized: 'Teams Finalized',
  season_active: 'Season Active',
  season_complete: 'Season Complete',
}

const NEXT_ACTION_LABELS: Partial<Record<SeasonState, string>> = {
  registration_open: 'Finalize Teams',
  teams_finalized: 'Start Season',
  season_active: 'Complete Season',
}

const STATES: SeasonState[] = ['registration_open', 'teams_finalized', 'season_active', 'season_complete']

interface Props {
  season: { id: string; state: SeasonState } | null
}

export default function SeasonStatePanel({ season }: Props) {
  const [pending, startTransition] = useTransition()

  if (!season) {
    return (
      <section className="rounded-lg border p-6">
        <h2 className="mb-2 text-xl font-semibold">Season</h2>
        <p className="text-zinc-500">No season found.</p>
      </section>
    )
  }

  const currentIdx = STATES.indexOf(season.state)
  const nextLabel = NEXT_ACTION_LABELS[season.state]

  function handleAdvance() {
    startTransition(async () => {
      await advanceSeasonState(season!.id, season!.state)
    })
  }

  return (
    <section className="rounded-lg border p-6">
      <h2 className="mb-4 text-xl font-semibold">Season State</h2>

      <ol className="mb-6 flex gap-2">
        {STATES.map((state, idx) => (
          <li key={state} className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${
              idx === currentIdx
                ? 'bg-black text-white'
                : idx < currentIdx
                  ? 'bg-zinc-200 text-zinc-500 line-through'
                  : 'bg-zinc-100 text-zinc-400'
            }`}>
              {STATE_LABELS[state]}
            </span>
            {idx < STATES.length - 1 && <span className="text-zinc-300">→</span>}
          </li>
        ))}
      </ol>

      {nextLabel && (
        <button
          onClick={handleAdvance}
          disabled={pending}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {pending ? 'Updating…' : nextLabel}
        </button>
      )}
    </section>
  )
}
