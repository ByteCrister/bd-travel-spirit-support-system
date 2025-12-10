import { jakarta } from "@/styles/fonts";
import { MotionDiv } from "@/components/global/motion-elements";
import Link from "next/link";
import { FiUserPlus, FiMapPin, FiShoppingBag, FiArrowRight } from "react-icons/fi";

const steps = [
  {
    icon: FiUserPlus,
    title: "Create Your Profile",
    desc: "Tell us about your expertise, service areas, and what makes your tours unique.",
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20",
    borderColor: "border-emerald-200/50 dark:border-emerald-800/50",
  },
  {
    icon: FiMapPin,
    title: "List Your Experiences",
    desc: "Add detailed descriptions, stunning photos, competitive pricing, and availability.",
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
    borderColor: "border-blue-200/50 dark:border-blue-800/50",
  },
  {
    icon: FiShoppingBag,
    title: "Start Receiving Bookings",
    desc: "Get booking requests, chat with travelers, and confirm reservations seamlessly.",
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
    borderColor: "border-purple-200/50 dark:border-purple-800/50",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className={"relative py-24 sm:py-32 " + jakarta.className}>
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 mb-6">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            Simple Process
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl mb-6">
            How It{" "}
            <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            From signup to your first booking in just three simple steps. Start your journey as a professional guide today.
          </p>
        </MotionDiv>

        {/* Steps */}
        <div className="relative">
          {/* Connection Lines */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-200 via-blue-200 to-purple-200 dark:from-emerald-800 dark:via-blue-800 dark:to-purple-800 -translate-y-1/2"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, i) => (
              <MotionDiv
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: i * 0.2, duration: 0.8, ease: "easeOut" }}
                className="relative group"
              >
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r ${step.gradient} text-white font-bold text-lg shadow-lg`}>
                    {i + 1}
                  </div>
                </div>

                {/* Card */}
                <div className={`relative h-full p-8 pt-12 rounded-2xl bg-gradient-to-br ${step.bgGradient} border ${step.borderColor} transition-all duration-500 hover:shadow-2xl hover:shadow-gray-900/10 dark:hover:shadow-gray-100/10 hover:-translate-y-2`}>
                  {/* Background Glow */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                  
                  {/* Icon */}
                  <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${step.gradient} mb-6 shadow-lg`}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    {step.desc}
                  </p>
                  
                  {/* Step Indicator */}
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    <span>Step {i + 1}</span>
                    {i < steps.length - 1 && (
                      <FiArrowRight className="h-4 w-4 lg:hidden" />
                    )}
                  </div>
                  
                  {/* Hover Effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>

        {/* CTA */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Ready to start your journey as a professional guide?
          </p>
          <Link href={`/register-as-guide`} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40 hover:scale-105">
            Get Started Now
            <FiArrowRight className="h-5 w-5" />
          </Link>
        </MotionDiv>
      </div>
    </section>
  );
}


