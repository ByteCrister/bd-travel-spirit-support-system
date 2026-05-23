// components/skeletons/RequestCreateSkeleton.tsx
import { NEU_CARD, NEU_SKELETON } from "@/styles/neu.styles";

export default function RequestCreateSkeleton() {
  return (
    <div className={`${NEU_CARD} p-6 space-y-4`}>
      {/* Field 1 */}
      <div className="space-y-1.5">
        <div className={`${NEU_SKELETON} h-2.5 w-24`} />
        <div className={`${NEU_SKELETON} h-10 w-full rounded-xl`} />
      </div>

      {/* Field 2 */}
      <div className="space-y-1.5">
        <div className={`${NEU_SKELETON} h-2.5 w-32`} />
        <div className={`${NEU_SKELETON} h-10 w-full rounded-xl`} />
      </div>

      {/* Textarea */}
      <div className="space-y-1.5">
        <div className={`${NEU_SKELETON} h-2.5 w-20`} />
        <div className={`${NEU_SKELETON} h-20 w-full rounded-xl`} />
      </div>

      {/* Submit button */}
      <div className={`${NEU_SKELETON} h-10 w-1/3 rounded-xl`} />
    </div>
  );
}