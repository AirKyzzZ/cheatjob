"use client";

import {
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field-error";
import { Step1Schema } from "@/server/actions/candidatures.schemas";

export type StepCibleValues = {
  companyName: string;
  companyWebsite: string;
};

export type StepCibleHandle = {
  submit: () => void;
};

type Props = {
  initialCompanyName?: string;
  initialCompanyWebsite?: string;
  onComplete: (values: StepCibleValues) => void;
};

export const StepCible = forwardRef<StepCibleHandle, Props>(
  function StepCible(
    { initialCompanyName = "", initialCompanyWebsite = "", onComplete },
    ref,
  ) {
    const t = useTranslations("app.candidatures.wizard");

    const [companyName, setCompanyName] = useState(initialCompanyName);
    const [companyWebsite, setCompanyWebsite] = useState(initialCompanyWebsite);

    const [errors, setErrors] = useState<{
      companyName?: string;
      companyWebsite?: string;
    }>({});

    function validate(): boolean {
      const result = Step1Schema.safeParse({ companyName, companyWebsite });
      if (result.success) {
        setErrors({});
        return true;
      }
      const fieldErrors: typeof errors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof typeof fieldErrors;
        if (!fieldErrors[field]) {
          fieldErrors[field] =
            issue.code === "too_small"
              ? t("errorRequired")
              : issue.code === "too_big"
                ? t("errorTooLong")
                : t("errorInvalidUrl");
        }
      }
      setErrors(fieldErrors);
      return false;
    }

    useImperativeHandle(ref, () => ({
      submit() {
        if (validate()) {
          onComplete({ companyName, companyWebsite });
        }
      },
    }));

    return (
      <div className="space-y-6">
        <p className="font-serif italic text-[15px] text-burgundy leading-snug">
          {t("step1Hint")}
        </p>

        <div>
          <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
            {t("step1CompanyNameLabel")}
          </label>
          <Input
            value={companyName}
            onChange={(e) => {
              setCompanyName(e.target.value);
              if (errors.companyName) setErrors((prev) => ({ ...prev, companyName: undefined }));
            }}
            placeholder="Dataiku, Qonto…"
            invalid={!!errors.companyName}
            autoFocus
          />
          <FieldError message={errors.companyName} />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
            {t("step1CompanyWebsiteLabel")}{" "}
            <span className="text-muted-soft font-normal">
              ({t("step1Optional")})
            </span>
          </label>
          <Input
            value={companyWebsite}
            onChange={(e) => {
              setCompanyWebsite(e.target.value);
              if (errors.companyWebsite)
                setErrors((prev) => ({ ...prev, companyWebsite: undefined }));
            }}
            placeholder="https://dataiku.com"
            type="url"
            invalid={!!errors.companyWebsite}
          />
          <FieldError message={errors.companyWebsite} />
        </div>
      </div>
    );
  },
);
