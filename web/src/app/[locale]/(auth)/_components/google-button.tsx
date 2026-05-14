"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/server/actions/auth";

function isRedirect(e: unknown): boolean {
  return (
    e instanceof Error &&
    "digest" in e &&
    String((e as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}

export function GoogleButton({ locale, label }: { locale: string; label: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <Button
        type="button"
        variant="secondary-light"
        className="w-full"
        loading={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            try {
              await signInWithGoogle(locale);
            } catch (e) {
              if (isRedirect(e)) throw e;
              setError(e instanceof Error ? e.message : "Unknown error");
            }
          })
        }
      >
        {label}
      </Button>
      {error && <p className="mt-2 text-[13px] text-destructive font-sans">{error}</p>}
    </>
  );
}
