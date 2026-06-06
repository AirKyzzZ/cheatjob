"use client";

import { useEffect } from "react";
import { track, EVENTS } from "@/lib/analytics/events";

export function BlogViewTracker({ slug, tool }: { slug: string; tool: string }) {
  useEffect(() => {
    track(EVENTS.BlogPostViewed, { slug, tool });
  }, [slug, tool]);
  return null;
}
