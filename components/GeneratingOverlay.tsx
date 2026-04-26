import { Nav } from "./Nav";

export function GeneratingOverlay() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 bg-bg-subtle"
    >
      <Nav variant="secondary" />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 lg:px-20">
        <div className="flex w-full max-w-[552px] flex-col items-center gap-4 text-center">
          <svg
            className="h-8 w-8 animate-spin text-accent"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <p className="text-2xl font-medium leading-8 text-fg">
            Hang tight, we&rsquo;re putting together something special for your new space.
          </p>
          <p className="text-xs leading-4 text-fg-muted">
            This may take 1-3 minutes. Do not close this window.
          </p>
        </div>
      </div>
    </div>
  );
}
