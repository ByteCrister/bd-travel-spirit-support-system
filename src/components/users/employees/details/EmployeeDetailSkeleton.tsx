"use client";

// ── Neumorphism tokens ──────────────────────────────────────────
const NEU_PAGE_BG = "min-h-screen bg-[#E7E5E4]";
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM =
  "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";
const NEU_SURFACE_INSET =
  "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff] rounded-2xl";
// ───────────────────────────────────────────────────────────────

function Skel({ className }: { className: string }) {
  return <div className={`${NEU_SKELETON} ${className}`} />;
}

export default function EmployeeDetailSkeleton() {
  return (
    <div className={`${NEU_PAGE_BG} p-4 lg:p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skel className="h-4 w-20" />
              {i < 2 && <span className="text-[#1E2938]/20">/</span>}
            </div>
          ))}
        </div>

        {/* Header card */}
        <div className={`${NEU_CARD} overflow-hidden`}>
          <div className="bg-[#006666] px-8 py-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-5">
                {/* Avatar */}
                <div className="h-20 w-20 rounded-2xl bg-white/10 animate-pulse" />
                <div className="space-y-3">
                  <Skel className="h-7 w-48 !bg-white/20" />
                  <Skel className="h-6 w-24 !bg-white/20 rounded-full" />
                </div>
              </div>
              <div className="flex gap-3">
                <Skel className="h-10 w-32 !bg-white/20" />
                <Skel className="h-10 w-24 !bg-white/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${NEU_CARD_SM} p-2`}>
          <div className="grid grid-cols-4 gap-2 lg:grid-cols-8">
            {[...Array(8)].map((_, i) => (
              <Skel key={i} className="h-10" />
            ))}
          </div>
        </div>

        {/* Content grid */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Personal info */}
            <div className={`${NEU_CARD} lg:col-span-2 p-6 space-y-6`}>
              <div className="flex items-center gap-2">
                <Skel className="h-5 w-5 rounded-full" />
                <Skel className="h-5 w-40" />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skel className="h-4 w-24" />
                    <Skel className="h-10 w-full" />
                  </div>
                ))}
              </div>
              {/* Avatar upload area */}
              <div className={`${NEU_SURFACE_INSET} p-4 space-y-3`}>
                <Skel className="h-4 w-32" />
                <div className="flex gap-3">
                  <Skel className="h-10 flex-1" />
                  <Skel className="h-10 w-24" />
                </div>
              </div>
            </div>

            {/* Employment */}
            <div className={`${NEU_CARD} p-6 space-y-5`}>
              <div className="flex items-center gap-2">
                <Skel className="h-5 w-5 rounded-full" />
                <Skel className="h-5 w-32" />
              </div>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skel className="h-4 w-32" />
                  <Skel className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Compensation + Dates */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className={`${NEU_CARD} p-6 space-y-5`}>
              <div className="flex items-center gap-2">
                <Skel className="h-5 w-5 rounded-full" />
                <Skel className="h-5 w-32" />
              </div>
              <div className={`${NEU_SURFACE_INSET} p-6 text-center space-y-2`}>
                <Skel className="h-4 w-32 mx-auto" />
                <Skel className="h-12 w-48 mx-auto" />
                <Skel className="h-6 w-16 mx-auto" />
              </div>
              <div className="pt-4 border-t border-[#1E2938]/10 space-y-2">
                <Skel className="h-4 w-32" />
                <Skel className="h-6 w-40" />
              </div>
            </div>

            <div className={`${NEU_CARD} p-6 space-y-5`}>
              <div className="flex items-center gap-2">
                <Skel className="h-5 w-5 rounded-full" />
                <Skel className="h-5 w-40" />
              </div>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-[#E7E5E4] shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff]"
                >
                  <Skel className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skel className="h-4 w-24" />
                    <Skel className="h-5 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
