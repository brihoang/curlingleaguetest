import RegisterForm from './RegisterForm'

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-3xl font-bold">Create Account</h1>
        <RegisterForm />
      </div>
    </main>
  )
}
