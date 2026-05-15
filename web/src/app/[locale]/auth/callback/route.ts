import { NextResponse, type NextRequest } from "next/server";
import { getServerClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const oauthError =
    url.searchParams.get("error") ?? url.searchParams.get("error_description");
  const next = url.searchParams.get("next") ?? `/${locale}/dashboard`;

  if (oauthError) {
    const mapped =
      url.searchParams.get("error") === "access_denied"
        ? "oauth_cancelled"
        : "oauth_error";
    return NextResponse.redirect(
      new URL(`/${locale}/sign-in?error=${mapped}`, request.url),
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(`/${locale}/sign-in?error=missing_code`, request.url),
    );
  }

  const supabase = await getServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/${locale}/sign-in?error=${encodeURIComponent(error.message)}`,
        request.url,
      ),
    );
  }

  return NextResponse.redirect(new URL(next, request.url));
}
