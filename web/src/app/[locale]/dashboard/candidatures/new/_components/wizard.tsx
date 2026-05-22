"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { Candidature } from "@/lib/db/candidatures";
import {
  createDraft,
  upsertStep1,
  upsertStep2,
  upsertStep4,
} from "@/server/actions/candidatures";
import { WizardShell } from "./wizard-shell";

type WizardProps = {
  locale: string;
  candidature: Candidature | null;
  quotaRemaining: number;
};

export function Wizard({ locale, candidature, quotaRemaining }: WizardProps) {
  const t = useTranslations("app.candidatures.wizard");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [step, setStep] = useState<number>(candidature?.wizard_step ?? 1);
  const [candidatureId, setCandidatureId] = useState<string | null>(
    candidature?.id ?? null,
  );

  const [companyName, setCompanyName] = useState(
    candidature?.company_name ?? "",
  );
  const [companyWebsite, setCompanyWebsite] = useState(
    candidature?.company_website ?? "",
  );

  const [managerFirstName, setManagerFirstName] = useState(
    candidature?.manager_first_name ?? "",
  );
  const [managerLastName, setManagerLastName] = useState(
    candidature?.manager_last_name ?? "",
  );
  const [managerRole, setManagerRole] = useState(
    candidature?.manager_role ?? "",
  );
  const [managerLinkedinUrl, setManagerLinkedinUrl] = useState(
    candidature?.manager_linkedin_url ?? "",
  );
  const [targetRole, setTargetRole] = useState(
    candidature?.target_role ?? "",
  );

  const [offerUrl, setOfferUrl] = useState(candidature?.offer_url ?? "");
  const [offerText, setOfferText] = useState(candidature?.offer_text ?? "");

  const stepTitle = [
    t("step1Title"),
    t("step2Title"),
    t("step3Title"),
    t("step4Title"),
    t("step5Title"),
  ][step - 1];

  const stepLabel = t("stepLabel", { n: step });
  const quotaLabel =
    quotaRemaining > 0
      ? t("quotaRemaining", { n: quotaRemaining })
      : t("quotaExhausted");

  function handleBack() {
    setStep((s) => s - 1);
  }

  function handleNext() {
    startTransition(async () => {
      if (step === 1) {
        if (!candidatureId) {
          const { id } = await createDraft({ companyName, companyWebsite });
          setCandidatureId(id);
          router.replace(`/${locale}/dashboard/candidatures/new?c=${id}`);
        } else {
          await upsertStep1(candidatureId, { companyName, companyWebsite });
        }
        setStep(2);
      } else if (step === 2) {
        if (candidatureId) {
          await upsertStep2(candidatureId, {
            managerFirstName,
            managerLastName,
            managerRole,
            managerLinkedinUrl,
            targetRole,
          });
        }
        setStep(3);
      } else if (step === 3) {
        setStep(4);
      } else if (step === 4) {
        if (candidatureId) {
          await upsertStep4(candidatureId, { offerUrl, offerText });
        }
        setStep(5);
      }
    });
  }

  const isLastStep = step === 5;

  return (
    <WizardShell
      step={step}
      title={stepTitle}
      stepLabel={stepLabel}
      quotaLabel={quotaLabel}
      onBack={step > 1 ? handleBack : undefined}
      onNext={isLastStep ? undefined : handleNext}
      nextLabel={t("next")}
      backLabel={t("back")}
      nextDisabled={step === 1 && !companyName.trim()}
      busy={pending}
    >
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
              Entreprise
            </label>
            <input
              className="w-full h-11 px-4 rounded-xl border border-ink/15 bg-white font-sans text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-ink/20"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Dataiku, Qonto…"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
              Site web{" "}
              <span className="text-muted-soft font-normal">(facultatif)</span>
            </label>
            <input
              className="w-full h-11 px-4 rounded-xl border border-ink/15 bg-white font-sans text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-ink/20"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              placeholder="https://dataiku.com"
              type="url"
            />
          </div>
          <p className="font-serif italic text-[15px] text-burgundy">
            À venir — les champs détaillés arrivent en tâche 14.
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
                Prénom
              </label>
              <input
                className="w-full h-11 px-4 rounded-xl border border-ink/15 bg-white font-sans text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-ink/20"
                value={managerFirstName}
                onChange={(e) => setManagerFirstName(e.target.value)}
                placeholder="Thomas"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
                Nom
              </label>
              <input
                className="w-full h-11 px-4 rounded-xl border border-ink/15 bg-white font-sans text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-ink/20"
                value={managerLastName}
                onChange={(e) => setManagerLastName(e.target.value)}
                placeholder="Dupont"
              />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
              Poste du recruteur
            </label>
            <input
              className="w-full h-11 px-4 rounded-xl border border-ink/15 bg-white font-sans text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-ink/20"
              value={managerRole}
              onChange={(e) => setManagerRole(e.target.value)}
              placeholder="Engineering Manager"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
              LinkedIn{" "}
              <span className="text-muted-soft font-normal">(facultatif)</span>
            </label>
            <input
              className="w-full h-11 px-4 rounded-xl border border-ink/15 bg-white font-sans text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-ink/20"
              value={managerLinkedinUrl}
              onChange={(e) => setManagerLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/…"
              type="url"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
              Poste visé{" "}
              <span className="text-muted-soft font-normal">(facultatif)</span>
            </label>
            <input
              className="w-full h-11 px-4 rounded-xl border border-ink/15 bg-white font-sans text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-ink/20"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Stage Software Engineer"
            />
          </div>
          <p className="font-serif italic text-[15px] text-burgundy">
            À venir — les champs détaillés arrivent en tâche 14.
          </p>
        </div>
      )}

      {step === 3 && (
        <p className="font-serif italic text-[17px] text-burgundy">
          La recherche d&apos;email arrive en tâche 15.
        </p>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <div>
            <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
              URL de l&apos;offre{" "}
              <span className="text-muted-soft font-normal">(facultatif)</span>
            </label>
            <input
              className="w-full h-11 px-4 rounded-xl border border-ink/15 bg-white font-sans text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-ink/20"
              value={offerUrl}
              onChange={(e) => setOfferUrl(e.target.value)}
              placeholder="https://…"
              type="url"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
              Texte de l&apos;offre{" "}
              <span className="text-muted-soft font-normal">(facultatif)</span>
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-ink/15 bg-white font-sans text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-ink/20 min-h-[120px] resize-y"
              value={offerText}
              onChange={(e) => setOfferText(e.target.value)}
              placeholder="Colle le texte de l'offre ici…"
            />
          </div>
          <p className="font-serif italic text-[15px] text-burgundy">
            À venir — les champs détaillés arrivent en tâche 16.
          </p>
        </div>
      )}

      {step === 5 && (
        <p className="font-serif italic text-[17px] text-burgundy">
          La génération du message arrive en tâche 16.
        </p>
      )}
    </WizardShell>
  );
}
