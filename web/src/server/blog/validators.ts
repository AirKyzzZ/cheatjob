import matter from "gray-matter";
import { compile } from "@mdx-js/mdx";
import { frontmatterSchema, type Frontmatter } from "@/lib/blog/schema";

const CHARTER_RULES: { re: RegExp; msg: string }[] = [
  { re: /[—–‒―−]/, msg: "em/en/figure dash or minus (use commas, periods, colons)" },
  { re: /\bpiston/i, msg: "banned word: piston (incl. pistonné/pistonner)" },
  { re: /\b(unleash|empower|leverage|game[\s-]?changer|nouvelle\s+génération)\b/i, msg: "banned jargon" },
  { re: /(?<!-)\bvous\b/i, msg: "vous (tutoie; rendez-vous is allowed)" },
  { re: /\p{Extended_Pictographic}/u, msg: "emoji" },
  { re: /<\/?[a-zA-Z]/, msg: "raw HTML/JSX tag" },
];

export type BlogValidation =
  | { ok: true; frontmatter: Frontmatter; body: string }
  | { ok: false; violations: string[] };

export async function validateBlogPost(raw: string): Promise<BlogValidation> {
  const violations: string[] = [];

  let data: unknown;
  let body = "";
  try {
    const parsed = matter(raw);
    data = parsed.data;
    body = parsed.content.trim();
  } catch {
    return { ok: false, violations: ["frontmatter: gray-matter parse failed"] };
  }

  if (!body) return { ok: false, violations: ["frontmatter: missing body"] };

  const fm = frontmatterSchema.safeParse(data);
  if (!fm.success) {
    violations.push(...fm.error.issues.map((i) => `frontmatter.${i.path.join(".") || "(root)"}: ${i.message}`));
  }

  for (const { re, msg } of CHARTER_RULES) {
    if (re.test(body)) violations.push(`charter: ${msg}`);
  }

  // next-mdx-remote@6 strips JS by default, but reject executable MDX constructs
  // in the body too so a render-config change can't turn a committed post into RCE.
  if (/[{}]/.test(body)) violations.push("mdx: expression braces { }");
  if (/^\s*(import|export)\s/m.test(body)) violations.push("mdx: import/export statement");

  // The frontmatter strings (title, description, FAQ) are rendered too, so they
  // must clear the same charter bar as the body.
  if (fm.success) {
    const meta = [fm.data.title, fm.data.description, ...fm.data.faq.flatMap((f) => [f.q, f.a])].join(" ");
    for (const { re, msg } of CHARTER_RULES) {
      if (re.test(meta)) violations.push(`charter(frontmatter): ${msg}`);
    }
  }

  const words = body.split(/\s+/).filter(Boolean).length;
  if (words < 600) violations.push(`structure: ${words} words (need >= 600)`);

  const h2 = body.match(/^##\s+/gm) ?? [];
  if (h2.length < 2) violations.push(`structure: ${h2.length} H2 heading(s) (need >= 2)`);

  // fm.data.tool is a fixed BLOG_TOOLS enum value, so this RegExp is not user-controlled.
  if (fm.success) {
    const linkRe = new RegExp(`\\]\\((?:https?://[^)]*)?/(?:fr/)?outils/${fm.data.tool}\\b`);
    if (!linkRe.test(body)) violations.push(`structure: missing link to /fr/outils/${fm.data.tool}`);
  }

  try {
    await compile(body);
  } catch (e) {
    violations.push(`compile: ${e instanceof Error ? e.message.split("\n")[0] : "MDX compile failed"}`);
  }

  if (violations.length || !fm.success) return { ok: false, violations };
  return { ok: true, frontmatter: fm.data, body };
}
