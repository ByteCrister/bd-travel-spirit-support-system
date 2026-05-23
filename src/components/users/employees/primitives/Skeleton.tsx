// components/employees/primitives/Skeleton.tsx
// ── Neumorphic style tokens ────────────────────────────────────
const NEU_SKELETON = "animate-pulse rounded-lg bg-[#d0cecd]";
// ─────────────────────────────────────────────────────────────

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`${NEU_SKELETON} ${className}`} />;
}
