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
import { track, EVENTS } from "@/lib/analytics/events";
import { WizardShell } from "./wizard-shell";
import { StepCible, type StepCibleHandle } from "./step-cible";
import { StepRecruteur, type StepRecruteurHandle } from "./step-recruteur";
import { StepEmail, type StepEmailHandle } from "./step-email";
import { StepOffer, type StepOfferHandle } from "./step-offer";
import { StepGenerate } from "./step-generate";

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
  const step4Ref = useRef<StepOfferHandle>(null);

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
    if (step === 4) {
      step4Ref.current?.submit();
      return;
    }
  }

  function handleStep1Complete(values: { companyName: string; companyWebsite: string }) {
    startTransition(async () => {
      if (!candidatureId) {
        const { id } = await createDraft(values);
        setCandidatureId(id);
        track(EVENTS.CandidatureCreated);
        router.replace(`/${locale}/dashboard/candidatures/new?c=${id}`);
      } else {
        await upsertStep1(candidatureId, values);
      }
      track(EVENTS.CandidatureWizardStep, { step: 2 });
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
      track(EVENTS.CandidatureWizardStep, { step: 3 });
      setStep(3);
    });
  }

  function handleStep3Complete() {
    track(EVENTS.CandidatureWizardStep, { step: 4 });
    setStep(4);
  }

  function handleStep4Complete(values: { offerUrl: string; offerText: string }) {
    startTransition(async () => {
      if (candidatureId) {
        await upsertStep4(candidatureId, values);
      }
      track(EVENTS.CandidatureWizardStep, { step: 5 });
      setStep(5);
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
        <StepOffer
          ref={step4Ref}
          initialOfferUrl={candidature?.offer_url ?? ""}
          initialOfferText={candidature?.offer_text ?? ""}
          onComplete={handleStep4Complete}
        />
      )}

      {step === 5 && candidatureId && (
        <StepGenerate candidatureId={candidatureId} locale={locale} />
      )}
    </WizardShell>
  );
}
