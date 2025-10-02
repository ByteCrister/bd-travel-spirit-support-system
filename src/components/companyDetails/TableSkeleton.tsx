// components/company/TableSkeleton.tsx
"use client";

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
    columns: string[];
    rows?: number;
}

export function TableSkeleton({ columns, rows = 8 }: Props) {
    return (
        <div className="rounded-md border overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((col) => (
                            <TableHead key={col}>
                                <Skeleton className="h-3 w-24" />
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: rows }).map((_, rIdx) => (
                        <TableRow key={rIdx}>
                            {columns.map((_, cIdx) => (
                                <TableCell key={cIdx}>
                                    <Skeleton className="h-4 w-full max-w-[180px]" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
