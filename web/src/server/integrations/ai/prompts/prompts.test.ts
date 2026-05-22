import { describe, it, expect } from "vitest";
import { buildDraftPrompt, DRAFT_PROMPT_VERSION } from "./draft-initial";
import { buildCvExtractPrompt, CV_EXTRACT_PROMPT_VERSION } from "./cv-extract";

describe("buildDraftPrompt", () => {
  const ctx = {
    profile: { full_name: "Maxime", school: "KEDGE", study_level: "M2", about_me: "Motivé." },
    cvExtracted: { skills: ["React"], experiences: [], raw: "cv text" },
    candidature: {
      company_name: "Qonto",
      target_role: "Stage produit",
      manager_first_name: "Jean",
      manager_role: "Head of Product",
      offer_text: "Nous cherchons un stagiaire produit.",
    },
  };

  it("returns a system message and a user message", () => {
    const messages = buildDraftPrompt(ctx);
    expect(messages[0].role).toBe("system");
    expect(messages.at(-1)?.role).toBe("user");
  });

  it("includes company and manager context in the variable suffix", () => {
    const messages = buildDraftPrompt(ctx);
    const joined = messages.map((m) => m.content).join("\n");
    expect(joined).toContain("Qonto");
    expect(joined).toContain("Jean");
  });

  it("exposes a stable version string", () => {
    expect(typeof DRAFT_PROMPT_VERSION).toBe("string");
  });
});

describe("buildCvExtractPrompt", () => {
  it("includes the raw CV text and asks for JSON", () => {
    const messages = buildCvExtractPrompt("Maxime Mansiet — M2 KEDGE");
    const joined = messages.map((m) => m.content).join("\n");
    expect(joined).toContain("Maxime Mansiet");
    expect(joined.toLowerCase()).toContain("json");
    expect(typeof CV_EXTRACT_PROMPT_VERSION).toBe("string");
  });
});
