"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import type { Profile } from "@/lib/db/profiles";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { FieldError } from "@/components/ui/field-error";
import { updateProfileAction } from "@/server/actions/profile";
import { track, EVENTS } from "@/lib/analytics/events";

const LEVELS = ["L3", "M1", "M2", "BTS2", "DUT2", "other"] as const;

function levelLabel(value: string) {
  return value === "other" ? "Autre" : value;
}

export function IdentityCard({ profile }: { profile: Profile }) {
  const t = useTranslations("app.profile.identity");
  const tErrors = useTranslations("auth.errors");
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [school, setSchool] = useState(profile.school ?? "");
  const [studyLevel, setStudyLevel] = useState(profile.study_level ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!editing) {
    return (
      <Card>
        <CardHeader className="flex items-start justify-between mb-6">
          <CardTitle>{t("title")}</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            {t("edit")}
          </Button>
        </CardHeader>
        <dl className="space-y-4">
          <Row label={t("fullName")} value={profile.full_name} />
          <Row label={t("school")} value={profile.school} />
          <Row
            label={t("studyLevel")}
            value={profile.study_level ? levelLabel(profile.study_level) : null}
          />
        </dl>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <div className="space-y-5">
        <div>
          <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
            {t("fullName")}
          </label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            minLength={2}
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
            {t("school")}
          </label>
          <Input
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            minLength={2}
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-ink mb-2 font-sans">
            {t("studyLevel")}
          </label>
          <RadioGroup
            name="studyLevel"
            value={studyLevel}
            onChange={setStudyLevel}
            options={LEVELS.map((v) => ({ value: v, label: levelLabel(v) }))}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button
            size="md"
            loading={pending}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                try {
                  await updateProfileAction({
                    fullName: fullName || undefined,
                    school: school || undefined,
                    studyLevel: studyLevel
                      ? (studyLevel as (typeof LEVELS)[number])
                      : undefined,
                  });
                  track(EVENTS.ProfileUpdated, { field: "identity" });
                  setEditing(false);
                } catch (err) {
                  setError(err instanceof Error ? err.message : tErrors("generic"));
                }
              })
            }
          >
            {t("save")}
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={() => {
              setEditing(false);
              setFullName(profile.full_name ?? "");
              setSchool(profile.school ?? "");
              setStudyLevel(profile.study_level ?? "");
              setError(null);
            }}
          >
            {t("cancel")}
          </Button>
        </div>
        <FieldError message={error ?? undefined} />
      </div>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 border-b border-border-subtle last:border-b-0">
      <dt className="text-[13px] uppercase tracking-[0.12em] font-sans text-muted-soft">
        {label}
      </dt>
      <dd className="font-sans text-[15px] text-ink text-right">
        {value || <span className="text-muted-soft italic font-serif">--</span>}
      </dd>
    </div>
  );
}
