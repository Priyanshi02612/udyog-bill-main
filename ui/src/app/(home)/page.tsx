import { CTASection } from "../../components/cta-section";
import { FeatureSection } from "../../components/feature-section";
import { Footer } from "../../components/footer";
import { Header } from "../../components/header";
import { HeroSection } from "../../components/hero-section";

export default function Home() {
  return (
    <div>
      <Header />

      <div className="grow">
        <HeroSection />
        <FeatureSection />
        <CTASection />
      </div>

      <Footer />
    </div>
  );
}
