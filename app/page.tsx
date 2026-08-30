'use client'
import { useState } from 'react'

const LANGUAGES = [
  { code: 'pt', label: 'Português' },
  { code: 'fa', label: 'فارسی' },
  { code: 'en', label: 'English' },
]


export default function HomePage() {
  const [text, setText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('pt')
  const [targetLanguage, setTargetLanguage] = useState('fa')
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">StudyLens AI</h1>
      <p className="text-gray-600 mb-8">
        Paste your study text, pick your languages, and get a summary.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your study text here..."
        rows={8}
        className="w-full border border-gray-300 rounded-lg p-3 mb-4"
      />

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">Text is in</label>
          <select
            value={sourceLanguage}
            onChange={(e) => setSourceLanguage(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">Explain in</label>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
        </div>
      </div>

      <button className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium">
        Process
      </button>
      <p className="mt-4 text-sm text-gray-500">
        You typed {text.length} characters
      </p>
    </main>
  )
}