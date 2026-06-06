export type ChatMessage = { role: "system" | "user"; content: string };

export type CompletionResult = { text: string; model: string; costUsd: number };

export class AIGenerationError extends Error {
  constructor(message = "AI generation failed") {
    super(message);
    this.name = "AIGenerationError";
  }
}

export interface AIProvider {
  complete(model: string, messages: ChatMessage[]): Promise<CompletionResult>;
  stream(
    model: string,
    messages: ChatMessage[],
  ): AsyncGenerator<string, { model: string; costUsd: number }, void>;
}

export const MODELS = {
  draft: "anthropic/claude-sonnet-4.6",
  cvExtract: "anthropic/claude-haiku-4.5",
  tool: "anthropic/claude-haiku-4.5",
  blog: "anthropic/claude-sonnet-4.6",
} as const;
