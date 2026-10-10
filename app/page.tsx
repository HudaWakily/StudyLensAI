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
    let cancelled = false

    async function getUser() {
      try {
        // getSession reads the saved session locally (no network request),
        // so it's much faster than getUser for deciding what to show.
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!cancelled) setUser(session?.user ?? null)
      } catch (err) {
        console.error('Auth check failed:', err)
      } finally {
        // Runs on success AND on error, so the page can never hang.
        if (!cancelled) setAuthLoading(false)
      }
    }

    getUser()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout failed:', error)
      return
    }

    // Clear the previous user's data from the screen
    setUser(null)
    setText('')
    setResult(null)
    setStudies([])
    setSelectedStudy(null)
    setSelectedVocabulary([])
    setError(null)
    setDeleteStudy(null)
    setSidebarOpen(false)
  }
  function handleNewStudy() {
    setText('')
    setResult(null)
    setSelectedStudy(null)
    setSelectedVocabulary([])
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
      {user && (
        <button
          onClick={() => setSidebarOpen((open) => !open)}
          className={`fixed top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-rule bg-surface text-ink shadow-sm transition-all duration-300 ease-in-out ${sidebarOpen ? 'left-[15rem]' : 'left-4'
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
      )}

      <main
        className={`min-h-screen ml-0 px-4 py-20 sm:px-6 md:py-16 transition-all duration-300 ease-in-out ${user && sidebarOpen ? 'md:ml-72' : 'md:ml-0'
          }`}
      >

        <div className="mx-auto w-full max-w-5xl">
          <h1 className="font-display text-5xl font-bold tracking-tight mb-2 text-stamp">
            StudyLens AI
          </h1>
          <p className="text-ink/70 mb-10">
            Paste your study text, choose your languages, and get a summary you can actually learn from.
          </p>

          {user ? (
            selectedStudy ? null : (
              <div className="border-b border-rule pb-8 mb-8">
                {/* keep your textarea, language selects and Process button exactly as they are */}
              </div>
            )
          ) : (
            <section className="border border-rule bg-surface rounded-2xl p-8 text-center">
              <h2 className="font-display text-2xl font-semibold mb-3">
                Try StudyLens AI
              </h2>

              <p className="text-muted mb-6 max-w-md mx-auto">
                See a sample result, or create a free account to use your own study material.
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href="/demo"
                  className="rounded-xl bg-highlighter text-white px-5 py-3 hover:bg-purple-700 transition"
                >
                  Try the demo
                </a>
                <a
                  href="/login"
                  className="rounded-xl border border-rule px-5 py-3 hover:bg-surface-soft transition"
                >
                  Log in
                </a>
                <a
                  href="/signup"
                  className="rounded-xl border border-rule px-5 py-3 hover:bg-surface-soft transition"
                >
                  Sign up
                </a>
              </div>

              {authLoading && (
                <p className="mt-6 text-sm text-muted">Checking your account...</p>
              )}
            </section>
          )}
          {error && (
            <p className="text-sm text-red-700">{error}</p>
          )}
          {user && selectedStudy && (
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
        </div>
      </main>
    </>
  )


}