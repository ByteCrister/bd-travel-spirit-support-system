// ── Neumorphism tokens ──────────────────────────────────────────
const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";

const NEU_MONO =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm font-medium text-[#1E2938]";
// ───────────────────────────────────────────────────────────────

export default function InfoField({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className={`flex items-center gap-1.5 ${NEU_LABEL}`}>
        {Icon && <Icon className="h-3.5 w-3.5 text-[#006666]" />}
        {label}
      </div>
      <div className={NEU_MONO}>{value}</div>
    </div>
  );
}