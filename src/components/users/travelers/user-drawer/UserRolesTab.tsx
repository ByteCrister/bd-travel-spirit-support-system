// components/users/tabs/UserRolesTab.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { selectSegment, useTravelerInfoStore } from "@/store/traveler-info.store";
import RolesSkeleton from "../user-profile-skeletons/RolesSkeleton";

interface UserRolesTabProps {
    userId: string | null;
}

export function UserRolesTab({ userId }: UserRolesTabProps) {
    const { fetchSegment } = useTravelerInfoStore();

    const rolesSegment = useTravelerInfoStore(userId ? selectSegment(userId, "roles") : () => undefined);

    useEffect(() => {
        if (userId && rolesSegment?.status === "idle") {
            fetchSegment(userId, "roles").catch(console.error);
        }
    }, [userId, rolesSegment?.status, fetchSegment]);

    const ErrorDisplay = ({ error }: { error: string }) => (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    );


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {rolesSegment?.status === "loading" ? (
                <RolesSkeleton />
            ) : rolesSegment?.status === "error" ? (
                <ErrorDisplay error={rolesSegment.error || "Failed to load roles"} />
            ) : rolesSegment?.data ? (
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="font-medium text-foreground">Current Role</h3>
                        <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                            <Badge variant="secondary" className="text-sm">
                                {rolesSegment.data.role}
                            </Badge>
                            {rolesSegment.data.isVerified && (
                                <Badge variant="outline" className="text-sm gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Verified
                                </Badge>
                            )}
                        </div>
                    </div>

                    {rolesSegment.data.guideStatus && (
                        <div className="space-y-4">
                            <h3 className="font-medium text-foreground">Guide Status</h3>
                            <div className="p-4 border rounded-lg space-y-3">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{rolesSegment.data.guideStatus}</Badge>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-sm text-muted-foreground p-8 text-center bg-muted/30 rounded-lg">
                    Click to load roles data
                </div>
            )}
        </motion.div>
    );
}