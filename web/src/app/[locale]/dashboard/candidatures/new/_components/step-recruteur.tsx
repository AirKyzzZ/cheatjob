"use client";

import {
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field-error";
import { Step2Schema } from "@/server/actions/candidatures.schemas";

export type StepRecruteurValues = {
  managerFirstName: string;
  managerLastName: string;
  managerRole: string;
  managerLinkedinUrl: string;
  targetRole: string;
};

export type StepRecruteurHandle = {
  submit: () => void;
};

type Props = {
  initialManagerFirstName?: string;
  initialManagerLastName?: string;
  initialManagerRole?: string;
  initialManagerLinkedinUrl?: string;
  initialTargetRole?: string;
  onComplete: (values: StepRecruteurValues) => void;
};

type FieldErrors = Partial<Record<keyof StepRecruteurValues, string>>;

export const StepRecruteur = forwardRef<StepRecruteurHandle, Props>(
  function StepRecruteur(
    {
      initialManagerFirstName = "",
      initialManagerLastName = "",
      initialManagerRole = "",
      initialManagerLinkedinUrl = "",
      initialTargetRole = "",
      onComplete,
    },
    ref,
  ) {
    const t = useTranslations("app.candidatures.wizard");

    const [managerFirstName, setManagerFirstName] = useState(
      initialManagerFirstName,
    );
    const [managerLastName, setManagerLastName] = useState(
      initialManagerLastName,
    );
    const [managerRole, setManagerRole] = useState(initialManagerRole);
    const [managerLinkedinUrl, setManagerLinkedinUrl] = useState(
      initialManagerLinkedinUrl,
    );
    const [targetRole, setTargetRole] = useState(initialTargetRole);

    const [errors, setErrors] = useState<FieldErrors>({});

    function clearError(field: keyof StepRecruteurValues) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    function validate(): boolean {
      const result = Step2Schema.safeParse({
        managerFirstName,
        managerLastName,
        managerRole,
        managerLinkedinUrl,
        targetRole,
      });
      if (result.success) {
        setErrors({});
        return true;
      }
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
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
          onComplete({
            managerFirstName,
            managerLastName,
            managerRole,
            managerLinkedinUrl,
            targetRole,
          });
        }
      },
    }));

    return (
      <div className="space-y-6">
        <p className="font-serif italic text-[15px] text-burgundy leading-snug">
          {t("step2Hint", { team: "l'équipe" })}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
              {t("step2FirstNameLabel")}
            </label>
            <Input
              value={managerFirstName}
              onChange={(e) => {
                setManagerFirstName(e.target.value);
                clearError("managerFirstName");
              }}
              placeholder="Thomas"
              invalid={!!errors.managerFirstName}
              autoFocus
            />
            <FieldError message={errors.managerFirstName} />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
              {t("step2LastNameLabel")}
            </label>
            <Input
              value={managerLastName}
              onChange={(e) => {
                setManagerLastName(e.target.value);
                clearError("managerLastName");
              }}
              placeholder="Dupont"
              invalid={!!errors.managerLastName}
            />
            <FieldError message={errors.managerLastName} />
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
            {t("step2ManagerRoleLabel")}
          </label>
          <Input
            value={managerRole}
            onChange={(e) => {
              setManagerRole(e.target.value);
              clearError("managerRole");
            }}
            placeholder="Engineering Manager"
            invalid={!!errors.managerRole}
          />
          <FieldError message={errors.managerRole} />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
            {t("step2LinkedinLabel")}{" "}
            <span className="text-muted-soft font-normal">
              ({t("step1Optional")})
            </span>
          </label>
          <Input
            value={managerLinkedinUrl}
            onChange={(e) => {
              setManagerLinkedinUrl(e.target.value);
              clearError("managerLinkedinUrl");
            }}
            placeholder="https://linkedin.com/in/…"
            type="url"
            invalid={!!errors.managerLinkedinUrl}
          />
          <FieldError message={errors.managerLinkedinUrl} />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
            {t("step2TargetRoleLabel")}{" "}
            <span className="text-muted-soft font-normal">
              ({t("step1Optional")})
            </span>
          </label>
          <Input
            value={targetRole}
            onChange={(e) => {
              setTargetRole(e.target.value);
              clearError("targetRole");
            }}
            placeholder="Stage Software Engineer"
            invalid={!!errors.targetRole}
          />
          <FieldError message={errors.targetRole} />
        </div>
      </div>
    );
  },
);
