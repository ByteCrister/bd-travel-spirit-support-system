// src/components/settings/skeletons/LocationsSkeleton.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function LocationsSkeleton() {
    return (
        <Card className="overflow-hidden border-2">
            <CardHeader className="border-b bg-gradient-to-r from-blue-500/5 via-blue-500/10 to-blue-500/5">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-28" />
                        <Skeleton className="h-4 w-44" />
                    </div>
                    <Skeleton className="h-9 w-32" />
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="rounded-lg border bg-card/50 p-4"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex flex-1 items-center gap-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-40" />
                                        <Skeleton className="h-3 w-56" />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-8 rounded" />
                                    <Skeleton className="h-8 w-8 rounded" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

