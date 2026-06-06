import { MODELS } from "@/server/integrations/ai";
import { getAIProvider } from "@/server/integrations/ai/openrouter";
import { buildBlogPrompt } from "@/server/integrations/ai/prompts/blog-generator";
import type { BlogTopic } from "@/lib/blog/queue";

export function stripFences(raw: string): string {
  let t = raw.trim();
  let prev: string;
  do {
    prev = t;
    const fence = t.match(/^```[\w-]*\n([\s\S]*?)\n```$/);
    if (fence) t = fence[1].trim();
  } while (t !== prev);
  return t;
}

export async function generateBlogPost(topic: BlogTopic, dateISO: string): Promise<string> {
  const { text } = await getAIProvider().complete(MODELS.blog, buildBlogPrompt(topic, dateISO));
  return stripFences(text);
}
