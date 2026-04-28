'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/supabase/types'

export async function updateUserRole(targetUserId: string, newRole: UserRole) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  if (targetUserId === user.id) return { error: 'Cannot change your own role' }

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentProfile?.role !== 'club_admin') return { error: 'Unauthorized' }

  // Prevent removing the last admin
  if (newRole !== 'club_admin') {
    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'club_admin')

    if ((count ?? 0) <= 1) {
      const { data: target } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', targetUserId)
        .single()
      if (target?.role === 'club_admin') {
        return { error: 'Cannot remove the last club admin' }
      }
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', targetUserId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
}
