import { FiStar } from "react-icons/fi";
import { MdFormatQuote } from "react-icons/md";
import type { TestimonialsType } from "@/types/join-as-guide.types";
import CountUpStat from "../global/CountUpStat";
import { MotionDiv } from "@/components/global/motion-elements";
import { jakarta } from "@/styles/fonts";

const gradientPalette = [
  { gradient: "from-emerald-500 to-teal-500", bgGradient: "from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20" },
  { gradient: "from-blue-500 to-cyan-500", bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20" },
  { gradient: "from-purple-500 to-pink-500", bgGradient: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20" },
  { gradient: "from-amber-500 to-orange-500", bgGradient: "from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20" },
];

function getGradient(i: number) {
  return gradientPalette[i % gradientPalette.length];
}

type Props = { data: TestimonialsType };

export default function Testimonials({ data }: Props) {
  const testimonials = data?.testimonials ?? [];

  const headerVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
  const cardVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
  const statsVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <section className={"relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 " + jakarta.className}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <MotionDiv variants={headerVariants} initial="hidden" animate="visible" className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-purple-600 dark:text-purple-400 mb-4 sm:mb-6">
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-purple-500 animate-pulse" />
            Success Stories
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-4 sm:mb-6">
            Loved by Guides{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
              Across Bangladesh
            </span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4 sm:px-0 leading-relaxed">
            Real stories from successful guides who have transformed their business with BD Travel Spirit.
          </p>
        </MotionDiv>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, i) => {
            const { gradient, bgGradient } = getGradient(i);
            const rating = Math.max(0, Math.min(5, testimonial.rating || 0));
            return (
              <MotionDiv
                key={`${testimonial.id ?? i}-${i}`}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: i * 0.08, duration: 0.8 }}
                className="group relative"
              >
                <div
                  className={`relative h-full p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-br ${bgGradient} border border-gray-200/50 dark:border-gray-700/50 transition-all duration-500 hover:shadow-xl sm:hover:shadow-2xl hover:shadow-gray-900/10 dark:hover:shadow-gray-100/10 hover:-translate-y-1 sm:hover:-translate-y-2`}
                >
                  {/* Background Glow */}
                  <div
                    className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  />

                  {/* Quote Icon */}
                  <div className={`inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-r ${gradient} mb-4 sm:mb-6 shadow-md sm:shadow-lg`}>
                    <MdFormatQuote className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                    {Array.from({ length: rating }).map((_, starIndex) => (
                      <FiStar key={starIndex} className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base md:text-lg">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>

                  {/* Author */}
                  <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-4 sm:pt-6">
                    <div className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">{testimonial.name}</div>
                    <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{testimonial.role}</div>
                    <div className="text-gray-500 dark:text-gray-500 text-xs sm:text-sm">{testimonial.location}</div>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </MotionDiv>
            );
          })}
        </div>

        {/* Stats - Fixed Responsiveness */}
        <MotionDiv 
          variants={statsVariants} 
          initial="hidden" 
          animate="visible" 
          transition={{ delay: 0.4, duration: 0.8 }} 
          className="mt-12 sm:mt-16 text-center"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8 rounded-xl sm:rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-4 py-6 sm:px-6 sm:py-6 lg:px-8 lg:py-6 border border-gray-200/50 dark:border-gray-700/50">
            {/* Average Rating */}
            <div className="text-center w-full sm:w-auto">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {data.averageRating}/5
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Average Rating</div>
            </div>

            {/* Divider - Hidden on mobile, visible on sm+ */}
            <div className="hidden sm:block h-8 w-px bg-gray-300 dark:bg-gray-600" />
            <div className="w-12 h-px sm:hidden bg-gray-300 dark:bg-gray-600" />

            {/* Satisfaction Rate */}
            <div className="text-center w-full sm:w-auto">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                <CountUpStat end={data.satisfactionRage ?? 0} duration={1.5} suffix="%" />
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Satisfaction Rate</div>
            </div>

            {/* Divider - Hidden on mobile, visible on sm+ */}
            <div className="hidden sm:block h-8 w-px bg-gray-300 dark:bg-gray-600" />
            <div className="w-12 h-px sm:hidden bg-gray-300 dark:bg-gray-600" />

            {/* Happy Guides */}
            <div className="text-center w-full sm:w-auto">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                <CountUpStat end={data.happyGuides ?? 0} duration={1.8} suffix="+" />
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Happy Guides</div>
            </div>
          </div>
        </MotionDiv>
      </div>
    </section>
  );
}