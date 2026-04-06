export default function GalleryPage() {
  return (
    <main className="px-4 py-8 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-6">Your generations</h1>
      {/* Gallery grid — wired in next step */}
      <div className="grid grid-cols-2 gap-3">
        <div className="aspect-square rounded-lg bg-neutral-100 animate-pulse" />
        <div className="aspect-square rounded-lg bg-neutral-100 animate-pulse" />
      </div>
    </main>
  )
}
