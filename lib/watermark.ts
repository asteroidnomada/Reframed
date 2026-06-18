// Downloads an image with a "Reframed" watermark stamped in the corner.
// Draws the source image onto a canvas, overlays the wordmark, and exports a
// JPEG. Falls back to a plain download if the canvas can't be exported (e.g. a
// cross-origin image without CORS headers taints the canvas).

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

function triggerDownload(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.rel = "noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function stampWatermark(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Scale the mark to the image so it reads consistently at any resolution.
  const fontSize = Math.max(20, Math.round(w * 0.03));
  const pad = Math.round(w * 0.026);
  ctx.save();
  ctx.font = `600 ${fontSize}px Inter, system-ui, -apple-system, sans-serif`;
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = Math.round(fontSize * 0.45);
  ctx.shadowOffsetY = 1;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillText("Reframed", w - pad, h - pad);
  ctx.restore();
}

export async function downloadWatermarked(
  url: string,
  filename: string
): Promise<void> {
  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    // Ensure Inter is ready so the wordmark renders in-brand (not a fallback).
    if (typeof document !== "undefined" && document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch {
        /* non-fatal */
      }
    }
    stampWatermark(ctx, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92)
    );
    if (!blob) throw new Error("canvas export failed");
    const objectUrl = URL.createObjectURL(blob);
    triggerDownload(objectUrl, filename);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch {
    // Canvas tainted or load failed — fall back to the original image.
    triggerDownload(url, filename);
  }
}
