// src/types/dashboard.types.ts
// Production-ready types for dashboard domain

import { BookingStatus } from "@/constants/tour-booking.const";


export interface DashboardStats {
  totalUsers: number;
  totalOrganizers: number;
  totalSupportAgents: number;
  activeTours: number;
  upcomingTours: number;
  totalBookings: number;
  pendingReports: number;
  suspendedUsers: number;
  totalRevenue?: number;
  topDestinationTrends?: string[];
  // metadata
  lastUpdated?: string; // ISO date on server
}

export type RecentActivityType = 'signup' | 'booking' | 'report' | 'tour' | 'user_action';
export type Severity = 'low' | 'medium' | 'high';

export interface RecentActivity {
  id: string;
  type: RecentActivityType;
  title: string;
  description: string;
  timestamp: string; // ISO
  user?: string;
  severity?: Severity;
}

export type PendingActionType =
  | 'report'
  | 'complaint'
  | 'flagged_content'
  | 'organizer_approval'
  | 'tour_approval';

export type PendingActionPriority = 'low' | 'medium' | 'high' | 'urgent';
export type PendingActionStatus = 'pending' | 'in_progress' | 'resolved';

export interface PendingAction {
  id: string;
  type: PendingActionType;
  title: string;
  description: string;
  priority: PendingActionPriority;
  createdAt: string;
  assignedTo?: string;
  status: PendingActionStatus;
  metadata?: Record<string, unknown>;
}

export interface Booking {
  id: string;
  user: { id: string; name: string; email: string };
  tour: { id: string; title: string; destination: string };
  bookingDate: string;
  status: BookingStatus;
  amount: number;
}

export interface RoleDistribution {
  travelers: number;
  organizers: number;
  support: number;
  banned: number;
  lastUpdated?: string;
}

export interface AdminNotification {
  id: string;
  type: 'report' | 'ticket' | 'flagged_user' | 'system_alert' | 'revenue_issue' | 'approval_pending';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  isRead: boolean;
  actionRequired: boolean;
  meta?: Record<string, unknown>;
}

export interface AnalyticsPoint<T = number> {
  date: string;
  value: T;
  meta?: Record<string, unknown>;
}

export interface AnalyticsData {
  bookingsOverTime: Array<{ date: string; count: number; revenue?: number }>;
  travelersOverTime: Array<{ date: string; count: number }>;
  guidesOverTime: Array<{ date: string; count: number }>;
  revenueOverTime: Array<{ date: string; amount: number }>;
  reportsOverTime: Array<{ date: string; count: number }>;
  generatedAt?: string;
}


export type TrendingType = 'destination' | 'category' | 'tour_type';
export type TrendDirection = 'up' | 'down' | 'stable';

export interface DashboardFilters {
  dateRange: { start: string; end: string };
  page?: number;
  limit?: number;
}

export interface DateRangeFilter {
  start: string; // ISO date (YYYY-MM-DD)
  end: string;
}

export interface PaginationFilter {
  page: number;
  limit: number;
}

// Optional preset for quick date selection
export type DatePreset = 'today' | 'week' | 'month' | 'custom';