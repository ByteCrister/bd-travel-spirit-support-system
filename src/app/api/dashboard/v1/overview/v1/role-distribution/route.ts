// app/api/dashboard/v1/overview/v1/role-distribution/route.ts
import { ACCOUNT_STATUS } from '@/constants/user.const';
import { GUIDE_STATUS } from '@/constants/guide.const';
import { EMPLOYEE_STATUS } from '@/constants/employee.const';
import { RoleDistribution } from '@/types/dashboard/dashboard.types';
import ConnectDB from '@/config/db';
import { TravelerModel } from '@/models/travelers/traveler.model';
import GuideModel from '@/models/guide/guide.model';
import EmployeeModel from '@/models/employees/employees.model';
import { withErrorHandler, HandlerResult } from '@/lib/helpers/withErrorHandler';

/**
 * GET /api/dashboard/v1/overview/v1/role-distribution
 * Returns counts of users by role (travelers, organizers, support, banned).
 */
export const GET = withErrorHandler(async (): Promise<HandlerResult<RoleDistribution>> => {
    await ConnectDB();

    // Run all counts in parallel for performance
    const [
        travelersCount,
        organizersCount,
        supportCount,
        bannedTravelersCount,
        bannedGuidesCount,
    ] = await Promise.all([
        // Active travelers (not deleted)
        TravelerModel.countDocuments({ deletedAt: null }),

        // Approved guides (organizers)
        GuideModel.countDocuments({
            status: GUIDE_STATUS.APPROVED,
            deletedAt: null,
        }),

        // Active support employees (employees with status ACTIVE)
        EmployeeModel.countDocuments({
            status: EMPLOYEE_STATUS.ACTIVE,
            deletedAt: null,
        }),

        // Banned travelers: suspended account OR locked
        TravelerModel.countDocuments({
            $or: [
                { accountStatus: ACCOUNT_STATUS.SUSPENDED },
                { lockUntil: { $gt: new Date() } },
            ],
            deletedAt: null,
        }),

        // Banned guides: status SUSPENDED
        GuideModel.countDocuments({
            status: GUIDE_STATUS.SUSPENDED,
            deletedAt: null,
        }),
    ]);

    const bannedCount = bannedTravelersCount + bannedGuidesCount;

    const data: RoleDistribution = {
        travelers: travelersCount,
        organizers: organizersCount,
        support: supportCount,
        banned: bannedCount,
        lastUpdated: new Date().toISOString(),
    };

    // Return the data – withErrorHandler will wrap it in { data, status: 200 }
    return { data };
});