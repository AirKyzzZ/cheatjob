"use client";

import { useEffect } from "react";
import { track, EVENTS } from "@/lib/analytics/events";
import type { BlogTool } from "@/lib/blog/schema";

export function BlogViewTracker({ slug, tool }: { slug: string; tool: BlogTool }) {
  useEffect(() => {
    track(EVENTS.BlogPostViewed, { slug, tool });
  }, [slug, tool]);
  return null;
}
