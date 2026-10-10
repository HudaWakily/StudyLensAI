import Link from 'next/link'
import { demoStudy } from '@/lib/demoData'

export default function DemoPage() {
  return (
    <main className="min-h-screen px-4 py-16 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="font-display text-5xl font-bold tracking-tight mb-2 text-stamp">
          StudyLens AI
        </h1>

        <div className="mb-8 rounded-xl border border-rule bg-surface p-4 text-sm text-ink/80">
          This is a demo with sample data.{' '}
          <Link href="/signup" className="underline text-highlighter">
            Sign up
          </Link>{' '}
          to use your own study material.
        </div>

        <section className="mb-5 bg-surface border border-rule rounded-2xl p-6">
          <h3 className="font-display text-xl font-semibold mb-3 text-stamp">
            Original text (Português)
          </h3>
          <p className="text-ink/90">{demoStudy.inputText}</p>
        </section>

        <section className="mb-5 bg-surface border border-rule rounded-2xl p-6">
          <h3 className="font-display text-xl font-semibold mb-3 text-stamp">
            Summary
          </h3>
          <p className="text-ink/90">{demoStudy.summary}</p>
        </section>

        <section className="mb-5 bg-surface border border-rule rounded-2xl p-6">
          <h3 className="font-display text-xl font-semibold mb-3 text-stamp">
            Simple Explanation (فارسی)
          </h3>
          <p dir="rtl" className="text-ink/90">
            {demoStudy.simple_explanation}
          </p>
        </section>

        <section className="bg-surface border border-rule rounded-2xl p-6">
          <h3 className="font-display text-xl font-semibold mb-4 text-stamp">
            Key Vocabulary
          </h3>
          <div className="space-y-3">
            {demoStudy.vocabulary.map((v) => (
              <div
                key={v.word}
                className="flex items-center justify-between gap-4 border-b border-rule pb-3 last:border-b-0"
              >
                <span className="font-medium">{v.word}</span>
                <span className="text-muted">{v.translation}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}