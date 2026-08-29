export default function HomePage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">StudyLens AI</h1>
      <p className="text-gray-600 mb-8">
        Paste your study text, pick your languages, and get a summary.
      </p>

      <textarea
        placeholder="Paste your study text here..."
        rows={8}
        className="w-full border border-gray-300 rounded-lg p-3 mb-4"
      />

      <button className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium">
        Process
      </button>
    </main>
  )
}