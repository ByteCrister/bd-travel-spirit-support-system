'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, Database } from 'lucide-react';
import { formatDateRange } from '@/utils/helpers/format';
import { toCsv, toJson } from '@/utils/helpers/export';
import { useStatisticsStore } from '@/store/useStatisticsStore';
import { ChatStats, EmployeesStats, ImagesStats, NotificationsStats, ReportsStats, ReviewsStats, ToursStats, UsersStats } from '@/types/statistics.types';

type Data = UsersStats | ToursStats | ReviewsStats | ReportsStats | ImagesStats | NotificationsStats | ChatStats | EmployeesStats | null
interface ExportMenuProps {
    data: Data;
    section: string;
    disabled?: boolean;
}

export function ExportMenu({ data, section, disabled }: ExportMenuProps) {
    const { filters } = useStatisticsStore();

    const getFilename = (type: 'csv' | 'json') => {
        const dateRange = formatDateRange(filters.dateRange.from, filters.dateRange.to);
        const sanitizedRange = dateRange.replace(/[^a-zA-Z0-9]/g, '_');
        return `${section}_statistics_${sanitizedRange}.${type}`;
    };

    const handleCsvExport = () => {
        if (!data) return;

        // Convert data to flat structure for CSV
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let csvData: any[] = [];
        let columns: { key: string; label: string }[] = [];

        if (Array.isArray(data)) {
            csvData = data;
            if (data.length > 0) {
                columns = Object.keys(data[0]).map(key => ({
                    key,
                    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
                }));
            }
        } else if (typeof data === 'object') {
            // Convert object to array of key-value pairs
            csvData = Object.entries(data).map(([key, value]) => {
                if (typeof value === 'object' && value !== null) {
                    return { category: key, ...value };
                }
                return { category: key, value };
            });

            if (csvData.length > 0) {
                columns = Object.keys(csvData[0]).map(key => ({
                    key,
                    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
                }));
            }
        }

        if (csvData.length > 0 && columns.length > 0) {
            toCsv(csvData, columns, getFilename('csv').replace('.csv', ''));
        }
    };

    const handleJsonExport = () => {
        if (!data) return;
        toJson(data, getFilename('json').replace('.json', ''));
    };

    if (disabled || !data) {
        return (
            <Button variant="outline" size="sm" disabled>
                <Download className="h-4 w-4 mr-2" />
                Export
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCsvExport}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleJsonExport}>
                    <Database className="h-4 w-4 mr-2" />
                    Export as JSON
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}