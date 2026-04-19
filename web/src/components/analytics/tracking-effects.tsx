"use client";

import { Suspense } from "react";
import { useExitIntent } from "@/hooks/use-exit-intent";
import { useScrollDepth } from "@/hooks/use-scroll-depth";
import { useTimeOnPage } from "@/hooks/use-time-on-page";
import { useUtmCapture } from "@/hooks/use-utm-capture";

function Effects() {
  useUtmCapture();
  useScrollDepth();
  useTimeOnPage();
  useExitIntent();
  return null;
}

export function TrackingEffects() {
  return (
    <Suspense fallback={null}>
      <Effects />
    </Suspense>
  );
}
