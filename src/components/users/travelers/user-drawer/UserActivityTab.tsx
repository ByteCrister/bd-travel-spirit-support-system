// components/users/tabs/UserActivityTab.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Star, Flag } from "lucide-react";
import { selectSegment, useTravelerInfoStore } from "@/store/traveler/traveler-info.store";
import ActivitySkeleton from "../user-profile-skeletons/ActivitySkeleton";

interface UserActivityTabProps {
    userId: string | null;
}

export function UserActivityTab({ userId }: UserActivityTabProps) {
    const { fetchSegment } = useTravelerInfoStore();

    const activitySegment = useTravelerInfoStore(userId ? selectSegment(userId, "activity") : () => undefined);

    useEffect(() => {
        if (userId && activitySegment?.status === "idle") {
            fetchSegment(userId, "activity").catch(console.error);
        }
    }, [userId, activitySegment?.status, fetchSegment]);

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
            {activitySegment?.status === "loading" ? (
                <ActivitySkeleton />
            ) : activitySegment?.status === "error" ? (
                <ErrorDisplay error={activitySegment.error || "Failed to load activity"} />
            ) : activitySegment?.data ? (
                <div className="space-y-6">
                    {/* Activity Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-muted/30 rounded-lg">
                            <div className="text-sm font-medium text-muted-foreground">Bookings</div>
                            <div className="text-2xl font-bold">{activitySegment.data.bookingHistory.length}</div>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-lg">
                            <div className="text-sm font-medium text-muted-foreground">Cart Items</div>
                            <div className="text-2xl font-bold">{activitySegment.data.cart.length}</div>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-lg">
                            <div className="text-sm font-medium text-muted-foreground">Wishlist</div>
                            <div className="text-2xl font-bold">{activitySegment.data.wishlist.length}</div>
                        </div>
                    </div>

                    {/* Reviews */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-foreground flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Reviews ({activitySegment.data.reviews.length})
                        </h3>
                        {activitySegment.data.reviews.length > 0 ? (
                            <div className="space-y-3">
                                {activitySegment.data.reviews.slice(0, 5).map((review) => (
                                    <div key={review.id} className="p-3 border rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-sm font-medium">{review.title}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground p-8 text-center bg-muted/30 rounded-lg">
                                No reviews yet
                            </div>
                        )}
                    </div>

                    {/* Reports */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-foreground flex items-center gap-2">
                            <Flag className="h-4 w-4" />
                            Reports ({activitySegment.data.reports.length})
                        </h3>
                        {activitySegment.data.reports.length > 0 ? (
                            <div className="space-y-3">
                                {activitySegment.data.reports.slice(0, 3).map((report) => (
                                    <div key={report.id} className="p-3 border rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge variant="outline">{report.status}</Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(report.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm">{report.reason}</p>
                                        <p className="text-sm text-muted-foreground mt-1">{report.message}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground p-8 text-center bg-muted/30 rounded-lg">
                                No reports filed
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-sm text-muted-foreground p-8 text-center bg-muted/30 rounded-lg">
                    Click to load activity data
                </div>
            )}
        </motion.div>
    );
}