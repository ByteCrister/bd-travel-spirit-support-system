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
    <section className={"relative py-24 sm:py-32 " + jakarta.className}>
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <MotionDiv variants={headerVariants} initial="hidden" animate="visible" className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 mb-6">
            <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            Success Stories
          </div>

          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl mb-6">
            Loved by Guides{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
              Across Bangladesh
            </span>
          </h2>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Real stories from successful guides who have transformed their business with BD Travel Spirit.
          </p>
        </MotionDiv>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  className={`relative h-full p-8 rounded-2xl bg-gradient-to-br ${bgGradient} border border-gray-200/50 dark:border-gray-700/50 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-900/10 dark:hover:shadow-gray-100/10 hover:-translate-y-2`}
                >
                  {/* Background Glow */}
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  />

                  {/* Quote Icon */}
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${gradient} mb-6 shadow-lg`}>
                    <MdFormatQuote className="h-6 w-6 text-white" />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: rating }).map((_, starIndex) => (
                      <FiStar key={starIndex} className="h-4 w-4 text-yellow-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-lg">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>

                  {/* Author */}
                  <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-6">
                    <div className="font-bold text-gray-900 dark:text-white text-lg">{testimonial.name}</div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">{testimonial.role}</div>
                    <div className="text-gray-500 dark:text-gray-500 text-sm">{testimonial.location}</div>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </MotionDiv>
            );
          })}
        </div>

        {/* Stats */}
        <MotionDiv variants={statsVariants} initial="hidden" animate="visible" transition={{ delay: 0.4, duration: 0.8 }} className="mt-16 text-center">
          <div className="inline-flex items-center gap-8 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-8 py-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {data.averageRating}/5
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
            </div>

            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />

            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                <CountUpStat end={data.satisfactionRage ?? 0} duration={1.5} suffix="%" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Satisfaction Rate</div>
            </div>

            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />

            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                <CountUpStat end={data.happyGuides ?? 0} duration={1.8} suffix="+" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Happy Guides</div>
            </div>
          </div>
        </MotionDiv>
      </div>
    </section>
  );
}
