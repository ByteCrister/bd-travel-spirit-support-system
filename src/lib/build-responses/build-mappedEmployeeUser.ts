import { USER_ROLE } from "@/constants/user.const";
import { IEmployeeInfo } from "@/types/current-user.types";
import { EmployeeDetailDTO } from "@/types/employee.types";

export default function mappedEmployeeUser(dto: EmployeeDetailDTO): IEmployeeInfo {
    return {
        id: dto.id,
        fullName: dto.user.name,
        email: dto.user.email,
        role: USER_ROLE.SUPPORT,
        phone: dto.user.phone ?? '-',
        avatar: dto.user.avatar,

        employmentType: dto.employmentType,

        salary: dto.salary,
        currency: dto.currency,
        salaryHistory: dto.salaryHistory,
        paymentMode: dto.paymentMode,
        currentMonthPayment: dto.currentMonthPayment,

        dateOfJoining: dto.dateOfJoining,
        dateOfLeaving: dto.dateOfLeaving,
        lastLogin: dto.lastLogin,

        contactInfo: dto.contactInfo,
        payroll: dto.payroll,
        shifts: dto.shifts,
        documents: dto.documents,

        notes: dto.notes,
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt,
    }
}