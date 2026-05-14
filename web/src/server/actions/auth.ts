"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getServerClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/db/profiles";

const LocaleEnum = z.enum(["fr", "en", "es", "de"]);

export const SignUpSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(72),
  locale: LocaleEnum,
});

export const SignInSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(72),
});

export const ResetRequestSchema = z.object({
  email: z.string().email().max(255),
  locale: LocaleEnum,
});

export const UpdatePasswordSchema = z.object({
  password: z.string().min(8).max(72),
});

async function getOrigin(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host")!;
  return `${proto}://${host}`;
}

export async function signUpWithPassword(input: unknown) {
  const parsed = SignUpSchema.parse(input);
  const supabase = await getServerClient();
  const origin = await getOrigin();

  const { error } = await supabase.auth.signUp({
    email: parsed.email,
    password: parsed.password,
    options: {
      emailRedirectTo: `${origin}/${parsed.locale}/auth/callback?next=/${parsed.locale}/onboarding`,
      data: { locale: parsed.locale },
    },
  });

  if (error) throw new Error(error.message);
  return { ok: true as const, needsConfirmation: true };
}

export async function signInWithPassword(input: unknown, locale: string) {
  const parsed = SignInSchema.parse(input);
  const parsedLocale = LocaleEnum.parse(locale);
  const supabase = await getServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.email,
    password: parsed.password,
  });
  if (error) throw new Error(error.message);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No user after sign-in");

  const profile = await getProfile(supabase, user.id);
  redirect(profile?.onboarded_at ? `/${parsedLocale}/dashboard` : `/${parsedLocale}/onboarding`);
}

export async function signInWithGoogle(locale: string) {
  const parsedLocale = LocaleEnum.parse(locale);
  const supabase = await getServerClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/${parsedLocale}/auth/callback?next=/${parsedLocale}/onboarding`,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });
  if (error) throw new Error(error.message);
  if (!data.url) throw new Error("Missing OAuth URL");
  redirect(data.url);
}

export async function requestPasswordReset(input: unknown) {
  const parsed = ResetRequestSchema.parse(input);
  const supabase = await getServerClient();
  const origin = await getOrigin();

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.email, {
    redirectTo: `${origin}/${parsed.locale}/auth/callback?next=/${parsed.locale}/reset/confirm`,
  });
  if (error) throw new Error(error.message);
  return { ok: true as const };
}

export async function updatePassword(input: unknown, locale: string) {
  const parsed = UpdatePasswordSchema.parse(input);
  const parsedLocale = LocaleEnum.parse(locale);
  const supabase = await getServerClient();

  const { error } = await supabase.auth.updateUser({ password: parsed.password });
  if (error) throw new Error(error.message);

  redirect(`/${parsedLocale}/dashboard`);
}

export async function signOut(locale: string) {
  const parsedLocale = LocaleEnum.parse(locale);
  const supabase = await getServerClient();
  await supabase.auth.signOut();
  redirect(`/${parsedLocale}`);
}
