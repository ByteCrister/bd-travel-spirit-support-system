// /api/users-management/companies/[companyId]/employees/route.ts
import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import {
    EmployeeListItemDTO,
    EmployeeTableColumn,
    sortableEmployeeFields,
} from "@/types/employee/employee.types";
import {
    EMPLOYEE_STATUS,
    EMPLOYMENT_TYPE,
    SALARY_PAYMENT_MODE,
} from "@/constants/employee.const";

/**
 * Generate a fake EmployeeListItemDTO aligned with employee.types.ts
 */
function generateFakeEmployee(): EmployeeListItemDTO {
    const status = faker.helpers.arrayElement(Object.values(EMPLOYEE_STATUS));
    const employmentType = faker.helpers.arrayElement(Object.values(EMPLOYMENT_TYPE));

    const fullName = faker.person.fullName();
    const email = faker.internet.email();
    const phone = faker.phone.number();
    const createdAt = faker.date.past({ years: 5 }).toISOString();
    const updatedAt = faker.date.recent().toISOString();
    const dateOfJoining = faker.date.past({ years: 5 }).toISOString();
    const dateOfLeaving = faker.datatype.boolean() ? faker.date.recent().toISOString() : undefined;
    const lastLogin = faker.datatype.boolean() ? faker.date.recent().toISOString() : undefined;

    // small derived helpers
    const salary = faker.number.int({ min: 20000, max: 90000 });
    const currency = faker.helpers.arrayElement(["USD", "EUR", "BDT", "GBP"]);

    // optional UI helpers
    const statusBadge = {
        label: String(status),
        tone: status === EMPLOYEE_STATUS.ACTIVE ? "positive" : status === EMPLOYEE_STATUS.ON_LEAVE ? "warning" : "muted",
    } as const;

    const paymentMode = faker.helpers.arrayElement(Object.values(SALARY_PAYMENT_MODE));


    return {
        id: faker.database.mongodbObjectId(),

        // minimal denormalized user fields
        user: {
            name: fullName,
            email,
            phone,
            avatar: faker.image.avatar(),
        },

        // optional IDs
        companyId: faker.datatype.boolean() ? faker.database.mongodbObjectId() : undefined,

        // status & employment
        status,
        employmentType,

        // compensation summary
        salary,
        currency,
        paymentMode,

        // dates
        dateOfJoining,
        dateOfLeaving,

        // contact summary
        contactPhone: phone,
        contactEmail: email,

        // shift summary
        shiftSummary: "09:00–17:00, Mon–Fri",

        lastLogin,

        // documents / avatar (list item keeps avatar on user; keep avatar field for compatibility)
        avatar: faker.datatype.boolean() ? faker.image.avatar() : undefined,

        // computed/derived UI helpers
        statusBadge,

        // admin flags & timestamps
        isDeleted: false,
        createdAt,
        updatedAt,
    };
}


// --- Helper to get sort value ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sortFieldResolvers: Record<EmployeeTableColumn, (e: EmployeeListItemDTO) => any> = {
    "user.name": (e) => e.user.name,
    "user.email": (e) => e.user.email,
    avatar: (e) => e.user.avatar ?? "",
    status: (e) => e.status,
    employmentType: (e) => e.employmentType,
    salary: (e) => e.salary,
    dateOfJoining: (e) => e.dateOfJoining,
    dateOfLeaving: (e) => e.dateOfLeaving,
    createdAt: (e) => e.createdAt,
    updatedAt: (e) => e.updatedAt,
};

function getSortValue(employee: EmployeeListItemDTO, field: EmployeeTableColumn): string | number {
    const value = sortFieldResolvers[field](employee);
    if (["dateOfJoining", "dateOfLeaving", "createdAt", "updatedAt"].includes(field))
        return value ? new Date(value).getTime() : 0;
    return typeof value === "string" ? value.toLowerCase() : value ?? "";
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ companyId: string }> }
) {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    let sort = (searchParams.get("sort") || "createdAt") as EmployeeTableColumn | "createdAt" | "updatedAt";
    const order = (searchParams.get("order") as "asc" | "desc") || "desc";
    const search = searchParams.get("search")?.toLowerCase() || "";

    if (!sortableEmployeeFields.includes(sort as never)) sort = "createdAt";

    // generate a pool of fake employees
    let employees: EmployeeListItemDTO[] = Array.from({ length: 200 }, generateFakeEmployee);

    // simple text search across name, email, phone
    if (search) {
        employees = employees.filter((e) =>
            [e.user.name, e.user.email ?? "", e.contactPhone ?? ""]
                .filter(Boolean)
                .some((v) => v.toLowerCase().includes(search))
        );
    }

    // sort
    employees.sort((a, b) => {
        const aVal = getSortValue(a, sort as EmployeeTableColumn);
        const bVal = getSortValue(b, sort as EmployeeTableColumn);
        if (aVal < bVal) return order === "asc" ? -1 : 1;
        if (aVal > bVal) return order === "asc" ? 1 : -1;
        return 0;
    });

    // paginate
    const total = employees.length;
    const pages = Math.max(1, Math.ceil(total / limit));
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