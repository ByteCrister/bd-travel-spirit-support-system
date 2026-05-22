// import { NextRequest, NextResponse } from "next/server";
// import { faker } from "@faker-js/faker";
// import {
//     DashboardData,
//     DashboardStats,
//     RecentActivity,
//     PendingAction,
//     Booking,
//     RoleDistribution,
//     AdminNotification,
//     AnalyticsData,
//     TrendingInsight,
// } from "@/types/dashboard/dashboard.types";

// export async function GET(request: NextRequest) {
//     // Extract query params (e.g., isAdmin, dateRange, page, limit)
//     const searchParams = request.nextUrl.searchParams;
//     const isAdmin = searchParams.get("isAdmin") === "true";
//     const page = parseInt(searchParams.get("page") || "1");
//     const limit = parseInt(searchParams.get("limit") || "10");
//     const startDate = searchParams.get("start") || faker.date.recent({ days: 30 }).toISOString().split("T")[0];
//     const endDate = searchParams.get("end") || new Date().toISOString().split("T")[0];

//     // Helper to generate a random ISO date within range
//     const randomDate = (start: string, end: string) =>
//         faker.date.between({ from: new Date(start), to: new Date(end) }).toISOString();

//     // Generate stats
//     const stats: DashboardStats = {
//         totalUsers: faker.number.int({ min: 5000, max: 15000 }),
//         totalOrganizers: faker.number.int({ min: 100, max: 500 }),
//         totalSupportAgents: faker.number.int({ min: 10, max: 50 }),
//         activeTours: faker.number.int({ min: 50, max: 200 }),
//         upcomingTours: faker.number.int({ min: 30, max: 150 }),
//         totalBookings: faker.number.int({ min: 2000, max: 8000 }),
//         pendingReports: faker.number.int({ min: 5, max: 50 }),
//         suspendedUsers: faker.number.int({ min: 10, max: 100 }),
//         totalRevenue: isAdmin ? faker.number.int({ min: 50000, max: 200000 }) : undefined,
//         topDestinationTrends: isAdmin
//             ? Array.from({ length: 3 }, () => faker.location.city())
//             : undefined,
//         lastUpdated: new Date().toISOString(),
//     };

//     // Generate recent activity
//     const recentActivity: RecentActivity[] = Array.from({ length: limit }, (_, i) => ({
//         id: faker.string.uuid(),
//         type: faker.helpers.arrayElement(["signup", "booking", "report", "tour", "user_action"]),
//         title: faker.lorem.sentence({ min: 3, max: 6 }),
//         description: faker.lorem.sentence(),
//         timestamp: randomDate(startDate, endDate),
//         user: faker.internet.email(),
//         severity: faker.helpers.arrayElement(["low", "medium", "high"]),
//     })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

//     // Generate pending actions
//     const pendingActions: PendingAction[] = Array.from({ length: 5 }, () => ({
//         id: faker.string.uuid(),
//         type: faker.helpers.arrayElement([
//             "report",
//             "complaint",
//             "flagged_content",
//             "organizer_approval",
//             "tour_approval",
//         ]),
//         title: faker.lorem.sentence({ min: 3, max: 5 }),
//         description: faker.lorem.sentence(),
//         priority: faker.helpers.arrayElement(["low", "medium", "high", "urgent"]),
//         createdAt: randomDate(startDate, endDate),
//         assignedTo: faker.helpers.maybe(() => faker.internet.email(), { probability: 0.5 }),
//         status: faker.helpers.arrayElement(["pending", "in_progress", "resolved"]),
//         metadata: { reason: faker.lorem.word() },
//     }));

//     // Generate recent bookings
//     const recentBookings: Booking[] = Array.from({ length: limit }, () => ({
//         id: faker.string.uuid(),
//         user: {
//             id: faker.string.uuid(),
//             name: faker.person.fullName(),
//             email: faker.internet.email(),
//         },
//         tour: {
//             id: faker.string.uuid(),
//             title: faker.lorem.words(3),
//             destination: faker.location.city(),
//         },
//         bookingDate: randomDate(startDate, endDate),
//         status: faker.helpers.arrayElement(["confirmed", "pending", "cancelled", "completed"]),
//         amount: faker.number.int({ min: 50, max: 1000 }),
//     })).sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());

//     // Generate role distribution
//     const roleDistribution: RoleDistribution = {
//         travelers: faker.number.int({ min: 4000, max: 12000 }),
//         organizers: faker.number.int({ min: 100, max: 500 }),
//         support: faker.number.int({ min: 10, max: 50 }),
//         banned: faker.number.int({ min: 5, max: 200 }),
//         lastUpdated: new Date().toISOString(),
//     };

//     // Generate admin notifications
//     const adminNotifications: AdminNotification[] = Array.from({ length: 5 }, () => ({
//         id: faker.string.uuid(),
//         type: faker.helpers.arrayElement([
//             "report",
//             "ticket",
//             "flagged_user",
//             "system_alert",
//             "revenue_issue",
//             "approval_pending",
//         ]),
//         title: faker.lorem.sentence({ min: 2, max: 4 }),
//         message: faker.lorem.sentence(),
//         severity: faker.helpers.arrayElement(["low", "medium", "high", "critical"]),
//         createdAt: randomDate(startDate, endDate),
//         isRead: faker.datatype.boolean(0.3),
//         actionRequired: faker.datatype.boolean(0.4),
//         meta: { relatedId: faker.string.uuid() },
//     }));

//     // Generate analytics data (time series)
//     const generateTimeSeries = (days: number, min: number, max: number) =>
//         Array.from({ length: days }, (_, i) => ({
//             date: faker.date.recent({ days }).toISOString().split("T")[0],
//             count: faker.number.int({ min, max }),
//         }));

//     const analytics: AnalyticsData = {
//         bookingsOverTime: generateTimeSeries(14, 10, 50).map((item) => ({
//             ...item,
//             revenue: faker.number.int({ min: 500, max: 5000 }),
//         })),
//         travelersOverTime: generateTimeSeries(14, 100, 500),
//         guidesOverTime: generateTimeSeries(14, 20, 80),
//         revenueOverTime: generateTimeSeries(14, 1000, 10000).map((item) => ({
//             date: item.date,
//             amount: item.count,
//         })),
//         reportsOverTime: generateTimeSeries(14, 1, 10),
//         generatedAt: new Date().toISOString(),
//     };

//     // Generate trending insights (admin-only)
//     const trendingInsights: TrendingInsight[] = isAdmin
//         ? Array.from({ length: 3 }, () => ({
//             id: faker.string.uuid(),
//             type: faker.helpers.arrayElement(["destination", "category", "tour_type"]),
//             title: faker.lorem.words(2),
//             description: faker.lorem.sentence(),
//             trend: faker.helpers.arrayElement(["up", "down", "stable"]),
//             percentage: faker.number.int({ min: -20, max: 50 }),
//             confidence: faker.number.float({ min: 0.6, max: 0.99, fractionDigits: 2 }),
//             generatedAt: new Date().toISOString(),
//         }))
//         : [];

//     const dashboardData: DashboardData = {
//         stats,
//         recentActivity,
//         pendingActions,
//         recentBookings,
//         roleDistribution,
//         adminNotifications,
//         analytics,
//         trendingInsights,
//     };

//     return NextResponse.json({
//         success: true,
//         data: dashboardData,
//         message: "Dashboard data fetched successfully",
//     });
// }