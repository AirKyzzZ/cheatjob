export function Footer() {
  return (
    <footer className="w-full border-t border-border-subtle bg-cream">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <a href="#top" className="flex items-baseline" aria-label="Cheatjob — retour en haut">
          <span className="font-serif text-[22px] text-burgundy tracking-[-0.01em] leading-none">
            cheatjob
          </span>
        </a>

        <nav
          className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-[13px] font-sans text-muted"
          aria-label="Liens légaux"
        >
          <a href="#pricing" className="hover:text-burgundy transition-colors">
            Tarifs
          </a>
          <span className="text-border-subtle">·</span>
          <a href="#faq" className="hover:text-burgundy transition-colors">
            FAQ
          </a>
          <span className="text-border-subtle">·</span>
          <a href="mailto:hello@cheatjob.fr" className="hover:text-burgundy transition-colors">
            Contact
          </a>
        </nav>

        <p className="text-[13px] font-sans text-muted">Fait à Bordeaux, 2026</p>
      </div>
    </footer>
  );
}
