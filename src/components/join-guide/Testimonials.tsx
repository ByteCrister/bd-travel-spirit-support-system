"use client";

import { motion } from "framer-motion";
import { Plus_Jakarta_Sans } from "next/font/google";
import { FiStar } from "react-icons/fi";
import { MdFormatQuote } from "react-icons/md";
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });

const testimonials = [
  {
    name: "Ayesha Rahman",
    location: "Dhaka, Bangladesh",
    role: "Cultural Heritage Guide",
    quote: "BD Travel Spirit transformed my business completely. I went from 2-3 bookings per month to 15+ bookings. The platform's reach and professional tools helped me connect with travelers from 20+ countries.",
    rating: 5,
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20",
  },
  {
    name: "Rahim Hassan",
    location: "Cox's Bazar, Bangladesh",
    role: "Adventure Tour Guide",
    quote: "The booking management system is incredibly intuitive. I can handle multiple tours simultaneously, communicate with guests seamlessly, and the payout process is lightning fast. Highly recommended!",
    rating: 5,
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
  },
  {
    name: "Nadia Ahmed",
    location: "Sylhet, Bangladesh",
    role: "Tea Garden Specialist",
    quote: "Their marketing support is exceptional. My niche tea-garden tours were discovered by the perfect audience. The featured placement and social media promotion increased my bookings by 300% in just 6 months.",
    rating: 5,
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
  },
];

export default function Testimonials() {
  return (
    <section className={"relative py-24 sm:py-32 " + jakarta.className}>
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 mb-6">
            <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></span>
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
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
              className="group relative"
            >
              <div className={`relative h-full p-8 rounded-2xl bg-gradient-to-br ${testimonial.bgGradient} border border-gray-200/50 dark:border-gray-700/50 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-900/10 dark:hover:shadow-gray-100/10 hover:-translate-y-2`}>
                {/* Background Glow */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                {/* Quote Icon */}
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${testimonial.gradient} mb-6 shadow-lg`}>
                  <MdFormatQuote className="h-6 w-6 text-white" />
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, starIndex) => (
                    <FiStar key={starIndex} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
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
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-8 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-8 py-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">4.9/5</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
            </div>
            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">98%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Satisfaction Rate</div>
            </div>
            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">1000+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Happy Guides</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


