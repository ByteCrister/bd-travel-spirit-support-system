import { Types } from "mongoose";
import AuditModel from "@/models/audit.model";
import "@/models/asset.model"; // for populate and 
import EmployeeModel, { IEmployee } from "@/models/employees/employees.model";
import { AuditLog } from "@/types/current-user.types";
import { ContactInfoDTO, DocumentDTO, EmployeeDetailDTO, PayrollRecordDTO, SalaryHistoryDTO, UserSummaryDTO } from "@/types/employee.types";
import { UserRole } from "@/constants/user.const";
import { ClientSession } from "mongoose";


type ObjectId = Types.ObjectId;

export interface IUserLean {
    _id: ObjectId;
    name: string;
    email: string;
    role: UserRole
}

export interface IAssetLean {
    _id: ObjectId;
    publicUrl: string;
}

export interface IEmployeeDocumentLean {
    type: string;
    asset: IAssetLean;
    uploadedAt: Date;
}

export type EmployeeLeanPopulated =
    Omit<IEmployee,
        | "user"
        | "avatar"
        | "documents"
    > & {
        _id: ObjectId;
        user: IUserLean;
        avatar?: IAssetLean;
        documents: IEmployeeDocumentLean[];
    };


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
            select: "publicUrl deletedAt",
            ...(withDeleted ? {} : { match: { deletedAt: null } }),
        })
        .populate({
            path: "documents.asset",
            select: "publicUrl deletedAt",
            ...(withDeleted ? {} : { match: { deletedAt: null } }),
        })
        .lean()
        .exec();

    if (!rawEmployee) return null;

    const employee = rawEmployee as unknown as EmployeeLeanPopulated;
    const user = employee.user;

    /* ---------------------------------- */
    /* Asset map (safe)                    */
    /* ---------------------------------- */
    const assetMap = new Map<string, string>();

    if (employee.avatar?._id && employee.avatar.publicUrl) {
        assetMap.set(employee.avatar._id.toString(), employee.avatar.publicUrl);
    }

    for (const doc of employee.documents || []) {
        if (doc.asset?._id && doc.asset.publicUrl) {
            assetMap.set(doc.asset._id.toString(), doc.asset.publicUrl);
        }
    }

    /* ---------------------------------- */
    /* Documents DTO (skip missing asset) */
    /* ---------------------------------- */
    const documents: DocumentDTO[] = (employee.documents || [])
        .filter((d) => d.asset?._id && assetMap.has(d.asset._id.toString()))
        .map((doc) => ({
            type: doc.type,
            url: assetMap.get(doc.asset._id.toString())!,
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
        paidBy: p.paidBy?.toString(),
    }));

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
    const avatarUrl = employee.avatar?._id
        ? assetMap.get(employee.avatar._id.toString())
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