import { setRequestLocale } from "next-intl/server";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { Nav } from "@/components/marketing/nav";
import { Hero } from "@/components/marketing/hero";
import { Handoff } from "@/components/marketing/handoff";
import { Receipts } from "@/components/marketing/receipts";
import { Pain } from "@/components/marketing/pain";
import { Versus } from "@/components/marketing/versus";
import { Wedge } from "@/components/marketing/wedge";
import { Evidence } from "@/components/marketing/evidence";
import { Founder } from "@/components/marketing/founder";
import { AntiRec } from "@/components/marketing/anti-rec";
import { Pricing } from "@/components/marketing/pricing";
import { FAQ } from "@/components/marketing/faq";
import { FinalCTA } from "@/components/marketing/final-cta";
import { Footer } from "@/components/marketing/footer";

type LandingPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LandingPage({ params }: LandingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <ScrollProgress />
      <Nav />
      <main>
        <Hero />
        <Handoff />
        <Receipts />
        <Pain />
        <Versus />
        <Wedge />
        <Evidence />
        <Founder />
        <AntiRec />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
