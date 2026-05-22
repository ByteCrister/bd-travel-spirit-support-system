'use client';

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
    'rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60 p-6';

const NEU_SKELETON = 'rounded-lg bg-[#d0cecd] animate-pulse';

export function ArticleDetailSkeleton() {
    return (
        <div className="space-y-5">
            {/* Header skeleton */}
            <div className={NEU_CARD}>
                <div className="space-y-3">
                    <div className={`${NEU_SKELETON} h-8 w-2/3`} />
                    <div className="flex gap-2">
                        <div className={`${NEU_SKELETON} h-6 w-24`} />
                        <div className={`${NEU_SKELETON} h-6 w-20`} />
                    </div>
                </div>
            </div>

            {/* Action bar skeleton */}
            <div className={NEU_CARD}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        <div className={`${NEU_SKELETON} h-7 w-20`} />
                        <div className={`${NEU_SKELETON} h-7 w-24`} />
                        <div className={`${NEU_SKELETON} h-7 w-32`} />
                    </div>
                    <div className="flex gap-2">
                        <div className={`${NEU_SKELETON} h-9 w-28`} />
                        <div className={`${NEU_SKELETON} h-9 w-28`} />
                    </div>
                </div>
            </div>

            {/* Tabs skeleton */}
            <div className={NEU_CARD}>
                <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={`${NEU_SKELETON} h-10 w-full`} />
                    ))}
                </div>
            </div>

            {/* Content skeleton */}
            <div className={NEU_CARD}>
                <div className="space-y-4">
                    <div className={`${NEU_SKELETON} h-7 w-48`} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`${NEU_SKELETON} h-11 w-full`} />
                        <div className={`${NEU_SKELETON} h-11 w-full`} />
                        <div className={`${NEU_SKELETON} h-28 w-full`} />
                        <div className={`${NEU_SKELETON} h-28 w-full`} />
                    </div>
                </div>
            </div>
        </div>
    );
}