// src/types/dashboard.types.ts
// Production-ready types for dashboard domain


export type UserRole = 'admin' | 'support';

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
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  amount: number;
}

export interface RoleDistribution {
  travelers: number;
  organizers: number;
  support: number;
  banned: number;
  lastUpdated?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'urgent';
  createdAt: string;
  createdBy: string;
  isActive: boolean;
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

export type ServerHealthLevel = 'healthy' | 'warning' | 'critical';
export type LogLevel = 'error' | 'warning' | 'info';

export interface SystemHealth {
  serverStatus: ServerHealthLevel;
  databaseConnections: number;
  activeCronJobs: number;
  lastBackup: string;
  errorLogs: Array<{ id: string; level: LogLevel; message: string; timestamp: string }>;
  checkedAt?: string;
}

export type TrendingType = 'destination' | 'category' | 'tour_type';
export type TrendDirection = 'up' | 'down' | 'stable';

export interface TrendingInsight {
  id: string;
  type: TrendingType;
  title: string;
  description: string;
  trend: TrendDirection;
  percentage: number;
  confidence: number; // 0..1
  generatedAt?: string;
}

export interface DashboardFilters {
  dateRange: { start: string; end: string };
  userRole?: string;
  bookingStatus?: string;
  reportStatus?: string;
  searchQuery?: string;
  page?: number;
  limit?: number;
}

// Generic API envelope for consistent responses
export interface ApiEnvelope<T> {
  data: T | null;
  error?: string | null;
  meta?: Record<string, unknown>;
}
