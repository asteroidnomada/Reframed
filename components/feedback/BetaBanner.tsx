"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "reframed:beta-banner-dismissed";

type Props = {
  onOpenModal: () => void;
};

export default function BetaBanner({ onOpenModal }: Props) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    setHidden(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  if (hidden) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setHidden(true);
  };

  return (
    <div className="bg-accent text-white">
      <div className="flex items-center justify-between gap-4 px-6 py-3 lg:px-20">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold tracking-wide text-accent">
            BETA
          </span>
          <p className="truncate text-sm">
            You&apos;re using a pre-launch build — tell us what you think.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onOpenModal}
            className="group inline-flex items-center gap-1.5 text-sm font-semibold hover:opacity-90"
          >
            Submit feedback
            <span className="inline-block transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss banner"
            className="text-base leading-none hover:opacity-80"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
