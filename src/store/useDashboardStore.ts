import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ===== TYPES & INTERFACES =====

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
  totalRevenue?: number; // Admin only
  topDestinationTrends?: string[]; // Admin only
}

export interface RecentActivity {
  id: string;
  type: 'signup' | 'booking' | 'report' | 'tour' | 'user_action';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  severity?: 'low' | 'medium' | 'high';
}

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

export interface Booking {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  tour: {
    id: string;
    title: string;
    destination: string;
  };
  bookingDate: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  amount: number;
}

export interface RoleDistribution {
  travelers: number;
  organizers: number;
  support: number;
  banned: number;
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
}

export interface AnalyticsData {
  bookingsOverTime: Array<{ date: string; count: number; revenue?: number }>;
  newUsersOverTime: Array<{ date: string; count: number }>;
  revenueOverTime: Array<{ date: string; amount: number }>;
  reportsOverTime: Array<{ date: string; count: number }>;
}

export interface SystemHealth {
  serverStatus: 'healthy' | 'warning' | 'critical';
  databaseConnections: number;
  activeCronJobs: number;
  lastBackup: string;
  errorLogs: Array<{
    id: string;
    level: 'error' | 'warning' | 'info';
    message: string;
    timestamp: string;
  }>;
}

export interface TrendingInsight {
  id: string;
  type: 'destination' | 'category' | 'tour_type';
  title: string;
  description: string;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  confidence: number;
}

export interface DashboardFilters {
  dateRange: {
    start: string;
    end: string;
  };
  userRole?: string;
  bookingStatus?: string;
  reportStatus?: string;
  searchQuery?: string;
}

// ===== STORE STATE =====

