// components/skeletons/RequestsListSkeleton.tsx
import { NEU_CARD_SM, NEU_SKELETON } from "@/styles/neu.styles";

const ROW_COUNT = 6;

export default function RequestsListSkeleton() {
    return (
        <div className="space-y-4">
            {/* Filter bar */}
            <div className={`${NEU_CARD_SM} p-4 flex flex-wrap gap-3`}>
                <div className={`${NEU_SKELETON} h-9 w-1/3 rounded-xl`} />
                <div className={`${NEU_SKELETON} h-9 w-1/6 rounded-xl`} />
                <div className={`${NEU_SKELETON} h-9 w-1/6 rounded-xl`} />
            </div>

            {/* Column header strip */}
            <div className="hidden md:flex items-center gap-3 px-4">
                <div className={`${NEU_SKELETON} h-2.5 w-12 rounded`} style={{ opacity: 0.6 }} />
                <div className={`${NEU_SKELETON} h-2.5 w-28 rounded`} style={{ opacity: 0.6 }} />
                <div className={`${NEU_SKELETON} h-2.5 w-20 rounded`} style={{ opacity: 0.6 }} />
                <div className={`${NEU_SKELETON} h-2.5 w-16 rounded`} style={{ opacity: 0.6 }} />
                <div className={`${NEU_SKELETON} h-2.5 w-20 rounded ml-auto`} style={{ opacity: 0.6 }} />
            </div>

            {/* Rows */}
            <div className="space-y-3">
                {Array.from({ length: ROW_COUNT }).map((_, i) => (
                    <div
                        key={i}
                        className={`${NEU_CARD_SM} flex items-center gap-3 p-4`}
                        style={{ opacity: 1 - i * 0.1 }}
                    >
                        {/* Index / checkbox */}
                        <div className={`${NEU_SKELETON} h-7 w-10 rounded-xl shrink-0`} />
                        {/* Name */}
                        <div className={`${NEU_SKELETON} h-5 w-1/3`} />
                        {/* Secondary */}
                        <div className={`${NEU_SKELETON} h-5 w-1/4 hidden sm:block`} />
                        {/* Status badge */}
                        <div className={`${NEU_SKELETON} h-5 w-1/6 rounded-lg hidden md:block`} />
                        {/* Date */}
                        <div className={`${NEU_SKELETON} h-5 w-1/5 hidden lg:block`} />
                    </div>
                ))}
            </div>
        </div>
    );
}