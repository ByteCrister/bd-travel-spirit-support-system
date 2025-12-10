import HeroSection from "@/components/join-guide/HeroSection";
import WhyPartner from "@/components/join-guide/WhyPartner";
import HowItWorks from "@/components/join-guide/HowItWorks";
import Testimonials from "@/components/join-guide/Testimonials";
import ToolsFeatures from "@/components/join-guide/ToolsFeatures";
import FinalCTA from "@/components/join-guide/FinalCTA";
import BackToTop from "@/components/join-guide/BackToTop";
import Footer from "@/components/join-guide/Footer";
import LoginDialog from "@/components/join-guide/LoginDialog";
import JoinAsGuideHeader from "./JoinAsGuideHeader";
import { LandingPageData } from "@/types/join-as-guide.types";
import { jakarta } from "@/styles/fonts";


export default function JoinAsGuide({ pageData }: { pageData: LandingPageData }) {

  return (
    <main className={`min-h-dvh ${jakarta.className}`}>
      {/* Top Bar */}
      <JoinAsGuideHeader />

      {/* Spacer for mobile - pushes content down */}
      <div className="block sm:hidden h-4"></div>

      <HeroSection data={pageData.hero} />
      <WhyPartner data={pageData.whyPartner} />
      <HowItWorks />
      <Testimonials data={pageData.testimonials} />
      <ToolsFeatures />
      <FinalCTA data={pageData} />

      {/* Footer */}
      <Footer data={pageData.footer} />

      {/* Back to Top Button */}
      <BackToTop />

      {/* Login Dialog */}
      <LoginDialog />
    </main>
  );
}
