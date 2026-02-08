import { NextResponse } from 'next/server';
import type { EmployeesStats } from '@/types/dashboard/statistics.types';

export async function GET() {
    const data: EmployeesStats = {
        countsByRole: [
            { label: 'Guide', count: 50 },
            { label: 'Admin', count: 10 },
            { label: 'Support', count: 20 },
        ],
        countsByDepartment: [
            { label: 'Operations', count: 40 },
            { label: 'Marketing', count: 20 },
            { label: 'Tech', count: 20 },
        ],
        countsByStatus: [
            { label: 'Active', count: 70 },
            { label: 'On Leave', count: 10 },
            { label: 'Inactive', count: 10 },
        ],
        shiftsData: {
            scheduled: 100,
            completed: 95,
            completionRate: 95,
        },
    };

    return NextResponse.json(data);
}
