'use client'

import { useState, useEffect } from 'react'
import type { ProcessResult, Study } from '@/types'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/Sidebar'

const LANGUAGES = [
  { code: 'pt', label: 'Português' },
  { code: 'fa', label: 'فارسی' },
  { code: 'en', label: 'English' },
]

export default function HomePage() {
  const supabase = createClient()
  const [text, setText] = useState('')
  const [sourceLanguage, setSourceLanguage] = useState('pt')
  const [targetLanguage, setTargetLanguage] = useState('fa')
  const [result, setResult] = useState<ProcessResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [studies, setStudies] = useState<Study[]>([])
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null)
  const [selectedVocabulary, setSelectedVocabulary] = useState<
    { word: string; translation: string }[]
  >([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [deleteStudy, setDeleteStudy] = useState<Study | null>(null)

  useEffect(() => {
    if (!user) return

    async function loadStudies() {
      try {
        const response = await fetch('/api/studies')

        if (!response.ok) {
          throw new Error('Failed to load studies')
        }

        const data = await response.json()

        setStudies(data.studies)
      } catch (err) {
        console.error(err)
      }
    }

    loadStudies()
  }, [user])

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUser(user)
      setAuthLoading(false)
    }

    getUser()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
  }
  function handleNewStudy() {
    setText('')
    setResult(null)
    setSelectedStudy(null)
    setError(null)
  }
  async function loadStudy(studyId: string) {
    try {
      const response = await fetch(`/api/studies/${studyId}`)

      if (!response.ok) {
        throw new Error('Failed to load study')
      }

      const data = await response.json()

      setSelectedStudy(data.study)
      setSelectedVocabulary(data.vocabulary)
    } catch (err) {
      console.error(err)
    }
  }
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

      setStudies((currentStudies) => [
        data.study,
        ...currentStudies,
      ])

      setSelectedStudy(data.study)
      setSelectedVocabulary(data.result.vocabulary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteStudy(study: Study) {
    try {
      const response = await fetch(`/api/studies/${study.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? 'Failed to delete study')
      }

      setStudies((currentStudies) =>
        currentStudies.filter((item) => item.id !== study.id)
      )

      if (selectedStudy?.id === study.id) {
        setSelectedStudy(null)
        setSelectedVocabulary([])
        setResult(null)
      }

      setDeleteStudy(null)
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete study'
      )
    }
  }

  function openDeleteModal(study: Study) {
    setDeleteStudy(study)
  }
  return (
    <>
      {user && !authLoading && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          aria-hidden="true"
        />
      )}

      {user && !authLoading && (
        <Sidebar
          studies={studies}
          userEmail={user.email ?? ''}
          onNewStudy={handleNewStudy}
          onLogout={handleLogout}
          onSelectStudy={(study) => loadStudy(study.id)}
          onDeleteStudy={openDeleteModal}
          isOpen={sidebarOpen}
          selectedStudyId={selectedStudy?.id ?? null}
        />
      )}
      <button
        onClick={() => setSidebarOpen((open) => !open)}
        className={`fixed top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-rule bg-surface text-ink shadow-sm transition-all duration-300 ease-in-out hover:bg-surface-soft ${sidebarOpen ? 'left-[15rem]' : 'left-4'
          }`}
        aria-label="Toggle sidebar"
      >
        <span
          className={`text-xl transition-transform duration-300 ${sidebarOpen ? 'rotate-90' : 'rotate-0'
            }`}
        >
          {sidebarOpen ? '×' : '☰'}
        </span>
      </button>
      {user && !authLoading && (
        <Sidebar
          studies={studies}
          userEmail={user.email ?? ''}
          onNewStudy={handleNewStudy}
          onLogout={handleLogout}
          onSelectStudy={(study) => loadStudy(study.id)}
          onDeleteStudy={openDeleteModal}
          isOpen={sidebarOpen}
          selectedStudyId={selectedStudy?.id ?? null}
        />
      )}

      <main className="min-h-screen ml-72 px-6 py-16">
        <div className="flex items-center gap-3">

        </div>
        <h1 className="font-display text-5xl font-bold tracking-tight mb-2 text-stamp">
          StudyLens AI
        </h1>
        <p className="text-ink/70 mb-10">
          Paste your study text, choose your languages, and get a summary you can actually learn from.
        </p>

        {authLoading ? (
          <div className="py-16 text-center">
            <p className="text-muted">Checking your account...</p>
          </div>
        ) : user ? (
          selectedStudy ? null : (
            <div className="border-b border-rule pb-8 mb-8">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your study text here..."
                rows={8}
                className="w-full min-h-52 bg-surface border border-rule rounded-2xl p-4 mb-6 text-ink placeholder:text-muted focus:outline-none focus:border-highlighter transition"
              />

              <div className="flex gap-8 mb-6">
                <div className="flex-1">
                  <label className="block text-sm text-ink/60 mb-1">
                    Text is in
                  </label>

                  <select
                    value={sourceLanguage}
                    onChange={(e) => setSourceLanguage(e.target.value)}
                    className="w-full bg-transparent border-b border-rule py-1 focus:outline-none focus:border-ink"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-sm text-ink/60 mb-1">
                    Explain in
                  </label>

                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="w-full bg-transparent border-b border-rule py-1 focus:outline-none focus:border-ink"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleProcess}
                disabled={loading || text.trim().length === 0}
                className="bg-highlighter text-white px-7 py-3 rounded-xl font-medium hover:bg-purple-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Process'}
              </button>
            </div>
          )
        ) : (
          <section className="border border-rule bg-surface rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">🔒</div>

            <h2 className="font-display text-2xl font-semibold mb-3">
              Login required
            </h2>

            <p className="text-muted mb-6 max-w-md mx-auto">
              Please log in or create an account to use StudyLens AI.
            </p>

            <div className="flex justify-center gap-3">
              <a
                href="/login"
                className="rounded-xl border border-rule px-5 py-3 hover:bg-surface-soft transition"
              >
                Log in
              </a>

              <a
                href="/signup"
                className="rounded-xl bg-highlighter text-white px-5 py-3 hover:bg-purple-700 transition"
              >
                Sign up
              </a>
            </div>
          </section>
        )}

        {error && (
          <p className="text-sm text-red-700">{error}</p>
        )}
        {selectedStudy && (

          <section className="mt-8 space-y-5">
            <div>
              <h2 className="font-display text-2xl font-semibold">
                {selectedStudy.title ?? 'My Study'}
              </h2>

              <p className="mt-1 text-sm text-muted">
                {selectedStudy.source_language} → {selectedStudy.target_language}
              </p>
            </div>

            <section className="bg-surface border border-rule rounded-2xl p-6">
              <h3 className="font-display text-xl font-semibold mb-3 text-stamp">
                Summary
              </h3>

              <p className="text-ink/90">
                {selectedStudy.summary}
              </p>
            </section>

            <section className="bg-surface border border-rule rounded-2xl p-6">
              <h3 className="font-display text-xl font-semibold mb-3 text-stamp">
                Simple Explanation
              </h3>

              <p className="text-ink/90">
                {selectedStudy.simple_explanation}
              </p>
            </section>

            {selectedVocabulary.length > 0 && (
              <section className="bg-surface border border-rule rounded-2xl p-6">
                <h3 className="font-display text-xl font-semibold mb-4 text-stamp">
                  Key Vocabulary
                </h3>

                <div className="space-y-3">
                  {selectedVocabulary.map((vocabulary) => (
                    <div
                      key={vocabulary.word}
                      className="flex items-center justify-between gap-4 border-b border-rule pb-3 last:border-b-0"
                    >
                      <span className="font-medium">
                        {vocabulary.word}
                      </span>

                      <span className="text-muted">
                        {vocabulary.translation}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </section>

        )}

        {result && (
          <div className="space-y-5">
            <section className="bg-surface border border-rule rounded-2xl p-6">
              <h2 className="font-display text-xl font-semibold mb-3 text-stamp">Summary</h2>
              <p className="text-ink/90">{result.summary}</p>
            </section>

            <section className="bg-surface border border-rule rounded-2xl p-6">
              <h2 className="font-display text-xl font-semibold mb-3 text-stamp">Simple Explanation</h2>
              <p className="text-ink/90">{result.simpleExplanation}</p>
            </section>

            <section className="bg-surface border border-rule rounded-2xl p-6">
              <h2 className="font-display text-xl font-semibold mb-3 text-stamp">Key Vocabulary</h2>
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
        {deleteStudy && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
            onClick={() => setDeleteStudy(null)}
          >
            <div
              className="w-full max-w-md rounded-2xl border border-rule bg-surface p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-xl">
                🗑️
              </div>

              <h2 className="font-display text-xl font-semibold text-ink">
                Delete study?
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted">
                Are you sure you want to delete{' '}
                <span className="font-medium text-ink">
                  "{deleteStudy.title ?? 'My Study'}"
                </span>
                ? This action cannot be undone.
              </p>

              <div className="mt-7 flex justify-end gap-3">
                <button
                  onClick={() => setDeleteStudy(null)}
                  className="rounded-xl border border-rule px-4 py-2.5 text-sm font-medium transition hover:bg-surface-soft"
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleDeleteStudy(deleteStudy)}
                  className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )


}