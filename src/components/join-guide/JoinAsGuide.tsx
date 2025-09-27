"use client";

import { useCallback, useState } from "react";
import HeroSection from "@/components/join-guide/HeroSection";
import WhyPartner from "@/components/join-guide/WhyPartner";
import HowItWorks from "@/components/join-guide/HowItWorks";
import Testimonials from "@/components/join-guide/Testimonials";
import ToolsFeatures from "@/components/join-guide/ToolsFeatures";
import FinalCTA from "@/components/join-guide/FinalCTA";
import BackToTop from "@/components/join-guide/BackToTop";
import Footer from "@/components/join-guide/Footer";
import LoginPopover from "@/components/join-guide/LoginPopover";
import { Plus_Jakarta_Sans } from "next/font/google";
import JoinAsGuideHeader from "./JoinAsGuideHeader";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});


export default function JoinAsGuide() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleApplyClick = useCallback(() => {
    const target = document.querySelector("#how-it-works");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleLoginClick = useCallback(() => {
    setIsLoginOpen(true);
  }, []);

  const handleLoginClose = useCallback(() => {
    setIsLoginOpen(false);
  }, []);

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    // Reopen the login dialog after a brief delay
    setTimeout(() => {
      // You might need to trigger the parent to open login again
      // This depends on your parent component structure
    }, 100);
    setIsLoginOpen(true);
  };

  return (
    <main className={`min-h-dvh ${jakarta.className}`}>
      {/* Top Bar */}
      <JoinAsGuideHeader
        handleApplyClick={handleApplyClick}
        handleLoginClick={handleLoginClick}
      />

      {/* Spacer for mobile - pushes content down */}
      <div className="block sm:hidden h-4"></div>

      <HeroSection onApplyClick={handleApplyClick} />
      <WhyPartner />
      <HowItWorks />
      <Testimonials />
      <ToolsFeatures />
      <FinalCTA onApplyClick={handleApplyClick} />

      {/* Footer */}
      <Footer />

      {/* Back to Top Button */}
      <BackToTop />

      {/* Login Popover */}
      <LoginPopover isOpen={isLoginOpen}
        showForgotPassword={showForgotPassword}
        setShowForgotPassword={(s: boolean) => setShowForgotPassword(s)}
        onClose={handleLoginClose}
        handleBackToLogin={handleBackToLogin}
      />
    </main>
  );
}
