// src/proxy.ts
// ─── Next.js Middleware — Role-Based Auth + Brute-Force Rate Limiting ─────────
//
// This file is the single source of truth for all middleware logic.
// src/middleware.ts re-exports `proxy` (as default) and `config` from here so
// that Next.js picks it up as the actual middleware entry-point.
//
// Three responsibilities:
//   1. RATE LIMITING    — 100 requests / 60 s per IP on every /api/** route
//                         (protects against brute-force / enumeration attacks).
//   2. ROUTE GUARD      — JWT-based role check for all protected pages.
//                         Unauthenticated → redirect to "/"
//                         Authorised but wrong role → redirect to /dashboard/overview
//   3. READ-ONLY USER   — If the authenticated user's email matches TEST_USER_EMAIL
//                         (set in .env), they may view any page/data their role
//                         allows but ALL mutating requests (POST/PUT/PATCH/DELETE)
//                         are rejected with 403 { success: false, readOnly: true }.
//
// Role map is derived directly from the Sidebar adminOnly flags:
//   admin  — full access (except read-only restriction when TEST_USER_EMAIL)
//   support — access to shared routes only (adminOnly items blocked)
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/options.auth";
import { authRateLimit } from "@/lib/upstash-redis/auth-rate-limit";
import { USER_ROLE } from "@/constants/user.const";

// ─── Rate-limit constants ────────────────────────────────────────────────────
/** Maximum requests per IP within the window before a 429 is returned. */
const API_RATE_LIMIT = 100;

/** Sliding-window duration in seconds for the API rate limiter. */
const API_RATE_WINDOW = 60;

// ─── Read-only test-user constants ───────────────────────────────────────────

/**
 * The email address of the designated read-only test user.
 * Loaded once at cold-start so we never call process.env on every request.
 * Falls back to an empty string (i.e. the feature is disabled) when the
 * variable is absent.
 */
const TEST_USER_EMAIL: string = process.env.TEST_USER_EMAIL ?? "";

/**
 * HTTP methods that change server state.  A test user is never allowed to
 * use any of these — all other methods (GET, HEAD, OPTIONS …) are fine.
 */
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Shared 403 response returned whenever the test user tries to mutate data.
 * Using a factory keeps the payload consistent across all call-sites.
 */
const readOnlyForbidden = () =>
    NextResponse.json(
        {
            success: false,
            readOnly: true,
            message:
                "This account is read-only. Create, update, and delete operations are disabled.",
        },
        { status: 403 },
    );

// ─── Route permission maps ───────────────────────────────────────────────────

/**
 * Routes accessible only by ADMIN.
 * Derived from `adminOnly: true` items in Sidebar.tsx navigationGroups.
 */
const ADMIN_ONLY_PREFIXES: string[] = [
    // Overview group
    "/dashboard/statistics",

    // Users group
    "/users/employees",

    // Support group
    "/support/reset-password-requests",

    // Social group (entire section is admin-only)
    "/social/ads",
    "/social/promotions",

    // Settings group (entire section is admin-only)
    "/setting",
];

/**
 * Route prefixes that require any valid dashboard role (admin OR support).
 * If a path starts with one of these it must be authenticated.
 */
const PROTECTED_PREFIXES: string[] = [
    "/dashboard",
    "/users",
    "/support",
    "/social",
    "/setting",
    "/customer-support",
];

/**
 * Routes that bypass ALL middleware checks (NextAuth internals, static assets).
 * These are already excluded by the `config.matcher` below, but an explicit
 * allow-list keeps the logic readable and safe.
 */
const PUBLIC_PREFIXES: string[] = [
    "/api/auth", // NextAuth callback + CSRF routes — must NEVER be rate-limited
    "/_next",
    "/favicon.ico",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** True when `pathname` starts with any prefix in the list. */
const matchesAny = (pathname: string, prefixes: string[]): boolean =>
    prefixes.some((p) => pathname.startsWith(p));

// ─── Main middleware function ─────────────────────────────────────────────────

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // ── 0. Allow public/internal routes through immediately ──────────────────
    if (matchesAny(pathname, PUBLIC_PREFIXES)) {
        return NextResponse.next();
    }

    // ── 1. API Rate Limiting ─────────────────────────────────────────────────
    // Applied to ALL /api/** routes (except /api/auth covered above).
    if (pathname.startsWith("/api")) {
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
            req.headers.get("x-real-ip") ??
            "127.0.0.1";

        const allowed = await authRateLimit({
            identifier: `api:${ip}`,
            limit: API_RATE_LIMIT,
            window: API_RATE_WINDOW,
        });

        if (!allowed) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Too many requests. Please try again later.",
                },
                {
                    status: 429,
                    headers: {
                        // Inform clients when they may retry (standard header)
                        "Retry-After": String(API_RATE_WINDOW),
                        "X-RateLimit-Limit": String(API_RATE_LIMIT),
                        "X-RateLimit-Window": `${API_RATE_WINDOW}s`,
                    },
                },
            );
        }

        // ── 1b. Read-only test-user check (API) ─────────────────────────────
        // Resolve the session here so we can compare the email.  The `auth()`
        // call is cached by Auth.js for the lifetime of the request, so calling
        // it again in section 2 below is effectively free.
        if (TEST_USER_EMAIL) {
            const apiSession = await auth();
            const isTestUser =
                apiSession?.user?.email?.toLowerCase() ===
                TEST_USER_EMAIL.toLowerCase();

            if (isTestUser && MUTATING_METHODS.has(req.method)) {
                return readOnlyForbidden();
            }
        }

        // Authenticated API calls may continue; no role check needed at middleware
        // level for API routes — individual route handlers own their auth.
        return NextResponse.next();
    }

    // ── 2. Page Route Guard ──────────────────────────────────────────────────
    // Only run the JWT/role check for protected page prefixes.
    if (!matchesAny(pathname, PROTECTED_PREFIXES)) {
        return NextResponse.next();
    }

    // Auth.js v5: `auth()` resolves the JWT from the session cookie without
    // touching the database — safe for the Edge runtime.
    const session = await auth();

    // 2a. Not authenticated → send to sign-in page
    if (!session?.user) {
        const signInUrl = new URL("/", req.url);
        signInUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(signInUrl);
    }

    const role = session.user.role as string | undefined;
    const isAdmin = role === USER_ROLE.ADMIN;
    const isSupport = role === USER_ROLE.SUPPORT;

    // 2b. Authenticated but not a dashboard role (traveler / guide / assistant)
    if (!isAdmin && !isSupport) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    // 2c. Admin-only page accessed by a support user → redirect to overview
    if (matchesAny(pathname, ADMIN_ONLY_PREFIXES) && !isAdmin) {
        const overviewUrl = new URL("/dashboard/overview", req.url);
        overviewUrl.searchParams.set("unauthorized", "1");
        return NextResponse.redirect(overviewUrl);
    }

    // ── 3. Read-only test-user page guard ───────────────────────────────────
    // The test user can navigate to any page their role permits, but we block
    // any form submission / fetch that reaches us as a mutating page request.
    if (TEST_USER_EMAIL) {
        const isTestUser =
            session.user?.email?.toLowerCase() ===
            TEST_USER_EMAIL.toLowerCase();

        if (isTestUser && MUTATING_METHODS.has(req.method)) {
            return readOnlyForbidden();
        }
    }

    // ── 4. All checks passed ─────────────────────────────────────────────────
    return NextResponse.next();
}

// ─── Matcher ─────────────────────────────────────────────────────────────────
// Exclude Next.js internals, static files, and image-optimisation routes so
// the middleware only runs on meaningful requests.
export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};