// lib/build-responses/build-employee-dt.ts
import { Types } from "mongoose";
import AuditModel from "@/models/audit.model";
import "@/models/assets/asset.model"; // for populate
import EmployeeModel, { IEmployee } from "@/models/employees/employees.model";
import { AuditLog } from "@/types/current-user.types";
import { ContactInfoDTO, DocumentDTO, EmployeeDetailDTO, PayrollRecordDTO, SalaryHistoryDTO, UserSummaryDTO, CurrentMonthPaymentStatusDTO } from "@/types/employee.types";
import { UserRole } from "@/constants/user.const";
import { ClientSession } from "mongoose";
import { PopulatedAssetLean } from "@/types/populated-asset.types";
import { PAYROLL_STATUS, PayrollStatus } from "@/constants/employee.const";

type ObjectId = Types.ObjectId;

interface IUserLean {
    _id: ObjectId;
    name: string;
    email: string;
    role: UserRole
}

interface IEmployeeDocumentLean {
    type: string;
    asset: PopulatedAssetLean;
    uploadedAt: Date;
}

type EmployeeLeanPopulated =
    Omit<IEmployee,
        | "user"
        | "avatar"
        | "documents"
    > & {
        _id: ObjectId;
        user: IUserLean;
        avatar?: PopulatedAssetLean;
        documents: IEmployeeDocumentLean[];
    };

/**
 * Calculate current month payment status for an employee
 */
function calculateCurrentMonthPaymentStatus(
    dateOfJoining: Date,
    salary: number,
    currency: string,
    payroll: IEmployee["payroll"] = []
): CurrentMonthPaymentStatusDTO | undefined {
    const today = new Date();
    const joiningDate = new Date(dateOfJoining);

    // Reset times for accurate day calculation
    joiningDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // Calculate days since joining
    const timeDiff = today.getTime() - joiningDate.getTime();
    const daysSinceJoining = Math.floor(timeDiff / (1000 * 3600 * 24));

    // Calculate current cycle number (30-day cycles)
    const currentCycle = Math.floor(daysSinceJoining / 30);

    // Calculate which month and year this payment cycle corresponds to
    const cycleDate = new Date(joiningDate);
    cycleDate.setDate(cycleDate.getDate() + (currentCycle * 30));

    const currentYear = cycleDate.getFullYear();
    const currentMonth = cycleDate.getMonth() + 1; // 1-12

    // Calculate next due date (next cycle)
    const dueDate = new Date(joiningDate);
    dueDate.setDate(dueDate.getDate() + ((currentCycle + 1) * 30));

    // Find payroll record for current cycle month/year
    const currentMonthRecord = payroll.find(
        (record) => record.year === currentYear && record.month === currentMonth
    );

    // Determine status
    let status: PayrollStatus = PAYROLL_STATUS.PENDING;
    let attemptedAt: string | undefined;
    let paidAt: string | undefined;
    let transactionRef: string | undefined;
    let failureReason: string | undefined;

    if (currentMonthRecord) {
        status = currentMonthRecord.status;
        attemptedAt = currentMonthRecord.attemptedAt?.toISOString();
        paidAt = currentMonthRecord.paidAt?.toISOString();
        transactionRef = currentMonthRecord.transactionRef;
        failureReason = currentMonthRecord.failureReason;
    } else {
        // If no record exists but payment is due, it's pending
        if (daysSinceJoining >= currentCycle * 30) {
            status = PAYROLL_STATUS.PENDING;
        }
        // If not yet due, still show as pending (not yet processed)
    }

    return {
        status,
        amount: salary,
        currency,
        dueDate: dueDate.toISOString(),
        attemptedAt,
        paidAt,
        transactionRef,
        failureReason,
    };
}

/**
 * Build EmployeeDetailDTO array from multiple employeeIds
 */
