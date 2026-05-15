export type AuthErrorKey =
  | "generic"
  | "invalidCredentials"
  | "passwordTooShort"
  | "rateLimited"
  | "emailTaken"
  | "emailNotConfirmed"
  | "expiredToken";

export function authErrorKey(err: unknown): AuthErrorKey {
  const msg = (err instanceof Error ? err.message : String(err ?? "")).toLowerCase();
  if (!msg) return "generic";
  if (msg.includes("rate limit") || msg.includes("over_email_send_rate") || msg.includes("too many"))
    return "rateLimited";
  if (msg.includes("already registered") || msg.includes("already been registered") || msg.includes("user already exists"))
    return "emailTaken";
  if (msg.includes("email not confirmed") || msg.includes("not confirmed"))
    return "emailNotConfirmed";
  if (msg.includes("invalid login") || msg.includes("invalid credentials") || msg.includes("invalid email or password"))
    return "invalidCredentials";
  if (msg.includes("password") && (msg.includes("at least") || msg.includes("should be") || msg.includes("too short")))
    return "passwordTooShort";
  if (msg.includes("expired") || msg.includes("token has expired") || msg.includes("otp_expired"))
    return "expiredToken";
  return "generic";
}
