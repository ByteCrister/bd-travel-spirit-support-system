// components/users/tabs/UserSecurityTab.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { selectSegment, useUserStore } from "@/store/useUserStore";
import SecuritySkeleton from "../user-profile-skeletons/SecuritySkeleton";

interface UserSecurityTabProps {
    userId: string | null;
}

export function UserSecurityTab({ userId }: UserSecurityTabProps) {
    const { fetchSegment } = useUserStore();
    
    const securitySegment = useUserStore(userId ? selectSegment(userId, "security") : () => undefined);

    useEffect(() => {
        if (userId && securitySegment?.status === "idle") {
            fetchSegment(userId, "security").catch(console.error);
        }
    }, [userId, securitySegment?.status, fetchSegment]);

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
            {securitySegment?.status === "loading" ? (
                <SecuritySkeleton />
            ) : securitySegment?.status === "error" ? (
                <ErrorDisplay error={securitySegment.error || "Failed to load security"} />
            ) : securitySegment?.data ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="font-medium text-foreground">Login Security</h3>
                        <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Failed Login Attempts</div>
                                <div className="text-sm">{securitySegment.data.loginAttempts ?? 0}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Last Login</div>
                                <div className="text-sm">
                                    {securitySegment.data.lastLogin ? new Date(securitySegment.data.lastLogin).toLocaleString() : "Never"}
                                </div>
                            </div>
                            {securitySegment.data.lockUntil && (
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Locked Until</div>
                                    <div className="text-sm">{new Date(securitySegment.data.lockUntil).toLocaleString()}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {securitySegment.data.suspension && (
                        <div className="space-y-4">
                            <h3 className="font-medium text-foreground">Account Restrictions</h3>
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/20 dark:border-amber-800">
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="font-medium text-amber-700 dark:text-amber-300">Reason: </span>
                                        <span className="text-amber-600 dark:text-amber-400">
                                            {securitySegment.data.suspension.reason}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-amber-700 dark:text-amber-300">Until: </span>
                                        <span className="text-amber-600 dark:text-amber-400">
                                            {new Date(securitySegment.data.suspension.until).toLocaleString()}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-amber-700 dark:text-amber-300">Suspended On: </span>
                                        <span className="text-amber-600 dark:text-amber-400">
                                            {new Date(securitySegment.data.suspension.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-amber-700 dark:text-amber-300">Suspended By: </span>
                                        <span className="text-amber-600 dark:text-amber-400">
                                            {securitySegment.data.suspension.suspendedBy}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-sm text-muted-foreground p-8 text-center bg-muted/30 rounded-lg">
                    Click to load security data
                </div>
            )}
        </motion.div>
    );
}