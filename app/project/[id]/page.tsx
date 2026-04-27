"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import {
  deleteVersion,
  getItems,
  updateTitle,
  type GalleryItem,
} from "@/lib/gallery";

type View = { kind: "before" } | { kind: "version"; index: number };

const DISCLAIMER =
  "These images are AI-generated mockups and should not be used as final designs. Please consult a professional interior designer or architect to complete your renovation plans.";

const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [view, setView] = useState<View>({ kind: "before" });
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    const loaded = getItems();
    setItems(loaded);
    const it = loaded.find((i) => i.id === id);
    if (it && it.versions.length > 0) {
      setView({ kind: "version", index: it.versions.length - 1 });
    }
    setHydrated(true);
  }, [id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (confirmDelete !== null) {
        setConfirmDelete(null);
        return;
      }
      if (editingTitle) setEditingTitle(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmDelete, editingTitle]);

  const item = items.find((i) => i.id === id) ?? null;

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-bg-subtle">
        <Nav variant="secondary" backHref="/" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-bg-subtle">
        <Nav variant="secondary" backHref="/" />
        <main className="mx-auto w-full max-w-[552px] px-6 pt-10 pb-24 lg:px-0">
          <p className="text-sm leading-5 text-fg-muted">Project not found.</p>
        </main>
      </div>
    );
  }

  const hasVersions = item.versions.length > 0;
  const currentVersion =
    view.kind === "version" ? item.versions[view.index] ?? null : null;
  const currentImageUrl =
    view.kind === "before" ? item.beforeUrl : currentVersion?.afterUrl ?? item.beforeUrl;
  const versionLabel =
    view.kind === "before" ? "Before" : `After v${view.index + 1}`;
  const isAfterView = view.kind === "version" && currentVersion !== null;

  const commitTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== item.title) {
      updateTitle(item.id, trimmed);
      setItems(getItems());
    }
    setEditingTitle(false);
  };

  const onCreateNewVersion = () => {
    sessionStorage.setItem(
      "reframed:reframe",
      JSON.stringify({ itemId: item.id, imageUrl: item.beforeUrl })
    );
    router.push("/direction");
  };

  const onDownload = () => {
    const a = document.createElement("a");
    a.href = currentImageUrl;
    a.download = `${item.title}-${versionLabel}.jpg`;
    a.target = "_blank";
    a.rel = "noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const onConfirmDelete = () => {
    if (confirmDelete === null) return;
    const idx = confirmDelete;
    const updated = deleteVersion(item.id, idx);
    setConfirmDelete(null);
    if (!updated) return;
    setItems(getItems());
    const remaining = updated.versions.length;
    if (remaining === 0) {
      setView({ kind: "before" });
    } else if (view.kind === "version") {
      const newIndex = Math.min(view.index, remaining - 1);
      setView({ kind: "version", index: newIndex });
    }
  };

  const headerEl = (
    <div className="flex items-center gap-2">
      {editingTitle ? (
        <input
          autoFocus
          value={titleDraft}
          onChange={(e) => setTitleDraft(e.target.value)}
          onBlur={commitTitle}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitTitle();
            } else if (e.key === "Escape") {
              setEditingTitle(false);
            }
          }}
          className="rounded-sm border border-border bg-bg px-2 py-0.5 text-2xl font-medium leading-8 focus:border-accent focus:outline-none"
        />
      ) : (
        <>
          <h1 className="whitespace-nowrap text-2xl font-medium leading-8 text-fg">
            {item.title}
          </h1>
          <button
            type="button"
            aria-label="Rename project"
            onClick={() => {
              setTitleDraft(item.title);
              setEditingTitle(true);
            }}
            className="text-fg-muted hover:text-fg"
          >
            <PencilIcon />
          </button>
        </>
      )}
    </div>
  );

  const mainImageEl = (
    <div className="relative w-full overflow-hidden rounded-md">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentImageUrl}
        alt={`${item.title} ${versionLabel}`}
        className="block aspect-[342/307] w-full object-cover lg:aspect-[741/355]"
      />
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <span className="inline-flex items-center justify-center rounded-md bg-fg px-2 py-1 text-[12px] font-medium leading-none text-white">
          {isAfterView ? "After" : "Before"}
        </span>
        {isAfterView && currentVersion?.presetTitle && (
          <span className="inline-flex items-center justify-center rounded-md border border-border bg-bg px-2 py-1 text-[12px] font-medium leading-none text-fg">
            {currentVersion.presetTitle}
          </span>
        )}
      </div>
    </div>
  );

  const thumbStripEl = hasVersions ? (
    <div className="flex items-start gap-2 overflow-x-auto px-1 py-3">
      {item.versions.map((v, i) => {
        const selected = view.kind === "version" && view.index === i;
        const label = `v${i + 1}`;
        return (
          <div key={i} className="group relative flex w-[79px] shrink-0 flex-col items-start gap-[9px]">
            <button
              type="button"
              onClick={() => setView({ kind: "version", index: i })}
              aria-pressed={selected}
              className={`relative size-[79px] overflow-hidden rounded-md border-2 transition-colors ${
                selected ? "border-fg" : "border-border hover:border-border-strong"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={v.afterUrl}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            </button>
            <span className="w-full truncate text-center text-xs leading-4 text-fg">
              {label}
            </span>
            <button
              type="button"
              aria-label={`Delete ${label}`}
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDelete(i);
              }}
              className="absolute -right-1.5 -top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
            >
              <CloseIcon />
            </button>
          </div>
        );
      })}
    </div>
  ) : null;

  const versionLabelEl = (
    <h2 className="text-2xl font-medium leading-8 text-fg">{versionLabel}</h2>
  );

  const calloutEl = (
    <div className="rounded-sm bg-bg px-4 py-2">
      <p className="text-xs leading-4 text-fg-faint">{DISCLAIMER}</p>
    </div>
  );

  const downloadButtonEl = (
    <button
      type="button"
      onClick={onDownload}
      className="inline-flex w-full items-center justify-center rounded-md bg-accent px-5 py-2 text-sm leading-5 text-white transition-colors hover:bg-accent-hover lg:w-auto lg:self-start"
    >
      Download image
    </button>
  );

  const createButtonEl = (
    <button
      type="button"
      onClick={onCreateNewVersion}
      className="inline-flex w-full items-center justify-center rounded-md border border-border bg-bg px-5 py-2 text-sm leading-5 text-fg transition-colors hover:border-border-strong"
    >
      Create a new version
    </button>
  );

  const toggleEl = hasVersions ? (
    <div className="relative h-10 w-full rounded-full bg-[#f2f2f2] p-1 xl:hidden">
      <div className="relative grid h-full grid-cols-2">
        <div
          aria-hidden
          className={`absolute top-0 bottom-0 left-0 w-1/2 rounded-full bg-bg shadow-sm transition-transform duration-200 ${
            view.kind === "version" ? "translate-x-full" : ""
          }`}
        />
        <button
          type="button"
          onClick={() => setView({ kind: "before" })}
          aria-pressed={view.kind === "before"}
          className={`relative z-10 flex items-center justify-center text-[13px] font-medium transition-colors ${
            view.kind === "before" ? "text-fg" : "text-[#808080]"
          }`}
        >
          Before
        </button>
        <button
          type="button"
          onClick={() =>
            setView({ kind: "version", index: item.versions.length - 1 })
          }
          aria-pressed={view.kind === "version"}
          className={`relative z-10 flex items-center justify-center text-[13px] font-medium transition-colors ${
            view.kind === "version" ? "text-fg" : "text-[#808080]"
          }`}
        >
          After
        </button>
      </div>
    </div>
  ) : null;

  const beforeReferenceEl = (
    <button
      type="button"
      onClick={() => setView({ kind: "before" })}
      aria-pressed={view.kind === "before"}
      className={`relative aspect-[363/200] w-full overflow-hidden rounded-md border-2 transition-colors ${
        view.kind === "before" ? "border-fg" : "border-border hover:border-border-strong"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.beforeUrl}
        alt="Before"
        className="absolute inset-0 size-full object-cover"
      />
      <span className="absolute bottom-4 left-4 inline-flex items-center justify-center rounded-md bg-fg px-2 py-1 text-[12px] font-medium leading-none text-white">
        Before
      </span>
    </button>
  );

  return (
    <div className="min-h-screen bg-bg-subtle">
      <Nav variant="secondary" backHref="/" />
      <main className="w-full px-6 pt-10 pb-24 lg:px-20 lg:pb-40">
        <div className="flex flex-col gap-6 xl:flex-row xl:gap-4">
          <div className="flex flex-col gap-6 xl:w-[741px]">
            {headerEl}
            {toggleEl}
            {mainImageEl}
            {hasVersions && (
              <div className="hidden xl:block">{thumbStripEl}</div>
            )}
            {isAfterView ? (
              <>
                <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between xl:gap-4">
                  {versionLabelEl}
                  {downloadButtonEl}
                </div>
                {calloutEl}
              </>
            ) : (
              <div className="xl:hidden">{createButtonEl}</div>
            )}
            {hasVersions && isAfterView && (
              <div className="xl:hidden">{thumbStripEl}</div>
            )}
          </div>

          <div className="hidden xl:flex xl:w-[363px] xl:flex-col xl:gap-4 xl:pt-14">
            {beforeReferenceEl}
            {createButtonEl}
          </div>
        </div>
      </main>

      {confirmDelete !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-6"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-bg p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold">Delete this version?</h2>
            <p className="mt-2 text-sm text-fg-muted">This can&apos;t be undone.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="inline-flex h-10 items-center rounded-md border border-border bg-bg px-4 text-sm font-medium text-fg hover:border-border-strong"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirmDelete}
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
