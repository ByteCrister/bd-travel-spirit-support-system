// app/api/employees/[employeeId]/update-password/route.js
import { NextRequest } from "next/server";
import mongoose from "mongoose";
import * as yup from "yup";
import EmployeeModel, { IEmployee } from "@/models/employees/employees.model";
import ConnectDB from "@/config/db";
import { Types } from "mongoose";
import { EMPLOYEE_STATUS } from "@/constants/employee.const";
import { IUserDoc } from "@/models/user.model";
import { USER_ROLE } from "@/constants/user.const";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { notifyEmployeeNewPassword } from "@/lib/html/notify-new-password.html";
import { mailer } from "@/config/node-mailer";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";

type ObjectId = Types.ObjectId;

export type EmployeeLeanPopulated =
    Omit<IEmployee,
        | "user"
    > & {
        _id: ObjectId;
        user: IUserDoc;
    };

export const PUT = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ employeeId: string }> }) => {

    const adminId = await getUserIdFromSession();

    if (!adminId || !Types.ObjectId.isValid(adminId)) {
        throw new ApiError("Unauthorized", 401);
    }

    const employeeId = resolveMongoId((await params).employeeId);

    // validate id
    if (!employeeId || !mongoose.Types.ObjectId.isValid(employeeId)) {
        throw new ApiError("Invalid employee id", 400)
    }

    const body = await request.json();
    const { password, sendMail } = body;

    if (!password || typeof password !== "string" || password.trim().length < 8) {
        throw new ApiError("Password is required and must be at least 8 characters", 400)
    }

    try {
        await yup
            .string()
            .trim()
            .min(8, "Password must be at least 8 characters")
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                "Password must contain uppercase, lowercase and number"
            )
            .validate(password);
    } catch (err) {
        if (err instanceof yup.ValidationError) {
            throw new ApiError(err.message, 400);
        }
        throw err;
    }

    await ConnectDB()

    await VERIFY_USER_ROLE.ADMIN(adminId);

    // Load employee and populate user reference (we need the actual user doc to save)
    const rawEmployee = await EmployeeModel.findById(employeeId).populate("user").exec();
    const employee = rawEmployee as unknown as EmployeeLeanPopulated;

    if (!employee) {
        throw new ApiError("Employee not found", 404)
    }

    // Check terminated status
    // Adjust the status check if your schema uses different values/field name
    if (String(employee.status).toLowerCase() === EMPLOYEE_STATUS.TERMINATED) {
        throw new ApiError("Cannot update password for a terminated employee", 403)
    }

    const userDoc = employee.user;
    if (!userDoc) {
        throw new ApiError("User linked to employee not found", 404)
    }

    if (userDoc.role !== USER_ROLE.SUPPORT) {
        throw new ApiError("Employee is not a member of Support team", 403)
    }

    // Set new password; hashing should happen in User schema pre('save') hook
    userDoc.password = password;

    // Save user doc (pre-save hook will hash password)
    await userDoc.save();

    // notify to the employee about the new password only if admin checked to send it
    if (sendMail) {
        const html = notifyEmployeeNewPassword(employee.user.name, employee.user.email, password)
        await mailer(employee.user.email, "Password has been updated!!", html)
    }

    return { data: { message: "Password updated successfully" }, status: 200 }

})
