// stores/current-user.store.ts

import { create } from "zustand";
import {
    CurrentUserState,
    IBaseUser,
    CurrentUser,
    AdminRole,
    AuditListApiResponse,
    AuditDateFilter,
    AuditQueryParams,
} from "@/types/user/current-user.types";
import api from "@/utils/axios";
import { extractErrorMessage } from "@/utils/axios/extract-error-message";
import { showToast } from "@/components/global/showToast";
import { USER_ROLE } from "@/constants/user.const";
import { ApiResponse } from "@/types/common/api.types";

const URL_AFTER_API = "/auth/user/v1";

/**
 * Helper: is data fresh within ttlMs since lastFetchedAt?
 */
function isFresh(lastFetchedAt?: number | null, ttlMs = 60_000): boolean {
    if (!lastFetchedAt) return false;
    return Date.now() - lastFetchedAt < ttlMs;
}

/**
 * Generate cache key for audit queries
 */
// function generateAuditCacheKey(filters: AuditDateFilter & { page: number; pageSize: number }): string {
//     const { page, pageSize, startDate, endDate, date } = filters;
//     return JSON.stringify({
//         page,
//         pageSize,
//         startDate,
//         endDate,
//         date,
//     });
// }

/**
 * Normalize role value to enum literal strings used by backend
 */
function normalizeRole(role: AdminRole): AdminRole {
    return role;
}

function isAbortLikeError(err: unknown): err is { name: string } {
    return (
        typeof err === "object" &&
        err !== null &&
        "name" in err &&
        typeof (err as { name: unknown }).name === "string" &&
        ["AbortError", "CanceledError"].includes(
            (err as { name: string }).name
        )
    );
}

