import { NextRequest, NextResponse } from 'next/server';
import ConnectDB from '@/config/db';
import { PendingAction, PendingActionPriority } from '@/types/dashboard/dashboard.types';
import TourModel from '@/models/tours/tour.model';
import GuideModel from '@/models/guide/guide.model';
import TravelArticleCommentModel from '@/models/articles/travel-article-comment.model';
import GuideForgotPasswordModel from '@/models/guide/guide-forgot-password.model';
import ResetPasswordRequestModel from '@/models/employees/reset-password-request.model';
import { MODERATION_STATUS } from '@/constants/tour.const';
import { GUIDE_STATUS } from '@/constants/guide.const';
import { COMMENT_STATUS } from '@/constants/articleComment.const';
import { FORGOT_PASSWORD_STATUS } from '@/constants/guide-forgot-password.const';
import { REQUEST_STATUS } from '@/constants/reset-password-request.const';

export async function GET(request: NextRequest) {
    try {
        await ConnectDB();

        const [
            pendingTours,
            pendingGuides,
            pendingComments,
            pendingGuidePasswords,
            pendingEmployeePasswords
        ] = await Promise.all([
            TourModel.find({ moderationStatus: MODERATION_STATUS.PENDING, deletedAt: null }).lean(),
            GuideModel.find({ status: GUIDE_STATUS.PENDING, deletedAt: null }).lean(),
            TravelArticleCommentModel.find({ status: COMMENT_STATUS.PENDING, isDeleted: false }).lean(),
            GuideForgotPasswordModel.find({ status: FORGOT_PASSWORD_STATUS.PENDING }).lean(),
            ResetPasswordRequestModel.find({ status: REQUEST_STATUS.PENDING }).lean(),
        ]);

        const transformed: PendingAction[] = [
            ...pendingTours.map((t: any) => ({
                id: t._id.toString(),
                type: 'tour_approval' as const,
                title: `New Tour: ${t.title || 'Untitled'}`,
                description: `Tour awaiting moderation from company ${t.companyId?.toString()}`,
                priority: 'medium' as PendingActionPriority,
                createdAt: (t.createdAt || new Date()).toISOString(),
                status: 'pending' as const,
            })),
            ...pendingGuides.map((g: any) => ({
                id: g._id.toString(),
                type: 'organizer_approval' as const,
                title: `Guide Application: ${g.companyName || 'Unknown'}`,
                description: `New guide application awaiting review`,
                priority: 'high' as PendingActionPriority,
                createdAt: (g.createdAt || new Date()).toISOString(),
                status: 'pending' as const,
            })),
            ...pendingComments.map((c: any) => ({
                id: c._id.toString(),
                type: 'article_comment' as const,
                title: `Pending Comment`,
                description: c.content ? (c.content.length > 50 ? c.content.substring(0, 50) + '...' : c.content) : 'Awaiting moderation',
                priority: 'low' as PendingActionPriority,
                createdAt: (c.createdAt || new Date()).toISOString(),
                status: 'pending' as const,
            })),
            ...pendingGuidePasswords.map((p: any) => ({
                id: p._id.toString(),
                type: 'guide_password_reset' as const,
                title: `Guide Password Reset`,
                description: p.reason || `A guide requested password reset`,
                priority: 'urgent' as PendingActionPriority,
                createdAt: (p.createdAt || new Date()).toISOString(),
                status: 'pending' as const,
            })),
            ...pendingEmployeePasswords.map((p: any) => ({
                id: p._id.toString(),
                type: 'employee_password_reset' as const,
                title: `Employee Password Reset`,
                description: p.description || `An employee requested password reset`,
                priority: 'urgent' as PendingActionPriority,
                createdAt: (p.createdAt || new Date()).toISOString(),
                status: 'pending' as const,
            })),
        ];

        // Sort by created date descending
        transformed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Return array as data so it correctly maps to ApiResponse<PendingAction[]>
        return NextResponse.json({
            success: true,
            data: transformed
        });

    } catch (error) {
        console.error('Failed to fetch pending actions:', error);

        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}