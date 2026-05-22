// src/components/skeletons/LoadingCard.tsx

// ── Neu style tokens ──────────────────────────────────────────
const S = {
    card:
        "rounded-2xl bg-[#E7E5E4] border border-white/60 overflow-hidden " +
        "shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff]",
    header:
        "px-5 py-4 border-b border-[#1E2938]/10 " +
        "bg-[#E7E5E4]",
    body: "p-5 space-y-4",
    group: "space-y-2",
    skel: "rounded-xl bg-[#d0cecd] animate-pulse",
    // PulseSkeleton
    pulse: "rounded-xl bg-[#d0cecd] animate-pulse",
};

export function LoadingCard() {
    return (
        <div className={S.card}>
            <div className={S.header}>
                <div className={`${S.skel} h-5 w-32`} />
            </div>
            <div className={S.body}>
                <div className={S.group}>
                    <div className={`${S.skel} h-4 w-full`} />
                    <div className={`${S.skel} h-4 w-3/4`} />
                    <div className={`${S.skel} h-4 w-5/6`} />
                </div>
                <div className={S.group}>
                    <div className={`${S.skel} h-4 w-full`} />
                    <div className={`${S.skel} h-4 w-2/3`} />
                </div>
            </div>
        </div>
    );
}

// Pulsing Skeleton for inline use
export function PulseSkeleton({ className = "" }: { className?: string }) {
    return <div className={`${S.pulse} ${className}`} />;
}