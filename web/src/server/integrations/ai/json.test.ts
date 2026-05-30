import { describe, it, expect } from "vitest";
import { extractJsonObject } from "./json";

describe("extractJsonObject", () => {
  it("parses a raw JSON object", () => {
    expect(extractJsonObject('{"subject":"A","body":"B"}')).toEqual({ subject: "A", body: "B" });
  });

  it("strips ```json fences (the real Sonnet/Haiku failure mode)", () => {
    const fenced = '```json\n{\n  "subject": "Stage",\n  "body": "Bonjour Thomas,\\n\\nVoici."\n}\n```';
    expect(extractJsonObject(fenced)).toEqual({ subject: "Stage", body: "Bonjour Thomas,\n\nVoici." });
  });

  it("strips bare ``` fences with no language tag", () => {
    expect(extractJsonObject('```\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it("recovers JSON wrapped in prose via the outermost-brace fallback", () => {
    expect(extractJsonObject('Voici le résultat : {"a":1} — merci !')).toEqual({ a: 1 });
  });

  it("handles leading/trailing whitespace", () => {
    expect(extractJsonObject('   {"a":1}   ')).toEqual({ a: 1 });
  });

  it("prefers a JSON fence over an earlier prose/reasoning fence", () => {
    const input = '```text\nlet me think...\n```\n```json\n{"subject":"A","body":"B"}\n```';
    expect(extractJsonObject(input)).toEqual({ subject: "A", body: "B" });
  });

  it("throws when there is no JSON object at all", () => {
    expect(() => extractJsonObject("désolé, je ne peux pas")).toThrow();
  });
});
