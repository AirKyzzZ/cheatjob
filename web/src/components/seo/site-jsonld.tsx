const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.cheatjob.com/#org",
      name: "Cheatjob",
      url: "https://www.cheatjob.com",
      logo: "https://www.cheatjob.com/logo-mark.png",
      description:
        "Cheatjob aide à décrocher des entretiens en écrivant les bons messages : candidature spontanée, relance de recruteur, email de motivation. Vise le manager qui décide, pas la boîte RH.",
      sameAs: [
        "https://x.com/maximecodes",
        "https://www.linkedin.com/in/maxime-mansiet/",
        "https://github.com/AirKyzzZ/cheatjob",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://www.cheatjob.com/#website",
      name: "Cheatjob",
      url: "https://www.cheatjob.com",
      inLanguage: "fr",
      publisher: { "@id": "https://www.cheatjob.com/#org" },
    },
  ],
};

export function SiteJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
