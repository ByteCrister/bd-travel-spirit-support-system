import { Plus_Jakarta_Sans } from "next/font/google";
import type { LandingPageData } from "@/types/join-as-guide.types";
import FinalCTAClient from "./client/FinalCTAClient";
import FinalCTAbtn from "./client/FinalCTAbtn";
import MotionDiv from "../global/MotionDiv";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });
const benefits = ["Free to join", "No setup fees", "24/7 support", "Global reach"];

export default function FinalCTA({ data }: { data: LandingPageData }) {
  const copyVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className={"relative py-24 sm:py-32 " + jakarta.className}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 sm:p-16 text-white shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10" />
          <div className="relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: server-rendered copy wrapped with MotionDiv */}
              <MotionDiv variants={copyVariants} initial="hidden" animate="visible" className="">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-emerald-200 mb-6 backdrop-blur-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Join Today
                  </div>

                  <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
                    Become a Guide{" "}
                    <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                      Today
                    </span>
                  </h2>

                  <p className="text-xl text-slate-200 leading-relaxed mb-8 max-w-2xl">
                    Start your application in minutes and reach travelers across Bangladesh and beyond.
                    Join the leading platform trusted by thousands of professional guides.
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {benefits.map((b) => (
                      <div key={b} className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                          <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <span className="text-slate-200 font-medium">{b}</span>
                      </div>
                    ))}
                  </div>

                  {/* Animated CTA button (client-hydrated) */}
                  <FinalCTAbtn />
                </div>
              </MotionDiv>

              {/* Client widget (keeps hydrating client-only animations inside FinalCTAClient) */}
              <FinalCTAClient data={data} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
