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
  const result = await runBlogPipeline(dateISO);
  return NextResponse.json(result);
}
