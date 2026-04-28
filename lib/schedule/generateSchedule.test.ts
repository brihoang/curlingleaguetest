import { describe, it, expect } from 'vitest'
import { generateSchedule, Team, Schedule } from './generateSchedule'

function makeTeams(n: number): Team[] {
  return Array.from({ length: n }, (_, i) => ({ id: String(i), name: `Team ${i}` }))
}

function gameCountPerTeam(schedule: Schedule, teams: Team[]): Map<string, number> {
  const counts = new Map(teams.map((t) => [t.id, 0]))
  for (const draw of schedule.draws) {
    for (const game of draw.games) {
      counts.set(game.homeTeamId, (counts.get(game.homeTeamId) ?? 0) + 1)
      counts.set(game.awayTeamId, (counts.get(game.awayTeamId) ?? 0) + 1)
    }
  }
  return counts
}

function byeCountPerTeam(schedule: Schedule, teams: Team[]): Map<string, number> {
  const counts = new Map(teams.map((t) => [t.id, 0]))
  for (const draw of schedule.draws) {
    for (const id of draw.byeTeamIds) {
      counts.set(id, (counts.get(id) ?? 0) + 1)
    }
  }
  return counts
}

describe('generateSchedule', () => {
  it('no team plays itself', () => {
    const teams = makeTeams(6)
    const schedule = generateSchedule(teams, 3, 5)
    for (const draw of schedule.draws) {
      for (const game of draw.games) {
        expect(game.homeTeamId).not.toBe(game.awayTeamId)
      }
    }
  })

  it('each draw has at most sheets games', () => {
    const teams = makeTeams(8)
    const sheets = 3
    const schedule = generateSchedule(teams, sheets, 7)
    for (const draw of schedule.draws) {
      expect(draw.games.length).toBeLessThanOrEqual(sheets)
    }
  })

  it('no team plays more than once per draw', () => {
    const teams = makeTeams(8)
    const schedule = generateSchedule(teams, 4, 7)
    for (const draw of schedule.draws) {
      const seen = new Set<string>()
      for (const game of draw.games) {
        expect(seen.has(game.homeTeamId)).toBe(false)
        expect(seen.has(game.awayTeamId)).toBe(false)
        seen.add(game.homeTeamId)
        seen.add(game.awayTeamId)
      }
    }
  })

  it('all sheet numbers are within [1, sheets]', () => {
    const teams = makeTeams(6)
    const sheets = 3
    const schedule = generateSchedule(teams, sheets, 5)
    for (const draw of schedule.draws) {
      for (const game of draw.games) {
        expect(game.sheet).toBeGreaterThanOrEqual(1)
        expect(game.sheet).toBeLessThanOrEqual(sheets)
      }
    }
  })

  it('byes distributed evenly (max difference of 1) for odd team count', () => {
    const teams = makeTeams(7)
    const schedule = generateSchedule(teams, 3, 7)
    const byeCounts = byeCountPerTeam(schedule, teams)
    const values = [...byeCounts.values()]
    const min = Math.min(...values)
    const max = Math.max(...values)
    expect(max - min).toBeLessThanOrEqual(1)
  })

  it('even team count produces no byes when sheets are sufficient', () => {
    const teams = makeTeams(6)
    const schedule = generateSchedule(teams, 3, 5)
    for (const draw of schedule.draws) {
      expect(draw.byeTeamIds.length).toBe(0)
    }
  })

  it('minimum viable: 2 teams, 1 sheet, 1 week', () => {
    const teams = makeTeams(2)
    const schedule = generateSchedule(teams, 1, 1)
    expect(schedule.draws).toHaveLength(1)
    expect(schedule.draws[0].games).toHaveLength(1)
    expect(schedule.draws[0].byeTeamIds).toHaveLength(0)
  })

  it('produces correct number of draws', () => {
    const teams = makeTeams(6)
    const schedule = generateSchedule(teams, 3, 8)
    expect(schedule.draws).toHaveLength(8)
    expect(schedule.draws.map((d) => d.weekNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('larger league: 8 teams, 4 sheets, 10 weeks', () => {
    const teams = makeTeams(8)
    const schedule = generateSchedule(teams, 4, 10)
    expect(schedule.draws).toHaveLength(10)
    for (const draw of schedule.draws) {
      expect(draw.games.length).toBeLessThanOrEqual(4)
      expect(draw.byeTeamIds.length).toBe(0)
    }
    // Each team should play in every draw (8 teams, 4 sheets = 4 games = 8 team slots, no byes)
    for (const draw of schedule.draws) {
      const playing = new Set([
        ...draw.games.map((g) => g.homeTeamId),
        ...draw.games.map((g) => g.awayTeamId),
      ])
      expect(playing.size).toBe(8)
    }
  })
})
