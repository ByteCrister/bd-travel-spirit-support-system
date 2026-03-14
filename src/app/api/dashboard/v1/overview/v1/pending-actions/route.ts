import { NextRequest, NextResponse } from 'next/server';
// import ConnectDB from '@/config/db';
// import { PendingActionModel } from '@/models/admin/pending-action.model';
import { ApiResponse } from '@/types/common/api.types';
import { PendingAction } from '@/types/dashboard/dashboard.types';

export async function GET(request: NextRequest) {
    try {
        // await ConnectDB();

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);

        // const skip = (page - 1) * limit;

        /**
         * Model not implemented yet.
         * The following query is commented out until PendingActionModel is created.
         */

        /*
        const query = PendingActionModel.find()
            .sort({ priority: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const [actions, total] = await Promise.all([
            query.exec(),
            PendingActionModel.countDocuments(),
        ]);

        const transformed: PendingAction[] = actions.map((action) => ({
            id: action._id.toString(),
            type: action.type,
            title: action.title,
            description: action.description,
            priority: action.priority,
            createdAt: action.createdAt.toISOString(),
            assignedTo: action.assignedTo?.toString(),
            status: action.status,
            metadata: action.metadata,
        }));
        */

        /**
         * Temporary empty response
         * until PendingActionModel is implemented
         */

        const transformed: PendingAction[] = [];

        return NextResponse.json({
            data: transformed,
            pagination: {
                page,
                limit,
                total: 0,
                pages: 0,
            },
        } as ApiResponse<PendingAction[]>);

    } catch (error) {
        console.error('Failed to fetch pending actions:', error);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}