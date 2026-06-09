import { describe, expect, it } from "vitest";
import {
  buildCvOptimizerPrompt,
  parseCvAnalysis,
  CvAnalysisSchema,
} from "./cv-optimizer";

describe("buildCvOptimizerPrompt", () => {
  it("includes the CV, the offer, and the JSON keys", () => {
    const messages = buildCvOptimizerPrompt({
      cv: "M2 droit, stage Clifford Chance",
      offer: "Juriste junior chez Qonto",
      full: false,
    });
    expect(messages[0].role).toBe("system");
    expect(messages[1].content).toContain("M2 droit");
    expect(messages[1].content).toContain("Qonto");
    expect(messages[1].content).toContain('"lacunes"');
  });

  it("asks for reecritures only in full mode", () => {
    const free = buildCvOptimizerPrompt({ cv: "x", offer: "y", full: false });
    const full = buildCvOptimizerPrompt({ cv: "x", offer: "y", full: true });
    expect(free[1].content).toContain('"reecritures": []');
    expect(full[1].content).toContain("3 réécritures");
  });
});

describe("parseCvAnalysis", () => {
  const valid = {
    score: 62,
    forces: ["stage pertinent"],
    lacunes: ["aucun chiffre"],
    mots_cles: ["conformité"],
    conseils: ["quantifie tes résultats"],
    reecritures: [],
  };

  it("parses a plain JSON object", () => {
    expect(parseCvAnalysis(JSON.stringify(valid))).toEqual(valid);
  });

  it("parses a fenced JSON object", () => {
    expect(parseCvAnalysis("```json\n" + JSON.stringify(valid) + "\n```")).toEqual(valid);
  });

  it("returns null on garbage", () => {
    expect(parseCvAnalysis("pas du json")).toBeNull();
  });

  it("returns null when required keys are missing", () => {
    expect(parseCvAnalysis(JSON.stringify({ score: 50 }))).toBeNull();
  });

  it("clamps via schema: rejects out-of-range score", () => {
    expect(parseCvAnalysis(JSON.stringify({ ...valid, score: 150 }))).toBeNull();
  });
});

describe("CvAnalysisSchema", () => {
  it("defaults optional arrays", () => {
    const parsed = CvAnalysisSchema.parse({
      score: 50,
      forces: ["a"],
      lacunes: ["b"],
      conseils: ["c"],
    });
    expect(parsed.mots_cles).toEqual([]);
    expect(parsed.reecritures).toEqual([]);
  });
});
