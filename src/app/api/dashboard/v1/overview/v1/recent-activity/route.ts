import { NextRequest } from 'next/server';
import { Types } from 'mongoose';
import ConnectDB from '@/config/db';
import { RecentActivity, RecentActivityType, Severity } from '@/types/dashboard/dashboard.types';
import { HandlerResult, withErrorHandler } from '@/lib/helpers/withErrorHandler';

// --- Placeholder imports – replace with your actual models when ready ---
// import ActivityModel, { IActivity } from '@/models/activity.model';
// import UserModel, { IUserDoc } from '@/models/user.model';
// import { getCollectionName } from '@/lib/helpers/get-collection-name';

// Example shape of a populated activity document (adjust to your schema)
interface PopulatedActivity {
    _id: Types.ObjectId;
    type: RecentActivityType;
    title: string;
    description: string;
    createdAt: Date;
    severity?: Severity;
    user?: {
        _id: Types.ObjectId;
        name: string;
        email: string;
    } | null;
}

// Shape of the paginated response
interface RecentActivityData {
    items: RecentActivity[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

/**
 * GET /api/dashboard/v1/overview/v1/recent-activity
 * Returns a paginated list of recent activity logs.
 */
export const GET = withErrorHandler(async (
    request: NextRequest
): Promise<HandlerResult<RecentActivityData>> => {
    await ConnectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const skip = (page - 1) * limit;

    // --- Replace with your actual model queries ---
    // Example: assuming an ActivityModel with fields: type, title, description, createdAt, severity, user (ref)
    /*
    const query = ActivityModel.find({ deletedAt: null })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'user',
        model: getCollectionName(UserModel),
        select: 'name email',
      });
  
    const [rawActivities, total] = await Promise.all([
      query.lean().exec(),
      ActivityModel.countDocuments({ deletedAt: null }),
    ]);
  
    const activities = rawActivities as unknown as PopulatedActivity[];
    */

    // --- Temporary mock data – replace with real query once models are ready ---
    // This section demonstrates the expected data shape.
    // When you have your models, remove this mock block and uncomment the real query above.
    const mockActivities: PopulatedActivity[] = Array.from({ length: Math.min(limit, 10) }).map((_, i) => ({
        _id: new Types.ObjectId(),
        type: ['signup', 'booking', 'report', 'tour', 'user_action'][i % 5] as RecentActivityType,
        title: `Activity ${i + 1}`,
        description: `Description for activity ${i + 1}`,
        createdAt: new Date(Date.now() - i * 3600000),
        severity: ['low', 'medium', 'high'][i % 3] as Severity,
        user: {
            _id: new Types.ObjectId(),
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
        },
    }));
    const total = 50; // assume 50 total records
    // --- End mock data ---

    // Transform to match the RecentActivity interface
    const items: RecentActivity[] = (mockActivities /* replace with activities */).map((a) => ({
        id: a._id.toString(),
        type: a.type,
        title: a.title,
        description: a.description,
        timestamp: a.createdAt.toISOString(),
        user: a.user?.name || a.user?.email, // or combine as needed
        severity: a.severity,
    }));

    return {
        data: {
            items,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        },
    };
});