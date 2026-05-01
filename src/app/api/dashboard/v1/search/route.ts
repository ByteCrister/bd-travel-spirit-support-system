// src/app/api/dashboard/v1/search/route.ts

import { NextRequest } from "next/server";
import UserModel from "@/models/user.model";
import { sanitizeSearch } from "@/lib/helpers/sanitize-search";
import { redisCache } from "@/lib/upstash-redis/redis-cache";
import GuideModel from "@/models/guide/guide.model";
import TourModel from "@/models/tours/tour.model";
import { MODERATION_STATUS } from "@/constants/tour.const";
import EmployeeModel from "@/models/employees/employees.model";
import { EMPLOYEE_STATUS } from "@/constants/employee.const";
import { TravelerModel } from "@/models/travelers/traveler.model";
import { TravelArticleModel } from "@/models/articles/travel-article.model";
import { ARTICLE_STATUS } from "@/constants/article.const";
import { getCollectionName } from "@/lib/helpers/get-collection-name";
import { USER_ROLE } from "@/constants/user.const";
import { Types } from "mongoose";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";
import { GUIDE_STATUS } from "@/constants/guide.const";

// Limits per collection
const LIMIT = 5;

// ---------------------------------------------------------------------------
// Helper: create a case‑insensitive regex from a sanitised string
// ---------------------------------------------------------------------------
const buildRegex = (sanitized: string) =>
    new RegExp(sanitized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
export const GET = withErrorHandler(async (request: NextRequest) => {
    // 1. Authentication
    const userId = await getUserIdFromSession();
    if (!userId) {
        throw new ApiError("Unauthorized", 401);
    }

    // 2. Authorization – must be admin or support
    await VERIFY_USER_ROLE.MULTIPLE(userId, [USER_ROLE.ADMIN, USER_ROLE.SUPPORT]);

    // 3. Query parameter
    const { searchParams } = request.nextUrl;
    const rawQuery = searchParams.get("q");
    if (!rawQuery) {
        throw new ApiError("Missing search query parameter 'q'", 400);
    }

    // 4. Sanitize input
    const sanitized = sanitizeSearch(rawQuery);
    if (!sanitized) {
        return { data: { results: [] } }; // empty result with success
    }

    // 5. Check Redis cache
    const cacheKey = `BD_TRAVEL_SPIRIT_SUPPORT_SYSTEM:search:global:${sanitized}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) {
        let results;
        if (typeof cached === 'string') {
            try {
                results = JSON.parse(cached);
            } catch {
                // Corrupted cache entry – delete it and continue with a fresh search
                await redisCache.del(cacheKey);
            }
        } else {
            // Upstash Redis can auto-parse JSON, so `cached` might already be an array
            results = cached;
        }
        if (results) {
            return { data: { results } };
        }
    }

    // Build the regex once for all queries
    const pattern = buildRegex(sanitized);

    // 6. Run all model searches in parallel (updated – removed searchUsers)
    const [
        guideResults,
        tourResults,
        employeeResults,
        travelerResults,
        articleResults,
    ] = await Promise.all([
        searchGuides(pattern),
        searchTours(pattern),
        searchSupportEmployees(pattern),
        searchTravelers(pattern),   // now looks into User document
        searchArticles(pattern),
    ]);

    // 7. Combine & store in cache (TTL 120s)
    const results = [
        ...guideResults,
        ...tourResults,
        ...employeeResults,
        ...travelerResults,
        ...articleResults,
    ];

    await redisCache.set(cacheKey, JSON.stringify(results), 120);

    return { data: { results } };
});

// ---------------------------------------------------------------------------
// Per‑model search functions
// ---------------------------------------------------------------------------

interface SearchResult {
    title: string;
    route: string;   // base path, e.g. "/users/companies/"
    ids: string[];   // IDs to append to the route
}

/**
 * Guides (Companies)
 * Active, approved guides matching companyName or bio.
 */
async function searchGuides(regex: RegExp): Promise<SearchResult[]> {
    const guides = await GuideModel.find({
        deletedAt: null,
        status: GUIDE_STATUS.APPROVED,
        $or: [
            { companyName: { $regex: regex } },
            { bio: { $regex: regex } },
        ],
    })
        .select("_id companyName")
        .limit(LIMIT)
        .lean();

    return guides.map((g) => ({
        title: g.companyName,
        route: "/users/companies/",
        ids: [(g._id as Types.ObjectId).toString()],
    }));
}

/**
 * Tours
 * Non‑soft‑deleted tours matching title, summary or tags.
 * Approved tours get the company route, others go to support.
 */
async function searchTours(regex: RegExp): Promise<SearchResult[]> {
    const tours = await TourModel.find({
        deletedAt: null,
        $or: [
            { title: { $regex: regex } },
            { summary: { $regex: regex } },
            { tags: { $regex: regex } },
        ],
    })
        .select("_id title companyId moderationStatus")
        .limit(LIMIT)
        .lean();

    return tours.map((tour) => {
        const isApproved = tour.moderationStatus === MODERATION_STATUS.APPROVED;
        return {
            title: tour.title,
            route: isApproved
                ? "/users/companies/"
                : "/support/tours/",
            ids: isApproved
                ? [(tour.companyId as Types.ObjectId).toString(), (tour._id as Types.ObjectId).toString()]
                : [(tour._id as Types.ObjectId).toString()],
        };
    });
}

/**
 * Employees with the “support” role in the linked User model.
 * Searches by the user’s name.
 */
async function searchSupportEmployees(regex: RegExp): Promise<SearchResult[]> {
    const employees = await EmployeeModel.aggregate([
        {
            $match: {
                deletedAt: null,
                status: EMPLOYEE_STATUS.ACTIVE,
            },
        },
        {
            $lookup: {
                from: getCollectionName(UserModel),
                localField: "user",
                foreignField: "_id",
                as: "userDoc",
            },
        },
        { $unwind: "$userDoc" },
        {
            $match: {
                "userDoc.role": USER_ROLE.SUPPORT,
                "userDoc.name": { $regex: regex },
            },
        },
        { $limit: LIMIT },
        {
            $project: {
                _id: 1,
                title: "$userDoc.name",
            },
        },
    ]);

    return employees.map((emp) => ({
        title: emp.title,
        route: "/users/employees/",
        ids: [(emp._id as Types.ObjectId).toString()],
    }));
}

/**
 * Travelers – now searches by linked User’s name and email.
 * Uses aggregation to join with the User collection.
 */
async function searchTravelers(regex: RegExp): Promise<SearchResult[]> {
    const travelers = await TravelerModel.aggregate([
        { $match: { deletedAt: null } },
        {
            $lookup: {
                from: getCollectionName(UserModel),
                localField: "user",
                foreignField: "_id",
                as: "userDoc",
            },
        },
        { $unwind: "$userDoc" },
        {
            $match: {
                $or: [
                    { "userDoc.name": { $regex: regex.source, $options: "i" } },
                    { "userDoc.email": { $regex: regex.source, $options: "i" } },
                ],
            },
        },
        { $limit: LIMIT },
        {
            $project: {
                _id: 1,
                title: "$userDoc.name",
            },
        },
    ]);

    return travelers.map((t) => ({
        title: t.title,
        route: "/users/travelers/",
        ids: [(t._id as Types.ObjectId).toString()],
    }));
}

/**
 * Travel articles – search by title, summary or tags.
 * Only published (or non‑archived) articles are returned.
 */
async function searchArticles(regex: RegExp): Promise<SearchResult[]> {
    const articles = await TravelArticleModel.find({
        deleted: false,
        status: { $ne: ARTICLE_STATUS.ARCHIVED },
        $or: [
            { title: { $regex: regex } },
            { summary: { $regex: regex } },
            { tags: { $regex: regex } },
        ],
    })
        .select("_id title")
        .limit(LIMIT)
        .lean();

    return articles.map((a) => ({
        title: a.title,
        route: "/support/articles/",
        ids: [(a._id as Types.ObjectId).toString()],
    }));
}