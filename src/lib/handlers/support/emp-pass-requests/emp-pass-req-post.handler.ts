// api/support/employee-password-requests/v1

import { NextRequest } from "next/server";
import { ApiError } from "@/lib/helpers/withErrorHandler";
import ConnectDB from "@/config/db";

import ResetPasswordRequestModel from "@/models/employees/reset-password-request.model";
import UserModel from "@/models/user.model";
import EmployeeModel from "@/models/employees/employees.model";
import { REQUEST_STATUS } from "@/constants/reset-password-request.const";
import { authRateLimit } from "@/lib/upstash-redis/auth-rate-limit";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { USER_ROLE } from "@/constants/user.const";
import { Types } from "mongoose";
import { getOwnerId } from "@/lib/helpers/get-owner-id";
import { SupportSystemNotificationModel } from "@/models/notifications/support-system-notification.model";
import { ADMIN_NOTIFICATION_PRIORITY, ADMIN_NOTIFICATION_TYPE } from "@/constants/support-system-notification.const";
import { getCollectionName } from "@/lib/helpers/get-collection-name";
import { triggerSocketEvent } from "@/socket/triggerSocketEvent";
import { SOCKET_TRIGGERS } from "@/constants/socket.const";

interface ForgotPasswordRequestBody {
    email: string;
    description?: string;
}

export default async function EmpPassReqPostHandler(req: NextRequest) {

    const body: ForgotPasswordRequestBody = await req.json();
    const email = body.email?.trim().toLowerCase();
    const description = body.description?.trim();

    /* ----------------------------------------
       VALIDATION
    ----------------------------------------- */

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        throw new ApiError("Invalid email address", 400);
    }

    /* ----------------------------------------
    RATE LIMIT (per email)
    ----------------------------------------- */

    const allowed = await authRateLimit({
        identifier: email,
        limit: 5,
        window: 60,
    });

    if (!allowed) {
        throw new ApiError(
            "Too many requests. Please try again later.",
            429
        );
    }

    /* ----------------------------------------
    TRANSACTION
    ----------------------------------------- */

    await ConnectDB();

    const result = await withTransaction(async (session) => {
        /* ----------------------------------------
           USER LOOKUP
        ----------------------------------------- */

        const user = await UserModel.findOne({ email, role: { $in: [USER_ROLE.SUPPORT] } }) // only for "support" members
            .select("_id role")
            .session(session);

        if (!user) {
            // Prevent email enumeration
            return {
                message:
                    "If an account exists, your request has been submitted.",
            };
        }

        /* ----------------------------------------
           EMPLOYEE LOOKUP (OPTIONAL)
        ----------------------------------------- */

        const employee = await EmployeeModel.findOne({ user: user._id })
            .select("_id")
            .session(session)
            .lean();

        if (!employee) {
            // Prevent email enumeration
            return {
                message:
                    "If an account exists, your request has been submitted.",
            };
        }

        /* ----------------------------------------
           DUPLICATE PENDING CHECK
        ----------------------------------------- */

        const existingRequest =
            await ResetPasswordRequestModel.findOne({
                user: user._id,
                status: REQUEST_STATUS.PENDING,
            }).session(session);

        if (existingRequest) {
            throw new ApiError(
                "You already have a pending password reset request.",
                400
            );
        }

        /* ----------------------------------------
           METADATA
        ----------------------------------------- */

        const xForwardedFor = req.headers.get("x-forwarded-for");
        const ip = xForwardedFor
            ? xForwardedFor.split(",")[0].trim()
            : undefined;

        const agent = req.headers.get("user-agent") || undefined;

        /* ----------------------------------------
           CREATE REQUEST
        ----------------------------------------- */

        const resetRequest =
            await ResetPasswordRequestModel.createRequest(
                {
                    userId: user._id as Types.ObjectId,
                    employeeId: employee._id as Types.ObjectId,
                    description,
                    ip,
                    agent,
                },
                session
            );

        const doc = Array.isArray(resetRequest)
            ? resetRequest[0]
            : resetRequest;


        /*
        * (1) Create a  support system notification for the admin
        */
        // Retrieve the owner (admin) so we can target the notification & socket event
        const ownerId = await getOwnerId();

        if (ownerId) {
            try {
                const notification = await SupportSystemNotificationModel.create({
                    type: ADMIN_NOTIFICATION_TYPE.SUPPORT_EMP_FORGOT_PASSWORD,
                    title: "Support employee password reset request",
                    message: `Employee with email ${email} has requested a password reset.${description ? ` Reason: ${description}` : ""}`,
                    priority: ADMIN_NOTIFICATION_PRIORITY.HIGH,
                    relatedModel: getCollectionName(ResetPasswordRequestModel),
                    relatedId: result.requestId,
                    meta: {
                        email,
                        description,
                    },
                });

                /*
                 * (2) Push a real‑time socket event to the room - main admin dashboard
                 */
                await triggerSocketEvent({
                    ownerId: ownerId.toString(),
                    userId: undefined,
                    type: SOCKET_TRIGGERS.SUPPORT_EMP_FORGOT_PASSWORD,
                    data: notification.toObject(),
                });
            } catch (error) {
                // Log but do not fail the request – notification is not critical for the user
                console.error("Failed to create notification or trigger socket event:", error);
            }
        }

        return {
            message: "Your password reset request has been submitted.",
            requestId: (doc._id as Types.ObjectId).toString(),
        };
    });

    return {
        data: result,
        status: 201,
    };
}