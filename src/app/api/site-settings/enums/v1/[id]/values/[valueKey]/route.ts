// app/api/site-settings/v1/enums/[id]/values/[valueKey]/route.ts
import { NextRequest } from "next/server";

import ConnectDB from "@/config/db";
import EnumGroupSetting from "@/models/site-settings/enumGroup.model";

import type { EnumGroup } from "@/types/site-settings/enum-settings.types";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";

interface RouteParams {
    params: Promise<{ id: string; valueKey: string }>;
}

/* ---------------------------------------------------
   DELETE — soft-delete a single enum value by key using model helper
---------------------------------------------------- */
export const DELETE = withErrorHandler(
    async (_req: NextRequest, { params }: RouteParams) => {
        await ConnectDB();

        const { id, valueKey } = await params;

        if (!id) {
            throw new ApiError("Missing enum group id", 400);
        }

        if (!valueKey) {
            throw new ApiError("Missing value key to delete", 400);
        }

        // Use the model helper which enforces group is active and marks the value deleted
        const updatedGroup = await EnumGroupSetting.softDeleteEnumValue(id, valueKey);

        if (!updatedGroup) {
            // Could be group not found, group deleted, or value not found
            // Try to provide a clearer message by checking existence of group
            const groupExists = await EnumGroupSetting.findOne({ _id: id }).lean().exec();
            if (!groupExists) {
                throw new ApiError(`Enum group with id '${id}' not found`, 404);
            }
            // Group exists but helper returned null -> value not found or already deleted / group is deleted
            throw new ApiError(`Value key '${valueKey}' not found or already deleted in group with id '${id}'`, 404);
        }

        const enumGroup: EnumGroup = {
            _id: updatedGroup._id.toString(),
            name: updatedGroup.name,
            description: updatedGroup.description ?? null,
            values: updatedGroup.values,
        };

        return { data: { enumGroup }, status: 200 };
    }
);