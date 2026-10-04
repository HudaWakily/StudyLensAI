'use client'

import type { Study } from '@/types'

type SidebarProps = {
  studies: Study[]
  userEmail: string
  onNewStudy: () => void
  onLogout: () => void
}

export default function Sidebar({
  studies,
  userEmail,
  onNewStudy,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-rule bg-surface px-4 py-5">
      
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
              <button
                key={study.id}
                className="w-full rounded-xl px-3 py-3 text-left transition hover:bg-surface-soft"
              >
                <p className="truncate text-sm font-medium">
                  {study.title ?? 'My Study'}
                </p>

                <p className="mt-1 truncate text-xs text-muted">
                  {study.summary ?? 'No summary'}
                </p>
              </button>
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