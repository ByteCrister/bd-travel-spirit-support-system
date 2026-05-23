import { FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';

// ── Neumorphism style tokens ──────────────────────────────────
const LABEL =
    'font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest';
const DESCRIPTION =
    'font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50 mt-1';
const ITEM = 'space-y-1.5';

export function FormFieldWrapper({
    label,
    description,
    children,
}: {
    label: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <FormItem className={ITEM}>
            <FormLabel className={LABEL}>{label}</FormLabel>
            <FormControl>{children}</FormControl>
            {description && (
                <FormDescription className={DESCRIPTION}>{description}</FormDescription>
            )}
            <FormMessage className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#FF2157] mt-1" />
        </FormItem>
    );
}