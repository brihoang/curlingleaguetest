'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { searchPlayers } from './actions'
import type { SkillTier } from '@/lib/supabase/types'

const TIER_LABELS: Record<SkillTier, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

interface Player {
  id: string
  name: string
  skill_tier: SkillTier
}

interface Props {
  selected: Player[]
  onChange: (players: Player[]) => void
  max?: number
}

export default function TeammateSearch({ selected, onChange, max = 4 }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Player[]>([])
  const [open, setOpen] = useState(false)
  const [, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    startTransition(async () => {
      const data = await searchPlayers(query)
      const selectedIds = new Set(selected.map((p) => p.id))
      setResults((data as Player[]).filter((p) => !selectedIds.has(p.id)))
      setOpen(true)
    })
  }, [query, selected])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function addPlayer(player: Player) {
    onChange([...selected, player])
    setQuery('')
    setResults([])
    setOpen(false)
    inputRef.current?.focus()
  }

  function removePlayer(id: string) {
    onChange(selected.filter((p) => p.id !== id))
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {selected.map((player) => (
          <span
            key={player.id}
            className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-sm"
          >
            {player.name}
            <button
              type="button"
              onClick={() => removePlayer(player.id)}
              className="text-zinc-400 hover:text-black"
              aria-label={`Remove ${player.name}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {selected.length < max && (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          {open && results.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-md"
            >
              {results.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => addPlayer(player)}
                  className="flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-zinc-50"
                >
                  <span>{player.name}</span>
                  <span className="text-xs text-zinc-400">{TIER_LABELS[player.skill_tier]}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selected.length >= max && (
        <p className="text-xs text-zinc-400">Maximum {max} teammates selected</p>
      )}
    </div>
  )
}
