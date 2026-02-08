// app/users-management/employees/route.ts
import { NextRequest, NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import {
  EmployeeListItemDTO,
  EmployeesListResponse,
} from "@/types/employee/employee.types";
import {
  EMPLOYEE_STATUS,
  EmployeeStatus,
  EMPLOYMENT_TYPE,
  EmploymentType,
  SALARY_PAYMENT_MODE,
  SalaryPaymentMode,
} from "@/constants/employee.const";
import { CURRENCY } from "@/constants/tour.const";
import { calculateCurrentMonthPayment } from "@/lib/helpers/payment-calculator";

/**
 * Generate a single fake employee list item
 */
function generateEmployee(id: string): EmployeeListItemDTO {
  // Salary & position summaries
  const salary = faker.number.int({ min: 20000, max: 120000 });
  const salaryCurrency = CURRENCY.BDT;
  const status = faker.helpers.arrayElement(
    Object.values(EMPLOYEE_STATUS)
  ) as EmployeeStatus;
  const dateOfJoining = faker.date.past();
  const paymentMode = faker.helpers.arrayElement(
    Object.values(SALARY_PAYMENT_MODE)
  ) as SalaryPaymentMode;

  // Calculate current month payment status
  const currentMonthPayment = calculateCurrentMonthPayment(
    dateOfJoining.toISOString(),
    salary,
    salaryCurrency,
    paymentMode
  );

  // Map status to badge tone
  const statusToneMap: Record<
    EmployeeStatus,
    "positive" | "warning" | "danger" | "muted"
  > = {
    active: "positive",
    onLeave: "warning",
    suspended: "danger",
    terminated: "muted",
  };

  return {
    id,
    companyId: faker.database.mongodbObjectId(),
    user: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      avatar: faker.image.avatar(),
    },

    status: status,
    employmentType: faker.helpers.arrayElement(
      Object.values(EMPLOYMENT_TYPE)
    ) as EmploymentType,

    salary,
    currency: salaryCurrency,
    paymentMode: paymentMode,

    // Add current month payment status
    currentMonthPayment: {
      ...currentMonthPayment,
      // Add optional transaction details randomly
      attemptedAt: faker.datatype.boolean(0.3)
        ? faker.date.recent().toISOString()
        : undefined,
      paidAt: faker.datatype.boolean(0.2)
        ? faker.date.recent().toISOString()
        : undefined,
      transactionRef: faker.datatype.boolean(0.2)
        ? `txn_${faker.string.alphanumeric(12)}`
        : undefined,
      failureReason: faker.datatype.boolean(0.1)
        ? faker.helpers.arrayElement([
            "Insufficient funds",
            "Bank account closed",
            "Network error",
          ])
        : undefined,
    },

    dateOfJoining: dateOfJoining.toISOString(),
    dateOfLeaving: faker.datatype.boolean(0.2)
      ? faker.date.future().toISOString()
      : undefined,
    lastLogin: faker.datatype.boolean(0.7)
      ? faker.date.recent().toISOString()
      : undefined,

    contactPhone: faker.phone.number(),
    contactEmail: faker.internet.email(),

    shiftSummary: "09:00–17:00, Mon–Fri",

    avatar: faker.datatype.boolean(0.6)
      ? faker.database.mongodbObjectId()
      : undefined,
    statusBadge: {
      label: status.charAt(0).toUpperCase() + status.slice(1),
      tone: statusToneMap[status],
    },

    isDeleted: faker.datatype.boolean(0.1),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  };
}

/**
 * GET /users-management/employees
 * Returns a paginated mock list of employees
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);

  const docs: EmployeeListItemDTO[] = Array.from({ length: limit }, () =>
    generateEmployee(faker.database.mongodbObjectId())
  );

  const response: EmployeesListResponse = {
    docs,
    total: 200,
    page,
    pages: Math.ceil(200 / limit),
  };

  return NextResponse.json({
    ok: true,
    data: response,
  });
}