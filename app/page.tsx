"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Button } from "@/components/Button";
import {
  deleteItem,
  getItems,
  hasOnboarded,
  setArchived,
  updateTitle,
  type GalleryItem,
} from "@/lib/gallery";

export default function GalleryHomePage() {
  const router = useRouter();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [firstTime, setFirstTime] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [confirmProjectDelete, setConfirmProjectDelete] = useState<string | null>(null);

  useEffect(() => {
    setItems(getItems());
    setFirstTime(!hasOnboarded());
    setHydrated(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (menuId) {
        setMenuId(null);
        return;
      }
      if (confirmProjectDelete) {
        setConfirmProjectDelete(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuId, confirmProjectDelete]);

  useEffect(() => {
    if (!menuId) return;
    const onDown = () => setMenuId(null);
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [menuId]);

  const [filter, setFilter] = useState<"all" | "recent" | "archived">("all");

  const visibleItems = useMemo(() => {
    if (filter === "archived") return items.filter((i) => i.archived);
    if (filter === "recent") {
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      return items.filter((i) => {
        if (i.archived) return false;
        const t = new Date(i.date).getTime();
        return Number.isFinite(t) && t >= cutoff;
      });
    }
    return items;
  }, [items, filter]);

  const renderCard = (it: GalleryItem) => {
    const cover = it.versions[it.versions.length - 1]?.afterUrl ?? it.beforeUrl;
    const isEditing = editingId === it.id;
    const commitTitle = () => {
      const trimmed = draftTitle.trim();
      if (trimmed && trimmed !== it.title) {
        updateTitle(it.id, trimmed);
        setItems(getItems());
      }
      setEditingId(null);
    };
    return (
      <div key={it.id} className="text-left">
        <div className="group relative">
          <button
            type="button"
            onClick={() => router.push(`/project/${it.id}`)}
            className="block w-full text-left"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt={`${it.title} reframe`}
              className="aspect-square w-full rounded-lg border border-border object-cover"
            />
          </button>
          <div className="pointer-events-none absolute inset-0 rounded-lg bg-black/0 transition-colors group-hover:bg-black/30" />
          <button
            type="button"
            aria-label="Project options"
            onClick={(e) => {
              e.stopPropagation();
              setMenuId(menuId === it.id ? null : it.id);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="1.75" />
              <circle cx="12" cy="12" r="1.75" />
              <circle cx="19" cy="12" r="1.75" />
            </svg>
          </button>
          {menuId === it.id && (
            <div
              role="menu"
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute right-2 top-11 z-20 min-w-[140px] overflow-hidden rounded-md border border-border bg-bg shadow-md"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setArchived(it.id, !it.archived);
                  setMenuId(null);
                  setItems(getItems());
                }}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-bg-subtle"
              >
                {it.archived ? "Unarchive" : "Archive"}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuId(null);
                  setConfirmProjectDelete(it.id);
                }}
                className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-bg-subtle"
              >
                Delete project
              </button>
            </div>
          )}
        </div>
        {isEditing ? (
          <input
            autoFocus
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitTitle();
              } else if (e.key === "Escape") {
                setEditingId(null);
              }
            }}
            className="mt-2 w-full rounded-sm border border-border bg-bg px-1 py-0.5 text-lg leading-7 focus:border-accent focus:outline-none"
          />
        ) : (
          <div className="mt-2 flex items-center gap-1.5">
            <p className="truncate text-lg leading-7 text-fg">{it.title}</p>
            <button
              type="button"
              aria-label="Rename"
              onClick={() => {
                setEditingId(it.id);
                setDraftTitle(it.title);
              }}
              className="text-fg-muted hover:text-fg"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
              </svg>
            </button>
          </div>
        )}
        <p className="text-xs leading-4 text-fg-muted">
          {it.versions.length} {it.versions.length === 1 ? "version" : "versions"}
        </p>
      </div>
    );
  };

  if (hydrated && firstTime) {
    return (
      <div className="min-h-screen bg-bg-subtle">
        <Nav />
        <main className="w-full px-6 pt-10 pb-24 lg:px-20">
          <div className="flex max-w-[552px] flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-baseline gap-3 whitespace-nowrap">
                <h1 className="text-2xl font-medium leading-8 text-fg">Your gallery</h1>
                <p className="text-sm leading-5 text-fg-muted">0 uploads</p>
              </div>
              <div
                className="flex items-center gap-2 opacity-50 pointer-events-none"
                aria-hidden="true"
              >
                <span className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-2 text-[13px] font-medium leading-none text-white">
                  All
                </span>
                <span className="inline-flex items-center justify-center rounded-full border border-border bg-bg px-4 py-2 text-[13px] font-medium leading-none text-fg">
                  Recent
                </span>
                <span className="inline-flex items-center justify-center rounded-full border border-border bg-bg px-4 py-2 text-[13px] font-medium leading-none text-fg">
                  Archived
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start gap-6 rounded-lg bg-bg p-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-xl leading-7 text-fg">Get started for free</h2>
                <p className="text-sm leading-5 text-fg-muted">
                  Upload a photo of your retail commercial space to see your space transform into a coffee shop co-working space. You get 3 free credits per month.
                </p>
              </div>
              <Link
                href="/upload"
                className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-2 text-sm leading-5 text-white hover:bg-accent-hover"
              >
                Upload now
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-subtle">
      <Nav />
      <main className="w-full px-6 pt-10 pb-24 lg:px-20">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline gap-3 whitespace-nowrap">
              <h1 className="text-2xl font-medium leading-8 text-fg">Your gallery</h1>
              <p className="text-sm leading-5 text-fg-muted">
                {hydrated
                  ? `${visibleItems.length} ${filter === "archived" ? "project" : "upload"}${visibleItems.length === 1 ? "" : "s"}`
                  : "\u00a0"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {(["all", "recent", "archived"] as const).map((key) => {
                const active = filter === key;
                const label = key === "all" ? "All" : key === "recent" ? "Recent" : "Archived";
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    aria-pressed={active}
                    className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-[13px] font-medium leading-none transition-colors ${
                      active
                        ? "bg-accent text-white"
                        : "border border-border bg-bg text-fg hover:border-border-strong"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {hydrated && items.length === 0 ? (
            <div className="mt-10 flex flex-col items-center text-center">
              <h2 className="text-lg font-semibold">No reframes yet</h2>
              <p className="mt-2 max-w-sm text-sm text-fg-muted">
                Upload a photo of your space to see it in a new direction.
              </p>
              <Link href="/upload" className="mt-6">
                <Button>Upload a photo</Button>
              </Link>
            </div>
          ) : hydrated && visibleItems.length === 0 ? (
            <div className="mt-10 flex flex-col items-center text-center">
              <p className="text-sm text-fg-muted">
                {filter === "recent"
                  ? "Nothing in the last 30 days."
                  : "No archived projects."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-6">
              {visibleItems.map(renderCard)}
            </div>
          )}
        </div>
      </main>

      {confirmProjectDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-6"
          onClick={() => setConfirmProjectDelete(null)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-bg p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold">Delete this project?</h2>
            <p className="mt-2 text-sm text-fg-muted">This can&apos;t be undone.</p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmProjectDelete(null)}>
                Cancel
              </Button>
              <button
                type="button"
                onClick={() => {
                  const id = confirmProjectDelete;
                  deleteItem(id);
                  setConfirmProjectDelete(null);
                  setItems(getItems());
                }}
                className="inline-flex h-10 items-center rounded-md bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
