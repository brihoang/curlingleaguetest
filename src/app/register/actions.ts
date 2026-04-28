'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { SkillTier } from '@/lib/supabase/types'

type State = { error?: string } | null

export async function registerUser(_prevState: State, formData: FormData): Promise<State> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string | null
  const skillTier = formData.get('skill_tier') as SkillTier

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error || !data.user) {
    return { error: error?.message ?? 'Sign up failed' }
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
    name,
    email,
    phone: phone || null,
    skill_tier: skillTier,
  })

  if (profileError) {
    return { error: profileError.message }
  }

  redirect('/league/join')
}
