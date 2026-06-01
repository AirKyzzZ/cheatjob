import { describe, it, expect } from "vitest";
import { buildToolPrompt, type ToolInputs } from "./tool-generator";

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

  it("includes the target company, role and asks for JSON in the user message", () => {
    const user = buildToolPrompt("candidature_spontanee", inputs)[1].content;
    expect(user).toContain("Qonto");
    expect(user).toContain("Stage produit");
    expect(user).toContain("JSON");
  });

  it("uses a different system prompt for each mode", () => {
    const spont = buildToolPrompt("candidature_spontanee", inputs)[0].content;
    const relance = buildToolPrompt("relance", inputs)[0].content;
    const motivation = buildToolPrompt("motivation", inputs)[0].content;
    expect(spont).not.toBe(relance);
    expect(relance).not.toBe(motivation);
    expect(spont).not.toBe(motivation);
  });
});
