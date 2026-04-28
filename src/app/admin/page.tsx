import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { UserRole, SeasonState } from '@/lib/supabase/types'
import SeasonStatePanel from './SeasonStatePanel'
import RoleManagementPanel from './RoleManagementPanel'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const profile = profileData as { role: UserRole } | null

  if (!profile || !['drawmaster', 'club_admin'].includes(profile.role)) {
    redirect('/portal')
  }

  const { data: seasonData } = await supabase
    .from('seasons')
    .select('id, state')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const season = seasonData as { id: string; state: SeasonState } | null

  const { data: usersData } = await supabase
    .from('profiles')
    .select('id, name, email, role')
    .order('name')

  const users = (usersData ?? []) as { id: string; name: string; email: string; role: UserRole }[]

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-8 text-3xl font-bold">Admin Dashboard</h1>
      <div className="flex flex-col gap-8">
        <SeasonStatePanel season={season} />
        <a
          href="/admin/directory"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
        >
          Player Directory →
        </a>
        {profile.role === 'club_admin' && (
          <RoleManagementPanel users={users} currentUserId={user.id} />
        )}
      </div>
    </main>
  )
}
