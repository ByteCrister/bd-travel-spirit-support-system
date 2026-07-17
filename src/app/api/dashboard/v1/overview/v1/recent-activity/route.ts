import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import ConnectDB from '@/config/db';
import { RecentActivity, RecentActivityType, Severity } from '@/types/dashboard/dashboard.types';
import { HandlerResult, withErrorHandler } from '@/lib/helpers/withErrorHandler';

// --- Placeholder imports – replace with your actual models when ready ---
// import ActivityModel, { IActivity } from '@/models/activity.model';
// import UserModel, { IUserDoc } from '@/models/user.model';
// import { getCollectionName } from '@/lib/helpers/get-collection-name';
import { TravelerModel } from '@/models/travelers/traveler.model';
import BookingModel from '@/models/tours/booking.model';
import { ReportModel } from '@/models/tours/report.model';
import TourModel from '@/models/tours/tour.model';
import AuditModel from '@/models/audit.model';
import UserModel from '@/models/user.model';

export async function GET(request: NextRequest) {
    try {
        await ConnectDB();

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);

        // Fetch recent sign-ins of travelers
        const recentTravelers = await TravelerModel.find({ lastLogin: { $ne: null } })
            .sort({ lastLogin: -1 })
            .limit(limit)
            .populate('user', 'email')
            .lean()
            .exec();

        // Fetch recent bookings
        const recentBookings = await BookingModel.find()
            .sort({ bookedAt: -1 })
            .limit(limit)
            .populate({
                path: 'traveler',
                populate: { path: 'user', select: 'email' }
            })
            .lean()
            .exec();

        // Fetch recent reports in tours
        // @ts-ignore
        const recentReports = await ReportModel.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate({
                path: 'reporter',
                populate: { path: 'user', select: 'email' }
            })
            .lean()
            .exec();

        // Fetch recent created tours
        const recentTours = await TourModel.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('authorId', 'name email')
            .lean()
            .exec();

        // Fetch recent user audits of role admin and support
        const adminAndSupportUsers = await UserModel.find({ role: { $in: ['admin', 'support'] } }, '_id name email').lean().exec();
        const adminIds = adminAndSupportUsers.map(u => u._id);
        const userMap = new Map<string, any>(adminAndSupportUsers.map(u => [u._id.toString(), u]));

        const recentAudits = await AuditModel.find({ actor: { $in: adminIds } })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean()
            .exec();

        // Transform everything to RecentActivity
        let activities: RecentActivity[] = [];

        recentTravelers.forEach((t: any) => {
            if (t.user) {
                activities.push({
                    id: `login_${t._id.toString()}`,
                    type: 'signup' as RecentActivityType,
                    title: 'Traveler Sign In',
                    description: `${t.name} logged into the system`,
                    timestamp: new Date(t.lastLogin || t.createdAt).toISOString(),
                    severity: 'low' as Severity,
                    user: t.name || t.user.email
                });
            }
        });

        recentBookings.forEach((b: any) => {
            if (b.traveler && b.traveler.user) {
                activities.push({
                    id: `booking_${b._id.toString()}`,
                    type: 'booking' as RecentActivityType,
                    title: `New Booking: ${b.bookingReference}`,
                    description: `Booked tour ${b.uniqueTourCode} for ${b.totalParticipants} participants`,
                    timestamp: new Date(b.bookedAt || b.createdAt).toISOString(),
                    severity: 'medium' as Severity,
                    user: b.traveler.name || b.traveler.user.email
                });
            }
        });

        recentReports.forEach((r: any) => {
            if (r.reporter && r.reporter.user) {
                activities.push({
                    id: `report_${r._id.toString()}`,
                    type: 'report' as RecentActivityType,
                    title: `Tour Report Filed`,
                    description: r.message ? (r.message.length > 50 ? r.message.substring(0, 50) + '...' : r.message) : 'A report was filed',
                    timestamp: new Date(r.createdAt).toISOString(),
                    severity: r.priority === 'high' || r.priority === 'urgent' ? 'high' : 'medium' as Severity,
                    user: r.reporter.name || r.reporter.user.email
                });
            }
        });

        recentTours.forEach((t: any) => {
            if (t.authorId) {
                activities.push({
                    id: `tour_${t._id.toString()}`,
                    type: 'tour' as RecentActivityType,
                    title: `New Tour Created`,
                    description: t.title || t.uniqueTourCode,
                    timestamp: new Date(t.createdAt).toISOString(),
                    severity: 'low' as Severity,
                    user: t.authorId.name || t.authorId.email || 'Author'
                });
            }
        });

        recentAudits.forEach((a: any) => {
            const user: any = userMap.get(a.actor?.toString());
            if (user) {
                activities.push({
                    id: `audit_${a._id.toString()}`,
                    type: 'user_action' as RecentActivityType,
                    title: `Admin/Support Action`,
                    description: `${a.action} on ${a.targetModel}`,
                    timestamp: new Date(a.createdAt).toISOString(),
                    severity: 'low' as Severity,
                    user: user.name || user.email || 'Admin'
                });
            }
        });

        // Sort all aggregated activities by date descending
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        // Apply pagination
        const total = activities.length;
        const pages = Math.ceil(total / limit);
        const skip = (page - 1) * limit;
        const paginatedItems = activities.slice(skip, skip + limit);

        return NextResponse.json({
            data: {
                items: paginatedItems,
                pagination: {
                    page,
                    limit,
                    total,
                    pages,
                },
            }
        });

    } catch (error) {
        console.error('Failed to fetch recent activities:', error);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}