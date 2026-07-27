import { NextResponse } from 'next/server';
import type { EmployeesStats } from '@/types/dashboard/statistics.types';

export async function GET() {
    const data: EmployeesStats = {
        hiresOverTime: [
            { date: '2023-01', value: 5 },
            { date: '2023-02', value: 8 },
            { date: '2023-03', value: 12 },
        ],
        countsByStatus: [
            { label: 'active', count: 70 },
            { label: 'inactive', count: 10 },
            { label: 'terminated', count: 5 },
        ],
        byEmploymentType: [
            { label: 'full-time', count: 50 },
            { label: 'part-time', count: 20 },
            { label: 'contract', count: 15 },
        ],
        byPaymentMode: [
            { label: 'automatic', count: 60 },
            { label: 'manual', count: 25 },
        ],
        payrollStatus: [
            { label: 'paid', count: 80 },
            { label: 'pending', count: 5 },
        ],
        salaryStats: {
            avg: 5000,
            min: 3000,
            max: 12000,
            totalPayroll: 425000,
            currency: 'USD',
        },
        totalShifts: 150,
        totalEmployees: 85,
    };

    return NextResponse.json({ data });
}
