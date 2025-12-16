// /api/site-settings/enums/[name]/values/[valueKey]
import ConnectDB from "@/config/db";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import SiteSettings from "@/models/site-settings.model";
import { EnumGroup } from "@/types/enum-settings.types";
import { NextRequest } from "next/server";

interface RouteParams {
    params: Promise<{ name: string; valueKey: string }>;
}

export const DELETE = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {

    await ConnectDB();

    const { name, valueKey } = await params;

    if (!name) {
        throw new ApiError("Missing enum group name", 400);
    }

    if (!valueKey) {
        throw new ApiError("Missing value key to delete", 400);
    }
    const settings = await SiteSettings.findOne();
    if (!settings) {
        throw new ApiError("Site Settings not found", 404);
    }

    const group = settings.enums?.find(g => g.name === name);
    if (!group) {
        throw new ApiError(`Enum group '${name}' not found`, 404);
    }

    const originalLength = group.values.length;
    group.values = group.values.filter(v => v.key !== valueKey);

    if (group.values.length === originalLength) {
        // valueKey not found
        throw new ApiError(`Value key '${valueKey}' not found in group '${name}'`, 404);
    }

    await settings.save();

    return { data: { enumGroup: group as EnumGroup }, status: 200 };
})