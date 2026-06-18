"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Reveal from "./Reveal";

const PRESETS: Array<{ name: string; desc: string }> = [
  { name: "Minimalist", desc: "Clean · light wood" },
  { name: "Warm Café", desc: "Warm wood · soft lamps" },
  { name: "Mid-Century", desc: "Walnut · ochre" },
  { name: "Japandi", desc: "Pale wood · stone" },
  { name: "Industrial", desc: "Concrete · steel" },
  { name: "Scandinavian", desc: "White oak · linen" },
];

// One commercial space, shown in every preset. The "after" swaps when a preset
// tab is selected (all preloaded for instant switching); the "before" stays
// pinned as a reference.
const BEFORE_SRC = "/landing/v2/space-before.jpeg";

const STYLE_VARIANTS: Array<{ name: string; after: string }> = [
  { name: "Industrial", after: "/landing/v2/space-industrial.jpeg" },
  { name: "Minimalist", after: "/landing/v2/space-minimalist.jpeg" },
  { name: "Scandinavian", after: "/landing/v2/space-scandinavian.jpeg" },
  { name: "Warm café", after: "/landing/v2/space-warmcafe.jpeg" },
  { name: "Mid-Century", after: "/landing/v2/space-midcentury.jpeg" },
  { name: "Japandi", after: "/landing/v2/space-japandi.jpeg" },
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

const ArrowUp = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    width="32"
    height="40"
    viewBox="0 0 32 40"
    fill="none"
    aria-hidden="true"
  >
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
  const [activePreset, setActivePreset] = useState(1);
  const [activeStyle, setActiveStyle] = useState(0);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      setActivePreset((i) => (i + 1) % PRESETS.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="bg-bg text-fg font-sans flex flex-col items-stretch min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-40 h-16 flex items-center justify-between bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/85 px-5 md:px-28 w-full border-b border-transparent">
        <Link href="/" className="text-[18px] font-bold tracking-[-0.36px]">
          Reframed
        </Link>
        <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex items-center gap-8 text-sm font-medium [&>a]:pointer-events-auto">
          <a
            href="#how-it-works"
            className="relative hover:text-fg-muted transition-colors after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-current after:transition-[width] after:duration-300 hover:after:w-full"
          >
            How it works
          </a>
          <a
            href="#pricing"
            className="relative hover:text-fg-muted transition-colors after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-current after:transition-[width] after:duration-300 hover:after:w-full"
          >
            Pricing
          </a>
          <Link
            href="/about"
            className="relative hover:text-fg-muted transition-colors after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-current after:transition-[width] after:duration-300 hover:after:w-full"
          >
            About
          </Link>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <Link
            href="/access/brew-r9k2"
            className="text-sm font-medium hover:text-fg-muted transition-colors"
          >
            Login
          </Link>
          <Link
            href="/access/brew-r9k2/signup"
            className="group bg-fg text-bg text-sm font-medium px-5 py-[11px] rounded-sm hover:bg-accent-hover transition-all duration-300 active:scale-[0.98]"
          >
            Sign up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-bg flex flex-col items-center gap-10 pt-20 md:pt-20 px-6 md:px-24 w-full">
        <div className="order-2 md:order-1 flex flex-col items-center gap-6 w-full">
          <Reveal as="div" className="w-full flex justify-center">
            <h1 className="text-[24px] md:text-[48px] font-semibold leading-tight text-center max-w-[920px]">
              Turn your empty space into a<br className="hidden md:block" /> co-working
              coffee shop.
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <Link
              href="/access/brew-r9k2/signup"
              className="group bg-fg text-bg text-[15px] font-medium inline-flex items-center gap-2 px-[26px] py-[14px] rounded-sm hover:bg-accent-hover transition-all duration-300 hover:shadow-md active:scale-[0.98]"
            >
              Try for free
              <span className="inline-flex transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRight />
              </span>
            </Link>
          </Reveal>
        </div>
        {/* Mobile hero image */}
        <Reveal
          delay={260}
          className="order-1 md:hidden w-[286px]"
        >
          <div className="relative w-[286px] aspect-[286/336] rounded-t-2xl border border-b-0 border-[#d4d4d4] overflow-hidden">
            <Image
              src="/landing/v2/hero-app-mobile.png"
              alt="Reframed gallery preview"
              fill
              sizes="286px"
              className="object-cover object-top"
              priority
            />
          </div>
        </Reveal>
        {/* Desktop hero image */}
        <Reveal
          delay={260}
          className="hidden md:block order-2 w-full max-w-[1249px]"
        >
          <div className="relative w-full aspect-[1249/490] rounded-t-2xl border border-b-0 border-border overflow-hidden shadow-md">
            <Image
              src="/landing/v2/hero-app.png"
              alt="Reframed gallery preview"
              fill
              sizes="(max-width: 1249px) 100vw, 1249px"
              className="object-cover object-top"
              priority
            />
          </div>
        </Reveal>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="flex flex-col gap-10 px-6 md:px-24 py-20 md:py-24 w-full"
      >
        <Reveal className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-[24px] md:text-[40px] font-semibold">How it works</h2>
          <p className="text-[18px] md:text-[24px] text-fg">
            Crafted by AI using a blend of six unique presets.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 01 */}
          <Reveal delay={0} className="flex flex-col gap-6">
            <div className="bg-bg border-[1.5px] border-dashed border-border breath h-[300px] rounded-sm flex flex-col items-center justify-center gap-2 text-fg-muted">
              <span className="bob">
                <ArrowUp />
              </span>
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
          </Reveal>

          {/* Step 02 */}
          <Reveal delay={120} className="flex flex-col gap-6">
            <div className="bg-bg flex flex-col gap-2 h-[300px] p-4 rounded-sm overflow-hidden">
              {PRESETS.map((p, i) => {
                const isActive = i === activePreset;
                return (
                  <div
                    key={p.name}
                    className={
                      "fade-swap flex items-center justify-between h-10 px-[14px] py-[10px] rounded-md border " +
                      (isActive
                        ? "bg-[#14110e] border-[#14110e] opacity-100"
                        : "bg-[#f4f0ea] border-[rgba(20,17,14,0.12)] opacity-50")
                    }
                  >
                    <span
                      className={
                        "fade-swap text-[13px] " +
                        (isActive ? "text-[#fbf8f3]" : "text-[#14110e]")
                      }
                    >
                      {p.name}
                    </span>
                    <span
                      className={
                        "fade-swap text-[11px] " +
                        (isActive
                          ? "text-[rgba(251,248,243,0.6)]"
                          : "text-[#6b635a]")
                      }
                    >
                      {p.desc}
                    </span>
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
          </Reveal>

          {/* Step 03 */}
          <Reveal delay={240} className="flex flex-col gap-6">
            <div className="relative h-[300px] rounded-sm overflow-hidden">
              <Image
                src="/landing/v2/step-3-cafe.png"
                alt="AI-generated café reframe"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover ken-burns"
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
          </Reveal>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="flex justify-center px-6 md:px-24 py-20 w-full"
      >
        <div className="flex flex-col items-center gap-10 w-full">
          <Reveal className="flex flex-col items-center gap-4 text-center max-w-[760px]">
            <h2 className="text-[24px] md:text-[40px] font-semibold">
              Simple pricing, no extra fees
            </h2>
            <p className="text-[18px] md:text-[24px]">
              Get 3 free credits each month—one credit lets you upload one file!
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-[816px]">
            {/* Free */}
            <Reveal
              delay={80}
              className="bg-bg border border-border-strong rounded-sm flex flex-col gap-6 px-10 py-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
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
                href="/access/brew-r9k2/signup"
                className="group bg-fg text-bg text-[15px] font-medium inline-flex items-center justify-center gap-2 px-[26px] py-[14px] rounded-sm hover:bg-accent-hover transition-all duration-300 active:scale-[0.98] w-full"
              >
                Try for free
                <span className="inline-flex transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRight />
                </span>
              </Link>
            </Reveal>

            {/* Pro (Coming soon) */}
            <Reveal
              delay={180}
              className="bg-bg border border-border rounded-sm flex flex-col gap-6 px-10 py-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
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
            </Reveal>
          </div>
        </div>
      </section>

      {/* See your space in every style — interactive preset switcher */}
      <section className="flex flex-col gap-8 md:gap-10 px-6 md:px-24 py-20 w-full">
        <Reveal className="flex flex-col gap-3 md:gap-4">
          <h2 className="text-[24px] md:text-[40px] font-semibold leading-tight text-[#14110e]">
            See your space in every style
          </h2>
          <p className="text-[18px] md:text-[24px] text-[rgba(20,17,14,0.5)]">
            Try out each preset for this commercial space.
          </p>
        </Reveal>

        {/* Preset tabs — horizontal scroll on mobile, wrap on desktop */}
        <div className="flex gap-2 md:gap-3 overflow-x-auto -mx-6 px-6 pb-1 md:mx-0 md:px-0 md:flex-wrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {STYLE_VARIANTS.map((s, i) => {
            const active = i === activeStyle;
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => setActiveStyle(i)}
                aria-pressed={active}
                className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium leading-5 transition-colors ${
                  active
                    ? "bg-accent text-white"
                    : "border border-border bg-bg text-fg hover:border-border-strong"
                }`}
              >
                {s.name}
              </button>
            );
          })}
        </div>

        {/* Stage — after swaps with the selected preset; before pinned as inset */}
        <div className="relative w-full overflow-hidden rounded-xl aspect-[4/5] md:aspect-[1088/480]">
          {STYLE_VARIANTS.map((s, i) => (
            <Image
              key={s.name}
              src={s.after}
              alt={`Your space in ${s.name} style`}
              fill
              sizes="(max-width: 768px) 100vw, 1088px"
              priority={i === 0}
              className={`object-cover transition-opacity duration-500 ${
                i === activeStyle ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          {/* After + active style chips */}
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="bg-fg text-bg text-[12px] font-medium px-2 py-1 rounded-md">
              After
            </span>
            <span className="bg-bg border border-border text-fg text-[12px] font-medium px-2 py-1 rounded-md">
              {STYLE_VARIANTS[activeStyle].name}
            </span>
          </div>
          {/* Before reference inset */}
          <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 overflow-hidden rounded-lg border-2 border-white shadow-lg">
            <div className="relative w-[126px] h-[95px] md:w-[220px] md:h-[165px]">
              <Image
                src={BEFORE_SRC}
                alt="Before — your original space"
                fill
                sizes="220px"
                className="object-cover"
              />
              <span className="absolute left-2 top-2 bg-fg text-bg text-[12px] font-medium px-2 py-1 rounded-md">
                Before
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="flex flex-col items-center gap-10 px-6 md:px-28 py-20 w-full bg-gradient-to-b from-bg to-transparent">
        <Reveal>
          <h2 className="text-[24px] md:text-[40px] font-semibold text-center text-fg">
            Ready to dream up your new space?
          </h2>
        </Reveal>
        <Reveal delay={140}>
          <Link
            href="/access/brew-r9k2/signup"
            className="group bg-fg text-bg text-[15px] font-medium inline-flex items-center gap-2 px-[26px] py-[14px] rounded-sm hover:bg-accent-hover transition-all duration-300 hover:shadow-md active:scale-[0.98]"
          >
            Try for free
            <span className="inline-flex transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight />
            </span>
          </Link>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="bg-fg text-bg flex flex-col gap-6 px-6 md:px-24 py-12 w-full">
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
              <a
                href="#how-it-works"
                className="relative text-[14px] hover:opacity-80 after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-current after:transition-[width] after:duration-300 hover:after:w-full"
              >
                How it works
              </a>
              <a
                href="#pricing"
                className="relative text-[14px] hover:opacity-80 after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-current after:transition-[width] after:duration-300 hover:after:w-full"
              >
                Pricing
              </a>
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
