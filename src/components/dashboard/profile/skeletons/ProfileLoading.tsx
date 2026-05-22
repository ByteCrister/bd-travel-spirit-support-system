// app/profile/loading.tsx

// ── Neumorphism tokens ────────────────────────────────────────
const NEU_PAGE_BG = "min-h-screen bg-[#E7E5E4]";
const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";
const NEU_CARD = "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_SURFACE_INSET = "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";

export default function ProfileLoading() {
  return (
    <div className={`${NEU_PAGE_BG} px-4 py-8`}>
      <div className="container mx-auto max-w-5xl space-y-6">

        {/* Breadcrumb skeleton */}
        <div className={`${NEU_SKELETON} h-4 w-40`} />

        {/* Header card skeleton */}
        <div className={`${NEU_CARD} p-8`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
            {/* Avatar */}
            <div className={`${NEU_SURFACE_INSET} h-32 w-32 rounded-full shrink-0`}>
              <div className={`${NEU_SKELETON} h-full w-full rounded-full`} />
            </div>
            {/* Info lines */}
            <div className="flex-1 space-y-4 w-full">
              <div className={`${NEU_SKELETON} h-8 w-56`} />
              <div className={`${NEU_SKELETON} h-5 w-24 rounded-lg`} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className={`${NEU_SKELETON} h-12 w-full rounded-xl`} />
                <div className={`${NEU_SKELETON} h-12 w-full rounded-xl`} />
              </div>
            </div>
          </div>
        </div>

        {/* Tab nav skeleton */}
        <div className={`${NEU_CARD} p-4`}>
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`${NEU_SKELETON} h-11 flex-1 rounded-xl`} />
            ))}
          </div>
        </div>

        {/* Content skeleton */}
        <div className={`${NEU_CARD} p-6 space-y-6`}>
          <div className={`${NEU_SKELETON} h-6 w-48`} />
          <div className="space-y-3">
            <div className={`${NEU_SKELETON} h-12 w-full rounded-xl`} />
            <div className={`${NEU_SKELETON} h-12 w-full rounded-xl`} />
            <div className={`${NEU_SKELETON} h-12 w-3/4 rounded-xl`} />
          </div>
          <div className={`${NEU_SKELETON} h-10 w-36 rounded-xl`} />
        </div>
      </div>
    </div>
  );
}