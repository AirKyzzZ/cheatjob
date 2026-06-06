import { MODELS } from "@/server/integrations/ai";
import { getAIProvider } from "@/server/integrations/ai/openrouter";
import { buildBlogPrompt } from "@/server/integrations/ai/prompts/blog-generator";
import type { BlogTopic } from "@/lib/blog/queue";

export function stripFences(raw: string): string {
  const t = raw.trim();
  const fence = t.match(/^```[\w-]*\n([\s\S]*?)\n```$/);
  return fence ? fence[1].trim() : t;
}

export async function generateBlogPost(topic: BlogTopic, dateISO: string): Promise<string> {
  const { text } = await getAIProvider().complete(MODELS.blog, buildBlogPrompt(topic, dateISO));
  return stripFences(text);
}
