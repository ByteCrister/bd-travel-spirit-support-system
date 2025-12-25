"use client";

import { GUIDE_STATUS, GuideStatus } from "@/constants/guide.const";
import { Badge } from "../../ui/badge";
import { FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";
import { cn } from "@/lib/utils";

const statusConfig = {
    [GUIDE_STATUS.PENDING]: {
        label: "Pending",
        className: "bg-amber-50 text-amber-700 border border-amber-200",
        icon: FiClock,
        dotColor: "bg-amber-500"
    },
    [GUIDE_STATUS.APPROVED]: {
        label: "Approved",
        className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        icon: FiCheckCircle,
        dotColor: "bg-emerald-500"
    },
    [GUIDE_STATUS.REJECTED]: {
        label: "Rejected",
        className: "bg-red-50 text-red-700 border border-red-200",
        icon: FiXCircle,
        dotColor: "bg-red-500"
    },
};

const StatusBadge = ({ status }: { status: GuideStatus }) => {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <Badge className={cn("px-2.5 py-1 font-medium", config.className)}>
            <div className="flex items-center gap-1.5">
                <div className={cn("h-1.5 w-1.5 rounded-full", config.dotColor)} />
                <Icon className="h-3 w-3" />
                <span className="text-xs">{config.label}</span>
            </div>
        </Badge>
    );
};

export default StatusBadge;