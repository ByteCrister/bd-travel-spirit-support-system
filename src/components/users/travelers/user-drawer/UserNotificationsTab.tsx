// components/users/tabs/UserNotificationsTab.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Bell } from "lucide-react";
import { selectSegment, useTravelerInfoStore } from "@/store/traveler/traveler-info.store";
import { NOTIFICATION_PRIORITY } from "@/constants/customer-notification.const";
import NotificationsSkeleton from "../user-profile-skeletons/NotificationsSkeleton";

interface UserNotificationsTabProps {
    userId: string | null;
}

export function UserNotificationsTab({ userId }: UserNotificationsTabProps) {
    const { fetchSegment } = useTravelerInfoStore();

    const notificationsSegment = useTravelerInfoStore(userId ? selectSegment(userId, "notifications") : () => undefined);

    useEffect(() => {
        if (userId && notificationsSegment?.status === "idle") {
            fetchSegment(userId, "notifications").catch(console.error);
        }
    }, [userId, notificationsSegment?.status, fetchSegment]);

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
            {notificationsSegment?.status === "loading" ? (
                <NotificationsSkeleton />
            ) : notificationsSegment?.status === "error" ? (
                <ErrorDisplay error={notificationsSegment.error || "Failed to load notifications"} />
            ) : notificationsSegment?.data ? (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-foreground">Notification History</h3>
                        <Badge variant="secondary">{notificationsSegment.data.unreadCount} unread</Badge>
                    </div>

                    {notificationsSegment.data.items.length > 0 ? (
                        <div className="space-y-3">
                            {notificationsSegment.data.items.slice(0, 10).map((notification) => (
                                <div key={notification.id} className={`flex items-start gap-3 p-4 border rounded-lg ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}>
                                    <Bell className={`h-5 w-5 mt-1 ${notification.priority === NOTIFICATION_PRIORITY.HIGH ? 'text-red-500' :
                                        notification.priority === NOTIFICATION_PRIORITY.NORMAL ? 'text-yellow-500' :
                                            'text-gray-400'
                                        }`} />
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{notification.title}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(notification.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="outline" className="text-xs">{notification.type}</Badge>
                                            {!notification.isRead && <Badge variant="secondary" className="text-xs">Unread</Badge>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground p-8 text-center bg-muted/30 rounded-lg">
                            No notifications yet
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-sm text-muted-foreground p-8 text-center bg-muted/30 rounded-lg">
                    Click to load notification history
                </div>
            )}
        </motion.div>
    );
}