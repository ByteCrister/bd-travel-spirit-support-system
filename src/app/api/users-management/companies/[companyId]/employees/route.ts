// /api/users-management/companies/[companyId]/employees/route.ts
import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import { EmployeeListItemDTO, EmployeeTableColumns, sortableEmployeeFields } from "@/types/employee.types";
import {
    EmployeeRole,
    EmployeeStatus,
    EmployeeSubRole,
    EmploymentType,
} from "@/constants/employee.const";

function generateFakeEmployee(): EmployeeListItemDTO {
    return {
        id: faker.database.mongodbObjectId(),
        userId: faker.database.mongodbObjectId(),
        hostId: faker.database.mongodbObjectId(),
        fullName: faker.person.fullName(),
        role: faker.helpers.arrayElement<EmployeeRole>(["assistant", "support"]),
        subRole: faker.helpers.arrayElement<EmployeeSubRole>([
            "product",
            "order",
            "support",
            "marketing",
            "finance",
            "analytics",
            "hr",
        ]),
        position: faker.person.jobTitle(),
        department: faker.commerce.department(),
        team: faker.commerce.department(),
        status: faker.helpers.arrayElement<EmployeeStatus>([
            "active",
            "onLeave",
            "suspended",
            "terminated",
        ]),
        employmentType: faker.helpers.arrayElement<EmploymentType>([
            "full_time",
            "part_time",
            "contract",
            "intern",
        ]),
        salary: {
            amount: faker.number.int({ min: 20000, max: 80000 }),
            currency: "USD",
        },
        contact: {
            phone: faker.phone.number(),
            email: faker.internet.email(),
        },
        dateOfJoining: faker.date.past().toISOString(),
        dateOfLeaving: faker.datatype.boolean()
            ? faker.date.recent().toISOString()
            : undefined,
        isDeleted: false,
        audit: {
            createdBy: faker.database.mongodbObjectId(),
            updatedBy: faker.database.mongodbObjectId(),
        },
        createdAt: faker.date.past().toISOString(),
        updatedAt: faker.date.recent().toISOString(),
        performanceSummary: {
            rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
        },
    };
}

// --- Helper to get sort value ---
function getSortValue(employee: EmployeeListItemDTO, field: EmployeeTableColumns | "createdAt" | "updatedAt"): string | number {
    switch (field) {
        case "salary":
            return employee.salary?.amount ?? 0;
        case "dateOfJoining":
        case "dateOfLeaving":
        case "createdAt":
        case "updatedAt":
            return employee[field] ? new Date(employee[field]!).getTime() : 0;
        default:
            return (employee[field] ?? "").toString().toLowerCase();
    }
}

export async function GET(
    req: Request,
    { params }: { params: { companyId: string } }
) {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    let sort = (searchParams.get("sort") || "createdAt") as EmployeeTableColumns | "createdAt" | "updatedAt";
    const order = (searchParams.get("order") as "asc" | "desc") || "desc";
    const search = searchParams.get("search")?.toLowerCase() || "";

    // Validate sort field
    if (!sortableEmployeeFields.includes(sort)) sort = "createdAt";

    // Generate fake employees
    let employees: EmployeeListItemDTO[] = Array.from({ length: 200 }, generateFakeEmployee);

    // Search filter
    if (search) {
        employees = employees.filter(e =>
            e.fullName.toLowerCase().includes(search) ||
            e.position.toLowerCase().includes(search) ||
            (e.department ?? "").toLowerCase().includes(search) ||
            (e.team ?? "").toLowerCase().includes(search)
        );
    }

    // Sorting
    employees.sort((a, b) => {
        const aVal = getSortValue(a, sort);
        const bVal = getSortValue(b, sort);

        if (aVal < bVal) return order === "asc" ? -1 : 1;
        if (aVal > bVal) return order === "asc" ? 1 : -1;
        return 0;
    });

    // Pagination
    const total = employees.length;
    const pages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const pagedEmployees = employees.slice(start, end);

    return NextResponse.json({
        companyId: (await params).companyId,
        data: {
            docs: pagedEmployees,
            total,
            page,
            pages,
        },
    });
}
