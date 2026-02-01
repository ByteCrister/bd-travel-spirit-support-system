"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, BarChart3, CheckCircle, Clock, XCircle } from "lucide-react";

const STAT_CARDS = [
    {
        key: "total",
        label: "Total Requests",
        icon: BarChart3,
        color: "text-gray-600",
        bgColor: "bg-gray-100",
    },
    {
        key: "pending",
        label: "Pending",
        icon: Clock,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
    },
    {
        key: "approved",
        label: "Approved",
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
    },
    {
        key: "rejected",
        label: "Rejected",
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
    },
    {
        key: "expired",
        label: "Expired",
        icon: AlertCircle,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
    },
];

function StatsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {STAT_CARDS.map((stat) => (
                <Card key={stat.key}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-12" />
                        <Skeleton className="h-3 w-16 mt-2" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
export default StatsSkeleton;