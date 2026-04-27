"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";

const MAX_BYTES = 15 * 1024 * 1024;
const MAX_EDGE = 1024;
const JPEG_QUALITY = 0.8;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image decode failed"));
    img.src = src;
  });
}

async function resizeToDataUrl(file: File): Promise<string> {
  const sourceUrl = await readAsDataUrl(file);
  const img = await loadImage(sourceUrl);
  const longest = Math.max(img.naturalWidth, img.naturalHeight);
  if (longest <= MAX_EDGE) return sourceUrl;
  const scale = MAX_EDGE / longest;
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return sourceUrl;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    setError(null);
    if (!files || files.length === 0) return;
    const f = files[0];
    if (f.size > MAX_BYTES) {
      setError("That file is over 15 MB. Please pick a smaller photo.");
      return;
    }
    try {
      const dataUrl = await resizeToDataUrl(f);
      sessionStorage.setItem("reframed:pending", dataUrl);
      router.push("/direction");
    } catch {
      setError("Could not read that file. Try another one.");
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    void handleFiles(e.dataTransfer.files);
  };

  const openPicker = () => inputRef.current?.click();

  return (
    <div className="min-h-screen bg-bg-subtle">
      <Nav variant="secondary" backHref="/" />
      <main className="mx-auto w-full max-w-[552px] px-6 pt-10 pb-24 lg:px-0">
        <div className="flex flex-col gap-3">
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-medium leading-8 text-fg">
              Upload your photo
            </h1>
            <p className="text-xs leading-4 text-fg-muted">
              We recommend you upload a photo that clearly captures the entire space from one angle.
            </p>
          </header>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={openPicker}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openPicker();
              }
            }}
            className={`flex w-full cursor-pointer flex-col items-center gap-6 rounded-lg border border-dashed bg-bg px-6 py-24 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-subtle ${
              dragging ? "border-accent" : "border-border"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/heic"
              className="hidden"
              onChange={(e) => void handleFiles(e.target.files)}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/upload-placeholder.svg"
              alt=""
              width={74}
              height={74}
              aria-hidden="true"
            />
            <div className="flex w-full flex-col items-center gap-2">
              <p className="w-full text-lg leading-7 text-fg">
                Select a photo or drag and drop
              </p>
              <p className="w-full text-sm leading-5 text-fg-muted">
                JPEG, PNG, HEIC • max 15 MB
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openPicker();
              }}
              className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-2 text-sm leading-5 text-white hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            >
              Select a photo
            </button>
          </div>

          {error && (
            <p role="alert" className="text-sm leading-5 text-red-600">
              {error}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
