'use client'

import { useTransition } from 'react'
import { updateUserRole } from './role.actions'
import type { UserRole } from '@/lib/supabase/types'

const ROLE_LABELS: Record<UserRole, string> = {
  player: 'Player',
  drawmaster: 'Drawmaster',
  club_admin: 'Club Admin',
}

interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

interface Props {
  users: User[]
  currentUserId: string
}

export default function RoleManagementPanel({ users, currentUserId }: Props) {
  const [pending, startTransition] = useTransition()

  function handleRoleChange(userId: string, newRole: UserRole) {
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole)
      if (result?.error) alert(result.error)
    })
  }

  return (
    <section className="rounded-lg border p-6">
      <h2 className="mb-4 text-xl font-semibold">Role Management</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-zinc-500">
              <th className="pb-2 pr-4 font-medium">Name</th>
              <th className="pb-2 pr-4 font-medium">Email</th>
              <th className="pb-2 font-medium">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id} className="py-2">
                <td className="py-2 pr-4 font-medium">{user.name}</td>
                <td className="py-2 pr-4 text-zinc-500">{user.email}</td>
                <td className="py-2">
                  {user.id === currentUserId ? (
                    <span className="text-zinc-400">{ROLE_LABELS[user.role]} (you)</span>
                  ) : (
                    <select
                      value={user.role}
                      disabled={pending}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      className="rounded border px-2 py-1 text-sm disabled:opacity-50"
                    >
                      {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                        <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                      ))}
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
