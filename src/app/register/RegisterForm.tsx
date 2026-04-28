'use client'

import { useActionState } from 'react'
import { registerUser } from './actions'
import Link from 'next/link'

const SKILL_TIERS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
] as const

type State = { error?: string } | null

export default function RegisterForm() {
  const [state, action, pending] = useActionState<State, FormData>(registerUser, null)

  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">Full Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

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
          minLength={8}
          className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="phone" className="text-sm font-medium">
          Phone <span className="text-zinc-400">(optional)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="skill_tier" className="text-sm font-medium">Skill Level</label>
        <select
          id="skill_tier"
          name="skill_tier"
          required
          defaultValue=""
          className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="" disabled>Select your level</option>
          {SKILL_TIERS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {pending ? 'Creating account…' : 'Create Account'}
      </button>

      <p className="text-center text-sm text-zinc-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-black underline">Sign in</Link>
      </p>
    </form>
  )
}
