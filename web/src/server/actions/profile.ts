"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerClient } from "@/lib/supabase/server";
import { updateProfile } from "@/lib/db/profiles";
import {
  LocaleEnum,
  UpdateProfileSchema,
  UpdateLocaleSchema,
  GetUploadUrlSchema,
  FinalizeUploadSchema,
} from "./profile.schemas";
import { parseCV } from "./cv-parser";
import { CVParseError } from "./cv-parser.errors";

async function requireUser() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

export async function updateProfileAction(input: unknown) {
  const parsed = UpdateProfileSchema.parse(input);
  const { supabase, user } = await requireUser();

  await updateProfile(supabase, user.id, {
    ...(parsed.fullName !== undefined && { full_name: parsed.fullName }),
    ...(parsed.school !== undefined && { school: parsed.school }),
    ...(parsed.studyLevel !== undefined && { study_level: parsed.studyLevel }),
  });

  revalidatePath(`/[locale]/dashboard/profile`, "page");
  return { ok: true as const };
}

export async function updateLocaleAction(input: unknown, currentLocale: string) {
  const parsed = UpdateLocaleSchema.parse(input);
  const currentParsed = LocaleEnum.parse(currentLocale);
  const { supabase, user } = await requireUser();

  await updateProfile(supabase, user.id, { locale: parsed.locale });

  if (parsed.locale === currentParsed) {
    revalidatePath(`/[locale]/dashboard/profile`, "page");
    return { ok: true as const };
  }
  redirect(`/${parsed.locale}/dashboard/profile`);
}

export async function getCvUploadUrl(input: unknown) {
  const parsed = GetUploadUrlSchema.parse(input);
  const { supabase, user } = await requireUser();

  const ext = parsed.mimeType === "application/pdf" ? "pdf" : "docx";
  const path = `${user.id}/cv.${ext}`;

  const { data, error } = await supabase.storage
    .from("cv-files")
    .createSignedUploadUrl(path);

  if (error) throw new Error(error.message);
  return { uploadUrl: data.signedUrl, token: data.token, path };
}

export async function finalizeCvUpload(input: unknown) {
  const parsed = FinalizeUploadSchema.parse(input);
  const { supabase, user } = await requireUser();

  if (!parsed.storagePath.startsWith(`${user.id}/`)) {
    throw new Error("Storage path does not match user id");
  }

  await updateProfile(supabase, user.id, {
    cv_storage_path: parsed.storagePath,
    cv_uploaded_at: new Date().toISOString(),
  });

  let parseError = false;
  try {
    await parseCV(parsed.storagePath);
  } catch (err) {
    if (err instanceof CVParseError) {
      parseError = true;
    } else {
      throw err;
    }
  }

  revalidatePath(`/[locale]/dashboard/profile`, "page");
  return { ok: true as const, parseError };
}

export async function deleteCv() {
  const { supabase, user } = await requireUser();

  await supabase.storage
    .from("cv-files")
    .remove([`${user.id}/cv.pdf`, `${user.id}/cv.docx`]);

  await updateProfile(supabase, user.id, {
    cv_storage_path: null,
    cv_uploaded_at: null,
  });

  revalidatePath(`/[locale]/dashboard/profile`, "page");
  return { ok: true as const };
}

export async function getCvDownloadUrl() {
  const { supabase, user } = await requireUser();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("cv_storage_path")
    .eq("user_id", user.id)
    .single();

  if (profileError) throw new Error(profileError.message);
  if (!profile?.cv_storage_path) return null;

  const { data, error } = await supabase.storage
    .from("cv-files")
    .createSignedUrl(profile.cv_storage_path, 300);

  if (error) throw new Error(error.message);
  return data.signedUrl;
}
