import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PlayerDirectory from './PlayerDirectory'

export default async function DirectoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['drawmaster', 'club_admin'].includes(profile.role as string)) {
    redirect('/portal')
  }

  const { data: players } = await supabase
    .from('profiles')
    .select('id, name, email, phone, skill_tier, role')
    .order('name')

  return (
    <main className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Player Directory</h1>
        <a href="/admin" className="text-sm text-zinc-500 hover:text-black">← Admin</a>
      </div>
      <PlayerDirectory players={players ?? []} />
    </main>
  )
}
