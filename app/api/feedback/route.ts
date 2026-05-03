import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const LINEAR_ENDPOINT = "https://api.linear.app/graphql";
const TEAM_KEY = process.env.LINEAR_TEAM_KEY ?? "MDS";
const PROJECT_NAME = "Reframed";
const BUG_LABEL_NAME = "Bug";

let cachedTeamId: string | null = null;
let cachedProjectId: string | null | undefined; // undefined = not looked up; null = not found
let cachedBugLabelId: string | null | undefined;

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

async function getProjectId(): Promise<string | null> {
  if (cachedProjectId !== undefined) return cachedProjectId;
  const data = await linear<{ projects: { nodes: { id: string; name: string }[] } }>(
    `query Projects($name: String!) {
      projects(filter: { name: { eq: $name } }) { nodes { id name } }
    }`,
    { name: PROJECT_NAME }
  );
  cachedProjectId = data?.projects?.nodes?.[0]?.id ?? null;
  return cachedProjectId;
}

async function getBugLabelId(): Promise<string | null> {
  if (cachedBugLabelId !== undefined) return cachedBugLabelId;
  const data = await linear<{ issueLabels: { nodes: { id: string; name: string }[] } }>(
    `query Labels($name: String!) {
      issueLabels(filter: { name: { eq: $name } }) { nodes { id name } }
    }`,
    { name: BUG_LABEL_NAME }
  );
  cachedBugLabelId = data?.issueLabels?.nodes?.[0]?.id ?? null;
  return cachedBugLabelId;
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

    const [teamId, projectId, bugLabelId] = await Promise.all([
      getTeamId(),
      getProjectId(),
      getBugLabelId(),
    ]);

    const ratingLabel = rating > 0 ? `${rating}/5 ★` : "—";
    const summary = message.split("\n")[0]?.slice(0, 80).trim();
    const title = `Reframed · ${category}${rating > 0 ? ` (${rating}/5)` : ""}${
      summary ? `: ${summary}` : ""
    }`;
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

    const input: Record<string, unknown> = { teamId, title, description };
    if (projectId) input.projectId = projectId;
    if (bugLabelId) input.labelIds = [bugLabelId];

    const data = await linear<{
      issueCreate: { success: boolean; issue: { id: string; identifier: string; url: string } };
    }>(
      `mutation IssueCreate($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue { id identifier url }
        }
      }`,
      { input }
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
