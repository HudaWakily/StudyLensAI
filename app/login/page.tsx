'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      router.push('/')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen max-w-md mx-auto px-6 py-16">
      <h1 className="font-display text-4xl font-bold mb-2">
        Welcome Back
      </h1>

      <p className="text-muted mb-8">
        Log in to continue studying.
      </p>

      <div className="space-y-5">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full bg-surface border border-rule rounded-xl p-3"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full bg-surface border border-rule rounded-xl p-3"
        />

        <button
          onClick={handleLogin}
          disabled={loading || !email || !password}
          className="w-full bg-highlighter text-white px-5 py-3 rounded-xl font-medium disabled:opacity-40"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        {message && (
          <p className="text-sm text-muted">
            {message}
          </p>
        )}
      </div>
    </main>
  )
}