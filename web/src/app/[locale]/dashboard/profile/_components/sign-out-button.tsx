import { signOut } from "@/server/actions/auth";

export function SignOutButton({ locale, label }: { locale: string; label: string }) {
  return (
    <form action={signOut.bind(null, locale)}>
      <button
        type="submit"
        className="text-[14px] font-sans text-destructive hover:underline underline-offset-4 transition-all"
      >
        {label}
      </button>
    </form>
  );
}
