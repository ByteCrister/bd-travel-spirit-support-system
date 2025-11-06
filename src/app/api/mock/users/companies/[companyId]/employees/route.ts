// /api/users-management/companies/[companyId]/employees/route.ts
import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import {
    EmployeeListItemDTO,
    EmployeeTableColumn,
    sortableEmployeeFields,
} from "@/types/employee.types";
import {
    // EMPLOYEE_ROLE,
    EMPLOYEE_SUB_ROLE,
    EMPLOYEE_STATUS,
    EMPLOYMENT_TYPE,
    EMPLOYEE_POSITIONS,
} from "@/constants/employee.const";

function generateFakeEmployee(): EmployeeListItemDTO {
    // const role = faker.helpers.arrayElement(Object.values(EMPLOYEE_ROLE));
    const subRole = faker.helpers.arrayElement(Object.values(EMPLOYEE_SUB_ROLE));
    const status = faker.helpers.arrayElement(Object.values(EMPLOYEE_STATUS));
    const employmentType = faker.helpers.arrayElement(Object.values(EMPLOYMENT_TYPE));
    const positionCategory = faker.helpers.arrayElement(Object.keys(EMPLOYEE_POSITIONS)) as keyof typeof EMPLOYEE_POSITIONS;
    const position = faker.helpers.arrayElement(EMPLOYEE_POSITIONS[positionCategory]);

    const fullName = faker.person.fullName();
    const email = faker.internet.email();
    const phone = faker.phone.number();

    return {
        id: faker.database.mongodbObjectId(),
        user: {
            name: fullName,
            email,
            phone,
            avatar: faker.image.avatar(),
        },
        subRole,
        position,
        status,
        employmentType,
        salary: faker.number.int({ min: 20000, max: 90000 }),
        salaryCurrency: "USD",
        dateOfJoining: faker.date.past().toISOString(),
        dateOfLeaving: faker.datatype.boolean()
            ? faker.date.recent().toISOString()
            : undefined,
        contactPhone: phone,
        contactEmail: email,
        rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
        shiftSummary: "09:00–17:00, Mon–Fri",
        isDeleted: false,
        createdAt: faker.date.past().toISOString(),
        updatedAt: faker.date.recent().toISOString(),
    };
}

// --- Helper to get sort value ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sortFieldResolvers: Record<EmployeeTableColumn, (e: EmployeeListItemDTO) => any> = {
    "user.name": (e) => e.user.name,
    "user.email": (e) => e.user.email,
    subRole: (e) => e.subRole,
    position: (e) => e.position,
    status: (e) => e.status,
    employmentType: (e) => e.employmentType,
    salary: (e) => e.salary,
    rating: (e) => e.rating,
    dateOfJoining: (e) => e.dateOfJoining,
    dateOfLeaving: (e) => e.dateOfLeaving,
    createdAt: (e) => e.createdAt,
    updatedAt: (e) => e.updatedAt,
};

function getSortValue(
    employee: EmployeeListItemDTO,
    field: EmployeeTableColumn
): string | number {
    const value = sortFieldResolvers[field](employee);
    if (["dateOfJoining", "dateOfLeaving", "createdAt", "updatedAt"].includes(field))
        return value ? new Date(value).getTime() : 0;
    return typeof value === "string" ? value.toLowerCase() : value ?? "";
}

export async function GET(
    req: Request,
    { params }: { params: { companyId: string } }
) {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    let sort = (searchParams.get("sort") ||
        "createdAt") as EmployeeTableColumn | "createdAt" | "updatedAt";
    const order = (searchParams.get("order") as "asc" | "desc") || "desc";
    const search = searchParams.get("search")?.toLowerCase() || "";

    if (!sortableEmployeeFields.includes(sort as never)) sort = "createdAt";

    let employees: EmployeeListItemDTO[] = Array.from(
        { length: 200 },
        generateFakeEmployee
    );

    if (search) {
        employees = employees.filter((e) =>
            [
                e.user.name,
                e.position,
                e.user.email ?? "",
                e.contactPhone ?? "",
            ]
                .filter(Boolean)
                .some((v) => v.toLowerCase().includes(search))
        );
    }

    employees.sort((a, b) => {
        const aVal = getSortValue(a, sort);
        const bVal = getSortValue(b, sort);
        if (aVal < bVal) return order === "asc" ? -1 : 1;
        if (aVal > bVal) return order === "asc" ? 1 : -1;
        return 0;
    });

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
