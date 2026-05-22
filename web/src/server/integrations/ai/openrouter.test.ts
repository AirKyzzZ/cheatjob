import { describe, it, expect, vi, afterEach } from "vitest";
import { OpenRouterAdapter } from "./openrouter";
import { AIGenerationError } from "./index";

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
