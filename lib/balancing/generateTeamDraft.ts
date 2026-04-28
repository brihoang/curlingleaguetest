export type SkillTier = 'beginner' | 'intermediate' | 'advanced'

export interface Player {
  id: string
  name: string
  skillTier: SkillTier
}

export interface Group {
  playerIds: string[]
}

export interface TeamDraft {
  players: Player[]
  alternate?: Player
}

const TIER_VALUE: Record<SkillTier, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
}

function avgSkill(players: Player[]): number {
  if (players.length === 0) return 0
  return players.reduce((sum, p) => sum + TIER_VALUE[p.skillTier], 0) / players.length
}

export function generateTeamDraft(players: Player[], groups: Group[]): TeamDraft[] {
  if (players.length === 0) return []

  const playerMap = new Map(players.map((p) => [p.id, p]))

  const resolvedGroups: Player[][] = groups
    .map((g) =>
      [...new Set(g.playerIds)]
        .map((id) => playerMap.get(id))
        .filter((p): p is Player => p !== undefined)
    )
    .filter((g) => g.length > 0)

  const groupedIds = new Set(resolvedGroups.flat().map((p) => p.id))
  const solos = players.filter((p) => !groupedIds.has(p.id))

  // Pre-calculate team count so all slots exist before assignment begins.
  // This prevents top players from filling one team before others are created.
  const numTeams = Math.max(resolvedGroups.length, Math.ceil(players.length / 4))
  const teams: Player[][] = resolvedGroups.map((g) => [...g])
  while (teams.length < numTeams) teams.push([])

  // Sort solos descending by skill, then assign each to the eligible team
  // (< 4 starters) with the lowest current average.
  const sortedSolos = [...solos].sort((a, b) => TIER_VALUE[b.skillTier] - TIER_VALUE[a.skillTier])

  for (const solo of sortedSolos) {
    const eligible = teams.filter((t) => t.length < 4)

    if (eligible.length > 0) {
      eligible.sort((a, b) => avgSkill(a) - avgSkill(b))
      eligible[0].push(solo)
    } else {
      // All teams at 4 starters — assign as alternate to the team with lowest avg
      const sorted = [...teams].sort((a, b) => avgSkill(a) - avgSkill(b))
      sorted[0].push(solo)
    }
  }

  return teams.map((members) => {
    if (members.length <= 4) return { players: members }
    const sorted = [...members].sort((a, b) => TIER_VALUE[b.skillTier] - TIER_VALUE[a.skillTier])
    return { players: sorted.slice(0, 4), alternate: sorted[4] }
  })
}
