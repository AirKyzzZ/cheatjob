import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { runBlogPipeline } from "@/server/blog/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const provided = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const authorized =
    provided.length === expected.length &&
    timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
  if (!authorized) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const dateISO = new Date().toISOString().slice(0, 10);
  try {
    const result = await runBlogPipeline(dateISO);
    // Surface a persistent generation failure as non-2xx so Vercel's cron
    // monitor flags it. Queue exhaustion is intentional and stays 200.
    const httpStatus =
      result.status === "skipped" && result.reason === "validation failed" ? 503 : 200;
    return NextResponse.json(result, { status: httpStatus });
  } catch (err) {
    console.error("[blog-post cron] pipeline error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
