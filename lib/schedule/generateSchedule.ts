export interface Team {
  id: string
  name: string
}

export interface Game {
  homeTeamId: string
  awayTeamId: string
  sheet: number
}

export interface Draw {
  weekNumber: number
  games: Game[]
  byeTeamIds: string[]
}

export interface Schedule {
  draws: Draw[]
}

/**
 * Berger table (round-robin) for n teams.
 * Returns an array of rounds; each round is an array of [home, away] index pairs.
 * If n is odd, one team per round has a bye (represented as index n-1 paired with -1).
 */
function bergerRounds(n: number): Array<Array<[number, number]>> {
  const isOdd = n % 2 !== 0
  const count = isOdd ? n : n  // number of participants (odd adds a dummy)
  const effective = isOdd ? n + 1 : n
  const rounds: Array<Array<[number, number]>> = []

  const seats = Array.from({ length: effective }, (_, i) => i)

  for (let round = 0; round < effective - 1; round++) {
    const pairs: Array<[number, number]> = []
    for (let i = 0; i < effective / 2; i++) {
      const home = seats[i]
      const away = seats[effective - 1 - i]
      pairs.push([home, away])
    }
    rounds.push(pairs)
    // Rotate: fix seat 0, rotate the rest
    const last = seats[effective - 1]
    for (let i = effective - 1; i > 1; i--) seats[i] = seats[i - 1]
    seats[1] = last
  }

  return rounds
}

export function generateSchedule(teams: Team[], sheets: number, weeks: number): Schedule {
  const n = teams.length
  if (n < 2) return { draws: [] }

  const roundRobinRounds = bergerRounds(n)
  const draws: Draw[] = []

  for (let week = 0; week < weeks; week++) {
    const round = roundRobinRounds[week % roundRobinRounds.length]
    const games: Game[] = []
    const byeTeamIds: string[] = []
    let sheetNum = 1

    for (const [homeIdx, awayIdx] of round) {
      const isOddBye = homeIdx >= n || awayIdx >= n
      if (isOddBye) {
        const realIdx = homeIdx < n ? homeIdx : awayIdx
        byeTeamIds.push(teams[realIdx].id)
        continue
      }
      if (sheetNum > sheets) {
        // More games than sheets — excess teams get a bye this draw
        byeTeamIds.push(teams[homeIdx].id, teams[awayIdx].id)
        continue
      }
      games.push({
        homeTeamId: teams[homeIdx].id,
        awayTeamId: teams[awayIdx].id,
        sheet: sheetNum++,
      })
    }

    draws.push({ weekNumber: week + 1, games, byeTeamIds })
  }

  return { draws }
}
