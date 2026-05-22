"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { useTranslations } from "next-intl";
import { Step4Schema } from "@/server/actions/candidatures.schemas";

export type StepOfferValues = {
  offerUrl: string;
  offerText: string;
};

export type StepOfferHandle = {
  submit: () => void;
};

type Props = {
  initialOfferUrl?: string;
  initialOfferText?: string;
  onComplete: (values: StepOfferValues) => void;
};

export const StepOffer = forwardRef<StepOfferHandle, Props>(
  function StepOffer(
    { initialOfferUrl = "", initialOfferText = "", onComplete },
    ref,
  ) {
    const t = useTranslations("app.candidatures.wizard");

    const [offerUrl, setOfferUrl] = useState(initialOfferUrl);
    const [offerText, setOfferText] = useState(initialOfferText);

    useImperativeHandle(ref, () => ({
      submit() {
        const result = Step4Schema.safeParse({ offerUrl, offerText });
        if (result.success) {
          onComplete({ offerUrl, offerText });
        }
      },
    }));

    return (
      <div className="space-y-6">
        <div>
          <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
            {t("step4OfferUrlLabel")}{" "}
            <span className="text-muted-soft font-normal">
              ({t("step1Optional")})
            </span>
          </label>
          <input
            className="w-full h-11 px-4 rounded-xl border border-ink/15 bg-white font-sans text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-ink/20"
            value={offerUrl}
            onChange={(e) => setOfferUrl(e.target.value)}
            placeholder="https://…"
            type="url"
          />
          <p className="mt-1.5 text-[12px] text-muted-soft font-sans">
            {t("step4OfferUrlHint")}
          </p>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
            {t("step4OfferTextLabel")}{" "}
            <span className="text-muted-soft font-normal">
              ({t("step1Optional")})
            </span>
          </label>
          <textarea
            className="w-full px-4 py-3 rounded-xl border border-ink/15 bg-white font-sans text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-ink/20 min-h-[160px] resize-y"
            value={offerText}
            onChange={(e) => setOfferText(e.target.value)}
            placeholder={t("step4OfferTextPlaceholder")}
          />
        </div>
      </div>
    );
  },
);
