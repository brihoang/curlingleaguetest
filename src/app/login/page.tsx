import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-3xl font-bold">Sign In</h1>
        <LoginForm />
      </div>
    </main>
  )
}
