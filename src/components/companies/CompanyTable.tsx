'use client';

import { memo } from 'react';
import { Building2, Mail, Users, MapPin, Star, Clock, Calendar, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    Table,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { CompanyRowDTO } from '@/types/company.types';
import TableBodyWithTooltips from './TableBodyWithTooltips';
import { encodeId } from '@/utils/helpers/mongodb-id-conversions';

/**
 * Props for CompanyTable.
 * @property rows - Array of company rows to render.
 */
export interface CompanyTableProps {
    rows: CompanyRowDTO[];
}

/**
 * CompanyTable: Renders the companies list with rich, accessible columns.
 * Adds subtle hover scale animation using framer-motion.
 */
export const CompanyTable = memo(function CompanyTable({
    rows,
}: CompanyTableProps) {
    const router = useRouter();

    const handleViewCompany = (companyId: string) => {
        router.push(`/companies/${encodeId(companyId)}`);
    };

    return (
        <div className="overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                Company
                            </div>
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Host Email
                            </div>
                        </TableHead>
                        <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">
                            <div className="flex items-center justify-end gap-2">
                                <Users className="w-4 h-4" />
                                Employees
                            </div>
                        </TableHead>
                        <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">
                            <div className="flex items-center justify-end gap-2">
                                <MapPin className="w-4 h-4" />
                                Tours
                            </div>
                        </TableHead>
                        <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">
                            <div className="flex items-center justify-end gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Reviews
                            </div>
                        </TableHead>
                        <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">
                            <div className="flex items-center justify-end gap-2">
                                <Star className="w-4 h-4" />
                                Rating
                            </div>
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Last Login
                            </div>
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Created
                            </div>
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBodyWithTooltips rows={rows} handleViewCompany={handleViewCompany} />

            </Table>
        </div>
    );
});