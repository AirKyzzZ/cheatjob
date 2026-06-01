import { describe, it, expect, vi, beforeEach } from "vitest";

const { rpc, complete } = vi.hoisted(() => ({ rpc: vi.fn(), complete: vi.fn() }));

vi.mock("next/headers", () => ({
  headers: async () => ({ get: () => "203.0.113.7" }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  getServiceClient: () => ({ rpc }),
}));

vi.mock("@/server/integrations/ai/openrouter", () => ({
  getAIProvider: () => ({ complete }),
}));

import { generateToolEmail } from "./tool-generator";

const inputs = {
  targetRole: "Stage produit",
  targetCompany: "Qonto",
  you: "Étudiant M2 KEDGE.",
};

beforeEach(() => {
  rpc.mockReset();
  complete.mockReset();
  rpc.mockResolvedValue({ data: true, error: null });
});

describe("generateToolEmail", () => {
  it("blocks when the honeypot is filled, without hitting the rate limiter or the model", async () => {
    const result = await generateToolEmail({ mode: "candidature_spontanee", inputs, honeypot: "bot" });
    expect(result).toEqual({ ok: false, error: "blocked" });
    expect(rpc).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();
  });

  it("returns rate_limited when the rpc denies the request, without calling the model", async () => {
    rpc.mockResolvedValue({ data: false, error: null });
    const result = await generateToolEmail({ mode: "relance", inputs });
    expect(result).toEqual({ ok: false, error: "rate_limited" });
    expect(complete).not.toHaveBeenCalled();
  });

  it("returns the parsed subject and body on success", async () => {
    complete.mockResolvedValue({ text: "Objet: S\nMessage:\nB" });
    const result = await generateToolEmail({ mode: "motivation", inputs });
    expect(result).toEqual({ ok: true, subject: "S", body: "B" });
  });

  it("returns generation_failed when the model throws", async () => {
    complete.mockRejectedValue(new Error("boom"));
    const result = await generateToolEmail({ mode: "candidature_spontanee", inputs });
    expect(result).toEqual({ ok: false, error: "generation_failed" });
  });

  it("returns generation_failed when the model output has no usable format", async () => {
    complete.mockResolvedValue({ text: "désolé, aucun format exploitable ici" });
    const result = await generateToolEmail({ mode: "candidature_spontanee", inputs });
    expect(result).toEqual({ ok: false, error: "generation_failed" });
  });

  it("returns generation_failed when the Objet line is missing", async () => {
    complete.mockResolvedValue({ text: "Message:\njuste un corps sans objet" });
    const result = await generateToolEmail({ mode: "candidature_spontanee", inputs });
    expect(result).toEqual({ ok: false, error: "generation_failed" });
  });
});
