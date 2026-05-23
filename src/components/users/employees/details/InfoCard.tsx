// ── Neumorphism tokens ──────────────────────────────────────────
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";

const NEU_CARD_HEADER =
  "px-6 py-4 border-b border-white/40 bg-[#E7E5E4]/80 rounded-t-2xl";

const NEU_ICON_WELL_PRIMARY =
  "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";

const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";

// ───────────────────────────────────────────────────────────────

export default function InfoCard({
  icon: Icon,
  title,
  children,
  className = "",
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`${NEU_CARD} overflow-hidden ${className}`}>
      <div className={NEU_CARD_HEADER}>
        <div className="flex items-center gap-3">
          <div className={NEU_ICON_WELL_PRIMARY}>
            <Icon className="h-5 w-5 text-[#006666]" />
          </div>
          <h3 className={`text-base ${NEU_HEADING}`}>{title}</h3>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}