export const useCurrentUserStore = create<CurrentUserState>((set, get) => ({
    // Data
    baseUser: null,
    fullUser: null,
    audits: [],

    // Filters
    auditFilters: {
        currentPage: 1,
        pageSize: 50,
        hasMore: true,
        // No date filters by default
    },

    // Status
    baseMeta: { loading: false, inFlight: false, error: null, lastFetchedAt: null, stale: true },
    fullMeta: { loading: false, inFlight: false, error: null, lastFetchedAt: null, stale: true },
    auditsMeta: { loading: false, inFlight: false, error: null, lastFetchedAt: null, stale: true },

    // Abort controllers
    _abortBase: null,
    _abortFull: null,
    _abortAudits: null,
    _abortUpdateName: null,
    _abortUpdatePassword: null,

    /**
     * Fetch base user info (/auth/me)
     */
    fetchBaseUser: async (opts) => {
        const { baseMeta, _abortBase } = get();

        // Dedupe inflight
        if (baseMeta.inFlight) return get().baseUser;

        // Skip if fresh and not forced
        const force = opts?.force === true;
        if (!force && !baseMeta.stale && isFresh(baseMeta.lastFetchedAt)) {
            return get().baseUser;
        }

        // Abort previous request
        if (_abortBase) _abortBase.abort();
        const controller = new AbortController();
        set({ _abortBase: controller, baseMeta: { ...baseMeta, loading: true, inFlight: true, error: null } });

        try {
            const res = await api.get<ApiResponse<IBaseUser>>(URL_AFTER_API, { signal: controller.signal });

            if (!res.data || !res.data.data) {
                throw new Error("Invalid response body")
            }

            const data = res.data.data;

            set({
                baseUser: data,
                baseMeta: { loading: false, inFlight: false, error: null, lastFetchedAt: Date.now(), stale: false },
                _abortBase: null,
            });
            return data;
        } catch (err: unknown) {
            if (isAbortLikeError(err)) {
                set({ baseMeta: { ...get().baseMeta, loading: false, inFlight: false }, _abortBase: null });
                return get().baseUser;
            }
            const message = extractErrorMessage(err);
            set({
                baseMeta: { loading: false, inFlight: false, error: message, lastFetchedAt: get().baseMeta.lastFetchedAt ?? null, stale: false },
                _abortBase: null,
            });
            return null;
        }
    },

    /**
     * Fetch full user info based on role
     */
    fetchFullUser: async (role, opts) => {
        const normalized = normalizeRole(role);
        const { fullMeta, _abortFull } = get();

        if (fullMeta.inFlight) return get().fullUser;
        const force = opts?.force === true;
        if (!force && !fullMeta.stale && isFresh(fullMeta.lastFetchedAt)) {
            return get().fullUser;
        }

        if (_abortFull) _abortFull.abort();
        const controller = new AbortController();
        set({ _abortFull: controller, fullMeta: { ...fullMeta, loading: true, inFlight: true, error: null } });

        try {
            const endpoint = normalized === USER_ROLE.ADMIN ? `${URL_AFTER_API}/owner` : `${URL_AFTER_API}/employee`;
            const res = await api.get<ApiResponse<CurrentUser>>(endpoint, { signal: controller.signal });

            if (!res.data || !res.data.data) {
                throw new Error("Invalid response body")
            }

            const data = res.data.data;

            set({
                fullUser: data,
                fullMeta: { loading: false, inFlight: false, error: null, lastFetchedAt: Date.now(), stale: false },
                _abortFull: null,
            });
            return data;
        } catch (err) {
            if (isAbortLikeError(err)) {
                set({
                    fullMeta: { ...get().fullMeta, loading: false, inFlight: false },
                    _abortFull: null,
                });
                return get().fullUser;
            }
            const message = extractErrorMessage(err);
            set({
                fullMeta: { loading: false, inFlight: false, error: message, lastFetchedAt: get().fullMeta.lastFetchedAt ?? null, stale: true },
                _abortFull: null,
            });
            showToast.error("Failed to fetch full user", message);
            return null;
        }
    },

    /**
     * Fetch audit logs for a user with date range filtering and pagination
     */
    fetchUserAudits: async (opts) => {
        const { auditsMeta, _abortAudits, audits, auditFilters } = get();

        // Dedupe inflight requests
        if (auditsMeta.inFlight) return audits;

        const force = opts?.force === true;
        const page = opts?.page ?? auditFilters.currentPage;
        const pageSize = opts?.pageSize ?? auditFilters.pageSize;
        const append = opts?.append === true;

        // Determine if we're changing filters
        const newFilters: Partial<AuditDateFilter> = {
            ...(opts?.date && { date: opts.date }),
            ...(opts?.startDate && { startDate: opts.startDate }),
            ...(opts?.endDate && { endDate: opts.endDate }),
        };

        const currentFilters = {
            date: auditFilters.date,
            startDate: auditFilters.startDate,
            endDate: auditFilters.endDate,
        };

        const filtersChanged = JSON.stringify(newFilters) !== JSON.stringify(currentFilters);

        // If filters changed, we need to reset to page 1 and clear existing audits
        if (filtersChanged) {
            set({
                audits: [],
                auditFilters: {
                    ...auditFilters,
                    ...newFilters,
                    currentPage: 1,
                    hasMore: true,
                }
            });
        }

        // Skip if fresh and not forced and filters haven't changed
        if (!force && !filtersChanged && !auditsMeta.stale && isFresh(auditsMeta.lastFetchedAt, 30_000)) {
            return audits;
        }

        // Abort previous request
        if (_abortAudits) _abortAudits.abort();

        const controller = new AbortController();

        set({
            _abortAudits: controller,
            auditsMeta: {
                ...auditsMeta,
                loading: true,
                inFlight: true,
                error: null,
            },
        });

        try {
            // Build query parameters
            const params: AuditQueryParams = {
                page,
                pageSize,
            };

            // Add date filters if provided
            if (opts?.date) {
                params.date = opts.date;
            } else {
                if (opts?.startDate) params.startDate = opts.startDate;
                if (opts?.endDate) params.endDate = opts.endDate;
            }

            const res = await api.get<ApiResponse<AuditListApiResponse>>(
                `${URL_AFTER_API}/audits`,
                {
                    params,
                    signal: controller.signal,
                }
            );

            if (!res.data || !res.data.data) {
                throw new Error("Invalid response body")
            }

            const data = res.data.data;

            // Merge or replace audits based on append flag
            const mergedAudits = append ? [...audits, ...data.audits] : data.audits;

            // Calculate if there are more pages
            const hasMore = page * pageSize < data.total;

            // Update filters state
            set((state) => ({
                audits: mergedAudits,
                auditFilters: {
                    ...state.auditFilters,
                    ...newFilters,
                    currentPage: page,
                    hasMore,
                },
                auditsMeta: {
                    loading: false,
                    inFlight: false,
                    error: null,
                    lastFetchedAt: Date.now(),
                    stale: false,
                    page,
                    pageSize,
                    total: data.total,
                    hasMore,
                },
                _abortAudits: null,
            }));

            return mergedAudits;
        } catch (err) {
            if (isAbortLikeError(err)) {
                set({
                    auditsMeta: {
                        ...get().auditsMeta,
                        loading: false,
                        inFlight: false,
                    },
                    _abortAudits: null,
                });
                return audits;
            }

            const message = extractErrorMessage(err);

            set({
                auditsMeta: {
                    loading: false,
                    inFlight: false,
                    error: message,
                    lastFetchedAt: get().auditsMeta.lastFetchedAt ?? null,
                    stale: true,
                },
                _abortAudits: null,
            });

            showToast.error("Failed to fetch audit logs", message);
            return null;
        }
    },

    /**
     * Set audit date filters
     */
    setAuditDateFilter: (filter) => {
        set((state) => ({
            auditFilters: {
                ...state.auditFilters,
                ...filter,
                // Reset to page 1 when filters change
                currentPage: 1,
            },
            // Mark audits as stale to trigger refetch
            auditsMeta: {
                ...state.auditsMeta,
                stale: true,
            }
        }));
    },

    /**
     * Reset audit filters to default
     */
    resetAuditFilters: () => {
        set((state) => ({
            auditFilters: {
                currentPage: 1,
                pageSize: 50,
                hasMore: true,
            },
            audits: [],
            auditsMeta: {
                ...state.auditsMeta,
                stale: true,
            }
        }));
    },

    /**
     * Load more audits (paginate)
     */
    loadMoreAudits: async () => {
        const { auditFilters } = get();

        if (!auditFilters.hasMore) {
            return get().audits;
        }

        const nextPage = auditFilters.currentPage + 1;

        return get().fetchUserAudits({
            page: nextPage,
            append: true,
            startDate: auditFilters.startDate,
            endDate: auditFilters.endDate,
            date: auditFilters.date,
        });
    },

    /**
    * Update user name/profile
    */
    updateUserName: async (data) => {
        const { baseUser, updateNameMeta, _abortUpdateName } = get();

        // Check if we have base user info
        if (!baseUser) {
            showToast.error("User not loaded", "Please refresh the page and try again");
            return null;
        }

        // Dedupe inflight
        if (updateNameMeta?.inFlight) return null;

        // Abort previous request
        if (_abortUpdateName) _abortUpdateName.abort();
        const controller = new AbortController();

        set({
            _abortUpdateName: controller,
            updateNameMeta: {
                loading: true,
                inFlight: true,
                error: null,
                lastFetchedAt: updateNameMeta?.lastFetchedAt ?? null,
                stale: false,
            }
        });

        try {

            const res = await api.patch<ApiResponse<CurrentUser>>(
                `${URL_AFTER_API}/name`,
                data,
                { signal: controller.signal }
            );

            if (!res.data || !res.data.data) {
                throw new Error("Invalid response body");
            }

            const updatedUser = res.data.data;

            // Update the store with new user data
            set({
                fullUser: updatedUser,
                updateNameMeta: {
                    loading: false,
                    inFlight: false,
                    error: null,
                    lastFetchedAt: Date.now(),
                    stale: false
                },
                _abortUpdateName: null,
            });

            showToast.success("Name updated successfully");
            return updatedUser;

        } catch (err: unknown) {
            if (isAbortLikeError(err)) {
                set({
                    updateNameMeta: {
                        loading: false,
                        inFlight: false,
                        error: null,
                        lastFetchedAt: get().updateNameMeta?.lastFetchedAt ?? null,
                        stale: false,
                    },
                    _abortUpdateName: null,
                });
                return null;
            }

            const message = extractErrorMessage(err);
            set({
                updateNameMeta: {
                    loading: false,
                    inFlight: false,
                    error: message,
                    lastFetchedAt: get().updateNameMeta?.lastFetchedAt ?? null,
                    stale: false
                },
                _abortUpdateName: null,
            });

            showToast.error("Failed to update name", message);
            return null;
        }
    },

    /**
     * Update user password
     */
    updateUserPassword: async (data) => {
        const { updatePasswordMeta, _abortUpdatePassword } = get();

        // Dedupe inflight
        if (updatePasswordMeta?.inFlight) return;

        // Abort previous request
        if (_abortUpdatePassword) _abortUpdatePassword.abort();
        const controller = new AbortController();

        set({
            _abortUpdatePassword: controller,
            updatePasswordMeta: {
                loading: true,
                inFlight: true,
                error: null,
                lastFetchedAt: updatePasswordMeta?.lastFetchedAt ?? null,
                stale: false,
            }
        });

        try {
            // Password update endpoint (should be same for all roles)
            await api.patch<ApiResponse<void>>(
                `${URL_AFTER_API}/password`,
                data,
                { signal: controller.signal }
            );

            set({
                updatePasswordMeta: {
                    loading: false,
                    inFlight: false,
                    error: null,
                    lastFetchedAt: Date.now(),
                    stale: false
                },
                _abortUpdatePassword: null,
            });

            showToast.success("Password updated successfully");

        } catch (err: unknown) {
            if (isAbortLikeError(err)) {
                set({
                    updatePasswordMeta: {
                        loading: false,
                        error: null,
                        lastFetchedAt: get().updatePasswordMeta?.lastFetchedAt ?? null,
                        inFlight: false,
                        stale: false,
                    },
                    _abortUpdatePassword: null
                });
                return;
            }

            const message = extractErrorMessage(err);
            set({
                updatePasswordMeta: {
                    loading: false,
                    inFlight: false,
                    error: message,
                    lastFetchedAt: get().updatePasswordMeta?.lastFetchedAt ?? null,
                    stale: false
                },
                _abortUpdatePassword: null,
            });

            showToast.error("Failed to update password", message);
        }
    },

    /**
     * Mark a slice as stale to allow refetch
     */
    markStale: (scope) => {
        const metaKey = scope === "base" ? "baseMeta" : scope === "full" ? "fullMeta" : "auditsMeta";
        const current = get()[metaKey];
        set({ [metaKey]: { ...current, stale: true } });
    },

    /**
     * Clear all user state; abort ongoing requests
     */
    clearUser: () => {
        // Abort inflight safely
        const { _abortBase, _abortFull, _abortAudits, _abortUpdateName, _abortUpdatePassword } = get();
        try { _abortBase?.abort(); } catch { }
        try { _abortFull?.abort(); } catch { }
        try { _abortAudits?.abort(); } catch { }
        try { _abortUpdateName?.abort(); } catch { }
        try { _abortUpdatePassword?.abort(); } catch { }

        set({
            baseUser: null,
            fullUser: null,
            audits: [],
            auditFilters: {
                currentPage: 1,
                pageSize: 50,
                hasMore: true,
            },
            baseMeta: { loading: false, inFlight: false, error: null, lastFetchedAt: null, stale: true },
            fullMeta: { loading: false, inFlight: false, error: null, lastFetchedAt: null, stale: true },
            auditsMeta: { loading: false, inFlight: false, error: null, lastFetchedAt: null, stale: true },
            updateNameMeta: { loading: false, inFlight: false, error: null, lastFetchedAt: null, stale: true },
            updatePasswordMeta: { loading: false, inFlight: false, error: null, lastFetchedAt: null, stale: true },
            _abortBase: null,
            _abortFull: null,
            _abortAudits: null,
            _abortUpdateName: null,
            _abortUpdatePassword: null,
        });
    },
}));