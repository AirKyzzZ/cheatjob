import { describe, it, expect } from "vitest";
import { frontmatterSchema, BLOG_TOOLS } from "./schema";

const valid = {
  title: "Candidature spontanée qui marche",
  description:
    "Le guide concret pour écrire une candidature spontanée qui atterrit chez le bon manager et décroche un entretien, pas dans une boîte RH.",
  date: "2026-06-05",
  tags: ["candidature", "emploi"],
  tool: "email-candidature-spontanee",
  faq: [
    { q: "Ça marche vraiment ?", a: "Oui, si tu vises le bon manager." },
    { q: "Combien de temps ?", a: "Cinq minutes avec l'outil." },
  ],
};

describe("frontmatterSchema", () => {
  it("accepts a valid frontmatter", () => {
    expect(frontmatterSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects an unknown tool", () => {
    expect(frontmatterSchema.safeParse({ ...valid, tool: "nope" }).success).toBe(false);
  });
  it("rejects a too-short description", () => {
    expect(frontmatterSchema.safeParse({ ...valid, description: "trop court" }).success).toBe(false);
  });
  it("rejects fewer than 2 faq items", () => {
    expect(frontmatterSchema.safeParse({ ...valid, faq: [valid.faq[0]] }).success).toBe(false);
  });
  it("rejects an impossible calendar date", () => {
    expect(frontmatterSchema.safeParse({ ...valid, date: "2026-13-40" }).success).toBe(false);
    expect(frontmatterSchema.safeParse({ ...valid, date: "2026-02-30" }).success).toBe(false);
  });
  it("coerces a YAML-parsed Date back to a YYYY-MM-DD string", () => {
    const parsed = frontmatterSchema.safeParse({ ...valid, date: new Date("2026-06-06T00:00:00Z") });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.date).toBe("2026-06-06");
  });
  it("exposes the 3 funnel tools", () => {
    expect(BLOG_TOOLS).toHaveLength(3);
  });
});
