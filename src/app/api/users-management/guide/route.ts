// src/app/api/users-management/guide/route.ts
import { NextResponse } from "next/server";
import { PendingGuideDTO } from "@/types/pendingGuide.types";
import { GUIDE_STATUS } from "@/constants/user.const";
import { GUIDE_DOCUMENT_CATEGORY, GUIDE_DOCUMENT_TYPE } from "@/constants/guide.const";

const isoNow = () => new Date().toISOString();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUserToGuide(user: any, index: number): PendingGuideDTO {
    const appliedAt = new Date(Date.now() - Math.floor(Math.random() * 3) * 86400000).toISOString();

    return {
        _id: user.login.uuid,
        name: `${user.name.first} ${user.name.last}`,
        email: user.email,
        phone: user.phone || "+880123456789",
        avatar: user.picture?.medium ?? "/default-avatar.png",
        companyName: "Adventure Co.",
        bio: "Passionate guide with local expertise.",
        social: `https://linkedin.com/in/${user.login.username}`,
        documents: [
            {
                category: GUIDE_DOCUMENT_CATEGORY.GOVERNMENT_ID,
                fileType: GUIDE_DOCUMENT_TYPE.PDF,
                fileName: "govt-id.pdf",
                base64Content: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                uploadedAt: isoNow(),
            },
            {
                category: GUIDE_DOCUMENT_CATEGORY.CERTIFICATION,
                fileType: GUIDE_DOCUMENT_TYPE.IMAGE,
                fileName: "profile.jpg",
                base64Content: "https://randomuser.me/api/portraits/men/75.jpg",
                uploadedAt: isoNow(),
            },
        ],
        status:
            index % 3 === 0
                ? GUIDE_STATUS.PENDING
                : index % 3 === 1
                    ? GUIDE_STATUS.APPROVED
                    : GUIDE_STATUS.REJECTED,
        reviewComment: index % 3 === 2 ? "Verification failed" : undefined,
        reviewer: index % 3 === 2 ? "admin123" : undefined,
        reviewedAt: index % 3 === 2 ? isoNow() : undefined,
        appliedAt,
        createdAt: appliedAt,
        updatedAt: isoNow(),
    };
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = Number(searchParams.get("page")) || 1;
        const pageSize = Number(searchParams.get("pageSize")) || 10;
        const sortBy = (searchParams.get("sortBy") as string) || "createdAt";
        const sortDir = (searchParams.get("sortDir") as "asc" | "desc") || "desc";
        const statusFilter = searchParams.get("status");
        const search = (searchParams.get("search") || "").toLowerCase();

        // Fetch mock users
        const res = await fetch(`https://randomuser.me/api/?results=${pageSize}&nat=us,bd,ca`);
        const data = await res.json();

        // Map users to guide objects
        let guides: PendingGuideDTO[] = data.results.map((u: never, i: number) => mapUserToGuide(u, i));

        // Filter by status
        if (statusFilter) {
            guides = guides.filter((g) => g.status === statusFilter);
        }

        // Filter by search (name, email, company)
        if (search) {
            guides = guides.filter(
                (g) =>
                    g.name.toLowerCase().includes(search) ||
                    g.email.toLowerCase().includes(search) ||
                    g.companyName.toLowerCase().includes(search)
            );
        }

        // Sort guides
        type SortableKeys = keyof PendingGuideDTO;

        guides.sort((a, b) => {
            const aValue = a[sortBy as SortableKeys];
            const bValue = b[sortBy as SortableKeys];
            return compareValues(aValue, bValue, sortDir);
        });


        const total = 200; // mock total count

        return NextResponse.json({
            data: guides,
            total,
            page,
            pageSize,
            hasNext: page * pageSize < total,
            hasPrev: page > 1,
        });
    } catch (err) {
        console.error("Error fetching guides:", err);
        return NextResponse.json(
            { error: "Failed to fetch guides", details: (err as Error).message },
            { status: 500 }
        );
    }
}



// In route.ts (or a shared utils file)
/**
 * Compare two values for sorting, handling null/undefined, numbers, dates, and strings.
 */
function compareValues(a: unknown, b: unknown, sortDir: "asc" | "desc"): number {
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;

    // Numbers (or numeric strings)
    const aNum = typeof a === "number" ? a : (typeof a === "string" && !isNaN(Number(a)) ? Number(a) : NaN);
    const bNum = typeof b === "number" ? b : (typeof b === "string" && !isNaN(Number(b)) ? Number(b) : NaN);

    if (!isNaN(aNum) && !isNaN(bNum)) {
        if (aNum === bNum) return 0;
        return sortDir === "asc" ? (aNum < bNum ? -1 : 1) : (aNum > bNum ? -1 : 1);
    }

    // Dates (only if a and b are strings or Date)
    if ((typeof a === "string" || a instanceof Date) && (typeof b === "string" || b instanceof Date)) {
        const aDate = new Date(a);
        const bDate = new Date(b);
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
            const at = aDate.getTime();
            const bt = bDate.getTime();
            if (at === bt) return 0;
            return sortDir === "asc" ? (at < bt ? -1 : 1) : (at > bt ? -1 : 1);
        }
    }

    // Fallback: string compare
    const aStr = String(a).toLowerCase();
    const bStr = String(b).toLowerCase();
    if (aStr === bStr) return 0;
    return sortDir === "asc" ? (aStr < bStr ? -1 : 1) : (aStr > bStr ? -1 : 1);
}