import { ScrollProgress } from "@/components/ui/scroll-progress";
import { Nav } from "@/components/sections/nav";
import { Hero } from "@/components/sections/hero";
import { Handoff } from "@/components/sections/handoff";
import { Receipts } from "@/components/sections/receipts";
import { Pain } from "@/components/sections/pain";
import { Versus } from "@/components/sections/versus";
import { Wedge } from "@/components/sections/wedge";
import { Evidence } from "@/components/sections/evidence";
import { Founder } from "@/components/sections/founder";
import { AntiRec } from "@/components/sections/anti-rec";
import { Pricing } from "@/components/sections/pricing";
import { FAQ } from "@/components/sections/faq";
import { FinalCTA } from "@/components/sections/final-cta";
import { Footer } from "@/components/sections/footer";

export default function Home() {
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
