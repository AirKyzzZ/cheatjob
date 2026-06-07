import { describe, it, expect } from "vitest";
import { validateBlogPost } from "./validators";

const topic = {
  slug: "relance-apres-entretien",
  title: "La relance après entretien",
  tool: "relancer-un-recruteur" as const,
  angle: "x",
};

function buildDoc(body: string, fmOverrides = ""): string {
  return `---
title: "Relancer un recruteur après un entretien"
description: "Le guide concret pour relancer un recruteur après un entretien sans passer pour un lourd, avec le bon timing et le ton qui donne envie de répondre."
date: "2026-06-05"
tags: ["relance"]
tool: "relancer-un-recruteur"
faq:
  - q: "Quand relancer ?"
    a: "Après cinq jours ouvrés."
  - q: "Combien de fois ?"
    a: "Deux, pas plus."
${fmOverrides}---

${body}`;
}

const goodBody = `## Pourquoi relancer

Tu relances parce que le silence ne veut pas dire non. ${"Un recruteur reçoit des dizaines de messages par jour. ".repeat(65)}

Pour aller plus vite, essaie notre [outil de relance](/fr/outils/relancer-un-recruteur).

## Comment relancer

Garde un ton simple. Sois bref. Donne une raison de te répondre.`;

describe("validateBlogPost", () => {
  it("accepts a clean post", async () => {
    const res = await validateBlogPost(buildDoc(goodBody), topic);
    expect(res.ok).toBe(true);
  });
  it("accepts an unquoted YAML date (gray-matter parses it as a Date)", async () => {
    const doc = buildDoc(goodBody).replace('date: "2026-06-05"', "date: 2026-06-05");
    const res = await validateBlogPost(doc, topic);
    expect(res.ok).toBe(true);
  });
  it("rejects an em dash", async () => {
    const res = await validateBlogPost(buildDoc(goodBody.replace("Sois bref.", "Sois bref — vraiment.")), topic);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.violations.some((v) => v.includes("dash"))).toBe(true);
  });
  it("rejects piston", async () => {
    const res = await validateBlogPost(buildDoc(goodBody + "\n\nPas besoin de piston."), topic);
    expect(res.ok).toBe(false);
  });
  it("rejects vous", async () => {
    const res = await validateBlogPost(buildDoc(goodBody.replace("Tu relances", "Vous relancez")), topic);
    expect(res.ok).toBe(false);
  });
  it("allows rendez-vous without flagging a vous violation", async () => {
    const res = await validateBlogPost(buildDoc(goodBody + "\n\nPrends rendez-vous avec le manager."), topic);
    expect(res.ok).toBe(true);
  });
  it("rejects emoji", async () => {
    const res = await validateBlogPost(buildDoc(goodBody + "\n\nBeau boulot 🚀"), topic);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.violations.some((v) => v.includes("emoji"))).toBe(true);
  });
  it("rejects a missing internal link", async () => {
    const res = await validateBlogPost(buildDoc(goodBody.replace("[outil de relance](/fr/outils/relancer-un-recruteur)", "rien")), topic);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.violations.some((v) => v.includes("link"))).toBe(true);
  });
  it("rejects fewer than 2 H2", async () => {
    const res = await validateBlogPost(buildDoc("## Une seule section\n\n" + "mot ".repeat(700) + "[x](/fr/outils/relancer-un-recruteur)"), topic);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.violations.some((v) => v.includes("H2"))).toBe(true);
  });
  it("rejects a body that is too short", async () => {
    const res = await validateBlogPost(buildDoc("## A\n\n## B\n\ncourt [x](/fr/outils/relancer-un-recruteur)"), topic);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.violations.some((v) => v.includes("words"))).toBe(true);
  });
  it("rejects a tool mismatch", async () => {
    const res = await validateBlogPost(
      buildDoc(goodBody.replace("/fr/outils/relancer-un-recruteur", "/fr/outils/email-de-motivation"), 'tool: "email-de-motivation"\n').replace('tool: "relancer-un-recruteur"\n', ""),
      topic,
    );
    expect(res.ok).toBe(false);
  });
  it("rejects MDX expression braces in the body", async () => {
    const res = await validateBlogPost(buildDoc(goodBody + "\n\nUn calcul {1 + 1} ici."), topic);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.violations.some((v) => v.includes("mdx"))).toBe(true);
  });
  it("rejects malformed frontmatter", async () => {
    const res = await validateBlogPost("no frontmatter here, just text " + "mot ".repeat(700), topic);
    expect(res.ok).toBe(false);
  });
  it("rejects a charter violation in the FAQ frontmatter", async () => {
    const doc = buildDoc(goodBody).replace('"Après cinq jours ouvrés."', '"Vous devez attendre cinq jours."');
    const res = await validateBlogPost(doc, topic);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.violations.some((v) => v.includes("frontmatter"))).toBe(true);
  });
});
