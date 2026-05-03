import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { PortalsSection } from "@/components/landing/PortalsSection";
import { FeaturesBento } from "@/components/landing/FeaturesBento";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main>
        <HeroSection />
        <PortalsSection />
        <FeaturesBento />
      </main>
      <Footer />
    </div>
  );
}
