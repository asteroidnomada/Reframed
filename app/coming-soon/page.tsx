import Link from "next/link";

export default function ComingSoonPage() {
  return (
    <div className="bg-bg text-fg font-sans min-h-screen flex flex-col">
      <nav className="sticky top-0 z-40 h-16 flex items-center justify-between bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/85 px-5 md:px-28 w-full">
        <Link href="/" className="text-[18px] font-bold tracking-[-0.36px]">
          Reframed
        </Link>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-[12px] font-medium tracking-[0.96px] text-fg-muted uppercase">
          Coming soon
        </p>
        <h1 className="text-[32px] md:text-[48px] font-semibold leading-tight max-w-[720px]">
          We&rsquo;re putting the finishing touches on Reframed.
        </h1>
        <p className="text-[18px] md:text-[20px] text-fg-muted max-w-[560px]">
          Sign-ups aren&rsquo;t open yet. Check back soon to turn your empty space
          into a co-working coffee shop.
        </p>
        <Link
          href="/"
          className="mt-2 text-[15px] font-medium underline underline-offset-4 hover:text-fg-muted transition-colors"
        >
          Back to home
        </Link>
      </main>
    </div>
  );
}
