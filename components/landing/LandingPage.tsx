"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef } from "react";

const PRESETS: Array<{ name: string; desc: string; active?: boolean }> = [
  { name: "Minimalist", desc: "Clean · light wood" },
  { name: "Warm Café", desc: "Warm wood · soft lamps", active: true },
  { name: "Mid-Century", desc: "Walnut · ochre" },
  { name: "Japandi", desc: "Pale wood · stone" },
  { name: "Industrial", desc: "Concrete · steel" },
  { name: "Scandinavian", desc: "White oak · linen" },
];

const FEATURE_CARDS: Array<{
  before: string;
  after: string;
  alt: string;
  tag: string;
}> = [
  {
    before: "/landing/v2/feat-1-before.png",
    after: "/landing/v2/feat-1-after.png",
    alt: "Industrial co-working café reframe",
    tag: "Industrial",
  },
  {
    before: "/landing/v2/feat-2-before.png",
    after: "/landing/v2/feat-2-after.png",
    alt: "Warm café reframe",
    tag: "Warm Café",
  },
  {
    before: "/landing/v2/feat-3-before.png",
    after: "/landing/v2/feat-3-after.png",
    alt: "Minimalist reframe",
    tag: "Minimalist",
  },
];

const ArrowRight = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    width="15"
    height="15"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M3 8h10m0 0L9 4m4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path
      d="M2.5 7.5l3 3 6-7"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowUp = () => (
  <svg width="32" height="40" viewBox="0 0 32 40" fill="none" aria-hidden="true">
    <path
      d="M16 36V4M16 4 4 16M16 4l12 12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function LandingPage() {
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const scrollCarousel = useCallback((dir: 1 | -1) => {
    const el = carouselRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 16 : el.clientWidth;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  return (
    <div className="bg-bg text-fg font-sans flex flex-col items-stretch min-h-screen">
      {/* Nav */}
      <nav className="h-16 flex items-center justify-between px-5 md:px-28 w-full">
        <Link
          href="/"
          className="text-[18px] font-bold tracking-[-0.36px]"
        >
          Reframed
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#how-it-works" className="hover:text-fg-muted transition-colors">
            How it works
          </a>
          <a href="#pricing" className="hover:text-fg-muted transition-colors">
            Pricing
          </a>
          <a href="#about" className="hover:text-fg-muted transition-colors">
            About
          </a>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <Link
            href="/login"
            className="text-sm font-medium hover:text-fg-muted transition-colors"
          >
            Login
          </Link>
          <Link
            href="/login"
            className="bg-fg text-bg text-sm font-medium px-5 py-[11px] rounded-sm hover:bg-accent-hover transition-colors"
          >
            Sign up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-bg flex flex-col items-center gap-10 pt-20 md:pt-20 px-6 md:px-24 w-full">
        <div className="order-2 md:order-1 flex flex-col items-center gap-6 w-full">
          <h1 className="text-[24px] md:text-[48px] font-semibold leading-tight text-center max-w-[920px]">
            Turn your empty space into a<br className="hidden md:block" /> co-working
            coffee shop.
          </h1>
          <Link
            href="/login"
            className="bg-fg text-bg text-[15px] font-medium inline-flex items-center gap-2 px-[26px] py-[14px] rounded-sm hover:bg-accent-hover transition-colors"
          >
            Try for free
            <ArrowRight />
          </Link>
        </div>
        {/* Mobile hero image (cropped portrait crop) */}
        <div className="order-1 md:hidden relative w-[286px] aspect-[286/336] rounded-t-2xl border border-b-0 border-[#d4d4d4] overflow-hidden">
          <Image
            src="/landing/v2/hero-app-mobile.png"
            alt="Reframed gallery preview"
            fill
            sizes="286px"
            className="object-cover object-top"
            priority
          />
        </div>
        {/* Desktop hero image */}
        <div className="hidden md:block order-2 relative w-full max-w-[1249px] aspect-[1249/490] rounded-t-2xl border border-b-0 border-border overflow-hidden">
          <Image
            src="/landing/v2/hero-app.png"
            alt="Reframed gallery preview"
            fill
            sizes="(max-width: 1249px) 100vw, 1249px"
            className="object-cover object-top"
            priority
          />
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="flex flex-col gap-10 px-6 md:px-24 py-20 md:py-24 w-full"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-[24px] md:text-[40px] font-semibold">How it works</h2>
          <p className="text-[18px] md:text-[24px] text-fg">
            Crafted by AI using a blend of six unique presets.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 01 */}
          <div className="flex flex-col gap-6">
            <div className="bg-bg border-[1.5px] border-dashed border-border h-[300px] rounded-sm flex flex-col items-center justify-center gap-2 text-fg-muted">
              <ArrowUp />
              <p className="text-[11px] font-medium tracking-[0.88px]">
                DRAG PHOTO HERE
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-[16px] font-semibold text-fg-muted tracking-[0.48px]">
                STEP 01
              </p>
              <p className="text-[20px]">Upload a photo of your space</p>
            </div>
          </div>

          {/* Step 02 */}
          <div className="flex flex-col gap-6">
            <div className="bg-bg flex flex-col gap-2 h-[300px] p-4 rounded-sm overflow-hidden">
              {PRESETS.map((p) => {
                if (p.active) {
                  return (
                    <div
                      key={p.name}
                      className="bg-[#14110e] border border-[#14110e] flex items-center justify-between h-10 px-[14px] py-[10px] rounded-md"
                    >
                      <span className="text-[#fbf8f3] text-[13px]">{p.name}</span>
                      <span className="text-[11px] text-[rgba(251,248,243,0.6)]">
                        {p.desc}
                      </span>
                    </div>
                  );
                }
                return (
                  <div
                    key={p.name}
                    className="bg-[#f4f0ea] border border-[rgba(20,17,14,0.12)] flex items-center justify-between px-[14px] py-[10px] rounded-md opacity-50"
                  >
                    <span className="text-[#14110e] text-[13px]">{p.name}</span>
                    <span className="text-[#6b635a] text-[11px]">{p.desc}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-[16px] font-semibold text-fg-muted tracking-[0.48px]">
                STEP 02
              </p>
              <p className="text-[20px]">Choose a style preset</p>
            </div>
          </div>

          {/* Step 03 */}
          <div className="flex flex-col gap-6">
            <div className="relative h-[300px] rounded-sm overflow-hidden">
              <Image
                src="/landing/v2/step-3-cafe.png"
                alt="AI-generated café reframe"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
              <div className="absolute left-4 bottom-4 flex gap-2 items-center">
                <span className="bg-fg text-bg text-[12px] font-medium px-2 py-1 rounded-md">
                  After
                </span>
                <span className="bg-bg border border-border text-fg text-[12px] font-medium px-2 py-1 rounded-md">
                  Warm café
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-[16px] font-semibold text-fg-muted tracking-[0.48px]">
                STEP 03
              </p>
              <p className="text-[20px]">Let AI handle the rest</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="flex justify-center px-6 md:px-24 py-20 w-full"
      >
        <div className="flex flex-col items-center gap-10 w-full">
          <div className="flex flex-col items-center gap-4 text-center max-w-[760px]">
            <h2 className="text-[24px] md:text-[40px] font-semibold">
              Simple pricing, no extra fees
            </h2>
            <p className="text-[18px] md:text-[24px]">
              Get 3 free credits each month—one credit lets you upload one file!
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-[816px]">
            {/* Free */}
            <div className="bg-bg border border-border-strong rounded-sm flex flex-col gap-6 px-10 py-8">
              <p className="text-[16px]">Free</p>
              <div className="flex items-baseline gap-1 h-12">
                <span className="text-[28px] text-fg-faint">$</span>
                <span className="text-[40px] text-fg">0</span>
                <span className="text-[14px] text-fg-faint">/month</span>
              </div>
              <div className="bg-border h-px w-full" />
              <div className="grid grid-cols-2 gap-4 text-[14px]">
                <ul className="flex flex-col gap-3">
                  <li className="flex items-start gap-2">
                    <Check />
                    <span>3 credits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check />
                    <span>6 presets</span>
                  </li>
                </ul>
                <ul className="flex flex-col gap-3">
                  <li className="flex items-start gap-2">
                    <Check />
                    <span>1080p downloads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check />
                    <span>Watermark logo</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/login"
                className="bg-fg text-bg text-[15px] font-medium inline-flex items-center justify-center gap-2 px-[26px] py-[14px] rounded-sm hover:bg-accent-hover transition-colors w-full"
              >
                Try for free
                <ArrowRight />
              </Link>
            </div>

            {/* Pro (Coming soon) */}
            <div className="bg-bg border border-border rounded-sm flex flex-col gap-6 px-10 py-8">
              <p className="text-[16px]">Pro (Coming soon)</p>
              <div className="flex items-baseline gap-1 opacity-50">
                <span className="text-[28px] text-fg-muted">$</span>
                <span className="text-[40px] text-fg">29</span>
                <span className="text-[14px] text-fg-muted">/month</span>
              </div>
              <div className="bg-[rgba(20,17,14,0.12)] h-px w-full" />
              <div className="grid grid-cols-2 gap-4 text-[14px]">
                <ul className="flex flex-col gap-3">
                  <li className="flex items-start gap-2 text-[#14110e]">
                    <span className="text-[#6b4a2b]">
                      <Check />
                    </span>
                    <span>Unlimited credits</span>
                  </li>
                  <li className="flex items-start gap-2 text-[#14110e]">
                    <span className="text-[#6b4a2b]">
                      <Check />
                    </span>
                    <span>12 presets</span>
                  </li>
                </ul>
                <ul className="flex flex-col gap-3">
                  <li className="flex items-start gap-2 text-[#14110e]">
                    <span className="text-[#6b4a2b]">
                      <Check />
                    </span>
                    <span>4000p downloads</span>
                  </li>
                  <li className="flex items-start gap-2 text-[#14110e]">
                    <span className="text-[#6b4a2b]">
                      <Check />
                    </span>
                    <span>No watermark logo</span>
                  </li>
                </ul>
              </div>
              <button
                type="button"
                className="text-[14px] font-medium inline-flex items-center justify-center gap-2 px-5 py-[14px] rounded-sm w-full text-fg cursor-not-allowed"
                disabled
              >
                Join the waitlist →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features carousel */}
      <section className="flex flex-col gap-10 px-6 md:px-24 py-20 w-full overflow-hidden">
        <div className="flex flex-col gap-4">
          <h2 className="text-[24px] md:text-[40px] font-semibold leading-tight text-[#14110e]">
            Check out these reimagined<br />co-working coffee shops
          </h2>
          <p className="text-[18px] md:text-[24px] text-[rgba(20,17,14,0.5)]">
            Generated using Nano Banana 3
          </p>
        </div>
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-6 md:-mx-24 px-6 md:px-24 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {FEATURE_CARDS.map((card) => (
            <div
              key={card.alt}
              data-card
              className="flex gap-6 h-[400px] md:h-[500px] flex-shrink-0 w-[80vw] md:w-[624px] snap-start"
            >
              <div className="relative flex-1 overflow-hidden">
                <Image
                  src={card.before}
                  alt={`${card.alt} — before`}
                  fill
                  sizes="(max-width: 768px) 40vw, 300px"
                  className="object-cover"
                />
                <div className="absolute left-4 bottom-5 flex gap-2 items-center">
                  <span className="bg-fg text-bg text-[12px] font-medium px-2 py-1 rounded-md">
                    Before
                  </span>
                </div>
              </div>
              <div className="relative flex-1 overflow-hidden">
                <Image
                  src={card.after}
                  alt={`${card.alt} — after`}
                  fill
                  sizes="(max-width: 768px) 40vw, 300px"
                  className="object-cover"
                />
                <div className="absolute left-4 bottom-5 flex gap-2 items-center">
                  <span className="bg-fg text-bg text-[12px] font-medium px-2 py-1 rounded-md">
                    After
                  </span>
                  <span className="bg-bg border border-border text-fg text-[12px] font-medium px-2 py-1 rounded-md">
                    {card.tag}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={() => scrollCarousel(-1)}
            aria-label="Previous"
            className="bg-black text-white p-3 rounded-full hover:bg-accent-hover transition-colors"
          >
            <span className="block rotate-180">
              <ArrowRight className="text-white" />
            </span>
          </button>
          <button
            type="button"
            onClick={() => scrollCarousel(1)}
            aria-label="Next"
            className="bg-black text-white p-3 rounded-full hover:bg-accent-hover transition-colors"
          >
            <ArrowRight className="text-white" />
          </button>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="flex flex-col items-center gap-10 px-6 md:px-28 py-20 w-full bg-gradient-to-b from-bg to-transparent">
        <h2 className="text-[24px] md:text-[40px] font-semibold text-center text-fg">
          Ready to dream up your new space?
        </h2>
        <Link
          href="/login"
          className="bg-fg text-bg text-[15px] font-medium inline-flex items-center gap-2 px-[26px] py-[14px] rounded-sm hover:bg-accent-hover transition-colors"
        >
          Try for free
          <ArrowRight />
        </Link>
      </section>

      {/* Footer */}
      <footer
        id="about"
        className="bg-fg text-bg flex flex-col gap-6 px-6 md:px-24 py-12 w-full"
      >
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
              <a href="#how-it-works" className="text-[14px] hover:opacity-80">
                How it works
              </a>
              <a href="#" className="text-[14px] hover:opacity-80">
                Features
              </a>
              <a href="#pricing" className="text-[14px] hover:opacity-80">
                Pricing
              </a>
            </div>
            <div className="flex flex-col gap-3 whitespace-nowrap">
              <p className="text-[12px] font-medium tracking-[0.36px]">COMPANY</p>
              <a href="#" className="text-[14px] hover:opacity-80">
                About
              </a>
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
