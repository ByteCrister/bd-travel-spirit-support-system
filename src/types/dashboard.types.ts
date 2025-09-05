// Central dashboard types for state, data models, and analytics

export type UserRole = 'admin' | 'support';

// Aggregate KPIs shown in stats cards
export interface DashboardStats {
  totalUsers: number;
  totalOrganizers: number;
  totalSupportAgents: number;
  activeTours: number;
  upcomingTours: number;
  totalBookings: number;
  pendingReports: number;
  suspendedUsers: number;
  totalRevenue?: number; // Admin only
  topDestinationTrends?: string[]; // Admin only
}

// Activity feed entries
export interface RecentActivity {
  id: string;
  type: 'signup' | 'booking' | 'report' | 'tour' | 'user_action';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  severity?: 'low' | 'medium' | 'high';
}

// Items requiring attention on the right column
export interface PendingAction {
  id: string;
  type: 'report' | 'complaint' | 'flagged_content' | 'organizer_approval' | 'tour_approval';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'resolved';
}

// Recent bookings list
export interface Booking {
  id: string;
  user: { id: string; name: string; email: string };
  tour: { id: string; title: string; destination: string };
  bookingDate: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  amount: number;
}

// Distribution of user roles for chart
export interface RoleDistribution {
  travelers: number;
  organizers: number;
  support: number;
  banned: number;
}

// Internal announcements
export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'urgent';
  createdAt: string;
  createdBy: string;
  isActive: boolean;
}

// Admin/support notifications
export interface AdminNotification {
  id: string;
  type: 'report' | 'ticket' | 'flagged_user' | 'system_alert' | 'revenue_issue' | 'approval_pending';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  isRead: boolean;
  actionRequired: boolean;
}

// Time-series analytics for charts
export interface AnalyticsData {
  bookingsOverTime: Array<{ date: string; count: number; revenue?: number }>;
  travelersOverTime: Array<{ date: string; count: number }>;
  guidesOverTime: Array<{ date: string; count: number }>;
  revenueOverTime: Array<{ date: string; amount: number }>;
  reportsOverTime: Array<{ date: string; count: number }>;
}

// System health snapshot
export interface SystemHealth {
  serverStatus: 'healthy' | 'warning' | 'critical';
  databaseConnections: number;
  activeCronJobs: number;
  lastBackup: string;
  errorLogs: Array<{ id: string; level: 'error' | 'warning' | 'info'; message: string; timestamp: string }>;
}

// Trends and insights for admins
export interface TrendingInsight {
  id: string;
  type: 'destination' | 'category' | 'tour_type';
  title: string;
  description: string;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  confidence: number; // 0..1
}

// Query filters for analytics and lists
export interface DashboardFilters {
  dateRange: { start: string; end: string };
  userRole?: string;
  bookingStatus?: string;
  reportStatus?: string;
  searchQuery?: string;
}


