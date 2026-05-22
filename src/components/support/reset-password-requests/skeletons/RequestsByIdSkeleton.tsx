// components/skeletons/RequestsByIdSkeleton.tsx
import { NEU_CARD, NEU_SKELETON, NEU_DIVIDER } from "@/styles/neu.styles";

export default function RequestsByIdSkeleton() {
  return (
    <div className={`${NEU_CARD} p-6 space-y-5`}>
      {/* Title */}
      <div className={`${NEU_SKELETON} h-7 w-3/4 rounded-xl`} />

      {/* Meta info rows */}
      <div className="space-y-3">
        {[{ w: "w-full" }, { w: "w-full" }, { w: "w-1/3" }].map((row, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`${NEU_SKELETON} h-4 w-4 rounded-md shrink-0`} />
            <div className={`${NEU_SKELETON} h-3.5 ${row.w}`} />
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className={`border-t ${NEU_DIVIDER}`} />

      {/* Action buttons row */}
      <div className="flex gap-3">
        <div className={`${NEU_SKELETON} h-9 w-24 rounded-xl`} />
        <div className={`${NEU_SKELETON} h-9 w-24 rounded-xl`} />
      </div>
    </div>
  );
}