export type GeneratedVersion = {
  afterUrl: string;
  presetId: string;
  presetTitle: string;
  date: string;
  title?: string;
};

export type GalleryItem = {
  id: string;
  title: string;
  date: string;
  beforeUrl: string;
  versions: GeneratedVersion[];
  archived?: boolean;
};

type LegacyItem = GalleryItem & { afterUrl?: string };

const KEY = "reframed:gallery";

function hydrate(raw: LegacyItem): GalleryItem {
  const archived = raw.archived === true;
  if (Array.isArray(raw.versions) && raw.versions.length > 0) {
    return {
      id: raw.id,
      title: raw.title,
      date: raw.date,
      beforeUrl: raw.beforeUrl,
      versions: raw.versions,
      archived,
    };
  }
  return {
    id: raw.id,
    title: raw.title,
    date: raw.date,
    beforeUrl: raw.beforeUrl,
    versions: raw.afterUrl
      ? [
          {
            afterUrl: raw.afterUrl,
            presetId: "",
            presetTitle: raw.title,
            date: raw.date,
          },
        ]
      : [],
    archived,
  };
}

export function updateVersionTitle(itemId: string, index: number, title: string): GalleryItem | null {
  if (typeof window === "undefined") return null;
  const items = getItems();
  const idx = items.findIndex((i) => i.id === itemId);
  if (idx === -1) return null;
  const versions = items[idx].versions.slice();
  if (!versions[index]) return null;
  const trimmed = title.trim();
  versions[index] = { ...versions[index], title: trimmed || undefined };
  const updated = { ...items[idx], versions };
  const next = [...items];
  next[idx] = updated;
  writeItems(next);
  return updated;
}

export function setArchived(itemId: string, archived: boolean): void {
  if (typeof window === "undefined") return;
  const items = getItems();
  const idx = items.findIndex((i) => i.id === itemId);
  if (idx === -1) return;
  const next = [...items];
  next[idx] = { ...items[idx], archived };
  writeItems(next);
}

export function hasOnboarded(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(KEY) !== null;
}

export function getItems(): GalleryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (parsed as LegacyItem[]).map(hydrate);
  } catch {
    return [];
  }
}

function writeItems(items: GalleryItem[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items));
}

export function addItem(item: GalleryItem) {
  if (typeof window === "undefined") return;
  const next = [item, ...getItems()];
  writeItems(next);
}

export function addVersion(itemId: string, version: GeneratedVersion): GalleryItem | null {
  if (typeof window === "undefined") return null;
  const items = getItems();
  const idx = items.findIndex((i) => i.id === itemId);
  if (idx === -1) return null;
  const updated: GalleryItem = {
    ...items[idx],
    date: version.date,
    versions: [...items[idx].versions, version],
  };
  const next = [...items];
  next[idx] = updated;
  writeItems(next);
  return updated;
}

export function updateTitle(itemId: string, title: string): GalleryItem | null {
  if (typeof window === "undefined") return null;
  const items = getItems();
  const idx = items.findIndex((i) => i.id === itemId);
  if (idx === -1) return null;
  const updated = { ...items[idx], title };
  const next = [...items];
  next[idx] = updated;
  writeItems(next);
  return updated;
}

export function deleteItem(itemId: string): void {
  if (typeof window === "undefined") return;
  const next = getItems().filter((i) => i.id !== itemId);
  writeItems(next);
}

export function deleteVersion(itemId: string, index: number): GalleryItem | null {
  if (typeof window === "undefined") return null;
  const items = getItems();
  const idx = items.findIndex((i) => i.id === itemId);
  if (idx === -1) return null;
  const versions = items[idx].versions.filter((_, i) => i !== index);
  const updated = { ...items[idx], versions };
  const next = [...items];
  next[idx] = updated;
  writeItems(next);
  return updated;
}

export function nextDefaultTitle(): string {
  const items = getItems();
  const used = new Set<number>();
  for (const it of items) {
    const m = /^Project (\d+)$/.exec(it.title);
    if (m) used.add(Number(m[1]));
  }
  let n = 1;
  while (used.has(n)) n++;
  return `Project ${String(n).padStart(2, "0")}`;
}

export function formatToday(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
