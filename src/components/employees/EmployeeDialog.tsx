// components/employees/EmployeeDialog.tsx

"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "./primitives/Skeleton";
import { Badge } from "./primitives/Badge";
import {
    EmployeeDetailDTO,
    SoftDeleteEmployeePayload,
    RestoreEmployeePayload,
    UpdateEmployeePayload,
} from "@/types/employee.types";
import { motion } from "framer-motion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";

export function EmployeeDialog({
    open,
    onOpenChange,
    detail,
    loadingById,
    onSoftDelete,
    onRestore,
    onUpdate,
}: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    detail: EmployeeDetailDTO | null;
    loadingById: Record<string, boolean>;
    onSoftDelete: (payload: SoftDeleteEmployeePayload) => Promise<void>;
    onRestore: (payload: RestoreEmployeePayload) => Promise<void>;
    onUpdate: (payload: UpdateEmployeePayload) => Promise<EmployeeDetailDTO>;
}) {
    const loading = detail ? !!loadingById[detail.id] : false;

    const handleSoftDelete = async () => {
        if (!detail) return;
        await onSoftDelete({ id: detail.id });
    };

    const handleRestore = async () => {
        if (!detail) return;
        await onRestore({ id: detail.id });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto rounded-xl border border-border/50 shadow-lg">
                <DialogHeader className="pb-4 border-b">
                    <DialogTitle className="text-lg font-semibold tracking-tight">
                        Employee Details
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        View personal, employment, performance, and document information.
                    </DialogDescription>
                </DialogHeader>

                {!detail ? (
                    <div className="space-y-4 py-6">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-8 py-4"
                    >
                        {/* User Info */}
                        <Section title="User">
                            <div>
                                <p className="font-medium">{detail.user.name}</p>
                                <p className="text-sm text-muted-foreground">{detail.user.email}</p>
                                {detail.user.phone && (
                                    <p className="text-sm text-muted-foreground">{detail.user.phone}</p>
                                )}
                            </div>
                        </Section>

                        {/* Employment */}
                        <Section title="Employment">
                            <div className="flex flex-wrap gap-2">
                                <Badge intent="default">{detail.role}</Badge>
                                <Badge intent="muted">{detail.subRole}</Badge>
                                <Badge intent="muted">{detail.position}</Badge>
                                <Badge
                                    intent={detail.status === "active" ? "success" : "warning"}
                                >
                                    {detail.status}
                                </Badge>
                            </div>
                            <div className="mt-2 space-y-1 text-sm">
                                {detail.department && <p>Department: {detail.department}</p>}
                                {detail.employmentType && <p>Type: {detail.employmentType}</p>}
                            </div>
                        </Section>

                        {/* Compensation & Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Section title="Compensation">
                                <p className="text-sm font-medium">
                                    {detail.salary
                                        ? `${detail.salaryCurrency ?? ""} ${detail.salary.toLocaleString()}`
                                        : "—"}
                                </p>
                            </Section>
                            <Section title="Dates">
                                <p className="text-sm">Joined: {formatDate(detail.dateOfJoining)}</p>
                                <p className="text-sm">
                                    Left: {detail.dateOfLeaving ? formatDate(detail.dateOfLeaving) : "—"}
                                </p>
                            </Section>
                        </div>

                        {/* Contact Info */}
                        <Section title="Contact Info">
                            <div className="space-y-1 text-sm">
                                {detail.contactInfo.email && <p>Email: {detail.contactInfo.email}</p>}
                                {detail.contactInfo.phone && <p>Phone: {detail.contactInfo.phone}</p>}
                                {detail.contactInfo.emergencyContact && (
                                    <p className="text-muted-foreground">
                                        Emergency: {detail.contactInfo.emergencyContact.name} (
                                        {detail.contactInfo.emergencyContact.relation}) —{" "}
                                        {detail.contactInfo.emergencyContact.phone}
                                    </p>
                                )}
                            </div>
                        </Section>

                        {/* Performance & Shifts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Section title="Performance">
                                <p className="text-sm">
                                    Rating: {detail.performance.rating ?? "—"}
                                </p>
                                <p className="text-sm">
                                    Last review:{" "}
                                    {detail.performance.lastReview
                                        ? formatDate(detail.performance.lastReview)
                                        : "—"}
                                </p>
                            </Section>
                            <Section title="Shifts">
                                <div className="space-y-1 text-sm text-muted-foreground">
                                    {detail.shifts?.length ? (
                                        detail.shifts.map((s, i) => (
                                            <p key={i}>
                                                {s.startTime}–{s.endTime}, {s.days.join(", ")}
                                            </p>
                                        ))
                                    ) : (
                                        <p>—</p>
                                    )}
                                </div>
                            </Section>
                        </div>

                        {/* Documents */}
                        <Section title="Documents">
                            <div className="space-y-1 text-sm">
                                {detail.documents?.length ? (
                                    detail.documents.map((d, i) => (
                                        <a
                                            key={i}
                                            href={d.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-primary hover:underline"
                                        >
                                            {d.type} — uploaded {formatDate(d.uploadedAt)}
                                        </a>
                                    ))
                                ) : (
                                    <p>—</p>
                                )}
                            </div>
                        </Section>

                        {/* Footer Actions */}
                        <EmployeeDialogFooter
                            detail={detail}
                            loading={loading}
                            onSoftDelete={handleSoftDelete}
                            onRestore={handleRestore}
                            onUpdate={onUpdate}
                        />
                    </motion.div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-2 rounded-lg border border-border/50 bg-muted/30 p-4">
            <h4 className="text-sm font-semibold text-foreground">{title}</h4>
            {children}
        </section>
    );
}

function formatDate(s: string) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}


type Props = {
    detail: EmployeeDetailDTO;
    loading: boolean;
    onSoftDelete: () => Promise<void>;
    onRestore: () => Promise<void>;
    onUpdate: (payload: UpdateEmployeePayload) => Promise<EmployeeDetailDTO>;
};

export function EmployeeDialogFooter({
    detail,
    loading,
    onSoftDelete,
    onRestore,
    onUpdate,
}: Props) {
    return (
        <div className="flex items-center justify-between border-t pt-4">
            <div className="text-sm text-muted-foreground">
                {detail.isDeleted ? "This employee is soft-deleted." : "Active record."}
            </div>

            <div className="flex gap-3">
                {detail.isDeleted ? (
                    <Button
                        onClick={onRestore}
                        disabled={loading}
                        className="rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                    >
                        Restore
                    </Button>
                ) : (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                disabled={loading}
                                className="rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                            >
                                Soft delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="sm:max-w-md">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-lg font-semibold">
                                    Confirm soft delete
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-sm text-muted-foreground">
                                    This will mark the employee as deleted, but their record will remain
                                    in the system. You can restore them later if needed.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={onSoftDelete}
                                    className="rounded-md bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700 transition-colors"
                                >
                                    Yes, soft delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}

                <Button
                    disabled={loading}
                    className="rounded-md border border-input bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() =>
                        onUpdate({
                            id: detail.id,
                            audit: {
                                updatedBy: detail.audit.updatedBy,
                                createdBy: detail.audit.createdBy,
                            },
                        })
                    }
                >
                    Quick update
                </Button>
            </div>
        </div>
    );
}