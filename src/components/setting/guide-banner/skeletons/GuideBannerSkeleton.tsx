"use client";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";

export default function GuideBannerSkeleton() {
    return (
        <div className="space-y-3">
            {/* Header skeleton */}
            <div className={`${NEU_CARD} p-5`}>
                <div className="flex items-center gap-4">
                    <div className={`${NEU_SKELETON} h-5 w-36`} />
                    <div className={`${NEU_SKELETON} h-5 w-20`} />
                    <div className={`${NEU_SKELETON} h-5 w-28`} />
                </div>
            </div>

            {/* Row skeletons */}
            <div className={`${NEU_CARD} overflow-hidden`}>
                {/* Table head skeleton */}
                <div className="px-5 py-3 border-b border-[#1E2938]/10 flex items-center gap-6">
                    <div className={`${NEU_SKELETON} h-4 w-20`} />
                    <div className={`${NEU_SKELETON} h-4 w-28`} />
                    <div className={`${NEU_SKELETON} h-4 w-14`} />
                    <div className={`${NEU_SKELETON} h-4 w-16`} />
                    <div className={`${NEU_SKELETON} h-4 w-20 ml-auto`} />
                </div>

                <div className="divide-y divide-[#1E2938]/5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-5 px-5 py-4">
                            {/* Thumbnail */}
                            <div className={`${NEU_SKELETON} h-14 w-20 rounded-xl flex-shrink-0`} />

                            {/* Alt / Caption */}
                            <div className="flex-1 space-y-2 min-w-0">
                                <div className={`${NEU_SKELETON} h-4 w-2/5`} />
                                <div className={`${NEU_SKELETON} h-3 w-3/5`} />
                            </div>

                            {/* Order badge */}
                            <div className={`${NEU_SKELETON} h-6 w-12 rounded-lg`} />

                            {/* Status */}
                            <div className={`${NEU_SKELETON} h-6 w-20 rounded-lg`} />

                            {/* Meta dates */}
                            <div className="hidden md:flex flex-col gap-1.5">
                                <div className={`${NEU_SKELETON} h-3 w-28`} />
                                <div className={`${NEU_SKELETON} h-3 w-24`} />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <div className={`${NEU_SKELETON} h-8 w-16 rounded-xl`} />
                                <div className={`${NEU_SKELETON} h-8 w-20 rounded-xl`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}