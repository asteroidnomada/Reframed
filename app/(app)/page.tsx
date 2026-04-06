// Dashboard — primary capture + generate flow
export default function DashboardPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] px-4 py-12">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Transform your space</h2>
          <p className="text-sm text-neutral-500">
            Upload a photo to get started.
          </p>
        </div>

        {/* Upload / capture zone — wired in next step */}
        <div className="border-2 border-dashed border-neutral-200 rounded-xl p-12 flex flex-col items-center gap-4 hover:border-neutral-400 transition-colors cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 3v10M5 8l5-5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 16h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-700">Upload a photo</p>
            <p className="text-xs text-neutral-400 mt-0.5">JPEG, PNG, HEIC up to 15 MB</p>
          </div>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
          />
        </div>
      </div>
    </main>
  )
}
