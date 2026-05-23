// components/guide-password-request/skeletons/TableSkeleton.tsx
"use client";

import { NEU_CARD_SM, NEU_SKELETON } from "@/styles/neu.styles";

const ROW_COUNT = 5;

function TableSkeleton() {
    return (
        <div className="space-y-3 p-4">
            {Array.from({ length: ROW_COUNT }).map((_, i) => (
                <div
                    key={i}
                    className={`${NEU_CARD_SM} flex items-center gap-4 p-4`}
                    style={{ opacity: 1 - i * 0.12 }}
                >
                    {/* Avatar */}
                    <div className={`${NEU_SKELETON} h-11 w-11 rounded-xl shrink-0`} />

                    {/* Name + email */}
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                        <div className={`${NEU_SKELETON} h-3.5 w-32`} />
                        <div className={`${NEU_SKELETON} h-2.5 w-44`} />
                    </div>

                    {/* Reason */}
                    <div className={`${NEU_SKELETON} h-3 w-36 hidden md:block`} />

                    {/* Status badge */}
                    <div className={`${NEU_SKELETON} h-6 w-20 rounded-lg hidden sm:block`} />

                    {/* Date */}
                    <div className={`${NEU_SKELETON} h-3 w-20 hidden lg:block`} />

                    {/* Action btn */}
                    <div className={`${NEU_SKELETON} h-8 w-16 rounded-xl shrink-0`} />
                </div>
            ))}
        </div>
    );
}

export default TableSkeleton;