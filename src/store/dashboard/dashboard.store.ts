"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  DashboardStats,
  RecentActivity,
  PendingAction,
  Booking,
  RoleDistribution,
  AdminNotification,
  AnalyticsData,
  DashboardFilters,
  DateRangeFilter,
  PaginationFilter,
} from "@/types/dashboard/dashboard.types";

import api from "@/utils/axios";
import { extractErrorMessage } from "@/utils/axios/extract-error-message";
import { ApiResponse } from "@/types/common/api.types";

const URL_AFTER_API = "/mock/dashboard";
// const URL_AFTER_API = "/dashboard/v1/overview/v1";

// TTL for client cache in ms
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

type LoadingKey =
  | "stats"
  | "recentActivity"
  | "pendingActions"
  | "recentBookings"
  | "roleDistribution"
  | "announcements"
  | "adminNotifications"
  | "analytics"
  | "systemHealth"
  | "trendingInsights";

type ErrorKey = LoadingKey;

interface CacheEntry<T> {
  data: T | null;
  lastFetched: number | null;
  ttl: number;
}

type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

interface DashboardState {
  // per-slice loading / errors
  loading: Record<LoadingKey, boolean>;
  errors: Record<ErrorKey, string | null>;

  // data slices
  stats: DashboardStats | null;
  recentActivity: RecentActivity[];
  pendingActions: PendingAction[];
  recentBookings: Booking[];
  roleDistribution: RoleDistribution | null;
  adminNotifications: AdminNotification[];
  analytics: AnalyticsData | null;

  // per‑component filter states
  statsDateRange: DateRangeFilter;          // for stats cards
  analyticsDateRange: DateRangeFilter;       // for analytics charts
  recentActivityPagination: PaginationFilter;
  adminNotificationsPagination: PaginationFilter;
  recentBookingsPagination: PaginationFilter;

  // internal caches and in-flight maps (not persisted)
  _cache: {
    stats: CacheEntry<DashboardStats>;
    recentActivity: CacheEntry<RecentActivity[]>;
    pendingActions: CacheEntry<PendingAction[]>;
    recentBookings: CacheEntry<Booking[]>;
    roleDistribution: CacheEntry<RoleDistribution>;
    adminNotifications: CacheEntry<AdminNotification[]>;
    analytics: CacheEntry<AnalyticsData>;
  };

  _inFlight: Partial<Record<string, Promise<unknown>>>;

