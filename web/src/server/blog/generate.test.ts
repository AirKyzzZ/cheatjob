import { describe, it, expect } from "vitest";
import { stripFences } from "./generate";

describe("stripFences", () => {
  it("returns the doc unchanged when there is no fence", () => {
    const doc = "---\ntitle: x\n---\n\n## a\n\ncorps";
    expect(stripFences(doc)).toBe(doc);
  });
  it("unwraps a ```mdx ... ``` fence", () => {
    const doc = "---\ntitle: x\n---\n\ncorps";
    expect(stripFences("```mdx\n" + doc + "\n```")).toBe(doc);
  });
  it("unwraps a bare ``` fence", () => {
    const doc = "hello";
    expect(stripFences("```\n" + doc + "\n```")).toBe(doc);
  });
});
