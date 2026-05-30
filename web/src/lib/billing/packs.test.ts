import { describe, it, expect } from "vitest";
import { creditGrantForSession, isPackKey } from "./packs";

describe("creditGrantForSession", () => {
  it("grants the pack's credits for valid metadata", () => {
    expect(creditGrantForSession({ user_id: "u1", pack: "terrain" }, null)).toEqual({
      userId: "u1",
      credits: 50,
    });
  });

  it("falls back to client_reference_id when metadata.user_id is absent", () => {
    expect(creditGrantForSession({ pack: "decollage" }, "u2")).toEqual({
      userId: "u2",
      credits: 15,
    });
  });

  it("maps each pack to its credit amount", () => {
    expect(creditGrantForSession({ user_id: "u", pack: "decollage" }, null)?.credits).toBe(15);
    expect(creditGrantForSession({ user_id: "u", pack: "terrain" }, null)?.credits).toBe(50);
    expect(creditGrantForSession({ user_id: "u", pack: "reseau" }, null)?.credits).toBe(120);
  });

  it("returns null for an unknown pack", () => {
    expect(creditGrantForSession({ user_id: "u1", pack: "bogus" }, null)).toBeNull();
  });

  it("returns null without a user id", () => {
    expect(creditGrantForSession({ pack: "reseau" }, null)).toBeNull();
  });

  it("returns null for missing metadata", () => {
    expect(creditGrantForSession(null, null)).toBeNull();
  });
});

describe("isPackKey", () => {
  it("recognizes the three packs and rejects others", () => {
    expect(isPackKey("decollage")).toBe(true);
    expect(isPackKey("terrain")).toBe(true);
    expect(isPackKey("reseau")).toBe(true);
    expect(isPackKey("saison")).toBe(false);
  });
});
