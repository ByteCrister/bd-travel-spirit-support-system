import { jakarta } from "@/styles/fonts";
import { MotionDiv } from "@/components/global/motion-elements";
import { FiBarChart2, FiCreditCard, FiGlobe, FiShield, FiSmartphone, FiHeadphones, FiZap } from "react-icons/fi";
const features = [
  {
    icon: FiBarChart2,
    title: "Advanced Analytics",
    desc: "Comprehensive dashboard with real-time insights, booking trends, and performance metrics to optimize your business.",
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20",
  },
  {
    icon: FiCreditCard,
    title: "Secure Payout System",
    desc: "Fast, reliable payouts with detailed transaction history, automated statements, and multiple payment methods.",
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
  },
  {
    icon: FiGlobe,
    title: "Global Reach",
    desc: "Multilingual platform with localized content support to connect with travelers from around the world.",
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
  },
  {
    icon: FiShield,
    title: "Trust & Safety",
    desc: "Verified profiles, secure transactions, dispute resolution, and 24/7 customer support for peace of mind.",
    gradient: "from-orange-500 to-red-500",
    bgGradient: "from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20",
  },
  {
    icon: FiSmartphone,
    title: "Mobile App",
    desc: "Manage your business on-the-go with our intuitive mobile app for iOS and Android devices.",
    gradient: "from-indigo-500 to-purple-500",
    bgGradient: "from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20",
  },
  {
    icon: FiHeadphones,
    title: "Dedicated Support",
    desc: "Personal account manager and priority support to help you succeed and grow your business.",
    gradient: "from-teal-500 to-emerald-500",
    bgGradient: "from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20",
  },
  {
    icon: FiZap,
    title: "Marketing Tools",
    desc: "Built-in SEO optimization, social media integration, and promotional tools to boost your visibility.",
    gradient: "from-yellow-500 to-orange-500",
    bgGradient: "from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20",
  },
];

export default function ToolsFeatures() {
  return (
    <section className={"relative py-24 sm:py-32 " + jakarta.className}>
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 px-4 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 mb-6">
            <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
            Powerful Tools
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl mb-6">
            Tools to Help You{" "}
            <span className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Everything you need to operate professionally, scale confidently, and grow your travel business to new heights.
          </p>
        </MotionDiv>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <MotionDiv
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
              className="group relative"
            >
              <div className={`relative h-full p-6 rounded-2xl bg-gradient-to-br ${feature.bgGradient} border border-gray-200/50 dark:border-gray-700/50 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-900/10 dark:hover:shadow-gray-100/10 hover:-translate-y-2`}>
                {/* Background Glow */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                {/* Icon */}
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r ${feature.gradient} mb-4 shadow-lg`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                  {feature.desc}
                </p>
                
                {/* Hover Effect */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </MotionDiv>
          ))}
        </div>

        {/* Bottom CTA */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-8 py-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-left">
              <div className="text-lg font-bold text-gray-900 dark:text-white">Ready to access these tools?</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Join thousands of successful guides today</div>
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40 hover:scale-105">
              Get Started
              <FiZap className="h-4 w-4" />
            </button>
          </div>
        </MotionDiv>
      </div>
    </section>
  );
}


