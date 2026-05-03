import Link from "next/link";
import Reveal from "@/components/landing/Reveal";

export const metadata = {
  title: "About · Reframed",
  description:
    "The designer, builder, and founder behind Reframed — and the daydream that became a tool.",
};

const PARAGRAPHS = [
  "Hello there! I'm Mirandy — the designer, builder, and founder behind Reframed. My story starts where so many remote workers' stories do: hunched over a laptop in a coffee shop that wasn't quite right. The table was too small, the Wi-Fi kept dropping, and the only outlet was inconveniently located behind a potted plant. Sound familiar?",
  "As someone who has fully embraced the digital nomad lifestyle, I've spent years working from coffee shops, co-working spaces, and everything in between — across cities, time zones, and countless cups of coffee. And through all of that wandering, I kept running into the same frustration: there was no easy way to find a space that actually *worked* for the way I work. Not just a place with decent espresso, but a place with tables big enough for a second monitor, lighting that doesn't give you a headache by noon, background noise at just the right level, and internet speeds that won't let you down mid-Zoom call.",
  "That daydream — of vacant storefronts and empty commercial spaces transformed into thriving, human-centered places to work and connect — is what became Reframed. Using the power of AI image generation, Reframed takes underutilized spaces and reimagines them as the co-working coffee havens they could be: warm lighting, communal tables, the smell of fresh espresso, and the quiet hum of people doing their best work. I wanted to build something that didn't just show what these spaces are, but revealed what they could be — a tool for dreamers, designers, urban planners, and remote workers alike who believe that great work deserves a great environment.",
  "To bring it to life, I used Claude Code along with other tools to help me move fast and build smart — turning a vision that had been living in my notes app into something real and usable. It's been an exciting, humbling, and genuinely fun process.",
  "Right now, we're in the beta testing phase, which means everything is still a little fresh and we're actively shaping what Reframed becomes. That's where *you* come in. Your feedback — the good, the bad, the \"why isn't this a feature yet?\" — is exactly what we need to refine this into something truly great. We're so glad you're here early, and we can't wait to hear what you think.",
];

function renderEmphasis(text: string) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function AboutPage() {
  return (
    <div className="bg-bg text-fg font-sans flex flex-col items-stretch min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-40 h-16 flex items-center justify-between bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/85 px-5 md:px-28 w-full border-b border-transparent">
        <Link href="/" className="text-[18px] font-bold tracking-[-0.36px]">
          Reframed
        </Link>
        <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex items-center gap-8 text-sm font-medium [&>a]:pointer-events-auto">
          <Link
            href="/#how-it-works"
            className="relative hover:text-fg-muted transition-colors after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-current after:transition-[width] after:duration-300 hover:after:w-full"
          >
            How it works
          </Link>
          <Link
            href="/#pricing"
            className="relative hover:text-fg-muted transition-colors after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-current after:transition-[width] after:duration-300 hover:after:w-full"
          >
            Pricing
          </Link>
          <Link
            href="/about"
            aria-current="page"
            className="relative hover:text-fg-muted transition-colors after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:bg-current"
          >
            About
          </Link>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <Link
            href="/coming-soon"
            className="text-sm font-medium hover:text-fg-muted transition-colors"
          >
            Login
          </Link>
          <Link
            href="/coming-soon"
            className="group bg-fg text-bg text-sm font-medium px-5 py-[11px] rounded-sm hover:bg-accent-hover transition-all duration-300 active:scale-[0.98]"
          >
            Sign up
          </Link>
        </div>
      </nav>

      {/* About content */}
      <section className="bg-bg flex flex-col items-center px-6 md:px-24 py-20 md:py-20 w-full">
        <div className="flex flex-col gap-6 w-full max-w-[448px]">
          <Reveal>
            <h1 className="text-[16px] font-semibold text-fg">About</h1>
          </Reveal>
          <div className="flex flex-col gap-5 text-[14px] uppercase font-medium text-[#444] leading-[20px]">
            {PARAGRAPHS.map((p, i) => (
              <Reveal key={i} delay={i * 80}>
                <p>{renderEmphasis(p)}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-fg text-bg flex flex-col gap-6 px-6 md:px-24 py-12 w-full mt-auto">
        <div className="flex flex-col md:flex-row gap-12 md:gap-[600px] md:justify-between items-start">
          <div className="flex flex-col gap-3 max-w-[442px]">
            <p className="text-[18px] font-bold tracking-[-0.36px]">Reframed</p>
            <p className="text-[18px]">
              Transform vacant commercial areas into vibrant co-working coffee
              havens.
            </p>
          </div>
          <div className="flex gap-14">
            <div className="flex flex-col gap-3 whitespace-nowrap">
              <p className="text-[12px] font-medium tracking-[0.36px]">PRODUCT</p>
              <Link
                href="/#how-it-works"
                className="relative text-[14px] hover:opacity-80 after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-current after:transition-[width] after:duration-300 hover:after:w-full"
              >
                How it works
              </Link>
              <Link
                href="/#pricing"
                className="relative text-[14px] hover:opacity-80 after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-current after:transition-[width] after:duration-300 hover:after:w-full"
              >
                Pricing
              </Link>
            </div>
            <div className="flex flex-col gap-3 whitespace-nowrap">
              <p className="text-[12px] font-medium tracking-[0.36px]">COMPANY</p>
              <Link
                href="/about"
                className="relative text-[14px] hover:opacity-80 after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-current after:transition-[width] after:duration-300 hover:after:w-full"
              >
                About
              </Link>
            </div>
          </div>
        </div>
        <div className="bg-bg h-px w-full" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-[12px]">
          <p>© 2026 Mirandy Design Studio · Brewed with care</p>
          <p>Mockups, not blueprints — consult a licensed designer</p>
        </div>
      </footer>
    </div>
  );
}
