// api/users/employees/v1/route.ts
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import ConnectDB from '@/config/db';
import EmployeeModel, { IEmployee } from '@/models/employees/employees.model';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import { ApiError } from '@/lib/helpers/withErrorHandler';
import {
    EmployeesQuery,
    EmployeeSortKey,
    SortOrder,
    EmployeesListResponse,
    EmployeeListItemDTO,
} from '@/types/employee.types';
import { PAYROLL_STATUS } from '@/constants/employee.const';
import AssetModel from '@/models/assets/asset.model';
import AssetFileModel from '@/models/assets/asset-file.model';
import { getCollectionName } from '@/lib/helpers/get-collection-name';
import UserModel from '@/models/user.model';
import { USER_ROLE } from '@/constants/user.const';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parse `filters[...]` style URL query params into a nested object
 */
function parseFilters(searchParams: URLSearchParams): EmployeesQuery['filters'] {
    const filters: EmployeesQuery['filters'] = {};

    for (const [key, value] of searchParams.entries()) {
        if (!key.startsWith('filters[')) continue;

        // Extract path segments for nested keys
        const path = key
            .replace(/^filters\[/, '')
            .replace(/\]$/g, '')
            .split('][') as Array<keyof EmployeesQuery['filters'] | string>;

        // Recursive target to assign value
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let target: any = filters;

        for (let i = 0; i < path.length - 1; i++) {
            const segment = path[i];
            if (!(segment in target)) target[segment] = {};
            target = target[segment];
        }

        const lastSegment = path[path.length - 1];

        // Convert "true"/"false" and numeric strings
        let finalValue: string | number | boolean = value;
        if (value === 'true') finalValue = true;
        else if (value === 'false') finalValue = false;
        else if (!isNaN(Number(value))) finalValue = Number(value);

        target[lastSegment] = finalValue;
    }

    return filters;
}

// Helper to build Mongoose filter and sort
/**
 * Build Mongoose filter and sort objects from query
 */
function buildMongooseQuery(query: EmployeesQuery) {
    const filter: mongoose.FilterQuery<unknown> = {};
    const sort: Record<string, 1 | -1> = {};

    // Soft delete
    if (!query.filters?.includeDeleted) filter.deletedAt = null;

    // Status filter
    if (query.filters?.statuses?.length) filter.status = { $in: query.filters.statuses };

    // Employment type filter
    if (query.filters?.employmentTypes?.length) filter.employmentType = { $in: query.filters.employmentTypes };

    // Payment status filter - handled separately in aggregation
    // (We'll filter this after computing current month payment status)

    // Salary range
    if (query.filters?.salaryMin !== undefined || query.filters?.salaryMax !== undefined) {
        filter.salary = {};
        if (query.filters.salaryMin !== undefined) filter.salary.$gte = query.filters.salaryMin;
        if (query.filters.salaryMax !== undefined) filter.salary.$lte = query.filters.salaryMax;
    }

    // Date range filters
    if (query.filters?.joinedAfter || query.filters?.joinedBefore) {
        filter.dateOfJoining = {};
        if (query.filters.joinedAfter) filter.dateOfJoining.$gte = new Date(query.filters.joinedAfter);
        if (query.filters.joinedBefore) filter.dateOfJoining.$lte = new Date(query.filters.joinedBefore);
    }

    if (query.filters?.leftAfter || query.filters?.leftBefore) {
        filter.dateOfLeaving = {};
        if (query.filters.leftAfter) filter.dateOfLeaving.$gte = new Date(query.filters.leftAfter);
        if (query.filters.leftBefore) filter.dateOfLeaving.$lte = new Date(query.filters.leftBefore);
    }

    // ! Main site employees only
    filter.$or = [
        { companyId: null },
        { companyId: { $exists: false } }
    ];

    // Sorting
    const sortOrder: 1 | -1 = query.sortOrder === 'asc' ? 1 : -1;
    switch (query.sortBy) {
        case 'user.name':
            sort['user.name'] = sortOrder;
            break;
        case 'user.email':
            sort['user.email'] = sortOrder;
            break;
        case 'status':
            sort.status = sortOrder;
            break;
        case 'employmentType':
            sort.employmentType = sortOrder;
            break;
        case 'salary':
            sort.salary = sortOrder;
            break;
        case 'dateOfJoining':
            sort.dateOfJoining = sortOrder;
            break;
        case 'dateOfLeaving':
            sort.dateOfLeaving = sortOrder;
            break;
        case 'createdAt':
            sort.createdAt = sortOrder;
            break;
        case 'updatedAt':
            sort.updatedAt = sortOrder;
            break;
        case 'paymentStatus':
            // We'll sort by payment status in aggregation after computing it
            sort['currentPaymentStatus'] = sortOrder;
            break;
        default:
            sort.createdAt = -1;
    }

    return { filter, sort };
}

/**
 * GET employee list table data
 */
