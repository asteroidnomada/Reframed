import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const LINEAR_ENDPOINT = "https://api.linear.app/graphql";
const TEAM_KEY = process.env.LINEAR_TEAM_KEY ?? "MDS";

let cachedTeamId: string | null = null;

async function linear<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) throw new Error("LINEAR_API_KEY is not set");
  const res = await fetch(LINEAR_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Linear ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data as T;
}

async function getTeamId(): Promise<string> {
  if (cachedTeamId) return cachedTeamId;
  const data = await linear<{ teams: { nodes: { id: string; key: string }[] } }>(
    `query Teams { teams { nodes { id key } } }`
  );
  const team = data?.teams?.nodes?.find((t) => t.key === TEAM_KEY);
  if (!team) throw new Error(`Linear team with key ${TEAM_KEY} not found`);
  cachedTeamId = team.id;
  return team.id;
}

const VALID_CATEGORIES = ["Bug", "Idea", "Praise", "Other"] as const;
type Category = (typeof VALID_CATEGORIES)[number];

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      category?: string;
      rating?: number;
      message?: string;
      pageUrl?: string;
      userAgent?: string;
    };

    const category = body.category as Category;
    const rating = Number(body.rating ?? 0);
    const message = String(body.message ?? "").trim();
    const pageUrl = String(body.pageUrl ?? "");
    const userAgent = String(body.userAgent ?? "");

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }
    if (message.length < 5) {
      return NextResponse.json({ error: "Message too short" }, { status: 400 });
    }

    let userEmail: string | null = null;
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      userEmail = data.user?.email ?? null;
    } catch {
      // Anonymous submission — leave userEmail null.
    }

    const teamId = await getTeamId();
    const ratingLabel = rating > 0 ? `${rating}/5 ★` : "—";
    const title = `[Beta feedback] ${category}${rating > 0 ? ` · ${rating}/5` : ""}`;
    const description = [
      `**Category:** ${category}`,
      `**Rating:** ${ratingLabel}`,
      `**From:** ${userEmail ?? "anonymous"}`,
      `**Page:** ${pageUrl || "—"}`,
      `**User agent:** ${userAgent || "—"}`,
      "",
      "---",
      "",
      message,
    ].join("\n");

    const data = await linear<{
      issueCreate: { success: boolean; issue: { id: string; identifier: string; url: string } };
    }>(
      `mutation IssueCreate($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue { id identifier url }
        }
      }`,
      { input: { teamId, title, description } }
    );

    if (!data?.issueCreate?.success) {
      throw new Error("Linear issueCreate returned success=false");
    }

    return NextResponse.json({ ok: true, issue: data.issueCreate.issue });
  } catch (err) {
    console.error("[feedback] error", err);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}
