import { getAllPosts } from "@/lib/blog/posts";

export const dynamic = "force-static";

export async function GET() {
  const posts = await getAllPosts();

  const blogSection = posts
    .map((p) => `- [${p.title}](https://www.cheatjob.com/fr/blog/${p.slug}) : ${p.description}`)
    .join("\n");

  const body = `# Cheatjob

> Cheatjob aide les candidats à décrocher des entretiens en écrivant les bons messages : candidature spontanée, relance de recruteur, email de motivation. L'approche : viser le manager qui décide, pas la boîte RH générique.

## Outils gratuits
- [Email de candidature spontanée](https://www.cheatjob.com/fr/outils/email-candidature-spontanee) : génère un email de candidature spontanée personnalisé, prêt à envoyer.
- [Relancer un recruteur](https://www.cheatjob.com/fr/outils/relancer-un-recruteur) : génère une relance polie et efficace après une candidature ou un entretien.
- [Email de motivation](https://www.cheatjob.com/fr/outils/email-de-motivation) : génère un email de motivation ciblé en réponse à une offre.

## Blog
${blogSection}

## À propos
Cheatjob, https://www.cheatjob.com
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
