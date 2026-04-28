'use client'

import { useState, useTransition } from 'react'
import TeammateSearch from './TeammateSearch'
import { joinLeague, leaveLeague } from './actions'
import type { SkillTier } from '@/lib/supabase/types'

interface Player {
  id: string
  name: string
  skill_tier: SkillTier
}

interface Props {
  seasonId: string
  isRegistered: boolean
}

export default function JoinLeagueForm({ seasonId, isRegistered }: Props) {
  const [teammates, setTeammates] = useState<Player[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleJoin() {
    setError(null)
    startTransition(async () => {
      const result = await joinLeague(seasonId, teammates.map((t) => t.id))
      if (result?.error) setError(result.error)
    })
  }

  function handleLeave() {
    setError(null)
    startTransition(async () => {
      const result = await leaveLeague(seasonId)
      if (result?.error) setError(result.error)
    })
  }

  if (isRegistered) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
          You are registered for this season.
        </div>
        {error && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}
        <button
          onClick={handleLeave}
          disabled={pending}
          className="w-fit rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {pending ? 'Leaving…' : 'Leave League'}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">
          Preferred Teammates <span className="text-zinc-400">(optional, up to 4)</span>
        </label>
        <p className="text-xs text-zinc-500">
          These players will be guaranteed on your team. Search by name.
        </p>
        <TeammateSearch selected={teammates} onChange={setTeammates} max={4} />
      </div>

      <button
        onClick={handleJoin}
        disabled={pending}
        className="w-fit rounded-md bg-black px-6 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {pending ? 'Joining…' : 'Join League'}
      </button>
    </div>
  )
}
