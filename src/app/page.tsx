import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import FooterSection from "@/components/FooterSection";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <div id="about" />
      <FooterSection />
    </main>
  );
}
