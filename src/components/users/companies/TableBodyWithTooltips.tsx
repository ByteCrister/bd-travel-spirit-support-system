import { useState, useRef } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CompanyRowDTO } from "@/types/company.types";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TableBody, TableCell, TableRow } from "../../ui/table";
import { Building2, Star } from "lucide-react";
import { formatDate, formatRating, formatRelativeTime } from "@/utils/helpers/companies.company-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
function RowWithTooltip({
    row,
    index,
    onClick,
}: {
    row: CompanyRowDTO;
    index: number;
    onClick: (id: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const timerRef = useRef<number | null>(null);

    const handleMouseEnter = () => {
        // start a 2s timer; only then open the tooltip
        timerRef.current = window.setTimeout(() => {
            setOpen(true);
        }, 2000);
    };

    const handleMouseLeave = () => {
        // cancel any pending timer and close tooltip
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setOpen(false);
    };

    return (
        <Tooltip open={open}>
            <TooltipTrigger asChild>
                <motion.tr
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => onClick(row.id)}
                    className={cn(
                        "group relative border-b border-slate-100 dark:border-slate-950 last:border-b-0",
                        "transition-all duration-200",
                        "hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-violet-50/30",
                        "dark:hover:from-blue-950/20 dark:hover:to-violet-950/10",
                        "cursor-pointer"
                    )}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                >
                    <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 rounded-lg">
                                <AvatarImage
                                    src={row.host.avatar || undefined}
                                    alt={row.name}
                                />
                                <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-white font-semibold">
                                    {row.name?.charAt(0)?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {row.name}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {row.host.companyName}
                                </span>
                            </div>
                        </div>
                    </TableCell>

                    <TableCell className="py-4">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <span className="text-sm">{row.host.email}</span>
                        </div>
                    </TableCell>

                    <TableCell className="py-4 text-right">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
                            {row.metrics.employeesCount.toLocaleString()}
                        </span>
                    </TableCell>

                    <TableCell className="py-4 text-right">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium">
                            {row.metrics.toursCount.toLocaleString()}
                        </span>
                    </TableCell>

                    <TableCell className="py-4 text-right">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                            {row.metrics.reviewsCount.toLocaleString()}
                        </span>
                    </TableCell>

                    <TableCell className="py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                                {formatRating(row.metrics.averageRating)}
                            </span>
                        </div>
                    </TableCell>

                    <TableCell className="py-4">
                        <div className="flex flex-col">
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                                {formatDate(row.timestamps.lastLogin)}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                {formatRelativeTime(row.timestamps.lastLogin)}
                            </span>
                        </div>
                    </TableCell>

                    <TableCell className="py-4">
                        <div className="flex flex-col">
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                                {formatDate(row.timestamps.createdAt)}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                {formatRelativeTime(row.timestamps.createdAt)}
                            </span>
                        </div>
                    </TableCell>
                </motion.tr>
            </TooltipTrigger>

            <TooltipContent
                side="top"
                className="rounded-md bg-slate-800 text-white px-2 py-1 text-xs shadow-md dark:bg-slate-200 dark:text-slate-900"
            >
                Click to see details
            </TooltipContent>
        </Tooltip>
    );
}

export default function TableBodyWithTooltips({
    rows,
    handleViewCompany,
}: {
    rows: CompanyRowDTO[];
    handleViewCompany: (id: string) => void;
}) {
    return (
        // Keep a single provider higher in your tree if you prefer; not required with controlled open
        <TableBody>
            {rows.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                            <Building2 className="w-12 h-12 opacity-20" />
                            <p className="text-sm font-medium">No companies found</p>
                            <p className="text-xs">Try adjusting your search or filters</p>
                        </div>
                    </TableCell>
                </TableRow>
            ) : (
                rows.map((row, index) => (
                    <RowWithTooltip
                        key={row.id}
                        row={row}
                        index={index}
                        onClick={handleViewCompany}
                    />
                ))
            )}
        </TableBody>
    );
}
