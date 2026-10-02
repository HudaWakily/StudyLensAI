'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Account created! Check your email to confirm your account.')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen max-w-md mx-auto px-6 py-16">
      <h1 className="font-display text-4xl font-bold mb-2">
        Create Account
      </h1>

      <p className="text-muted mb-8">
        Create your StudyLens account.
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
          onClick={handleSignup}
          disabled={loading || !email || !password}
          className="w-full bg-highlighter text-white px-5 py-3 rounded-xl font-medium disabled:opacity-40"
        >
          {loading ? 'Creating account...' : 'Create Account'}
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