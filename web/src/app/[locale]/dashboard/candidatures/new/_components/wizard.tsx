"use client";

import { useRef, useState, useTransition } from "react";
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
import { StepCible, type StepCibleHandle } from "./step-cible";
import { StepRecruteur, type StepRecruteurHandle } from "./step-recruteur";
import { StepEmail, type StepEmailHandle } from "./step-email";

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

  const step1Ref = useRef<StepCibleHandle>(null);
  const step2Ref = useRef<StepRecruteurHandle>(null);
  const step3Ref = useRef<StepEmailHandle>(null);

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
    if (step === 1) {
      step1Ref.current?.submit();
      return;
    }
    if (step === 2) {
      step2Ref.current?.submit();
      return;
    }
    if (step === 3) {
      step3Ref.current?.submit();
      return;
    }
    startTransition(async () => {
      if (step === 4) {
        if (candidatureId) {
          await upsertStep4(candidatureId, { offerUrl, offerText });
        }
        setStep(5);
      }
    });
  }

  function handleStep1Complete(values: { companyName: string; companyWebsite: string }) {
    startTransition(async () => {
      if (!candidatureId) {
        const { id } = await createDraft(values);
        setCandidatureId(id);
        router.replace(`/${locale}/dashboard/candidatures/new?c=${id}`);
      } else {
        await upsertStep1(candidatureId, values);
      }
      setStep(2);
    });
  }

  function handleStep2Complete(values: {
    managerFirstName: string;
    managerLastName: string;
    managerRole: string;
    managerLinkedinUrl: string;
    targetRole: string;
  }) {
    startTransition(async () => {
      if (candidatureId) {
        await upsertStep2(candidatureId, values);
      }
      setStep(3);
    });
  }

  function handleStep3Complete() {
    setStep(4);
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
      busy={pending}
    >
      {step === 1 && (
        <StepCible
          ref={step1Ref}
          initialCompanyName={candidature?.company_name ?? ""}
          initialCompanyWebsite={candidature?.company_website ?? ""}
          onComplete={handleStep1Complete}
        />
      )}

      {step === 2 && (
        <StepRecruteur
          ref={step2Ref}
          initialManagerFirstName={candidature?.manager_first_name ?? ""}
          initialManagerLastName={candidature?.manager_last_name ?? ""}
          initialManagerRole={candidature?.manager_role ?? ""}
          initialManagerLinkedinUrl={candidature?.manager_linkedin_url ?? ""}
          initialTargetRole={candidature?.target_role ?? ""}
          onComplete={handleStep2Complete}
        />
      )}

      {step === 3 && candidatureId && (
        <StepEmail
          ref={step3Ref}
          candidatureId={candidatureId}
          initialEmail={candidature?.manager_email ?? null}
          initialConfidence={candidature?.manager_email_confidence ?? null}
          quotaRemaining={quotaRemaining}
          onComplete={handleStep3Complete}
        />
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
