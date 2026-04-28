import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">Curling League</h1>
      <div className="flex gap-4">
        <Link href="/login" className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800">
          Sign In
        </Link>
        <Link href="/register" className="rounded-md border px-4 py-2 hover:bg-zinc-50">
          Register
        </Link>
      </div>
    </main>
  )
}
