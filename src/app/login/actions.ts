'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type State = { error?: string } | null

export async function signIn(_prevState: State, formData: FormData): Promise<State> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  redirect('/portal')
}
