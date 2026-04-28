'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { SeasonState } from '@/lib/supabase/types'

const VALID_TRANSITIONS: Record<SeasonState, SeasonState | null> = {
  registration_open: 'teams_finalized',
  teams_finalized: 'season_active',
  season_active: 'season_complete',
  season_complete: null,
}

export async function advanceSeasonState(seasonId: string, currentState: SeasonState) {
  const nextState = VALID_TRANSITIONS[currentState]
  if (!nextState) return { error: 'Season is already complete' }

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', (await supabase.auth.getUser()).data.user?.id ?? '')
    .single()

  if (!profile || !['drawmaster', 'club_admin'].includes(profile.role)) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('seasons')
    .update({ state: nextState })
    .eq('id', seasonId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
}
