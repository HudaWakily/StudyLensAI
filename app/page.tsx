'use client'

import { useState } from 'react'
import type { ProcessResult } from '@/types'

const LANGUAGES = [
  { code: 'pt', label: 'Português' },
  { code: 'fa', label: 'فارسی' },
  { code: 'en', label: 'English' },
]

export default function HomePage() {
  const [text, setText] = useState('')
  const [sourceLanguage, setSourceLanguage] = useState('pt')
  const [targetLanguage, setTargetLanguage] = useState('fa')
  const [result, setResult] = useState<ProcessResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleProcess() {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sourceLanguage, targetLanguage }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? 'Something went wrong')
      }

      const data = await response.json()
      setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-xl mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl mb-1">StudyLens AI</h1>
      <p className="text-ink/70 mb-10">
        Paste your study text, choose your languages, and get a summary you can actually learn from.
      </p>

      <div className="border-b border-rule pb-8 mb-8">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your study text here..."
          rows={8}
          className="w-full bg-transparent border border-rule rounded-none p-3 mb-6 focus:outline-none focus:border-ink"
        />

        <div className="flex gap-8 mb-6">
          <div className="flex-1">
            <label className="block text-sm text-ink/60 mb-1">Text is in</label>
            <select
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
              className="w-full bg-transparent border-b border-rule py-1 focus:outline-none focus:border-ink"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm text-ink/60 mb-1">Explain in</label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full bg-transparent border-b border-rule py-1 focus:outline-none focus:border-ink"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleProcess}
          disabled={loading || text.trim().length === 0}
          className="bg-highlighter text-ink px-6 py-2.5 font-medium hover:brightness-95 transition disabled:opacity-40"
        >
          {loading ? 'Processing...' : 'Process'}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-700">{error}</p>
      )}

      {result && (
        <div className="space-y-8">
          <section>
            <h2 className="font-serif text-xl mb-2">Summary</h2>
            <p className="text-ink/90">{result.summary}</p>
          </section>

          <section>
            <h2 className="font-serif text-xl mb-2">Simple Explanation</h2>
            <p className="text-ink/90">{result.simpleExplanation}</p>
          </section>

          <section>
            <h2 className="font-serif text-xl mb-3">Key Vocabulary</h2>
            <ul className="space-y-2">
              {result.vocabulary.map((v, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-stamp font-medium">{v.word}</span>
                  <span className="text-ink/60">{v.translation}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </main>
  )
}