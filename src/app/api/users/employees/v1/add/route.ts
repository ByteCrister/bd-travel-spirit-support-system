// app/api/users/v1/employees/add/route.ts
import { NextRequest } from "next/server";
import { ClientSession } from "mongoose";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { USER_ROLE } from "@/constants/user.const";
import { EMPLOYEE_STATUS, EMPLOYMENT_TYPE } from "@/constants/employee.const";

// Import models
import UserModel, { IUserDoc } from "@/models/user.model";
import { CreateEmployeePayload } from "@/types/employee.types";
import { Types } from "mongoose";
import { createEmployeeValidationSchema } from "@/utils/validators/employee/employee.validator";
import EmployeeModel, { IEmployee } from "@/models/employees/employees.model";
import ConnectDB from "@/config/db";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { uploadAssets } from "@/lib/cloudinary/upload.cloudinary";
import { cleanupAssets } from "@/lib/cloudinary/delete.cloudinary";
import { buildEmployeeDTO } from "@/lib/build-responses/build-employee-dt";
import { EmployeeWelcome } from "@/lib/html/employee-welcome.html";
import { mailer } from "@/config/node-mailer";
import { ASSET_TYPE } from "@/constants/asset.const";

type ObjectId = Types.ObjectId;

// Type for our validated request body
interface CreateEmployeeRequest extends Omit<CreateEmployeePayload, 'avatar' | 'documents'> {
    avatar: string; // base64 string
    documents: Array<{
        type: string;
        url: string; // base64 string
        uploadedAt: string;
    }>;
}

// Helper function to create user
async function createUser(
    email: string,
    password: string,
    name: string,
    session: ClientSession
): Promise<IUserDoc> {
    const user = new UserModel({
        name,
        email: email.toLowerCase().trim(),
        password,
        role: USER_ROLE.SUPPORT,
    });

    await user.save({ session });
    return user;
}

// Main POST handler
export const POST = withErrorHandler(async (req: NextRequest) => {
    // Parse and validate request body
    const body: CreateEmployeeRequest = await req.json();

    // Validate with Yup schema
    await createEmployeeValidationSchema.validate(body, { abortEarly: false });

    await ConnectDB();

    const result = await withTransaction(async (session) => {
        // 1 Check if user exists
        const email = body.contactInfo.email.toLowerCase().trim();
        const existingUser = await UserModel.findOne({ email }).session(session);

        let userId: ObjectId;
        let existingEmployee: IEmployee | null = null;

        if (existingUser) {
            if (existingUser.role !== USER_ROLE.SUPPORT) {
                throw new ApiError("User exists with a different role", 409);
            }

            userId = existingUser._id as ObjectId;

            // Check if terminated employee exists
            existingEmployee = await EmployeeModel.findOne({ user: userId }).session(session);

            if (existingEmployee?.status !== EMPLOYEE_STATUS.TERMINATED) {
                throw new ApiError("Employee already exists and is not terminated", 409);
            }

            // Update user name if needed
            if (existingUser.name !== body.contactInfo.emergencyContact?.name) {
                existingUser.name = body.contactInfo.emergencyContact?.name || existingUser.name;
                await existingUser.save({ session });
            }
        } else {
            // Create new user
            const name = body.contactInfo.emergencyContact?.name || email.split('@')[0];
            const newUser = await createUser(email, body.password, name, session);
            userId = newUser._id as ObjectId;
        }

        // 2 Upload avatar
        let avatarAssetId: Types.ObjectId | undefined;
        if (body.avatar) {
            const assetIds = await uploadAssets([
                {
                    base64: body.avatar,
                    name: `${body.name}-avatar`,
                    assetType: ASSET_TYPE.IMAGE,
                }
            ], session)

            avatarAssetId = assetIds[0] as ObjectId;
        }

        // 3 Upload documents
        const documentAssets: Array<{ type: string; asset: Types.ObjectId }> = [];
        for (const doc of body.documents) {
            const assetIds = await uploadAssets([
                {
                    base64: doc.url,
                    name: `${doc.type}-document`,
                    assetType: ASSET_TYPE.DOCUMENT
                }
            ], session)
            documentAssets.push({ type: doc.type, asset: assetIds[0] as ObjectId });
        }

        // 4 Prepare employee data
        const employeeData: Partial<IEmployee> = {
            user: userId,
            status: EMPLOYEE_STATUS.ACTIVE,
            employmentType: body.employmentType || EMPLOYMENT_TYPE.FULL_TIME,
            avatar: avatarAssetId,
            salary: body.salary || 0,
            currency: body.currency,
            paymentMode: body.paymentMode,
            dateOfJoining: new Date(body.dateOfJoining),
            contactInfo: {
                phone: body.contactInfo.phone,
                email: body.contactInfo.email,
                emergencyContact: body.contactInfo.emergencyContact,
            },
            shifts: body.shifts || [],
            documents: documentAssets.map((d) => ({ type: d.type, asset: d.asset, uploadedAt: new Date() })),
            notes: body.notes,
        };

        // 5 Restore & update terminated employee
        if (existingEmployee) {
            // Clean previous documents from DB + Cloudinary
            const previousAssetIds = [
                ...existingEmployee.documents.map(d => d.asset),
                ...(existingEmployee.avatar ? [existingEmployee.avatar] : [])
            ];

            await cleanupAssets(previousAssetIds, session);

            // Restore terminated employee
            const restoredEmployee = await EmployeeModel.restoreById(existingEmployee._id as ObjectId, session);
            if (!restoredEmployee) throw new ApiError("Failed to restore terminated employee");

            // Update with new data
            Object.assign(restoredEmployee, employeeData);
            await restoredEmployee.save({ session });

            return { employeeId: restoredEmployee._id, userId };
        }

        // 6 Create new employee
        const newEmployee = new EmployeeModel(employeeData);
        await newEmployee.save({ session });


        return { employeeId: newEmployee._id, userId };
    });

    const employeeDTO = await buildEmployeeDTO(result.employeeId as ObjectId);

    const { subject, html } = EmployeeWelcome(body)

    await mailer(
        body.contactInfo.email,
        subject,
        html
    )

    return {
        data: employeeDTO,
        status: 201
    }

});