interface DashboardState {
  // User context
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  } | null;

  // Loading states
  loading: {
    stats: boolean;
    recentActivity: boolean;
    pendingActions: boolean;
    recentBookings: boolean;
    roleDistribution: boolean;
    announcements: boolean;
    adminNotifications: boolean;
    analytics: boolean;
    systemHealth: boolean;
    trendingInsights: boolean;
  };

  // Error states
  errors: {
    stats: string | null;
    recentActivity: string | null;
    pendingActions: string | null;
    recentBookings: string | null;
    roleDistribution: string | null;
    announcements: string | null;
    adminNotifications: string | null;
    analytics: string | null;
    systemHealth: string | null;
    trendingInsights: string | null;
  };

  // Data slices
  stats: DashboardStats | null;
  recentActivity: RecentActivity[];
  pendingActions: PendingAction[];
  recentBookings: Booking[];
  roleDistribution: RoleDistribution | null;
  announcements: Announcement[];
  adminNotifications: AdminNotification[];
  analytics: AnalyticsData | null;
  systemHealth: SystemHealth | null;
  trendingInsights: TrendingInsight[];
  filters: DashboardFilters;

  // Actions
  setCurrentUser: (user: DashboardState['currentUser']) => void;
  setLoading: (key: keyof DashboardState['loading'], value: boolean) => void;
  setError: (key: keyof DashboardState['errors'], error: string | null) => void;
  setStats: (stats: DashboardStats) => void;
  setRecentActivity: (activity: RecentActivity[]) => void;
  setPendingActions: (actions: PendingAction[]) => void;
  setRecentBookings: (bookings: Booking[]) => void;
  setRoleDistribution: (distribution: RoleDistribution) => void;
  setAnnouncements: (announcements: Announcement[]) => void;
  setAdminNotifications: (notifications: AdminNotification[]) => void;
  setAnalytics: (analytics: AnalyticsData) => void;
  setSystemHealth: (health: SystemHealth) => void;
  setTrendingInsights: (insights: TrendingInsight[]) => void;
  updateFilters: (filters: Partial<DashboardFilters>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markActionAsResolved: (actionId: string) => void;

  // Async actions (with commented API calls)
  fetchStats: () => Promise<void>;
  fetchRecentActivity: () => Promise<void>;
  fetchPendingActions: () => Promise<void>;
  fetchRecentBookings: () => Promise<void>;
  fetchRoleDistribution: () => Promise<void>;
  fetchAnnouncements: () => Promise<void>;
  fetchAdminNotifications: () => Promise<void>;
  fetchAnalytics: (filters?: Partial<DashboardFilters>) => Promise<void>;
  fetchSystemHealth: () => Promise<void>;
  fetchTrendingInsights: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

// ===== INITIAL STATE =====

const initialState = {
  currentUser: null,
  loading: {
    stats: false,
    recentActivity: false,
    pendingActions: false,
    recentBookings: false,
    roleDistribution: false,
    announcements: false,
    adminNotifications: false,
    analytics: false,
    systemHealth: false,
    trendingInsights: false,
  },
  errors: {
    stats: null,
    recentActivity: null,
    pendingActions: null,
    recentBookings: null,
    roleDistribution: null,
    announcements: null,
    adminNotifications: null,
    analytics: null,
    systemHealth: null,
    trendingInsights: null,
  },
  stats: null,
  recentActivity: [],
  pendingActions: [],
  recentBookings: [],
  roleDistribution: null,
  announcements: [],
  adminNotifications: [],
  analytics: null,
  systemHealth: null,
  trendingInsights: [],
  filters: {
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
  },
};

// ===== STORE IMPLEMENTATION =====

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // ===== SYNC ACTIONS =====
      setCurrentUser: (user) => set({ currentUser: user }),
      
      setLoading: (key, value) =>
        set((state) => ({
          loading: { ...state.loading, [key]: value },
        })),
      
      setError: (key, error) =>
        set((state) => ({
          errors: { ...state.errors, [key]: error },
        })),
      
      setStats: (stats) => set({ stats }),
      setRecentActivity: (recentActivity) => set({ recentActivity }),
      setPendingActions: (pendingActions) => set({ pendingActions }),
      setRecentBookings: (recentBookings) => set({ recentBookings }),
      setRoleDistribution: (roleDistribution) => set({ roleDistribution }),
      setAnnouncements: (announcements) => set({ announcements }),
      setAdminNotifications: (adminNotifications) => set({ adminNotifications }),
      setAnalytics: (analytics) => set({ analytics }),
      setSystemHealth: (systemHealth) => set({ systemHealth }),
      setTrendingInsights: (trendingInsights) => set({ trendingInsights }),
      
      updateFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      
      markNotificationAsRead: (notificationId) =>
        set((state) => ({
          adminNotifications: state.adminNotifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          ),
        })),
      
      markActionAsResolved: (actionId) =>
        set((state) => ({
          pendingActions: state.pendingActions.map((action) =>
            action.id === actionId
              ? { ...action, status: 'resolved' as const }
              : action
          ),
        })),

      // ===== ASYNC ACTIONS =====
      fetchStats: async () => {
        set({ loading: { ...get().loading, stats: true }, errors: { ...get().errors, stats: null } });
        try {
          // const res = await fetch('/api/dashboard/stats');
          // const data = await res.json();
          // set({ stats: data });
          
          // Mock data for development
          const mockStats: DashboardStats = {
            totalUsers: 1247,
            totalOrganizers: 89,
            totalSupportAgents: 12,
            activeTours: 156,
            upcomingTours: 23,
            totalBookings: 3421,
            pendingReports: 7,
            suspendedUsers: 3,
            totalRevenue: 125430,
            topDestinationTrends: ['Bali', 'Thailand', 'Japan', 'Italy', 'Spain'],
          };
          set({ stats: mockStats });
        } catch (error) {
          set({ errors: { ...get().errors, stats: 'Failed to fetch stats' } });
        } finally {
          set({ loading: { ...get().loading, stats: false } });
        }
      },

      fetchRecentActivity: async () => {
        set({ loading: { ...get().loading, recentActivity: true }, errors: { ...get().errors, recentActivity: null } });
        try {
          // const res = await fetch('/api/dashboard/recent-activity');
          // const data = await res.json();
          // set({ recentActivity: data });
          
          // Mock data
          const mockActivity: RecentActivity[] = [
            {
              id: '1',
              type: 'booking',
              title: 'New Booking',
              description: 'John Doe booked "Bali Adventure Tour"',
              timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
              user: 'John Doe',
              severity: 'low',
            },
            {
              id: '2',
              type: 'report',
              title: 'Report Filed',
              description: 'User reported inappropriate content in tour description',
              timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
              severity: 'medium',
            },
            {
              id: '3',
              type: 'signup',
              title: 'New User Registration',
              description: 'Sarah Wilson joined as a tour organizer',
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              user: 'Sarah Wilson',
              severity: 'low',
            },
          ];
          set({ recentActivity: mockActivity });
        } catch (error) {
          set({ errors: { ...get().errors, recentActivity: 'Failed to fetch recent activity' } });
        } finally {
          set({ loading: { ...get().loading, recentActivity: false } });
        }
      },

      fetchPendingActions: async () => {
        set({ loading: { ...get().loading, pendingActions: true }, errors: { ...get().errors, pendingActions: null } });
        try {
          // const res = await fetch('/api/dashboard/pending-actions');
          // const data = await res.json();
          // set({ pendingActions: data });
          
          // Mock data
          const mockActions: PendingAction[] = [
            {
              id: '1',
              type: 'report',
              title: 'Inappropriate Content Report',
              description: 'User reported offensive language in tour description',
              priority: 'high',
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              status: 'pending',
            },
            {
              id: '2',
              type: 'organizer_approval',
              title: 'New Organizer Application',
              description: 'Mike Johnson applied to become a tour organizer',
              priority: 'medium',
              createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
              status: 'pending',
            },
          ];
          set({ pendingActions: mockActions });
        } catch (error) {
          set({ errors: { ...get().errors, pendingActions: 'Failed to fetch pending actions' } });
        } finally {
          set({ loading: { ...get().loading, pendingActions: false } });
        }
      },

      fetchRecentBookings: async () => {
        set({ loading: { ...get().loading, recentBookings: true }, errors: { ...get().errors, recentBookings: null } });
        try {
          // const res = await fetch('/api/dashboard/recent-bookings');
          // const data = await res.json();
          // set({ recentBookings: data });
          
          // Mock data
          const mockBookings: Booking[] = [
            {
              id: '1',
              user: { id: '1', name: 'John Doe', email: 'john@example.com' },
              tour: { id: '1', title: 'Bali Adventure Tour', destination: 'Bali, Indonesia' },
              bookingDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
              status: 'confirmed',
              amount: 1200,
            },
            {
              id: '2',
              user: { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
              tour: { id: '2', title: 'Thailand Cultural Experience', destination: 'Bangkok, Thailand' },
              bookingDate: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
              status: 'pending',
              amount: 950,
            },
          ];
          set({ recentBookings: mockBookings });
        } catch (error) {
          set({ errors: { ...get().errors, recentBookings: 'Failed to fetch recent bookings' } });
        } finally {
          set({ loading: { ...get().loading, recentBookings: false } });
        }
      },

      fetchRoleDistribution: async () => {
        set({ loading: { ...get().loading, roleDistribution: true }, errors: { ...get().errors, roleDistribution: null } });
        try {
          // const res = await fetch('/api/dashboard/role-distribution');
          // const data = await res.json();
          // set({ roleDistribution: data });
          
          // Mock data
          const mockDistribution: RoleDistribution = {
            travelers: 1150,
            organizers: 89,
            support: 12,
            banned: 3,
          };
          set({ roleDistribution: mockDistribution });
        } catch (error) {
          set({ errors: { ...get().errors, roleDistribution: 'Failed to fetch role distribution' } });
        } finally {
          set({ loading: { ...get().loading, roleDistribution: false } });
        }
      },

      fetchAnnouncements: async () => {
        set({ loading: { ...get().loading, announcements: true }, errors: { ...get().errors, announcements: null } });
        try {
          // const res = await fetch('/api/dashboard/announcements');
          // const data = await res.json();
          // set({ announcements: data });
          
          // Mock data
          const mockAnnouncements: Announcement[] = [
            {
              id: '1',
              title: 'System Maintenance Scheduled',
              content: 'We will be performing system maintenance on Sunday from 2-4 AM EST.',
              type: 'info',
              createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              createdBy: 'System Admin',
              isActive: true,
            },
            {
              id: '2',
              title: 'New Feature Release',
              content: 'Enhanced booking system with real-time availability updates is now live!',
              type: 'info',
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              createdBy: 'Product Team',
              isActive: true,
            },
          ];
          set({ announcements: mockAnnouncements });
        } catch (error) {
          set({ errors: { ...get().errors, announcements: 'Failed to fetch announcements' } });
        } finally {
          set({ loading: { ...get().loading, announcements: false } });
        }
      },

      fetchAdminNotifications: async () => {
        set({ loading: { ...get().loading, adminNotifications: true }, errors: { ...get().errors, adminNotifications: null } });
        try {
          // const res = await fetch('/api/dashboard/admin-notifications');
          // const data = await res.json();
          // set({ adminNotifications: data });
          
          // Mock data
          const mockNotifications: AdminNotification[] = [
            {
              id: '1',
              type: 'report',
              title: 'Content Report',
              message: 'New inappropriate content report requires review',
              severity: 'high',
              createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              isRead: false,
              actionRequired: true,
            },
            {
              id: '2',
              type: 'system_alert',
              title: 'High Server Load',
              message: 'Server CPU usage is above 80%',
              severity: 'medium',
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              isRead: true,
              actionRequired: false,
            },
          ];
          set({ adminNotifications: mockNotifications });
        } catch (error) {
          set({ errors: { ...get().errors, adminNotifications: 'Failed to fetch admin notifications' } });
        } finally {
          set({ loading: { ...get().loading, adminNotifications: false } });
        }
      },

      fetchAnalytics: async (filters) => {
        set({ loading: { ...get().loading, analytics: true }, errors: { ...get().errors, analytics: null } });
        try {
          // const res = await fetch('/api/dashboard/analytics', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify(filters || get().filters),
          // });
          // const data = await res.json();
          // set({ analytics: data });
          
          // Mock data
          const mockAnalytics: AnalyticsData = {
            bookingsOverTime: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              count: Math.floor(Math.random() * 50) + 10,
              revenue: Math.floor(Math.random() * 10000) + 5000,
            })),
            newUsersOverTime: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              count: Math.floor(Math.random() * 20) + 5,
            })),
            revenueOverTime: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              amount: Math.floor(Math.random() * 15000) + 8000,
            })),
            reportsOverTime: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              count: Math.floor(Math.random() * 10) + 1,
            })),
          };
          set({ analytics: mockAnalytics });
        } catch (error) {
          set({ errors: { ...get().errors, analytics: 'Failed to fetch analytics' } });
        } finally {
          set({ loading: { ...get().loading, analytics: false } });
        }
      },

      fetchSystemHealth: async () => {
        set({ loading: { ...get().loading, systemHealth: true }, errors: { ...get().errors, systemHealth: null } });
        try {
          // const res = await fetch('/api/dashboard/system-health');
          // const data = await res.json();
          // set({ systemHealth: data });
          
          // Mock data
          const mockSystemHealth: SystemHealth = {
            serverStatus: 'healthy',
            databaseConnections: 45,
            activeCronJobs: 8,
            lastBackup: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            errorLogs: [
              {
                id: '1',
                level: 'warning',
                message: 'High memory usage detected',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              },
              {
                id: '2',
                level: 'info',
                message: 'Scheduled backup completed successfully',
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
              },
            ],
          };
          set({ systemHealth: mockSystemHealth });
        } catch (error) {
          set({ errors: { ...get().errors, systemHealth: 'Failed to fetch system health' } });
        } finally {
          set({ loading: { ...get().loading, systemHealth: false } });
        }
      },

      fetchTrendingInsights: async () => {
        set({ loading: { ...get().loading, trendingInsights: true }, errors: { ...get().errors, trendingInsights: null } });
        try {
          // const res = await fetch('/api/dashboard/trending-insights');
          // const data = await res.json();
          // set({ trendingInsights: data });
          
          // Mock data
          const mockInsights: TrendingInsight[] = [
            {
              id: '1',
              type: 'destination',
              title: 'Bali Tourism Surge',
              description: 'Bali bookings increased by 45% this month',
              trend: 'up',
              percentage: 45,
              confidence: 0.92,
            },
            {
              id: '2',
              type: 'category',
              title: 'Adventure Tours Decline',
              description: 'Adventure tour bookings decreased by 12%',
              trend: 'down',
              percentage: 12,
              confidence: 0.78,
            },
          ];
          set({ trendingInsights: mockInsights });
        } catch (error) {
          set({ errors: { ...get().errors, trendingInsights: 'Failed to fetch trending insights' } });
        } finally {
          set({ loading: { ...get().loading, trendingInsights: false } });
        }
      },

      refreshAll: async () => {
        const { fetchStats, fetchRecentActivity, fetchPendingActions, fetchRecentBookings, fetchAnnouncements, fetchAdminNotifications } = get();
        const { currentUser } = get();
        
        await Promise.all([
          fetchStats(),
          fetchRecentActivity(),
          fetchPendingActions(),
          fetchRecentBookings(),
          fetchAnnouncements(),
          fetchAdminNotifications(),
        ]);

        // Admin-only data
        if (currentUser?.role === 'admin') {
          const { fetchRoleDistribution, fetchAnalytics, fetchSystemHealth, fetchTrendingInsights } = get();
          await Promise.all([
            fetchRoleDistribution(),
            fetchAnalytics(),
            fetchSystemHealth(),
            fetchTrendingInsights(),
          ]);
        }
      },
    }),
    {
      name: 'dashboard-store',
    }
  )
);
