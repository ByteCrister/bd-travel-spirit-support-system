// stores/current-user.store.ts

import { create } from "zustand";
import {
    CurrentUserState,
    IBaseUser,
    CurrentUser,
    AdminRole,
    AuditListApiResponse,
} from "@/types/current-user.types";
import api from "@/utils/axios";
import { extractErrorMessage } from "@/utils/axios/extract-error-message";
import { showToast } from "@/components/global/showToast";
import { USER_ROLE } from "@/constants/user.const";
import { ApiResponse } from "@/types/api.types";

const URL_AFTER_API = "/auth/user/v1";

/**
 * Helper: is data fresh within ttlMs since lastFetchedAt?
 */
function isFresh(lastFetchedAt?: number | null, ttlMs = 60_000): boolean {
    if (!lastFetchedAt) return false;
    return Date.now() - lastFetchedAt < ttlMs;
}

/**
 * Normalize role value to enum literal strings used by backend
 */
function normalizeRole(role: AdminRole): AdminRole {
    // Trust server-enum strings; add mapping here if UI uses aliases
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

    // Status
    baseMeta: { loading: false, inFlight: false, error: null, lastFetchedAt: null, stale: true },
    fullMeta: { loading: false, inFlight: false, error: null, lastFetchedAt: null, stale: true },
    auditsMeta: { loading: false, inFlight: false, error: null, lastFetchedAt: null, stale: true },

    // Abort controllers
    _abortBase: null,
    _abortFull: null,
    _abortAudits: null,

    /**
     * Fetch base user info (/auth/me)
     * - Dedupes inflight
     * - Respects freshness (TTL)
     * - Supports force refetch
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
            // If aborted, keep previous data intact and clear inflight state silently
            if (isAbortLikeError(err)) {
                set({ baseMeta: { ...get().baseMeta, loading: false, inFlight: false }, _abortBase: null });
                return get().baseUser;
            }
            const message = extractErrorMessage(err);
            set({
                baseMeta: { loading: false, inFlight: false, error: message, lastFetchedAt: get().baseMeta.lastFetchedAt ?? null, stale: false },
                _abortBase: null,
            });
            // showToast.error("Failed to fetch base user", message);
            return null;
        }
    },

    /**
     * Fetch full user info based on role
     * - Owner: /admin/owner/me
     * - Employee (assistant/support): /admin/employee/me
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
     * Fetch audit logs for a user
     * - Paginated
     * - Deduped inflight; abortable
     */
    fetchUserAudits: async (opts) => {
        const { auditsMeta, _abortAudits, audits } = get();

        if (auditsMeta.inFlight) return audits;

        const force = opts?.force === true;
        const page = opts?.page ?? 1;
        const pageSize = opts?.pageSize ?? 50;
        const append = opts?.append === true;

        if (!force && !auditsMeta.stale && isFresh(auditsMeta.lastFetchedAt, 30_000)) {
            return audits;
        }

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
            const res = await api.get<ApiResponse<AuditListApiResponse>>(
                `${URL_AFTER_API}/audits`,
                {
                    params: { page, pageSize },
                    signal: controller.signal,
                }
            );

            if (!res.data || !res.data.data) {
                throw new Error("Invalid response body")
            }

            const data = res.data.data;

            const mergedAudits = append ? [...audits, ...data.audits] : data.audits;

            const hasMore = page * pageSize < data.total;

            set({
                audits: mergedAudits,
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
            });

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
        const { _abortBase, _abortFull, _abortAudits } = get();
        try { _abortBase?.abort(); } catch { }
        try { _abortFull?.abort(); } catch { }
        try { _abortAudits?.abort(); } catch { }

        set({
            baseUser: null,
            fullUser: null,
            audits: [],
            baseMeta: { loading: false, inFlight: false, error: null, lastFetchedAt: null, stale: true },
            fullMeta: { loading: false, inFlight: false, error: null, lastFetchedAt: null, stale: true },
            auditsMeta: { loading: false, inFlight: false, error: null, lastFetchedAt: null, stale: true },
            _abortBase: null,
            _abortFull: null,
            _abortAudits: null,
        });
    },
}));