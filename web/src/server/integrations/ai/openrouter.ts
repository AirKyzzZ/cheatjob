import {
  type AIProvider,
  type ChatMessage,
  type CompletionResult,
  AIGenerationError,
} from "./index";

const BASE = "https://openrouter.ai/api/v1/chat/completions";
const TIMEOUT_MS = 60000;

type ORChoice = { message?: { content?: string }; delta?: { content?: string } };
type ORResponse = { model?: string; choices?: ORChoice[]; usage?: { cost?: number } };

export class OpenRouterAdapter implements AIProvider {
  constructor(private readonly apiKey: string) {}

  private headers() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      "HTTP-Referer": "https://www.cheatjob.com",
      "X-Title": "Cheatjob",
    };
  }

  async complete(model: string, messages: ChatMessage[]): Promise<CompletionResult> {
    if (process.env.E2E_MOCK === "1") {
      const text = model.includes("haiku")
        ? JSON.stringify({
            full_name: "Test User",
            school: "Test School",
            field_of_study: "Test Field",
            experiences: [],
            skills: ["test"],
            projects: [],
            languages: ["FR"],
          })
        : JSON.stringify({ subject: "Test subject", body: "Test body for E2E mock." });
      return { text, model, costUsd: 0 };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(BASE, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({ model, messages, usage: { include: true } }),
        signal: controller.signal,
      });
      if (!res.ok) throw new AIGenerationError(`OpenRouter ${res.status}`);
      const json = (await res.json()) as ORResponse;
      const text = json.choices?.[0]?.message?.content;
      if (!text) throw new AIGenerationError("Empty completion");
      // OpenRouter usually echoes usage.cost; if it doesn't, log so we notice
      // — cost tracking silently dropping to 0 is the kind of thing you only
      // catch when reconciling against your OpenRouter bill at month-end.
      if (json.usage?.cost == null) {
        console.warn(`OpenRouter response for model="${model}" omitted usage.cost; recording 0`);
      }
      return { text, model: json.model ?? model, costUsd: json.usage?.cost ?? 0 };
    } catch (err) {
      if (err instanceof AIGenerationError) throw err;
      throw new AIGenerationError(err instanceof Error ? err.message : "unknown");
    } finally {
      clearTimeout(timer);
    }
  }

  async *stream(
    model: string,
    messages: ChatMessage[],
  ): AsyncGenerator<string, { model: string; costUsd: number }, void> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let costUsd = 0;
    let resolvedModel = model;
    try {
      const res = await fetch(BASE, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({ model, messages, stream: true, usage: { include: true } }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new AIGenerationError(`OpenRouter ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload) as ORResponse;
            resolvedModel = json.model ?? resolvedModel;
            if (json.usage?.cost != null) costUsd = json.usage.cost;
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) yield delta;
          } catch {
            // Partial SSE chunk — buffer will be completed on the next read.
          }
        }
      }
      return { model: resolvedModel, costUsd };
    } catch (err) {
      if (err instanceof AIGenerationError) throw err;
      throw new AIGenerationError(err instanceof Error ? err.message : "unknown");
    } finally {
      clearTimeout(timer);
    }
  }
}

export function getAIProvider(): AIProvider {
  if (process.env.E2E_MOCK === "1") return new OpenRouterAdapter("e2e-mock");
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is not set");
  return new OpenRouterAdapter(key);
}
