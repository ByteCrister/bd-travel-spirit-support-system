// components/PaymentAccounts/PaymentAccountSkeleton.tsx
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// ── Neumorphism style tokens ──────────────────────────────────
const SKELETON_WRAP = "space-y-5";

const SKELETON_HEADER = "flex items-center justify-between";

const NEU_SKELETON =
    "rounded-lg bg-[#d0cecd] animate-pulse";

const TABLE_WRAP =
    "rounded-2xl bg-[#E7E5E4] border border-white/60 overflow-hidden " +
    "shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]";

const TABLE_HEAD_CELL =
    "font-[family-name:var(--font-space-mono)] text-xs font-bold uppercase tracking-widest text-[#1E2938]/55";

const TABLE_ROW = "border-b border-[#1E2938]/06 hover:bg-transparent";
// ─────────────────────────────────────────────────────────────

export function PaymentAccountSkeleton() {
    return (
        <div className={SKELETON_WRAP}>
            <div className={SKELETON_HEADER}>
                <div className={`${NEU_SKELETON} h-8 w-52`} />
                <div className={`${NEU_SKELETON} h-10 w-36`} />
            </div>

            <div className={TABLE_WRAP}>
                <Table>
                    <TableHeader>
                        <TableRow className={TABLE_ROW}>
                            {["Card Details", "Label", "Owner Type", "Purpose", "Active", "Backup", "Actions"].map((h) => (
                                <TableHead key={h} className={TABLE_HEAD_CELL}>{h}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i} className={TABLE_ROW}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className={`${NEU_SKELETON} h-6 w-14 rounded-lg`} />
                                        <div className="space-y-1.5">
                                            <div className={`${NEU_SKELETON} h-4 w-24`} />
                                            <div className={`${NEU_SKELETON} h-3 w-20`} />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell><div className={`${NEU_SKELETON} h-4 w-24`} /></TableCell>
                                <TableCell><div className={`${NEU_SKELETON} h-6 w-20 rounded-lg`} /></TableCell>
                                <TableCell><div className={`${NEU_SKELETON} h-4 w-20`} /></TableCell>
                                <TableCell><div className={`${NEU_SKELETON} h-6 w-10 rounded-full`} /></TableCell>
                                <TableCell><div className={`${NEU_SKELETON} h-6 w-10 rounded-full`} /></TableCell>
                                <TableCell>
                                    <div className="flex justify-end gap-2">
                                        <div className={`${NEU_SKELETON} h-9 w-9 rounded-xl`} />
                                        <div className={`${NEU_SKELETON} h-9 w-9 rounded-xl`} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}