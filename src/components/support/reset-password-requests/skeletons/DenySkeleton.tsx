// components/skeletons/DenySkeleton.tsx
import { NEU_CARD_SM, NEU_SKELETON } from "@/styles/neu.styles";

export default function DenySkeleton() {
  return (
    <div className={`${NEU_CARD_SM} p-4 space-y-3`}>
      {/* Label line */}
      <div className={`${NEU_SKELETON} h-3 w-28`} />
      {/* Textarea area */}
      <div className={`${NEU_SKELETON} h-12 w-full rounded-xl`} />
    </div>
  );
}