// ── Neumorphism tokens ────────────────────────────────────────
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";
const NEU_DIVIDER = "border-[#1E2938]/10";

export default function SupportEmployeeInfoSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className={NEU_CARD}>
                <div className={`p-5 border-b ${NEU_DIVIDER}`}>
                    <div className="flex items-center gap-3">
                        <div className={`${NEU_SKELETON} h-8 w-8 rounded-xl`} />
                        <div className={`${NEU_SKELETON} h-5 w-48`} />
                    </div>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-2">
                                <div className={`${NEU_SKELETON} h-3 w-20`} />
                                <div className={`${NEU_SKELETON} h-12 w-full rounded-xl`} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column */}
                <div className="lg:col-span-2 space-y-6">
                    {[1, 2].map((i) => (
                        <div key={i} className={NEU_CARD}>
                            <div className={`p-5 border-b ${NEU_DIVIDER}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`${NEU_SKELETON} h-8 w-8 rounded-xl`} />
                                    <div className={`${NEU_SKELETON} h-5 w-40`} />
                                </div>
                            </div>
                            <div className="p-6 space-y-3">
                                <div className={`${NEU_SKELETON} h-4 w-full`} />
                                <div className={`${NEU_SKELETON} h-4 w-3/4`} />
                                <div className={`${NEU_SKELETON} h-4 w-1/2`} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right column */}
                <div className="space-y-6">
                    {[1, 2].map((i) => (
                        <div key={i} className={NEU_CARD}>
                            <div className={`p-5 border-b ${NEU_DIVIDER}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`${NEU_SKELETON} h-8 w-8 rounded-xl`} />
                                    <div className={`${NEU_SKELETON} h-5 w-32`} />
                                </div>
                            </div>
                            <div className="p-6 space-y-3">
                                <div className={`${NEU_SKELETON} h-4 w-full`} />
                                <div className={`${NEU_SKELETON} h-4 w-3/4`} />
                                <div className={`${NEU_SKELETON} h-16 w-full rounded-xl`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}