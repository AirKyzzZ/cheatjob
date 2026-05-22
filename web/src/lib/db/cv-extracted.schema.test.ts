import { describe, it, expect } from "vitest";
import { CvExtractedSchema, parseCvExtraction } from "./cv-extracted.schema";

describe("CvExtractedSchema", () => {
  it("accepts a complete extraction", () => {
    const ok = {
      full_name: "Maxime",
      school: "KEDGE",
      field_of_study: "Management",
      experiences: [{ title: "Stage", org: "Klyx", dates: "2025", summary: "Dev" }],
      skills: ["React"],
      projects: [],
      languages: ["FR", "EN"],
    };
    expect(CvExtractedSchema.safeParse(ok).success).toBe(true);
  });

  it("parseCvExtraction always returns a raw field even on garbage", () => {
    const result = parseCvExtraction("not json at all", "RAW TEXT");
    expect(result.raw).toBe("RAW TEXT");
    expect(result.skills).toEqual([]);
  });

  it("parseCvExtraction merges valid AI JSON with raw", () => {
    const json = JSON.stringify({ full_name: "Maxime", skills: ["Go"] });
    const result = parseCvExtraction(json, "RAW TEXT");
    expect(result.full_name).toBe("Maxime");
    expect(result.skills).toEqual(["Go"]);
    expect(result.raw).toBe("RAW TEXT");
  });
});
