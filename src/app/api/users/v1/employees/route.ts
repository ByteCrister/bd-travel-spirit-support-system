// app/api/user/v1/employees/route.ts
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import ConnectDB from '@/config/db';
import EmployeeModel from '@/models/employees/employees.model';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import { withErrorHandler, ApiError } from '@/lib/helpers/withErrorHandler';
import {
    EmployeesQuery,
    EmployeeSortKey,
    SortOrder,
    EmployeesListResponse,
    EmployeeListItemDTO,
} from '@/types/employee.types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// Helper to build Mongoose filter and sort
function buildMongooseQuery(query: EmployeesQuery) {
    const filter: mongoose.FilterQuery<unknown> = {};
    const sort: Record<string, 1 | -1> = {};

    // Soft delete filter
    if (!query.filters?.includeDeleted) filter.deletedAt = null;

    // Status filter
    if (query.filters?.statuses?.length) filter.status = { $in: query.filters.statuses };

    // Employment type filter
    if (query.filters?.employmentTypes?.length) filter.employmentType = { $in: query.filters.employmentTypes };

    // Salary range filter
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
        default:
            sort.createdAt = -1;
    }

    return { filter, sort };
}

export const GET = withErrorHandler(async (req: NextRequest) => {
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

    const filtersParam = searchParams.get('filters');
    if (filtersParam) {
        try {
            query.filters = JSON.parse(filtersParam) as EmployeesQuery['filters'];
        } catch (err) {
            console.warn('Failed to parse filters:', err);
        }
    }

    // Connect to DB
    await ConnectDB();

    const { filter, sort } = buildMongooseQuery(query);

    // Aggregation pipeline
    const pipeline: mongoose.PipelineStage[] = [
        { $match: filter },

        // Lookup user
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
            },
        },
        { $unwind: '$user' },

        // Lookup user avatar
        {
            $lookup: {
                from: 'assets',
                localField: 'user.avatar',
                foreignField: '_id',
                as: 'userAvatar',
            },
        },
        { $unwind: { path: '$userAvatar', preserveNullAndEmptyArrays: true } },

        // Lookup employee avatar
        {
            $lookup: {
                from: 'assets',
                localField: 'avatar',
                foreignField: '_id',
                as: 'employeeAvatar',
            },
        },
        { $unwind: { path: '$employeeAvatar', preserveNullAndEmptyArrays: true } },

        // Search filter
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

        // Sort
        { $sort: sort },

        // Pagination
        { $skip: (query.page! - 1) * query.limit! },
        { $limit: query.limit! },

        // Project to final DTO
        {
            $project: {
                _id: 1,
                status: 1,
                employmentType: 1,
                salary: 1,
                currency: 1,
                dateOfJoining: 1,
                dateOfLeaving: 1,
                contactInfo: 1,
                shifts: 1,
                lastLogin: 1,
                deletedAt: 1,
                createdAt: 1,
                updatedAt: 1,
                companyId: 1,
                user: {
                    firstName: { $arrayElemAt: [{ $split: ['$user.name', ' '] }, 0] },
                    lastName: { $arrayElemAt: [{ $split: ['$user.name', ' '] }, 1] },
                    email: '$user.email',
                    phone: '$user.phone',
                    avatarUrl: '$userAvatar.publicUrl',
                },
                avatarUrl: '$employeeAvatar.publicUrl',
            },
        },
    ];

    // Get total count (respect search filters)
    const countPipeline = [...pipeline];
    countPipeline.push({ $count: 'total' });
    const countResult = await EmployeeModel.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Execute main aggregation
    const employees = await EmployeeModel.aggregate(pipeline);

    // Map to DTO
    const docs: EmployeeListItemDTO[] = employees.map((emp) => ({
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
        dateOfJoining: emp.dateOfJoining.toISOString(),
        dateOfLeaving: emp.dateOfLeaving?.toISOString(),
        contactPhone: emp.contactInfo.phone,
        contactEmail: emp.contactInfo.email,
        shiftSummary: emp.shifts?.length
            ? `${emp.shifts[0].startTime}-${emp.shifts[0].endTime} (${emp.shifts[0].days.join(', ')})`
            : undefined,
        lastLogin: emp.lastLogin?.toISOString(),
        avatar: emp.avatarUrl,
        isDeleted: !!emp.deletedAt,
        createdAt: emp.createdAt.toISOString(),
        updatedAt: emp.updatedAt.toISOString(),
    }));

    // Pagination metadata
    const pages = Math.ceil(total / query.limit!);

    const response: EmployeesListResponse = {
        docs,
        total,
        page: query.page!,
        pages,
    };

    return { status: 200, data: response };
});