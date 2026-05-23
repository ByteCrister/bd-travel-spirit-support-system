// ── Neumorphic style tokens ───────────────────────────────────
const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";

const NEU_INPUT_SKELETON =
  "h-11 w-full rounded-xl bg-[#E7E5E4] " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] animate-pulse";

const NEU_LABEL_SKELETON = `${NEU_SKELETON} h-3 w-14`;

// ─────────────────────────────────────────────────────────────

export function FiltersBarSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-12 items-end">
      {/* Search */}
      <div className="md:col-span-5 space-y-2">
        <div className={NEU_LABEL_SKELETON} />
        <div className={NEU_INPUT_SKELETON} />
      </div>

      {/* Sort by */}
      <div className="md:col-span-4 space-y-2">
        <div className={NEU_LABEL_SKELETON} />
        <div className={NEU_INPUT_SKELETON} />
      </div>

      {/* Order + Limit */}
      <div className="md:col-span-3 grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className={NEU_LABEL_SKELETON} />
          <div className={NEU_INPUT_SKELETON} />
        </div>
        <div className="space-y-2">
          <div className={NEU_LABEL_SKELETON} />
          <div className={NEU_INPUT_SKELETON} />
        </div>
      </div>
    </div>
  );
}
