// components/users/tabs/UserAuditTab.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileText, User, Edit, Trash2, Eye, Shield } from "lucide-react";
import { selectSegment, useTravelerInfoStore } from "@/store/traveler/traveler-info.store";
import AuditSkeleton from "../user-profile-skeletons/AuditSkeleton";

interface UserAuditTabProps {
    userId: string | null;
}

const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
        case 'create':
            return <User className="h-4 w-4 text-green-500" />;
        case 'update':
        case 'edit':
            return <Edit className="h-4 w-4 text-blue-500" />;
        case 'delete':
            return <Trash2 className="h-4 w-4 text-red-500" />;
        case 'view':
            return <Eye className="h-4 w-4 text-gray-500" />;
        case 'admin':
            return <Shield className="h-4 w-4 text-purple-500" />;
        default:
            return <FileText className="h-4 w-4 text-gray-400" />;
    }
};

const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
        case 'create':
            return 'text-green-600';
        case 'update':
        case 'edit':
            return 'text-blue-600';
        case 'delete':
            return 'text-red-600';
        case 'view':
            return 'text-gray-600';
        case 'admin':
            return 'text-purple-600';
        default:
            return 'text-gray-500';
    }
};

export function UserAuditTab({ userId }: UserAuditTabProps) {
    const { fetchSegment } = useTravelerInfoStore();

    const auditSegment = useTravelerInfoStore(userId ? selectSegment(userId, "audit") : () => undefined);

    useEffect(() => {
        if (userId && auditSegment?.status === "idle") {
            fetchSegment(userId, "audit").catch(console.error);
        }
    }, [userId, auditSegment?.status, fetchSegment]);

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
            {auditSegment?.status === "loading" ? (
                <AuditSkeleton />
            ) : auditSegment?.status === "error" ? (
                <ErrorDisplay error={auditSegment.error || "Failed to load audit"} />
            ) : auditSegment?.data ? (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-foreground">Audit Trail</h3>
                        <Badge variant="secondary">{auditSegment.data.actions.length} actions</Badge>
                    </div>

                    {auditSegment.data.actions.length > 0 ? (
                        <div className="space-y-3">
                            {auditSegment.data.actions.map((action) => (
                                <div key={action.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                                    <div className="flex-shrink-0">
                                        {getActionIcon(action.action)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-sm font-medium ${getActionColor(action.action)}`}>
                                                {action.action}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(action.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {action.target && (
                                                <span>Target: <code className="text-xs bg-muted px-1 py-0.5 rounded">{action.target}</code></span>
                                            )}
                                        </div>
                                        {action.meta && Object.keys(action.meta).length > 0 && (
                                            <div className="text-xs text-muted-foreground">
                                                <details className="cursor-pointer">
                                                    <summary className="hover:text-foreground">Show details</summary>
                                                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                                                        {JSON.stringify(action.meta, null, 2)}
                                                    </pre>
                                                </details>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {auditSegment.data.actions.length > 20 && (
                                <div className="text-center p-4 text-sm text-muted-foreground">
                                    Showing first 20 actions. Total: {auditSegment.data.actions.length}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground p-8 text-center bg-muted/30 rounded-lg">
                            No audit logs found
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-sm text-muted-foreground p-8 text-center bg-muted/30 rounded-lg">
                    Click to load audit logs
                </div>
            )}
        </motion.div>
    );
}