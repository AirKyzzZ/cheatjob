import { describe, it, expect } from "vitest";
import { buildToolPrompt, parseToolEmail, type ToolInputs } from "./tool-generator";

const inputs: ToolInputs = {
  targetRole: "Stage produit",
  targetCompany: "Qonto",
  recruiterName: "Jean",
  you: "Étudiant M2 KEDGE, passionné de produit.",
  whyCompany: "J'adore votre approche de la fintech.",
  originalContext: "J'ai postulé il y a deux semaines.",
  offerContext: "Stage de 6 mois, équipe produit.",
};

describe("buildToolPrompt", () => {
  it("returns a system then user message", () => {
    const messages = buildToolPrompt("candidature_spontanee", inputs);
    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe("system");
    expect(messages[1].role).toBe("user");
  });

  it("includes the company, role and the Objet/Message format in the user message", () => {
    const user = buildToolPrompt("candidature_spontanee", inputs)[1].content;
    expect(user).toContain("Qonto");
    expect(user).toContain("Stage produit");
    expect(user).toContain("Objet:");
    expect(user).toContain("Message:");
  });

  it("uses a different system prompt for each mode", () => {
    const spont = buildToolPrompt("candidature_spontanee", inputs)[0].content;
    const relance = buildToolPrompt("relance", inputs)[0].content;
    const motivation = buildToolPrompt("motivation", inputs)[0].content;
    const lettre = buildToolPrompt("lettre", inputs)[0].content;
    expect(spont).not.toBe(relance);
    expect(relance).not.toBe(motivation);
    expect(spont).not.toBe(motivation);
    expect(lettre).not.toBe(spont);
    expect(lettre).not.toBe(relance);
    expect(lettre).not.toBe(motivation);
  });

  it("builds a lettre prompt with the lettre system voice", () => {
    const messages = buildToolPrompt("lettre", {
      targetRole: "Chef de projet junior",
      targetCompany: "Qonto",
      you: "M2 management, stage chez Alan",
      offerContext: "CDI chef de projet ops",
    });
    expect(messages[0].content).toContain("lettre de motivation");
    expect(messages[1].content).toContain("Qonto");
    expect(messages[1].content).toContain("Objet:");
  });
});

describe("parseToolEmail", () => {
  it("parses a well-formed response with a multiline body", () => {
    const out = parseToolEmail(
      "Objet: Relance candidature\nMessage:\nBonjour,\n\nJe reviens vers vous.\n\nCordialement",
    );
    expect(out).toEqual({
      subject: "Relance candidature",
      body: "Bonjour,\n\nJe reviens vers vous.\n\nCordialement",
    });
  });

  it("tolerates code fences and surrounding noise", () => {
    expect(parseToolEmail("```\nObjet: Test\nMessage:\nCorps ici\n```")).toEqual({
      subject: "Test",
      body: "Corps ici",
    });
  });

  it("returns null when the Objet line is missing", () => {
    expect(parseToolEmail("juste du texte sans format")).toBeNull();
    expect(parseToolEmail("Message:\nun corps sans objet")).toBeNull();
  });

  it("returns null when the body is empty", () => {
    expect(parseToolEmail("Objet: Coucou\nMessage:\n   ")).toBeNull();
  });
});
