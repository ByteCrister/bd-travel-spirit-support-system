'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { motion } from 'framer-motion';

/**
 * CompanySkeleton: Loading state for the companies table.
 * Uses shadcn Skeleton with a subtle shimmer and animated table mount.
 */
export function CompanySkeleton() {
    const rows = Array.from({ length: 8 });

    return (
        <motion.div
            className="rounded-md border bg-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            aria-busy="true"
            aria-live="polite"
        >
            <Table>
                <TableHeader className="font-[var(--font-poppins)]">
                    <TableRow>
                        <TableHead>Company name</TableHead>
                        <TableHead>Host email</TableHead>
                        <TableHead className="text-right">Employees</TableHead>
                        <TableHead className="text-right">Tours</TableHead>
                        <TableHead className="text-right">Reviews</TableHead>
                        <TableHead className="text-right">Avg rating</TableHead>
                        <TableHead>Last login</TableHead>
                        <TableHead>Created at</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="font-[var(--font-inter)]">
                    {rows.map((_, i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <div className="flex flex-col gap-2">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-3 w-28" />
                                </div>
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-52" />
                            </TableCell>
                            <TableCell className="text-right">
                                <Skeleton className="ml-auto h-4 w-16" />
                            </TableCell>
                            <TableCell className="text-right">
                                <Skeleton className="ml-auto h-4 w-16" />
                            </TableCell>
                            <TableCell className="text-right">
                                <Skeleton className="ml-auto h-4 w-16" />
                            </TableCell>
                            <TableCell className="text-right">
                                <Skeleton className="ml-auto h-4 w-14" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-36" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-36" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </motion.div>
    );
}
