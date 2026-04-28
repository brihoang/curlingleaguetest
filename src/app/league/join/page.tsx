import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import JoinLeagueForm from './JoinLeagueForm'

export default async function LeagueJoinPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: season } = await supabase
    .from('seasons')
    .select('id, state')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!season) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">No active season found.</p>
      </main>
    )
  }

  if (season.state !== 'registration_open') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">League registration is currently closed.</p>
      </main>
    )
  }

  const { data: registration } = await supabase
    .from('league_registrations')
    .select('id')
    .eq('user_id', user.id)
    .eq('season_id', season.id)
    .single()

  return (
    <main className="mx-auto max-w-lg p-8">
      <h1 className="mb-2 text-3xl font-bold">Join the League</h1>
      <p className="mb-8 text-zinc-500">
        Registration is open. Select up to 4 preferred teammates — they'll be guaranteed on your team.
      </p>
      <JoinLeagueForm
        seasonId={season.id}
        isRegistered={!!registration}
      />
    </main>
  )
}
