// ── Neumorphic style tokens ───────────────────────────────────
const NEU_TABLE_WRAP =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_20px_#c8c6c5,-8px_-8px_20px_#ffffff] border border-white/60 overflow-x-auto";

const NEU_TH =
    "px-4 py-3.5 text-left font-bold text-xs font-[family-name:var(--font-space-mono)] uppercase tracking-widest text-[#1E2938]/50";

const NEU_TD =
    "px-4 py-3.5";

const NEU_SKELETON =
    "rounded-lg bg-[#d0cecd] animate-pulse";

const NEU_ROW_ODD =
    "border-t border-[#d0cecd]/60";

// ─────────────────────────────────────────────────────────────

interface Props {
    columns: string[];
    rows?: number;
}

export function TableSkeleton({ columns, rows = 8 }: Props) {
    return (
        <div className={NEU_TABLE_WRAP}>
            <table className="w-full">
                <thead>
                    <tr className="border-b border-[#c8c6c5]">
                        {columns.map((col) => (
                            <th key={col} className={NEU_TH}>
                                <div className={`${NEU_SKELETON} h-3 w-20`} />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, rIdx) => (
                        <tr key={rIdx} className={rIdx > 0 ? NEU_ROW_ODD : ""}>
                            {columns.map((_, cIdx) => (
                                <td key={cIdx} className={NEU_TD}>
                                    <div
                                        className={`${NEU_SKELETON} h-4`}
                                        style={{ maxWidth: `${120 + ((cIdx * 37 + rIdx * 13) % 80)}px` }}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}