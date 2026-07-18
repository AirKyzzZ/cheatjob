import { describe, expect, it } from "vitest";
import { buildLettrePrompt } from "./lettre-full";

describe("buildLettrePrompt", () => {
  it("grounds the letter in the profile and the offer, JSON contract", () => {
    const messages = buildLettrePrompt({
      profile: { full_name: "Léa Test", school: "KEDGE", about_me: "M2 marketing" },
      cvExtracted: { skills: ["SEO"] },
      lettre: {
        targetRole: "Chargée de marketing",
        targetCompany: "Back Market",
        recruiterName: "Camille",
        offerContext: "CDI marketing direct",
      },
    });
    expect(messages[0].content).toContain("lettre de motivation");
    expect(messages[1].content).toContain("Back Market");
    expect(messages[1].content).toContain("SEO");
    expect(messages[1].content).toContain('"subject"');
  });
});
