// app/api/site-settings/v1/enums/[name]/values/[valueKey]/route.ts
import { NextRequest } from "next/server";

import ConnectDB from "@/config/db";
import EnumGroupSetting from "@/models/site-settings/enumGroup.model";

import { EnumGroup } from "@/types/enum-settings.types";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";

interface RouteParams {
    params: Promise<{ name: string; valueKey: string }>;
}

/* ---------------------------------------------------
   DELETE — remove a single enum value by key
---------------------------------------------------- */
export const DELETE = withErrorHandler(
    async (_req: NextRequest, { params }: RouteParams) => {
        await ConnectDB();

        const { name, valueKey } = await params;

        if (!name) {
            throw new ApiError("Missing enum group name", 400);
        }

        if (!valueKey) {
            throw new ApiError("Missing value key to delete", 400);
        }

        const group = await EnumGroupSetting.findOne({ name });
        if (!group) {
            throw new ApiError(`Enum group '${name}' not found`, 404);
        }

        const originalLength = group.values.length;

        group.values = group.values.filter((v) => v.key !== valueKey);

        if (group.values.length === originalLength) {
            throw new ApiError(
                `Value key '${valueKey}' not found in group '${name}'`,
                404
            );
        }

        await group.save();

        const enumGroup: EnumGroup = {
            name: group.name,
            description: group.description ?? null,
            values: group.values,
        };

        return { data: { enumGroup }, status: 200 };
    }
);