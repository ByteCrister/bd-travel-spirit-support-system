import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import ConnectDB from "@/config/db";
import EmployeeModel from "@/models/employees/employees.model";
import StripePaymentAccountModel from "@/models/payments/payment-account.model";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";
import { AUDIT_ACTION, logAuditBestEffort } from "@/lib/audit/audit-logger";
import { PAYMENT_OWNER_TYPE, PAYMENT_PURPOSE } from "@/constants/payment.const";
import verifyAndAttachPaymentMethod from "@/lib/payments/verify-and-attatch-payment-method.service";
import { PaymentCardDTO } from "@/types/employee/employee.types";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";

interface Params {
    params: Promise<{ employeeId: string }>;
}

export const PUT = withErrorHandler(async (req: NextRequest, { params }: Params) => {
    const employeeId = resolveMongoId((await params).employeeId);
    if (!Types.ObjectId.isValid(employeeId)) {
        throw new ApiError("Invalid employeeId", 400);
    }

    const { stripeCustomerId, stripePaymentMethodId } = await req.json();
    if (!stripeCustomerId || !stripePaymentMethodId) {
        throw new ApiError("stripeCustomerId and stripePaymentMethodId are required", 400);
    }

    const actorId = await getUserIdFromSession();
    if (!actorId) throw new ApiError("Unauthorized", 401);
    await VERIFY_USER_ROLE.ADMIN(actorId);

    await ConnectDB();

    const result = await withTransaction(async (session) => {
        // 1. Get employee and its user
        const employee = await EmployeeModel.findById(employeeId).session(session).populate("user");
        if (!employee) throw new ApiError("Employee not found", 404);

        const userId = employee.user._id;

        // 2. Verify & attach payment method with Stripe
        const cardDetails = await verifyAndAttachPaymentMethod(stripeCustomerId, stripePaymentMethodId);

        // 3. Create or update payment account
        let paymentAccount = await StripePaymentAccountModel.findOne({
            ownerId: userId,
            purpose: PAYMENT_PURPOSE.TRANSACTION_ACCOUNT,
        }).session(session);

        if (paymentAccount) {
            paymentAccount.stripeCustomerId = stripeCustomerId;
            paymentAccount.stripePaymentMethodId = stripePaymentMethodId;
            paymentAccount.card = {
                brand: cardDetails.brand as PaymentCardDTO["brand"],
                last4: cardDetails.last4,
                expMonth: cardDetails.expMonth,
                expYear: cardDetails.expYear,
            };
            paymentAccount.isActive = true;
            await paymentAccount.save({ session });
        } else {
            paymentAccount = new StripePaymentAccountModel({
                ownerType: PAYMENT_OWNER_TYPE.SUPPORT,
                ownerId: userId,
                purpose: PAYMENT_PURPOSE.TRANSACTION_ACCOUNT,
                stripeCustomerId,
                stripePaymentMethodId,
                card: {
                    brand: cardDetails.brand,
                    last4: cardDetails.last4,
                    expMonth: cardDetails.expMonth,
                    expYear: cardDetails.expYear,
                },
                isActive: true,
            });
            await paymentAccount.save({ session });
        }

        // 4. Link payment account to employee (if not already)
        if (!employee.paymentAccount || !employee.paymentAccount.equals(paymentAccount._id as Types.ObjectId)) {
            employee.paymentAccount = paymentAccount._id as Types.ObjectId;
            await employee.save({ session });
        }

        return paymentAccount;
    });

    // Build response DTO
    const paymentCardDTO: PaymentCardDTO = {
        brand: result.card?.brand as PaymentCardDTO["brand"],
        last4: result.card?.last4 as PaymentCardDTO["last4"],
        expMonth: result.card?.expMonth as PaymentCardDTO["expMonth"],
        expYear: result.card?.expYear as PaymentCardDTO["expYear"],
        stripePaymentMethodId: result.stripePaymentMethodId,
        stripeCustomerId: result.stripeCustomerId,
        // cardholderName could be fetched from Stripe or stored separately – optional
    };

    void logAuditBestEffort({
        action: AUDIT_ACTION.UPDATE,
        targetModel: "Employee",
        target: employeeId,
        actor: actorId,
        actorModel: "User",
        note: "Updated employee payment card",
        after: { stripeCustomerId, stripePaymentMethodId, ...paymentCardDTO },
    });

    return {
        data: paymentCardDTO,
        status: 200,
    };
});