'use client'

import { useActionState } from 'react'
import { signIn } from './actions'
import Link from 'next/link'

type State = { error?: string } | null

export default function LoginForm() {
  const [state, action, pending] = useActionState<State, FormData>(signIn, null)

  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {pending ? 'Signing in…' : 'Sign In'}
      </button>

      <p className="text-center text-sm text-zinc-500">
        No account yet?{' '}
        <Link href="/register" className="font-medium text-black underline">Create one</Link>
      </p>
    </form>
  )
}
