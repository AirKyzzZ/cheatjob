import { promises as fs } from "node:fs";
import path from "node:path";
import { BLOG_QUEUE, type BlogTopic } from "@/lib/blog/queue";
import { generateBlogPost } from "./generate";
import { validateBlogPost } from "./validators";
import { commitFile } from "@/server/integrations/github/commit";
import { triggerDeploy } from "@/server/integrations/vercel/deploy-hook";

const DEFAULT_DIR = path.join(process.cwd(), "content", "blog");
const MAX_ATTEMPTS = 3;

export type PipelineOptions = { contentDir?: string; dryRun?: boolean };

export type PipelineResult =
  | { status: "published"; slug: string; attempts: number; commitSha: string; triggered: boolean }
  | { status: "skipped"; reason: string; slug?: string; violations?: string[] };

async function existingSlugs(dir: string): Promise<Set<string>> {
  try {
    const files = await fs.readdir(dir);
    return new Set(files.filter((f) => f.endsWith(".mdx")).map((f) => f.replace(/\.mdx$/, "")));
  } catch {
    return new Set();
  }
}

// Reads the running deployment's filesystem, which reflects the previous deploy.
// A post committed by this run only appears here after the deploy hook rebuilds,
// so dedup has a lag window equal to the deploy time. Safe for the daily cadence.
export async function pickNextTopic(dir: string = DEFAULT_DIR): Promise<BlogTopic | null> {
  const have = await existingSlugs(dir);
  return BLOG_QUEUE.find((t) => !have.has(t.slug)) ?? null;
}

export async function runBlogPipeline(
  dateISO: string,
  opts: PipelineOptions = {},
): Promise<PipelineResult> {
  const dir = opts.contentDir ?? DEFAULT_DIR;
  const topic = await pickNextTopic(dir);
  if (!topic) return { status: "skipped", reason: "queue exhausted" };

  let lastViolations: string[] = [];
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let raw: string;
    try {
      raw = await generateBlogPost(topic, dateISO);
    } catch (err) {
      // A transient model/network error is a failed attempt, not a fatal abort —
      // the retry loop exists precisely to absorb these.
      lastViolations = [`generation: ${err instanceof Error ? err.message : "unknown"}`];
      continue;
    }
    const result = await validateBlogPost(raw, topic);
    if (!result.ok) {
      lastViolations = result.violations;
      continue;
    }
    const content = raw.endsWith("\n") ? raw : `${raw}\n`;
    if (opts.dryRun) {
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, `${topic.slug}.mdx`), content, "utf8");
      return { status: "published", slug: topic.slug, attempts: attempt, commitSha: "dry-run", triggered: false };
    }
    const { commitSha } = await commitFile({
      path: `web/content/blog/${topic.slug}.mdx`,
      content,
      message: `feat(blog): ${topic.title}`,
    });
    const { triggered } = await triggerDeploy();
    if (!triggered) console.warn(`[blog-post] deploy hook did not fire for ${topic.slug}`);
    return { status: "published", slug: topic.slug, attempts: attempt, commitSha, triggered };
  }
  return { status: "skipped", reason: "validation failed", slug: topic.slug, violations: lastViolations };
}