  // sync actions
  setLoading: (key: LoadingKey, value: boolean) => void;
  setError: (key: ErrorKey, error: string | null) => void;
  updateFilters: (patch: Partial<DashboardFilters>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markActionAsResolved: (actionId: string) => void;

  // cache helpers
  invalidateCache: (key?: keyof DashboardState["_cache"]) => void;

  // filter setters
  setStatsDateRange: (range: DateRangeFilter) => void;
  setAnalyticsDateRange: (range: DateRangeFilter) => void;
  setRecentActivityPagination: (pagination: Partial<PaginationFilter>) => void;
  setAdminNotificationsPagination: (pagination: Partial<PaginationFilter>) => void;
  setRecentBookingsPagination: (pagination: Partial<PaginationFilter>) => void;

  // async fetchers (they handle caching/dedupe)
  fetchStats: (opts?: { force?: boolean }) => Promise<void>;
  fetchRecentActivity: (opts?: {
    force?: boolean;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  fetchPendingActions: (opts?: { force?: boolean }) => Promise<void>;
  fetchRecentBookings: (opts?: {
    force?: boolean;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  fetchRoleDistribution: (opts?: { force?: boolean }) => Promise<void>;
  fetchAnnouncements: (opts?: { force?: boolean }) => Promise<void>;
  fetchAdminNotifications: (opts?: { force?: boolean }) => Promise<void>;
  fetchAnalytics: (opts?: {
    force?: boolean;
    filters?: Partial<DashboardFilters>;
  }) => Promise<void>;
  fetchTrendingInsights: (opts?: { force?: boolean }) => Promise<void>;

  // orchestrator
  refreshAll: (isAdmin?: boolean, force?: boolean) => Promise<void>;
}

const now = () => Date.now();

const makeCacheEntry = <T>(
  data: T | null,
  ttl = DEFAULT_TTL,
): CacheEntry<T> => ({
  data,
  lastFetched: data ? now() : null,
  ttl,
});

export const useDashboardStore = create<DashboardState>()(
  devtools((set, get) => ({
    // initial state
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
    adminNotifications: [],
    analytics: null,
    systemHealth: null,
    trendingInsights: [],

    // initial filter values
    statsDateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    analyticsDateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    recentActivityPagination: { page: 1, limit: 10 },
    adminNotificationsPagination: { page: 1, limit: 10 },
    recentBookingsPagination: { page: 1, limit: 10 },

    _cache: {
      stats: makeCacheEntry<DashboardStats>(null),
      recentActivity: makeCacheEntry<RecentActivity[] | null>(null),
      pendingActions: makeCacheEntry<PendingAction[] | null>(null),
      recentBookings: makeCacheEntry<Booking[] | null>(null),
      roleDistribution: makeCacheEntry<RoleDistribution | null>(null),
      adminNotifications: makeCacheEntry<AdminNotification[] | null>(null),
      analytics: makeCacheEntry<AnalyticsData | null>(null),
    },
    _inFlight: {},

    // sync actions
    setLoading: (key, value) =>
      set((s) => ({ loading: { ...s.loading, [key]: value } })),
    setError: (key, error) =>
      set((s) => ({ errors: { ...s.errors, [key]: error } })),
    markNotificationAsRead: (notificationId) =>
      set((s) => ({
        adminNotifications: s.adminNotifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n,
        ),
      })),
    markActionAsResolved: (actionId) =>
      set((s) => ({
        pendingActions: s.pendingActions.map((a) =>
          a.id === actionId ? { ...a, status: "resolved" } : a,
        ),
      })),

    invalidateCache: (key) =>
      set((s) => {
        if (!key) {
          const newCache: DashboardState["_cache"] = {
            stats: makeCacheEntry<DashboardStats>(null),
            recentActivity: makeCacheEntry<RecentActivity[]>(null),
            pendingActions: makeCacheEntry<PendingAction[]>(null),
            recentBookings: makeCacheEntry<Booking[]>(null),
            roleDistribution: makeCacheEntry<RoleDistribution>(null),
            adminNotifications: makeCacheEntry<AdminNotification[]>(null),
            analytics: makeCacheEntry<AnalyticsData>(null),
          };
          return { _cache: newCache };
        }
        return { _cache: { ...s._cache, [key]: makeCacheEntry(null) } };
      }),

    // filter setters
    setStatsDateRange: (range) => set({ statsDateRange: range }),
    setAnalyticsDateRange: (range) => set({ analyticsDateRange: range }),
    setRecentActivityPagination: (pagination) => set((s) => ({
      recentActivityPagination: { ...s.recentActivityPagination, ...pagination },
    })),
    setAdminNotificationsPagination: (pagination) => set((s) => ({
      adminNotificationsPagination: { ...s.adminNotificationsPagination, ...pagination },
    })),
    setRecentBookingsPagination: (pagination) => set((s) => ({
      recentBookingsPagination: { ...s.recentBookingsPagination, ...pagination },
    })),

    // fetch helpers (unchanged, only removed any reference to currentUser)
    fetchStats: async (opts = { force: false }) => {
      const key = `stats:${JSON.stringify(get().statsDateRange)}`; // include date range in cache key
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
          const params = new URLSearchParams({
            start: get().statsDateRange.start,
            end: get().statsDateRange.end,
          });
          const res = await api.get<ApiResponse<DashboardStats>>(`${URL_AFTER_API}/stats?${params}`);
          if (!res.data?.data) throw new Error("Invalid response");
          const data = res.data.data;
          set((s) => ({
            stats: data,
            _cache: { ...s._cache, stats: makeCacheEntry(data) },
          }));
        } catch (err) {
          set((s) => ({ errors: { ...s.errors, stats: extractErrorMessage(err) } }));
        } finally {
          set((s) => ({ loading: { ...s.loading, stats: false } }));
          set((s) => { const m = { ...s._inFlight }; delete m[key]; return { _inFlight: m }; });
        }
      })();

      set((s) => ({ _inFlight: { ...s._inFlight, [key]: promise } }));
      await promise;
    },

    fetchRecentActivity: async (opts = { force: false }) => {
      const pagination = get().recentActivityPagination;
      const key = `recentActivity:${pagination.page}:${pagination.limit}`;
      const cache = get()._cache.recentActivity;

      if (!opts.force && cache.data && cache.lastFetched && now() - cache.lastFetched < cache.ttl) {
        set({ recentActivity: cache.data });
        return;
      }

      if (get()._inFlight[key]) {
        await get()._inFlight[key];
        return;
      }

      set((s) => ({ loading: { ...s.loading, recentActivity: true }, errors: { ...s.errors, recentActivity: null } }));

      const promise = (async () => {
        try {
          const params = new URLSearchParams({
            page: String(pagination.page),
            limit: String(pagination.limit),
          });
          const res = await api.get<ApiResponse<PaginatedResponse<RecentActivity>>>(`${URL_AFTER_API}/recent-activity?${params}`);
          if (!res.data?.data) throw new Error("Invalid response");
          const { items } = res.data.data;
          set((s) => ({
            recentActivity: items,
            _cache: { ...s._cache, recentActivity: makeCacheEntry(items) },
          }));
        } catch (err) {
          set((s) => ({ errors: { ...s.errors, recentActivity: extractErrorMessage(err) } }));
        } finally {
          set((s) => ({ loading: { ...s.loading, recentActivity: false } }));
          set((s) => { const m = { ...s._inFlight }; delete m[key]; return { _inFlight: m }; });
        }
      })();

      set((s) => ({ _inFlight: { ...s._inFlight, [key]: promise } }));
      await promise;
    },

    fetchPendingActions: async (opts = { force: false }) => {
      const key = "pendingActions";
      const cache = get()._cache.pendingActions;

      if (
        !opts.force &&
        cache.data &&
        cache.lastFetched &&
        now() - cache.lastFetched < cache.ttl
      ) {
        set({ pendingActions: cache.data });
        return;
      }

      if (get()._inFlight[key]) {
        await get()._inFlight[key];
        return;
      }

      set((s) => ({
        loading: { ...s.loading, pendingActions: true },
        errors: { ...s.errors, pendingActions: null },
      }));

      const promise = (async () => {
        try {
          const res = await api.get<ApiResponse<PendingAction[]>>(
            `${URL_AFTER_API}/pending-actions`,
          );
          if (!res.data || !res.data.data)
            throw new Error("Invalid api response.");
          const data = res.data.data || [];
          set((s) => ({
            pendingActions: data,
            _cache: { ...s._cache, pendingActions: makeCacheEntry(data) },
          }));
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

    fetchRecentBookings: async (opts = { force: false }) => {
      const pagination = get().recentBookingsPagination;
      const key = `recentBookings:${pagination.page}:${pagination.limit}`;
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
          const params = new URLSearchParams({
            page: String(pagination.page),
            limit: String(pagination.limit),
          });
          const res = await api.get<ApiResponse<PaginatedResponse<Booking>>>(`${URL_AFTER_API}/recent-bookings?${params}`);
          if (!res.data?.data) throw new Error("Invalid response");
          const { items } = res.data.data;
          set((s) => ({
            recentBookings: items,
            _cache: { ...s._cache, recentBookings: makeCacheEntry(items) },
          }));
        } catch (err) {
          set((s) => ({ errors: { ...s.errors, recentBookings: extractErrorMessage(err) } }));
        } finally {
          set((s) => ({ loading: { ...s.loading, recentBookings: false } }));
          set((s) => { const m = { ...s._inFlight }; delete m[key]; return { _inFlight: m }; });
        }
      })();

      set((s) => ({ _inFlight: { ...s._inFlight, [key]: promise } }));
      await promise;
    },

    fetchRoleDistribution: async (opts = { force: false }) => {
      const key = "roleDistribution";
      const cache = get()._cache.roleDistribution;

      if (
        !opts.force &&
        cache.data &&
        cache.lastFetched &&
        now() - cache.lastFetched < cache.ttl
      ) {
        set({ roleDistribution: cache.data });
        return;
      }

      if (get()._inFlight[key]) {
        await get()._inFlight[key];
        return;
      }

      set((s) => ({
        loading: { ...s.loading, roleDistribution: true },
        errors: { ...s.errors, roleDistribution: null },
      }));

      const promise = (async () => {
        try {
          const res = await api.get<ApiResponse<RoleDistribution>>(
            `${URL_AFTER_API}/role-distribution`,
          );
          if (!res.data || !res.data.data)
            throw new Error("Invalid api response.");
          const data = res.data.data || null;
          set((s) => ({
            roleDistribution: data,
            _cache: { ...s._cache, roleDistribution: makeCacheEntry(data) },
          }));
        } catch (err) {
          set((s) => ({
            errors: { ...s.errors, roleDistribution: extractErrorMessage(err) },
          }));
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

    fetchAdminNotifications: async (opts = { force: false }) => {
      const pagination = get().adminNotificationsPagination;
      const key = `adminNotifications:${pagination.page}:${pagination.limit}`;
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
          const params = new URLSearchParams({
            page: String(pagination.page),
            limit: String(pagination.limit),
          });
          const res = await api.get<ApiResponse<PaginatedResponse<AdminNotification>>>(`${URL_AFTER_API}/admin-notifications?${params}`);
          if (!res.data?.data) throw new Error("Invalid response");
          const { items } = res.data.data;
          set((s) => ({
            adminNotifications: items,
            _cache: { ...s._cache, adminNotifications: makeCacheEntry(items) },
          }));
        } catch (err) {
          set((s) => ({ errors: { ...s.errors, adminNotifications: extractErrorMessage(err) } }));
        } finally {
          set((s) => ({ loading: { ...s.loading, adminNotifications: false } }));
          set((s) => { const m = { ...s._inFlight }; delete m[key]; return { _inFlight: m }; });
        }
      })();

      set((s) => ({ _inFlight: { ...s._inFlight, [key]: promise } }));
      await promise;
    },

    fetchAnalytics: async (opts = { force: false }) => {
      const range = get().analyticsDateRange;
      const key = `analytics:${range.start}:${range.end}`;
      const cache = get()._cache.analytics;

      if (!opts.force && cache.data && cache.lastFetched && now() - cache.lastFetched < cache.ttl) {
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
          const params = new URLSearchParams({
            start: range.start,
            end: range.end,
          });
          const res = await api.get<ApiResponse<AnalyticsData>>(`${URL_AFTER_API}/analytics?${params}`);
          if (!res.data?.data) throw new Error("Invalid response");
          const data = res.data.data;
          set((s) => ({
            analytics: data,
            _cache: { ...s._cache, analytics: makeCacheEntry(data) },
          }));
        } catch (err) {
          set((s) => ({ errors: { ...s.errors, analytics: extractErrorMessage(err) } }));
        } finally {
          set((s) => ({ loading: { ...s.loading, analytics: false } }));
          set((s) => { const m = { ...s._inFlight }; delete m[key]; return { _inFlight: m }; });
        }
      })();

      set((s) => ({ _inFlight: { ...s._inFlight, [key]: promise } }));
      await promise;
    },

    // orchestrator – now accepts an isAdmin flag
    refreshAll: async (isAdmin = false, force = false) => {
      await Promise.all([
        get().fetchStats({ force }),
        get().fetchRecentActivity({ force }),
        get().fetchPendingActions({ force }),
        get().fetchRecentBookings({ force }),
        get().fetchAdminNotifications({ force }),
      ]);

      if (isAdmin) {
        await Promise.all([
          get().fetchRoleDistribution({ force }),
          get().fetchAnalytics({ force }),
        ]);
      }
    },

  })),
);