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
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tags: z.array(z.string().min(1)).min(1).max(4),
  tool: z.enum(BLOG_TOOLS),
  faq: z
    .array(z.object({ q: z.string().min(1), a: z.string().min(1) }))
    .min(2)
    .max(4),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;
