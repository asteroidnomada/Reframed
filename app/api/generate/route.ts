import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { randomUUID } from "node:crypto";
import { getPreset } from "@/lib/presets";
import { REFRAMED_BUCKET, supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 300;

type Body = {
  imageDataUrl?: string;
  imageUrl?: string;
  presetId?: string;
  customPrompt?: string;
};

async function fetchRemoteImage(url: string): Promise<{ mediaType: string; bytes: Uint8Array }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image (${res.status})`);
  const mediaType = res.headers.get("content-type") ?? "image/png";
  const buf = await res.arrayBuffer();
  return { mediaType, bytes: new Uint8Array(buf) };
}

function parseDataUrl(dataUrl: string): { mediaType: string; bytes: Uint8Array } {
  const match = /^data:([^;]+);base64,(.*)$/.exec(dataUrl);
  if (!match) throw new Error("Invalid data URL");
  const mediaType = match[1];
  const bytes = Uint8Array.from(Buffer.from(match[2], "base64"));
  return { mediaType, bytes };
}

async function uploadToBucket(
  path: string,
  bytes: Uint8Array,
  contentType: string
): Promise<string> {
  const { error } = await supabaseAdmin.storage
    .from(REFRAMED_BUCKET)
    .upload(path, bytes, { contentType, upsert: false });
  if (error) throw new Error(`Supabase upload failed: ${error.message}`);
  const { data } = supabaseAdmin.storage.from(REFRAMED_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { imageDataUrl, imageUrl, presetId, customPrompt } = body;
  if ((!imageDataUrl && !imageUrl) || !presetId) {
    return NextResponse.json(
      { error: "Missing imageDataUrl/imageUrl or presetId" },
      { status: 400 }
    );
  }

  const preset = getPreset(presetId);
  if (!preset) {
    return NextResponse.json({ error: "Unknown presetId" }, { status: 400 });
  }

  const trimmedCustom = customPrompt?.trim() ?? "";
  if (trimmedCustom.length > 500) {
    return NextResponse.json(
      { error: "Custom instructions must be 500 characters or fewer" },
      { status: 400 }
    );
  }
  const finalPrompt = trimmedCustom
    ? `${preset.prompt} Additional direction from the user: ${trimmedCustom}`
    : preset.prompt;

  let input;
  try {
    input = imageDataUrl
      ? parseDataUrl(imageDataUrl)
      : await fetchRemoteImage(imageUrl as string);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }

  let generated: { mediaType: string; bytes: Uint8Array } | null = null;
  try {
    const result = await generateText({
      model: google("gemini-3.1-flash-image-preview"),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: finalPrompt },
            { type: "image", image: input.bytes, mediaType: input.mediaType },
          ],
        },
      ],
    });
    for (const file of result.files) {
      if (file.mediaType.startsWith("image/")) {
        generated = { mediaType: file.mediaType, bytes: file.uint8Array };
        break;
      }
    }
  } catch (err) {
    return NextResponse.json(
      { error: `Generation failed: ${(err as Error).message}` },
      { status: 500 }
    );
  }

  if (!generated) {
    return NextResponse.json(
      { error: "Model returned no image" },
      { status: 502 }
    );
  }

  const id = randomUUID();
  const beforeExt = input.mediaType.split("/")[1] ?? "png";
  const afterExt = generated.mediaType.split("/")[1] ?? "png";

  try {
    const [beforeUrl, afterUrl] = await Promise.all([
      uploadToBucket(`before/${id}.${beforeExt}`, input.bytes, input.mediaType),
      uploadToBucket(`after/${id}.${afterExt}`, generated.bytes, generated.mediaType),
    ]);

    return NextResponse.json({
      id,
      title: preset.title,
      beforeUrl,
      afterUrl,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
