interface SpacePageProps {
  params: Promise<{ id: string }>
}

export default async function SpacePage({ params }: SpacePageProps) {
  const { id } = await params

  return (
    <main className="px-4 py-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Space</h1>
      <p className="text-sm text-neutral-500">ID: {id}</p>
      {/* Captures and generations list — wired in next step */}
    </main>
  )
}
