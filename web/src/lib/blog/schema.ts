import { z } from "zod";

export const BLOG_TOOLS = [
  "email-candidature-spontanee",
  "relancer-un-recruteur",
  "email-de-motivation",
] as const;

export type BlogTool = (typeof BLOG_TOOLS)[number];

export const frontmatterSchema = z.object({
  title: z.string().min(10).max(70),
  description: z.string().min(110).max(170),
  // YAML parses an unquoted `date: 2026-06-06` into a Date; coerce it back to the
  // YYYY-MM-DD string the rest of the app expects.
  date: z.preprocess(
    (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ),
  tags: z.array(z.string().min(1)).min(1).max(4),
  tool: z.enum(BLOG_TOOLS),
  faq: z
    .array(z.object({ q: z.string().min(1), a: z.string().min(1) }))
    .min(2)
    .max(4),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;
