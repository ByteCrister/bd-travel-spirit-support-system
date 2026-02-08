'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import {
  UserRole,
  DashboardStats,
  RecentActivity,
  PendingAction,
  Booking,
  RoleDistribution,
  Announcement,
  AdminNotification,
  AnalyticsData,
  SystemHealth,
  TrendingInsight,
  DashboardFilters,
  ApiEnvelope,
} from '@/types/dashboard/dashboard.types';

import api from '@/utils/axios';
import { extractErrorMessage } from '@/utils/axios/extract-error-message';

const URL_AFTER_API = '/mock/dashboard';

// TTL for client cache in ms
const DEFAULT_TTL = Number(process.env.NEXT_PUBLIC_CACHE_TTL) || 30 * 1000; // 30s fallback

type LoadingKey =
  | 'stats'
  | 'recentActivity'
  | 'pendingActions'
  | 'recentBookings'
  | 'roleDistribution'
  | 'announcements'
  | 'adminNotifications'
  | 'analytics'
  | 'systemHealth'
  | 'trendingInsights';

type ErrorKey = LoadingKey;

interface CacheEntry<T> {
  data: T | null;
  lastFetched: number | null;
  ttl: number;
}

interface DashboardState {
  // context
  currentUser: { id: string; name: string; email: string; role: UserRole } | null;

  // per-slice loading / errors
  loading: Record<LoadingKey, boolean>;
  errors: Record<ErrorKey, string | null>;

  // data slices
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

  // internal caches and in-flight maps (not persisted)
  _cache: {
    stats: CacheEntry<DashboardStats>;
    recentActivity: CacheEntry<RecentActivity[]>;
    pendingActions: CacheEntry<PendingAction[]>;
    recentBookings: CacheEntry<Booking[]>;
    roleDistribution: CacheEntry<RoleDistribution>;
    announcements: CacheEntry<Announcement[]>;
    adminNotifications: CacheEntry<AdminNotification[]>;
    analytics: CacheEntry<AnalyticsData>;
    systemHealth: CacheEntry<SystemHealth>;
    trendingInsights: CacheEntry<TrendingInsight[]>;
  };

  _inFlight: Partial<Record<string, Promise<unknown>>>;

