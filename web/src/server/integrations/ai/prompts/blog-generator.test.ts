import { describe, it, expect } from "vitest";
import { buildBlogPrompt, BLOG_PROMPT_VERSION } from "./blog-generator";

const topic = {
  slug: "relance-apres-entretien",
  title: "La relance après entretien",
  tool: "relancer-un-recruteur" as const,
  angle: "Le message de remerciement qui relance.",
};

describe("buildBlogPrompt", () => {
  it("has a version tag", () => {
    expect(BLOG_PROMPT_VERSION).toMatch(/^blog-/);
  });
  it("injects the date and tool into the system prompt", () => {
    const [system] = buildBlogPrompt(topic, "2026-06-05");
    expect(system.role).toBe("system");
    expect(system.content).toContain("2026-06-05");
    expect(system.content).toContain("relancer-un-recruteur");
  });
  it("forbids em dashes, vous and piston in the instructions", () => {
    const [system] = buildBlogPrompt(topic, "2026-06-05");
    expect(system.content).toContain("piston");
    expect(system.content.toLowerCase()).toContain("vous");
    expect(system.content).toMatch(/tiret/i);
  });
  it("passes the topic angle in the user turn", () => {
    const [, user] = buildBlogPrompt(topic, "2026-06-05");
    expect(user.role).toBe("user");
    expect(user.content).toContain(topic.angle);
  });
});
