'use client'

import { useState } from 'react'
import type { SkillTier } from '@/lib/supabase/types'

const TIER_LABELS: Record<SkillTier, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

interface Player {
  id: string
  name: string
  email: string
  phone: string | null
  skill_tier: SkillTier
  role: string
}

export default function PlayerDirectory({ players }: { players: Player[] }) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? players.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      )
    : players

  return (
    <div className="flex flex-col gap-4">
      <input
        type="search"
        placeholder="Search by name…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full max-w-sm rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
      />

      <p className="text-sm text-zinc-500">{filtered.length} player{filtered.length !== 1 ? 's' : ''}</p>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr className="border-b text-left text-zinc-500">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Skill</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-zinc-400">
                  No players found
                </td>
              </tr>
            ) : (
              filtered.map((player) => (
                <tr key={player.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium">{player.name}</td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${player.email}`} className="text-blue-600 hover:underline">
                      {player.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {player.phone
                      ? <a href={`tel:${player.phone}`} className="hover:underline">{player.phone}</a>
                      : <span className="text-zinc-300">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{TIER_LABELS[player.skill_tier]}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
