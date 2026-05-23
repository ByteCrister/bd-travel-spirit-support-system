// components/skeletons/UpdatePasswordSkeleton.tsx
import { NEU_CARD_SM, NEU_SKELETON } from "@/styles/neu.styles";

export default function UpdatePasswordSkeleton() {
  return (
    <div className={`${NEU_CARD_SM} p-4 space-y-3`}>
      {/* Label */}
      <div className={`${NEU_SKELETON} h-3 w-36`} />
      {/* Input row */}
      <div className="flex gap-3">
        <div className={`${NEU_SKELETON} h-10 flex-1 rounded-xl`} />
        <div className={`${NEU_SKELETON} h-10 w-24 rounded-xl shrink-0`} />
      </div>
      {/* Helper text */}
      <div className={`${NEU_SKELETON} h-2.5 w-48`} />
    </div>
  );
}