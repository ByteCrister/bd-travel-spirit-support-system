// src/app/api/users/route.ts
import { demoUsers } from "@/lib/mocks/demoUsers";
import { UsersApiResponse } from "@/store/travelers.store";
import { NextResponse } from "next/server";
import { ACCOUNT_STATUS, USER_ROLE } from "@/constants/user.const";
import { UserSortableField } from "@/types/user.table.types";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        // -----------------------------
        // Pagination
        // -----------------------------
        const page = Number(searchParams.get("page") ?? 1);
        const perPage = Number(searchParams.get("perPage") ?? 20);

        if (isNaN(page) || page < 1 || isNaN(perPage) || perPage < 1) {
            return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
        }

        // -----------------------------
        // Filters
        // -----------------------------
        const search = searchParams.get("search")?.toLowerCase() || "";

        // Support comma-separated multi-select filters
        const rolesParam = searchParams.get("roles") || "all";
        const roles = rolesParam === "all" ? "all" : rolesParam.split(",") as USER_ROLE[];

        const statusParam = searchParams.get("accountStatus") || "all";
        const accountStatuses = statusParam === "all" ? "all" : statusParam.split(",") as ACCOUNT_STATUS[];

        const isVerified = searchParams.has("isVerified")
            ? searchParams.get("isVerified") === "true"
            : undefined;

        // -----------------------------
        // Sorting
        // -----------------------------
        const sortBy = searchParams.get("sortBy") as UserSortableField | null;
        const sortDir = (searchParams.get("sortDir") as "asc" | "desc") ?? "asc";

        // -----------------------------
        // Apply filters
        // -----------------------------
        const filtered = demoUsers.filter((u) => {
            // Search by name/email
            let match = !search || u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search);

            // Role filter
            if (roles !== "all") {
                match = match && roles.includes(u.role);
            }

            // Account status filter
            if (accountStatuses !== 'all') {
                match = match && accountStatuses.includes(u.accountStatus);
            }

            // Verified filter
            if (typeof isVerified === "boolean") {
                match = match && u.isVerified === isVerified;
            }

            return match;
        });

        // -----------------------------
        // Sorting
        // -----------------------------
        type SortableUserFields = 'name' | 'email' | 'role' | 'accountStatus' | 'createdAt' | 'lastLogin';

        if (sortBy) {
            filtered.sort((a, b) => {
                // cast to keyof User safely
                const aVal = a[sortBy as SortableUserFields];
                const bVal = b[sortBy as SortableUserFields];

                // Handle dates
                const aNum = sortBy === "createdAt" || sortBy === "lastLogin" ? new Date(aVal || 0).getTime() : (aVal ?? 0);
                const bNum = sortBy === "createdAt" || sortBy === "lastLogin" ? new Date(bVal || 0).getTime() : (bVal ?? 0);

                if (aNum < bNum) return sortDir === "asc" ? -1 : 1;
                if (aNum > bNum) return sortDir === "asc" ? 1 : -1;
                return 0;
            });
        }


        // -----------------------------
        // Pagination
        // -----------------------------
        const start = (page - 1) * perPage;
        const end = start + perPage;
        const paginated = filtered.slice(start, end);

        // -----------------------------
        // Build response
        // -----------------------------
        const response: UsersApiResponse = {
            data: paginated.map((u) => ({
                _id: u._id,
                avatar: u.avatar,
                name: u.name,
                email: u.email,
                role: u.role,
                isVerified: u.isVerified,
                accountStatus: u.accountStatus,
                isActive: u.isActive,
                lastLogin: u.lastLogin,
                createdAt: u.createdAt,
            })),
            total: filtered.length,
            page,
            perPage,
        };

        return NextResponse.json(response, { status: 200 });
    } catch (err) {
        console.error("Error in GET /api/users:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
