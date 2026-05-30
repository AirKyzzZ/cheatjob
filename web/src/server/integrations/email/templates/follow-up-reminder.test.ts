import { describe, it, expect } from "vitest";
import { renderFollowUpReminder } from "./follow-up-reminder";

const BASE = {
  recruiterName: "Thomas",
  companyName: "Qonto",
  candidatureUrl: "https://www.cheatjob.com/fr/dashboard/candidatures/abc-123",
  locale: "fr",
};

describe("renderFollowUpReminder", () => {
  it("builds subject, html and text with recruiter, company and CTA url", () => {
    const out = renderFollowUpReminder(BASE);
    expect(out.subject).toContain("Thomas");
    expect(out.subject).toContain("Qonto");
    expect(out.html).toContain(BASE.candidatureUrl);
    expect(out.html).toContain("Relancer maintenant");
    expect(out.html).toContain("cheatjob");
    expect(out.text).toContain(BASE.candidatureUrl);
  });

  it("falls back to French for an unknown locale", () => {
    const out = renderFollowUpReminder({ ...BASE, locale: "xx" });
    expect(out.subject).toContain("Relance");
  });

  it("localizes per supported locale", () => {
    expect(renderFollowUpReminder({ ...BASE, locale: "en" }).subject).toContain("Follow up");
    expect(renderFollowUpReminder({ ...BASE, locale: "es" }).subject).toContain("seguimiento");
    expect(renderFollowUpReminder({ ...BASE, locale: "de" }).subject).toContain("nachfassen");
  });

  it("uses a default recruiter label when name is null", () => {
    const out = renderFollowUpReminder({ ...BASE, recruiterName: null });
    expect(out.subject).toContain("le recruteur");
  });

  it("escapes HTML in the body but keeps the subject raw", () => {
    const out = renderFollowUpReminder({ ...BASE, companyName: "Tom & <b>Co</b>" });
    expect(out.html).toContain("Tom &amp; &lt;b&gt;Co&lt;/b&gt;");
    expect(out.html).not.toContain("<b>Co</b>");
    expect(out.subject).toContain("Tom & <b>Co</b>");
  });

  it("strips newlines/control chars from the subject", () => {
    const out = renderFollowUpReminder({ ...BASE, companyName: "Evil\r\nInjected" });
    expect(out.subject).not.toMatch(/[\r\n\t]/);
  });
});
