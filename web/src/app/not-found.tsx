import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";

export default function NotFound() {
  return (
    <main className="min-h-svh bg-cream text-ink flex items-center justify-center px-6 md:px-10">
      <div className="max-w-[720px] flex flex-col gap-8 text-center">
        <Eyebrow>Erreur 404</Eyebrow>
        <h1 className="font-serif text-[64px] md:text-[96px] leading-[0.98] tracking-[-0.03em]">
          Cette page n&apos;existe pas.{" "}
          <span className="italic">Comme ton carnet d&apos;adresses.</span>
        </h1>
        <p className="font-sans text-[17px] md:text-[18px] leading-[1.6] text-muted max-w-[48ch] mx-auto">
          La différence : celui-ci, on peut te le construire en quelques jours.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-12 px-7 rounded-[10px] bg-ink text-cream text-[14px] font-semibold font-sans hover:-translate-y-0.5 transition-transform"
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/#pricing"
            className="inline-flex items-center justify-center h-12 px-7 rounded-[10px] border border-burgundy text-burgundy text-[14px] font-semibold font-sans hover:bg-burgundy/5 transition-colors"
          >
            Voir les tarifs
          </Link>
        </div>
      </div>
    </main>
  );
}