export const UserEmployeeListGetHandler = async (req: NextRequest) => {
    // Authenticate
    const userId = await getUserIdFromSession();
    if (!userId) throw new ApiError('Unauthorized', 401);

    // Parse query params
    const searchParams = req.nextUrl.searchParams;
    const query: EmployeesQuery = {
        page: parseInt(searchParams.get('page') || `${DEFAULT_PAGE}`),
        limit: Math.min(parseInt(searchParams.get('limit') || `${DEFAULT_LIMIT}`), MAX_LIMIT),
        sortBy: (searchParams.get('sortBy') as EmployeeSortKey) || 'createdAt',
        sortOrder: (searchParams.get('sortOrder') as SortOrder) || 'desc',
    };

    query.filters = parseFilters(searchParams);

    // Ensure array types
    if (query.filters?.employmentTypes && !Array.isArray(query.filters.employmentTypes)) {
        query.filters.employmentTypes = [query.filters.employmentTypes];
    }
    if (query.filters?.statuses && !Array.isArray(query.filters.statuses)) {
        query.filters.statuses = [query.filters.statuses];
    }
    if (query.filters?.paymentStatuses && !Array.isArray(query.filters.paymentStatuses)) {
        query.filters.paymentStatuses = [query.filters.paymentStatuses];
    }

    // Connect to DB
    await ConnectDB();

    const { filter, sort } = buildMongooseQuery(query);

    // Aggregation pipeline
    const pipeline: mongoose.PipelineStage[] = [
        { $match: filter },

        // -------------------- USER --------------------
        {
            $lookup: {
                from: getCollectionName(UserModel),
                localField: 'user',
                foreignField: '_id',
                as: 'user',
            },
        },
        { $unwind: '$user' },

        {
            $match: {
                'user.role': USER_ROLE.SUPPORT,
            },
        },

        // User avatar -> Asset
        {
            $lookup: {
                from: getCollectionName(AssetModel),
                localField: 'user.avatar',
                foreignField: '_id',
                as: 'userAvatarAsset',
            },
        },
        { $unwind: { path: '$userAvatarAsset', preserveNullAndEmptyArrays: true } },

        // User avatar -> AssetFile
        {
            $lookup: {
                from: getCollectionName(AssetFileModel),
                localField: 'userAvatarAsset.file',
                foreignField: '_id',
                as: 'userAvatarFile',
            },
        },
        { $unwind: { path: '$userAvatarFile', preserveNullAndEmptyArrays: true } },

        // -------------------- PAYMENT STATUS CALCULATION --------------------
        // Add current month payment status calculation
        {
            $addFields: {
                // Calculate days since joining
                daysSinceJoining: {
                    $floor: {
                        $divide: [
                            { $subtract: [new Date(), '$dateOfJoining'] },
                            1000 * 60 * 60 * 24 // milliseconds in a day
                        ]
                    }
                }
            }
        },
        {
            $addFields: {
                // Calculate current payment cycle (30-day cycles)
                currentCycle: {
                    $floor: { $divide: ['$daysSinceJoining', 30] }
                },
                // Get current month and year based on cycle
                currentPaymentMonthYear: {
                    $let: {
                        vars: {
                            cycleDate: {
                                $add: [
                                    '$dateOfJoining',
                                    { $multiply: ['$currentCycle', 30, 1000 * 60 * 60 * 24] }
                                ]
                            }
                        },
                        in: {
                            year: { $year: '$$cycleDate' },
                            month: { $month: '$$cycleDate' }
                        }
                    }
                }
            }
        },
        {
            $addFields: {
                // Find payroll record for current month
                currentMonthPayrollRecord: {
                    $arrayElemAt: [
                        {
                            $filter: {
                                input: '$payroll',
                                as: 'record',
                                cond: {
                                    $and: [
                                        { $eq: ['$$record.year', '$currentPaymentMonthYear.year'] },
                                        { $eq: ['$$record.month', '$currentPaymentMonthYear.month'] }
                                    ]
                                }
                            }
                        },
                        0
                    ]
                },
                // Calculate if payment is due
                isPaymentDue: {
                    $gte: ['$daysSinceJoining', { $multiply: ['$currentCycle', 30] }]
                }
            }
        },
        {
            $addFields: {
                currentPaymentStatus: {
                    $cond: {
                        if: { $gt: [{ $size: { $ifNull: ['$currentMonthPayrollRecord', []] } }, 0] },
                        then: '$currentMonthPayrollRecord.status',
                        else: {
                            $cond: {
                                if: '$isPaymentDue',
                                then: PAYROLL_STATUS.PENDING,
                                else: PAYROLL_STATUS.PENDING // Not yet due, still pending
                            }
                        }
                    }
                }
            }
        },

        // -------------------- SEARCH --------------------
        ...(query.filters?.search
            ? [
                {
                    $match: {
                        $or: [
                            { 'user.name': { $regex: query.filters.search, $options: 'i' } },
                            { 'user.email': { $regex: query.filters.search, $options: 'i' } },
                            { 'contactInfo.phone': { $regex: query.filters.search, $options: 'i' } },
                            { 'contactInfo.email': { $regex: query.filters.search, $options: 'i' } },
                        ],
                    },
                },
            ]
            : []),

        // -------------------- PAYMENT STATUS FILTER --------------------
        ...(query.filters?.paymentStatuses?.length
            ? [
                {
                    $match: {
                        currentPaymentStatus: { $in: query.filters.paymentStatuses }
                    }
                }
            ]
            : []),

        // -------------------- SORT & PAGINATION --------------------
        { $sort: sort },
        { $skip: (query.page! - 1) * query.limit! },
        { $limit: query.limit! },

        // -------------------- PROJECT --------------------
        {
            $project: {
                _id: 1,
                status: 1,
                employmentType: 1,
                salary: 1,
                currency: 1,
                paymentMode: 1,
                dateOfJoining: 1,
                dateOfLeaving: 1,
                contactInfo: 1,
                shifts: 1,
                lastLogin: 1,
                deletedAt: 1,
                createdAt: 1,
                updatedAt: 1,
                companyId: 1,
                payroll: 1,
                currentPaymentStatus: 1, // Include calculated payment status

                user: {
                    firstName: { $arrayElemAt: [{ $split: ['$user.name', ' '] }, 0] },
                    lastName: { $arrayElemAt: [{ $split: ['$user.name', ' '] }, 1] },
                    email: '$user.email',
                    phone: '$user.phone',
                    avatarUrl: '$userAvatarFile.publicUrl',
                },
            },
        },
    ];

    // Get total count (respect all filters including payment status)
    const countPipeline = [...pipeline.slice(0, -4)]; // Remove sort, skip, limit, project
    countPipeline.push({ $count: 'total' });

    let total = 0;
    try {
        const countResult = await EmployeeModel.aggregate(countPipeline);
        total = countResult[0]?.total || 0;
    } catch (error) {
        console.error('Error counting employees:', error);
        // If there's an error with the complex aggregation, fall back to simple count
        const simpleCount = await EmployeeModel.countDocuments(filter);
        total = simpleCount;
    }

    // Execute main aggregation
    const employees = await EmployeeModel.aggregate(pipeline);

    // Map to DTO
    const docs: EmployeeListItemDTO[] = employees.map((emp) => {
        // Calculate current month payment status for DTO
        const currentPaymentStatus = emp.currentPaymentStatus || PAYROLL_STATUS.PENDING;

        // Calculate due date for current payment cycle
        const joiningDate = new Date(emp.dateOfJoining);
        const today = new Date();
        const timeDiff = today.getTime() - joiningDate.getTime();
        const daysSinceJoining = Math.floor(timeDiff / (1000 * 3600 * 24));
        const currentCycle = Math.floor(daysSinceJoining / 30);
        const dueDate = new Date(joiningDate);
        dueDate.setDate(dueDate.getDate() + ((currentCycle + 1) * 30));

        // Find current month payroll record for additional details
        const currentMonthRecord = (emp.payroll as IEmployee["payroll"])?.find((record) => {
            const recordDate = new Date(record.year, record.month - 1, 1);
            const currentDate = new Date();
            return recordDate.getFullYear() === currentDate.getFullYear() &&
                recordDate.getMonth() === currentDate.getMonth();
        });

        return {
            id: emp._id.toString(),
            user: {
                name: [emp.user.firstName, emp.user.lastName].filter(Boolean).join(' '),
                email: emp.user.email,
                phone: emp.user.phone,
                avatar: emp.user.avatarUrl,
            },
            companyId: emp.companyId?.toString(),
            status: emp.status,
            employmentType: emp.employmentType,
            salary: emp.salary,
            currency: emp.currency,
            paymentMode: emp.paymentMode,
            currentMonthPayment: {
                status: currentPaymentStatus,
                amount: emp.salary,
                currency: emp.currency,
                dueDate: dueDate.toISOString(),
                attemptedAt: currentMonthRecord?.attemptedAt?.toISOString(),
                paidAt: currentMonthRecord?.paidAt?.toISOString(),
                transactionRef: currentMonthRecord?.transactionRef,
                failureReason: currentMonthRecord?.failureReason,
            },
            dateOfJoining: emp.dateOfJoining.toISOString(),
            dateOfLeaving: emp.dateOfLeaving?.toISOString(),
            contactPhone: emp.contactInfo.phone,
            contactEmail: emp.contactInfo.email,
            shiftSummary: emp.shifts?.length
                ? `${emp.shifts[0].startTime}-${emp.shifts[0].endTime} (${emp.shifts[0].days.join(', ')})`
                : undefined,
            lastLogin: emp.lastLogin?.toISOString(),
            avatar: emp.user.avatarUrl,
            isDeleted: !!emp.deletedAt,
            createdAt: emp.createdAt.toISOString(),
            updatedAt: emp.updatedAt.toISOString(),
        };
    });

    // Pagination metadata
    const pages = Math.ceil(total / query.limit!);

    const response: EmployeesListResponse = {
        docs,
        total,
        page: query.page!,
        pages,
    };

    return { status: 200, data: response };
};