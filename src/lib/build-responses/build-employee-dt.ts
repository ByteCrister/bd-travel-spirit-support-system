import { Types } from "mongoose";
import AuditModel from "@/models/audit.model";
import EmployeeModel, { IEmployee } from "@/models/employees/employees.model";
import { AuditLog } from "@/types/current-user.types";
import { ContactInfoDTO, DocumentDTO, EmployeeDetailDTO, PayrollRecordDTO, SalaryHistoryDTO, UserSummaryDTO } from "@/types/employee.types";


type ObjectId = Types.ObjectId;

export interface IUserLean {
    _id: ObjectId;
    name: string;
    email: string;
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
    employeeId: ObjectId
): Promise<EmployeeDetailDTO | null> {
    if (!employeeId) throw new Error("employeeId is required");

    // 1. Fetch employee with populated user and avatar + document asset IDs
    const rawEmployee = await EmployeeModel.findById(employeeId)
        .populate({ path: "user", select: "name email" })
        .populate("avatar")
        .populate("documents.asset")
        .lean()
        .exec();

    if (!rawEmployee) return null;

    const employee = rawEmployee as unknown as EmployeeLeanPopulated;
    const user = employee.user;

    // 2. Map asset URLs
    const assetMap = new Map<string, string>();
    if (employee.avatar?._id) assetMap.set(employee.avatar._id.toString(), employee.avatar.publicUrl);
    (employee.documents || []).forEach((doc) => {
        if (doc.asset?._id) assetMap.set(doc.asset._id.toString(), doc.asset.publicUrl);
    });

    // 3. Map documents
    const documents: DocumentDTO[] = (employee.documents || []).map((doc) => ({
        type: doc.type,
        url: doc.asset ? assetMap.get(doc.asset._id.toString()) || "" : "",
        uploadedAt: doc.uploadedAt.toISOString(),
    }));

    // 4. Map salary history to DTO
    const salaryHistory: SalaryHistoryDTO[] = (employee.salaryHistory || []).map((s) => ({
        amount: s.amount,
        currency: s.currency,
        effectiveFrom: s.effectiveFrom.toISOString(),
        effectiveTo: s.effectiveTo?.toISOString(),
        reason: s.reason,
    }));

    // 5. Map payroll to DTO
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

    // 6. Map contact info to DTO
    const contactInfo: ContactInfoDTO = {
        phone: employee.contactInfo.phone,
        email: employee.contactInfo.email || "", // ensure string
        emergencyContact: employee.contactInfo.emergencyContact
            ? {
                name: employee.contactInfo.emergencyContact.name,
                phone: employee.contactInfo.emergencyContact.phone,
                relation: employee.contactInfo.emergencyContact.relation,
            }
            : { name: "", phone: "", relation: "" }, // provide defaults if missing
    };

    // 7. Map audits
    const auditsRaw = await AuditModel.getRecentForTarget("Employee", employee._id);
    const audit: AuditLog[] = (auditsRaw || []).map((a) => ({
        _id: (a._id as ObjectId).toString(),
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

    // 8. Build user summary
    const userSummary: UserSummaryDTO = {
        name: user?.name ?? "",
        email: user?.email ?? "",
        phone: employee?.contactInfo.phone,
        avatar: employee.avatar ? assetMap.get(employee.avatar._id.toString()) : undefined,
    };

    // 9. Construct final DTO
    const dto: EmployeeDetailDTO = {
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
        avatar: employee.avatar?._id.toString(),
        notes: employee.notes,
        isDeleted: !!employee.deletedAt,
        createdAt: employee.createdAt.toISOString(),
        updatedAt: employee.updatedAt.toISOString(),
    };

    return dto;
}