'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function joinLeague(seasonId: string, preferredUserIds: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: season } = await supabase
    .from('seasons')
    .select('state')
    .eq('id', seasonId)
    .single()

  if (season?.state !== 'registration_open') {
    return { error: 'League registration is closed' }
  }

  const { error: regError } = await supabase
    .from('league_registrations')
    .insert({ user_id: user.id, season_id: seasonId })

  if (regError) return { error: regError.message }

  if (preferredUserIds.length > 0) {
    const prefs = preferredUserIds.map((preferred_user_id) => ({
      from_user_id: user.id,
      preferred_user_id,
      season_id: seasonId,
    }))
    const { error: prefError } = await supabase
      .from('teammate_preferences')
      .insert(prefs)
    if (prefError) return { error: prefError.message }
  }

  redirect('/portal')
}

export async function leaveLeague(seasonId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: season } = await supabase
    .from('seasons')
    .select('state')
    .eq('id', seasonId)
    .single()

  if (season?.state !== 'registration_open') {
    return { error: 'Cannot leave after registration has closed' }
  }

  await supabase
    .from('teammate_preferences')
    .delete()
    .eq('from_user_id', user.id)
    .eq('season_id', seasonId)

  await supabase
    .from('league_registrations')
    .delete()
    .eq('user_id', user.id)
    .eq('season_id', seasonId)

  revalidatePath('/league/join')
}

export async function searchPlayers(query: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  if (query.trim().length < 2) return []

  const { data } = await supabase
    .from('profiles')
    .select('id, name, skill_tier')
    .ilike('name', `%${query}%`)
    .neq('id', user.id)
    .limit(8)

  return data ?? []
}
