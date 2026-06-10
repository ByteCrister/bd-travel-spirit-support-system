import { FiStar, FiUsers, FiGlobe } from "react-icons/fi";
import ImageCarousel from "./ImageCarousel";
import { Plus_Jakarta_Sans } from "next/font/google";
import { HeroContentType } from "@/types/guide/join-as-guide.types";
import HeroCTAbtn from "./client/HeroCTAbtn";
import CountUpStat from "../global/CountUpStat";
import { MotionDiv } from "@/components/global/motion-elements";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

type HeroSectionProps = {
  data: HeroContentType;
};

export default function HeroSection({ data }: HeroSectionProps) {
  const totalGuides = data?.totalGuides ?? 0;
  const monthlyVisitors = data?.monthlyVisitors ?? 0;
  const totalDestinations = data?.totalDestinations ?? 0;
  const images = data?.heroCarouselImages ?? [];

  const slideInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const badgeVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const scrollIndicatorVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section
      className={`relative overflow-hidden min-h-[calc(100vh-4rem)] sm:min-h-screen flex items-center ${jakarta.className}`}
    >
      {/* Premium background with carousel - theme-aware overlays */}
      <div className="absolute inset-0 -z-10">
        <ImageCarousel Images={images} className="h-full w-full" showControls={false} />
        {/* Light mode overlay: soft neutral gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100/80 via-gray-50/60 to-gray-100/80 dark:from-slate-900/70 dark:via-slate-800/50 dark:to-slate-900/80" />
        {/* Dark overlay for text readability in both modes */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20 dark:from-black/60 dark:via-transparent dark:to-black/40" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Left Content */}
          <MotionDiv
            variants={slideInLeft}
            initial="hidden"
            animate="visible"
            className="space-y-6 sm:space-y-8 text-center lg:text-left"
          >
            {/* Badge - adapts background and text */}
            <MotionDiv
              variants={badgeVariants}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-100 backdrop-blur-sm border border-emerald-400/40 dark:border-emerald-400/30"
            >
              <FiStar className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 dark:text-yellow-400" />
              <span>
                Trusted by{" "}
                <CountUpStat end={totalGuides} duration={2} separator="," />+ Guides
              </span>
            </MotionDiv>

            {/* Main Heading */}
            <MotionDiv
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight"
            >
              Grow Your Travel Business with{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                BD Travel Spirit
              </span>
            </MotionDiv>

            {/* Subtitle */}
            <MotionDiv
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-slate-200 leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              Join thousands of guides reaching travelers worldwide. Build your
              reputation, manage bookings effortlessly, and grow your income with
              our premium platform.
            </MotionDiv>

            {/* Stats */}
            <MotionDiv
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row justify-center lg:justify-start gap-6 sm:gap-8"
            >
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500">
                  <FiUsers className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    <CountUpStat end={monthlyVisitors} duration={2} />+
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-slate-300">
                    Monthly Visitors
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
                  <FiGlobe className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    <CountUpStat end={totalDestinations} duration={2} />+
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-slate-300">
                    Destinations
                  </div>
                </div>
              </div>
            </MotionDiv>

            {/* CTA Buttons (client component - ensure it also supports light/dark) */}
            <HeroCTAbtn />
          </MotionDiv>

          {/* Right Content - Featured carousel with controls */}
          <MotionDiv
            variants={slideInLeft}
            initial="hidden"
            animate="visible"
            className="hidden lg:block relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <ImageCarousel
                Images={images}
                className="h-[400px] lg:h-[500px] w-full"
                showControls={true}
              />
              {/* Light gradient overlay that adapts */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent dark:from-black/20 pointer-events-none" />
            </div>
          </MotionDiv>
        </div>

        {/* Scroll indicator - theme-aware */}
        <MotionDiv
          variants={scrollIndicatorVariants}
          initial="hidden"
          animate="visible"
          className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600 dark:text-white/70"
        >
          <span className="text-xs sm:text-sm font-medium">Scroll to explore</span>
          <div className="h-6 w-4 sm:h-8 sm:w-5 rounded-full border-2 border-gray-400 dark:border-white/40 p-1">
            <div className="h-1.5 w-1 sm:h-2 sm:w-1.5 rounded-full bg-gray-600 dark:bg-white mx-auto animate-bounce" />
          </div>
        </MotionDiv>
      </div>
    </section>
  );
}