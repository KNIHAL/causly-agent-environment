import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import Capabilities from "@/components/sections/capabilities";
import HowItWorks from "@/components/sections/how-it-works";
import Security from "@/components/sections/security";
import WorksWith from "@/components/sections/works-with";
import Faq from "@/components/sections/faq";
import FinalCta from "@/components/sections/final-cta";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Capabilities />
        <HowItWorks />
        <Security />
        <WorksWith />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
