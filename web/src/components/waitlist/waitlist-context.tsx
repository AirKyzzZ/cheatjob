"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { EVENTS, track } from "@/lib/analytics/events";
import { WaitlistModal } from "./waitlist-modal";

type OpenOptions = { plan?: string; source?: string };

type WaitlistContextValue = {
  open: (options?: OpenOptions) => void;
};

const WaitlistContext = createContext<WaitlistContextValue | null>(null);

export function WaitlistProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    open: boolean;
    plan?: string;
    source?: string;
  }>({ open: false });

  const open = useCallback((options?: OpenOptions) => {
    setState({ open: true, plan: options?.plan, source: options?.source });
    track(EVENTS.WaitlistOpened, {
      plan: options?.plan,
      source: options?.source,
    });
  }, []);

  const close = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <WaitlistContext.Provider value={value}>
      {children}
      <WaitlistModal
        open={state.open}
        onClose={close}
        plan={state.plan}
        source={state.source}
      />
    </WaitlistContext.Provider>
  );
}

export function useWaitlist() {
  const ctx = useContext(WaitlistContext);
  if (!ctx) throw new Error("useWaitlist must be used within WaitlistProvider");
  return ctx;
}
