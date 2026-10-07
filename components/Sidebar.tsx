'use client'

import type { Study } from '@/types'

type SidebarProps = {
  studies: Study[]
  userEmail: string
  onNewStudy: () => void
  onLogout: () => void
  onSelectStudy: (study: Study) => void
  onDeleteStudy: (study: Study) => void
  isOpen: boolean
}

export default function Sidebar({
  studies,
  userEmail,
  onNewStudy,
  onLogout,
  onSelectStudy,
  onDeleteStudy,
  isOpen,
}: SidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-rule bg-surface px-4 py-5 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
    >

      {/* Logo */}
      <div className="mb-6 px-2">
        <h1 className="font-display text-xl font-bold text-stamp">
          StudyLens AI
        </h1>
      </div>

      {/* New Study */}
      <button
        onClick={onNewStudy}
        className="w-full rounded-xl border border-rule px-4 py-3 text-left text-sm font-medium transition hover:bg-surface-soft"
      >
        + New Study
      </button>

      {/* Studies */}
      <div className="mt-6 flex-1 overflow-y-auto">
        <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-muted">
          My Studies
        </p>

        {studies.length === 0 ? (
          <p className="px-2 text-sm text-muted">
            No studies yet
          </p>
        ) : (
          <div className="space-y-1">
            {studies.map((study) => (
              <div
                key={study.id}
                className="group flex items-center gap-1 rounded-xl transition hover:bg-surface-soft"
              >
                <button
                  onClick={() => onSelectStudy(study)}
                  className="min-w-0 flex-1 px-3 py-3 text-left"
                >
                  <p className="truncate text-sm font-medium">
                    {study.title ?? 'My Study'}
                  </p>

                  <p className="mt-1 truncate text-xs text-muted">
                    {study.summary ?? 'No summary'}
                  </p>
                </button>

                <button
                  onClick={() => onDeleteStudy(study)}
                  className="mr-2 rounded-lg p-2 text-muted opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                  aria-label={`Delete ${study.title ?? 'study'}`}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account */}
      <div className="border-t border-rule pt-4">
        <p className="mb-3 truncate px-2 text-sm text-muted">
          {userEmail}
        </p>

        <button
          onClick={onLogout}
          className="w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-surface-soft"
        >
          Log out
        </button>
      </div>
    </aside>
  )
}