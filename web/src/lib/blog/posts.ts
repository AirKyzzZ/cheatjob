import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { frontmatterSchema, type Frontmatter } from "./schema";

const DEFAULT_DIR = path.join(process.cwd(), "content", "blog");

export type BlogPost = Frontmatter & {
  slug: string;
  body: string;
  readingMinutes: number;
};

async function listMdx(dir: string): Promise<string[]> {
  try {
    return (await fs.readdir(dir)).filter((f) => f.endsWith(".mdx"));
  } catch {
    return [];
  }
}

export async function getAllSlugs(dir: string = DEFAULT_DIR): Promise<string[]> {
  return (await listMdx(dir)).map((f) => f.replace(/\.mdx$/, ""));
}

export async function getAllPosts(dir: string = DEFAULT_DIR): Promise<BlogPost[]> {
  const files = await listMdx(dir);
  const posts: BlogPost[] = [];
  for (const file of files) {
    const raw = await fs.readFile(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    const fm = frontmatterSchema.safeParse(data);
    if (!fm.success) continue;
    posts.push({
      ...fm.data,
      slug: file.replace(/\.mdx$/, ""),
      body: content.trim(),
      readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
    });
  }
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostBySlug(
  slug: string,
  dir: string = DEFAULT_DIR,
): Promise<BlogPost | null> {
  return (await getAllPosts(dir)).find((p) => p.slug === slug) ?? null;
}