export async function buildEmployeeDTO(
    employeeId: ObjectId,
    withDeleted = false,
    session?: ClientSession,
): Promise<EmployeeDetailDTO | null> {
    if (!employeeId) throw new Error("employeeId is required");

    const baseQuery = withDeleted
        ? EmployeeModel.findOneWithDeleted({ _id: employeeId }).session(session ?? null)
        : EmployeeModel.findById(employeeId).session(session ?? null);

    const rawEmployee = await baseQuery
        .slice("salaryHistory", -10)
        .populate({ path: "user", select: "name email role" })
        .populate({
            path: "avatar",
            select: "file deletedAt",
            populate: { path: "file", select: "publicUrl" },
            ...(withDeleted ? {} : { match: { deletedAt: null } }),
        })
        .populate({
            path: "documents.asset",
            select: "file deletedAt",
            populate: { path: "file", select: "publicUrl" },
            ...(withDeleted ? {} : { match: { deletedAt: null } }),
        })
        .lean()
        .exec();

    if (!rawEmployee) return null;

    const employee = rawEmployee as unknown as EmployeeLeanPopulated;
    const user = employee.user;

    /* ---------------------------------- */
    /* Asset map (safe)                   */
    /* ---------------------------------- */
    const assetMap = new Map<string, string>();

    if (employee.avatar?.file?._id && employee.avatar.file?.publicUrl) {
        assetMap.set(employee.avatar?.file?._id.toString(), employee.avatar.file.publicUrl);
    }

    for (const doc of employee.documents || []) {
        if (doc.asset?.file?._id && doc.asset.file.publicUrl) {
            assetMap.set(doc.asset.file._id.toString(), doc.asset.file.publicUrl);
        }
    }

    /* ---------------------------------- */
    /* Documents DTO (skip missing asset) */
    /* ---------------------------------- */
    const documents: DocumentDTO[] = (employee.documents || [])
        .filter((d) => d.asset?.file?._id && assetMap.has(d.asset.file._id.toString()))
        .map((doc) => ({
            type: doc.type,
            url: assetMap.get((doc.asset?.file?._id as Types.ObjectId).toString())!,
            uploadedAt: doc.uploadedAt.toISOString(),
        }));

    /* ---------------------------------- */
    /* Salary history                     */
    /* ---------------------------------- */
    const salaryHistory: SalaryHistoryDTO[] = (employee.salaryHistory || []).map((s) => ({
        amount: s.amount,
        currency: s.currency,
        effectiveFrom: s.effectiveFrom.toISOString(),
        effectiveTo: s.effectiveTo?.toISOString(),
        reason: s.reason,
    }));

    /* ---------------------------------- */
    /* Payroll                            */
    /* ---------------------------------- */
    const payroll: PayrollRecordDTO[] = (employee.payroll || []).map((p) => ({
        year: p.year,
        month: p.month,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        attemptedAt: p.attemptedAt?.toISOString(),
        paidAt: p.paidAt?.toISOString(),
        failureReason: p.failureReason,
        transactionRef: p.transactionRef,
    }));

    /* ---------------------------------- */
    /* Current Month Payment Status       */
    /* ---------------------------------- */
    const currentMonthPayment = calculateCurrentMonthPaymentStatus(
        employee.dateOfJoining,
        employee.salary,
        employee.currency,
        employee.payroll || []
    );

    /* ---------------------------------- */
    /* Contact info                       */
    /* ---------------------------------- */
    const contactInfo: ContactInfoDTO = {
        phone: employee.contactInfo.phone,
        email: employee.contactInfo.email ?? "",
        emergencyContact: employee.contactInfo.emergencyContact
            ? {
                name: employee.contactInfo.emergencyContact.name,
                phone: employee.contactInfo.emergencyContact.phone,
                relation: employee.contactInfo.emergencyContact.relation,
            }
            : { name: "", phone: "", relation: "" },
    };

    /* ---------------------------------- */
    /* Audit logs                         */
    /* ---------------------------------- */
    const auditsRaw = await AuditModel.getRecentForTarget("Employee", employee._id, 10);
    const audit: AuditLog[] = (auditsRaw || []).map((a) => ({
        _id: (a._id as Types.ObjectId).toString(),
        target: a.target.toString(),
        targetModel: a.targetModel,
        actor: a.actor?.toString(),
        actorModel: a.actorModel,
        action: a.action,
        note: a.note,
        ip: a.ip,
        userAgent: a.userAgent,
        changes: a.changes,
        createdAt: a.createdAt.toISOString(),
    }));

    /* ---------------------------------- */
    /* User summary                       */
    /* ---------------------------------- */
    const avatarUrl = employee.avatar?.file?._id
        ? assetMap.get(employee.avatar.file._id.toString())
        : undefined;

    const userSummary: UserSummaryDTO = {
        name: user?.name ?? "",
        email: user?.email ?? "",
        phone: employee.contactInfo.phone,
        avatar: avatarUrl,
    };

    /* ---------------------------------- */
    /* Final DTO                          */
    /* ---------------------------------- */
    return {
        id: employee._id.toString(),
        userId: user?._id?.toString(),
        companyId: employee.companyId?.toString(),
        user: userSummary,
        status: employee.status,
        employmentType: employee.employmentType,
        salary: employee.salary,
        currency: employee.currency,
        paymentMode: employee.paymentMode,
        currentMonthPayment, // Added current month payment status
        salaryHistory,
        dateOfJoining: employee.dateOfJoining.toISOString(),
        dateOfLeaving: employee.dateOfLeaving?.toISOString(),
        lastLogin: employee.lastLogin?.toISOString(),
        contactInfo,
        payroll,
        shifts: employee.shifts,
        documents,
        audit,
        avatar: avatarUrl, // URL, not ID
        notes: employee.notes,
        isDeleted: !!employee.deletedAt,
        createdAt: employee.createdAt.toISOString(),
        updatedAt: employee.updatedAt.toISOString(),
    };
}