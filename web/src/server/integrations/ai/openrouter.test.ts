import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { OpenRouterAdapter } from "./openrouter";
import { AIGenerationError } from "./index";
import { buildCvOptimizerPrompt } from "./prompts/cv-optimizer";

afterEach(() => vi.unstubAllGlobals());

describe("OpenRouterAdapter.complete", () => {
  it("returns text and model on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            model: "anthropic/claude-haiku-4.5",
            choices: [{ message: { content: "hello" } }],
            usage: { cost: 0.0012 },
          }),
          { status: 200 },
        ),
      ),
    );
    const adapter = new OpenRouterAdapter("key");
    const result = await adapter.complete("anthropic/claude-haiku-4.5", [
      { role: "user", content: "hi" },
    ]);
    expect(result.text).toBe("hello");
    expect(result.costUsd).toBeCloseTo(0.0012);
  });

  it("throws AIGenerationError on non-200", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("err", { status: 500 })));
    const adapter = new OpenRouterAdapter("key");
    await expect(
      adapter.complete("anthropic/claude-haiku-4.5", [{ role: "user", content: "hi" }]),
    ).rejects.toBeInstanceOf(AIGenerationError);
  });
});

describe("OpenRouterAdapter.complete — E2E_MOCK", () => {
  beforeEach(() => {
    process.env.E2E_MOCK = "1";
  });
  afterEach(() => {
    delete process.env.E2E_MOCK;
  });

  it("returns canned drafter response without calling fetch", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    const adapter = new OpenRouterAdapter("e2e-mock");
    const result = await adapter.complete("anthropic/claude-sonnet-4-6", [
      { role: "user", content: "draft" },
    ]);
    const parsed = JSON.parse(result.text) as { subject: string; body: string };
    expect(parsed.subject).toBe("Test subject");
    expect(parsed.body).toBe("Test body for E2E mock.");
    expect(result.costUsd).toBe(0);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns canned CV-extract response for haiku model without calling fetch", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    const adapter = new OpenRouterAdapter("e2e-mock");
    const result = await adapter.complete("anthropic/claude-haiku-4.5", [
      { role: "user", content: "extract" },
    ]);
    const parsed = JSON.parse(result.text) as { full_name: string; skills: string[] };
    expect(parsed.full_name).toBe("Test User");
    expect(parsed.skills).toContain("test");
    expect(result.costUsd).toBe(0);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("E2E mock returns a CV analysis for the real cv-optimizer prompt", async () => {
    const adapter = new OpenRouterAdapter("e2e-mock");
    const { text } = await adapter.complete(
      "anthropic/claude-sonnet-4.6",
      buildCvOptimizerPrompt({ cv: "M2 droit", offer: "Juriste junior", full: true }),
    );
    const parsed = JSON.parse(text);
    expect(parsed.score).toBeTypeOf("number");
    expect(Array.isArray(parsed.lacunes)).toBe(true);
  });
});
