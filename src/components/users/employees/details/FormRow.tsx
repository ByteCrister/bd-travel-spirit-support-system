// ── Neumorphism tokens ──────────────────────────────────────────
const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
// ───────────────────────────────────────────────────────────────

export default function FormRow({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className={`flex items-center gap-1.5 ${NEU_LABEL}`}>
        {Icon && <Icon className="h-3.5 w-3.5 text-[#006666]" />}
        {label}
      </label>
      {children}
    </div>
  );
}