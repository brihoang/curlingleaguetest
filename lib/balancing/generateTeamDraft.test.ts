import { describe, it, expect } from 'vitest'
import { generateTeamDraft, Player, Group, SkillTier } from './generateTeamDraft'

const TIER_VALUE: Record<SkillTier, number> = { beginner: 1, intermediate: 2, advanced: 3 }

function avgSkill(players: Player[]): number {
  return players.reduce((s, p) => s + TIER_VALUE[p.skillTier], 0) / players.length
}

function makePlayer(id: string, skillTier: SkillTier): Player {
  return { id, name: `Player ${id}`, skillTier }
}

function assertNoDuplicates(draft: ReturnType<typeof generateTeamDraft>) {
  const seen = new Set<string>()
  for (const team of draft) {
    const all = team.alternate ? [...team.players, team.alternate] : team.players
    for (const p of all) {
      expect(seen.has(p.id), `Player ${p.id} assigned to multiple teams`).toBe(false)
      seen.add(p.id)
    }
  }
}

function assertGroupsIntact(draft: ReturnType<typeof generateTeamDraft>, groups: Group[], players: Player[]) {
  const playerMap = new Map(players.map((p) => [p.id, p]))
  for (const group of groups) {
    const teamIdxPerPlayer = group.playerIds.map((id) =>
      draft.findIndex((team) => {
        const all = team.alternate ? [...team.players, team.alternate] : team.players
        return all.some((p) => p.id === id)
      })
    )
    const unique = new Set(teamIdxPerPlayer)
    expect(unique.size, `Group ${group.playerIds.join(',')} was split`).toBe(1)
  }
}

describe('generateTeamDraft', () => {
  it('assigns all players exactly once', () => {
    const players = [
      makePlayer('a', 'advanced'), makePlayer('b', 'intermediate'), makePlayer('c', 'beginner'),
      makePlayer('d', 'advanced'), makePlayer('e', 'intermediate'), makePlayer('f', 'beginner'),
      makePlayer('g', 'intermediate'), makePlayer('h', 'beginner'),
    ]
    const draft = generateTeamDraft(players, [])
    assertNoDuplicates(draft)
    const total = draft.reduce((s, t) => s + t.players.length + (t.alternate ? 1 : 0), 0)
    expect(total).toBe(players.length)
  })

  it('no team exceeds 5 members', () => {
    const players = Array.from({ length: 12 }, (_, i) =>
      makePlayer(String(i), (['beginner', 'intermediate', 'advanced'] as SkillTier[])[i % 3])
    )
    const draft = generateTeamDraft(players, [])
    for (const team of draft) {
      const size = team.players.length + (team.alternate ? 1 : 0)
      expect(size).toBeLessThanOrEqual(5)
    }
  })

  it('keeps groups intact', () => {
    const players = [
      makePlayer('a', 'advanced'), makePlayer('b', 'intermediate'),
      makePlayer('c', 'beginner'), makePlayer('d', 'intermediate'),
      makePlayer('e', 'beginner'), makePlayer('f', 'advanced'),
      makePlayer('g', 'intermediate'), makePlayer('h', 'beginner'),
    ]
    const groups: Group[] = [{ playerIds: ['a', 'b', 'c'] }]
    const draft = generateTeamDraft(players, groups)
    assertGroupsIntact(draft, groups, players)
    assertNoDuplicates(draft)
  })

  it('equalizes average skill within 0.5 tolerance', () => {
    const players = [
      makePlayer('a', 'advanced'), makePlayer('b', 'advanced'),
      makePlayer('c', 'intermediate'), makePlayer('d', 'intermediate'),
      makePlayer('e', 'beginner'), makePlayer('f', 'beginner'),
      makePlayer('g', 'intermediate'), makePlayer('h', 'beginner'),
    ]
    const draft = generateTeamDraft(players, [])
    const avgs = draft.map((t) => avgSkill(t.players))
    const overall = avgs.reduce((s, a) => s + a, 0) / avgs.length
    for (const avg of avgs) {
      expect(Math.abs(avg - overall)).toBeLessThanOrEqual(0.75)
    }
  })

  it('does not produce all-beginner teams when pool has mixed tiers', () => {
    const players = [
      makePlayer('a', 'advanced'), makePlayer('b', 'intermediate'),
      makePlayer('c', 'beginner'), makePlayer('d', 'beginner'),
      makePlayer('e', 'beginner'), makePlayer('f', 'intermediate'),
      makePlayer('g', 'advanced'), makePlayer('h', 'beginner'),
    ]
    const draft = generateTeamDraft(players, [])
    for (const team of draft) {
      const allBeginner = team.players.every((p) => p.skillTier === 'beginner')
      expect(allBeginner).toBe(false)
    }
  })

  it('handles all-same skill tier', () => {
    const players = Array.from({ length: 8 }, (_, i) => makePlayer(String(i), 'intermediate'))
    const draft = generateTeamDraft(players, [])
    assertNoDuplicates(draft)
    const total = draft.reduce((s, t) => s + t.players.length + (t.alternate ? 1 : 0), 0)
    expect(total).toBe(8)
  })

  it('handles odd pool size', () => {
    const players = Array.from({ length: 7 }, (_, i) =>
      makePlayer(String(i), (['beginner', 'intermediate', 'advanced'] as SkillTier[])[i % 3])
    )
    const draft = generateTeamDraft(players, [])
    assertNoDuplicates(draft)
    const total = draft.reduce((s, t) => s + t.players.length + (t.alternate ? 1 : 0), 0)
    expect(total).toBe(7)
  })

  it('handles a group of exactly 4 (no fill needed)', () => {
    const players = [
      makePlayer('a', 'advanced'), makePlayer('b', 'intermediate'),
      makePlayer('c', 'beginner'), makePlayer('d', 'intermediate'),
      makePlayer('e', 'advanced'), makePlayer('f', 'beginner'),
      makePlayer('g', 'intermediate'), makePlayer('h', 'beginner'),
    ]
    const groups: Group[] = [{ playerIds: ['a', 'b', 'c', 'd'] }]
    const draft = generateTeamDraft(players, groups)
    assertGroupsIntact(draft, groups, players)
    assertNoDuplicates(draft)
    for (const team of draft) {
      expect(team.players.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('handles no groups (all solos)', () => {
    const players = Array.from({ length: 8 }, (_, i) =>
      makePlayer(String(i), (['beginner', 'intermediate', 'advanced'] as SkillTier[])[i % 3])
    )
    const draft = generateTeamDraft(players, [])
    assertNoDuplicates(draft)
    const total = draft.reduce((s, t) => s + t.players.length + (t.alternate ? 1 : 0), 0)
    expect(total).toBe(8)
  })
})
