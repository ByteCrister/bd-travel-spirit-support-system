// components/skeletons/FulfillSkeleton.tsx
import { NEU_CARD_SM, NEU_SKELETON } from "@/styles/neu.styles";

export default function FulfillSkeleton() {
  return (
    <div className={`${NEU_CARD_SM} p-4 flex items-center gap-3`}>
      {/* Icon well placeholder */}
      <div className={`${NEU_SKELETON} h-9 w-9 rounded-xl shrink-0`} />
      {/* Label + sub-label */}
      <div className="flex-1 space-y-2">
        <div className={`${NEU_SKELETON} h-3 w-32`} />
        <div className={`${NEU_SKELETON} h-2.5 w-20`} />
      </div>
      {/* Action button placeholder */}
      <div className={`${NEU_SKELETON} h-8 w-20 rounded-xl shrink-0`} />
    </div>
  );
}