  // sync actions
  setCurrentUser: (user: DashboardState['currentUser']) => void;
  setLoading: (key: LoadingKey, value: boolean) => void;
  setError: (key: ErrorKey, error: string | null) => void;
  updateFilters: (patch: Partial<DashboardFilters>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markActionAsResolved: (actionId: string) => void;

  // cache helpers
  invalidateCache: (key?: keyof DashboardState['_cache']) => void;

  // async fetchers (they handle caching/dedupe)
  fetchStats: (opts?: { force?: boolean }) => Promise<void>;
  fetchRecentActivity: (opts?: { force?: boolean; page?: number; limit?: number }) => Promise<void>;
  fetchPendingActions: (opts?: { force?: boolean }) => Promise<void>;
  fetchRecentBookings: (opts?: { force?: boolean; page?: number; limit?: number }) => Promise<void>;
  fetchRoleDistribution: (opts?: { force?: boolean }) => Promise<void>;
  fetchAnnouncements: (opts?: { force?: boolean }) => Promise<void>;
  fetchAdminNotifications: (opts?: { force?: boolean }) => Promise<void>;
  fetchAnalytics: (opts?: { force?: boolean; filters?: Partial<DashboardFilters> }) => Promise<void>;
  fetchSystemHealth: (opts?: { force?: boolean }) => Promise<void>;
  fetchTrendingInsights: (opts?: { force?: boolean }) => Promise<void>;

  // orchestrator
  refreshAll: () => Promise<void>;
}

const now = () => Date.now();

const makeCacheEntry = <T>(data: T | null, ttl = DEFAULT_TTL): CacheEntry<T> => ({
  data,
  lastFetched: data ? now() : null,
  ttl,
});

export const useDashboardStore = create<DashboardState>()(
  devtools((set, get) => ({
    // initial state
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
      page: 1,
      limit: 10,
    },
    _cache: {
      stats: makeCacheEntry<DashboardStats>(null),
      recentActivity: makeCacheEntry<RecentActivity[] | null>(null),
      pendingActions: makeCacheEntry<PendingAction[] | null>(null),
      recentBookings: makeCacheEntry<Booking[] | null>(null),
      roleDistribution: makeCacheEntry<RoleDistribution | null>(null),
      announcements: makeCacheEntry<Announcement[] | null>(null),
      adminNotifications: makeCacheEntry<AdminNotification[] | null>(null),
      analytics: makeCacheEntry<AnalyticsData | null>(null),
      systemHealth: makeCacheEntry<SystemHealth | null>(null),
      trendingInsights: makeCacheEntry<TrendingInsight[] | null>(null),
    },
    _inFlight: {},

    // sync actions
    setCurrentUser: (user) => set({ currentUser: user }),
    setLoading: (key, value) =>
      set((s) => ({ loading: { ...s.loading, [key]: value } })),
    setError: (key, error) =>
      set((s) => ({ errors: { ...s.errors, [key]: error } })),
    updateFilters: (patch) =>
      set((s) => ({ filters: { ...s.filters, ...patch } })),
    markNotificationAsRead: (notificationId) =>
      set((s) => ({
        adminNotifications: s.adminNotifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
      })),
    markActionAsResolved: (actionId) =>
      set((s) => ({
        pendingActions: s.pendingActions.map((a) =>
          a.id === actionId ? { ...a, status: 'resolved' } : a
        ),
      })),

    invalidateCache: (key) =>
      set((s) => {
        if (!key) {
          const newCache: DashboardState['_cache'] = {
            stats: makeCacheEntry<DashboardStats>(null),
            recentActivity: makeCacheEntry<RecentActivity[]>(null),
            pendingActions: makeCacheEntry<PendingAction[]>(null),
            recentBookings: makeCacheEntry<Booking[]>(null),
            roleDistribution: makeCacheEntry<RoleDistribution>(null),
            announcements: makeCacheEntry<Announcement[]>(null),
            adminNotifications: makeCacheEntry<AdminNotification[]>(null),
            analytics: makeCacheEntry<AnalyticsData>(null),
            systemHealth: makeCacheEntry<SystemHealth>(null),
            trendingInsights: makeCacheEntry<TrendingInsight[]>(null),
          };
          return { _cache: newCache };
        }
        return { _cache: { ...s._cache, [key]: makeCacheEntry(null) } };
      }),

    // fetch helpers rewritten to use async/await + try/catch and set inFlight properly
    fetchStats: async (opts = { force: false }) => {
      const key = 'stats';
      const cache = get()._cache.stats;

      if (!opts.force && cache.data && cache.lastFetched && now() - cache.lastFetched < cache.ttl) {
        set({ stats: cache.data });
        return;
      }

      if (get()._inFlight[key]) {
        await get()._inFlight[key];
        return;
      }

      set((s) => ({ loading: { ...s.loading, stats: true }, errors: { ...s.errors, stats: null } }));

      const promise = (async () => {
        try {
          const res = await api.get<ApiEnvelope<DashboardStats>>(`${URL_AFTER_API}/stats`);
          if (res.data.error) throw new Error(res.data.error);
          const data = res.data.data;
          // console.log(res.data);
          set((s) => ({ stats: data, _cache: { ...s._cache, stats: makeCacheEntry(data) } }));
        } catch (err) {
          const msg = extractErrorMessage(err);
          set((s) => ({ errors: { ...s.errors, stats: msg } }));
        } finally {
          set((s) => ({ loading: { ...s.loading, stats: false } }));
          set((s) => {
            const m = { ...s._inFlight };
            delete m[key];
            return { _inFlight: m };
          });
        }
      })();

      set((s) => ({ _inFlight: { ...s._inFlight, [key]: promise } }));
      await promise;
    },

    fetchRecentActivity: async (opts = { force: false, page: 1, limit: 10 }) => {
      const key = `recentActivity:${opts.page}:${opts.limit}`;
      const globalCache = get()._cache.recentActivity;

      if (!opts.force && globalCache.data && globalCache.lastFetched && now() - globalCache.lastFetched < globalCache.ttl) {
        set({ recentActivity: globalCache.data });
        return;
      }

      if (get()._inFlight[key]) {
        await get()._inFlight[key];
        return;
      }

      set((s) => ({ loading: { ...s.loading, recentActivity: true }, errors: { ...s.errors, recentActivity: null } }));

      const promise = (async () => {
        try {
          const res = await api.get<ApiEnvelope<RecentActivity[]>>(`${URL_AFTER_API}/recent-activity`, {
            params: { page: opts.page, limit: opts.limit },
          });
          if (res.data.error) throw new Error(res.data.error);
          const data = res.data.data || [];
          set((s) => ({ recentActivity: data, _cache: { ...s._cache, recentActivity: makeCacheEntry(data) } }));
        } catch (err) {
          const msg = extractErrorMessage(err);
          set((s) => ({ errors: { ...s.errors, recentActivity: msg } }));
        } finally {
          set((s) => ({ loading: { ...s.loading, recentActivity: false } }));
          set((s) => {
            const m = { ...s._inFlight };
            delete m[key];
            return { _inFlight: m };
          });
        }
      })();

      set((s) => ({ _inFlight: { ...s._inFlight, [key]: promise } }));
      await promise;
    },

    fetchPendingActions: async (opts = { force: false }) => {
      const key = 'pendingActions';
      const cache = get()._cache.pendingActions;

      if (!opts.force && cache.data && cache.lastFetched && now() - cache.lastFetched < cache.ttl) {
        set({ pendingActions: cache.data });
        return;
      }

      if (get()._inFlight[key]) {
        await get()._inFlight[key];
        return;
      }

      set((s) => ({ loading: { ...s.loading, pendingActions: true }, errors: { ...s.errors, pendingActions: null } }));

      const promise = (async () => {
        try {
          const res = await api.get<ApiEnvelope<PendingAction[]>>(`${URL_AFTER_API}/pending-actions`);
          if (res.data.error) throw new Error(res.data.error);
          const data = res.data.data || [];
          set((s) => ({ pendingActions: data, _cache: { ...s._cache, pendingActions: makeCacheEntry(data) } }));
        } catch (err) {
          const msg = extractErrorMessage(err);
          set((s) => ({ errors: { ...s.errors, pendingActions: msg } }));
        } finally {
          set((s) => ({ loading: { ...s.loading, pendingActions: false } }));
          set((s) => {
            const m = { ...s._inFlight };
            delete m[key];
            return { _inFlight: m };
          });
        }
      })();

      set((s) => ({ _inFlight: { ...s._inFlight, [key]: promise } }));
      await promise;
    },

    fetchRecentBookings: async (opts = { force: false, page: 1, limit: 10 }) => {
      const key = `recentBookings:${opts.page}:${opts.limit}`;
      const cache = get()._cache.recentBookings;

      if (!opts.force && cache.data && cache.lastFetched && now() - cache.lastFetched < cache.ttl) {
        set({ recentBookings: cache.data });
        return;
      }

      if (get()._inFlight[key]) {
        await get()._inFlight[key];
        return;
      }

      set((s) => ({ loading: { ...s.loading, recentBookings: true }, errors: { ...s.errors, recentBookings: null } }));

      const promise = (async () => {
        try {
          const res = await api.get<ApiEnvelope<Booking[]>>(`${URL_AFTER_API}/recent-bookings`, {
            params: { page: opts.page, limit: opts.limit },
          });
          if (res.data.error) throw new Error(res.data.error);
          const data = res.data.data || [];
          set((s) => ({ recentBookings: data, _cache: { ...s._cache, recentBookings: makeCacheEntry(data) } }));
        } catch (err) {
          const msg = extractErrorMessage(err);
          set((s) => ({ errors: { ...s.errors, recentBookings: msg } }));
        } finally {
          set((s) => ({ loading: { ...s.loading, recentBookings: false } }));
          set((s) => {
            const m = { ...s._inFlight };
            delete m[key];
            return { _inFlight: m };
          });
        }
      })();

      set((s) => ({ _inFlight: { ...s._inFlight, [key]: promise } }));
      await promise;
    },

    fetchRoleDistribution: async (opts = { force: false }) => {
      const key = 'roleDistribution';
      const cache = get()._cache.roleDistribution;

      if (!opts.force && cache.data && cache.lastFetched && now() - cache.lastFetched < cache.ttl) {
        set({ roleDistribution: cache.data });
        return;
      }

      if (get()._inFlight[key]) {
        await get()._inFlight[key];
        return;
      }

      set((s) => ({ loading: { ...s.loading, roleDistribution: true }, errors: { ...s.errors, roleDistribution: null } }));

      const promise = (async () => {
        try {
          const res = await api.get<ApiEnvelope<RoleDistribution>>(`${URL_AFTER_API}/role-distribution`);
          if (res.data.error) throw new Error(res.data.error);
          const data = res.data.data || null;
          set((s) => ({ roleDistribution: data, _cache: { ...s._cache, roleDistribution: makeCacheEntry(data) } }));
        } catch (err) {
          set((s) => ({ errors: { ...s.errors, roleDistribution: extractErrorMessage(err) } }));
        } finally {
          set((s) => ({ loading: { ...s.loading, roleDistribution: false } }));
          set((s) => {
            const m = { ...s._inFlight };
            delete m[key];
            return { _inFlight: m };
          });
        }
      })();

      set((s) => ({ _inFlight: { ...s._inFlight, [key]: promise } }));
      await promise;
    },

    fetchAnnouncements: async (opts = { force: false }) => {
      const key = 'announcements';
      const cache = get()._cache.announcements;

      if (!opts.force && cache.data && cache.lastFetched && now() - cache.lastFetched < cache.ttl) {
        set({ announcements: cache.data });
        return;
      }

      if (get()._inFlight[key]) {
        await get()._inFlight[key];
        return;
      }

      set((s) => ({ loading: { ...s.loading, announcements: true }, errors: { ...s.errors, announcements: null } }));

      const promise = (async () => {
        try {
          const res = await api.get<ApiEnvelope<Announcement[]>>(`${URL_AFTER_API}/announcements`);
          if (res.data.error) throw new Error(res.data.error);
          const data = res.data.data || [];
          set((s) => ({ announcements: data, _cache: { ...s._cache, announcements: makeCacheEntry(data) } }));
        } catch (err) {
          set((s) => ({ errors: { ...s.errors, announcements: extractErrorMessage(err) } }));
        } finally {
          set((s) => ({ loading: { ...s.loading, announcements: false } }));
          set((s) => {
            const m = { ...s._inFlight };
            delete m[key];
            return { _inFlight: m };
          });
        }
      })();

      set((s) => ({ _inFlight: { ...s._inFlight, [key]: promise } }));
      await promise;
    },

    fetchAdminNotifications: async (opts = { force: false }) => {
      const key = 'adminNotifications';
      const cache = get()._cache.adminNotifications;

      if (!opts.force && cache.data && cache.lastFetched && now() - cache.lastFetched < cache.ttl) {
        set({ adminNotifications: cache.data });
        return;
      }

      if (get()._inFlight[key]) {
        await get()._inFlight[key];
        return;
      }

      set((s) => ({ loading: { ...s.loading, adminNotifications: true }, errors: { ...s.errors, adminNotifications: null } }));

      const promise = (async () => {
        try {
          const res = await api.get<ApiEnvelope<AdminNotification[]>>(`${URL_AFTER_API}/admin-notifications`);
          if (res.data.error) throw new Error(res.data.error);
          const data = res.data.data || [];
          set((s) => ({ adminNotifications: data, _cache: { ...s._cache, adminNotifications: makeCacheEntry(data) } }));
        } catch (err) {
          set((s) => ({ errors: { ...s.errors, adminNotifications: extractErrorMessage(err) } }));
        } finally {
          set((s) => ({ loading: { ...s.loading, adminNotifications: false } }));
          set((s) => {
            const m = { ...s._inFlight };
            delete m[key];
            return { _inFlight: m };
          });
        }
      })();

      set((s) => ({ _inFlight: { ...s._inFlight, [key]: promise } }));
      await promise;
    },

    fetchAnalytics: async (opts = { force: false, filters: undefined }) => {
      const key = 'analytics';
      const cache = get()._cache.analytics;

      const filters = opts.filters ?? get().filters;
      const shouldUseCache =
        !opts.force &&
        cache.data &&
        cache.lastFetched &&
        now() - cache.lastFetched < cache.ttl &&
        (!opts.filters || JSON.stringify(filters) === JSON.stringify(get().filters));

      if (shouldUseCache) {
        set({ analytics: cache.data });
        return;
      }

      if (get()._inFlight[key]) {
        await get()._inFlight[key];
        return;
      }

      set((s) => ({ loading: { ...s.loading, analytics: true }, errors: { ...s.errors, analytics: null } }));

      const promise = (async () => {
        try {
          const res = await api.post<ApiEnvelope<AnalyticsData>>(`${URL_AFTER_API}/analytics`, filters);
          if (res.data.error) throw new Error(res.data.error);
          const data = res.data.data || null;
          set((s) => ({ analytics: data, _cache: { ...s._cache, analytics: makeCacheEntry(data) } }));
        } catch (err) {
          set((s) => ({ errors: { ...s.errors, analytics: extractErrorMessage(err) } }));
        } finally {
          set((s) => ({ loading: { ...s.loading, analytics: false } }));
          set((s) => {
            const m = { ...s._inFlight };
            delete m[key];
            return { _inFlight: m };
          });
        }
      })();

      set((s) => ({ _inFlight: { ...s._inFlight, [key]: promise } }));
      await promise;
    },

    fetchSystemHealth: async (opts = { force: false }) => {
      const key = 'systemHealth';
      const cache = get()._cache.systemHealth;

      if (!opts.force && cache.data && cache.lastFetched && now() - cache.lastFetched < cache.ttl) {
        set({ systemHealth: cache.data });
        return;
      }

      if (get()._inFlight[key]) {
        await get()._inFlight[key];
        return;
      }

      set((s) => ({ loading: { ...s.loading, systemHealth: true }, errors: { ...s.errors, systemHealth: null } }));

      const promise = (async () => {
        try {
          const res = await api.get<ApiEnvelope<SystemHealth>>(`${URL_AFTER_API}/system-health`);
          if (res.data.error) throw new Error(res.data.error);
          const data = res.data.data || null;
          set((s) => ({ systemHealth: data, _cache: { ...s._cache, systemHealth: makeCacheEntry(data) } }));
        } catch (err) {
          set((s) => ({ errors: { ...s.errors, systemHealth: extractErrorMessage(err) } }));
        } finally {
          set((s) => ({ loading: { ...s.loading, systemHealth: false } }));
          set((s) => {
            const m = { ...s._inFlight };
            delete m[key];
            return { _inFlight: m };
          });
        }
      })();

      set((s) => ({ _inFlight: { ...s._inFlight, [key]: promise } }));
      await promise;
    },

    fetchTrendingInsights: async (opts = { force: false }) => {
      const key = 'trendingInsights';
      const cache = get()._cache.trendingInsights;

      if (!opts.force && cache.data && cache.lastFetched && now() - cache.lastFetched < cache.ttl) {
        set({ trendingInsights: cache.data });
        return;
      }

      if (get()._inFlight[key]) {
        await get()._inFlight[key];
        return;
      }

      set((s) => ({ loading: { ...s.loading, trendingInsights: true }, errors: { ...s.errors, trendingInsights: null } }));

      const promise = (async () => {
        try {
          const res = await api.get<ApiEnvelope<TrendingInsight[]>>(`${URL_AFTER_API}/trending-insights`);
          if (res.data.error) throw new Error(res.data.error);
          const data = res.data.data || [];
          set((s) => ({ trendingInsights: data, _cache: { ...s._cache, trendingInsights: makeCacheEntry(data) } }));
        } catch (err) {
          set((s) => ({ errors: { ...s.errors, trendingInsights: extractErrorMessage(err) } }));
        } finally {
          set((s) => ({ loading: { ...s.loading, trendingInsights: false } }));
          set((s) => {
            const m = { ...s._inFlight };
            delete m[key];
            return { _inFlight: m };
          });
        }
      })();

      set((s) => ({ _inFlight: { ...s._inFlight, [key]: promise } }));
      await promise;
    },

    // orchestrator
    refreshAll: async () => {
      const { currentUser } = get();

      // Always fetch non-admin slices first in parallel
      await Promise.all([
        get().fetchStats({ force: true }),
        get().fetchRecentActivity({ force: true, page: get().filters.page ?? 1, limit: get().filters.limit ?? 10 }),
        get().fetchPendingActions({ force: true }),
        get().fetchRecentBookings({ force: true, page: get().filters.page ?? 1, limit: get().filters.limit ?? 10 }),
        get().fetchAnnouncements({ force: true }),
        get().fetchAdminNotifications({ force: true }),
      ]);

      // Admin-only additional fetches
      if (currentUser?.role === 'admin') {
        await Promise.all([
          get().fetchRoleDistribution({ force: true }),
          get().fetchAnalytics({ force: true, filters: get().filters }),
          get().fetchSystemHealth({ force: true }),
          get().fetchTrendingInsights({ force: true }),
        ]);
      }
    },
  }))
);
