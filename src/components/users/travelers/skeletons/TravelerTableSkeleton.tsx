// components/travelers/skeletons/TravelerTableSkeleton.tsx

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_SKELETON_ROW = "h-12 w-full rounded-xl bg-[#d0cecd] animate-pulse";
const NEU_SKELETON_WRAPPER = "space-y-3 p-4 bg-[#E7E5E4]";

export default function TravelerTableSkeleton() {
  return (
    <div className={NEU_SKELETON_WRAPPER}>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={NEU_SKELETON_ROW}
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  );
}
