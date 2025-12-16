// app/api/auth/user/employee/route.ts
import { NextResponse } from "next/server";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import EmployeeModel, { IEmployee } from "@/models/employees/employees.model";
import { IEmployeeInfo } from "@/types/current-user.types";
import { Lean } from "@/types/mongoose-lean.types";
import { Types } from "mongoose";
import { EmployeeRole } from "@/constants/employee.const";
import ConnectDB from "@/config/db";

type AssetPopulated = { publicUrl: string };

type PopulatedDocument = {
    type: string;
    url: AssetPopulated;
    uploadedAt: Date;
};

type EmployeePopulated = Lean<IEmployee> & {
    user: { _id: Types.ObjectId; email: string; role: EmployeeRole; createdAt: Date; updatedAt: Date };
    avatar?: AssetPopulated | Types.ObjectId | null;
    documents?: (PopulatedDocument | { type: string; url: Types.ObjectId; uploadedAt: Date })[] | null;
};

// Type guard to check if an ObjectId is populated
function isAssetPopulated(x: unknown): x is AssetPopulated {
    return !!x && typeof (x as AssetPopulated).publicUrl === "string";
}

export async function GET() {
    try {
        await ConnectDB()

        const userId = await getUserIdFromSession();
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const employee = await EmployeeModel.findOne({ user: userId })
            .populate({ path: "user", select: "email role createdAt updatedAt", model: "User" })
            .populate({ path: "avatar", select: "publicUrl", model: "Asset" })
            .populate({ path: "documents.url", select: "publicUrl", model: "Asset" })
            .lean<EmployeePopulated>()
            .exec();

        if (!employee) {
            return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 });
        }

        // Map documents safely
        const documents = employee.documents?.map((d) => {
            const urlField = d.url;
            return {
                type: d.type,
                url: isAssetPopulated(urlField) ? urlField.publicUrl : "",
                uploadedAt: d.uploadedAt?.toISOString(),
            };
        }) ?? [];

        // Build employee info response
        const employeeInfo: IEmployeeInfo = {
            id: (employee._id as Types.ObjectId).toString(),
            userId: employee.user._id.toString(),
            avatar: isAssetPopulated(employee.avatar) ? employee.avatar.publicUrl : undefined,
            role: employee.role,
            employmentType: employee.employmentType,
            salaryHistory: employee.salaryHistory?.map((s) => ({
                amount: s.amount,
                currency: s.currency,
                effectiveFrom: s.effectiveFrom.toISOString(),
                effectiveTo: s.effectiveTo?.toISOString(),
                reason: s.reason,
            })) ?? [],
            salary: employee.salary,
            currency: employee.currency,
            dateOfJoining: employee.dateOfJoining.toISOString(),
            contactInfo: employee.contactInfo,
            shifts: employee.shifts?.map((s) => ({
                startTime: s.startTime,
                endTime: s.endTime,
                days: s.days,
            })) ?? [],
            documents,
            lastLogin: employee.lastLogin?.toISOString(),
            createdAt: employee.createdAt.toISOString(),
            updatedAt: employee.updatedAt.toISOString(),
        };

        return NextResponse.json({ success: true, data: employeeInfo });
    } catch (err) {
        console.error("GET /api/auth/user/employee error:", err);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}